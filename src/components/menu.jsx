import React from 'react';
import { Link } from 'react-router';
import { Container, Button } from '../components';
import app from '../../src/index.jsx';
import classNames from 'classnames';
import colors from './colors';
import ThemeDialog from './theme-dialog.jsx';

import { Half2Icon, ReaderIcon, GearIcon, RocketIcon } from '@radix-ui/react-icons';
import { Theme } from '@radix-ui/themes/dist/cjs/index.js';

function Component(props) {
	let buttonClass = 'text-xl bg-primary-900 hover:bg-primary-700 dark:bg-primary-900! dark:hover:bg-primary-800! rounded-sm!';

	function toggleDarkMode() {
		app.toggleTheme();
	}

	function TennisBall(props) {
		let animation = props.ping ? 'animate-ping bg-primary-400' : 'animate-none  bg-transparent';

		return (
			<div className='relative flex items-center justify-center w-10 h-10'>
				{/* Ping effect (behind) */}
				<span className={`absolute inline-flex h-6 w-6 rounded-full opacity-75 ${animation}`}></span>

				{/* Tennis Ball emoji */}
				<span className='relative text-xl bg-transparent'>🎾</span>
			</div>
		);
	}

	function MenuItem(props) {
		let buttonClass = 'text-xl bg-primary-900 hover:bg-primary-700 dark:bg-primary-900! dark:hover:bg-primary-800! rounded-sm!';

		return (
			<div className='flex items-center'>
				<Button className={buttonClass}>
					<Link to={props.link}>{props.children}</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className='border-b-1 border-primary-800'>
			<div className='flex   justify-between items-center w-full bg-primary-900 p-2 gap-2 dark:bg-primary-900   whitespace-nowrap overflow-auto'>
				<div className='flex space-x-1'>
					<TennisBall ping={props.spinner} />
					<MenuItem link='/#'>Jämför spelare</MenuItem>
					<MenuItem link='/events'>Turneringar</MenuItem>
					<MenuItem link='/players'>Spelare</MenuItem>
					<MenuItem link='/live'>Live</MenuItem>
				</div>
				<div className='flex space-x-1'>
					<MenuItem link='/trial'>
						<RocketIcon className='w-7 h-7 '></RocketIcon>
					</MenuItem>
					<MenuItem link='/log'>
						<ReaderIcon className='w-7 h-7 '></ReaderIcon>
					</MenuItem>

					<MenuItem link='/settings'>
							<GearIcon className='w-7 h-7 ' XonClick={toggleDarkMode}/>
					</MenuItem>
				</div>
			</div>
		</div>
	);

	return (
		<div className='border-b-1 border-primary-800'>
			<div className='flex   justify-between items-center w-full bg-primary-900 p-2 gap-2 dark:bg-primary-900   whitespace-nowrap overflow-auto'>
				<div className='flex space-x-1'>
					<TennisBall ping={props.spinner} />
					<MenuItem link='/#'>Jämför spelare</MenuItem>
					<MenuItem link='/events'>Turneringar</MenuItem>
					<MenuItem link='/players'>Spelare</MenuItem>
					<MenuItem link='/live'>Live</MenuItem>
				</div>
				<div className='flex space-x-1'>
					<MenuItem link='/trial'>
						<RocketIcon className='w-7 h-7 '></RocketIcon>
					</MenuItem>
					<MenuItem link='/log'>
						<ReaderIcon className='w-7 h-7 '></ReaderIcon>
					</MenuItem>

					<MenuItem>
						<ThemeDialog>
							<GearIcon className='w-7 h-7 ' XonClick={toggleDarkMode} />
						</ThemeDialog>
					</MenuItem>
				</div>
			</div>
		</div>
	);
}

function ComponentX() {
	return (
		<div id='menu' className=' '>
			<div className='flex  bg-primary-800 p-3 gap-4'>
				<div className='grow-0'>
					<Button className='bg-primary-800 hover:bg-primary-700'>
						<Link to='/'>🎾</Link>
					</Button>
				</div>
				<div className='grow-0'>
					<Button className='bg-primary-800 hover:bg-primary-700'>Tennis ATP statistics</Button>
				</div>
				<div className='grow-0'>
					<Button className='bg-primary-800 hover:bg-primary-700'>B</Button>
				</div>
				<div className='grow-0'>
					<Button className='bg-primary-800 hover:bg-primary-700'>C</Button>
				</div>
				<div className='grow'></div>
				<div className='grow-0'>
					<Button className='bg-primary-800 hover:bg-primary-700'>D</Button>
				</div>
			</div>
		</div>
	);
}

export default Component;
