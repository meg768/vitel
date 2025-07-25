import React from 'react';
import { Link } from 'react-router';
import { Container, Button } from '../components';
import app from '../../src/index.jsx';
import clsx from 'clsx';
import ThemeDialog from './theme-dialog.jsx';

import RocketIcon from '../assets/radix-icons-jsx/rocket.jsx';
import GearIcon from '../assets/radix-icons-jsx/gear.jsx';
import ReaderIcon from '../assets/radix-icons-jsx/reader.jsx';
import SearchIcon from '../assets/radix-icons-jsx/magnifying-glass.jsx';
import AtpLogo from '../assets/atp-logo.jsx';

import atpLogoWhite from '../assets/atp-logo-white.png';

/*

					<MenuItem link='/not-found'>
						<SearchIcon className='w-6 h-6' />
					</MenuItem>


					*/
function Component(props) {

	function toggleDarkMode() {
		app.toggleTheme();
	}

	function MenuItem(props) {
		let buttonClass = 'bg-transparent! hover:bg-primary-700!';

		return (
			<div className='flex items-center'>
				<Link to={props.link}>
					<Button className={buttonClass}>{props.children}</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className='border-b-1 border-primary-800'>
			<div className='flex   justify-between items-center w-full bg-primary-900 p-2 gap-1 dark:bg-primary-900   whitespace-nowrap overflow-auto'>
				<div className='flex space-x-1 items-center'>
					<MenuItem link='/#'>
						<AtpLogo className='w-20 h-auto ' />
					</MenuItem>
					<MenuItem link='/events'>Turneringar</MenuItem>
					<MenuItem link='/players'>Spelare</MenuItem>
					<MenuItem link='/live'>Live</MenuItem>
					<MenuItem link='/chat'>Chat</MenuItem>
				</div>
				<div className='flex space-x-1 items-center '>
					<MenuItem link='/trial'>
						<RocketIcon className='w-6 h-6 ' />
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
