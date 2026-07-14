import React from 'react';
import { useSearchParams } from 'react-router';

import Cross2Icon from '../../assets/radix-icons/cross-2.svg?react';
import SearchIcon from '../../assets/radix-icons/magnifying-glass.svg?react';
import StarIcon from '../../assets/radix-icons/star.svg?react';
import StarFilledIcon from '../../assets/radix-icons/star-filled.svg?react';
import Page from '../../components/page';
import Players from '../../components/players';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import { getFavoritePlayerIds } from '../../js/player-favorites';
import { useSQL } from '../../js/vitel.js';

const comparisonStorageKey = 'vitel-player-comparison';

export default function PlayersPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const initialSearchTerm = searchParams.get('search') || '';
	const [searchTerm, setSearchTerm] = React.useState(initialSearchTerm);
	const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState(initialSearchTerm);
	const [favoritePlayerIds] = React.useState(getFavoritePlayerIds);
	const [comparisonPlayerCache, setComparisonPlayerCache] = React.useState({});
	const searchInputRef = React.useRef(null);
	const comparisonSelectionRef = React.useRef(false);
	const comparisonPlayerIdsRef = React.useRef([]);
	let query = searchParams.get('query') || {};
	const showFavorites = searchParams.get('favorites') === '1';
	const comparisonParam = searchParams.get('compare');
	const storedComparison = window.sessionStorage.getItem(comparisonStorageKey) || '';
	const comparisonPlayerIds = (comparisonParam ?? storedComparison)
		.split(',')
		.map(value => value.trim())
		.filter(Boolean)
		.slice(-2);
	comparisonPlayerIdsRef.current = comparisonPlayerIds;

	React.useEffect(() => {
		if (comparisonParam !== null) {
			if (comparisonPlayerIds.length) {
				window.sessionStorage.setItem(comparisonStorageKey, comparisonPlayerIds.join(','));
			} else {
				window.sessionStorage.removeItem(comparisonStorageKey);
			}
		}
	}, [comparisonParam, comparisonPlayerIds.join(',')]);

	React.useEffect(() => {
		if (comparisonSelectionRef.current && searchTerm.trim() === '') {
			comparisonSelectionRef.current = false;
			return undefined;
		}

		const timer = window.setTimeout(() => {
			const nextSearchTerm = searchTerm.trim();
			setDebouncedSearchTerm(nextSearchTerm);
			setSearchParams(currentParams => {
				const nextParams = new URLSearchParams(currentParams);

				if (nextSearchTerm) {
					nextParams.set('search', nextSearchTerm);
				} else {
					nextParams.delete('search');
				}

				return nextParams;
			}, { replace: true });
		}, 350);

		return () => window.clearTimeout(timer);
	}, [searchTerm, setSearchParams]);

	if (query) {
		try {
			query = JSON.parse(decodeURIComponent(query));
		} catch (error) {
			query = {};
		}
	}

	let { sql, format } = query;
	const isSearching = debouncedSearchTerm.length >= 1;

	if (isSearching || showFavorites) {
		const conditions = [];
		format = [];

		if (isSearching) {
			conditions.push('(UPPER(id) = UPPER(?) OR LOWER(name) LIKE LOWER(?))');
			format.push(debouncedSearchTerm, `%${debouncedSearchTerm}%`);
		}

		if (showFavorites) {
			if (favoritePlayerIds.length) {
				conditions.push(`id IN (${favoritePlayerIds.map(() => '?').join(', ')})`);
				format.push(...favoritePlayerIds);
			} else {
				conditions.push('1 = 0');
			}
		}

		sql = `
			SELECT *
			FROM players
			WHERE ${conditions.join(' AND ')}
			ORDER BY (active = 1) DESC, (rank IS NULL) ASC, rank ASC, name ASC
			LIMIT ${isSearching ? 25 : 100}
		`;
	} else if (!sql) {
		sql = `SELECT * FROM players WHERE NOT rank IS NULL ORDER BY rank LIMIT 100`;
	}

	const { data: players, error, isFetching } = useSQL({
		sql,
		format,
		placeholderData: previousPlayers => previousPlayers
	});
	const comparisonPlaceholders = comparisonPlayerIds.map(() => '?').join(', ');
	const { data: comparisonRows = [] } = useSQL({
		sql: comparisonPlayerIds.length
			? `SELECT * FROM players WHERE id IN (${comparisonPlaceholders})`
			: 'SELECT * FROM players WHERE 1 = 0',
		format: comparisonPlayerIds
	});
	const comparisonPlayers = comparisonPlayerIds
		.map(playerId => comparisonPlayerCache[playerId] ?? comparisonRows.find(player => player.id === playerId))
		.filter(Boolean);

	React.useEffect(() => {
		if (!comparisonRows.length) {
			return;
		}

		setComparisonPlayerCache(current => {
			const next = { ...current };
			comparisonRows.forEach(player => {
				next[player.id] = player;
			});
			return next;
		});
	}, [comparisonRows]);

	function updateComparison(nextPlayerIds) {
		if (nextPlayerIds.length) {
			window.sessionStorage.setItem(comparisonStorageKey, nextPlayerIds.join(','));
		} else {
			window.sessionStorage.removeItem(comparisonStorageKey);
		}

		setSearchParams(currentParams => {
			const nextParams = new URLSearchParams(currentParams);

			if (nextPlayerIds.length) {
				nextParams.set('compare', nextPlayerIds.join(','));
			} else {
				nextParams.delete('compare');
			}

			return nextParams;
		});
	}

	function toggleComparisonPlayer(player) {
		setComparisonPlayerCache(current => ({ ...current, [player.id]: player }));
		const currentIds = comparisonPlayerIdsRef.current;
		const playerWasSelected = currentIds.includes(player.id);
		const nextIds = playerWasSelected
			? currentIds.filter(playerId => playerId !== player.id)
			: currentIds.length < 2
				? [...currentIds, player.id]
				: [currentIds[1], player.id];

		updateComparison(nextIds);
		comparisonSelectionRef.current = true;
		setSearchTerm('');
		window.requestAnimationFrame(() => searchInputRef.current?.focus());
	}

	function removeComparisonPlayer(playerId) {
		updateComparison(comparisonPlayerIds.filter(id => id !== playerId));
		window.requestAnimationFrame(() => searchInputRef.current?.focus());
	}

	function closeComparison() {
		updateComparison([]);
		window.requestAnimationFrame(() => searchInputRef.current?.focus());
	}

	function toggleFavorites() {
		setSearchParams(currentParams => {
			const nextParams = new URLSearchParams(currentParams);

			if (showFavorites) {
				nextParams.delete('favorites');
			} else {
				nextParams.set('favorites', '1');
			}

			return nextParams;
		});
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
		statusBarMessage = showFavorites
			? 'Läser in favoritspelare…'
			: isSearching
				? `Söker efter “${debouncedSearchTerm}”…`
				: 'Läser in rankade spelare…';
	} else if (showFavorites && isSearching) {
		statusBarMessage = `Hittade ${players?.length ?? 0} favoriter för “${debouncedSearchTerm}”.`;
	} else if (showFavorites) {
		statusBarMessage = `Visar ${players?.length ?? 0} favoritspelare.`;
	} else if (isSearching) {
		statusBarMessage = `Hittade ${players?.length ?? 0} spelare för “${debouncedSearchTerm}”.`;
	} else if (query.title) {
		statusBarMessage = `Visar ${players?.length ?? 0} spelare i det valda urvalet.`;
	} else if (comparisonPlayers.length === 1) {
		statusBarStatus = 'info';
		statusBarMessage = `${comparisonPlayers[0].name} är vald. Sök efter en spelare till.`;
	} else if (comparisonPlayers.length === 2) {
		statusBarMessage = `${comparisonPlayers[0].name} och ${comparisonPlayers[1].name} är redo att jämföras.`;
	}

	function ComparisonSelection() {
		const compareLink = comparisonPlayerIds.length === 2
			? `/head-to-head/${comparisonPlayerIds[0]}/${comparisonPlayerIds[1]}`
			: null;
		const isVisible = comparisonPlayers.length > 0;

		return (
			<div
				className={`grid transition-[grid-template-rows,opacity,transform,margin-bottom] duration-350 ease-in-out ${isVisible
					? 'mb-3 grid-rows-[1fr] translate-y-0 opacity-100'
					: 'pointer-events-none mb-0 grid-rows-[0fr] -translate-y-1 opacity-0'}`}
				aria-hidden={!isVisible}
			>
				<div className='min-h-0 overflow-hidden'>
				<div className='flex min-h-14 flex-wrap items-center gap-2 rounded-lg border border-primary-300 bg-primary-100 px-3 py-2 dark:border-primary-700 dark:bg-primary-800'>
				{comparisonPlayers.map(player => (
					<button
						key={player.id}
						type='button'
						onClick={() => removeComparisonPlayer(player.id)}
						className='flex h-8 items-center gap-1 rounded-full border border-primary-400 bg-primary-50 px-2.5 py-1 text-sm text-primary-900 transition-colors hover:bg-primary-200 dark:border-primary-600 dark:bg-primary-900 dark:text-primary-100 dark:hover:bg-primary-700'
						aria-label={`Ta bort ${player.name} från jämförelsen`}
					>
						<span className='bg-transparent'>{player.name}</span>
						<Cross2Icon className='h-3.5 w-3.5 bg-transparent' />
					</button>
				))}
				{comparisonPlayers.length > 0 ? (
					<Button
						className='h-8 px-4! py-1!'
						link={compareLink || undefined}
						disabled={!compareLink}
					>
						Jämför
					</Button>
				) : null}
				<button
					type='button'
					onClick={closeComparison}
					className='ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-transparent text-primary-600 transition-colors hover:bg-primary-200 hover:text-primary-900 dark:text-primary-400 dark:hover:bg-primary-700 dark:hover:text-primary-100'
					aria-label='Stäng jämförelse'
				>
					<Cross2Icon className='h-4 w-4 bg-transparent' />
				</button>
				</div>
				</div>
			</div>
		);
	}

	function Content() {
		return (
			<>
				<Page.Title className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
					<div className='flex items-center gap-3 bg-transparent'>
						<span className='bg-transparent'>{query.title ? query.title : 'Spelare'}</span>
						<button
							type='button'
							onClick={toggleFavorites}
							className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary-400 bg-transparent text-primary-100 transition-colors hover:border-primary-200 hover:bg-primary-600 hover:text-primary-50 dark:border-primary-500 dark:hover:border-primary-300 dark:hover:bg-primary-700 ${showFavorites ? 'text-primary-50 dark:text-primary-100' : 'dark:text-primary-300'}`}
							aria-label={showFavorites ? 'Visa alla spelare' : 'Visa favoritspelare'}
							aria-pressed={showFavorites}
						>
							{showFavorites ? (
								<StarFilledIcon className='h-5 w-5 bg-transparent' />
							) : (
								<StarIcon className='h-5 w-5 bg-transparent' />
							)}
						</button>
					</div>
					<div className='relative block w-full bg-transparent sm:w-80'>
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
							aria-label='Sök spelare'
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
					</div>
				</Page.Title>
				<Page.Container>
					{ComparisonSelection()}
					{error ? (
						<Page.Error>Misslyckades med att läsa in spelare - {error.message}</Page.Error>
					) : !players ? (
						<Page.Loading>Läser in spelare...</Page.Loading>
					) : players.length === 0 && showFavorites ? (
						<Page.Information>{isSearching
							? `Inga favoriter matchar “${debouncedSearchTerm}”.`
							: 'Du har inga favoritspelare ännu.'}</Page.Information>
					) : isSearching && players.length === 0 ? (
						<Page.Information>Inga spelare matchar “{debouncedSearchTerm}”.</Page.Information>
					) : (
						<Players
							players={players}
							rankFirst
							rowKey='id'
							isRowSelected={row => comparisonPlayerIds.includes(row.id)}
							highlightSelectedRows={false}
							onComparePlayer={toggleComparisonPlayer}
						/>
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
