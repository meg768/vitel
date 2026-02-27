import React from 'react';
import { Link as RouterLink } from 'react-router';

import ChevronRightIcon from '../../assets/radix-icons/chevron-right.svg?react';
import Flag from '../../components/flag';
import Page from '../../components/page';
import Button from '../../components/ui/button';
import Table from '../../components/ui/data-table';
import Link from '../../components/ui/link';
import { useRequest, useSQL } from '../../js/vitel.js';

const LIVE_REFRESH_INTERVAL_MS = 60 * 1000;
const LIVE_REFRESH_STEPS = 6;

function RefreshCountdown({ dataUpdatedAt, isFetching }) {
	const [now, setNow] = React.useState(Date.now());

	React.useEffect(() => {
		const timer = window.setInterval(() => {
			setNow(Date.now());
		}, 1000);

		return () => window.clearInterval(timer);
	}, []);

	const remainingMs = dataUpdatedAt
		? Math.max(0, LIVE_REFRESH_INTERVAL_MS - (now - dataUpdatedAt))
		: LIVE_REFRESH_INTERVAL_MS;
	const elapsedMs = LIVE_REFRESH_INTERVAL_MS - remainingMs;
	const filledSteps = isFetching
		? LIVE_REFRESH_STEPS
		: Math.min(LIVE_REFRESH_STEPS, Math.floor(elapsedMs / (LIVE_REFRESH_INTERVAL_MS / LIVE_REFRESH_STEPS)));
	const label = isFetching
		? 'Uppdaterar live-sidan'
		: `Nästa uppdatering inom ${Math.ceil(remainingMs / 1000)} sekunder`;

	return (
		<div className='flex justify-center pt-4 pb-2' aria-label={label} title={label}>
			<div className='flex items-center gap-2'>
				{Array.from({ length: LIVE_REFRESH_STEPS }, (_, index) => {
					const filled = index < filledSteps;

					return (
						<span
							key={index}
							className={[
								'h-2.5 w-2.5 rounded-full border border-primary-500 transition-colors duration-500',
								filled
									? 'bg-primary-600 dark:bg-primary-300'
									: 'bg-transparent dark:bg-transparent'
							].join(' ')}
						></span>
					);
				})}
			</div>
		</div>
	);
}


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
					<Table.Title className=''>Tidigare matcher</Table.Title>
					<Table.Cell className='text-right'>
						{({ value }) => {
							return value ?? '0-0';
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='score' className=''>
					<Table.Title className=''>{finished ? 'Resultat' : 'Ställning'}</Table.Title>
					<Table.Cell>{({ value }) => value}</Table.Cell>
				</Table.Column>

				<Table.Column className='justify-center'>
					<Table.Title className=''>♨︎</Table.Title>
					<Table.Cell className=''>
						{({ row, value }) => {
							return (
								<Link to={`/head-to-head/${row.player.id}/${row.opponent.id}`}>
									<ChevronRightIcon className='block m-auto' />
								</Link>
							);
						}}
					</Table.Cell>
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
	// Active matches are displayed with a link to TV4-Play and max.com for viewing.

	function FinishedMatches({ matches }) {
		if (matches.length == 0) {
			return;
		}

		return (
			<>
				<Page.Title level={2}>Avslutade</Page.Title>
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

				<div className='flex justify-center pt-4 gap-4'>
					<Button>
						<RouterLink to={'https://www.tv4play.se/kategorier/atp-tour'} target={'_blank'} className=''>
							Se på TV4-Play
						</RouterLink>
					</Button>
					<Button>
						<RouterLink to={'https://play.max.com/sports/tennis'} target={'_blank'} className=''>
							Se på max.com
						</RouterLink>
					</Button>
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

		const ranks = Object.fromEntries(rankingRows.map((player, index) => [player.id, index + 1]));
		const headToHead = Object.fromEntries(
			meetingRows.map(row => [
				`${row.player_a_id}:${row.player_b_id}`,
				{
					[row.player_a_id]: row.wins_for_player_a,
					[row.player_b_id]: row.wins_for_player_b
				}
			])
		);
		const rows = matches.map(match => ({
			...match,
			player: {
				...match.player,
				rank: ranks[match.player?.id]
			},
			opponent: {
				...match.opponent,
				rank: ranks[match.opponent?.id]
			},
			headToHead: (() => {
				const key = [match.player?.id, match.opponent?.id].filter(Boolean).sort().join(':');
				const record = headToHead[key];
				const playerWins = record?.[match.player?.id] ?? 0;
				const opponentWins = record?.[match.opponent?.id] ?? 0;

				return `${playerWins}-${opponentWins}`;
			})()
		}));

		return (
			<>
				<Page.Title>{`Dagens matcher`}</Page.Title>
				<Page.Container>
					<Matches matches={rows} />
					<RefreshCountdown dataUpdatedAt={dataUpdatedAt} isFetching={isFetching} />
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
