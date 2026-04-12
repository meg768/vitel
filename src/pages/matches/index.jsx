import React from 'react';
import { useQuery } from '@tanstack/react-query';

import Countdown from '../../components/countdown';
import PlayersHeadToHead from '../../components/players-head-to-head';
import Page from '../../components/page';
import Button from '../../components/ui/button';
import Table from '../../components/ui/data-table';
import Link from '../../components/ui/link';
import {
	CALCULATED_ODDS_QUERY_KEY,
	TENNIS_ABSTRACT_ODDS_QUERY_KEY,
	fetchCalculatedOddsForMatches,
	fetchTennisAbstractOddsForMatches,
	getCalculatedOddsForMatch
} from './calculated-odds.js';
import { addRankingAndDisplayFields, fetchHeadToHeadByMatches } from '../../js/live-match-rows.js';
import {
	LIVE_ODDSET_QUERY_KEY,
	ODDSET_PIPELINE_QUERY_KEY,
	ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
	buildPlayerDetailsById,
	fetchOddsetPipelineMatches,
	fetchLiveOddsetOddsByPlayers,
	resolveMatchPlayers,
	splitOddsetRowsByStatus
} from '../../js/oddset-pipeline.js';
import { useRequest, useSQL } from '../../js/vitel.js';

const LIVE_REFRESH_INTERVAL_MS = 10 * 1000;
const LIVE_COUNTDOWN_STEPS = 5;
const PLAYERS_COUNTRY_CACHE_MS = 24 * 60 * 60 * 1000;
const HEAD_TO_HEAD_QUERY_KEY = ['head-to-head', 'matches'];

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

function createArchivedMatchKey({ eventId, eventName, playerA, playerB, playerAId, playerBId }) {
	const playersKey = playerAId && playerBId
		? [String(playerAId).trim().toUpperCase(), String(playerBId).trim().toUpperCase()].sort().join('::')
		: createPlayersKey(playerA, playerB);

	if (!playersKey) {
		return null;
	}

	const eventKey = String(eventId || eventName || '').trim().toUpperCase();
	return eventKey ? `${eventKey}::${playersKey}` : playersKey;
}

function createArchivedMatchKeyForLiveRow(row) {
	return createArchivedMatchKey({
		eventId: row?.eventId ?? row?.event ?? null,
		eventName: row?.event ?? null,
		playerA: row?.player?.name,
		playerB: row?.opponent?.name,
		playerAId: row?.player?.id,
		playerBId: row?.opponent?.id
	});
}

function createArchivedMatchKeyForUpcomingRow(row) {
	return createArchivedMatchKey({
		eventId: row?.eventId ?? null,
		eventName: row?.turnering ?? row?.tournament ?? null,
		playerA: row?.playerA?.name,
		playerB: row?.playerB?.name,
		playerAId: row?.playerA?.id ?? row?.playerAId ?? null,
		playerBId: row?.playerB?.id ?? row?.playerBId ?? null
	});
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

	return `+${Math.round(value)}%`;
}

function formatOddsWithPositiveEdge(bookmakerOdds, modelOdds) {
	const [bookmakerA, bookmakerB] = parseOddsPair(bookmakerOdds);
	const [modelA, modelB] = parseOddsPair(modelOdds);

	if (modelA == null && modelB == null) {
		return modelOdds ?? '-';
	}

	function formatSide(modelValue, bookmakerValue) {
		if (modelValue == null) {
			return '-';
		}

		const value = modelValue.toFixed(2);

		if (bookmakerValue == null) {
			return value;
		}

		const edgePercent = ((1 / modelValue) - (1 / bookmakerValue)) * 100;
		const formattedEdge = formatEdgePercent(edgePercent);

		if (edgePercent > 0 && formattedEdge != null) {
			return `${value} (${formattedEdge})`;
		}

		return value;
	}

	return `${formatSide(modelA, bookmakerA)} - ${formatSide(modelB, bookmakerB)}`;
}

function PlayersCell({ row, showHeadToHead = false }) {
	return <PlayersHeadToHead playerA={row.player} playerB={row.opponent} suffix={showHeadToHead && row.headToHead ? `[${row.headToHead}]` : null} />;
}

function ActivePlayersCell({ row }) {
	return <PlayersHeadToHead playerA={row.player} playerB={row.opponent} suffix={row.headToHead ? `[${row.headToHead}]` : null} />;
}

function getHeadToHeadValue(playerA, playerB, headToHeadByPair) {
	if (!playerA?.id || !playerB?.id) {
		return null;
	}

	const pairKey = [playerA.id, playerB.id].sort().join(':');
	const record = headToHeadByPair[pairKey];
	const playerAWins = record?.[playerA.id] ?? 0;
	const playerBWins = record?.[playerB.id] ?? 0;

	return `${playerAWins}-${playerBWins}`;
}

function groupRowsByTournament(rows, getTournamentName) {
	const groups = [];
	const groupsByTournament = new Map();

	for (const row of rows) {
		const tournamentName = String(getTournamentName(row) || '').trim() || 'Övrigt';
		const existingGroup = groupsByTournament.get(tournamentName);

		if (existingGroup) {
			existingGroup.rows.push(row);
			continue;
		}

		const group = {
			name: tournamentName,
			rows: [row]
		};

		groupsByTournament.set(tournamentName, group);
		groups.push(group);
	}

	return groups;
}

function TournamentGroups({ rows, getTournamentName, renderTable }) {
	const groups = groupRowsByTournament(rows, getTournamentName);

	return (
		<div className='space-y-6'>
			{groups.map(group => (
				<div key={group.name} className='space-y-2'>
					<Page.Title level={3}>{group.name}</Page.Title>
					{renderTable(group.rows)}
				</div>
			))}
		</div>
	);
}

function MatchesTable({ rows, groupedByTournament = false }) {
	return (
		<Table rows={rows}>
			{!groupedByTournament ? (
				<Table.Column id='event'>
					<Table.Title>Turnering</Table.Title>
					<Table.Cell>{({ row, value }) => (row.eventId ? <Link to={`/event/${row.eventId}`}>{value}</Link> : value)}</Table.Cell>
				</Table.Column>
			) : null}

			<Table.Column>
				<Table.Title>Spelare</Table.Title>
				<Table.Value>{({ row }) => <ActivePlayersCell row={row} />}</Table.Value>
			</Table.Column>

			<Table.Column id='odds'>
				<Table.Title>Oddset</Table.Title>
			</Table.Column>

			<Table.Column id='odds'>
				<Table.Title>TA</Table.Title>
				<Table.Value>{({ row }) => formatOddsWithPositiveEdge(row.odds, row.taOdds)}</Table.Value>
			</Table.Column>

			<Table.Column>
				<Table.Title>Vitel</Table.Title>
				<Table.Value>{({ row }) => formatOddsWithPositiveEdge(row.odds, row.myOdds)}</Table.Value>
			</Table.Column>

			<Table.Column id='score'>
				<Table.Title>Ställning</Table.Title>
			</Table.Column>
		</Table>
	);
}

function FinishedMatchesTable({ rows, groupedByTournament = false }) {
	return (
		<Table rows={rows}>
			{!groupedByTournament ? (
				<Table.Column id='event'>
					<Table.Title>Turnering</Table.Title>
					<Table.Cell>{({ row, value }) => (row.eventId ? <Link to={`/event/${row.eventId}`}>{value}</Link> : value)}</Table.Cell>
				</Table.Column>
			) : null}

			<Table.Column>
				<Table.Title>Spelare</Table.Title>
				<Table.Value>{({ row }) => <PlayersCell row={row} showHeadToHead={true} />}</Table.Value>
			</Table.Column>

			<Table.Column id='odds'>
				<Table.Title>Oddset</Table.Title>
			</Table.Column>

			<Table.Column id='odds'>
				<Table.Title>TA</Table.Title>
				<Table.Value>{({ row }) => formatOddsWithPositiveEdge(row.odds, row.taOdds)}</Table.Value>
			</Table.Column>

			<Table.Column>
				<Table.Title>Vitel</Table.Title>
				<Table.Value>{({ row }) => formatOddsWithPositiveEdge(row.odds, row.myOdds)}</Table.Value>
			</Table.Column>

			<Table.Column id='score'>
				<Table.Title>Resultat</Table.Title>
			</Table.Column>
		</Table>
	);
}

function UpcomingPlayersCell({ row }) {
	return <PlayersHeadToHead playerA={row.playerA} playerB={row.playerB} suffix={row.headToHead ? `[${row.headToHead}]` : null} />;
}

function UpcomingMatchesTable({ rows, groupedByTournament = false }) {
	return (
		<Table rows={rows}>
			<Table.Column id='start'>
				<Table.Title>Start</Table.Title>
			</Table.Column>

			{!groupedByTournament ? (
				<Table.Column id='turnering'>
					<Table.Title>Turnering</Table.Title>
				</Table.Column>
			) : null}

			<Table.Column>
				<Table.Title>Spelare</Table.Title>
				<Table.Value>{({ row }) => <UpcomingPlayersCell row={row} />}</Table.Value>
			</Table.Column>

			<Table.Column id='odds'>
				<Table.Title>Oddset</Table.Title>
			</Table.Column>

			<Table.Column>
				<Table.Title>TA</Table.Title>
				<Table.Value>{({ row }) => formatOddsWithPositiveEdge(row.odds, row.taOdds)}</Table.Value>
			</Table.Column>

			<Table.Column>
				<Table.Title>Vitel</Table.Title>
				<Table.Value>{({ row }) => formatOddsWithPositiveEdge(row.odds, row.myOdds)}</Table.Value>
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

function createLiveCalculatedOddsRows(matches = []) {
	return matches.map(match => ({
			player: match.player,
			opponent: match.opponent
		}));
}

function createCalculatedOddsRowsKey(rows = []) {
	return rows.map(row => [
		row.playerA?.id ?? row.player?.id ?? null,
		row.playerB?.id ?? row.opponent?.id ?? null,
		row._startTimestamp ?? null
	]);
}

async function fetchLiveOddsSnapshot(rows = []) {
	const [oddsByPlayers, calculatedOddsByMatch, tennisAbstractOddsByMatch] = await Promise.all([
		fetchLiveOddsetOddsByPlayers(),
		fetchCalculatedOddsForMatches(rows),
		fetchTennisAbstractOddsForMatches(rows)
	]);

	return {
		oddsByPlayers,
		calculatedOddsByMatch,
		tennisAbstractOddsByMatch
	};
}

async function fetchUpcomingMatchesSnapshot() {
	const oddsetRows = await fetchOddsetPipelineMatches();
	const [calculatedOddsByMatch, tennisAbstractOddsByMatch] = await Promise.all([
		fetchCalculatedOddsForMatches(oddsetRows),
		fetchTennisAbstractOddsForMatches(oddsetRows)
	]);

	return {
		oddsetRows,
		calculatedOddsByMatch,
		tennisAbstractOddsByMatch
	};
}

function Component() {
	const archivedFinishedOddsByMatchRef = React.useRef(new Map());
	const { data: matches, error: liveError, dataUpdatedAt, isFetching } = useRequest({
		path: 'matches/live',
		method: 'GET',
		cache: 0,
		refetchInterval: LIVE_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: true,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false
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
	const ranksByPlayerId = Object.fromEntries((rankingRows ?? []).map((player, index) => [player.id, index + 1]));
	const playerDetailsById = buildPlayerDetailsById(playerRows ?? []);
	const liveCalculatedOddsRows = React.useMemo(() => createLiveCalculatedOddsRows(matches ?? []), [matches]);
	const { data: liveOddsSnapshot, error: oddsError } = useQuery({
		queryKey: [LIVE_ODDSET_QUERY_KEY, CALCULATED_ODDS_QUERY_KEY, TENNIS_ABSTRACT_ODDS_QUERY_KEY, createCalculatedOddsRowsKey(liveCalculatedOddsRows)],
		queryFn: () => fetchLiveOddsSnapshot(liveCalculatedOddsRows),
		staleTime: LIVE_REFRESH_INTERVAL_MS,
		refetchInterval: LIVE_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: 0,
		enabled: liveCalculatedOddsRows.length > 0,
		placeholderData: previousData => previousData
	});
	const { data: upcomingSnapshot, error: oddsetPipelineError } = useQuery({
		queryKey: ODDSET_PIPELINE_QUERY_KEY,
		queryFn: fetchUpcomingMatchesSnapshot,
		staleTime: ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
		refetchInterval: ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
		refetchOnWindowFocus: false,
		retry: 0,
		placeholderData: previousData => previousData
	});
	const oddsByPlayers = liveOddsSnapshot?.oddsByPlayers ?? {};
	const activeCalculatedOddsByMatch = liveOddsSnapshot?.calculatedOddsByMatch ?? {};
	const activeTennisAbstractOddsByMatch = liveOddsSnapshot?.tennisAbstractOddsByMatch ?? {};
	const oddsetRows = upcomingSnapshot?.oddsetRows ?? [];
	const upcomingCalculatedOddsByMatch = upcomingSnapshot?.calculatedOddsByMatch ?? {};
	const upcomingTennisAbstractOddsByMatch = upcomingSnapshot?.tennisAbstractOddsByMatch ?? {};
	const resolvedUpcomingRows = oddsetRows.map(row => {
		const { playerA, playerB } = resolveMatchPlayers(row, playerDetailsById, ranksByPlayerId);
		return { ...row, playerA, playerB };
	});
	const headToHeadRows = React.useMemo(() => {
		const upcomingMatches = resolvedUpcomingRows.map(row => ({
			player: row.playerA,
			opponent: row.playerB
		}));

		return [...(matches ?? []), ...upcomingMatches];
	}, [matches, resolvedUpcomingRows]);
	const headToHeadPairsKey = React.useMemo(
		() => headToHeadRows.map(match => [match.player?.id ?? null, match.opponent?.id ?? null]),
		[headToHeadRows]
	);
	const { data: headToHeadByPair = {}, error: meetingError } = useQuery({
		queryKey: [HEAD_TO_HEAD_QUERY_KEY, headToHeadPairsKey],
		queryFn: () => fetchHeadToHeadByMatches(headToHeadRows),
		cache: 0,
		staleTime: 0,
		refetchInterval: LIVE_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: true,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: 0,
		placeholderData: previousData => previousData
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

	if (!matches || !rankingRows || !playerRows) {
		return (
			<Page id='matches-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Loading>Läser in matcher...</Page.Loading>
				</Page.Content>
			</Page>
		);
	}

	const rows = (matches ?? []).map(match => addRankingAndDisplayFields(match, ranksByPlayerId, oddsByPlayers, headToHeadByPair));
	const { activeMatches: rawActiveMatches, finishedMatches } = splitMatchesByStatus(rows);
	const activeMatches = rawActiveMatches
		.map(match => ({
			...match,
			myOdds: getCalculatedOddsForMatch(match, activeCalculatedOddsByMatch),
			taOdds: getCalculatedOddsForMatch(match, activeTennisAbstractOddsByMatch)
		}));
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
			myOdds: getCalculatedOddsForMatch(row, upcomingCalculatedOddsByMatch),
			taOdds: getCalculatedOddsForMatch(row, upcomingTennisAbstractOddsByMatch),
			headToHead: getHeadToHeadValue(row.playerA, row.playerB, headToHeadByPair)
		}));
	for (const row of upcomingRows) {
		const archivedKey = createArchivedMatchKeyForUpcomingRow(row);
		if (!archivedKey) {
			continue;
		}

		archivedFinishedOddsByMatchRef.current.set(archivedKey, {
			odds: row.odds ?? '-',
			myOdds: row.myOdds ?? '-',
			taOdds: row.taOdds ?? '-'
		});
	}
	const finishedMatchesWithOdds = finishedMatches.map(match => {
		const archivedKey = createArchivedMatchKeyForLiveRow(match);
		const archivedOdds = archivedKey ? archivedFinishedOddsByMatchRef.current.get(archivedKey) : null;
		const calculatedOdds = getCalculatedOddsForMatch(match, activeCalculatedOddsByMatch);

		return {
			...match,
			odds: archivedOdds?.odds ?? '-',
			myOdds: archivedOdds?.myOdds ?? calculatedOdds,
			taOdds: archivedOdds?.taOdds ?? getCalculatedOddsForMatch(match, activeTennisAbstractOddsByMatch)
		};
	});
	const { upcomingMatches } = splitOddsetRowsByStatus(upcomingRows);
	const hasNoMatches = activeMatches.length === 0 && finishedMatchesWithOdds.length === 0 && upcomingMatches.length === 0;

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
					{meetingError ? <div className='pb-3 text-sm text-primary-700 dark:text-primary-300'>Kunde inte läsa in allt head-to-head just nu.</div> : null}
					{hasNoMatches ? (
						<Page.Emoji emoji='😢' message='Det finns inget att visa' />
					) : (
						<>
							<div className='space-y-10'>
								<section className='space-y-2'>
									<Page.Title level={2}>Pågående matcher</Page.Title>
									{activeMatches.length > 0 ? (
										<>
											<TournamentGroups
												rows={activeMatches}
												getTournamentName={row => row.event}
												renderTable={rows => <MatchesTable rows={rows} groupedByTournament={true} />}
											/>
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
									{finishedMatchesWithOdds.length > 0 ? (
										<TournamentGroups
											rows={finishedMatchesWithOdds}
											getTournamentName={row => row.event}
											renderTable={rows => <FinishedMatchesTable rows={rows} groupedByTournament={true} />}
										/>
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
										<TournamentGroups
											rows={upcomingMatches}
											getTournamentName={row => row.turnering}
											renderTable={rows => <UpcomingMatchesTable rows={rows} groupedByTournament={true} />}
										/>
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
