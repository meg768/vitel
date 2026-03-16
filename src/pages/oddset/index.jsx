import React from 'react';
import { useQuery } from '@tanstack/react-query';

import Countdown from '../../components/countdown';
import PlayersHeadToHead from '../../components/players-head-to-head';
import Page from '../../components/page';
import Button from '../../components/ui/button';
import Table from '../../components/ui/data-table';
import {
	ODDSET_PIPELINE_QUERY_KEY,
	ODDSET_PIPELINE_REFRESH_INTERVAL_MS,
	buildPlayerDetailsByName,
	buildRanksByPlayerId,
	fetchOddsetPipelineMatches,
	resolveMatchPlayers,
	splitOddsetRowsByStatus
} from '../../js/oddset-pipeline.js';
import { useSQL } from '../../js/vitel.js';

const ODDSET_COUNTDOWN_STEPS = 5;
const PLAYERS_COUNTRY_CACHE_MS = 24 * 60 * 60 * 1000;
const RANKING_SQL = 'SELECT id FROM players WHERE rank IS NOT NULL ORDER BY rank ASC, name ASC';

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
	const { liveMatches, upcomingMatches } = React.useMemo(() => splitOddsetRowsByStatus(enrichedRows), [enrichedRows]);
	let content = null;

	if (error) {
		content = <Page.Error>Misslyckades med att läsa oddset - {error.message}</Page.Error>;
	} else if (!rows) {
		content = <Page.Loading>Läser in oddset...</Page.Loading>;
	} else if (rows.length === 0) {
		content = (
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
					<Page.Emoji emoji='😢' message='Svenska Spel har inga odds just nu på ATP-touren' />
				</Page.Container>
			</>
		);
	} else {
		content = (
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
					<Page.Title level={2}>Pågående matcher</Page.Title>
						{liveMatches.length > 0 ? (
							<>
								<OddsetTable rows={liveMatches} showLiveScore={true} showStartColumn={false} />
								<div className='flex justify-center pt-4'>
									<Button link='/scoreboard'>Visa scoreboard</Button>
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
