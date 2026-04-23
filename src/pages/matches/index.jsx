import React from 'react';
import { useQuery } from '@tanstack/react-query';

import Countdown from '../../components/countdown';
import PlayersHeadToHead from '../../components/players-head-to-head';
import Page from '../../components/page';
import Button from '../../components/ui/button';
import Table from '../../components/ui/data-table';
import {
	MATCH_ODDS_QUERY_KEY,
	fetchMatchOddsForMatches,
	getMatchOddsForRow
} from './calculated-odds.js';
import {
	ODDSET_PIPELINE_QUERY_KEY,
	ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
	buildPlayerDetailsById,
	fetchOddsetPipelineSnapshot,
	resolveMatchPlayers,
	splitOddsetRowsByStatus
} from '../../js/oddset-pipeline.js';
import { useSQL } from '../../js/vitel.js';

const LIVE_COUNTDOWN_STEPS = 5;
const PLAYERS_COUNTRY_CACHE_MS = 24 * 60 * 60 * 1000;

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

function UpcomingPlayersCell({ row }) {
	return <PlayersHeadToHead playerA={row.playerA} playerB={row.playerB} />;
}

function LiveOddsetMatchesTable({ rows, groupedByTournament = false }) {
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
				<Table.Value>{({ row }) => formatOddsWithPositiveEdge(row.odds, row.tennisAbstractOdds)}</Table.Value>
			</Table.Column>

			<Table.Column>
				<Table.Title>Vitel</Table.Title>
				<Table.Value>{({ row }) => formatOddsWithPositiveEdge(row.odds, row.computedOdds)}</Table.Value>
			</Table.Column>

			<Table.Column id='liveScore'>
				<Table.Title>Ställning</Table.Title>
			</Table.Column>
		</Table>
	);
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
				<Table.Value>{({ row }) => formatOddsWithPositiveEdge(row.odds, row.tennisAbstractOdds)}</Table.Value>
			</Table.Column>

			<Table.Column>
				<Table.Title>Vitel</Table.Title>
				<Table.Value>{({ row }) => formatOddsWithPositiveEdge(row.odds, row.computedOdds)}</Table.Value>
			</Table.Column>
		</Table>
	);
}

function createCalculatedOddsRowsKey(rows = []) {
	return rows.map(row => [
		row.playerA?.id ?? null,
		row.playerB?.id ?? null,
		row._startTimestamp ?? null
	]);
}

async function fetchMatchesSnapshot() {
	const oddsetSnapshot = await fetchOddsetPipelineSnapshot();
	const upcomingMatchOddsByMatch = await fetchMatchOddsForMatches(oddsetSnapshot.oddsetRows);

	return {
		oddsByPlayers: oddsetSnapshot.oddsByPlayers,
		oddsetRows: oddsetSnapshot.oddsetRows,
		upcomingMatchOddsByMatch
	};
}

function Component() {
	const { data: playerRows, error: playerError } = useSQL({
		sql: 'SELECT id, name, country FROM players',
		cache: PLAYERS_COUNTRY_CACHE_MS
	});
	const rankingSql = 'SELECT id FROM players WHERE rank IS NOT NULL ORDER BY rank ASC, name ASC';
	const { data: rankingRows, error: rankError } = useSQL({
		sql: rankingSql,
		cache: 5 * 60 * 1000
	});
	const { data: oddsSnapshot, error: oddsError, dataUpdatedAt, isFetching } = useQuery({
		queryKey: [ODDSET_PIPELINE_QUERY_KEY, MATCH_ODDS_QUERY_KEY],
		queryFn: fetchMatchesSnapshot,
		staleTime: ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
		refetchInterval: ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: 0,
		placeholderData: previousData => previousData
	});
	const ranksByPlayerId = Object.fromEntries((rankingRows ?? []).map((player, index) => [player.id, index + 1]));
	const playerDetailsById = buildPlayerDetailsById(playerRows ?? []);
	const oddsetRows = oddsSnapshot?.oddsetRows ?? [];
	const upcomingMatchOddsByMatch = oddsSnapshot?.upcomingMatchOddsByMatch ?? {};
	const hasLoadedOddsSnapshot = Boolean(oddsSnapshot);
	const resolvedOddsetRows = oddsetRows.map(row => {
		const { playerA, playerB } = resolveMatchPlayers(row, playerDetailsById, ranksByPlayerId);
		return { ...row, playerA, playerB };
	});

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

	if (!rankingRows || !playerRows || (!hasLoadedOddsSnapshot && !oddsError)) {
		return (
			<Page id='matches-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Loading>Läser in matcher...</Page.Loading>
				</Page.Content>
			</Page>
		);
	}

	const oddsetMatchRows = resolvedOddsetRows
		.map(row => {
			const matchOdds = getMatchOddsForRow(row, upcomingMatchOddsByMatch);
			return {
				...row,
				computedOdds: matchOdds.computedOdds,
				tennisAbstractOdds: matchOdds.tennisAbstractOdds
			};
		});
	const { liveMatches, upcomingMatches } = splitOddsetRowsByStatus(oddsetMatchRows);
	const hasNoMatches = liveMatches.length === 0 && upcomingMatches.length === 0;

	return (
		<Page id='matches-page'>
			<Page.Menu />
			<Page.Content>
				<Page.Title className='flex items-center justify-between gap-3'>
					<span className='bg-transparent'>Matcher</span>
					<Countdown
						dataUpdatedAt={dataUpdatedAt}
						isFetching={isFetching}
						intervalMs={ODDSET_PIPELINE_REFRESH_INTERVAL_MS}
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
									{oddsError ? (
										<Page.Error>Misslyckades med att läsa pågående matcher - {oddsError.message}</Page.Error>
									) : liveMatches.length > 0 ? (
										<>
											<TournamentGroups
												rows={liveMatches}
												getTournamentName={row => row.turnering}
												renderTable={rows => <LiveOddsetMatchesTable rows={rows} groupedByTournament={true} />}
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
									<Page.Title level={2}>Kommande matcher</Page.Title>
									{oddsError ? (
										<Page.Error>Misslyckades med att läsa kommande matcher - {oddsError.message}</Page.Error>
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
