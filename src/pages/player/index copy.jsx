import './index.scss';

import React from 'react';
import Request from '../../js/request';
import { Link } from 'react-router';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Button, Container } from '../../components/ui';


import Page from '../../components/page';
import PlayerSummary from '../../components/player-summary';
import Menu from '../../components/menu';

import Matches from '../../components/matches';
import Flag from '../../components/flag';
import Tabs from '../../components/ui/tabs';

import {PlayerRankingChart}  from '../../components/player-ranking-charts';


function PlayerMatches({ matches, player }) {
	return (
		<>
			<Matches matches={matches} owner={player.name} />
		</>
	);
}

function PlayerMatchTabs({ matches, player }) {
	let grandSlamsWins = matches.filter((match) => {
		return match.round == 'F' && match.level == 'Grand Slam' && match.winner == player.name;
	});

	let mastersWins = matches.filter((match) => {
		return match.round == 'F' && match.level == 'Masters' && match.winner == player.name;
	});

	let atp500Wins = matches.filter((match) => {
		return match.round == 'F' && match.level == 'ATP-500' && match.winner == player.name;
	});

	let atp250Wins = matches.filter((match) => {
		return match.round == 'F' && match.level == 'ATP-250' && match.winner == player.name;
	});

	let titles = matches.filter((match) => {
		return match.round == 'F' && match.winner == player.name;
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

			<Tabs.Content value='Finaler'>
				<Matches player={player} matches={finals} owner={player.name} />
			</Tabs.Content>

			<Tabs.Content value='Karriär'>
				<Matches player={player} matches={matches} owner={player.name} />
			</Tabs.Content>

			<Tabs.Content value='Titlar'>
				<Matches player={player} matches={titles} owner={player.name} />
			</Tabs.Content>

			<Tabs.Content value='Grand Slams'>
				<Matches player={player} matches={grandSlamsWins} owner={player.name} />
			</Tabs.Content>

			<Tabs.Content value='Masters'>
				<Matches player={player} matches={mastersWins} owner={player.name} />
			</Tabs.Content>

			<Tabs.Content value='ATP-500'>
				<Matches player={player} matches={atp500Wins} owner={player.name} />
			</Tabs.Content>

			<Tabs.Content value='ATP-250'>
				<Matches player={player} matches={atp250Wins} owner={player.name} />
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
			<Matches matches={matches} owner={player.name} />
		</>
	);
}
let Component = () => {
	const params = useParams();
	const queryKey = `player/${JSON.stringify(useParams())}`;
	const queryOptions = {};
	const { data:response,  isPending, isError, error } = useQuery({queryKey:[queryKey], queryFn:fetch});

	async function fetch() {

		let sql = '';
		sql += `SELECT * FROM ?? `;
		sql += `WHERE winner = ? `;
		sql += `OR loser = ? `;
		sql += `ORDER BY date DESC, `;
		sql += `FIELD(round, 'F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128', 'BR'); `;

		sql += `SELECT * FROM ?? `;
		sql += `WHERE name = ?; `;

		let format = ['matches', params.name, params.name, 'players', params.name];

		let request = new Request();
		let result = await request.get('query', { database: 'atp', sql: sql, format: format });

		let player = result[1][0];
		let matches = result[0];
		let response = { matches: matches, player: player };

		return response;
	}

	function Title() {

		if (!response || !response.player.country) {
			return <h1>{params.name}</h1>;
		}

		let { player } = response;

		return (
			<h1>
				<Link target='_blank' to={`https://www.atptour.com/en/players/X/${player.atpid}/overview`}>
					{player.name}
				</Link>
				{`, ${player.country} `} 
				<Flag country={player.country}></Flag>
			</h1>
		);
	}

	function Contents() {
		if (!response) {
			return;
		}

		return (
			<Container>
				<h2>Summering</h2>
				<PlayerSummary player={response.player} matches={response.matches} />
				<h2>Ranking</h2>
				<PlayerRankingChart className='border-none-200 border-1' player={response.player} matches={response.matches} />
				<h2>Matcher</h2>
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
				<Container className='px-15'>
						<Title />
						<Contents />
				</Container>
			</Page>
		</>
	);
};

export default Component;
