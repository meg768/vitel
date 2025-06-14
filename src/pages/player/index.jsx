import { useParams } from 'react-router';

import Link from '../../components/ui/link';
import Tabs from '../../components/ui/tabs';

import Page from '../../components/page';
import PlayerSummary from '../../components/player-summary';
import Matches from '../../components/matches';
import Flag from '../../components/flag';

import { PlayerRankingChart } from '../../components/player-ranking-charts';

import { useSQL } from '../../js/vitel';

function PlayerMatchTabs({ matches, player }) {
	let grandSlamsWins = matches.filter(match => {
		return match.round == 'F' && match.event_type == 'Grand Slam' && match.winner == player.name;
	});

	let mastersWins = matches.filter(match => {
		return match.round == 'F' && match.event_type == 'Masters' && match.winner == player.name;
	});

	let atp500Wins = matches.filter(match => {
		return match.round == 'F' && match.event_type == 'ATP-500' && match.winner == player.name;
	});

	let atp250Wins = matches.filter(match => {
		return match.round == 'F' && match.event_type == 'ATP-250' && match.winner == player.name;
	});

	let titles = matches.filter(match => {
		return match.round == 'F' && match.winner_id == player.id;
	});

	let finals = matches.filter(match => {
		return match.round == 'F';
	});

	let wins = matches.filter(match => {
		return match.winner_id == player.id;
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
				<MatchTab title='Vinster' matches={wins} />
				<MatchTab title='Finaler' matches={finals} />
				<MatchTab title='Grand Slams' matches={grandSlamsWins} />
				<MatchTab title='Masters' matches={mastersWins} />
				<MatchTab title='ATP-500' matches={atp500Wins} />
				<MatchTab title='ATP-250' matches={atp250Wins} />
			</Tabs.List>

			<Tabs.Content value='Vinster' className='overflow-x-auto'>
				<Matches player={player} matches={wins} owner={player.id} />
			</Tabs.Content>

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

function Component () {

	function fetch() {
		const params = useParams();

		let sql = '';
		sql += `SELECT * FROM flatly `;
		sql += `WHERE winner_id = ? `;
		sql += `OR loser_id = ? `;
		sql += `ORDER BY event_date DESC, `;
		sql += `FIELD(round, 'F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128', 'Q3', 'Q2', 'Q1', 'BR') ASC; `;

		sql += `SELECT * FROM players `;
		sql += `WHERE id = ?; `;

		let format = [params.id, params.id, params.id];

		return useSQL({ sql, format, cache: 1000 * 60 * 5 });
	}

	function Title({ player }) {
		return (
			<Page.Title className='flex justify-left items-center gap-2'>
				<Flag className='h-10! border-1 border-current' country={player.country}></Flag>
				<div className='bg-transparent'>
					<Link target='_blank' to={`https://www.atptour.com/en/players/X/${player.id}/overview`}>
						{player.name}
					</Link>
					{`, ${player.country} `}
				</div>
			</Page.Title>
		);
	}

	function Content() {
		let { data:response, error } = fetch();

		if (error) {
			return <Page.Error>Misslyckades med att läsa in spelare - {error.message}</Page.Error>;
		}

		if (!response) {
			return <Page.Loading>Läser in spelare...</Page.Loading>;
		}


		let matches = response[0];
		let player = response[1][0];

		return (
			<>
				<Title player={player} />
				<Page.Container>
					<Page.Title level={2}>Översikt</Page.Title>
					<div className='overflow-x-auto'>
						<PlayerSummary player={player} matches={matches} />
					</div>

					<Page.Title level={2}>Ranking</Page.Title>
					<PlayerRankingChart className='' player={player} matches={matches} />

					<Page.Title level={2}>Matcher</Page.Title>
					<PlayerMatchTabs player={player} matches={matches} />
				</Page.Container>
			</>
		);
	}

	return (
		<Page id='live-page'>
			<Page.Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
};

export default Component;
