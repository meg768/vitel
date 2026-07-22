import React from 'react';
import { useSearchParams } from 'react-router';

import CalendarIcon from '../../assets/radix-icons/calendar.svg?react';
import Cross2Icon from '../../assets/radix-icons/cross-2.svg?react';
import SearchIcon from '../../assets/radix-icons/magnifying-glass.svg?react';
import CurrentEvents, { matchesCurrentEvent } from '../../components/current-events';
import Events from '../../components/events';
import Page from '../../components/page';
import Input from '../../components/ui/input';
import { useRequest, useSQL } from '../../js/vitel.js';

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
			WHERE LOWER(TRIM(COALESCE(type, ''))) <> 'challenger'
				AND (
					LOWER(name) LIKE LOWER(?)
					OR LOWER(location) LIKE LOWER(?)
					OR LOWER(type) LIKE LOWER(?)
					OR LOWER(surface) LIKE LOWER(?)
				)
			ORDER BY date DESC, name ASC
			LIMIT 100
		`;
		format = [containsTerm, containsTerm, containsTerm, `%${surfaceTerm}%`];
	} else if (!sql) {
		sql = `
			SELECT *
			FROM events
			WHERE date >= CURRENT_DATE - INTERVAL 1 YEAR
				AND LOWER(TRIM(COALESCE(type, ''))) <> 'challenger'
			ORDER BY date DESC
			LIMIT 100
		`;
		format = [];
	}

	const { data: events, error, isFetching } = useSQL({
		sql,
		format,
		placeholderData: previousEvents => previousEvents
	});
	const {
		data: currentResponse,
		error: currentError,
		isFetching: isFetchingCurrent
	} = useRequest({ path: 'events/current', method: 'GET', cache: 10 * 60 * 1000 });
	const currentEvents = currentResponse?.events ?? [];
	const currentEventIds = new Set(currentEvents.map(event => event.id));
	const visibleEvents = events?.filter(event => (
		event.type?.trim().toLocaleLowerCase('en-US') !== 'challenger'
		&& !currentEventIds.has(event.id)
	));
	const visibleCurrentEvents = currentEvents.filter(event => matchesCurrentEvent(event, debouncedSearchTerm));
	const totalCount = (visibleEvents?.length ?? 0) + visibleCurrentEvents.length;
	let statusBarStatus = 'ready';
	let statusBarMessage = visibleEvents && currentResponse
		? `Visar ${visibleCurrentEvents.length} aktiva och ${visibleEvents.length} tidigare turneringar.`
		: 'Läser in turneringar…';

	if (error || currentError) {
		statusBarStatus = 'warning';
		statusBarMessage = error
			? 'Kunde inte läsa in tidigare turneringar just nu.'
			: `Aktiva turneringar kunde inte hämtas. Visar ${visibleEvents?.length ?? 0} tidigare turneringar.`;
	} else if (isFetching || isFetchingCurrent) {
		statusBarStatus = 'loading';
		statusBarMessage = isSearching
			? `Söker efter “${debouncedSearchTerm}”…`
			: 'Läser in turneringar…';
	} else if (isSearching) {
		statusBarMessage = `Hittade ${totalCount} turneringar för “${debouncedSearchTerm}” (${visibleCurrentEvents.length} aktiva).`;
	} else if (query.title) {
		statusBarMessage = `Visar ${visibleEvents?.length ?? 0} turneringar i det valda urvalet.`;
	}

	function Search() {
		return (
			<label className='relative block w-44 bg-transparent'>
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
							placeholder='Sök'
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
		);
	}

	function Content() {
		return (
			<Page.Container>
					{currentError ? (
						<Page.Warning className='mb-3'>Aktiva turneringar kunde inte hämtas - {currentError.message}</Page.Warning>
					) : null}
					{isFetchingCurrent && !currentResponse ? (
						<Page.Information className='mb-3'>Läser in aktiva turneringar…</Page.Information>
					) : visibleCurrentEvents.length > 0 ? (
						<>
							<Page.Title level={3}>Aktiva turneringar</Page.Title>
							<CurrentEvents events={visibleCurrentEvents} />
						</>
					) : isSearching && currentResponse ? (
						<Page.Information className='mb-3'>Inga aktiva turneringar matchar “{debouncedSearchTerm}”</Page.Information>
					) : null}

					<Page.Title level={3}>Tidigare turneringar</Page.Title>
					{error ? (
						<Page.Error>Misslyckades med att läsa in turneringar - {error.message}</Page.Error>
					) : !visibleEvents ? (
						<Page.Loading>Läser in turneringar...</Page.Loading>
					) : isSearching && visibleEvents.length === 0 ? (
						<Page.Information>Inga tidigare turneringar matchar “{debouncedSearchTerm}”</Page.Information>
					) : (
						<Events events={visibleEvents} hide={['event_date']} />
					)}
			</Page.Container>
		);
	}

	return (
		<Page id='events-page'>
			<Page.Menu>{Search()}</Page.Menu>
			<Page.Content>
				<Page.Title className='gap-2'>
					<Page.TitleIcon>
						<CalendarIcon className='h-5 w-5 bg-transparent' aria-hidden='true' />
					</Page.TitleIcon>
					<span className='bg-transparent'>{query.title ? query.title : 'Turneringar'}</span>
				</Page.Title>
				{Content()}
			</Page.Content>
			<Page.StatusBar status={statusBarStatus}>{statusBarMessage}</Page.StatusBar>
		</Page>
	);
}

export default Component;
