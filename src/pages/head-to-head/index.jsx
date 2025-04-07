import React from 'react';
import Request from '../../js/request';

import { Link } from 'react-router';
import { useParams } from 'react-router';

import { Container } from '../../components/ui';

import Page from '../../components/page';
import Flag from '../../components/flag';
import PlayerSummary from '../../components/player-summary';
import Matches from '../../components/matches';
import Menu from '../../components/menu';
import { useQuery } from '@tanstack/react-query';


import { PlayerRankingComparisonChart } from '../../components/player-ranking-charts';

let Component = () => {
	const params = useParams();
	const queryKey = `head-to-head/${JSON.stringify(useParams())}`;
	const { data:response,  isPending, isError, error } = useQuery({queryKey:[queryKey], queryFn:fetch});

	async function fetch() {
		try {
			let sql = '';
			let format = [];

			sql = '';
			sql += 'SELECT * FROM matches ';
			sql += `WHERE  `;
			sql += `(winner = ? AND loser = ?) `;
			sql += `OR  `;
			sql += `(winner = ? AND loser = ?) `;
			sql += 'ORDER BY date DESC; ';

			format = format.concat([params.A, params.B, params.B, params.A]);

			sql += 'SELECT * FROM players WHERE name = ?; ';
			format = format.concat([params.A]);

			sql += 'SELECT * FROM players WHERE name = ?; ';
			format = format.concat([params.B]);

			sql += 'SELECT * FROM matches WHERE winner = ? OR loser = ?; ';
			format = format.concat([params.A, params.A]);

			sql += 'SELECT * FROM matches WHERE winner = ? OR loser = ?; ';
			format = format.concat([params.B, params.B]);

			let request = new Request();
			let [matches, [playerOne], [playerTwo], playerOneMatches, playerTwoMatches] = await request.get('query', { database: 'atp', sql: sql, format: format });
			let response = { matches: matches, playerOne: playerOne, playerTwo: playerTwo, playerOneMatches: playerOneMatches, playerTwoMatches: playerTwoMatches };

			return response;

		} catch (error) {
			console.log(error.message);
		}
	}

	function Title() {
		let link = '';
		let title = `${params.A} vs ${params.B}`;
		let { playerOne, playerTwo } = response || {};

		if (playerOne && playerTwo && playerOne.atpid && playerTwo.atpid) {
			link = `https://www.atptour.com/en/players/atp-head-2-head/FOO/${playerOne.atpid}/${playerTwo.atpid}`;
		}
		if (link == '') {
			return <h1>{title}</h1>;
		}

		return (
			<h1>
				<Link target='_blank' to={link}>
					{title}
				</Link>
			</h1>
		);
	}

	function Summary({ matches, player }) {
		return (
			<>
				<h2>
					<Link to={`/player/${player.name}`}>{player.name}</Link>
					{`, ${player.country} `}
					<Flag country={player.country}></Flag>
				</h2>
				<PlayerSummary player={player} matches={matches} />
			</>
		);
	}

	function HeadToHeadRankingChart() {
		let now = new Date();

		let { playerOne, playerOneMatches, playerTwo, playerTwoMatches } = response;

		return (
			<>
				<h2>Ranking</h2>
				<PlayerRankingComparisonChart className='border-none-200 border-1' playerA={{ player: playerOne, matches: playerOneMatches }} playerB={{ player: playerTwo, matches: playerTwoMatches }} />
			</>
		);
	}
	function Content() {
		if (!response) {
			return;
		}
		let { matches, playerOne, playerTwo, playerOneMatches, playerTwoMatches } = response;

		return (
			<Container>
				<Summary matches={playerOneMatches} player={playerOne} />
				<Summary matches={playerTwoMatches} player={playerTwo} />
				<HeadToHeadRankingChart />
				<h2>Matcher</h2>
				<Matches matches={matches} owner='head-to-head' />
			</Container>
		);
	}
	return (
		<>
			<Page>
				<Menu />
				<Container className='px-15'>
					<Title />
					<Content />
				</Container>
			</Page>
		</>
	);
};

export default Component;
