import React from 'react';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import Countdown from '../../components/countdown';
import LiveMatchMonitor from '../../components/live-match-monitor';
import Page from '../../components/page';
import { LIVE_ODDSET_QUERY_KEY, fetchLiveOddsetOddsByPlayers, formatLiveOddsetOddsForMatch } from '../../js/live-oddset.js';
import { useRequest, useSQL } from '../../js/vitel.js';

const LIVE_REFRESH_INTERVAL_MS = 5 * 1000;
const ODDSET_REFRESH_INTERVAL_MS = 15 * 1000;

function Component() {
	function matchKey(match) {
		return `${match.player?.id}-${match.opponent?.id}`;
	}

	function addRankingToMatch(match, ranks) {
		return {
			...match,
			event: match.name ?? match.event ?? '',
			score: match.score ?? '',
			comment: match.comment ?? null,
			server: match.server ?? null,
			player: {
				...match.player,
				rank: ranks[match.player?.id]
			},
			opponent: {
				...match.opponent,
				rank: ranks[match.opponent?.id]
			}
		};
	}

	function selectMonitorMatches(matches, params) {
		if ((params.A && !params.B) || (!params.A && params.B)) {
			return {
				selectedMatches: [],
				error: new Error(`Spelarna hittades inte (${params.A ?? '-'}, ${params.B ?? '-'})`)
			};
		}

		if (params.A && params.B) {
			const match = matches.find(row => row.player?.id === params.A && row.opponent?.id === params.B) ?? null;

			if (!match) {
				return {
					selectedMatches: [],
					error: new Error(`Matchen hittades inte bland live-matcherna (${params.A}, ${params.B})`)
				};
			}

			return {
				selectedMatches: [match],
				error: null
			};
		}

		const selectedMatches = matches.filter(row => !row.winner);

		return {
			selectedMatches,
			error: null
		};
	}

	const params = useParams();
	const [focusedMatchKey, setFocusedMatchKey] = React.useState(null);
	const { data: matches, error: liveError, dataUpdatedAt, isFetching } = useRequest({
		path: 'live',
		method: 'GET',
		cache: 0,
		refetchInterval: LIVE_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: true
	});
	const {
		data: oddsByPlayers = {},
		error: oddsError
	} = useQuery({
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
	const ranks = Object.fromEntries((rankingRows ?? []).map((player, index) => [player.id, index + 1]));
	const rankedMatches = (matches ?? []).map(match => {
		const rankedMatch = addRankingToMatch(match, ranks);

		return {
			...rankedMatch,
			odds: formatLiveOddsetOddsForMatch(rankedMatch, oddsByPlayers)
		};
	});
	const { selectedMatches, error: selectionError } = selectMonitorMatches(rankedMatches, params);
	const singleMatchMode = Boolean(params.A && params.B);
	const displayEntries = React.useMemo(
		() => selectedMatches.map((match, index) => ({ match, key: `${index}:${matchKey(match)}` })),
		[selectedMatches]
	);
	const focusedMatch = !singleMatchMode && focusedMatchKey
		? displayEntries.find(entry => entry.key === focusedMatchKey)?.match ?? null
		: null;
	const focusMode = !singleMatchMode && Boolean(focusedMatch);
	const hidePageMenu = focusMode || singleMatchMode;
	const dashboardMatchCount = !singleMatchMode ? selectedMatches.length : 0;
	const useCompactCards = dashboardMatchCount > 4;

	React.useEffect(() => {
		if (!matches || !rankingRows) {
			return;
		}

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
	}, [singleMatchMode, displayEntries, focusedMatchKey, matches, rankingRows]);

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
		return (
			<Page id='live-match-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Error>Misslyckades med att läsa in live-match - {liveError.message}</Page.Error>
				</Page.Content>
			</Page>
		);
	}

	if (rankError) {
		return (
			<Page id='live-match-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Error>Misslyckades med att läsa in ranking - {rankError.message}</Page.Error>
				</Page.Content>
			</Page>
		);
	}

	if (!matches || !rankingRows) {
		return (
			<Page id='live-match-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Loading>Läser in matcher...</Page.Loading>
				</Page.Content>
			</Page>
		);
	}

	if (selectionError) {
		return (
			<Page id='live-match-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Error>{selectionError.message}</Page.Error>
				</Page.Content>
			</Page>
		);
	}

	if (!selectedMatches.length) {
		return (
			<Page id='live-match-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Error>Det finns inga pågående matcher att övervaka just nu.</Page.Error>
				</Page.Content>
			</Page>
		);
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
								{displayEntries.map(({ match, key }) => {

									return (
										<LiveMatchMonitor
											key={key}
											match={match}
											className='flex-none min-h-[22rem]'
											defaultShowChrome={false}
											compact={useCompactCards}
											isFocused={false}
											onToggleFocus={() => setFocusedMatchKey(key)}
										/>
									);
								})}
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
