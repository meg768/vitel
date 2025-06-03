import React from 'react';
import sprintf from 'yow/sprintf';
import isDate from 'yow/isDate';
import isString from 'yow/isString';

import clsx from 'clsx';
import { LineChart, Line, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';

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
	function computeData() {
		let { rankings, from, to } = getRankingPointsByMonth({ player, matches });

		// Display last two years if active
		if (player.active) {
			from = new Date(to).setMonth(-24);
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

	className = clsx('h-[12em] border-1 pb-2', className);

	return (
		<div className={className}>
			<ResponsiveContainer>
				<LineChart className={''} data={computeData()} margin={{ top: 20, right: 50, bottom: 0, left: 0 }}>
					<XAxis dataKey='date' tick={{ fill: 'currentColor', fontSize: 12 }} />
					<YAxis tick={{ fill: 'currentColor', fontSize: 12 }} allowDecimals={false} />
					
					<CartesianGrid strokeDasharray='2 2' stroke={'var(--color-primary-400)'} />
					<Line dot={false} type='linear' dataKey='Rank' stroke={'var(--color-success-500)'} strokeWidth={3} connectNulls={true} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

function PlayerRankingComparisonChart({ style, className, playerA, playerB, props }) {
	function computeData() {
		let { rankings: rankingsA, from: fromA, to: toA } = getRankingPointsByMonth({ player: playerA.player, matches: playerA.matches });
		let { rankings: rankingsB, from: fromB, to: toB } = getRankingPointsByMonth({ player: playerB.player, matches: playerB.matches });

		let from = new Date(Math.min(fromA, fromB));
		let to = new Date(Math.max(toA, toB));

		// Show last two years if both of them are active
		if (playerA.player.active && playerB.player.active) {
			from = new Date(to).setMonth(-24);
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

	className = clsx('h-[12em] border-1 border-none-300 pb-2', className);
	className = clsx('dark:border-primary-700', className);

	return (
		<div className={className}>
			<ResponsiveContainer height={'100%'} width={'100%'}>
				<LineChart data={computeData()} margin={{ top: 20, right: 50, bottom: 0, left: 0 }}>
					<XAxis dataKey='date' tick={{ fill: 'currentColor', fontSize: 12 }} />
					<YAxis tick={{ fill: 'currentColor', fontSize: 12 }} allowDecimals={false} />

					<CartesianGrid strokeDasharray='2 2' stroke={'var(--color-primary-400)'} />
					<Line dot={false} type='linear' dataKey={playerA.player.name} stroke='var(--color-success-500)' strokeWidth={3} connectNulls={true} />
					<Line dot={false} type='linear' dataKey={playerB.player.name} stroke='var(--color-warning-500)' strokeWidth={3} connectNulls={true} />
					<Legend />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

export { PlayerRankingChart, PlayerRankingComparisonChart };
