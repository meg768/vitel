import { useParams } from 'react-router';

import Flag from '../../components/flag';
import Matches from '../../components/matches';
import Page from '../../components/page';
import { PlayerRankingComparisonChart } from '../../components/player-ranking-charts';
import PlayerSummary from '../../components/player-summary';
import Link from '../../components/ui/link';
import { useSQL } from '../../js/vitel';

let Component = () => {
	function fetch() {
		const params = useParams();

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

		return useSQL({ sql: sql, format: format });

		//let [matches, [playerOne], [playerTwo], playerOneMatches, playerTwoMatches] = await mysql.query({ sql: sql, format: format });
		//let response = { matches: matches, playerOne: playerOne, playerTwo: playerTwo, playerOneMatches: playerOneMatches, playerTwoMatches: playerTwoMatches };
	}

	function Title({ matches, playerOne, playerTwo }) {
		let link = '';
		let title = `${playerOne.name} vs ${playerTwo.name}`;
		let playerOneWins = matches.filter(match => match.winner_id == playerOne.id).length;
		let playerTwoWins = matches.filter(match => match.winner_id == playerTwo.id).length;

		if (playerOneWins > 0 || playerTwoWins > 0) {
			title += ` (${playerOneWins} - ${playerTwoWins})`;
		}

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
					<Flag className='mr-1 w-10! h-10! border-1 border-current' country={player.country}></Flag>
					<div>
						<Link to={`/player/${player.id}`}>{player.name}</Link>
						{`, ${player.country} `}
					</div>
				</Page.Title>
				<PlayerSummary player={player} matches={matches} />
			</div>
		);
	}

	function HeadToHeadRankingChart({ playerOne, playerOneMatches, playerTwo, playerTwoMatches }) {
		let now = new Date();

		return (
			<>
				<Page.Title level={2}>Ranking</Page.Title>
				<PlayerRankingComparisonChart className='' playerA={{ player: playerOne, matches: playerOneMatches }} playerB={{ player: playerTwo, matches: playerTwoMatches }} />
			</>
		);
	}
	function Content() {
		let { data, error } = fetch();

		if (error) {
			return <Page.Error>Misslyckades med att läsa in spelare - {error.message}</Page.Error>;
		}

		if (!data) {
			return <Page.Loading>Läser in spelare...</Page.Loading>;
		}

		let [matches, [playerOne], [playerTwo], playerOneMatches, playerTwoMatches] = data;
		let response = { matches: matches, playerOne: playerOne, playerTwo: playerTwo, playerOneMatches: playerOneMatches, playerTwoMatches: playerTwoMatches };

		return (
			<>
				<Title matches={matches} playerOne={playerOne} playerTwo={playerTwo} />
				<Page.Container>
					<Summary matches={playerOneMatches} player={playerOne} />
					<Summary matches={playerTwoMatches} player={playerTwo} />
					<HeadToHeadRankingChart {...response} />
					<Page.Title level={2}>Matcher</Page.Title>
					<Matches matches={matches} owner='head-to-head' />
				</Page.Container>
			</>
		);
	}

	return (
		<Page id='events-page'>
			<Page.Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
};

export default Component;
