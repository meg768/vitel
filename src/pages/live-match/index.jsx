import React from 'react';
import { useParams } from 'react-router';

import Avatar from '../../components/avatar';
import Page from '../../components/page';
import Flag from '../../components/flag';
import Button from '../../components/ui/button';
import Table from '../../components/ui/table';
import { useSQL } from '../../js/vitel.js';

const mockMatch = {
	event: 'Indian Wells',
	round: 'Semifinal',
	score: '6-3 4-6 3-3 [40-15]',
	playerA: {
		name: 'Jannik Sinner',
		country: 'ITA',
		seed: '#1',
		initials: 'JS'
	},
	playerB: {
		name: 'Carlos Alcaraz',
		country: 'ESP',
		seed: '#3',
		initials: 'CA'
	}
};

function PlayerCell({ player }) {
	function playerSeed() {
		if (player.rank) {
			return `#${player.rank}`;
		}

		return player.seed ?? '-';
	}
	const avatarSrc = `https://www.atptour.com/-/media/alias/player-headshot/${player.id}`;

	return (
		<div className='flex flex-col items-center gap-4'>
			<Avatar
				src={avatarSrc}
				className='h-16 w-16 border-2 border-primary-700 bg-primary-900 shadow-sm md:h-20 md:w-20 dark:border-primary-300'
			/>
			<div className='flex flex-col items-center gap-1'>
				<div className='text-center text-xl font-semibold text-primary-900 dark:text-primary-100'>{player.name}</div>
				<div className='flex items-center justify-center gap-2 text-sm text-primary-700 dark:text-primary-300'>
					<Flag className='h-5! w-5! border-current' country={player.country} />
					<span>{player.country}</span>
					<span aria-hidden='true'>•</span>
					<span>{playerSeed()}</span>
				</div>
			</div>
		</div>
	);
}

function ScoreCell({ score, playerA, playerB }) {
	function parseScore() {
		const match = score.match(/\[(.+)\]\s*$/);
		const gameScore = match ? match[1] : score;
		const setsSummary = match ? score.slice(0, match.index).trim() : '';

		return { gameScore, setsSummary };
	}
	const { gameScore, setsSummary } = parseScore();
	const link = `/head-to-head/${playerA.id}/${playerB.id}/`;

	return (
		<div className='flex flex-col items-center gap-4'>
			<div className='flex w-full flex-col items-center justify-center rounded-sm border border-primary-300 bg-primary-50 px-6 py-10 text-center shadow-sm dark:border-primary-600 dark:bg-primary-900'>
				<div className='text-xs font-semibold uppercase tracking-[0.3em] text-primary-500 dark:text-primary-300'>
					Ställning
				</div>
				<div className='mt-4 text-6xl font-semibold tracking-tight text-primary-900 dark:text-primary-50'>
					{gameScore}
				</div>
				{setsSummary ? (
					<div className='mt-4 text-lg font-medium tracking-[0.18em] text-primary-600 dark:text-primary-300'>
						{setsSummary}
					</div>
				) : null}
			</div>

			<Button disabled={link == ''} link={link}>
				Visa tidigare möten
			</Button>
		</div>
	);
}

function Component() {
	function fetch() {
		const params = useParams();
		let sql = '';
		let format = [params.A, params.B];

		sql += 'SELECT * FROM players WHERE id = ?; ';
		sql += 'SELECT * FROM players WHERE id = ?; ';

		const { data: sqlData, error } = useSQL({
			sql,
			format,
			cache: 0,
			enabled: Boolean(params.A && params.B)
		});
		let data = null;

		if (sqlData) {
			let [[playerA], [playerB]] = sqlData;

			data = {
				playerA,
				playerB
			};
		}

		return {
			data,
			error,
			params,
			isLoading: Boolean(params.A && params.B) && !sqlData && !error
		};
	}

	function Content() {
		let { data, error, isLoading, params } = fetch();

		if (error) {
			return <Page.Error>Misslyckades med att läsa in spelare - {error.message}</Page.Error>;
		}

		if (!params.A || !params.B) {
			return <Page.Error>Spelarna hittades inte ({params.A ?? '-'}, {params.B ?? '-'})</Page.Error>;
		}

		if (isLoading) {
			return <Page.Loading>Läser in spelare...</Page.Loading>;
		}

		if (!data?.playerA || !data?.playerB) {
			return <Page.Error>Spelarna hittades inte ({params.A}, {params.B})</Page.Error>;
		}

		let match = {
			...mockMatch,
			playerA: data.playerA,
			playerB: data.playerB
		};

		return (
			<>
				<Page.Title>{match.event}</Page.Title>

				<div className='mt-4 rounded-sm border border-primary-200 bg-primary-50 p-4 shadow-sm dark:border-primary-700 dark:bg-primary-900'>
					<div className='overflow-x-auto'>
						<Table className='w-full table-fixed border-separate border-spacing-0'>
							<colgroup>
								<col className='w-44 md:w-64' />
								<col />
								<col className='w-44 md:w-64' />
							</colgroup>

							<Table.Body>
								<Table.Row className='align-middle'>
									<Table.Cell className='pr-4 py-4 align-middle'>
										<PlayerCell player={match.playerA} />
									</Table.Cell>

									<Table.Cell className='px-2 py-4 align-middle'>
										<ScoreCell score={match.score} playerA={match.playerA} playerB={match.playerB} />
									</Table.Cell>

									<Table.Cell className='pl-4 py-4 align-middle'>
										<PlayerCell player={match.playerB} />
									</Table.Cell>
								</Table.Row>
							</Table.Body>
						</Table>
					</div>
				</div>
			</>
		);
	}

	return (
		<Page id='live-match-page'>
			<Page.Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
}

export default Component;
