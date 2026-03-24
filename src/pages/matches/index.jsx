import React from 'react';
import { useQuery } from '@tanstack/react-query';

import Countdown from '../../components/countdown';
import PlayersHeadToHead from '../../components/players-head-to-head';
import Page from '../../components/page';
import Button from '../../components/ui/button';
import Table from '../../components/ui/data-table';
import Link from '../../components/ui/link';
import { CALCULATED_ODDS_QUERY_KEY, fetchCalculatedOddsForMatches, getCalculatedOddsForMatch } from './calculated-odds.js';
import { addRankingAndDisplayFields, buildHeadToHeadQuery } from '../../js/live-match-rows.js';
import {
	LIVE_ODDSET_QUERY_KEY,
	ODDSET_PIPELINE_QUERY_KEY,
	ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
	buildPlayerDetailsByName,
	fetchOddsetPipelineMatches,
	fetchLiveOddsetOddsByPlayers,
	resolveMatchPlayers,
	splitOddsetRowsByStatus
} from '../../js/oddset-pipeline.js';
import { useRequest, useSQL } from '../../js/vitel.js';

const LIVE_REFRESH_INTERVAL_MS = 10 * 1000;
const LIVE_COUNTDOWN_STEPS = 5;
const PLAYERS_COUNTRY_CACHE_MS = 24 * 60 * 60 * 1000;

function normalizeName(name = '') {
	return String(name)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9 ]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function createPlayersKey(playerA, playerB) {
	const left = normalizeName(playerA);
	const right = normalizeName(playerB);

	if (!left || !right) {
		return null;
	}

	return [left, right].sort().join('::');
}

function createPlayersIdentityKey(playerA, playerB) {
	const idA = playerA?.id ? String(playerA.id).trim().toUpperCase() : '';
	const idB = playerB?.id ? String(playerB.id).trim().toUpperCase() : '';

	if (idA && idB) {
		return [idA, idB].sort().join('::');
	}

	return createPlayersKey(playerA?.name, playerB?.name);
}

function parseOddsValue(value) {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}

	if (typeof value !== 'string') {
		return null;
	}

	const normalized = value.trim().replace(',', '.');
	if (!normalized || normalized === '-') {
		return null;
	}

	const parsed = Number(normalized);
	return Number.isFinite(parsed) ? parsed : null;
}

function parseOddsPair(value) {
	if (typeof value !== 'string') {
		return [null, null];
	}

	const [left, right] = value.split(' - ');
	return [parseOddsValue(left), parseOddsValue(right)];
}

function formatEdgePercent(value) {
	if (!Number.isFinite(value)) {
		return null;
	}

	return String(Math.round(value));
}

function getRecommendationFromOdds(bookmakerOdds, myOdds) {
	const [bookmakerA, bookmakerB] = parseOddsPair(bookmakerOdds);
	const [myA, myB] = parseOddsPair(myOdds);
	const candidates = [
		{ offeredOdds: bookmakerA, myOdds: myA },
		{ offeredOdds: bookmakerB, myOdds: myB }
	]
		.map(candidate => {
			if (!candidate.offeredOdds || !candidate.myOdds) {
				return null;
			}

			return {
				offeredOdds: candidate.offeredOdds,
				edgePercent: ((1 / candidate.myOdds) - (1 / candidate.offeredOdds)) * 100
			};
		})
		.filter(Boolean)
		.filter(candidate => candidate.edgePercent > 0)
		.sort((a, b) => b.edgePercent - a.edgePercent);

	const bestCandidate = candidates[0];

	if (!bestCandidate) {
		return '-';
	}

	const edgePercent = formatEdgePercent(bestCandidate.edgePercent);
	return `${bestCandidate.offeredOdds.toFixed(2)} (${edgePercent}%)`;
}

function PlayersCell({ row }) {
	return <PlayersHeadToHead playerA={row.player} playerB={row.opponent} />;
}

function MatchesTable({ rows }) {
	return (
		<Table rows={rows}>
			<Table.Column id='event'>
				<Table.Title>Turnering</Table.Title>
				<Table.Cell>{({ row, value }) => (row.eventId ? <Link to={`/event/${row.eventId}`}>{value}</Link> : value)}</Table.Cell>
			</Table.Column>

			<Table.Column>
				<Table.Title>Spelare</Table.Title>
				<Table.Value>{({ row }) => <PlayersCell row={row} />}</Table.Value>
			</Table.Column>

			<Table.Column id='headToHead'>
				<Table.Title>Tidigare möten</Table.Title>
			</Table.Column>

			<Table.Column id='score'>
				<Table.Title>Ställning</Table.Title>
			</Table.Column>

			<Table.Column id='odds'>
				<Table.Title>Odds</Table.Title>
			</Table.Column>
		</Table>
	);
}

function FinishedMatchesTable({ rows }) {
	return (
		<Table rows={rows}>
			<Table.Column id='event'>
				<Table.Title>Turnering</Table.Title>
				<Table.Cell>{({ row, value }) => (row.eventId ? <Link to={`/event/${row.eventId}`}>{value}</Link> : value)}</Table.Cell>
			</Table.Column>

			<Table.Column>
				<Table.Title>Spelare</Table.Title>
				<Table.Value>{({ row }) => <PlayersCell row={row} />}</Table.Value>
			</Table.Column>

			<Table.Column id='score'>
				<Table.Title>Resultat</Table.Title>
			</Table.Column>
		</Table>
	);
}

function UpcomingPlayersCell({ row }) {
	return <PlayersHeadToHead playerA={row.playerA} playerB={row.playerB} />;
}

function UpcomingMatchesTable({ rows }) {
	return (
		<Table rows={rows}>
			<Table.Column id='start'>
				<Table.Title>Start</Table.Title>
			</Table.Column>

			<Table.Column id='turnering'>
				<Table.Title>Turnering</Table.Title>
			</Table.Column>

			<Table.Column>
				<Table.Title>Spelare</Table.Title>
				<Table.Value>{({ row }) => <UpcomingPlayersCell row={row} />}</Table.Value>
			</Table.Column>

			<Table.Column id='odds'>
				<Table.Title>Oddset</Table.Title>
			</Table.Column>

			<Table.Column>
				<Table.Title>Vitel</Table.Title>
				<Table.Value>{({ row }) => row.myOdds ?? '-'}</Table.Value>
			</Table.Column>

			<Table.Column>
				<Table.Title>Tips</Table.Title>
				<Table.Value>{({ row }) => row.recommendation ?? '-'}</Table.Value>
			</Table.Column>
		</Table>
	);
}

function splitMatchesByStatus(matches) {
	const activeMatches = [];
	const finishedMatches = [];

	for (const match of matches) {
		if (match.winner) {
			finishedMatches.push(match);
		} else {
			activeMatches.push(match);
		}
	}

	return { activeMatches, finishedMatches };
}

function Component() {
	const { data: matches, error: liveError, dataUpdatedAt, isFetching } = useRequest({
		path: 'live',
		method: 'GET',
		cache: 0,
		refetchInterval: LIVE_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: true,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false
	});
	const { data: oddsByPlayers = {}, error: oddsError } = useQuery({
		queryKey: LIVE_ODDSET_QUERY_KEY,
		queryFn: fetchLiveOddsetOddsByPlayers,
		staleTime: LIVE_REFRESH_INTERVAL_MS,
		refetchInterval: LIVE_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: 0
	});
	const { data: oddsetRows, error: oddsetPipelineError } = useQuery({
		queryKey: ODDSET_PIPELINE_QUERY_KEY,
		queryFn: fetchOddsetPipelineMatches,
		staleTime: ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
		refetchInterval: ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
		refetchOnWindowFocus: false,
		retry: 0
	});
	const { data: playerRows, error: playerError } = useSQL({
		sql: 'SELECT id, name, country FROM players',
		cache: PLAYERS_COUNTRY_CACHE_MS
	});
	const rankingSql = 'SELECT id FROM players WHERE rank IS NOT NULL ORDER BY rank ASC, name ASC';
	const { data: rankingRows, error: rankError } = useSQL({
		sql: rankingSql,
		cache: 5 * 60 * 1000
	});
	const headToHeadQuery = React.useMemo(() => buildHeadToHeadQuery(matches ?? []), [matches]);
	const { data: meetingRows, error: meetingError } = useSQL({
		sql: headToHeadQuery.sql,
		format: headToHeadQuery.format,
		cache: 0,
		refetchInterval: LIVE_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: true,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		placeholderData: previousData => previousData
	});
	const ranksByPlayerId = Object.fromEntries((rankingRows ?? []).map((player, index) => [player.id, index + 1]));
	const playerDetailsByName = buildPlayerDetailsByName(playerRows ?? []);
	const resolvedUpcomingRows = (oddsetRows ?? []).map(row => {
		const { playerA, playerB } = resolveMatchPlayers(row, playerDetailsByName, ranksByPlayerId);
		return { ...row, playerA, playerB };
	});
	const { data: calculatedOddsByMatch = {} } = useQuery({
		queryKey: [CALCULATED_ODDS_QUERY_KEY, resolvedUpcomingRows.map(row => [row.playerA?.id, row.playerB?.id, row._startTimestamp ?? null])],
		queryFn: () => fetchCalculatedOddsForMatches(resolvedUpcomingRows),
		staleTime: ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
		refetchInterval: ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
		refetchOnWindowFocus: false,
		retry: 0,
		enabled: resolvedUpcomingRows.length > 0
	});

	if (liveError) {
		return (
			<Page id='matches-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Error>Misslyckades med att läsa in livematcher - {liveError.message}</Page.Error>
				</Page.Content>
			</Page>
		);
	}

	if (rankError) {
		return (
			<Page id='matches-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Error>Misslyckades med att läsa in ranking - {rankError.message}</Page.Error>
				</Page.Content>
			</Page>
		);
	}

	if (playerError) {
		return (
			<Page id='matches-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Error>Misslyckades med att läsa in spelare - {playerError.message}</Page.Error>
				</Page.Content>
			</Page>
		);
	}

	if (meetingError) {
		return (
			<Page id='matches-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Error>Misslyckades med att läsa in head-to-head - {meetingError.message}</Page.Error>
				</Page.Content>
			</Page>
		);
	}

	if (!matches || !rankingRows || !meetingRows || !playerRows) {
		return (
			<Page id='matches-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Loading>Läser in matcher...</Page.Loading>
				</Page.Content>
			</Page>
		);
	}

	const headToHeadByPair = Object.fromEntries(
		meetingRows.map(row => [
			`${row.player_a_id}:${row.player_b_id}`,
			{
				[row.player_a_id]: row.wins_for_player_a,
				[row.player_b_id]: row.wins_for_player_b
			}
		])
	);
	const rows = (matches ?? [])
		.map(match => addRankingAndDisplayFields(match, ranksByPlayerId, oddsByPlayers, headToHeadByPair));
	const { activeMatches, finishedMatches } = splitMatchesByStatus(rows);
	const activeMatchKeys = new Set(
		activeMatches
			.map(match => createPlayersIdentityKey(match.player, match.opponent))
			.filter(Boolean)
	);
	const upcomingRows = resolvedUpcomingRows
		.filter(row => {
			const key = createPlayersIdentityKey(row.playerA, row.playerB);
			return key ? !activeMatchKeys.has(key) : true;
		})
		.map(row => ({
		...row,
		myOdds: getCalculatedOddsForMatch(row, calculatedOddsByMatch)
	}));
	const upcomingRowsWithRecommendation = upcomingRows.map(row => ({
		...row,
		recommendation: getRecommendationFromOdds(row.odds, row.myOdds)
	}));
	const { upcomingMatches } = splitOddsetRowsByStatus(upcomingRowsWithRecommendation);
	const hasNoMatches = activeMatches.length === 0 && finishedMatches.length === 0 && upcomingMatches.length === 0;

	return (
		<Page id='matches-page'>
			<Page.Menu />
			<Page.Content>
				<Page.Title className='flex items-center justify-between gap-3'>
					<span className='bg-transparent'>Matcher</span>
					<Countdown
						dataUpdatedAt={dataUpdatedAt}
						isFetching={isFetching}
						intervalMs={LIVE_REFRESH_INTERVAL_MS}
						steps={LIVE_COUNTDOWN_STEPS}
						labelUpdating='Uppdaterar matches-sidan'
						inline={true}
					/>
				</Page.Title>
				<Page.Container>
					{oddsError ? <div className='pb-3 text-sm text-primary-700 dark:text-primary-300'>Kunde inte läsa odds just nu.</div> : null}
					{hasNoMatches ? (
						<Page.Emoji emoji='😢' message='Det finns inget att visa' />
					) : (
						<>
							<div className='space-y-10'>
								<section className='space-y-2'>
									<Page.Title level={2}>Pågående matcher</Page.Title>
									{activeMatches.length > 0 ? (
										<>
											<MatchesTable rows={activeMatches} />
											<div className='flex justify-center pt-4'>
												<Button link='/scoreboard'>Visa scoreboard</Button>
											</div>
										</>
									) : (
										<Page.Information>Inga pågående matcher just nu</Page.Information>
									)}
								</section>

								<section className='space-y-2'>
									<Page.Title level={2}>Nyligen avslutade</Page.Title>
									{finishedMatches.length > 0 ? (
										<FinishedMatchesTable rows={finishedMatches} />
									) : (
										<Page.Information>Inga nyligen avslutade matcher just nu</Page.Information>
									)}
								</section>

								<section className='space-y-2'>
									<Page.Title level={2}>Kommande matcher</Page.Title>
									{oddsetPipelineError ? (
										<Page.Error>Misslyckades med att läsa kommande matcher - {oddsetPipelineError.message}</Page.Error>
									) : !oddsetRows ? (
										<div className='py-3 text-primary-700 dark:text-primary-300'>Läser in kommande matcher...</div>
									) : upcomingMatches.length > 0 ? (
										<UpcomingMatchesTable rows={upcomingMatches} />
									) : (
										<Page.Information>Inga kommande matcher just nu</Page.Information>
									)}
								</section>
							</div>

							<div className='pt-4 text-center text-sm italic text-primary-700 dark:text-primary-300'>
								Odds visas inte alltid, eftersom namn från Oddset inte alltid matchar namnet från ATP-touren.
							</div>
						</>
					)}
				</Page.Container>
			</Page.Content>
		</Page>
	);
}

export default Component;
