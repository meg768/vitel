import React from 'react';
import Link from '../components/ui/link';
import Table from './ui/data-table';

function Component({ events }) {
	function Content() {
		function getSurfaceEventsQuery(row) {
			return {
				sql: `SELECT * FROM events WHERE surface = ? ORDER BY date DESC`,
				format: [row.surface],
				title: 'Turneringar på ' + row.surface
			};
		}
		return (
			<Table rows={events} className='striped hover '>
				<Table.Column id='date' className=''>
					<Table.Title className=''>Datum</Table.Title>
					<Table.Value className=''>
						{({ row }) => {
							return new Date(row.date).toLocaleDateString();
						}}
					</Table.Value>
				</Table.Column>

				<Table.Column id='name' className=''>
					<Table.Title className=''>Turnering</Table.Title>
					<Table.Cell>
						{({ row, value }) => {
							return (
								<>
									<Link to={`/event/${row.id}`}>{value}</Link>
								</>
							);
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='location'>
					<Table.Title>Plats</Table.Title>
					<Table.Cell>
						{({ row, value }) => {
							function query() {
								return {
									sql: `SELECT * FROM events WHERE location = ? ORDER BY date DESC`,
									format: [row.location],
									title: `Turneringar - ${value}`
								};
							}

							return (
								<Link to={`/events`} query={query()}>
									{value}
								</Link>
							);
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='type'>
					<Table.Title>Typ</Table.Title>
					<Table.Cell>
						{({ row, value }) => {
							function query() {
								return {
									sql: `SELECT * FROM events WHERE type = ? ORDER BY date DESC`,
									format: [row.type],
									title: `Turneringar - ${value}`
								};
							}

							return (
								<Link to={`/events`} query={query()}>
									{value}
								</Link>
							);
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='surface' className=''>
					<Table.Title className=''>Underlag</Table.Title>
					<Table.Cell>
						{({ row, value }) => {
							function translateSurface(surface) {
								switch (surface.toLowerCase()) {
									case 'hard':
										return 'Hardcourt';
									case 'clay':
										return 'Grus';
									case 'grass':
										return 'Gräs';
									case 'carpet':
										return 'Matta';
								}
								return 'Okänt underlag';
							}

							function query() {
								return {
									sql: `SELECT * FROM events WHERE surface = ? ORDER BY date DESC`,
									format: [row.surface],
									title: `Turneringar - ${translateSurface(value)}`
								};
							}

							return (
								<Link to={`/events`} query={query()}>
									{translateSurface(value)}
								</Link>
							);
						}}
					</Table.Cell>
				</Table.Column>
			</Table>
		);
	}

	return <Content />;
}

export default Component;
