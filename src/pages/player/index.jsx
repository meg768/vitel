
import React from 'react';
import Request from '../../js/request';
import mysql from '../../js/mysql-express';
import Link from '../../components/ui/link';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Button, Container } from '../../components/ui';

import Page from '../../components/page';
import PlayerSummary from '../../components/player-summary';
import PlayerOverview from '../../components/player-overview';
import Menu from '../../components/menu';

import Matches from '../../components/matches';
import Flag from '../../components/flag';
import Tabs from '../../components/ui/tabs';

import { PlayerRankingChart } from '../../components/player-ranking-charts';

function PlayerMatches({ matches, player }) {
	return (
		<>
			<Matches matches={matches} owner={player.name} />
		</>
	);
}

function PlayerMatchTabs({ matches, player }) {
	let grandSlamsWins = matches.filter((match) => {
		return match.round == 'F' && match.event_type == 'Grand Slam' && match.winner == player.name;
	});

	let mastersWins = matches.filter((match) => {
		return match.round == 'F' && match.event_type == 'Masters' && match.winner == player.name;
	});

	let atp500Wins = matches.filter((match) => {
		return match.round == 'F' && match.event_type == 'ATP-500' && match.winner == player.name;
	});

	let atp250Wins = matches.filter((match) => {
		return match.round == 'F' && match.event_type == 'ATP-250' && match.winner == player.name;
	});

	let titles = matches.filter((match) => {
		return match.round == 'F' && match.winner_id == player.id;
	});

	let finals = matches.filter((match) => {
		return match.round == 'F';
	});

	function MatchTab({ matches, value, title }) {
		if (matches.length == 0) {
			return;
		}
		return (
			<Tabs.Trigger className='' value={title}>
				{title}
			</Tabs.Trigger>
		);
	}

	return (
		<Tabs.Root className='' defaultValue='Karriär'>
			<Tabs.List className='flex '>
				<MatchTab title='Karriär' matches={matches} />
				<MatchTab title='Finaler' matches={finals} />
				<MatchTab title='Grand Slams' matches={grandSlamsWins} />
				<MatchTab title='Masters' matches={mastersWins} />
				<MatchTab title='ATP-500' matches={atp500Wins} />
				<MatchTab title='ATP-250' matches={atp250Wins} />
			</Tabs.List>

			<Tabs.Content value='Finaler' className='overflow-x-auto'>
				<Matches player={player} matches={finals} owner={player.id} />
			</Tabs.Content>

			<Tabs.Content value='Karriär' className='overflow-x-auto'>
				<Matches player={player} matches={matches} owner={player.id} />
			</Tabs.Content>

			<Tabs.Content value='Titlar' className='overflow-x-auto'>
				<Matches player={player} matches={titles} owner={player.id} />
			</Tabs.Content>

			<Tabs.Content value='Grand Slams' className='overflow-x-auto'>
				<Matches player={player} matches={grandSlamsWins} owner={player.id} />
			</Tabs.Content>

			<Tabs.Content value='Masters' className='overflow-x-auto'>
				<Matches player={player} matches={mastersWins} owner={player.id} />
			</Tabs.Content>

			<Tabs.Content value='ATP-500' className='overflow-x-auto'>
				<Matches player={player} matches={atp500Wins} owner={player.id} />
			</Tabs.Content>

			<Tabs.Content value='ATP-250' className='overflow-x-auto'>
				<Matches player={player} matches={atp250Wins} owner={player.id} />
			</Tabs.Content>
		</Tabs.Root>
	);
}

function PlayerTitles({ matches, player, title = 'Titles' }) {
	matches = matches.filter((match) => {
		return match.round == 'F' && match.winner == player.name;
	});
	return (
		<>
			<Matches matches={matches} owner={player.name} />
		</>
	);
}

function PlayerFinals({ player, matches, level, title = 'Finals' }) {
	matches = matches.filter((match) => {
		return match.round == 'F';
	});

	return (
		<>
			<Matches matches={matches} owner={player.id} />
		</>
	);
}

/*
let PlayerOverview = ({player, matches}) => {
		let src = `https://www.atptour.com/-/media/alias/player-headshot/${player.id}`;

		return (
			<div className='border-none-200 border-1 rounded-none flex p-0'>
				<div className='w-30 self-center p-4'>
					<img className='border-none-300	bg-primary-900 border-4 rounded-full' src={src} />
				</div>
				<div className='flex-1 p-3'>
					<PlayerSummary player={player} matches={matches} />
				</div>
			</div>
		);

}
*/
let Component = () => {
	const params = useParams();
	const queryKey = `player/${JSON.stringify(useParams())}`;
	const queryOptions = {};
	const { data: response, isPending, isError, error } = useQuery({ queryKey: [queryKey], queryFn: fetch });

	async function fetch() {
		console.log('PARAMS', params);
		let sql = '';
		sql += `SELECT * FROM flatly `;
		sql += `WHERE winner_id = ? `;
		sql += `OR loser_id = ? `;
		sql += `ORDER BY event_date DESC, `;
		sql += `FIELD(round, 'F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128', 'BR'); `;

		sql += `SELECT * FROM players `;
		sql += `WHERE id = ?; `;

		let format = [params.id, params.id, params.id];

		let details = await mysql.query({ sql: sql, format: format });

		let matches = details[0];
		let player = details[1][0];
		let response = { matches: matches, player: player };

		return response;
	}

	function Title() {
		if (!response || !response.player.country) {
			return <Page.Title>{params.name}</Page.Title>;
		}

		let { player } = response;

		return (
			<Page.Title className='flex justify-left items-center gap-2'>
				<Flag className='mr-1 w-15! h-15!' country={player.country}></Flag>
				<div className=''>
					<Link target='_blank' to={`https://www.atptour.com/en/players/X/${player.id}/overview`}>
						{player.name}
					</Link>
					{`, ${player.country} `}
				</div>
			</Page.Title>
		);
	}

	function Contents() {
		if (!response) {
			return;
		}

		return (
			<Container>
				<Page.Title level={2}>Översikt</Page.Title>
				<div className='overflow-x-auto'>
					<PlayerSummary player={response.player} matches={response.matches} />
				</div>

				<Page.Title level={2}>Ranking</Page.Title>
				<PlayerRankingChart className='' player={response.player} matches={response.matches} />
				
				<Page.Title level={2}>Matcher</Page.Title>
				<PlayerMatchTabs params={params} player={response.player} matches={response.matches} />
			</Container>
		);

		return (
			<Container>
				<h2>Summary</h2>
				<PlayerSummary player={response.player} matches={response.matches} />
				<h2>Ranking</h2>
				<h2>Matches</h2>
				<PlayerMatchTabs params={params} player={response.player} matches={response.matches} />
			</Container>
		);
	}
	return (
		<>
			<Page id='player-page'>
				<Menu />
				<Page.Container>
					<Title />
					<Contents />
				</Page.Container>
			</Page>
		</>
	);
};

export default Component;
