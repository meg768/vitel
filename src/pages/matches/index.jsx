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

function UpcomingPlayersCell({ row }) {
	return <PlayersHeadToHead playerA={row.playerA} playerB={row.playerB} />;
}

function LivePlayersCell({ row }) {
	return (
		<PlayersHeadToHead
			playerA={row.playerA}
			playerB={row.playerB}
			playerASuffix={row.serve === 'player' ? <span className='text-xs leading-none' aria-hidden='true'>🎾</span> : null}
			playerBSuffix={row.serve === 'opponent' ? <span className='text-xs leading-none' aria-hidden='true'>🎾</span> : null}
		/>
	);
}

function LiveOddsetMatchesTable({ rows }) {
	return (
		<Table rows={rows}>
			<Table.Column id='start'>
				<Table.Title>Start</Table.Title>
				<Table.SortValue>{({ row }) => row._startTimestamp}</Table.SortValue>
			</Table.Column>

			<Table.Column id='turnering'>
				<Table.Title>Turnering</Table.Title>
			</Table.Column>

			<Table.Column>
				<Table.Title>Spelare</Table.Title>
				<Table.Value>{({ row }) => <LivePlayersCell row={row} />}</Table.Value>
			</Table.Column>

			<Table.Column id='odds'>
				<Table.Title>Oddset</Table.Title>
			</Table.Column>

			<Table.Column>
				<Table.Title>TA</Table.Title>
				<Table.Value>{({ row }) => formatOddsWithPositiveEdge(row.odds, row.TA)}</Table.Value>
			</Table.Column>

			<Table.Column>
				<Table.Title>GPT</Table.Title>
				<Table.Value>{({ row }) => formatOddsWithPositiveEdge(row.odds, row.GPT)}</Table.Value>
			</Table.Column>

			<Table.Column id='liveScore'>
				<Table.Title>Ställning</Table.Title>
			</Table.Column>
		</Table>
	);
}

function UpcomingMatchesTable({ rows }) {
	return (
		<Table rows={rows}>
			<Table.Column id='start'>
				<Table.Title>Start</Table.Title>
				<Table.SortValue>{({ row }) => row._startTimestamp}</Table.SortValue>
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
				<Table.Title>TA</Table.Title>
				<Table.Value>{({ row }) => formatOddsWithPositiveEdge(row.odds, row.TA)}</Table.Value>
			</Table.Column>

			<Table.Column>
				<Table.Title>GPT</Table.Title>
				<Table.Value>{({ row }) => formatOddsWithPositiveEdge(row.odds, row.GPT)}</Table.Value>
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
	const {
		data: oddsetSnapshot,
		error: oddsetError,
		dataUpdatedAt,
		isFetching: isFetchingOddset
	} = useQuery({
		queryKey: [ODDSET_PIPELINE_QUERY_KEY],
		queryFn: fetchOddsetPipelineSnapshot,
		staleTime: ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
		refetchInterval: ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: 0,
		placeholderData: previousData => previousData
	});
	const oddsetRows = oddsetSnapshot?.oddsetRows ?? [];
	const calculatedOddsRowsKey = createCalculatedOddsRowsKey(oddsetRows);
	const {
		data: upcomingMatchOddsByMatch = {},
		error: oddsError,
		isFetching: isFetchingOdds
	} = useQuery({
		queryKey: [MATCH_ODDS_QUERY_KEY, calculatedOddsRowsKey],
		queryFn: () => fetchMatchOddsForMatches(oddsetRows),
		enabled: oddsetRows.length > 0,
		staleTime: ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: 0,
		placeholderData: previousData => previousData
	});
	const ranksByPlayerId = Object.fromEntries((rankingRows ?? []).map((player, index) => [player.id, index + 1]));
	const playerDetailsById = buildPlayerDetailsById(playerRows ?? []);
	const hasLoadedOddsetSnapshot = Boolean(oddsetSnapshot);
	const Header = () => (
		<Page.Header className='justify-between gap-3'>
			<span className='bg-transparent'>Matcher</span>
			<Countdown
				dataUpdatedAt={dataUpdatedAt}
				isFetching={isFetchingOddset}
				intervalMs={ODDSET_PIPELINE_REFRESH_INTERVAL_MS}
				steps={LIVE_COUNTDOWN_STEPS}
				labelUpdating='Uppdaterar matches-sidan'
				inline={true}
			/>
		</Page.Header>
	);
	const resolvedOddsetRows = oddsetRows.map(row => {
		const { playerA, playerB } = resolveMatchPlayers(row, playerDetailsById, ranksByPlayerId);
		return { ...row, playerA, playerB };
	});

	if (rankError) {
		return (
			<Page id='matches-page'>
				<Page.Menu />
				{Header()}
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
				{Header()}
				<Page.Content>
					<Page.Error>Misslyckades med att läsa in spelare - {playerError.message}</Page.Error>
				</Page.Content>
			</Page>
		);
	}

	if (oddsetError && !hasLoadedOddsetSnapshot) {
		return (
			<Page id='matches-page'>
				<Page.Menu />
				{Header()}
				<Page.Content>
					<Page.Error>Misslyckades med att läsa in matcher - {oddsetError.message}</Page.Error>
				</Page.Content>
			</Page>
		);
	}

	if (!rankingRows || !playerRows || !hasLoadedOddsetSnapshot) {
		return (
			<Page id='matches-page'>
				<Page.Menu />
				{Header()}
				<Page.Content>
					<Page.Loading>Hämtar matcher…</Page.Loading>
				</Page.Content>
			</Page>
		);
	}

	const oddsetMatchRows = resolvedOddsetRows
		.map(row => {
			const matchOdds = getMatchOddsForRow(row, upcomingMatchOddsByMatch);
			return {
				...row,
				TA: matchOdds.TA,
				GPT: matchOdds.GPT
			};
		});
	const { liveMatches, upcomingMatches } = splitOddsetRowsByStatus(oddsetMatchRows);
	const hasNoMatches = liveMatches.length === 0 && upcomingMatches.length === 0;
	let statusBarStatus = 'ready';
	let statusBarMessage = `Laddade ${liveMatches.length} live och ${upcomingMatches.length} kommande matcher.`;

	if (oddsetError) {
		statusBarStatus = 'warning';
		statusBarMessage = 'Visar tidigare matcher, men kunde inte uppdatera matchlistan just nu.';
	} else if (oddsError) {
		statusBarStatus = 'warning';
		statusBarMessage = 'Matcherna visas, men alla TA- och GPT-odds kunde inte beräknas.';
	} else if (isFetchingOdds) {
		statusBarStatus = 'loading';
		statusBarMessage = `Laddade ${liveMatches.length} live och ${upcomingMatches.length} kommande matcher. Beräknar TA- och GPT-odds…`;
	} else if (isFetchingOddset) {
		statusBarStatus = 'loading';
		statusBarMessage = 'Uppdaterar matchlistan…';
	}

	return (
		<Page id='matches-page'>
			<Page.Menu />
			{Header()}
			<Page.Content>
				<Page.Container>
					{hasNoMatches ? (
						<Page.Emoji emoji='😢' message='Det finns inget att visa' />
					) : (
						<>
							<div className='space-y-6'>
								<section className='space-y-1'>
									<div className='flex items-center gap-2 py-2'>
										<Page.Title level={2} className='p-0!'>Pågående matcher</Page.Title>
										{liveMatches.length > 0 ? (
											<Button link='/scoreboard' size='compact'>Scoreboard</Button>
										) : null}
									</div>
									{liveMatches.length > 0 ? (
										<LiveOddsetMatchesTable rows={liveMatches} />
									) : (
										<Page.Information>Inga pågående matcher just nu</Page.Information>
									)}
								</section>

								<section className='space-y-1'>
									<Page.Title level={2}>Kommande matcher</Page.Title>
									{upcomingMatches.length > 0 ? (
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
			<Page.StatusBar status={statusBarStatus}>{statusBarMessage}</Page.StatusBar>
		</Page>
	);
}

export default Component;
