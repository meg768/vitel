import './player-ranking-charts.scss';

import React from 'react';
import sprintf from 'yow/sprintf';
import isDate from 'yow/isDate';
import isString from 'yow/isString';

import classNames from 'classnames';

import { LineChart, Line, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';

function getRankingPointsByMonth({ matches, player, since }) {
	let ranks = {};
	let now = new Date();

	let minDate = undefined;
	let maxDate = undefined;

	matches = matches.filter((match) => {
		if (since == undefined) {
			return true;
		}

		let date = new Date(match.event_date);

		return date.getTime() >= since.getTime();
	});

	matches.sort((A, B) => {
		A = new Date(A);
		B = new Date(B);

		if (A.getTime() == B.getTime()) {
			return 0;
		}

		return A.getTime() > B.getTime() ? 1 : -1;
	});

	// Find out date span
	for (let match of matches) {
		let date = new Date(match.event_date);

		if (minDate == undefined || date < minDate) {
			minDate = date;
		}
		if (maxDate == undefined || date > maxDate) {
			maxDate = date;
		}
	}

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

		if (ranks[key] == undefined) {
			ranks[key] = rank;
		} else {
			ranks[key] = Math.min(ranks[key], rank);
		}
	}

	return ranks;
}

function PlayerRankingChart({ className, style, player, matches, since, ...props }) {
	if (since != undefined) {
		if (isString(since)) {
			since = new Date(since);
		}

		if (!isDate(since)) {
			since = undefined;
		}
	} else {
		since = new Date();
		since.setMonth(-24);
	}

	function computeData() {
		let now = new Date();
		let emptySlots = {};

		let rankings = getRankingPointsByMonth({ player, matches, since });

		let data = [];

		for (let date = new Date(since); date.getTime() < now.getTime(); date.setMonth(date.getMonth() + 1)) {
			let key = sprintf('%04d-%02d', date.getFullYear(), date.getMonth() + 1);
			data.push({ date: key, Rank: rankings[key] });
		}

		return data;
	}

	className = classNames('h-[12em] border-1 border-none-300 pb-2', className);
	className = classNames('dark:border-primary-800', className);

	return (
		<div className={className}>
			<ResponsiveContainer>
				<LineChart className={''} data={computeData()} margin={{ top: 20, right: 50, bottom: 0, left: 0 }}>
					<XAxis dataKey='date' tick={{ fill: 'var(--color-none-400)', fontSize: 12 }} />

					<YAxis tick={{ fill: 'var(--color-none-400)', fontSize: 12 }} allowDecimals={false} />
					<CartesianGrid strokeDasharray='2 2' stroke={'var(--color-none-300)'} />
					<Line type='linear' dataKey='Rank' stroke={'var(--color-primary-300)'} strokeWidth={3} connectNulls={true} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

function PlayerRankingComparisonChart({ style, className, playerA, playerB, since, props }) {
	if (since != undefined) {
		if (isString(since)) {
			since = new Date(since);
		}

		if (!isDate(since)) {
			since = undefined;
		}
	} else {
		since = new Date();
		since.setMonth(-24);
	}

	function computeData() {
		let now = new Date();

		let rankingsA = getRankingPointsByMonth({ player: playerA.player, matches: playerA.matches, since });
		let rankingsB = getRankingPointsByMonth({ player: playerB.player, matches: playerB.matches, since });

		let data = [];

		for (let date = new Date(since); date.getTime() < now.getTime(); date.setMonth(date.getMonth() + 1)) {
			let key = sprintf('%04d-%02d', date.getFullYear(), date.getMonth() + 1);

			let item = {};
			item['date'] = key;
			item[playerA.player.name] = rankingsA[key];
			item[playerB.player.name] = rankingsB[key];
			data.push(item);
		}

		return data;
	}

	className = classNames('h-[12em] border-1 border-none-300 pb-2', className);
	className = classNames('dark:border-primary-800', className);

	return (
		<div className={className}>
			<ResponsiveContainer height={'100%'} width={'100%'}>
				<LineChart data={computeData()} margin={{ top: 20, right: 50, bottom: 0, left: 0 }}>
					<XAxis dataKey='date' tick={{ fill: 'var(--color-none-400)', fontSize: 12 }} />

					<YAxis tick={{ fill: 'var(--color-none-400)', fontSize: 12 }} allowDecimals={false} />
					<CartesianGrid strokeDasharray='2 2' stroke={'var(--color-none-400)'} />
					<Line type='linear' dataKey={playerA.player.name} stroke={'var(--color-primary-500)'} strokeWidth={3} connectNulls={true} />
					<Line type='linear' dataKey={playerB.player.name} stroke='var(--color-secondary-500)' strokeWidth={3} connectNulls={true} />
					<Legend />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

export { PlayerRankingChart, PlayerRankingComparisonChart };
