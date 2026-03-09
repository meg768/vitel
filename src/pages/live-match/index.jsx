import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import Countdown from '../../components/countdown';
import LiveMatchMonitor from '../../components/live-match-monitor';
import Page from '../../components/page';
import { LIVE_ODDSET_QUERY_KEY, fetchLiveOddsetOddsByPlayers, formatLiveOddsetOddsForMatch } from '../../js/live-oddset.js';
import { useRequest, useSQL } from '../../js/vitel.js';

const LIVE_REFRESH_INTERVAL_MS = 5 * 1000;
const ODDSET_REFRESH_INTERVAL_MS = 15 * 1000;

function ErrorPage({ message }) {
	return (
		<Page id='live-match-page'>
			<Page.Menu />
			<Page.Content>
				<Page.Error>{message}</Page.Error>
			</Page.Content>
		</Page>
	);
}

function LoadingPage() {
	return (
		<Page id='live-match-page'>
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

	function addRankingAndDisplayFields(match, ranksByPlayerId, oddsByPlayers) {
		const rankedMatch = {
			...match,
			event: match.name ?? match.event ?? '',
			score: match.score ?? '',
			comment: match.comment ?? null,
			server: match.server ?? null,
			player: {
				...match.player,
				rank: ranksByPlayerId[match.player?.id]
			},
			opponent: {
				...match.opponent,
				rank: ranksByPlayerId[match.opponent?.id]
			}
		};

		return {
			...rankedMatch,
			odds: formatLiveOddsetOddsForMatch(rankedMatch, oddsByPlayers)
		};
	}

	function selectMonitorMatches(matches, routeParams) {
		if ((routeParams.A && !routeParams.B) || (!routeParams.A && routeParams.B)) {
			return {
				selectedMatches: [],
				error: new Error(`Spelarna hittades inte (${routeParams.A ?? '-'}, ${routeParams.B ?? '-'})`)
			};
		}

		if (routeParams.A && routeParams.B) {
			const requestedA = String(routeParams.A);
			const requestedB = String(routeParams.B);
			const selectedMatch = matches.find(match => String(match.player?.id) === requestedA && String(match.opponent?.id) === requestedB) ?? null;

			if (!selectedMatch) {
				return {
					selectedMatches: [],
					error: new Error(`Matchen hittades inte bland live-matcherna (${routeParams.A}, ${routeParams.B})`)
				};
			}

			return {
				selectedMatches: [selectedMatch],
				error: null
			};
		}

		return {
			selectedMatches: matches.filter(match => !match.winner),
			error: null
		};
	}

	const routeParams = useParams();
	const [focusedMatchKey, setFocusedMatchKey] = React.useState(null);
	const { data: matches, error: liveError, dataUpdatedAt, isFetching } = useRequest({
		path: 'live',
		method: 'GET',
		cache: 0,
		refetchInterval: LIVE_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: true
	});
	const { data: oddsByPlayers = {}, error: oddsError } = useQuery({
		queryKey: LIVE_ODDSET_QUERY_KEY,
		queryFn: fetchLiveOddsetOddsByPlayers,
		refetchInterval: ODDSET_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: true,
		retry: 0
	});
	const rankingSql = 'SELECT id FROM players WHERE rank IS NOT NULL ORDER BY rank ASC, name ASC';
	const { data: rankingRows, error: rankError } = useSQL({
		sql: rankingSql,
		cache: 5 * 60 * 1000
	});

	const hasLoadedCoreData = Boolean(matches && rankingRows);
	const ranksByPlayerId = hasLoadedCoreData
		? Object.fromEntries((rankingRows ?? []).map((player, index) => [player.id, index + 1]))
		: {};
	const monitorRows = hasLoadedCoreData
		? (matches ?? []).map(match => addRankingAndDisplayFields(match, ranksByPlayerId, oddsByPlayers))
		: [];
	const selection = hasLoadedCoreData
		? selectMonitorMatches(monitorRows, routeParams)
		: { selectedMatches: [], error: null };
	const selectedMatches = selection.selectedMatches;
	const selectionError = selection.error;

	const singleMatchMode = Boolean(routeParams.A && routeParams.B);
	const displayEntries = selectedMatches.map((match, index) => ({ match, key: `${index}:${getMatchKey(match)}` }));
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
		return <ErrorPage message={`Misslyckades med att läsa in live-match - ${liveError.message}`} />;
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
		return <ErrorPage message='Det finns inga pågående matcher att övervaka just nu.' />;
	}

	return (
		<Page id='live-match-page'>
			{hidePageMenu ? null : <Page.Menu />}
			<Page.Content className='flex flex-col'>
				{singleMatchMode ? (
					<>
						{oddsError ? <div className='pb-3 text-sm text-primary-700 dark:text-primary-300'>Kunde inte läsa odds just nu.</div> : null}
						<LiveMatchMonitor match={selectedMatches[0]} className='flex-1' showFocusToggle={false} />
					</>
				) : (
					<>
						{focusMode ? null : <Page.Title>Livematcher</Page.Title>}
						{focusMode || !oddsError ? null : <div className='pt-3 text-sm text-primary-700 dark:text-primary-300'>Kunde inte läsa odds just nu.</div>}

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
							<div className='mt-4 flex h-full flex-col gap-4'>
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

				{focusMode ? null : (
					<Countdown
						dataUpdatedAt={dataUpdatedAt}
						isFetching={isFetching}
						intervalMs={LIVE_REFRESH_INTERVAL_MS}
						labelUpdating='Uppdaterar live-matches-sidan'
					/>
				)}
			</Page.Content>
		</Page>
	);
}

export default Component;
