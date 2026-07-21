import React from 'react';
import { Link, useLocation } from 'react-router';

import AtpLogo from '../assets/logos/atp-logo.svg?react';
import Button from './ui/button';

const menuButtonClass = 'hover:border-primary-400! hover:bg-primary-700! focus:outline-none focus-visible:outline-none';
const inactiveMenuButtonClass = 'border-transparent! bg-transparent!';
const playersWorkspaceStorageKey = 'vitel-players-workspace-url';

function getStoredPlayersLink() {
	const storedLink = window.sessionStorage.getItem(playersWorkspaceStorageKey);
	return storedLink?.startsWith('/players') ? storedLink : '/players';
}

function MenuItem(props) {
	return (
		<div className='flex items-center'>
			<Link to={props.link}>
				<Button className={`${menuButtonClass} ${inactiveMenuButtonClass}`} title={props.title} aria-label={props.title}>
					{props.children}
				</Button>
			</Link>
		</div>
	);
}

function Component({ children }) {
	const location = useLocation();
	const currentPlayersLink = location.pathname === '/players'
		? `${location.pathname}${location.search}`
		: null;
	const [playersLink, setPlayersLink] = React.useState(() => currentPlayersLink || getStoredPlayersLink());

	React.useEffect(() => {
		if (!currentPlayersLink) {
			return;
		}

		window.sessionStorage.setItem(playersWorkspaceStorageKey, currentPlayersLink);
		setPlayersLink(currentPlayersLink);
	}, [currentPlayersLink]);

	return (
		<div className='border-b-1 border-primary-800'>
			<div className='flex items-center justify-between w-full bg-primary-900 p-2 gap-1 dark:bg-primary-900 whitespace-nowrap overflow-auto'>
				<div className='flex space-x-1 items-center'>
					<MenuItem link='/settings' title='Inställningar'>
						<AtpLogo className='w-20 h-auto ' />
					</MenuItem>
					<MenuItem link='/matches'>Matcher</MenuItem>
					<MenuItem link={playersLink}>Spelare</MenuItem>
					<MenuItem link='/events'>Turneringar</MenuItem>
					<MenuItem link='/qna'>Q&A</MenuItem>
				</div>
				{children ? <div className='flex items-center gap-1 bg-transparent'>{children}</div> : null}
			</div>
		</div>
	);
}


export default Component;
