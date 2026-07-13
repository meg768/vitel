import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import Countdown from '../../components/countdown';
import LiveMatchMonitor from '../../components/live-match-monitor';
import Page from '../../components/page';
import { fetchHeadToHeadByMatches, selectMonitorMatches } from '../../js/live-match-rows.js';
import { useRequest, useSQL } from '../../js/vitel.js';

const ODDSET_REFRESH_INTERVAL_MS = 10 * 1000;
const LIVE_COUNTDOWN_STEPS = 5;
const HEAD_TO_HEAD_QUERY_KEY = ['head-to-head', 'scoreboard'];

function formatOddsValue(value) {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value.toFixed(2);
	}

	return '-';
}

function buildPlayerQuery(matches = []) {
	const playerIds = [...new Set(
		matches.flatMap(match => [match?.playerA?.id, match?.playerB?.id].filter(Boolean))
	)];

	if (playerIds.length === 0) {
		return {
			sql: 'SELECT id, country, rank FROM players WHERE 1 = 0',
			format: []
		};
	}

	return {
		sql: `SELECT id, country, rank FROM players WHERE id IN (${playerIds.map(() => '?').join(', ')})`,
		format: playerIds
	};
}

function buildPlayerDetailsById(rows = []) {
	return Object.fromEntries(
		rows
			.filter(row => row?.id)
			.map(row => [
				String(row.id).trim().toUpperCase(),
				{
					id: row.id,
					country: row.country ?? null,
					rank: row.rank ?? null
				}
			])
	);
}

function toHeadToHeadPairKey(playerId, opponentId) {
	return [playerId, opponentId].filter(Boolean).sort().join(':');
}

function buildHeadToHeadMatches(rows = []) {
	return rows.map(row => ({
		player: { id: row?.playerA?.id ?? null },
		opponent: { id: row?.playerB?.id ?? null }
	}));
}

function buildMonitorRows(rows = [], playerDetailsById = {}, headToHeadByPair = {}) {
	return rows.map(row => {
		const playerId = String(row?.playerA?.id || '').trim().toUpperCase() || null;
		const opponentId = String(row?.playerB?.id || '').trim().toUpperCase() || null;
		const playerDetails = playerId ? (playerDetailsById[playerId] || {}) : {};
		const opponentDetails = opponentId ? (playerDetailsById[opponentId] || {}) : {};
		const pairKey = toHeadToHeadPairKey(playerId, opponentId);
		const record = pairKey ? headToHeadByPair[pairKey] : null;
		const playerWins = record?.[playerId] ?? 0;
		const opponentWins = record?.[opponentId] ?? 0;

		return {
			event: row.tournament ?? '',
			name: row.tournament ?? '',
			score: row.score ?? '',
			comment: null,
			server: row.serve ?? null,
			winner: null,
			odds: `${formatOddsValue(row?.playerA?.odds)} - ${formatOddsValue(row?.playerB?.odds)}`,
			oddsState: row.state ?? null,
			player: {
				id: playerId,
				name: row?.playerA?.name ?? '-',
				country: playerDetails.country ?? null,
				rank: playerDetails.rank ?? null
			},
			opponent: {
				id: opponentId,
				name: row?.playerB?.name ?? '-',
				country: opponentDetails.country ?? null,
				rank: opponentDetails.rank ?? null
			},
			headToHead: `${playerWins}-${opponentWins}`,
			opponentHeadToHead: `${opponentWins}-${playerWins}`
		};
	});
}

function ErrorPage({ message }) {
	return (
		<Page id='scoreboard-page'>
			<Page.Menu />
			<Page.Content>
				<Page.Error>{message}</Page.Error>
			</Page.Content>
		</Page>
	);
}

function InformationPage({ message }) {
	return (
		<Page id='scoreboard-page'>
			<Page.Menu />
			<Page.Content>
				<Page.Emoji emoji='😢' message={message} />
			</Page.Content>
		</Page>
	);
}

function LoadingPage() {
	return (
		<Page id='scoreboard-page'>
			<Page.Menu />
			<Page.Content>
				<Page.Loading>Läser in matcher...</Page.Loading>
			</Page.Content>
		</Page>
	);
}

function Component() {
	function getMatchKey(match) {
		return `${match.player?.id}-${match.opponent?.id}`;
	}

	const routeParams = useParams();
	const [focusedMatchKey, setFocusedMatchKey] = React.useState(null);
	const { data: oddsetRows, error: oddsetError, dataUpdatedAt, isFetching } = useRequest({
		path: 'oddset',
		method: 'GET',
		cache: 0,
		refetchInterval: ODDSET_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: true,
		placeholderData: previousRows => previousRows
	});
	const liveRows = React.useMemo(
		() => (oddsetRows ?? []).filter(row => row?.state === 'live'),
		[oddsetRows]
	);
	const playerQuery = React.useMemo(() => buildPlayerQuery(liveRows), [liveRows]);
	const { data: playerRows, error: playerError, isFetching: isFetchingPlayers } = useSQL({
		sql: playerQuery.sql,
		format: playerQuery.format,
		cache: 5 * 60 * 1000,
		placeholderData: previousRows => previousRows
	});
	const headToHeadMatches = React.useMemo(() => buildHeadToHeadMatches(liveRows), [liveRows]);
	const headToHeadPairsKey = React.useMemo(
		() => headToHeadMatches.map(match => [match.player?.id ?? null, match.opponent?.id ?? null]),
		[headToHeadMatches]
	);
	const { data: headToHeadByPair = {}, error: meetingError, isFetching: isFetchingMeetings } = useQuery({
		queryKey: [HEAD_TO_HEAD_QUERY_KEY, headToHeadPairsKey],
		queryFn: () => fetchHeadToHeadByMatches(headToHeadMatches),
		cache: 0,
		staleTime: 5 * 60 * 1000,
		refetchInterval: false,
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: 0,
		placeholderData: previousData => previousData
	});

	const hasLoadedMatchData = Boolean(oddsetRows);
	const playerDetailsById = buildPlayerDetailsById(playerRows ?? []);
	const monitorRows = hasLoadedMatchData
		? buildMonitorRows(liveRows, playerDetailsById, headToHeadByPair)
		: [];
	const selection = hasLoadedMatchData
		? selectMonitorMatches(monitorRows, routeParams)
		: { selectedMatches: [], error: null };
	const selectedMatches = selection.selectedMatches;
	const selectionError = selection.error;

	const singleMatchMode = Boolean(routeParams.A && routeParams.B);
	const displayEntries = selectedMatches.map(match => ({ match, key: getMatchKey(match) }));
	const focusedMatch = !singleMatchMode && focusedMatchKey
		? displayEntries.find(entry => entry.key === focusedMatchKey)?.match ?? null
		: null;
	const focusMode = !singleMatchMode && Boolean(focusedMatch);
	const hidePageMenu = focusMode || singleMatchMode;
	const dashboardMatchCount = !singleMatchMode ? selectedMatches.length : 0;
	const useCompactCards = dashboardMatchCount > 4;
	let statusBarStatus = 'ready';
	let statusBarMessage = singleMatchMode
		? 'Livematchen är laddad.'
		: `Visar ${selectedMatches.length} livematcher.`;

	if (oddsetError) {
		statusBarStatus = 'warning';
		statusBarMessage = 'Visar tidigare livedata, men kunde inte uppdatera matcherna just nu.';
	} else if (playerError) {
		statusBarStatus = 'warning';
		statusBarMessage = 'Livematcherna visas, men all spelardata kunde inte läsas in.';
	} else if (meetingError) {
		statusBarStatus = 'warning';
		statusBarMessage = 'Livematcherna visas, men all head-to-head-data kunde inte läsas in.';
	} else if (isFetching || isFetchingPlayers || isFetchingMeetings) {
		statusBarStatus = 'loading';
		statusBarMessage = 'Uppdaterar scoreboard…';
	}

	React.useEffect(() => {
		if (singleMatchMode) {
			setFocusedMatchKey(null);
			return;
		}

		if (!focusedMatchKey) {
			return;
		}

		const stillExists = displayEntries.some(entry => entry.key === focusedMatchKey);
		if (!stillExists) {
			setFocusedMatchKey(null);
		}
	}, [singleMatchMode, displayEntries, focusedMatchKey]);

	React.useEffect(() => {
		if (!focusMode) {
			return;
		}

		function onKeyDown(event) {
			if (event.key === 'Escape') {
				setFocusedMatchKey(null);
			}
		}

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [focusMode]);

	if (oddsetError && !hasLoadedMatchData) {
		return <ErrorPage message={`Misslyckades med att läsa in scoreboard - ${oddsetError.message}`} />;
	}

	if (!hasLoadedMatchData) {
		return <LoadingPage />;
	}

	if (selectionError) {
		return <ErrorPage message={selectionError.message} />;
	}

	if (selectedMatches.length === 0) {
		return <InformationPage message='Inga livematcher just nu' />;
	}

	return (
		<Page id='scoreboard-page'>
			{hidePageMenu ? null : <Page.Menu />}
			<Page.Content className='flex flex-col pb-4'>
				{singleMatchMode ? (
					<>
						<LiveMatchMonitor match={selectedMatches[0]} className='flex-1' showFocusToggle={false} />
					</>
				) : (
					<>
						{focusMode ? null : (
							<Page.Title className='flex items-center justify-between gap-3'>
								<span className='bg-transparent'>Scoreboard</span>
								<Countdown
									dataUpdatedAt={dataUpdatedAt}
									isFetching={isFetching}
									intervalMs={ODDSET_REFRESH_INTERVAL_MS}
									steps={LIVE_COUNTDOWN_STEPS}
									labelUpdating='Uppdaterar scoreboard-sidan'
									inline={true}
								/>
							</Page.Title>
						)}
						{focusedMatch ? (
							<div className='fixed inset-0 z-40 bg-primary-50 dark:bg-primary-900'>
								<LiveMatchMonitor
									match={focusedMatch}
									className='h-full w-full rounded-none border-0 p-0 shadow-none'
									defaultShowChrome={false}
									compact={false}
									isFocused={true}
									onToggleFocus={() => setFocusedMatchKey(null)}
								/>
							</div>
						) : (
							<div className='mt-4 flex flex-col gap-4'>
								{displayEntries.map(({ match, key }) => (
									<LiveMatchMonitor
										key={key}
										match={match}
										className='flex-none min-h-[22rem]'
										defaultShowChrome={false}
										compact={useCompactCards}
										isFocused={false}
										onToggleFocus={() => setFocusedMatchKey(key)}
									/>
								))}
							</div>
						)}
					</>
				)}
			</Page.Content>
			<Page.StatusBar status={statusBarStatus}>{statusBarMessage}</Page.StatusBar>
		</Page>
	);
}

export default Component;
