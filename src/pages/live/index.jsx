import React from 'react';

import Countdown from '../../components/countdown';
import PlayersHeadToHead from '../../components/players-head-to-head';
import Page from '../../components/page';
import Button from '../../components/ui/button';
import Table from '../../components/ui/data-table';
import Link from '../../components/ui/link';
import { useRequest, useSQL } from '../../js/vitel.js';

const LIVE_REFRESH_INTERVAL_MS = 25 * 1000;
const LIVE_COUNTDOWN_STEPS = 5;

function PlayersCell({ playerA, playerB }) {
	return <PlayersHeadToHead playerA={playerA} playerB={playerB} />;
}

function LiveTable({ rows, finished = false }) {
	return (
		<Table rows={rows}>
			<Table.Column id='name'>
				<Table.Title>Turnering</Table.Title>
				<Table.Cell>{({ row, value }) => <Link to={`/event/${row.event}`}>{value}</Link>}</Table.Cell>
			</Table.Column>

			<Table.Column>
				<Table.Title>Spelare</Table.Title>
				<Table.Value>{({ row }) => <PlayersCell playerA={row.player} playerB={row.opponent} />}</Table.Value>
			</Table.Column>

			<Table.Column id='score'>
				<Table.Title>{finished ? 'Resultat' : 'Ställning'}</Table.Title>
				<Table.Cell>{({ value }) => value}</Table.Cell>
			</Table.Column>
		</Table>
	);
}

function EmptyMatchesState() {
	return (
		<div className='flex flex-col items-center justify-center py-12 text-center'>
			<div className='text-8xl'>😢</div>
			<div className='mt-4 text-xl text-primary-700 dark:text-primary-300'>Inga matcher idag</div>
		</div>
	);
}

function splitMatchesByStatus(matches) {
	const activeMatches = [];
	const finishedMatches = [];

	for (const match of matches) {
		if (match.winner) {
			finishedMatches.push(match);
		} else {
			activeMatches.push(match);
		}
	}

	return { activeMatches, finishedMatches };
}

function Component() {
	const { data: matches, error, dataUpdatedAt, isFetching } = useRequest({
		path: 'live',
		method: 'GET',
		cache: 0,
		refetchInterval: LIVE_REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: true
	});
	const rankingSql = 'SELECT id FROM players WHERE rank IS NOT NULL ORDER BY rank ASC, name ASC';
	const { data: rankingRows, error: rankError } = useSQL({
		sql: rankingSql,
		cache: 5 * 60 * 1000
	});

	if (error) {
		return (
			<Page>
				<Page.Menu />
				<Page.Content>
					<Page.Error>Misslyckades med att läsa in dagens matcher - {error.message}</Page.Error>
				</Page.Content>
			</Page>
		);
	}

	if (!matches) {
		return (
			<Page>
				<Page.Menu />
				<Page.Content>
					<Page.Loading>Läser in dagens matcher...</Page.Loading>
				</Page.Content>
			</Page>
		);
	}

	if (rankError) {
		return (
			<Page>
				<Page.Menu />
				<Page.Content>
					<Page.Error>Misslyckades med att läsa in ranking - {rankError.message}</Page.Error>
				</Page.Content>
			</Page>
		);
	}

	if (!rankingRows) {
		return (
			<Page>
				<Page.Menu />
				<Page.Content>
					<Page.Loading>Läser in ranking...</Page.Loading>
				</Page.Content>
			</Page>
		);
	}

	const ranksByPlayerId = Object.fromEntries((rankingRows ?? []).map((player, index) => [player.id, index + 1]));

	const rows = matches.map(match => {
		const player = {
			...match.player,
			rank: ranksByPlayerId[match.player?.id]
		};
		const opponent = {
			...match.opponent,
			rank: ranksByPlayerId[match.opponent?.id]
		};

		return {
			...match,
			player,
			opponent
		};
	});

	const { activeMatches, finishedMatches } = splitMatchesByStatus(rows);
	const hasNoMatches = activeMatches.length === 0 && finishedMatches.length === 0;

	return (
		<Page>
			<Page.Menu />
			<Page.Content>
				<Page.Title className='flex items-center justify-between gap-3'>
					<span className='bg-transparent'>Dagens matcher</span>
					<Countdown
						dataUpdatedAt={dataUpdatedAt}
						isFetching={isFetching}
						intervalMs={LIVE_REFRESH_INTERVAL_MS}
						steps={LIVE_COUNTDOWN_STEPS}
						labelUpdating='Uppdaterar live-sidan'
						inline={true}
					/>
				</Page.Title>
				<Page.Container>
					{hasNoMatches ? <EmptyMatchesState /> : null}

					{activeMatches.length > 0 ? (
						<>
							<Page.Title level={2}>Pågående</Page.Title>
							<LiveTable rows={activeMatches} finished={false} />
							<div className='flex justify-center pt-4'>
								<Button link='/live-matches'>Visa live</Button>
							</div>
						</>
					) : null}

					{finishedMatches.length > 0 ? (
						<>
							<Page.Title level={2}>Nyligen avslutade</Page.Title>
							<LiveTable rows={finishedMatches} finished={true} />
						</>
					) : null}
				</Page.Container>
			</Page.Content>
		</Page>
	);
}

export default Component;
