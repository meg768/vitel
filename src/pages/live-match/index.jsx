import React from 'react';
import { useParams } from 'react-router';

import LiveMatchMonitor from '../../components/live-match-monitor';
import Page from '../../components/page';
import { useRequest, useSQL } from '../../js/vitel.js';

const LIVE_REFRESH_INTERVAL_MS = 5 * 1000;

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

function Component() {
	const params = useParams();
	const { data: matches, error: liveError } = useRequest({
		path: 'live',
		method: 'GET',
		cache: 0,
		refetchInterval: LIVE_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: true
	});
	const rankingSql = 'SELECT id FROM players WHERE rank IS NOT NULL ORDER BY rank ASC, name ASC';
	const { data: rankingRows, error: rankError } = useSQL({
		sql: rankingSql,
		cache: 5 * 60 * 1000
	});

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

	const ranks = Object.fromEntries((rankingRows ?? []).map((player, index) => [player.id, index + 1]));
	const rankedMatches = matches.map(match => addRankingToMatch(match, ranks));
	const { selectedMatches, error: selectionError } = selectMonitorMatches(rankedMatches, params);
	const singleMatchMode = Boolean(params.A && params.B);

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
			<Page.Menu />
			<Page.Content className='flex flex-col'>
				{singleMatchMode ? (
					<LiveMatchMonitor match={selectedMatches[0]} className='flex-1' />
				) : (
					<>
						<Page.Title>Live Monitor</Page.Title>
						<div className='mt-4 grid h-full grid-cols-1 gap-4 xl:grid-cols-2'>
							{selectedMatches.map(match => {
								const key = `${match.player?.id}-${match.opponent?.id}`;

								return <LiveMatchMonitor key={key} match={match} className='min-h-[22rem]' defaultShowChrome={false} compact={true} />;
							})}
						</div>
					</>
				)}
			</Page.Content>
		</Page>
	);
}

export default Component;
