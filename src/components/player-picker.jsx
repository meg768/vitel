import './player-picker.scss';

import React from 'react';
import { Container, DropdownMenu, Input } from '../components/ui';
import FlagIcon from '../components/flag-icon';
import classNames from 'classnames';

import { HamburgerMenuIcon, DotFilledIcon, CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';

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

		let items = players;

		if (filter) {
			let words = filter.toLowerCase().split(' ');

			items = players.filter((player) => {
				let matches = 0;

				for (let word of words) {
					if (player.name.toLowerCase().includes(word)) {
						matches++;
					}
				}
				return matches == words.length;
			});
		}

		items = items.slice(0, 7);

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
				<div>
					{`${player.name} `}
					<FlagIcon country={player.country} />
				</div>
			);
		}
	}

	function onFilterChange(event) {
		setFilter(event.target.value);
	}

	let triggerClassName = '';
	triggerClassName = classNames(triggerClassName, 'flex cursor-pointer items-center rounded-md py-1 px-2 text-inherit border-1');
	triggerClassName = classNames(triggerClassName, 'border-none-200 ');
	triggerClassName = classNames(triggerClassName, 'dark:border-primary-800 ');

	return (
		<DropdownMenu.Root >
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
						<Input className='my-2 mx-2' value={filter} autoFocus placeholder={'Type to search'} onChange={onFilterChange} />
					</div>
					<Items />
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);

}

export default PlayerSelect;
