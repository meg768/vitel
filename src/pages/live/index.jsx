import React from 'react';
import { useQuery } from '@tanstack/react-query';

import TriangleRightIcon from '../../assets/radix-icons/triangle-right.svg?react';
import Flag from '../../components/flag';
import Page from '../../components/page';
import RefreshCountdown from '../../components/refresh-countdown';
import Button from '../../components/ui/button';
import Table from '../../components/ui/data-table';
import Link from '../../components/ui/link';
import { LIVE_ODDSET_QUERY_KEY, fetchLiveOddsetOddsByPlayers, formatLiveOddsetOddsForMatch } from '../../js/live-oddset.js';
import { useRequest, useSQL } from '../../js/vitel.js';
const LIVE_REFRESH_INTERVAL_MS = 30 * 1000;


function LiveTable({ rows, finished = false }) {
	function Players({ playerA, playerB }) {
		let flagClassName = 'w-5! h-5! border-primary-800 dark:border-primary-200';
		const formatPlayerLabel = player => {
			const ranking = player.rank ? ` #${player.rank}` : '';

			return `${player.name} (${player.country})${ranking}`;
		};

		return (
			<div className='flex items-center gap-2 bg-transparent'>
				<Flag className={flagClassName} country={playerA.country}></Flag>
				<Link to={`/player/${playerA.id}`}>{formatPlayerLabel(playerA)}</Link>
				<span>{' vs '}</span>
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

	function Content() {
		return (
			<Table rows={rows} className=''>
				<Table.Column id='name' className=''>
					<Table.Title className=''>Turnering</Table.Title>

					<Table.Cell className=''>
						{({ row, value }) => {
							return <Link to={`/event/${row.event}`}>{value}</Link>;
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column className=''>
					<Table.Title className=''>Spelare</Table.Title>
					<Table.Value className=''>
						{({ row }) => {
							return <Players playerA={row.player} playerB={row.opponent} />;
						}}
					</Table.Value>
				</Table.Column>

				<Table.Column id='headToHead' className=''>
					<Table.Title className=''>Tidigare möten</Table.Title>
					<Table.Cell className='text-right'>
						{({ value }) => {
							return value ?? '0-0';
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='odds' className=''>
					<Table.Title className=''>Odds</Table.Title>
					<Table.Cell className='text-right'>{({ value }) => value ?? '-'}</Table.Cell>
				</Table.Column>

				<Table.Column id='score' className=''>
					<Table.Title className=''>{finished ? 'Resultat' : 'Ställning'}</Table.Title>
					<Table.Cell>{({ value }) => value}</Table.Cell>
				</Table.Column>

				</Table>
			);
		}

	return <Content />;
}

let Component = () => {
	// This component fetches and displays live ATP matches.
	// It uses the ATP service to get the matches and displays them in a table format.
	// It also splits the matches into active and finished matches.
	// Active matches include direct links to the live match monitor.

	function FinishedMatches({ matches }) {
		if (matches.length == 0) {
			return;
		}

		return (
			<>
				<Page.Title level={2}>Nyligen avslutade</Page.Title>
				<LiveTable rows={matches} finished={true} />
			</>
		);
	}

	function ActiveMatches({ matches }) {
		if (matches.length == 0) {
			return;
		}

		return (
			<>
				<Page.Title level={2}>Pågående</Page.Title>
				<LiveTable rows={matches} finished={false} />
				<div className='pt-4 flex justify-center'>
					<Button link='/live-matches'>Visa live</Button>
				</div>
			</>
		);
	}

	function Matches({ matches }) {
		let finishedMatches = [];
		let activeMatches = [];

		// Split up into finished and unfinished matches
		for (let row of matches) {
			if (row.winner) {
				finishedMatches.push(row);
			} else {
				activeMatches.push(row);
			}
		}

		if (activeMatches.length === 0 && finishedMatches.length === 0) {
			return (
				<div className='flex flex-col items-center justify-center text-center py-12'>
					<div className='text-8xl'>😢</div>
					<div className='mt-4 text-xl text-primary-700 dark:text-primary-300'>Inga matcher idag</div>
				</div>
			);
		}

		return (
			<>
				<ActiveMatches matches={activeMatches} />
				<FinishedMatches matches={finishedMatches} />
			</>
		);
	}

	function Content() {
		let { data: matches, error, dataUpdatedAt, isFetching } = useRequest({
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
			refetchInterval: LIVE_REFRESH_INTERVAL_MS,
			refetchIntervalInBackground: true,
			retry: 0
		});
		const rankingSql = `SELECT id FROM players WHERE rank IS NOT NULL ORDER BY rank ASC, name ASC`;
		const { data: rankingRows, error: rankError } = useSQL({ sql: rankingSql, cache: 5 * 60 * 1000 });
		const pairs = matches
			? [...new Map(matches
				.map(match => [match.player?.id, match.opponent?.id].filter(Boolean).sort())
				.filter(pair => pair.length === 2)
				.map(pair => [`${pair[0]}:${pair[1]}`, pair])
			).values()]
			: [];
		const meetingsWhere = pairs.length
			? pairs.map(() => '((winner_id = ? AND loser_id = ?) OR (winner_id = ? AND loser_id = ?))').join(' OR ')
			: '1 = 0';
		const meetingsFormat = pairs.flatMap(([A, B]) => [A, B, B, A]);
		const meetingsSql = `
			SELECT
				LEAST(winner_id, loser_id) AS player_a_id,
				GREATEST(winner_id, loser_id) AS player_b_id,
				SUM(winner_id = LEAST(winner_id, loser_id)) AS wins_for_player_a,
				SUM(winner_id = GREATEST(winner_id, loser_id)) AS wins_for_player_b
			FROM flatly
			WHERE ${meetingsWhere}
			GROUP BY LEAST(winner_id, loser_id), GREATEST(winner_id, loser_id)
		`;
		const { data: meetingRows, error: meetingError } = useSQL({
			sql: meetingsSql,
			format: meetingsFormat,
			cache: 0,
			refetchInterval: LIVE_REFRESH_INTERVAL_MS,
			refetchIntervalInBackground: true
		});
		const ranks = Object.fromEntries((rankingRows ?? []).map((player, index) => [player.id, index + 1]));

		if (error) {
			return <Page.Error>Misslyckades med att läsa in dagens matcher - {error.message}</Page.Error>;
		}

		if (!matches) {
			return <Page.Loading>Läser in dagens matcher...</Page.Loading>;
		}

		if (rankError) {
			return <Page.Error>Misslyckades med att läsa in ranking - {rankError.message}</Page.Error>;
		}

		if (meetingError) {
			return <Page.Error>Misslyckades med att läsa in head-to-head - {meetingError.message}</Page.Error>;
		}

		if (!rankingRows) {
			return <Page.Loading>Läser in ranking...</Page.Loading>;
		}

		if (!meetingRows) {
			return <Page.Loading>Läser in head-to-head...</Page.Loading>;
		}

		const headToHead = Object.fromEntries(
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
				rank: ranks[match.player?.id]
			};
			const opponent = {
				...match.opponent,
				rank: ranks[match.opponent?.id]
			};
			return {
				...match,
				player,
				opponent,
				odds: formatLiveOddsetOddsForMatch(match, oddsByPlayers),
				headToHead: (() => {
					const key = [match.player?.id, match.opponent?.id].filter(Boolean).sort().join(':');
				const record = headToHead[key];
				const playerWins = record?.[match.player?.id] ?? 0;
				const opponentWins = record?.[match.opponent?.id] ?? 0;

				return `${playerWins}-${opponentWins}`;
				})()
			};
		});

			return (
				<>
					<Page.Title>{`Dagens matcher`}</Page.Title>
					<Page.Container>
						{oddsError ? <div className='pb-3 text-sm text-primary-700 dark:text-primary-300'>Kunde inte läsa odds just nu.</div> : null}
						<Matches matches={rows} />
						<RefreshCountdown
							dataUpdatedAt={dataUpdatedAt}
							isFetching={isFetching}
							intervalMs={LIVE_REFRESH_INTERVAL_MS}
							labelUpdating='Uppdaterar live-sidan'
						/>
					</Page.Container>
				</>
			);
	}

	return (
		<Page>
			<Page.Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
};

export default Component;
