import React from 'react';
import { Container, DropdownMenu, Input } from '../components/ui';
import FlagIcon from '../components/flag-icon';
import Flag from '../components/flag';
import classNames from 'classnames';


import ChevronDownIcon from '../assets/radix-icons-jsx/chevron-down.jsx';

function PlayerSelect({ players, className, player, onClick, onChange, placeholder = '-' }) {
	let [filter, setFilter] = React.useState('');

	function List() {
		return (
			<ul className=''>
				<Items />
			</ul>
		);
	}

	function Items() {
		function onClick(player) {
			onChange(player);
		}

		let maxItems = 6;
		let items = players;

		if (filter) {
			let words = filter.toLowerCase().split(' ');

			items = [];

			for (let index = 0; index < players.length && items.length < maxItems; index++) {
				let matches = 0;
				let player = players[index];

				for (let word of words) {
					if (player.name.toLowerCase().includes(word)) {
						matches++;
					}
				}

				if (matches == words.length) {
					items.push(player);
				}
			}
		}

		items = items.slice(0, maxItems);

		return items.map((player, index) => {
			let className = '';
			className = className + ' px-2 py-1  rounded-sm ';
			className = className + '  hover:bg-primary-500! ';

			return (
				<DropdownMenu.Item className={className} onClick={onClick.bind(this, player)} key={index}>
					{player.name}
				</DropdownMenu.Item>
			);
		});
	}

	function TriggerTitle() {
		if (!player) {
			return placeholder;
		} else {
			return (
				<div className='flex items-center gap-2'>
					<Flag country={player.country} className='border-1! w-8! h-8!' />
					<div>{`${player.name} `}</div>
				</div>
			);
		}
	}

	function onFilterChange(event) {
		setFilter(event.target.value);
	}

	let triggerClassName = '';
	triggerClassName = classNames(triggerClassName, 'flex cursor-pointer items-center rounded-md py-1 px-2 text-inherit border-1');
	triggerClassName = classNames(triggerClassName, 'dark:border-primary-800 dark:bg-primary-900');

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<div className={triggerClassName}>
					<div className=' flex-1  text-left '>
						<TriggerTitle />
					</div>

					<div>
						<ChevronDownIcon className='w-4 h-4' />
					</div>
				</div>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content align='start' sideOffset={5}>
					<div className=' '>
						<Input className='my-2 mx-2' value={filter} autoFocus spellCheck={false} placeholder={'Sök spelare'} onChange={onFilterChange} />
					</div>
					<Items />
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}

export default PlayerSelect;
