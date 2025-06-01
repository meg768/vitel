import React from 'react';
import { DropdownMenu, Input } from '../components/ui';
import classNames from 'classnames';

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
			className = classNames(className, 'px-2 py-1 rounded-sm');
			//			className = classNames(className, 'text-primary-900! dark:text-primary-100!');
			className = classNames(className, 'hover:bg-primary-500! hover:text-primary-100!');
			className = classNames(className, 'cursor-pointer!');

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
	contentClassName = classNames(contentClassName, 'rounded-md border-1! shadow-md p-2 text-base');
	contentClassName = classNames(contentClassName, 'border-primary-300! bg-primary-50!');
	contentClassName = classNames(contentClassName, 'dark:border-primary-700! dark:bg-primary-900!');

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>

			<DropdownMenu.Content align='start' sideOffset={5} className={contentClassName}>
				<Input className='px-2 py-1 border rounded-sm my-1 mx-1' value={filter} autoFocus spellCheck={false} placeholder={'Sök spelare'} onChange={onFilterChange} />
				<Items />
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	);

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>

			<DropdownMenu.Portal container={document.getElementById('layout')}>
				<DropdownMenu.Content align='start' sideOffset={5} className='' asChild>
					<div className=' rounded-md shadow-md p-2'>
						<div className=''>
							<Input
								className='px-2 py-1 border-1 rounded-sm my-1 mx-1'
								value={filter}
								autoFocus
								spellCheck={false}
								placeholder={'Sök spelare'}
								onChange={onFilterChange}
							/>
						</div>
						<Items />
					</div>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}

export default PlayerSelect;
