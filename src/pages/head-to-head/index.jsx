import { useParams } from 'react-router';

import Matches from '../../components/matches';
import Page from '../../components/page';
import { PlayerRankingComparisonChart } from '../../components/player-ranking-charts';
import PlayerSummary from '../../components/player-summary';
import Button from '../../components/ui/button';
import PlayerTitle from '../../components/player-title';
import Link from '../../components/ui/link';
import { useSQL } from '../../js/vitel';

let Component = () => {
	const params = useParams();
	let sql = '';
	let format = [];

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

	const { data, error } = useSQL({ sql, format });

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
				<Page.Title level={2} className='mb-1 mt-1'>
					<PlayerTitle player={player} nameTo={`/player/${player.id}`} nameTarget={null} />
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
					<div className='flex justify-center pt-4'>
						<Button link={`/head-to-head-details/${playerOne.id}/${playerTwo.id}`}>Visa mer statistik</Button>
					</div>
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
