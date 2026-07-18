
import clsx from 'clsx';
import React from 'react';
import { LineChart, Line, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import sprintf from 'yow/sprintf';

const rankingRanges = [
	{ value: 1, label: '1Y' },
	{ value: 2, label: '2Y' },
	{ value: 3, label: '3Y' },
	{ value: 4, label: '4Y' },
	{ value: 5, label: '5Y' },
	{ value: 'all', label: 'ALL' }
];

function RankingRangePicker({ value, onChange }) {
	return (
		<div className='flex justify-end gap-1 bg-transparent px-3 pt-3'>
			{rankingRanges.map(range => (
				<button
					key={range.value}
					type='button'
					onClick={() => onChange(range.value)}
					className={clsx(
						'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
						value === range.value
							? 'border-primary-500 bg-primary-700 text-primary-50 dark:bg-primary-600'
							: 'border-primary-400 bg-transparent text-primary-700 hover:bg-primary-100 dark:text-primary-200 dark:hover:bg-primary-800'
					)}
				>
					{range.label}
				</button>
			))}
		</div>
	);
}

function rangeStart(to, years) {
	let from = new Date(to);
	from.setFullYear(from.getFullYear() - years);
	return from;
}

function getRankingPointsByMonth({ matches, player }) {
	let ranks = {};

	let now = new Date();

	let minDate = undefined;
	let maxDate = undefined;

	for (let match of matches) {
		let rank = undefined;
		let date = new Date(match.event_date);
		let key = sprintf('%04d-%02d', date.getFullYear(), date.getMonth() + 1);

		if (match.winner_id == player.id) {
			rank = match.winner_rank;
		}
		if (match.loser_id == player.id) {
			rank = match.loser_rank;
		}

		// Ignore NULL rank
		if (!rank) {
			continue;
		}

		if (ranks[key] == undefined) {
			ranks[key] = rank;
		} else {
			ranks[key] = Math.min(ranks[key], rank);
		}

		if (minDate == undefined || date < minDate) {
			minDate = date;
		}
		if (maxDate == undefined || date > maxDate) {
			maxDate = date;
		}
	}

	return { from: minDate, to: maxDate, rankings: ranks };
}

function PlayerRankingChart({ className, style, player, matches, ...props }) {
	const [years, setYears] = React.useState(2);

	function computeData() {
		let { rankings, from, to } = getRankingPointsByMonth({ player, matches });

		if (to && years !== 'all') {
			from = rangeStart(to, years);
		}

		let data = [];

		if (from && to) {
			for (let date = new Date(from); date.getTime() <= to.getTime(); date.setMonth(date.getMonth() + 1)) {
				let key = sprintf('%04d-%02d', date.getFullYear(), date.getMonth() + 1);
				data.push({ date: key, Rank: rankings[key] });
			}
		}

		return data;
	}

	className = clsx('flex h-[20em] flex-col overflow-hidden rounded-lg border border-primary-300 pb-2 dark:border-primary-700', className);

	return (
		<div className={className}>
			<RankingRangePicker value={years} onChange={setYears} />
			<div className='min-h-0 flex-1 bg-transparent'>
			<ResponsiveContainer>
				<LineChart className={''} data={computeData()} margin={{ top: 20, right: 50, bottom: 0, left: 0 }}>
					<XAxis dataKey='date' interval='preserveStartEnd' minTickGap={32} tick={{ fill: 'currentColor', fontSize: 12 }} />
					<YAxis reversed domain={[1, 'dataMax']} padding={{ top: 18, bottom: 18 }} tick={{ fill: 'currentColor', fontSize: 12 }} allowDecimals={false} />
					
					<CartesianGrid strokeDasharray='2 2' stroke={'var(--color-primary-400)'} />
					<Line dot={{ r: 3, strokeWidth: 2, fill: 'var(--color-primary-900)' }} type='linear' dataKey='Rank' stroke={'var(--color-success-500)'} strokeWidth={3} connectNulls={true} />
				</LineChart>
			</ResponsiveContainer>
			</div>
		</div>
	);
}

function PlayerRankingComparisonChart({ style, className, playerA, playerB, props }) {
	const [years, setYears] = React.useState(2);

	function computeData() {
		let { rankings: rankingsA, from: fromA, to: toA } = getRankingPointsByMonth({ player: playerA.player, matches: playerA.matches });
		let { rankings: rankingsB, from: fromB, to: toB } = getRankingPointsByMonth({ player: playerB.player, matches: playerB.matches });

		let from = new Date(Math.min(fromA, fromB));
		let to = new Date(Math.max(toA, toB));

		if (years !== 'all') {
			from = rangeStart(to, years);
		}

		let data = [];

		for (let date = new Date(from); date.getTime() <= to.getTime(); date.setMonth(date.getMonth() + 1)) {
			let key = sprintf('%04d-%02d', date.getFullYear(), date.getMonth() + 1);

			let item = {};
			item['date'] = key;
			item[playerA.player.name] = rankingsA[key];
			item[playerB.player.name] = rankingsB[key];
			data.push(item);
		}

		return data;
	}

	className = clsx('flex h-[20em] flex-col overflow-hidden rounded-lg border border-none-300 pb-2', className);
	className = clsx('dark:border-primary-700', className);

	return (
		<div className={className}>
			<RankingRangePicker value={years} onChange={setYears} />
			<div className='min-h-0 flex-1 bg-transparent'>
			<ResponsiveContainer height={'100%'} width={'100%'}>
				<LineChart data={computeData()} margin={{ top: 20, right: 50, bottom: 0, left: 0 }}>
					<XAxis dataKey='date' interval='preserveStartEnd' minTickGap={32} tick={{ fill: 'currentColor', fontSize: 12 }} />
					<YAxis reversed domain={[1, 'dataMax']} padding={{ top: 18, bottom: 18 }} tick={{ fill: 'currentColor', fontSize: 12 }} allowDecimals={false} />

					<CartesianGrid strokeDasharray='2 2' stroke={'var(--color-primary-400)'} />
					<Line dot={{ r: 3, strokeWidth: 2, fill: 'var(--color-primary-900)' }} type='linear' dataKey={playerA.player.name} stroke='var(--color-success-500)' strokeWidth={3} connectNulls={true} />
					<Line dot={{ r: 3, strokeWidth: 2, fill: 'var(--color-primary-900)' }} type='linear' dataKey={playerB.player.name} stroke='var(--color-warning-500)' strokeWidth={3} connectNulls={true} />
					<Legend />
				</LineChart>
			</ResponsiveContainer>
			</div>
		</div>
	);
}

export { PlayerRankingChart, PlayerRankingComparisonChart };
