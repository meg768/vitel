import React from 'react';
import clsx from 'clsx';
import { useNavigate } from 'react-router';

import AtpTourLogo from '../../assets/logos/atp-tour.svg?react';
import ChevronDownIcon from '../../assets/radix-icons/chevron-down.svg?react';
import Cross2Icon from '../../assets/radix-icons/cross-2.svg?react';
import SearchIcon from '../../assets/radix-icons/magnifying-glass.svg?react';
import Flag from '../../components/flag';
import Page from '../../components/page';
import PlayerPicker from '../../components/player-picker';
import LocalStorage from '../../js/local-storage';
import { useSQL } from '../../js/vitel.js';

const STORAGE_KEY = 'vitel';
const SEARCH_HISTORY_KEY = 'search-history';
const MAX_SEARCH_HISTORY = 20;

let locals = new LocalStorage({ key: STORAGE_KEY });

export default function SearchPage() {
	const navigate = useNavigate();
	const [searchHistory, setSearchHistory] = React.useState(() => locals.get(SEARCH_HISTORY_KEY, []));

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
		triggerClassName = clsx(triggerClassName, 'flex cursor-pointer items-center rounded-sm py-4 px-5 text-inherit border gap-4');
		triggerClassName = clsx(triggerClassName, 'border-primary-200 bg-white/92 shadow-lg shadow-primary-900/6');
		triggerClassName = clsx(triggerClassName, 'dark:border-primary-800 dark:bg-primary-950/92 dark:shadow-black/20');
		triggerClassName = clsx(triggerClassName, 'w-full');

		return (
			<PlayerPicker className='' onChange={onPlayerChange} players={players}>
				<div className={triggerClassName}>
					<div className='flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300'>
						<SearchIcon className='w-6 h-6 bg-transparent' />
					</div>
					<div className='flex-1 bg-transparent text-left'>
						<div className='bg-transparent text-lg leading-tight'>Sök spelare</div>
						<div className='bg-transparent text-sm text-primary-600 dark:text-primary-300'>
							Skriv några bokstäver och välj en spelare
						</div>
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
			<div className='mt-8'>
				<div className='flex items-center justify-between gap-4'>
					<Page.Title level={4}>Tidigare sökningar</Page.Title>
						<button
							type='button'
							className='flex h-6 w-6 items-center justify-center rounded-full border border-primary-200 bg-primary-100 text-primary-600 hover:bg-primary-200 hover:text-primary-800 dark:border-primary-800 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800 dark:hover:text-primary-100'
							onClick={clearSearchHistory}
							title='Rensa tidigare sökningar'
							aria-label='Rensa tidigare sökningar'
						>
							<Cross2Icon className='h-3 w-3 bg-transparent' />
						</button>
				</div>
				<div className='mt-2 flex flex-col gap-2'>
						{searchHistory.map(player => {
							let className = '';
							className = clsx(className, 'w-full rounded-sm border px-4 py-3 text-left');
						className = clsx(className, 'border-primary-200 bg-white/90 hover:bg-primary-100');
						className = clsx(className, 'dark:border-primary-800 dark:bg-primary-950/80 dark:hover:bg-primary-900');

							return (
								<button key={player.id} className={className} onClick={() => openPlayer(player)}>
									<div className='flex items-center gap-3'>
									<Flag className='w-6! h-6! border-1! border-current shrink-0' country={player.country} />
									<div className='flex-1 min-w-0'>
										<div className='truncate text-base'>
											{player.name}
											{player.rank ? ` (#${player.rank})` : ''}
										</div>
									</div>
								</div>
							</button>
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
				<Page.Container className='py-8 lg:py-12'>
					<div className='mx-auto max-w-3xl'>
						<div className='flex justify-center'>
							<AtpTourLogo className='h-14 w-auto text-primary-700 dark:text-primary-200' fill='currentColor' />
						</div>

						<div className='mt-8'>
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
