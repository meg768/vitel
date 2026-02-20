import React from 'react';
import Page from '../../components/page';
import Table from '../../components/ui/data-table';

import { useSQL } from '../../js/vitel.js';

let Component = () => {
	function getEvents(data) {
		let events = {};

		// Group data by event_id and collect players for each event
		for (let row of data) {
			if (!events[row.event_id]) {
				events[row.event_id] = { id: row.event_id, name: row.event_name, date: row.event_date, players: [] };
			}

			events[row.event_id].players.push({ id: row.player_id, name: row.player, rank: row.player_rank, round: row.round });
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

    function Event({ event }) {

        return (
            <div className="mb-6 p-4 border rounded">
                <h2>{event.name}</h2>
                <p>{event.date}</p>
                <ul>
                    {event.players.map(player => (
                        <li key={player.id}>{player.name} - Rank: {player.rank}</li>
                    ))}
                </ul>
            </div>
        );
    }

    function Events({ events }) {
        return (
            <div className="events-list">
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
				<br></br>
				<pre>{JSON.stringify(events, null, 2)}</pre>
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
