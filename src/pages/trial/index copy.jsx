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
			<Table rows={response.matches} className='striped hover'>
				{/* Tournament column */}

				<Table.Column id='tournament' className=''>
					<Table.Title className=''>Turnering</Table.Title>
					<Table.Value className=''>
						{({ row, index }) => {
							return new Date(row.date).toLocaleDateString() + ' ' + row.tournament;
						}}
					</Table.Value>
					<Table.Sort>
						{(A, B) => {
							A = new Date(A.date).toLocaleDateString() + ' ' + A.tournament;
							B = new Date(B.date).toLocaleDateString() + ' ' + B.tournament;
							return A > B;
						}}
					</Table.Sort>
				</Table.Column>

				<Table.Column id='winner' className=''>
					<Table.Title>Vinnare</Table.Title>
					<Table.Sort></Table.Sort>
					<Table.Value className=''>
						{({ row, index }) => {
							return (
								<>
									<Link to={`/player/${row.winner}`}>{row.winner}</Link>
									<small>{row.wrk ? ` (${row.wrk})` : ''}</small>
								</>
							);
						}}
					</Table.Value>
				</Table.Column>

				<Table.Column id='loser'>
					<Table.Title>Förlorare</Table.Title>
					<Table.Value>
						{({ row, index }) => {
							return (
								<>
									<Link to={`/player/${row.loser}`}>{row.loser}</Link>
									<small>{row.lrk ? ` (${row.lrk})` : ''}</small>
								</>
							);
						}}
					</Table.Value>
					<Table.Sort></Table.Sort>
				</Table.Column>

				<Table.Column id='round'>
					<Table.Title>Runda</Table.Title>
					<Table.Sort>
						{(A, B) => {
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
						<Table.Value>
							{({ row, index }) => {
								return (
									<Link to={`/head-to-head/${row.winner}/${row.loser}`}>
										<ChevronRightIcon className='block m-auto' />
									</Link>
								);
							}}
						</Table.Value>
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
					<Content />
				</Container>
			</Page>
		</>
	);
}

export default Component;
