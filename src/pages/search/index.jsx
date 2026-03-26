import React from 'react';
import clsx from 'clsx';
import { useNavigate } from 'react-router';

import ChevronDownIcon from '../../assets/radix-icons/chevron-down.svg?react';
import Cross2Icon from '../../assets/radix-icons/cross-2.svg?react';
import SearchIcon from '../../assets/radix-icons/magnifying-glass.svg?react';
import Flag from '../../components/flag';
import Page from '../../components/page';
import PlayerPicker from '../../components/player-picker';
import Link from '../../components/ui/link';
import LocalStorage from '../../js/local-storage';
import { useSQL } from '../../js/vitel.js';

const STORAGE_KEY = 'vitel';
const SEARCH_HISTORY_KEY = 'search-history';
const MAX_SEARCH_HISTORY = 6;

let locals = new LocalStorage({ key: STORAGE_KEY });

export default function SearchPage() {
	const navigate = useNavigate();
	const [searchHistory, setSearchHistory] = React.useState(() => {
		const storedHistory = locals.get(SEARCH_HISTORY_KEY, []);
		return Array.isArray(storedHistory) ? storedHistory.slice(0, MAX_SEARCH_HISTORY) : [];
	});

	React.useEffect(() => {
		locals.set(SEARCH_HISTORY_KEY, searchHistory);
	}, [searchHistory]);

	function saveSearch(player) {
		const nextSearchHistory = [
			player,
			...searchHistory.filter(item => item.id !== player.id)
		].slice(0, MAX_SEARCH_HISTORY);

		locals.set(SEARCH_HISTORY_KEY, nextSearchHistory);
		setSearchHistory(nextSearchHistory);
	}

	function openPlayer(player) {
		saveSearch(player);
		navigate(`/player/${player.id}`);
	}

	function clearSearchHistory() {
		locals.set(SEARCH_HISTORY_KEY, []);
		setSearchHistory([]);
	}

	function SearchPlayer({ players }) {
		function onPlayerChange(player) {
			openPlayer(player);
		}

		let triggerClassName = '';
		triggerClassName = clsx(triggerClassName, 'flex cursor-pointer items-center rounded-sm py-2.5 px-4 text-inherit border gap-3');
		triggerClassName = clsx(triggerClassName, 'border-primary-200 bg-primary-50/85');
		triggerClassName = clsx(triggerClassName, 'dark:border-primary-800 dark:bg-primary-950/92');
		triggerClassName = clsx(triggerClassName, 'w-full');

		return (
			<PlayerPicker className='' onChange={onPlayerChange} players={players}>
				<div className={triggerClassName}>
					<div className='flex h-9 w-9 items-center justify-center rounded-full bg-primary-200/80 text-primary-600 dark:bg-primary-900 dark:text-primary-300'>
						<SearchIcon className='w-5 h-5 bg-transparent' />
					</div>
						<div className='flex-1 bg-transparent text-left'>
							<div className='bg-transparent'>Skriv några bokstäver och välj en spelare</div>
						</div>
					<div className='bg-transparent'>
						<ChevronDownIcon className='w-5 h-5 bg-transparent text-primary-500 dark:text-primary-400' />
					</div>
				</div>
			</PlayerPicker>
		);
	}

	function SearchHistory() {
		if (searchHistory.length === 0) {
			return null;
		}

		return (
			<div className='mt-4 space-y-2 pb-2'>
					<div className='flex items-center gap-2'>
						<Page.Title level={4} className='py-0'>Tidigare sökningar</Page.Title>
							<button
								type='button'
								className='shrink-0 flex h-6 w-6 items-center justify-center rounded-sm border border-primary-200 bg-primary-100 text-primary-600 hover:bg-primary-200 hover:text-primary-800 dark:border-primary-800 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800 dark:hover:text-primary-100'
								onClick={clearSearchHistory}
								title='Rensa tidigare sökningar'
								aria-label='Rensa tidigare sökningar'
							>
							<Cross2Icon className='h-3 w-3 bg-transparent' />
						</button>
				</div>
				<div className='overflow-hidden rounded-md border border-primary-200 bg-primary-50/80 dark:border-primary-800 dark:bg-primary-950/80'>
						{searchHistory.map(player => {
							let rowClassName = '';
							rowClassName = clsx(rowClassName, 'flex items-center gap-3 px-4 py-3');
							rowClassName = clsx(rowClassName, 'transition-colors hover:bg-primary-200/75 dark:hover:bg-primary-900/80');

							return (
								<div key={player.id} className={rowClassName}>
									<div className='flex flex-1 items-center gap-3 bg-transparent text-left'>
										<Flag className='w-6! h-6! border-1! border-current shrink-0' country={player.country} />
										<div className='flex-1 min-w-0 bg-transparent'>
											<div className='truncate text-base bg-transparent'>
												<Link to={`/player/${player.id}`} onClick={() => saveSearch(player)}>
													{player.name}
												</Link>
												{player.rank ? ` (#${player.rank})` : ''}
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			);
	}

	function Content() {
		let sql = `SELECT id, name, country, rank FROM players ORDER BY ISNULL(rank), rank ASC`;
		const { data: players, error } = useSQL({ sql, cache: Infinity });

		if (error) {
			return <Page.Error>Misslyckades med att läsa in spelare - {error.message}</Page.Error>;
		}

		if (!players) {
			return <Page.Loading>Läser in spelare...</Page.Loading>;
		}

		return (
			<>
					<Page.Title>Sök spelare</Page.Title>
				<Page.Container className='pt-3 pb-8 lg:pb-12'>
					<div>
						<div className='space-y-2'>
							<SearchPlayer players={players} />
						</div>

						<SearchHistory />
					</div>
				</Page.Container>
			</>
		);
	}

	return (
		<Page id='search-page'>
			<Page.Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
}
