import clsx from 'clsx';
import { useNavigate } from 'react-router';

import AtpTourLogo from '../../assets/logos/atp-tour.svg?react';
import ChevronDownIcon from '../../assets/radix-icons/chevron-down.svg?react';
import SearchIcon from '../../assets/radix-icons/magnifying-glass.svg?react';
import Page from '../../components/page';
import PlayerPicker from '../../components/player-picker';
import { useSQL } from '../../js/vitel.js';

export default function SearchPage() {
	const navigate = useNavigate();

	function SearchPlayer({ players }) {
		function onPlayerChange(player) {
			navigate(`/player/${player.id}`);
		}

		let triggerClassName = '';
		triggerClassName = clsx(triggerClassName, 'flex cursor-pointer items-center rounded-2xl py-4 px-5 text-inherit border gap-4');
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

	function Content() {
		let sql = `SELECT id, name, country FROM players ORDER BY ISNULL(rank), rank ASC`;
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
