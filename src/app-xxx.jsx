import './app.scss';
import React from 'react';
import Request from './js/request';

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

import { HamburgerMenuIcon, DotFilledIcon, CheckIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';

let locals = new LocalStorage({ key: 'AppPage' });

// Get all players sorted by rank/date
async function getTopPlayers() {
	let sql = `
SELECT
    DISTINCT players.*
FROM
    (
        (
            SELECT
                winner AS name,
                MIN(
                    CASE
                        WHEN wrk IS NULL THEN 1000
                        ELSE wrk
                    END
                ) AS rank,
                MAX(YEAR(date)) AS YEAR
            FROM
                matches
            GROUP BY
                winner
        )
        UNION
        (
            SELECT
                loser AS name,
                MIN(
                    CASE
                        WHEN lrk IS NULL THEN 1000
                        ELSE lrk
                    END
                ) AS rank,
                MAX(YEAR(date)) AS YEAR
            FROM
                matches
            GROUP BY
                loser
        )
    ) AS A
    LEFT JOIN players ON players.name = A.name
ORDER BY
    rank ASC,
    A.year DESC;

`;
	let request = new Request();
	return await request.get('query', { database: 'atp', sql: sql });
}

async function getTourneys() {
	let sql = '';
	sql += `SELECT * FROM tournaments ORDER BY date DESC`;

	let request = new Request();
	let tourneys = await request.get('query', { database: 'atp', sql: sql });

	return tourneys;
}

async function getPlayer(name) {
	let sql = '';
	sql += `SELECT * FROM players WHERE name = ?`;

	let format = [name];

	let request = new Request();
	let result = await request.get('query', { database: 'atp', sql: sql, format:format });

	return result[0];
}

async function getLatestMatch() {
	let sql = '';
	sql += `SELECT * FROM matches ORDER BY date DESC LIMIT 1`;

	let request = new Request();
	let matches = await request.get('query', { database: 'atp', sql: sql });

	return matches[0];
}

function App() {
	const [playerNames, setPlayerNames] = React.useState({ A: 'Jannik Sinner' , B:'Jimmy Connors'});
	const [checkmarks, setCheckmarks] = React.useState(locals.get('checkmarks', []));

	// Fetch data, cache for 60 minutes
	const { data: response, isPending, isError, error } = useQuery({ queryKey: ['main-page'], queryFn: fetch, gcTime: 60 * 60 * 1000 });

	async function fetch() {

		let list = {};

		for (const [id, name] of Object.entries(playerNames)) {
			list[id] = await getPlayer(name);
		}

		let players = await getTopPlayers();
		let tourneys = await getTourneys();
		let latestMatch = await getLatestMatch();

		return { list:list, players: players, tourneys: tourneys, latestMatch: latestMatch };
	}

	function GoButton(properties) {
		let { id } = properties;
		let player = response.list[id];

		let url = '';

		if (player) {
			url = `/player/${player.name}`;
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
			playerA = response.list[checkmarks[0]];
			playerB = response.list[checkmarks[1]];

			if (playerA && playerB) {
				url = `/head-to-head/${playerA.name}/${playerB.name}/`;
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
			let names = { ...playerNames };
			names[id] = player.name;
			console.log(names);
			setPlayerNames(names);
		}

		function isChecked() {
			return checkmarks.indexOf(id) >= 0;
		}
		return (
			<div className={className}>
				<div className='flex justify-start gap-4 items-center pt-1 pb-1'>
					<Checkbox className='' checked={isChecked()} onCheckedChange={onCheckChange} />
					<div className='flex-1'>
						<PlayerPicker className='' onChange={onPlayerChange} players={response.players} player={response.list[id]} placeholder={'-'} />
					</div>
					<div>
						<GoButton id={id} />
					</div>
				</div>
			</div>
		);
	}
	function Content() {
		if (!response) {
			return;
		}

		let { tourneys, players, latestMatch } = response;
		let latestUpdate = new Date(latestMatch.date).toLocaleDateString();

		return (
			<>
				<p className='pb-5'>
					{`All data är baserad på `}
					<span className={'hover:text-link-500'}>
						<Link target='_blank' to='https://www.jeffsackmann.com'>
							Jeff Sackmanns
						</Link>
					</span>
					{` arbete.`}
					{` Senaste uppdatering från ${latestUpdate}.`}
				</p>
				<div className='pb-2 text-xl'>Välj spelare</div>
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
			</>
		);
	}

	return (
		<Page>
			<Menu />

			<Container className='px-15'>
				<h1>Statistik från ATP </h1>
				<Content />
			</Container>
		</Page>
	);
}

export default App;
