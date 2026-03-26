import clsx from 'clsx';
import React from 'react';

import { DropdownMenu, Input } from '../components/ui';
function PlayerSelect({ players, children, onChange }) {
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
			className = clsx(className, 'cursor-pointer!');

			return (
				<DropdownMenu.Item className={className} onClick={onClick.bind(this, player)} key={index}>
					{player.name}
				</DropdownMenu.Item>
			);
		});
	}

	function onFilterChange(event) {
		setFilter(event.target.value);
	}

	let contentClassName = '';
	contentClassName = clsx(contentClassName, 'rounded-sm border-1! p-2 text-base');
	contentClassName = clsx(contentClassName, 'border-primary-300! bg-primary-50!');
	contentClassName = clsx(contentClassName, 'dark:border-primary-700! dark:bg-primary-900!');
	contentClassName = clsx(contentClassName, 'min-w-[18rem] max-w-[calc(100vw-2rem)]');

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>

			<DropdownMenu.Content align='start' sideOffset={5} className={contentClassName}>
				<Input
					className='my-1 w-full rounded-sm border px-2 py-1 text-base'
					value={filter}
					autoFocus
					spellCheck={false}
					placeholder={'Sök spelare'}
					onChange={onFilterChange}
				/>
				<Items />
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	);
}

export default PlayerSelect;
