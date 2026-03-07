import clsx from 'clsx';
import React from 'react';

import BarChartIcon from '../assets/radix-icons/bar-chart.svg?react';
import EnterFullScreenIcon from '../assets/radix-icons/enter-full-screen.svg?react';
import ExitFullScreenIcon from '../assets/radix-icons/exit-full-screen.svg?react';
import Avatar from './avatar';
import Flag from './flag';
import Link from './ui/link';
import Table from './ui/table';

const SCORE_FONT_FAMILY = "'Bebas Neue', 'Oswald', 'Roboto Condensed', 'Arial Narrow', sans-serif";

function singleLineFontSize(text, { min = 0.65, max = 3.75, targetWidthRem = 12.0, charWidth = 0.62 } = {}) {
	const length = Math.max(1, String(text ?? '').replace(/\s+/g, ' ').trim().length);
	const rem = targetWidthRem / (length * charWidth);
	const clamped = Math.max(min, Math.min(max, rem));

	return `${clamped.toFixed(3)}rem`;
}

function getSetTokens(scorePart) {
	if (!scorePart) {
		return [];
	}

	return scorePart
		.split(' ')
		.filter(token => token && !token.startsWith('['))
		.filter(token => /^\d+-\d+(\(\d+\))?$/.test(token));
}

function isCompletedSetToken(token) {
	const normalized = token.replace(/\(\d+\)$/, '');
	const [aRaw, bRaw] = normalized.split('-');
	const a = Number(aRaw);
	const b = Number(bRaw);

	if (!Number.isFinite(a) || !Number.isFinite(b)) {
		return false;
	}

	const diff = Math.abs(a - b);

	// Standard completed-set rule plus explicit tie-break finals (7-6 / 6-7).
	return (Math.max(a, b) >= 6 && diff >= 2) || ((a === 7 && b === 6) || (a === 6 && b === 7));
}

function PlayerCell({ player, compact = false }) {
	const avatarSrc = `https://www.atptour.com/-/media/alias/player-headshot/${player.id}`;
	const rankLabel = player.rank != null ? `#${player.rank}` : null;
	const playerLink = `/player/${player.id}`;

	return (
		<div className={clsx('flex h-full flex-col items-center justify-center', compact ? 'gap-2' : 'gap-4')}>
			<Avatar
				src={avatarSrc}
				className={clsx(
					'border-2 border-primary-700 bg-primary-900 shadow-sm dark:border-primary-300',
					compact ? 'h-10 w-10 md:h-12 md:w-12' : 'h-16 w-16 md:h-20 md:w-20'
				)}
			/>
			<div className='flex flex-col items-center gap-1'>
				<div className={clsx('text-center font-semibold text-primary-900 dark:text-primary-100', compact ? 'text-sm md:text-base' : 'text-base md:text-lg')}>
					<Link to={playerLink}>{player.name}</Link>
				</div>
				<div className={clsx('flex items-center justify-center gap-2 text-primary-700 dark:text-primary-300', compact ? 'text-xs' : 'text-sm')}>
					<Flag className='h-5! w-5! border-current' country={player.country} />
					<span>{player.country}</span>
					{rankLabel ? <span>{rankLabel}</span> : null}
				</div>
			</div>
		</div>
	);
}

function ScoreCell({ score, winner, server, comment, compact = false }) {
	const scoreValue = String(score ?? '');

	function parseScore() {
		const match = scoreValue.match(/\[(.+)\]\s*$/);
		const gameScore = match ? match[1] : scoreValue;
		const setsSummaryRaw = match ? scoreValue.slice(0, match.index).trim() : '';
		const hasCompletedSet = getSetTokens(setsSummaryRaw).some(isCompletedSetToken);
		const setsSummary = hasCompletedSet ? setsSummaryRaw : '';

		return { gameScore, setsSummary };
	}

	const { gameScore, setsSummary } = parseScore();
	const gameScoreSize = singleLineFontSize(gameScore, {
		min: 0.65,
		max: winner ? 2.8 : 3.75,
		targetWidthRem: 12.0,
		charWidth: 0.62
	});
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
			<div
				className={clsx(
					'relative flex w-full max-w-full flex-col items-center justify-center overflow-hidden rounded-sm border border-primary-300 bg-primary-50 text-center shadow-sm dark:border-primary-600 dark:bg-primary-900',
					compact ? 'h-[11rem] px-2 py-4 sm:px-3 sm:py-5' : 'h-[14rem] px-3 py-6 sm:px-6 sm:py-8'
				)}
			>
				<div className='absolute top-3 left-1/2 -translate-x-1/2 flex h-8 items-center text-xs font-semibold uppercase tracking-[0.3em] text-primary-500 dark:text-primary-300'>STÄLLNING</div>
				<div className='absolute left-0 right-0 top-1/2 -translate-y-1/2'>
					<div className='flex w-full max-w-full items-center justify-center gap-2 sm:gap-4'>
						<span className='flex h-4 w-4 items-center justify-center'>
							{!winner && server === 'player' ? <span className='text-lg leading-none'>🎾</span> : null}
						</span>
						<div
							className='max-w-full whitespace-nowrap leading-none font-semibold tracking-[0.04em] text-primary-900 dark:text-primary-50'
							style={{
								fontSize: gameScoreSize,
								fontFamily: SCORE_FONT_FAMILY
							}}
						>
							{gameScore}
						</div>
						<span className='flex h-4 w-4 items-center justify-center'>
							{!winner && server === 'opponent' ? <span className='text-lg leading-none'>🎾</span> : null}
						</span>
					</div>
				</div>
				{setsSummary ? (
					<div
						className={clsx('absolute left-1/2 -translate-x-1/2 max-w-full whitespace-nowrap font-medium tracking-[0.08em] text-primary-600 dark:text-primary-300', compact ? 'bottom-2' : 'bottom-3')}
						style={{
							fontSize: setsSummarySize,
							fontFamily: SCORE_FONT_FAMILY
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

function LiveMatchMonitor({
	match,
	className,
	defaultShowChrome = true,
	compact = false,
	isFocused = false,
	onToggleFocus = null,
	showFocusToggle = true
}) {
	const showChrome = defaultShowChrome;

	if (!match?.player || !match?.opponent) {
		return null;
	}

	const compareLink = `/head-to-head/${match.player.id}/${match.opponent.id}`;

	return (
		<div className={clsx('relative flex flex-1 flex-col rounded-sm border border-primary-200 bg-primary-50 p-4 shadow-sm dark:border-primary-700 dark:bg-primary-900', className)}>
			<div className='absolute top-3 right-3 z-10 flex items-center gap-2'>
				{compareLink ? (
					<Link
						to={compareLink}
						className='flex h-8 w-8 items-center justify-center rounded-sm border border-primary-300 bg-primary-50 text-primary-500 transition-colors hover:bg-primary-100 hover:text-primary-700 dark:border-primary-500 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800 dark:hover:text-primary-100'
						aria-label='Jämför spelare'
						title='Jämför spelare'
					>
						<BarChartIcon className='h-4 w-4 bg-transparent' />
					</Link>
				) : null}
				{showFocusToggle ? (
					<button
						type='button'
						onClick={onToggleFocus}
						className='flex h-8 w-8 items-center justify-center rounded-sm border border-primary-300 bg-primary-50 text-primary-500 transition-colors hover:bg-primary-100 hover:text-primary-700 dark:border-primary-500 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800 dark:hover:text-primary-100'
						aria-label={isFocused ? 'Minimera match' : 'Maximera match'}
						title={isFocused ? 'Minimera match' : 'Maximera match'}
					>
						{isFocused ? <ExitFullScreenIcon className='h-4 w-4 bg-transparent' /> : <EnterFullScreenIcon className='h-4 w-4 bg-transparent' />}
					</button>
				) : null}
			</div>
			{showChrome ? <div className='mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-primary-600 dark:text-primary-300'>{match.event}</div> : null}

			<div className='flex flex-1 overflow-x-auto'>
				<Table className='h-full w-full table-fixed border-separate border-spacing-0'>
					<colgroup>
						<col className={compact ? 'w-[4.75rem] sm:w-28 md:w-36' : 'w-[7.5rem] sm:w-44 md:w-64'} />
						<col />
						<col className={compact ? 'w-[4.75rem] sm:w-28 md:w-36' : 'w-[7.5rem] sm:w-44 md:w-64'} />
					</colgroup>

					<Table.Body className='h-full'>
						<Table.Row className='h-full align-middle'>
							<Table.Cell className={clsx('align-middle', compact ? 'pr-2 py-2' : 'pr-4 py-4')}>
								<PlayerCell player={match.player} compact={compact} />
							</Table.Cell>

							<Table.Cell className={clsx('px-2 align-middle', compact ? 'py-2' : 'py-4')}>
								<ScoreCell
									score={match.score}
									winner={match.winner}
									server={match.server}
									comment={match.comment}
									compact={compact}
								/>
							</Table.Cell>

							<Table.Cell className={clsx('align-middle', compact ? 'pl-2 py-2' : 'pl-4 py-4')}>
								<PlayerCell player={match.opponent} compact={compact} />
							</Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table>
			</div>
		</div>
	);
}

export default LiveMatchMonitor;
