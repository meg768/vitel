import React from 'react';
import atp from './js/atp-service';

import { Button, Container } from './components/ui';
import { useQuery } from '@tanstack/react-query';

import { useState, useRef } from 'react';
import { NavLink, Link } from 'react-router';

import Checkbox from './components/ui/checkbox';
import PlayerPicker from './components/player-picker';
import Menu from './components/menu';
import Page from './components/page';
import Layout from './components/layout';

import LocalStorage from './js/local-storage';
import { Info } from './components/icons';

import atpTourSVG from './assets/atp-tour.svg';
import atpTourPNG from './assets/atp-tour.png';

import { HamburgerMenuIcon, DotFilledIcon, CheckIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';

let locals = new LocalStorage({ key: 'AppPage-2	' });

// Get all players sorted by rank/date
async function getTopPlayers() {
	let sql = `SELECT * FROM players ORDER BY ISNULL(rank), rank ASC`;
	//let sql = `SELECT * FROM players `;
	return await atp.query({ sql });
}

async function getEvents() {
	let sql = `SELECT * FROM events ORDER BY date DESC`;
	let events = await atp.query({ sql });
	return events;
}

async function getPlayer(name) {
	let sql = `SELECT * FROM players WHERE ?? = ?`;
	let format = ['name', name];
	let details = await atp.query({ sql: sql, format: format });

	return details[0];
}

async function getLatestEvent() {
	let sql = `SELECT * FROM events ORDER BY date DESC LIMIT 1`;
	let events = await atp.query({ sql: sql });
	return events[0];
}

async function getLatestImport() {
	let sql = 'SELECT * FROM settings WHERE ?? = ?';
	let format = ['key', 'import.status'];
	let details = await atp.query({ sql: sql, format: format });
	console.log('Latest import:', details);

	try {
		return JSON.parse(details[0].value);
	} catch (error) {
		return undefined;
	}
}

function App() {
	const [playerList, setPlayerList] = React.useState(locals.get('player-list', null));

	// Fetch data, cache for 60 minutes
	const { data: response, isPending, isError, error } = useQuery({ queryKey: ['main-page'], queryFn: fetch, cacheTime: 0 });

	async function fetch() {
		if (playerList == null) {
			let list = {};
			list['A'] = await getPlayer('Jannik Sinner');
			list['B'] = await getPlayer('Carlos Alcaraz');
			setPlayerList(list);
		}

		try {
			let players = await getTopPlayers();
			let events = await getEvents();
			let latestEvent = await getLatestEvent();
			let latestImport = await getLatestImport();

			return { players: players, events: events, latestEvent: latestEvent, latestImport: latestImport };
		} catch (error) {
			console.log(error);
			return { players: null, events: null, latestEvent: null };
		}
	}

	function GoButton(properties) {
		let { id } = properties;
		let player = playerList[id];

		let url = '';

		if (player) {
			url = `/player/${player.id}`;
		}

		let className = '';
		className = classNames(className, 'w-[1.5em] h-[1.5em] fill-primary-500 hover:fill-primary-400 ');
		className = classNames(className, url ? '' : 'opacity-50!');

		return (
			<div className={className}>
				<Link to={url}>
					<Info />
				</Link>
			</div>
		);
	}

	function CompareButton() {
		let url = '';
		let playerA = playerList['A'];
		let playerB = playerList['B'];

		if (playerA && playerB) {
			url = `/head-to-head/${playerA.id}/${playerB.id}/`;
		}

		return (
			<Button disabled={url == ''}>
				<Link to={url}>Jämför</Link>
			</Button>
		);
	}

	function Player(properties) {
		const { id, className, ...props } = properties;

		function onPlayerChange(player) {
			let list = { ...playerList };
			list[id] = player;
			locals.set('player-list', list);
			setPlayerList(list);
		}

		return (
			<div className={className}>
				<div className='flex justify-start gap-4 items-center pt-1 pb-1'>
					<div className='flex-1'>
						<PlayerPicker className='' onChange={onPlayerChange} players={response.players} player={playerList[id]} placeholder={'-'} />
					</div>
					<div>
						<GoButton id={id} />
					</div>
				</div>
			</div>
		);
	}

	function Title() {
		return (
			<Page.Title className='flex items-center gap-5 '>
				<div className=''>
					<img className='h-15' src={atpTourPNG} />
				</div>
				<div>Statistik från ATP</div>
			</Page.Title>
		);
	}

	function Spinner() {
		return (
			<div className='flex items-center gap-3 pt-5 pb-5'>
				<span className='relative flex size-5'>
					<span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75'></span>
					<span className='relative inline-flex size-5 rounded-full bg-sky-500'></span>
				</span>
				<div>Läser in spelare...</div>
			</div>
		);
	}
	function Content() {

		if (!response) {
			return <Spinner />;	
		}

		let { players } = response;

		function LatestUpdate() {
			let { latestImport } = response;
			let date = '';

			if (latestImport.date) {
				date = new Date(latestImport.date).toLocaleDateString();
			}

			if (!date) {
				return;
			}
			return `Statistiken senast uppdaterad ${date}.`;
		}

		return (
			<>
				<p className='pt-5 pb-5'>
					{`All data är baserad med hjälp från `}
					<span className={'hover:text-link-500'}>
						<Link target='_blank' to='https://www.jeffsackmann.com'>
							Jeff Sackmanns
						</Link>
					</span>
					{` arbete. `}
					<LatestUpdate />
				</p>
				<div className='justify-center m-auto'>
					<div className='pb-2 text-xl'>Välj två spelare och jämför deras matchstatistik.</div>
					<div className='flex justify-center'>
						<div className='border-1 p-5 rounded-md w-full '>
							<Player id='A' players={players} />
							<Player id='B' players={players} />
						</div>
					</div>
					<div className='flex justify-center py-4'>
						<CompareButton />
					</div>
				</div>
			</>
		);
	}

	return (
		<Page>
			<Menu />

			<Page.Container>
				<Title />
				<Content />
			</Page.Container>
		</Page>
	);
}

export default App;
