import clsx from 'clsx';
import { useNavigate } from 'react-router';

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
		triggerClassName = clsx(triggerClassName, 'flex cursor-pointer items-center rounded-md py-3 px-4 text-inherit border-1 gap-3');
		triggerClassName = clsx(triggerClassName, 'border-primary-300 bg-primary-50 dark:border-primary-800 dark:bg-primary-900');
		triggerClassName = clsx(triggerClassName, 'w-full');

		return (
			<PlayerPicker className='' onChange={onPlayerChange} players={players}>
				<div className={triggerClassName}>
					<div className='bg-transparent'>
						<SearchIcon className='w-6 h-6 bg-transparent text-primary-500 dark:text-primary-400' />
					</div>
					<div className='flex-1 bg-transparent text-left'>Sök spelare</div>
					<div className='bg-transparent'>
						<ChevronDownIcon className='w-4 h-4 bg-transparent' />
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
				<Page.Title>Sök spelare</Page.Title>
				<Page.Container>
					<div className='py-4'>
						<SearchPlayer players={players} />
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
