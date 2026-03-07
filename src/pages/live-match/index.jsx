import React from 'react';
import { useParams } from 'react-router';

import BarChartIcon from '../../assets/radix-icons/bar-chart.svg?react';
import EnterFullScreenIcon from '../../assets/radix-icons/enter-full-screen.svg?react';
import ExitFullScreenIcon from '../../assets/radix-icons/exit-full-screen.svg?react';
import Avatar from '../../components/avatar';
import Page from '../../components/page';
import Flag from '../../components/flag';
import Link from '../../components/ui/link';
import Table from '../../components/ui/table';
import { useRequest, useSQL } from '../../js/vitel.js';

function Component() {
	const [showChrome, setShowChrome] = React.useState(true);

	function PlayerCell({ player }) {
		const avatarSrc = `https://www.atptour.com/-/media/alias/player-headshot/${player.id}`;
		const rankLabel = player.rank != null ? `#${player.rank}` : null;
		const playerLink = `/player/${player.id}`;

		return (
			<div className='flex h-full flex-col items-center justify-center gap-4'>
				<Avatar src={avatarSrc} className='h-16 w-16 border-2 border-primary-700 bg-primary-900 shadow-sm md:h-20 md:w-20 dark:border-primary-300' />
				<div className='flex flex-col items-center gap-1'>
					<div className='text-center text-base font-semibold text-primary-900 md:text-lg dark:text-primary-100'>
						<Link to={playerLink}>{player.name}</Link>
					</div>
					<div className='flex items-center justify-center gap-2 text-sm text-primary-700 dark:text-primary-300'>
						<Flag className='h-5! w-5! border-current' country={player.country} />
						<span>{player.country}</span>
						{rankLabel ? <span>{rankLabel}</span> : null}
					</div>
				</div>
			</div>
		);
	}

	function ScoreCell({ score, winner, server, comment, compareLink, showChrome, onToggleChrome }) {
		function parseScore() {
			const match = score.match(/\[(.+)\]\s*$/);
			const gameScore = match ? match[1] : score;
			const setsSummary = match ? score.slice(0, match.index).trim() : '';

			return { gameScore, setsSummary, hasLiveGameScore: Boolean(match) };
		}
		const { gameScore, setsSummary, hasLiveGameScore } = parseScore();

		function singleLineFontSize(text, { min = 0.65, max = 3.75, targetWidthRem = 12.0, charWidth = 0.62 } = {}) {
			const length = Math.max(1, String(text ?? '').replace(/\s+/g, ' ').trim().length);
			const rem = targetWidthRem / (length * charWidth);
			const clamped = Math.max(min, Math.min(max, rem));

			return `${clamped.toFixed(3)}rem`;
		}

		const gameScoreSize = singleLineFontSize(gameScore, {
			min: 0.65,
			max: winner ? 2.8 : 3.75,
			targetWidthRem: 12.0,
			charWidth: 0.62
		});
		const scoreFontFamily = "'Bebas Neue', 'Oswald', 'Roboto Condensed', 'Arial Narrow', sans-serif";
		const setsSummarySize = setsSummary
			? singleLineFontSize(setsSummary, {
				min: 0.6,
				max: 2.1,
				targetWidthRem: 12.0,
				charWidth: 0.58
			})
			: null;

		return (
			<div className='relative flex flex-col items-center'>
				<div className='relative flex w-full max-w-full flex-col items-center justify-center overflow-hidden rounded-sm border border-primary-300 bg-primary-50 px-3 py-8 text-center shadow-sm sm:px-6 sm:py-10 dark:border-primary-600 dark:bg-primary-900'>
						<div className='absolute top-3 right-3 flex items-center gap-2'>
							{compareLink ? (
								<Link
									to={compareLink}
									className='flex h-8 w-8 items-center justify-center rounded-sm border border-primary-300 text-primary-500 transition-colors hover:bg-primary-100 hover:text-primary-700 dark:border-primary-500 dark:text-primary-300 dark:hover:bg-primary-800 dark:hover:text-primary-100'
									aria-label='Jämför spelare'
									title='Jämför spelare'
								>
									<BarChartIcon className='h-4 w-4 bg-transparent' />
								</Link>
							) : null}
							<button
								type='button'
								onClick={onToggleChrome}
								className='flex h-8 w-8 items-center justify-center rounded-sm border border-primary-300 text-primary-500 transition-colors hover:bg-primary-100 hover:text-primary-700 dark:border-primary-500 dark:text-primary-300 dark:hover:bg-primary-800 dark:hover:text-primary-100'
								aria-label={showChrome ? 'Dölj gränssnitt' : 'Visa gränssnitt'}
								title={showChrome ? 'Dölj gränssnitt' : 'Visa gränssnitt'}
							>
								{showChrome ? <ExitFullScreenIcon className='h-4 w-4 bg-transparent' /> : <EnterFullScreenIcon className='h-4 w-4 bg-transparent' />}
							</button>
						</div>
					<div className='text-xs font-semibold uppercase tracking-[0.3em] text-primary-500 dark:text-primary-300'>{winner ? 'Resultat' : 'Ställning'}</div>
					<div className='mt-4 flex w-full max-w-full items-center justify-center gap-2 sm:gap-4'>
						<span className='flex h-4 w-4 items-center justify-center'>
							{!winner && server === 'player' ? <span className='text-lg leading-none'>🎾</span> : null}
						</span>
						<div
							className='max-w-full whitespace-nowrap leading-none font-semibold tracking-[0.04em] text-primary-900 dark:text-primary-50'
							style={{
								fontSize: gameScoreSize,
								fontFamily: scoreFontFamily
							}}
						>
							{gameScore}
						</div>
						<span className='flex h-4 w-4 items-center justify-center'>
							{!winner && server === 'opponent' ? <span className='text-lg leading-none'>🎾</span> : null}
						</span>
					</div>
					{setsSummary ? (
						<div
							className='mt-4 max-w-full whitespace-nowrap font-medium tracking-[0.08em] text-primary-600 dark:text-primary-300'
							style={{
								fontSize: setsSummarySize,
								fontFamily: scoreFontFamily
							}}
						>
							{setsSummary}
						</div>
					) : null}
				</div>
				{comment ? (
					<div className='absolute top-full mt-2 w-full text-center text-sm italic text-primary-600 dark:text-primary-300'>
						{comment}
					</div>
				) : null}
			</div>
		);
	}

	function fetch(refetchInterval = 5 * 1000) {
		const params = useParams();

		if (!params.A || !params.B) {
			return {
				data: null,
				error: new Error(`Spelarna hittades inte (${params.A ?? '-'}, ${params.B ?? '-'})`)
			};
		}

		const { data: matches, error: liveError } = useRequest({
			path: 'live',
			method: 'GET',
			cache: 0,
			refetchInterval,
			refetchIntervalInBackground: true
		});

		if (liveError) {
			return {
				data: null,
				error: new Error(`Misslyckades med att läsa in live-match - ${liveError.message}`)
			};
		}

		const playerSql = 'SELECT * FROM players WHERE id = ?; SELECT * FROM players WHERE id = ?;';

		const { data: players, error: playerError } = useSQL({
			sql: playerSql,
			format: [params.A, params.B],
			cache: 0,
			refetchInterval,
			refetchIntervalInBackground: true
		});

		if (playerError) {
			return {
				data: null,
				error: new Error(`Misslyckades med att läsa in spelare - ${playerError.message}`)
			};
		}

		if (!matches || !players) {
			return {
				data: null,
				error: null
			};
		}

		const match = matches.find(match => match.player?.id === params.A && match.opponent?.id === params.B) ?? null;

		if (!match) {
			return {
				data: null,
				error: new Error(`Matchen hittades inte bland live-matcherna (${params.A}, ${params.B})`)
			};
		}

		const data = {
			event: match.name,
			score: match.score,
			comment: match.comment ?? null,
			server: match.server ?? null,
			winner: match.winner,
			playerA: players?.[0]?.[0],
			playerB: players?.[1]?.[0]
		};

		if (!data?.playerA || !data?.playerB) {
			return {
				data: null,
				error: new Error(`Spelarna hittades inte (${params.A}, ${params.B})`)
			};
		}

		return {
			data,
			error: null
		};
	}

	function Content() {
		let { data, error } = fetch();

		if (data == null && error == null) {
			return <Page.Loading>Läser in match...</Page.Loading>;
		}

		if (error) {
			return <Page.Error>{error.message}</Page.Error>;
		}

		let match = data;
		return (
			<div className='flex flex-1 flex-col'>
				{showChrome ? <Page.Title>{match.event}</Page.Title> : null}

				<div className={`${showChrome ? 'mt-4' : 'mt-0'} flex flex-1 flex-col rounded-sm border border-primary-200 bg-primary-50 p-4 shadow-sm dark:border-primary-700 dark:bg-primary-900`}>
					<div className='flex flex-1 overflow-x-auto'>
						<Table className='h-full w-full table-fixed border-separate border-spacing-0'>
							<colgroup>
								<col className='w-[7.5rem] sm:w-44 md:w-64' />
								<col />
								<col className='w-[7.5rem] sm:w-44 md:w-64' />
							</colgroup>

							<Table.Body className='h-full'>
								<Table.Row className='h-full align-middle'>
									<Table.Cell className='pr-4 py-4 align-middle'>
										<PlayerCell player={match.playerA} />
									</Table.Cell>

									<Table.Cell className='px-2 py-4 align-middle'>
										<ScoreCell
											score={match.score}
											winner={match.winner}
											server={match.server}
											comment={match.comment}
											compareLink={`/head-to-head/${match.playerA.id}/${match.playerB.id}/`}
											showChrome={showChrome}
											onToggleChrome={() => setShowChrome(visible => !visible)}
										/>
									</Table.Cell>

									<Table.Cell className='pl-4 py-4 align-middle'>
										<PlayerCell player={match.playerB} />
									</Table.Cell>
								</Table.Row>
							</Table.Body>
						</Table>
					</div>
				</div>
			</div>
		);
	}

	return (
		<Page id='live-match-page'>
			{showChrome ? <Page.Menu /> : null}
			<Page.Content className={`flex flex-col ${showChrome ? '' : 'px-1 py-1 lg:px-2'}`}>
				<Content />
			</Page.Content>
		</Page>
	);
}

export default Component;
