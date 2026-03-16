import React from 'react';
import { useQuery } from '@tanstack/react-query';

import Countdown from '../../components/countdown';
import PlayersHeadToHead from '../../components/players-head-to-head';
import Page from '../../components/page';
import Button from '../../components/ui/button';
import Table from '../../components/ui/data-table';
import Link from '../../components/ui/link';
import { LIVE_ODDSET_QUERY_KEY, fetchLiveOddsetOddsByPlayers } from '../../js/live-oddset.js';
import { addRankingAndDisplayFields, buildHeadToHeadQuery } from '../../js/live-match-rows.js';
import { useRequest, useSQL } from '../../js/vitel.js';

const LIVE_REFRESH_INTERVAL_MS = 10 * 1000;
const ODDSET_REFRESH_INTERVAL_MS = 10 * 1000;
const LIVE_COUNTDOWN_STEPS = 5;

function PlayersCell({ row }) {
	return <PlayersHeadToHead playerA={row.player} playerB={row.opponent} />;
}

function LiveMatchesOverviewTable({ rows }) {
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

function Component() {
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
	const headToHeadQuery = React.useMemo(() => buildHeadToHeadQuery(matches ?? []), [matches]);
	const { data: meetingRows, error: meetingError } = useSQL({
		sql: headToHeadQuery.sql,
		format: headToHeadQuery.format,
		cache: 0,
		refetchInterval: LIVE_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: true
	});

	if (liveError) {
		return (
			<Page id='live-matches-overview-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Error>Misslyckades med att läsa in livematcher - {liveError.message}</Page.Error>
				</Page.Content>
			</Page>
		);
	}

	if (rankError) {
		return (
			<Page id='live-matches-overview-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Error>Misslyckades med att läsa in ranking - {rankError.message}</Page.Error>
				</Page.Content>
			</Page>
		);
	}

	if (meetingError) {
		return (
			<Page id='live-matches-overview-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Error>Misslyckades med att läsa in head-to-head - {meetingError.message}</Page.Error>
				</Page.Content>
			</Page>
		);
	}

	if (!matches || !rankingRows || !meetingRows) {
		return (
			<Page id='live-matches-overview-page'>
				<Page.Menu />
				<Page.Content>
					<Page.Loading>Läser in livematcher...</Page.Loading>
				</Page.Content>
			</Page>
		);
	}

	const ranksByPlayerId = Object.fromEntries((rankingRows ?? []).map((player, index) => [player.id, index + 1]));
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
		.map(match => addRankingAndDisplayFields(match, ranksByPlayerId, oddsByPlayers, headToHeadByPair))
		.filter(match => !match.winner);

	return (
		<Page id='live-matches-overview-page'>
			<Page.Menu />
			<Page.Content>
				<Page.Title className='flex items-center justify-between gap-3'>
					<span className='bg-transparent'>Livematcher</span>
					<Countdown
						dataUpdatedAt={dataUpdatedAt}
						isFetching={isFetching}
						intervalMs={LIVE_REFRESH_INTERVAL_MS}
						steps={LIVE_COUNTDOWN_STEPS}
						labelUpdating='Uppdaterar live-matches-overview-sidan'
						inline={true}
					/>
				</Page.Title>
				<Page.Container>
					{oddsError ? <div className='pb-3 text-sm text-primary-700 dark:text-primary-300'>Kunde inte läsa odds just nu.</div> : null}
					{rows.length > 0 ? (
						<>
							<LiveMatchesOverviewTable rows={rows} />
							<div className='flex justify-center pt-4'>
								<Button link='/live-matches-detail'>Visa mer detaljerat</Button>
							</div>
						</>
					) : (
						<Page.Information>Det finns inga pågående matcher att övervaka just nu.</Page.Information>
					)}
				</Page.Container>
			</Page.Content>
		</Page>
	);
}

export default Component;
