import React from 'react';
import { Link } from 'react-router';
import Table from './ui/data-table';


function Component({ events }) {
	function Content() {
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
				</Table.Column>

				<Table.Column id='type'>
					<Table.Title>Typ</Table.Title>
				</Table.Column>


				<Table.Column id='surface' className=''>
					<Table.Title className=''>Underlag</Table.Title>
				</Table.Column>

			</Table>
		);
	}

	return <Content />;
}

export default Component;
