import React from 'react';
import { useSearchParams } from 'react-router';

import Cross2Icon from '../../assets/radix-icons/cross-2.svg?react';
import SearchIcon from '../../assets/radix-icons/magnifying-glass.svg?react';
import Page from '../../components/page';
import Players from '../../components/players';
import Input from '../../components/ui/input';
import { useSQL } from '../../js/vitel.js';

export default function PlayersPage() {
	const [searchParams] = useSearchParams();
	const [searchTerm, setSearchTerm] = React.useState('');
	const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');
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
