import React from 'react';
import { useQuery } from '@tanstack/react-query';

import TriangleRightIcon from '../../assets/radix-icons/triangle-right.svg?react';
import Countdown from '../../components/countdown';
import Flag from '../../components/flag';
import Page from '../../components/page';
import Table from '../../components/ui/data-table';
import Link from '../../components/ui/link';
import { useSQL } from '../../js/vitel.js';

const ODDSET_PIPELINE_URL =
	'https://eu1.offering-api.kambicdn.com/offering/v2018/svenskaspel/listView/tennis/atp/all/all/matches.json?channel_id=1&client_id=200&lang=sv_SE&market=SE&useCombined=true&useCombinedLive=true';
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

function toDecimalOdds(odds) {
	if (typeof odds !== 'number') {
		return '-';
	}

	return (odds / 1000).toFixed(2);
}

function getMatchOddsOffer(item) {
	return item.betOffers?.find(offer => offer.criterion?.label === 'Matchodds' || offer.criterion?.englishLabel === 'Match Odds');
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

	const weekday = date.toLocaleDateString('sv-SE', { weekday: 'long' });
	const time = date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
	const weekdayLabel = weekday.charAt(0).toUpperCase() + weekday.slice(1);

	return `${weekdayLabel} ${time}`;
}

async function fetchOddsetPipelineMatches() {
	const response = await fetch(ODDSET_PIPELINE_URL);

	if (response.status === 404) {
		return [];
	}

	if (!response.ok) {
		throw new Error(`Kunde inte läsa oddset (${response.status})`);
	}

	const payload = await response.json();
	const rows = (payload.events || []).map(item => {
		const event = item.event || {};
		const startTimestamp = Number.isNaN(Date.parse(event.start)) ? Number.MAX_SAFE_INTEGER : Date.parse(event.start);
		const offer = getMatchOddsOffer(item);
		const one = offer?.outcomes?.find(outcome => outcome.type === 'OT_ONE');
		const two = offer?.outcomes?.find(outcome => outcome.type === 'OT_TWO');
		const odds = `${toDecimalOdds(one?.odds)} - ${toDecimalOdds(two?.odds)}`;

		return {
			id: event.id ?? `${event.name ?? '-'}-${event.start ?? '-'}`,
			turnering: event.group || '-',
			playerAName: event.homeName || '-',
			playerBName: event.awayName || '-',
			odds,
			status: formatState(event.state),
			start: formatStart(event.start),
			_startTimestamp: startTimestamp
		};
	});

	rows.sort((a, b) => a._startTimestamp - b._startTimestamp);

	return rows;
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
	const flagClassName = 'w-5! h-5! border-primary-800 dark:border-primary-200';
	const playerLinkClassName = 'bg-transparent';
	const compareLinkClassName = 'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-primary-900 dark:text-primary-100';
	const playerA = row.playerA;
	const playerB = row.playerB;
	const compareLink = playerA.id && playerB.id ? `/head-to-head/${playerA.id}/${playerB.id}` : null;

	function formatPlayerLabel(player) {
		if (!player.country) {
			return player.name;
		}

		const ranking = player.rank ? ` #${player.rank}` : '';
		return `${player.name} (${player.country})${ranking}`;
	}

	function renderPlayer(player) {
		const label = formatPlayerLabel(player);

		if (!player.id) {
			return <span>{label}</span>;
		}

		return (
			<Link className={playerLinkClassName} to={`/player/${player.id}`}>
				{label}
			</Link>
		);
	}

	return (
		<div className='flex items-center gap-2 bg-transparent'>
			{playerA.country ? <Flag className={flagClassName} country={playerA.country} /> : null}
			{renderPlayer(playerA)}
			<span>vs</span>
			{playerB.country ? <Flag className={flagClassName} country={playerB.country} /> : null}
			{renderPlayer(playerB)}
			{compareLink ? (
				<Link
					to={compareLink}
					className={compareLinkClassName}
					aria-label={`Jämför ${playerA.name} mot ${playerB.name}`}
					title='Jämför spelare'
				>
					<TriangleRightIcon className='block h-full w-full' />
				</Link>
			) : null}
		</div>
	);
}

function SourceExplanation() {
	return (
		<div className='mb-3 rounded-sm border border-primary-300 bg-primary-50 p-3 text-sm text-primary-800 dark:border-primary-600 dark:bg-primary-900 dark:text-primary-200'>
			<div className='text-base font-semibold text-primary-900 dark:text-primary-100'>Oddset just nu</div>
			<div className='mt-1'>
				Här ser du en snabb överblick av ATP-matcher som finns hos Oddset, med starttid, aktuella odds och spelare.
			</div>
			<div className='mt-1 text-primary-700 dark:text-primary-300'>
				Listan uppdateras löpande, så använd den som en färsk lägesbild av marknaden.
			</div>
		</div>
	);
}

function OddsetTable({ rows }) {
	return (
		<Table rows={rows}>
			<Table.Column id='turnering'>
				<Table.Title>Turnering</Table.Title>
			</Table.Column>
			<Table.Column id='start'>
				<Table.Title>Start</Table.Title>
			</Table.Column>
			<Table.Column>
				<Table.Title>Spelare</Table.Title>
				<Table.Value>{({ row }) => <PlayersCell row={row} />}</Table.Value>
			</Table.Column>
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

	function Content() {
		if (error) {
			return <Page.Error>Misslyckades med att läsa oddset - {error.message}</Page.Error>;
		}

		if (!rows) {
			return <Page.Loading>Läser in oddset...</Page.Loading>;
		}

		if (rows.length === 0) {
			return <Page.Error>Inga oddset-matcher hittades just nu.</Page.Error>;
		}

		return (
			<>
				<Page.Title className='flex items-center justify-between gap-3'>
					<span className='bg-transparent'>Oddset</span>
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
					<SourceExplanation />
					{liveMatches.length > 0 ? (
						<>
							<Page.Title level={2}>Live</Page.Title>
							<OddsetTable rows={liveMatches} />
						</>
					) : null}
					{upcomingMatches.length > 0 ? (
						<>
							<Page.Title level={2}>Kommande</Page.Title>
							<OddsetTable rows={upcomingMatches} />
						</>
					) : null}
				</Page.Container>
			</>
		);
	}

	return (
		<Page id='oddset-page'>
			<Page.Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
}

export default Component;
