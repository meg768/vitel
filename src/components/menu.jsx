import { Link } from 'react-router';

import AtpLogo from '../assets/logos/atp-logo.svg?react';
import GearIcon from '../assets/radix-icons/gear.svg?react';
import SearchIcon from '../assets/radix-icons/magnifying-glass.svg?react';
import Button from './ui/button';


function Component() {
	const menuButtonClass = 'bg-transparent! hover:bg-primary-700! focus:outline-none focus-visible:outline-none';

	function MenuItem(props) {
		return (
			<div className='flex items-center'>
				<Link to={props.link}>
					<Button className={menuButtonClass}>{props.children}</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className='border-b-1 border-primary-800'>
			<div className='flex justify-between items-center w-full bg-primary-900 p-2 gap-1 dark:bg-primary-900 whitespace-nowrap overflow-auto'>
				<div className='flex space-x-1 items-center'>
					<MenuItem link='/app'>
						<AtpLogo className='w-20 h-auto ' />
					</MenuItem>
					<MenuItem link='/players'>Spelare</MenuItem>
					<MenuItem link='/events'>Turneringar</MenuItem>
					<MenuItem link='/matches'>Matcher</MenuItem>
					<MenuItem link='/qna'>Q&A</MenuItem>
				</div>
				<div className='flex space-x-1 items-center'>
					<MenuItem link='/search'>
						<SearchIcon className='w-6 h-6 ' />
					</MenuItem>
					<MenuItem link='/settings'>
						<GearIcon className='w-6 h-6 ' />
					</MenuItem>
				</div>
			</div>
		</div>
	);
}


export default Component;
