import React from 'react';
import Request from '../../js/request';

import { Button, Container } from '../../components/ui';
import { useQuery } from '@tanstack/react-query';

import { useState, useRef } from 'react';
import { NavLink, Link } from 'react-router';

import Table from './data-table';

import Menu from '../../components/menu';
import Page from '../../components/page';

import { HamburgerMenuIcon, DotFilledIcon, CheckIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';

import classNames from 'classnames';

function Component() {
	const queryKey = 'FooBar';
	const { data: response, isPending, isError, error } = useQuery({ queryKey: [queryKey], queryFn: fetch });

	async function fetch() {
		let params = {
			name: 'Jannik Sinner'
		};

		let sql = '';
		sql += `SELECT * FROM ?? `;
		sql += `WHERE winner = ? `;
		sql += `OR loser = ? `;
		sql += `ORDER BY date DESC, `;
		sql += `FIELD(round, 'F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128', 'BR') LIMIT 25; `;

		sql += `SELECT * FROM ?? `;
		sql += `WHERE name = ?; `;

		let format = ['matches', params.name, params.name, 'players', params.name];

		let request = new Request();
		let result = await request.get('query', { database: 'atp', sql: sql, format: format });

		let player = result[1][0];
		let matches = result[0];
		let response = { matches: matches, player: player };

		return response;
	}

	function Content() {
		if (!response) {
			return;
		}

		return (
			<Table rows={response.matches} className='striped hover text-[95%]'>
				{/* Tournament column */}

				<Table.Column id='tournament' className=''>
					<Table.Title className=''>Turnering</Table.Title>
					<Table.Value>
						{({ row }) => {
							return new Date(row.date).toLocaleDateString() + ' ' + row.tournament;
						}}
					</Table.Value>
				</Table.Column>

				<Table.Column id='winner' className=''>
					<Table.Title>Vinnare</Table.Title>
					<Table.Cell>
						{({ row, value }) => {
							return (
								<>
									<Link to={`/player/${row.winner}`}>{value}</Link>
									<small>{row.wrk ? ` (${row.wrk})` : ''}</small>
								</>
							);
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='loser'>
					<Table.Title>Förlorare</Table.Title>
					<Table.Cell>
						{({ row, value }) => {
							return (
								<>
									<Link to={`/player/${row.loser}`}>{value}</Link>
									<small>{row.lrk ? ` (${row.lrk})` : ''}</small>
								</>
							);
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='round'>
					<Table.Title>Runda</Table.Title>
					<Table.Sort>
						{({ A, B }) => {
							let values = ['F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128', 'RR', 'BR'];
							A = values.indexOf(A.round);
							B = values.indexOf(B.round);
							return A > B;
						}}
					</Table.Sort>
				</Table.Column>

				<Table.Column id='score'>
					<Table.Title>Resultat</Table.Title>
				</Table.Column>

				{true ? (
					<Table.Column className='justify-center cursor-default!'>
						<Table.Title className=''>H/H</Table.Title>
						<Table.Cell>
							{({ row, value }) => {
								return (
									<Link to={`/head-to-head/${row.winner}/${row.loser}`}>
										<ChevronRightIcon className='block m-auto' />
									</Link>
								);
							}}
						</Table.Cell>
					</Table.Column>
				) : (
					''
				)}
			</Table>
		);
	}

	return (
		<>
			<Page>
				<Menu />
				<Container className='px-15'>
					<h1 className='pb-2'>Leker med sortering av kolumner</h1>
					<p />
					<Content />
				</Container>
			</Page>
		</>
	);
}

export default Component;
