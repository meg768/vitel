import React from 'react';
import { Link } from 'react-router';
import { Container, Button } from '../components';
import './menu.scss';

let buttonClass = 'text-xl bg-primary-900 hover:bg-primary-700 dark:bg-primary-900! dark:hover:bg-primary-800! rounded-sm!';

function Component() {
	function toggleDarkMode() {
		var element = document.getElementById('root');
		console.log(element);
		element.classList.toggle('dark');
	}
	return (
		<div id='menu' className='border-b-1 border-primary-800'>
			<div className='flex  items-center bg-primary-900 p-2 gap-2 dark:bg-primary-900'>
				<div className='grow-0'>
					<Button className={buttonClass}>
						<Link to='/'>🎾</Link>
					</Button>
				</div>
				<div className='grow-0'>
					<Button className={buttonClass}>
						<Link to='/'>Jämför spelare</Link>
					</Button>
				</div>
				<div className='grow-0'>
					<Button className={buttonClass}>
						<Link to='/events'>Turneringar</Link>
					</Button>
				</div>
				<div className='grow-0'>
					<Button className={buttonClass}>
						<Link to='/players'>Spelare</Link>
					</Button>
				</div>
				<div className='grow-0'>
					<Button className={buttonClass}>
						<Link to='/trial'>Debug</Link>
					</Button>
				</div>
				<div className='grow'></div>
				<Button className={buttonClass} onClick={toggleDarkMode}>
					🎾
				</Button>
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
