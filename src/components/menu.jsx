import React from 'react';
import { Link } from 'react-router';
import { Container, Button } from '../components';
import app from '../../src/index.jsx';
import classNames from 'classnames';

function Component(props) {
	let buttonClass = 'text-xl bg-primary-900 hover:bg-primary-700 dark:bg-primary-900! dark:hover:bg-primary-800! rounded-sm!';

	function toggleDarkMode() {
		app.toggleTheme();
	}

	function Spinner() {
		if (props.spinner) {
			return (
				<div className='flex items-center p-2'>
					<div className='relative flex size-5'>
						<div className='absolute inline-flex h-full w-full justify-items-center animate-ping rounded-full bg-sky-400/75 '></div>
						<div className='relative inline-flex size-5 items-center  text-center justify-items-center rounded-full bg-sky-500'></div>
					</div>
				</div>
			);
		}

			return (
				<div className='flex items-center p-2'>
					<div className='relative flex size-5'>
						<div className='absolute inline-flex h-full w-full justify-items-center animate-none rounded-full bg-sky-500 xopacity-75'></div>
					</div>
				</div>
			);

		return <div className='flex  bg-transparent items-center p-2'>🎾</div>;
	}

	function SpinnerX() {
		let className = 'flex  bg-transparent items-center p-2';

		if (!props.spinner) {
			className = classNames(className, 'animate-none');
		} else {
			className = classNames(className, 'animate-spin');
		}
		return <div className={className}>🎾</div>;

		if (props.spinner) {
			return <div className='flex animate-spin bg-transparent items-center p-2'>🎾</div>;
			return (
				<div className='flex items-center p-2'>
					<span className='relative flex size-5'>
						<div className='absolute inline-flex h-full w-full justify-items-center animate-ping rounded-full bg-sky-400 opacity-75'></div>
						<div className='relative inline-flex size-5 items-center  text-center justify-items-center rounded-full bg-sky-500'></div>
					</span>
				</div>
			);
		}
		return <div className='flex  bg-transparent items-center p-2'>🎾</div>;
	}

	return (
		<div id='menu' className='border-b-1 border-primary-800'>
			<div className='flex  justify-between items-center w-full bg-primary-900 p-2 gap-2 dark:bg-primary-900'>
				<div className='flex space-x-1'>
					<Spinner />
					<div className='flex items-center '>
						<Button className={buttonClass}>
							<Link to='/#'>Jämför spelare</Link>
						</Button>
					</div>
					<div className='flex items-center '>
						<Button className={buttonClass}>
							<Link to='/events'>Turneringar</Link>
						</Button>
					</div>
					<div className='flex items-center '>
						<Button className={buttonClass}>
							<Link to='/players'>Spelare</Link>
						</Button>
					</div>
					<div className='flex items-center '>
						<Button className={buttonClass}>
							<Link to='/live'>Live</Link>
						</Button>
					</div>
				</div>
				<div className='flex space-x-1'>
					<div className=''>
						<Button className={buttonClass}>
							<Link to='/log'>
								<span className='text-[100%]'>🐞</span>
							</Link>
						</Button>
					</div>
					<div className=''>
						<Button className={buttonClass} onClick={toggleDarkMode}>
							🌓
						</Button>
					</div>
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
