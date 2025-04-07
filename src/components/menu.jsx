import React from 'react';
import { Link } from 'react-router';
import { Container, Button } from '../components';
import './menu.scss';

function Component() {
	return (
		<div id='menu' className=' '>
			<div className='flex  items-center bg-primary-800 p-2 gap-2'>
				<div className='grow-0'>
					<Button className='bg-primary-800 hover:bg-primary-700'>
						<Link to='/'>🎾</Link>
					</Button>
				</div>
				<div className='grow-0'>
					<Button className='text-xl bg-primary-800 hover:bg-primary-700'>
						<Link to='/'>Statistik från ATP</Link>
					</Button>
				</div>
				<div className='grow-0'>
					<Button className='text-xl bg-primary-800 hover:bg-primary-700'>
						<Link to='/trial'>Lekstuga</Link>
					</Button>
				</div>
				<div className='grow'></div>
				<Button className='bg-primary-800 hover:bg-primary-700'>
					<Link to='/'>🎾</Link>
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
