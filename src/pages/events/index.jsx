import React from 'react';
import { useSearchParams } from 'react-router';

import Cross2Icon from '../../assets/radix-icons/cross-2.svg?react';
import SearchIcon from '../../assets/radix-icons/magnifying-glass.svg?react';
import Events from '../../components/events';
import Page from '../../components/page';
import Input from '../../components/ui/input';
import { useSQL } from '../../js/vitel.js';

function Component() {
	const [searchParams] = useSearchParams();
	const [searchTerm, setSearchTerm] = React.useState('');
	const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');
	const searchInputRef = React.useRef(null);
	let query = searchParams.get('query');

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

	query = query || {};
	let { sql, format } = query;
	const isSearching = debouncedSearchTerm.length >= 1;

	if (isSearching) {
		const normalizedTerm = debouncedSearchTerm.toLocaleLowerCase('sv-SE');
		const surfaceBySearchTerm = {
			grus: 'Clay',
			gräs: 'Grass',
			gras: 'Grass',
			hardcourt: 'Hard',
			hard: 'Hard',
			matta: 'Carpet'
		};
		const surfaceTerm = surfaceBySearchTerm[normalizedTerm] ?? debouncedSearchTerm;
		const containsTerm = `%${debouncedSearchTerm}%`;

		sql = `
			SELECT *
			FROM events
			WHERE LOWER(name) LIKE LOWER(?)
				OR LOWER(location) LIKE LOWER(?)
				OR LOWER(type) LIKE LOWER(?)
				OR LOWER(surface) LIKE LOWER(?)
			ORDER BY date DESC, name ASC
			LIMIT 100
		`;
		format = [containsTerm, containsTerm, containsTerm, `%${surfaceTerm}%`];
	} else if (!sql) {
		sql = `SELECT * FROM events WHERE date >= CURRENT_DATE - INTERVAL 1 YEAR ORDER BY date DESC LIMIT 100`;
		format = [];
	}

	const { data: events, error, isFetching } = useSQL({
		sql,
		format,
		placeholderData: previousEvents => previousEvents
	});
	let statusBarStatus = 'ready';
	let statusBarMessage = events
		? `Visar ${events.length} turneringar från det senaste året.`
		: 'Läser in turneringar…';

	if (error) {
		statusBarStatus = 'warning';
		statusBarMessage = 'Kunde inte läsa in turneringar just nu.';
	} else if (isFetching) {
		statusBarStatus = 'loading';
		statusBarMessage = isSearching
			? `Söker efter “${debouncedSearchTerm}”…`
			: 'Läser in turneringar…';
	} else if (isSearching) {
		statusBarMessage = `Hittade ${events?.length ?? 0} turneringar för “${debouncedSearchTerm}”.`;
	} else if (query.title) {
		statusBarMessage = `Visar ${events?.length ?? 0} turneringar i det valda urvalet.`;
	}

	function Content() {
		return (
			<>
				<Page.Title className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
					<span className='bg-transparent'>{query.title ? query.title : 'Turneringar'}</span>
					<label className='relative block w-full bg-transparent sm:w-80'>
						<span className='sr-only'>Sök turneringar</span>
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
							placeholder='Sök turneringar'
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
						<Page.Error>Misslyckades med att läsa in turneringar - {error.message}</Page.Error>
					) : !events ? (
						<Page.Loading>Läser in turneringar...</Page.Loading>
					) : isSearching && events.length === 0 ? (
						<Page.Information>Inga turneringar matchar “{debouncedSearchTerm}”</Page.Information>
					) : (
						<Events events={events} hide={['event_date']} />
					)}
				</Page.Container>
			</>
		);
	}

	return (
		<Page id='events-page'>
			<Page.Menu />
			<Page.Content>
				{Content()}
			</Page.Content>
			<Page.StatusBar status={statusBarStatus}>{statusBarMessage}</Page.StatusBar>
		</Page>
	);
}

export default Component;
