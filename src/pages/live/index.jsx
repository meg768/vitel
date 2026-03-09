import React from 'react';
import { useQuery } from '@tanstack/react-query';

import TriangleRightIcon from '../../assets/radix-icons/triangle-right.svg?react';
import Countdown from '../../components/countdown';
import Flag from '../../components/flag';
import Page from '../../components/page';
import Button from '../../components/ui/button';
import Table from '../../components/ui/data-table';
import Link from '../../components/ui/link';
import { LIVE_ODDSET_QUERY_KEY, fetchLiveOddsetOddsByPlayers, formatLiveOddsetOddsForMatch } from '../../js/live-oddset.js';
import { useRequest, useSQL } from '../../js/vitel.js';

const LIVE_REFRESH_INTERVAL_MS = 30 * 1000;

function PlayersCell({ playerA, playerB }) {
	const flagClassName = 'w-5! h-5! border-primary-800 dark:border-primary-200';
	const formatPlayerLabel = player => {
		const ranking = player.rank ? ` #${player.rank}` : '';
		return `${player.name} (${player.country})${ranking}`;
	};

	return (
		<div className='flex items-center gap-2 bg-transparent'>
			<Flag className={flagClassName} country={playerA.country}></Flag>
			<Link to={`/player/${playerA.id}`}>{formatPlayerLabel(playerA)}</Link>
			<span>vs</span>
			<Flag className={flagClassName} country={playerB.country}></Flag>
			<Link to={`/player/${playerB.id}`}>{formatPlayerLabel(playerB)}</Link>
			{playerA?.id && playerB?.id ? (
				<Link
					to={`/head-to-head/${playerA.id}/${playerB.id}`}
					className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-primary-900 dark:text-primary-100'
					aria-label={`Jämför ${playerA.name} mot ${playerB.name}`}
					title='Jämför spelare'
				>
					<TriangleRightIcon className='block h-full w-full' />
				</Link>
			) : null}
		</div>
	);
}

function LiveTable({ rows, finished = false }) {
	return (
		<Table rows={rows}>
			<Table.Column id='name'>
				<Table.Title>Turnering</Table.Title>
				<Table.Cell>{({ row, value }) => <Link to={`/event/${row.event}`}>{value}</Link>}</Table.Cell>
			</Table.Column>

			<Table.Column>
				<Table.Title>Spelare</Table.Title>
				<Table.Value>{({ row }) => <PlayersCell playerA={row.player} playerB={row.opponent} />}</Table.Value>
			</Table.Column>

			<Table.Column id='headToHead'>
				<Table.Title>Tidigare möten</Table.Title>
				<Table.Cell className='text-right'>{({ value }) => value ?? '0-0'}</Table.Cell>
			</Table.Column>

			<Table.Column id='odds'>
				<Table.Title>Odds</Table.Title>
				<Table.Cell className='text-right'>{({ value }) => value ?? '-'}</Table.Cell>
			</Table.Column>

			<Table.Column id='score'>
				<Table.Title>{finished ? 'Resultat' : 'Ställning'}</Table.Title>
				<Table.Cell>{({ value }) => value}</Table.Cell>
			</Table.Column>
		</Table>
	);
}

function EmptyMatchesState() {
	return (
		<div className='flex flex-col items-center justify-center py-12 text-center'>
			<div className='text-8xl'>😢</div>
			<div className='mt-4 text-xl text-primary-700 dark:text-primary-300'>Inga matcher idag</div>
		</div>
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

function buildHeadToHeadQuery(matches) {
	const pairIds = matches
		.map(match => [match.player?.id, match.opponent?.id].filter(Boolean).sort())
		.filter(pair => pair.length === 2);
	const uniquePairs = [...new Map(pairIds.map(pair => [`${pair[0]}:${pair[1]}`, pair])).values()];

	if (uniquePairs.length === 0) {
		return {
			sql: `
				SELECT
					LEAST(winner_id, loser_id) AS player_a_id,
					GREATEST(winner_id, loser_id) AS player_b_id,
					SUM(winner_id = LEAST(winner_id, loser_id)) AS wins_for_player_a,
					SUM(winner_id = GREATEST(winner_id, loser_id)) AS wins_for_player_b
				FROM flatly
				WHERE 1 = 0
				GROUP BY LEAST(winner_id, loser_id), GREATEST(winner_id, loser_id)
			`,
			format: []
		};
	}

	const whereClauses = uniquePairs
		.map(() => '((winner_id = ? AND loser_id = ?) OR (winner_id = ? AND loser_id = ?))')
		.join(' OR ');
	const format = uniquePairs.flatMap(([playerAId, playerBId]) => [playerAId, playerBId, playerBId, playerAId]);

	return {
		sql: `
			SELECT
				LEAST(winner_id, loser_id) AS player_a_id,
				GREATEST(winner_id, loser_id) AS player_b_id,
				SUM(winner_id = LEAST(winner_id, loser_id)) AS wins_for_player_a,
				SUM(winner_id = GREATEST(winner_id, loser_id)) AS wins_for_player_b
			FROM flatly
			WHERE ${whereClauses}
			GROUP BY LEAST(winner_id, loser_id), GREATEST(winner_id, loser_id)
		`,
		format
	};
}

function Component() {
	const { data: matches, error, dataUpdatedAt, isFetching } = useRequest({
		path: 'live',
		method: 'GET',
		cache: 0,
		refetchInterval: LIVE_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: true
	});
	const { data: oddsByPlayers = {}, error: oddsError } = useQuery({
		queryKey: LIVE_ODDSET_QUERY_KEY,
		queryFn: fetchLiveOddsetOddsByPlayers,
		refetchInterval: LIVE_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: true,
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

	if (error) {
		return (
			<Page>
				<Page.Menu />
				<Page.Content>
					<Page.Error>Misslyckades med att läsa in dagens matcher - {error.message}</Page.Error>
				</Page.Content>
			</Page>
		);
	}

	if (!matches) {
		return (
			<Page>
				<Page.Menu />
				<Page.Content>
					<Page.Loading>Läser in dagens matcher...</Page.Loading>
				</Page.Content>
			</Page>
		);
	}

	if (rankError) {
		return (
			<Page>
				<Page.Menu />
				<Page.Content>
					<Page.Error>Misslyckades med att läsa in ranking - {rankError.message}</Page.Error>
				</Page.Content>
			</Page>
		);
	}

	if (meetingError) {
		return (
			<Page>
				<Page.Menu />
				<Page.Content>
					<Page.Error>Misslyckades med att läsa in head-to-head - {meetingError.message}</Page.Error>
				</Page.Content>
			</Page>
		);
	}

	if (!rankingRows) {
		return (
			<Page>
				<Page.Menu />
				<Page.Content>
					<Page.Loading>Läser in ranking...</Page.Loading>
				</Page.Content>
			</Page>
		);
	}

	if (!meetingRows) {
		return (
			<Page>
				<Page.Menu />
				<Page.Content>
					<Page.Loading>Läser in head-to-head...</Page.Loading>
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

	const rows = matches.map(match => {
		const player = {
			...match.player,
			rank: ranksByPlayerId[match.player?.id]
		};
		const opponent = {
			...match.opponent,
			rank: ranksByPlayerId[match.opponent?.id]
		};
		const pairKey = [match.player?.id, match.opponent?.id].filter(Boolean).sort().join(':');
		const record = headToHeadByPair[pairKey];
		const playerWins = record?.[match.player?.id] ?? 0;
		const opponentWins = record?.[match.opponent?.id] ?? 0;

		return {
			...match,
			player,
			opponent,
			odds: formatLiveOddsetOddsForMatch(match, oddsByPlayers),
			headToHead: `${playerWins}-${opponentWins}`
		};
	});

	const { activeMatches, finishedMatches } = splitMatchesByStatus(rows);
	const hasNoMatches = activeMatches.length === 0 && finishedMatches.length === 0;

	return (
		<Page>
			<Page.Menu />
			<Page.Content>
				<Page.Title>Dagens matcher</Page.Title>
				<Page.Container>
					{oddsError ? <div className='pb-3 text-sm text-primary-700 dark:text-primary-300'>Kunde inte läsa odds just nu.</div> : null}

					{hasNoMatches ? <EmptyMatchesState /> : null}

					{activeMatches.length > 0 ? (
						<>
							<Page.Title level={2}>Pågående</Page.Title>
							<LiveTable rows={activeMatches} finished={false} />
							<div className='flex justify-center pt-4'>
								<Button link='/live-matches'>Visa live</Button>
							</div>
						</>
					) : null}

					{finishedMatches.length > 0 ? (
						<>
							<Page.Title level={2}>Nyligen avslutade</Page.Title>
							<LiveTable rows={finishedMatches} finished={true} />
						</>
					) : null}

					<Countdown
						dataUpdatedAt={dataUpdatedAt}
						isFetching={isFetching}
						intervalMs={LIVE_REFRESH_INTERVAL_MS}
						labelUpdating='Uppdaterar live-sidan'
					/>
				</Page.Container>
			</Page.Content>
		</Page>
	);
}

export default Component;
