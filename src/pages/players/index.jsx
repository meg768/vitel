import React from 'react';
import { useSearchParams } from 'react-router';

import Cross2Icon from '../../assets/radix-icons/cross-2.svg?react';
import SearchIcon from '../../assets/radix-icons/magnifying-glass.svg?react';
import StarFilledIcon from '../../assets/radix-icons/star-filled.svg?react';
import Flag from '../../components/flag';
import Page from '../../components/page';
import Players from '../../components/players';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import Link from '../../components/ui/link';
import LocalStorage from '../../js/local-storage';
import { useSQL } from '../../js/vitel.js';

const FAVORITES_STORAGE_KEY = 'vitel';
const FAVORITES_KEY = 'favorite-player-ids';

export default function PlayersPage() {
	const [searchParams] = useSearchParams();
	const [searchTerm, setSearchTerm] = React.useState('');
	const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');
	const [favoritePlayerIds, setFavoritePlayerIds] = React.useState(() => {
		const storedIds = new LocalStorage({ key: FAVORITES_STORAGE_KEY }).get(FAVORITES_KEY, []);
		return Array.isArray(storedIds) ? storedIds : [];
	});
	const [selectedFavoriteIds, setSelectedFavoriteIds] = React.useState([]);
	const searchInputRef = React.useRef(null);
	let query = searchParams.get('query') || {};

	React.useEffect(() => {
		const timer = window.setTimeout(() => {
			setDebouncedSearchTerm(searchTerm.trim());
		}, 350);

		return () => window.clearTimeout(timer);
	}, [searchTerm]);

	if (query) {
		try {
			query = JSON.parse(decodeURIComponent(query));
		} catch (error) {
			query = {};
		}
	}

	let { sql, format } = query;
	const isSearching = debouncedSearchTerm.length >= 1;

	if (isSearching) {
		sql = `
			SELECT *
			FROM players
			WHERE UPPER(id) = UPPER(?) OR LOWER(name) LIKE LOWER(?)
			ORDER BY (active = 1) DESC, (rank IS NULL) ASC, rank ASC, name ASC
			LIMIT 25
		`;
		format = [debouncedSearchTerm, `%${debouncedSearchTerm}%`];
	} else if (!sql) {
		sql = `SELECT * FROM players WHERE NOT rank IS NULL ORDER BY rank LIMIT 100`;
	}

	const { data: players, error, isFetching } = useSQL({
		sql,
		format,
		placeholderData: previousPlayers => previousPlayers
	});
	const favoritePlaceholders = favoritePlayerIds.map(() => '?').join(', ');
	const { data: favoritePlayers = [], error: favoriteError } = useSQL({
		sql: favoritePlayerIds.length
			? `SELECT * FROM players WHERE id IN (${favoritePlaceholders})`
			: 'SELECT * FROM players WHERE 1 = 0',
		format: favoritePlayerIds
	});
	const orderedFavoritePlayers = favoritePlayerIds
		.map(playerId => favoritePlayers.find(player => player.id === playerId))
		.filter(Boolean);

	function removeFavorite(playerId) {
		const nextFavoritePlayerIds = favoritePlayerIds.filter(id => id !== playerId);
		new LocalStorage({ key: FAVORITES_STORAGE_KEY }).set(FAVORITES_KEY, nextFavoritePlayerIds);
		setFavoritePlayerIds(nextFavoritePlayerIds);
		setSelectedFavoriteIds(current => current.filter(id => id !== playerId));
	}

	function toggleSelectedFavorite(playerId) {
		setSelectedFavoriteIds(current => {
			if (current.includes(playerId)) {
				return current.filter(id => id !== playerId);
			}

			return current.length < 2 ? [...current, playerId] : [current[1], playerId];
		});
	}

	function Favorites() {
		if (!favoritePlayerIds.length) {
			return null;
		}

		const compareLink = selectedFavoriteIds.length === 2
			? `/head-to-head/${selectedFavoriteIds[0]}/${selectedFavoriteIds[1]}`
			: null;

		return (
			<section className='mb-5'>
				<Page.Title level={2}>Favoriter</Page.Title>
				{favoriteError ? (
					<Page.Warning>Kunde inte läsa in favoriterna just nu.</Page.Warning>
				) : (
					<div className='overflow-hidden rounded-lg border border-primary-300 dark:border-primary-700'>
						{orderedFavoritePlayers.map(player => {
							const isSelected = selectedFavoriteIds.includes(player.id);

							return (
								<div
									key={player.id}
									className='flex items-center gap-3 border-b border-primary-300 px-3 py-2 last:border-b-0 dark:border-primary-700'
								>
									<input
										type='checkbox'
										checked={isSelected}
										onChange={() => toggleSelectedFavorite(player.id)}
										aria-label={`Välj ${player.name} för jämförelse`}
										className='h-4 w-4 accent-primary-700'
									/>
									<Flag className='w-6! h-6! border-1! border-current' country={player.country} />
									<Link className='min-w-0 flex-1 font-semibold' to={`/player/${player.id}`}>
										{player.name}
										{player.country ? <span className='ml-2 text-sm font-normal text-primary-700 dark:text-primary-300'>({player.country})</span> : null}
									</Link>
									<button
										type='button'
										onClick={() => removeFavorite(player.id)}
										aria-label={`Ta bort ${player.name} från favoriter`}
										className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-400 text-primary-700 hover:bg-primary-100 dark:border-primary-600 dark:text-primary-300 dark:hover:bg-primary-800'
									>
										<StarFilledIcon className='h-4 w-4 bg-transparent' />
									</button>
								</div>
							);
						})}
					</div>
				)}
				<div className='mt-3 flex items-center justify-between gap-3'>
					<span className='text-sm text-primary-700 dark:text-primary-300'>
						{selectedFavoriteIds.length === 2 ? 'Två spelare valda.' : 'Välj två spelare att jämföra.'}
					</span>
					<Button link={compareLink || undefined} disabled={!compareLink}>Jämför spelare</Button>
				</div>
			</section>
		);
	}
	let statusBarStatus = 'ready';
	let statusBarMessage = players
		? `Visar ${players.length} rankade spelare.`
		: 'Läser in rankade spelare…';

	if (error) {
		statusBarStatus = 'warning';
		statusBarMessage = 'Kunde inte läsa in spelare just nu.';
	} else if (isFetching) {
		statusBarStatus = 'loading';
		statusBarMessage = isSearching
			? `Söker efter “${debouncedSearchTerm}”…`
			: 'Läser in rankade spelare…';
	} else if (isSearching) {
		statusBarMessage = `Hittade ${players?.length ?? 0} spelare för “${debouncedSearchTerm}”.`;
	} else if (query.title) {
		statusBarMessage = `Visar ${players?.length ?? 0} spelare i det valda urvalet.`;
	}

	function Content() {
		return (
			<>
				<Page.Title className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
					<span className='bg-transparent'>{query.title ? query.title : 'Spelare'}</span>
					<label className='relative block w-full bg-transparent sm:w-80'>
						<span className='sr-only'>Sök spelare</span>
						<SearchIcon className='pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 bg-transparent text-primary-100 dark:text-primary-500' />
						<Input
							ref={searchInputRef}
							type='text'
							value={searchTerm}
							onChange={event => setSearchTerm(event.target.value)}
							onKeyDown={event => {
								if (event.key === 'Escape') {
									setSearchTerm('');
									event.currentTarget.blur();
								}
							}}
							placeholder='Sök spelare'
							spellCheck={false}
							className='w-full rounded-full border border-primary-500 bg-primary-700 py-2 pl-10 pr-10 text-sm font-normal normal-case tracking-normal text-primary-50 placeholder:text-primary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-400 dark:border-primary-500 dark:bg-primary-900 dark:text-primary-50 dark:placeholder:text-primary-400'
						/>
						{searchTerm ? (
							<button
								type='button'
								onClick={() => {
									setSearchTerm('');
									searchInputRef.current?.focus();
								}}
								className='absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-primary-100 hover:bg-primary-600 hover:text-primary-50 dark:text-primary-500 dark:hover:bg-primary-800 dark:hover:text-primary-100'
								aria-label='Rensa sökning'
								title='Rensa sökning'
							>
								<Cross2Icon className='h-4 w-4 bg-transparent' />
							</button>
						) : null}
					</label>
				</Page.Title>
				<Page.Container>
					<Favorites />
					{error ? (
						<Page.Error>Misslyckades med att läsa in spelare - {error.message}</Page.Error>
					) : !players ? (
						<Page.Loading>Läser in spelare...</Page.Loading>
					) : isSearching && players.length === 0 ? (
						<Page.Information>Inga spelare matchar “{debouncedSearchTerm}”</Page.Information>
					) : (
						<Players players={players} rankFirst />
					)}
				</Page.Container>
			</>
		);
	}

	return (
		<Page>
			<Page.Menu />
			<Page.Content>
				{Content()}
			</Page.Content>
			<Page.StatusBar status={statusBarStatus}>{statusBarMessage}</Page.StatusBar>
		</Page>
	);
}
