import { Link } from 'react-router';

import AtpLogo from '../assets/logos/atp-logo.svg?react';
import GearIcon from '../assets/radix-icons/gear.svg?react';
import SearchIcon from '../assets/radix-icons/magnifying-glass.svg?react';
import { theme } from '../js/theme';
import Button from './ui/button';


function Component() {
	const menuButtonClass = 'bg-transparent! hover:bg-primary-700! focus:outline-none focus-visible:outline-none';

	function openNewsPage() {
		const storedTheme = localStorage.getItem('theme');
		const currentTheme = theme.normalizeTheme(storedTheme);
		const resolvedTheme = theme.resolve(currentTheme, {
			prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches
		});
		const url = new URL('https://tennis-daily.egelberg.se');

		url.searchParams.set('theme', `${resolvedTheme.resolvedMode} ${resolvedTheme.resolvedSurface}`);
		window.open(url.toString(), '_blank', 'noopener,noreferrer');
	}

	function MenuItem(props) {
		return (
			<div className='flex items-center'>
				<Link to={props.link}>
					<Button className={menuButtonClass} title={props.title} aria-label={props.title}>
						{props.children}
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className='border-b-1 border-primary-800'>
			<div className='flex justify-between items-center w-full bg-primary-900 p-2 gap-1 dark:bg-primary-900 whitespace-nowrap overflow-auto'>
				<div className='flex space-x-1 items-center'>
					<MenuItem link='/'>
						<AtpLogo className='w-20 h-auto ' />
					</MenuItem>
					<MenuItem link='/players'>Spelare</MenuItem>
					<MenuItem link='/events'>Turneringar</MenuItem>
					<MenuItem link='/matches'>Matcher</MenuItem>
					<MenuItem link='/qna'>Q&A</MenuItem>
					<div className='flex items-center'>
						<Button
							className={menuButtonClass}
							title='Nyheter'
							aria-label='Nyheter'
							onClick={openNewsPage}
							type='button'
						>
							Nyheter
						</Button>
					</div>
				</div>
				<div className='flex space-x-1 items-center'>
					<MenuItem link='/search' title='Sök spelare'>
						<SearchIcon className='w-6 h-6 ' />
					</MenuItem>
					<MenuItem link='/settings' title='Inställningar'>
						<GearIcon className='w-6 h-6 ' />
					</MenuItem>
				</div>
			</div>
		</div>
	);
}


export default Component;
