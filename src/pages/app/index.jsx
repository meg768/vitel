import React from 'react';
import atp from '../../js/atp-service';
import { useNavigate } from 'react-router';

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
import ChevronDownIcon from '../../assets/radix-icons-jsx/chevron-down.jsx';
import Flag from '../../components/flag';
import SearchIcon from '../../assets/radix-icons-jsx/magnifying-glass.jsx';

import classNames from 'classnames';

let locals = new LocalStorage({ key: 'AppPage-2	' });

// Get all players sorted by rank/date
async function getTopPlayers() {
	//let sql = `SELECT * FROM players ORDER BY ISNULL(rank), rank ASC`;
	let sql = `SELECT id, name, country FROM players ORDER BY ISNULL(rank), rank ASC`;
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

function App() {
	const [playerList, setPlayerList] = React.useState(null);
	const navigate = useNavigate();

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
			/*
			let events = await getEvents();
			let latestEvent = await getLatestEvent();
			let latestImport = await getLatestImport();
			*/

			return { players };
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

		function TriggerTitle() {
			let player = playerList[id];
			if (!player) {
				return '-';
			} else {
				return (
					<div className='flex items-center gap-2'>
						<Flag country={player.country} className='border-1! w-8! h-8!' />
						<div>{`${player.name} `}</div>
					</div>
				);
			}
		}

		let triggerClassName = '';
		triggerClassName = classNames(triggerClassName, 'flex cursor-pointer items-center rounded-md py-1 px-2 text-inherit border-1');
		triggerClassName = classNames(triggerClassName, 'dark:border-primary-800 dark:bg-primary-900');

		return (
			<div className={className}>
				<div className='flex justify-start gap-4 items-center pt-1 pb-1'>
					<div className='flex-1'>
						<PlayerPicker className='' onChange={onPlayerChange} players={response.players} player={playerList[id]}>
							<div className={triggerClassName}>
								<div className=' flex-1  text-left '>
									<TriggerTitle />
								</div>
								<div>
									<ChevronDownIcon className='w-4 h-4' />
								</div>
							</div>
						</PlayerPicker>
					</div>
				</div>
			</div>
		);
	}

	function SearchPlayer(properties) {
		const { className, players } = properties;

		function onPlayerChange(player) {
			navigate(`/player/${player.id}`);
		}

		function Trigger() {
			return (
				<div className='inline-block'>
					<div className=''>
						<SearchIcon className='w-6 h-6' />
						{`Sök spelare`}
					</div>
				</div>
			);
		}

		function SearchButton() {
			let className = 'inline-block cursor-pointer';
			className = classNames(className, 'w-8 h-8');
			className = classNames(className, 'transition-transform duration-200 hover:scale-150');
			className = classNames(className, 'hover:text-primary-500 hover:fill-primary-500');

			return <SearchIcon className={className} />;
		}

		return (
			<PlayerPicker className='' onChange={onPlayerChange} players={players}>
				<div className='inline-block'>
					<SearchButton />
				</div>
			</PlayerPicker>
		);

		return (
			<PlayerPicker className='' onChange={onPlayerChange} players={players}>
				<Trigger />
			</PlayerPicker>
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
			return <Page.Loading>Läser in spelare...</Page.Loading>;
		}

		let { players } = response;

		return (
			<>
				<div className='flex text-xl items-center justify-left gap-2 py-2'>
					<SearchPlayer players={players} />
					<div className=''>Sök</div>
					<div className=''>en spelare</div>
					<div className=''>eller välj två spelare och jämför matchstatistik</div>
				</div>
				<div className='justify-center'>
					<div className='flex justify-center'>
						<div className='border-0 p-0 rounded-md w-full '>
							<Player response={response} id='A' players={players} />
							<Player response={response} id='B' players={players} />
							<div className='flex justify-center pt-2'>
								<CompareButton />
							</div>
						</div>
					</div>
				</div>
			</>
		);

		return (
			<>
				<SearchPlayer players={players} />
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
