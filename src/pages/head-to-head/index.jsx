import React from 'react';
import mysql from '../../js/mysql-express';

import { Link } from 'react-router';
import { useParams } from 'react-router';

import { Container } from '../../components/ui';

import Page from '../../components/page';
import Flag from '../../components/flag';
import PlayerSummary from '../../components/player-summary';
import PlayerOverview from '../../components/player-overview';

import Matches from '../../components/matches';
import Menu from '../../components/menu';
import { useQuery } from '@tanstack/react-query';

import { PlayerRankingComparisonChart } from '../../components/player-ranking-charts';

let Component = () => {
	const params = useParams();
	const queryKey = `head-to-head/${JSON.stringify(useParams())}`;
	const { data: response, isPending, isError, error } = useQuery({ queryKey: [queryKey], queryFn: fetch });

	async function fetch() {
		try {
			let sql = '';
			let format = [];

			sql = '';
			sql += 'SELECT * FROM flatly ';
			sql += `WHERE  `;
			sql += `(winner_id = ? AND loser_id = ?) `;
			sql += `OR  `;
			sql += `(winner_id = ? AND loser_id = ?) `;
			sql += 'ORDER BY event_date DESC; ';

			format = format.concat([params.A, params.B, params.B, params.A]);

			sql += 'SELECT * FROM players WHERE id = ?; ';
			format = format.concat([params.A]);

			sql += 'SELECT * FROM players WHERE id = ?; ';
			format = format.concat([params.B]);

			sql += 'SELECT * FROM flatly WHERE winner_id = ? OR loser_id = ?; ';
			format = format.concat([params.A, params.A]);

			sql += 'SELECT * FROM flatly WHERE winner_id = ? OR loser_id = ?; ';
			format = format.concat([params.B, params.B]);

			let [matches, [playerOne], [playerTwo], playerOneMatches, playerTwoMatches] = await mysql.query({ sql: sql, format: format });
			let response = { matches: matches, playerOne: playerOne, playerTwo: playerTwo, playerOneMatches: playerOneMatches, playerTwoMatches: playerTwoMatches };

			return response;
		} catch (error) {
			console.log(error.message);
		}
	}

	function Title() {
		let { playerOne, playerTwo } = response || {};

		let link = '';
		let title = `${playerOne.name} vs ${playerTwo.name}`;

		if (playerOne && playerTwo && playerOne.id && playerTwo.id) {
			link = `https://www.atptour.com/en/players/atp-head-2-head/FOO/${playerOne.id}/${playerTwo.id}`;
		}
		if (link == '') {
			return <Page.Title>{title}</Page.Title>;
		}

		return (
			<Page.Title>
				<Link target='_blank' to={link}>
					{title}
				</Link>
			</Page.Title>
		);
	}

	function Summary({ matches, player }) {
		return (
			<div className=''>
				<Page.Title level={2} className='flex items-center mb-1 mt-1 gap-2'>
					<Flag className='mr-1 w-10! h-10!' country={player.country}></Flag>
					<div>
						<Link to={`/player/${player.id}`}>{player.name}</Link>
						{`, ${player.country} `}
					</div>
				</Page.Title>
				<PlayerSummary player={player} matches={matches} />
			</div>
		);
	}

	function HeadToHeadRankingChart() {
		let now = new Date();

		let { playerOne, playerOneMatches, playerTwo, playerTwoMatches } = response;

		return (
			<>
				<Page.Title level={2}>Ranking</Page.Title>
				<PlayerRankingComparisonChart className='' playerA={{ player: playerOne, matches: playerOneMatches }} playerB={{ player: playerTwo, matches: playerTwoMatches }} />
			</>
		);
	}
	function Content() {
		if (!response) {
			return;
		}
		let { matches, playerOne, playerTwo, playerOneMatches, playerTwoMatches } = response;

		return (
			<Page.Container>
				<Title />
				<Container>
					<Summary matches={playerOneMatches} player={playerOne} />
					<Summary matches={playerTwoMatches} player={playerTwo} />
					<HeadToHeadRankingChart />
					<Page.Title level={2}>Matcher</Page.Title>
					<Matches matches={matches} owner='head-to-head' />
				</Container>
			</Page.Container>
		);
	}
	return (
		<>
			<Page>
				<Menu />
				<Content />
			</Page>
		</>
	);
};

export default Component;
