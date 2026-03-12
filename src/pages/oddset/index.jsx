import React from 'react';
import { useQuery } from '@tanstack/react-query';

import Countdown from '../../components/countdown';
import PlayersHeadToHead from '../../components/players-head-to-head';
import Page from '../../components/page';
import Button from '../../components/ui/button';
import Table from '../../components/ui/data-table';
import { service, useSQL } from '../../js/vitel.js';

const ODDSET_PIPELINE_QUERY_KEY = ['oddset', 'pipeline', 'atp'];
const ODDSET_PIPELINE_REFRESH_INTERVAL_MS = 25 * 1000;
const ODDSET_COUNTDOWN_STEPS = 5;
const PLAYERS_COUNTRY_CACHE_MS = 24 * 60 * 60 * 1000;
const RANKING_SQL = 'SELECT id FROM players WHERE rank IS NOT NULL ORDER BY rank ASC, name ASC';

function normalizeName(name = '') {
	return String(name)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9 ]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function formatOddsValue(odds) {
	if (typeof odds !== 'number') {
		return '-';
	}

	return odds.toFixed(2);
}

function formatState(state) {
	switch (state) {
		case 'STARTED':
			return 'Live';
		case 'NOT_STARTED':
			return 'Kommande';
		default:
			return state || '-';
	}
}

function formatStart(value) {
	if (!value) {
		return '-';
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return '-';
	}

	function startOfLocalDay(d) {
		return new Date(d.getFullYear(), d.getMonth(), d.getDate());
	}

	const today = startOfLocalDay(new Date());
	const targetDay = startOfLocalDay(date);
	const diffDays = Math.round((targetDay - today) / (24 * 60 * 60 * 1000));
	const time = date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
	let dayLabel = '';

	switch (diffDays) {
		case -1:
			dayLabel = 'I går';
			break;
		case 0:
			dayLabel = 'Idag';
			break;
		case 1:
			dayLabel = 'I morgon';
			break;
		case 2:
			dayLabel = 'I övermorgon';
			break;
		default:
			dayLabel = diffDays > 0 ? `Om ${diffDays} dagar` : `${Math.abs(diffDays)} dagar sedan`;
			break;
	}

	return `${dayLabel} ${time}`;
}

function parseStartTimestamp(value) {
	const ts = Date.parse(value);
	return Number.isNaN(ts) ? Number.MAX_SAFE_INTEGER : ts;
}

function normalizeOddsetRowsPayload(payload) {
	if (Array.isArray(payload)) {
		return payload;
	}

	if (Array.isArray(payload?.matches)) {
		return payload.matches;
	}

	if (Array.isArray(payload?.rows)) {
		return payload.rows;
	}

	return null;
}

function toUiRow(row) {
	const hasNestedPlayers = row && typeof row === 'object' && row.playerA && typeof row.playerA === 'object' && row.playerB && typeof row.playerB === 'object';
	const playerAName = hasNestedPlayers ? row.playerA?.name : (row.playerAName ?? row.playerA);
	const playerBName = hasNestedPlayers ? row.playerB?.name : (row.playerBName ?? row.playerB);
	const oddsA = hasNestedPlayers ? row.playerA?.odds : row.oddsA;
	const oddsB = hasNestedPlayers ? row.playerB?.odds : row.oddsB;
	const liveScore = row.liveScore ?? row.score ?? null;
	const rawState = row.state ?? row.status ?? (liveScore ? 'STARTED' : 'NOT_STARTED');

	return {
		id: row.id ?? `${playerAName ?? '-'}-${playerBName ?? '-'}-${row.start ?? '-'}`,
		turnering: row.turnering ?? row.tournament ?? '-',
		playerAName: playerAName || '-',
		playerBName: playerBName || '-',
		odds: `${formatOddsValue(oddsA)} - ${formatOddsValue(oddsB)}`,
		liveScore: liveScore || '-',
		status: formatState(rawState),
		start: formatStart(row.start),
		_startTimestamp: Number.isFinite(row._startTimestamp) ? row._startTimestamp : parseStartTimestamp(row.start)
	};
}

function toSortedUiRows(rows = []) {
	const mapped = rows.map(toUiRow);
	mapped.sort((a, b) => a._startTimestamp - b._startTimestamp);
	return mapped;
}

async function fetchOddsetPipelineMatches() {
	const payload = await service.get('oddset');
	const rows = normalizeOddsetRowsPayload(payload);
	if (!rows) {
		throw new Error('Kunde inte läsa oddset från /oddset');
	}

	return toSortedUiRows(rows);
}

function buildPlayerDetailsByName(rows = []) {
	const detailsByPlayerName = {};

	for (const row of rows) {
		const key = normalizeName(row.name);
		if (!key) {
			continue;
		}

		if (!detailsByPlayerName[key]) {
			detailsByPlayerName[key] = {
				id: row.id || null,
				country: row.country || null
			};
		}
	}

	return detailsByPlayerName;
}

function buildRanksByPlayerId(rows = []) {
	return Object.fromEntries(rows.map((player, index) => [player.id, index + 1]));
}

function resolvePlayer(name, playerDetailsByName, ranksByPlayerId) {
	const playerDetails = playerDetailsByName[normalizeName(name)] || {};

	return {
		id: playerDetails.id ?? null,
		name: name || '-',
		country: playerDetails.country ?? null,
		rank: playerDetails.id ? ranksByPlayerId[playerDetails.id] ?? null : null
	};
}

function resolveMatchPlayers(row, playerDetailsByName, ranksByPlayerId) {
	return {
		playerA: resolvePlayer(row.playerAName, playerDetailsByName, ranksByPlayerId),
		playerB: resolvePlayer(row.playerBName, playerDetailsByName, ranksByPlayerId)
	};
}

function PlayersCell({ row }) {
	const playerA = row.playerA;
	const playerB = row.playerB;

	return <PlayersHeadToHead playerA={playerA} playerB={playerB} />;
}

function EmptyLiveState() {
	return (
		<div className='rounded-sm border border-primary-300 bg-primary-50 p-4 text-center text-primary-800 dark:border-primary-600 dark:bg-primary-900 dark:text-primary-200'>
			<div className='text-base font-semibold text-primary-900 dark:text-primary-100'>Inga pågående matcher just nu</div>
		</div>
	);
}

function EmptyUpcomingState() {
	return (
		<div className='rounded-sm border border-primary-300 bg-primary-50 p-4 text-center text-primary-800 dark:border-primary-600 dark:bg-primary-900 dark:text-primary-200'>
			<div className='text-base font-semibold text-primary-900 dark:text-primary-100'>Inga kommande matcher just nu</div>
		</div>
	);
}

function OddsetTable({ rows, showLiveScore = false, showStartColumn = true, startFirst = false }) {
	return (
		<Table rows={rows}>
			{showStartColumn && startFirst ? (
				<Table.Column id='start'>
					<Table.Title>Start</Table.Title>
				</Table.Column>
			) : null}
			<Table.Column id='turnering'>
				<Table.Title>Turnering</Table.Title>
			</Table.Column>
			{showStartColumn && !startFirst ? (
				<Table.Column id='start'>
					<Table.Title>Start</Table.Title>
				</Table.Column>
			) : null}
			<Table.Column>
				<Table.Title>Spelare</Table.Title>
				<Table.Value>{({ row }) => <PlayersCell row={row} />}</Table.Value>
			</Table.Column>
			{showLiveScore ? (
				<Table.Column id='liveScore'>
					<Table.Title>Ställning</Table.Title>
				</Table.Column>
			) : null}
			<Table.Column id='odds'>
				<Table.Title>Odds</Table.Title>
			</Table.Column>
		</Table>
	);
}

function splitRowsByStatus(rows) {
	const liveMatches = [];
	const upcomingMatches = [];

	for (const row of rows) {
		if (row.status === 'Live') {
			liveMatches.push(row);
		} else {
			upcomingMatches.push(row);
		}
	}

	return { liveMatches, upcomingMatches };
}

function Component() {
	const { data: rows, error, dataUpdatedAt, isFetching } = useQuery({
		queryKey: ODDSET_PIPELINE_QUERY_KEY,
		queryFn: fetchOddsetPipelineMatches,
		staleTime: ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
		refetchInterval: ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
		refetchOnWindowFocus: false,
		retry: 0
	});
	const { data: playerRows } = useSQL({
		sql: 'SELECT id, name, country FROM players',
		cache: PLAYERS_COUNTRY_CACHE_MS
	});
	const { data: rankingRows } = useSQL({
		sql: RANKING_SQL,
		cache: PLAYERS_COUNTRY_CACHE_MS
	});

	const playerDetailsByName = React.useMemo(() => buildPlayerDetailsByName(playerRows), [playerRows]);
	const ranksByPlayerId = React.useMemo(() => buildRanksByPlayerId(rankingRows), [rankingRows]);
	const enrichedRows = React.useMemo(
		() =>
			(rows ?? []).map(row => {
				const { playerA, playerB } = resolveMatchPlayers(row, playerDetailsByName, ranksByPlayerId);
				return { ...row, playerA, playerB };
			}),
		[rows, playerDetailsByName, ranksByPlayerId]
	);
	const { liveMatches, upcomingMatches } = React.useMemo(() => splitRowsByStatus(enrichedRows), [enrichedRows]);
	let content = null;

	if (error) {
		content = <Page.Error>Misslyckades med att läsa oddset - {error.message}</Page.Error>;
	} else if (!rows) {
		content = <Page.Loading>Läser in oddset...</Page.Loading>;
	} else if (rows.length === 0) {
		content = <Page.Information>Inga oddset-matcher hittades just nu.</Page.Information>;
	} else {
		content = (
			<>
				<Page.Title className='flex items-center justify-between gap-3'>
					<span className='bg-transparent'>Matcher</span>
					<Countdown
						dataUpdatedAt={dataUpdatedAt}
						isFetching={isFetching}
						intervalMs={ODDSET_PIPELINE_REFRESH_INTERVAL_MS}
						steps={ODDSET_COUNTDOWN_STEPS}
						labelUpdating='Uppdaterar oddset-sidan'
						inline={true}
					/>
				</Page.Title>
				<Page.Container>
					<Page.Title level={2}>Pågående matcher</Page.Title>
					{liveMatches.length > 0 ? (
						<>
							<OddsetTable rows={liveMatches} showLiveScore={true} showStartColumn={false} />
							<div className='flex justify-center pt-4'>
								<Button link='/live-matches'>Visa live</Button>
							</div>
						</>
					) : (
						<EmptyLiveState />
					)}
					{upcomingMatches.length > 0 ? (
						<>
							<Page.Title level={2}>Kommande matcher</Page.Title>
							<OddsetTable rows={upcomingMatches} startFirst={true} />
						</>
					) : (
						<>
							<Page.Title level={2}>Kommande matcher</Page.Title>
							<EmptyUpcomingState />
						</>
					)}
					<div className='flex justify-center pt-6'>
						<Button link='/live'>Visa matcher från atptour.com</Button>
					</div>
				</Page.Container>
			</>
		);
	}

	return (
		<Page id='oddset-page'>
			<Page.Menu />
			<Page.Content>
				{content}
			</Page.Content>
		</Page>
	);
}

export default Component;
