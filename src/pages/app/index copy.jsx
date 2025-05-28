import React from 'react';
import atp from '../../js/atp-service';

import { Button, Container } from '../../components/ui';
import { useQuery } from '@tanstack/react-query';

import { useState, useRef } from 'react';
//import { NavLink, Link } from 'react-router';

import PlayerPicker from '../../components/player-picker';
import Menu from '../../components/menu';
import Link from '../../components/ui/link';
import Page from '../../components/page';

import LocalStorage from '../../js/local-storage';
import { Info } from '../../components/icons';

import atpTourSVG from '../../assets/atp-tour.svg';
import atpTourPNG from '../../assets/atp-tour.png';

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
	const [playerList, setPlayerList] = React.useState(null);

	const queryKey = ['app-page'];

	React.useEffect(() => {
		async function getPlayerList() {
			let list = locals.get('player-list', null);
			if (list == null) {
				list = {};
				list['A'] = await getPlayer('Jannik Sinner');
				list['B'] = await getPlayer('Carlos Alcaraz');
				locals.set('player-list', list);
			}
			setPlayerList(list);
		}
		getPlayerList();
	}, []);

	async function fetch() {
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

	function TestButton() {
		let url = '/players';
		let sql = `SELECT * FROM players WHERE country = 'ITA'`;
		let encodedSql = encodeURIComponent(sql);
		url += `?sql=${encodedSql}`;

		return (
			<Button link={url}>
				Prova
			</Button>
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
			<Button disabled={url == ''} link={url}>
				Jämför
			</Button>
		);
	}

	function Player(properties) {
		const { id, className, response, ...props } = properties;

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
			<Page.Title className='flex items-center gap-5'>
				<div className='bg-transparent'>
					<img className='h-15 ' src={atpTourPNG} />
				</div>
				<div className='bg-transparent'>Statistik från ATP</div>
			</Page.Title>
		);
	}



	function Content(response) {
		if (!response || !playerList) {
			return <Page.Loading>Läser in spelare...</Page.Loading>
		}
		
		let { players,  events, latestEvent, latestImport } = response;



		function LatestUpdate() {
			let { latestImport } = response;
			let date = '';

			if (latestImport?.date) {
				date = new Date(latestImport.date).toLocaleDateString();
			}

			if (!date) {
				return;
			}
			return `Statistiken senast uppdaterad ${date}.`;
		}

		return (
			<>
				<div className='justify-center m-auto'>
					<div className='pb-2 text-xl'>Välj två spelare och jämför matchstatistik.</div>
					<div className='flex justify-center'>
						<div className='border-1 p-5 rounded-md w-full '>
							<Player response={response} id='A' players={players} />
							<Player response={response} id='B' players={players} />
						</div>
					</div>
					<div className='flex justify-center py-4'>
						<CompareButton />
					</div>
				</div>
			</>
		);
	}

	// return (
	// 	<Page id='app-page'>
	// 		<Page.Menu></Page.Menu>
	// 		<Page.Content>
	// 			<Page.Query queryKey={'app-page'} queryFn={fetch}>
	// 				{Content}
	// 			</Page.Query>
	// 		</Page.Content>
	// 	</Page>
	// );
	return (
		<Page id='event-page'>
			<Menu></Menu>
			<Page.Content>
				<Title />
				<Page.Container>
					<Page.Query queryKey={queryKey} queryFn={fetch}>
						{Content}
					</Page.Query>
				</Page.Container>
			</Page.Content>
		</Page>
	);
}

export default App;
