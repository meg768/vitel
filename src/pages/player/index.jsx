import React from 'react';
import { useParams } from 'react-router';

import StarIcon from '../../assets/radix-icons/star.svg?react';
import StarFilledIcon from '../../assets/radix-icons/star-filled.svg?react';
import Matches from '../../components/matches';
import Page from '../../components/page';
import { PlayerRankingChart } from '../../components/player-ranking-charts';
import PlayerSummary from '../../components/player-summary';
import PlayerTitle from '../../components/player-title';
import Tabs from '../../components/ui/tabs';
import LocalStorage from '../../js/local-storage';
import { useSQL } from '../../js/vitel';

const FAVORITES_STORAGE_KEY = 'vitel';
const FAVORITES_KEY = 'favorite-player-ids';

function PlayerMatchTabs({ matches, player }) {
	const contentRef = React.useRef(null);
	const [contentMinHeight, setContentMinHeight] = React.useState(0);

	function preserveContentHeight() {
		if (!contentRef.current) {
			return;
		}

		setContentMinHeight(current => Math.max(current, contentRef.current.offsetHeight));
	}

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
		<Tabs.Root className='' defaultValue='Karriär' onValueChange={preserveContentHeight}>
			<Tabs.List className='flex '>
				<MatchTab title='Karriär' matches={matches} />
				<MatchTab title='Vinster' matches={wins} />
				<MatchTab title='Finaler' matches={finals} />
				<MatchTab title='Grand Slams' matches={grandSlamsWins} />
				<MatchTab title='Masters' matches={mastersWins} />
				<MatchTab title='ATP-500' matches={atp500Wins} />
				<MatchTab title='ATP-250' matches={atp250Wins} />
			</Tabs.List>

			<div ref={contentRef} style={contentMinHeight ? { minHeight: contentMinHeight } : undefined}>
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
			</div>
		</Tabs.Root>
	);
}

function Component () {
	const { id } = useParams();
	const [favoritePlayerIds, setFavoritePlayerIds] = React.useState(() => {
		const storedIds = new LocalStorage({ key: FAVORITES_STORAGE_KEY }).get(FAVORITES_KEY, []);
		return Array.isArray(storedIds) ? storedIds : [];
	});
	const isFavorite = favoritePlayerIds.includes(id);

	function toggleFavorite() {
		const nextFavoritePlayerIds = isFavorite
			? favoritePlayerIds.filter(playerId => playerId !== id)
			: [...favoritePlayerIds, id];

		new LocalStorage({ key: FAVORITES_STORAGE_KEY }).set(FAVORITES_KEY, nextFavoritePlayerIds);
		setFavoritePlayerIds(nextFavoritePlayerIds);
	}

	let sql = '';
	sql += `SELECT * FROM flatly `;
	sql += `WHERE winner_id = ? `;
	sql += `OR loser_id = ? `;
	sql += `ORDER BY event_date DESC, `;
	sql += `FIELD(round, 'F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128', 'Q3', 'Q2', 'Q1', 'BR') ASC; `;

	sql += `SELECT * FROM players `;
	sql += `WHERE id = ?; `;

	let format = [id, id, id];
	const { data: response, error } = useSQL({ sql, format });

	function Title({ player }) {
		const favoriteLabel = isFavorite ? 'Ta bort från favoriter' : 'Lägg till i favoriter';

		return (
			<Page.Title className='flex items-center justify-between gap-3'>
				<PlayerTitle player={player} />
				<button
					type='button'
					onClick={toggleFavorite}
					className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary-400 bg-transparent text-primary-200 transition-colors hover:border-primary-200 hover:bg-primary-600 hover:text-primary-50 dark:border-primary-500 dark:text-primary-300 dark:hover:border-primary-300 dark:hover:bg-primary-700 dark:hover:text-primary-100'
					aria-label={favoriteLabel}
					aria-pressed={isFavorite}
				>
					{isFavorite ? (
						<StarFilledIcon className='h-5 w-5 bg-transparent text-primary-50 dark:text-primary-100' />
					) : (
						<StarIcon className='h-5 w-5 bg-transparent' />
					)}
				</button>
			</Page.Title>
		);
	}

	function Content() {
		if (error) {
			return <Page.Error>Misslyckades med att läsa in spelare - {error.message}</Page.Error>;
		}

		if (!response) {
			return <Page.Loading>Läser in spelare...</Page.Loading>;
		}


		let matches = response[0];
		let player = response[1][0];

		if (!player) {
			return <Page.Information>Spelaren hittades inte ({id}).</Page.Information>;
		}

		return (
			<>
				{Title({ player })}
				<Page.Container>
					<Page.Title level={4}>Översikt</Page.Title>
					<div className='overflow-x-auto'>
						<PlayerSummary player={player} matches={matches} />
					</div>

					<Page.Title level={4}>Ranking</Page.Title>
					<PlayerRankingChart className='' player={player} matches={matches} />

					<Page.Title level={4}>Matcher</Page.Title>
					<PlayerMatchTabs player={player} matches={matches} />
				</Page.Container>
			</>
		);
	}

	return (
		<Page id='live-page'>
			<Page.Menu />
			<Page.Content>
				{Content()}
			</Page.Content>
		</Page>
	);
};

export default Component;
