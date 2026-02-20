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
			<>
				<div className='mt-2'>
					<p>{event.name}</p>
					<Table rows={event.players} className='mt-3'>
						<Table.Column id='rank' defaultSortOrder='ASC'>
							<Table.Title>Ranking</Table.Title>

							<Table.SortValue>{({ row }) => row.rank ?? 99999}</Table.SortValue>

							<Table.Cell className='text-right'>{({ value }) => (value ? value : '')}</Table.Cell>
						</Table.Column>

						<Table.Column id='name' defaultSortOrder='ASC'>
							<Table.Title>Spelare</Table.Title>
						</Table.Column>

						<Table.Column id='round' defaultSortOrder='DSC'>
							<Table.Title>Runda</Table.Title>

							<Table.SortValue>
								{({ row }) => {
									const order = { R128: 1, R64: 2, R32: 3, R16: 4, QF: 5, SF: 6, F: 7 };
									return order[row.round] ?? 0;
								}}
							</Table.SortValue>
						</Table.Column>

						<Table.Column id='id' className='opacity-60'>
							<Table.Title>ID</Table.Title>
						</Table.Column>
					</Table>
				</div>
			</>
		);
	}
	function Events({ events }) {
		return (
			<div className='events-list'>
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
