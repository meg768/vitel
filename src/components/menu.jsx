import clsx from 'clsx';
import { Link, useLocation } from 'react-router';

import AtpLogo from '../assets/logos/atp-logo.svg?react';
import GearIcon from '../assets/radix-icons/gear.svg?react';
import Button from './ui/button';

const menuButtonClass = 'hover:border-primary-400! hover:bg-primary-700! focus:outline-none focus-visible:outline-none';
const inactiveMenuButtonClass = 'border-transparent! bg-transparent!';
const activeMenuButtonClass = 'border-primary-400! bg-primary-700!';

function MenuItem(props) {
	const location = useLocation();
	const isActive = props.activePaths?.some(path => (
		path === '/'
			? location.pathname === '/'
			: location.pathname === path || location.pathname.startsWith(`${path}/`)
	)) ?? location.pathname === props.link;
	const className = clsx(menuButtonClass, isActive ? activeMenuButtonClass : inactiveMenuButtonClass);

	return (
		<div className='flex items-center'>
			<Link to={props.link} aria-current={isActive ? 'page' : undefined}>
				<Button className={className} title={props.title} aria-label={props.title}>
					{props.children}
				</Button>
			</Link>
		</div>
	);
}

function Component() {
	return (
		<div className='border-b-1 border-primary-800'>
			<div className='flex justify-between items-center w-full bg-primary-900 p-2 gap-1 dark:bg-primary-900 whitespace-nowrap overflow-auto'>
				<div className='flex space-x-1 items-center'>
					<MenuItem link='/about' title='Om Vitel'>
						<AtpLogo className='w-20 h-auto ' />
					</MenuItem>
					<MenuItem link='/matches' activePaths={['/', '/matches', '/scoreboard']}>Matcher</MenuItem>
					<MenuItem link='/players' activePaths={['/players', '/player', '/head-to-head', '/head-to-head-details', '/compare']}>Spelare</MenuItem>
					<MenuItem link='/events' activePaths={['/events', '/event']}>Turneringar</MenuItem>
					<MenuItem link='/qna' activePaths={['/qna', '/query']}>Q&A</MenuItem>
				</div>
				<div className='flex space-x-1 items-center'>
					<MenuItem link='/settings' title='Inställningar' activePaths={['/settings']}>
						<GearIcon className='w-6 h-6 ' />
					</MenuItem>
				</div>
			</div>
		</div>
	);
}


export default Component;
