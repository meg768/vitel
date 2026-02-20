import React from 'react';
import Page from '../../components/page';
import Flag from '../../components/flag';
import Link from '../../components/ui/link';

import { useSQL } from '../../js/vitel.js';

let Component = () => {
	function getEvents(data) {
		let events = {};

		// Group data by event_id and collect players for each event
		for (let row of data) {
			if (!events[row.event_id]) {
				events[row.event_id] = { id: row.event_id, name: row.event_name, type: row.event_type, date: row.event_date, players: [] };
			}

			events[row.event_id].players.push({ id: row.player_id, name: row.player, country: row.player_country, rank: row.player_rank, round: row.round });
		}

		// Sort players within each event by rank
		for (let eventID in events) {
			// If rank is null, treat it as a very large number to sort them at the end
			events[eventID].players.sort((a, b) => (a.rank ?? 99999) - (b.rank ?? 99999));
		}

		// Convert events object to an array and sort events by date (newest first) and then by name
		let array = Object.values(events);
		array.sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.name.localeCompare(b.name));

		return array;
	}

	function Players({ players }) {
		return (
			<ul className='divide-y divide-primary-200 dark:divide-primary-800'>
				{players.map(player => (
					<Player key={player.id} player={player} />
				))}
			</ul>
		);
	}

	function Player({ player }) {
		let flagClassName = 'w-5! h-5! border-primary-800 dark:border-primary-200';

		return (
			<li key={player.id} className='flex items-center justify-between py-2 px-2 rounded hover:bg-primary-100 dark:hover:bg-primary-800'>
				<div className='flex items-center gap-3'>
					<Flag className={flagClassName} country={player.country}></Flag>
					<Link to={`/player/${player.id}`}>{`${player.name}`}</Link>
					<span className=''>{player.rank ? `(#${player.rank})` : ''}</span>
				</div>

				<span className=' px-2 py-1 rounded'>{player.round}</span>
			</li>
		);
	}

	function Event({ event }) {
		return (
			<div className='mb-4 border rounded border-primary-200 dark:border-primary-800 p-4'>
				<p className='mb-2 text-2xl font-semibold'>
					{event.name} ({event.type})
				</p>
				<Players players={event.players} />
			</div>
		);
	}
	function Events({ events }) {
		return (
			<div className=''>
				{events.map(event => (
					<Event key={event.id} event={event} />
				))}
			</div>
		);
	}

	function Content() {
		let sql = `SELECT * FROM currently`;
		let { data, error } = useSQL({ sql, cache: 1000 * 60 * 5 });

		if (error) {
			return <Page.Error>Misslyckades med att läsa in aktuella turneringar - {error.message}</Page.Error>;
		}

		if (!data) {
			return <Page.Loading>Läser in...</Page.Loading>;
		}

		const events = getEvents(data);

		return (
			<>
				<Page.Title>Pågående turneringar</Page.Title>
				<Page.Container>
					<Events events={events} />
				</Page.Container>
			</>
		);
	}

	return (
		<Page>
			<Page.Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
};

export default Component;
