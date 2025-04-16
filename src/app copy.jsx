import './app.scss';
import React from 'react';
import mysql from './js/mysql-express';

import { Button, Container } from './components/ui';
import { useQuery } from '@tanstack/react-query';

import { useState, useRef } from 'react';
import { NavLink, Link } from 'react-router';

import Checkbox from './components/ui/checkbox';
import PlayerPicker from './components/player-picker';
import Menu from './components/menu';
import Page from './components/page';

import LocalStorage from './js/local-storage';
import { Info } from './components/icons';

import atpTourSVG from './assets/atp-tour.svg';
import atpTourPNG from './assets/atp-tour.png';

import { HamburgerMenuIcon, DotFilledIcon, CheckIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';

let locals = new LocalStorage({ key: 'AppPage-1	' });

// Get all players sorted by rank/date
async function getTopPlayers() {
	let sql = `SELECT * FROM players WHERE rank > 0 ORDER BY rank ASC`;
	return await mysql.query({ sql });
}

async function getEvents() {
	let sql = `SELECT * FROM events ORDER BY date DESC`;
	let events = await mysql.query({ sql });
	return events;
}

async function getPlayer(name) {
	let sql = `SELECT * FROM players WHERE name = ?`;
	let format = [name];
	let details = await mysql.query({ sql: sql, format: format });

	return details[0];
}

async function getLatestEvent() {
	let sql = `SELECT * FROM events ORDER BY date DESC LIMIT 1`;
	let events = await mysql.query({ sql: sql });
	return events[0];
}

function App() {
	const [playerList, setPlayerList] = React.useState(locals.get('player-list', {}));
	const [checkmarks, setCheckmarks] = React.useState(locals.get('checkmarks', []));

	// Fetch data, cache for 60 minutes
	const { data: response, isPending, isError, error } = useQuery({ queryKey: ['main-page'], queryFn: fetch, gcTime: 60 * 60 * 1000 });

	async function fetch() {
		if (playerList == null) {
			let list = {};
			list['A'] = await getPlayer('Jannik Sinner');
			setPlayerList(list);
		}

		try {
			let players = await getTopPlayers();
			let events = await getEvents();
			let latestEvent = await getLatestEvent();

			return { players: players, events: events, latestEvent: latestEvent };
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
		className = classNames(className, 'w-[1.5em] h-[1.5em] fill-primary-500 hover:fill-primary-600 ');
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
		let playerA = {};
		let playerB = {};

		if (checkmarks.length == 2) {
			playerA = playerList[checkmarks[0]];
			playerB = playerList[checkmarks[1]];

			if (playerA && playerB) {
				url = `/head-to-head/${playerA.id}/${playerB.id}/`;
			}
		}

		return (
			<div className='pt-2 text-center'>
				<Button disabled={url == ''}>
					<Link to={url}>Jämför</Link>
				</Button>
			</div>
		);
	}

	function Player(properties) {
		const { id, className, ...props } = properties;

		function onCheckChange() {
			let array = [...checkmarks];

			if (array.indexOf(id) >= 0) {
				array.splice(array.indexOf(id), 1);
			} else {
				array.unshift(id);
				array = array.slice(0, 2);
			}

			locals.set('checkmarks', array);
			setCheckmarks(array);
		}
		function onPlayerChange(player) {
			let list = { ...playerList };
			list[id] = player;
			locals.set('player-list', list);
			onCheckChange();
			setPlayerList(list);
		}

		function isChecked() {
			return checkmarks.indexOf(id) >= 0;
		}
		return (
			<div className={className}>
				<div className='flex justify-start gap-4 items-center pt-1 pb-1'>
					<Checkbox className='' checked={isChecked()} onCheckedChange={onCheckChange} />
					<div className='flex-1'>
						<PlayerPicker className='' onClick={onCheckChange} onChange={onPlayerChange} players={response.players} player={playerList[id]} placeholder={'-'} />
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
	function Content() {
		if (!response) {
			return;
		}

		let { events, players, latestEvent } = response;
		let latestUpdate = new Date(latestEvent.date).toLocaleDateString();

		return (
			<>
				<p className='pt-5 pb-5'>
					{`All data är baserad med hjälp från `}
					<span className={'hover:text-link-500'}>
						<Link target='_blank' to='https://www.jeffsackmann.com'>
							Jeff Sackmanns
						</Link>
					</span>
					{` arbete.`}
					{` Senaste uppdatering från ${latestEvent.name} ${latestUpdate}.`}
				</p>
				<div className='justify-center min-w-lg m-auto' style={{ width: '100%' }}>
					<div className='pb-2 texxt-xl'>Välj spelare två spelare och jämför!</div>
					<div className='flex justify-left'>
						<div className='flex flex-col  border-1 p-5 rounded-md border-none-300 w-full'>
							<Player id='A' players={players} />
							<Player id='B' players={players} />
							<Player id='C' players={players} />
							<Player id='D' players={players} />
							<Player id='E' players={players} />
							<CompareButton />
						</div>
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
