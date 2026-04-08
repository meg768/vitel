import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import Countdown from '../../components/countdown';
import LiveMatchMonitor from '../../components/live-match-monitor';
import Page from '../../components/page';
import { addRankingAndDisplayFields, fetchHeadToHeadByMatches, selectMonitorMatches } from '../../js/live-match-rows.js';
import { LIVE_ODDSET_QUERY_KEY, fetchLiveOddsetOddsByPlayers } from '../../js/oddset-pipeline.js';
import { useRequest, useSQL } from '../../js/vitel.js';

const LIVE_REFRESH_INTERVAL_MS = 10 * 1000;
const ODDSET_REFRESH_INTERVAL_MS = 10 * 1000;
const LIVE_COUNTDOWN_STEPS = 5;
const HEAD_TO_HEAD_QUERY_KEY = ['head-to-head', 'scoreboard'];

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
	const { data: matches, error: liveError, dataUpdatedAt, isFetching } = useRequest({
		path: 'matches/live',
		method: 'GET',
		cache: 0,
		refetchInterval: LIVE_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: true
	});
	const { data: oddsByPlayers = {}, error: oddsError } = useQuery({
		queryKey: LIVE_ODDSET_QUERY_KEY,
		queryFn: fetchLiveOddsetOddsByPlayers,
		staleTime: ODDSET_REFRESH_INTERVAL_MS,
		refetchInterval: ODDSET_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: 0
	});
	const rankingSql = 'SELECT id FROM players WHERE rank IS NOT NULL ORDER BY rank ASC, name ASC';
	const { data: rankingRows, error: rankError } = useSQL({
		sql: rankingSql,
		cache: 5 * 60 * 1000
	});
	const headToHeadPairsKey = React.useMemo(
		() => (matches ?? []).map(match => [match.player?.id ?? null, match.opponent?.id ?? null]),
		[matches]
	);
	const { data: headToHeadByPair = {}, error: meetingError } = useQuery({
		queryKey: [HEAD_TO_HEAD_QUERY_KEY, headToHeadPairsKey],
		queryFn: () => fetchHeadToHeadByMatches(matches ?? []),
		cache: 0,
		staleTime: 0,
		refetchInterval: LIVE_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: true,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: 0,
		placeholderData: previousData => previousData
	});

	const hasLoadedCoreData = Boolean(matches && rankingRows);
	const ranksByPlayerId = hasLoadedCoreData
		? Object.fromEntries((rankingRows ?? []).map((player, index) => [player.id, index + 1]))
		: {};
	const monitorRows = hasLoadedCoreData
		? (matches ?? []).map(match => addRankingAndDisplayFields(match, ranksByPlayerId, oddsByPlayers, headToHeadByPair))
		: [];
	const selection = hasLoadedCoreData
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

	if (liveError) {
		return <ErrorPage message={`Misslyckades med att läsa in scoreboard - ${liveError.message}`} />;
	}

	if (rankError) {
		return <ErrorPage message={`Misslyckades med att läsa in ranking - ${rankError.message}`} />;
	}

	if (!hasLoadedCoreData) {
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
						{oddsError ? <div className='pb-3 text-sm text-primary-700 dark:text-primary-300'>Kunde inte läsa odds just nu.</div> : null}
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
									intervalMs={LIVE_REFRESH_INTERVAL_MS}
									steps={LIVE_COUNTDOWN_STEPS}
									labelUpdating='Uppdaterar scoreboard-sidan'
									inline={true}
								/>
							</Page.Title>
						)}
						{focusMode || !oddsError ? null : <div className='pt-3 text-sm text-primary-700 dark:text-primary-300'>Kunde inte läsa odds just nu.</div>}
						{focusMode || !meetingError ? null : <div className='pt-3 text-sm text-primary-700 dark:text-primary-300'>Kunde inte läsa in allt head-to-head just nu.</div>}

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
		</Page>
	);
}

export default Component;
