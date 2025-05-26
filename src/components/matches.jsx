import React from 'react';
import Link  from './../components/ui/link';
import Table from './ui/data-table';

import ChevronRightIcon from '../assets/radix-icons-jsx/chevron-right.jsx';

function Component({ matches, owner }) {
	function Content() {
		return (
			<Table rows={matches} className='striped hover'>
				<Table.Column id='event_date' className=''>
					<Table.Title className=''>Datum</Table.Title>
					<Table.Value className=''>
						{({ row }) => {
							return new Date(row.event_date).toLocaleDateString();
						}}
					</Table.Value>
				</Table.Column>

				<Table.Column id='event_name' className=''>
					<Table.Title className=''>Turnering</Table.Title>
					<Table.Cell>
						{({ row, value }) => {
							if (owner == row.event_id) {
								return <>{`${value} (${row.event_type})`}</>;
							}
							return (
								<>
									<Link to={`/event/${row.event_id}`}>{value}</Link>
									<span className='bg-transparent' >{` (${row.event_type})`}</span>
								</>
							);
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='event_surface' className=''>
					<Table.Title className=''>Underlag</Table.Title>
				</Table.Column>

				<Table.Column id='round'>
					<Table.Title>Runda</Table.Title>
					<Table.SortValue>
						{({ row }) => {
							let values = ['F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128', 'Q3', 'Q2', 'Q1', 'RR', 'RR2', 'RR3', 'RR3', 'RR4', 'RR5', 'RR6', 'BR'];
							return values.indexOf(row.round);
						}}
					</Table.SortValue>
				</Table.Column>

				<Table.Column id='winner' className=''>
					<Table.Title className=''>Vinnare</Table.Title>
					<Table.Cell>
						{({ row, value }) => {
							if (!row.winner_rank) {
								if (owner == row.winner_id) {
									return `${value}`;
								}
								return <Link to={`/player/${row.winner_id}`}>{value}</Link>;
							}

							if (owner == row.winner_id) {
								return `${value} (${row.winner_rank})`;
							}

							return (
								<>
									<Link to={`/player/${row.winner_id}`}>{value}</Link>
									<span className='bg-transparent'>{` (${row.winner_rank})`}</span>
								</>
							);
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='loser' className=''>
					<Table.Title className=''>Förlorare</Table.Title>
					<Table.Cell>
						{({ row, value }) => {
							if (!row.loser_rank) {
								if (owner == row.loser_id) {
									return `${value}`;
								}

								return <Link to={`/player/${row.loser_id}`}>{value}</Link>;
							}

							if (owner == row.loser_id) {
								return `${value} (${row.loser_rank})`;
							}
							return (
								<>
									<Link to={`/player/${row.loser_id}`}>{value}</Link>
									<span className='bg-transparent'>{` (${row.loser_rank})`}</span>
								</>
							);
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='score' className=''>
					<Table.Title className=''>Resultat</Table.Title>
				</Table.Column>

				<Table.Column id='duration' className=''>
					<Table.Title className=''>Speltid</Table.Title>
				</Table.Column>

				<Table.Column className='justify-center'>
					<Table.Title className=''>♨︎</Table.Title>
					<Table.Cell className=''>
						{({ row, value }) => {
							return (
								<Link to={`/head-to-head/${row.winner_id}/${row.loser_id}`}>
									<ChevronRightIcon className='block m-auto' />
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
