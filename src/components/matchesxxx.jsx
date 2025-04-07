import React from 'react';

import { Link } from 'react-router';

import Table from './ui/table';
import { HamburgerMenuIcon, DotFilledIcon, CheckIcon, ChevronRightIcon } from '@radix-ui/react-icons';

let Component = ({ matches, owner }) => {
	let [sortField, setSortField] = React.useState('');
	let [sortOrder, setSortOrder] = React.useState('');

	function Matches() {
		if (!matches) {
			return;
		}

		function Header() {
			let columns = ['Turnering', 'Vinnare', 'Förlorare', 'Runda', 'Resultat'];
			let sortFields = ['tournament', 'winner', 'loser', 'round', 'score'];

			if (owner != 'head-to-head') {
				columns.push(<div className='text-center'>H/H</div>);
			}

			function onSort(field) {
				if (field != undefined) {
					let newSortField = field;
					let newSortOrder = sortOrder == '' || sortOrder == 'ASC' ? 'DESC' : 'ASC';

					setSortField(newSortField);
					setSortOrder(newSortOrder);

					console.log(`Sorting ${newSortField} ${newSortOrder}`);
				}
			}
			columns = columns.map((column, index) => {
				return (
					<Table.Head key={index} onClick={onSort.bind(this, sortFields[index])}>
						{column}
					</Table.Head>
				);
			});

			return (
				<Table.Header>
					<Table.Row>{columns}</Table.Row>
				</Table.Header>
			);
		}

		function Body() {
			function generateTournament(match) {
				let date = new Date(match.date).toLocaleDateString();
				let tournament = match.tournament;
				let path = `${date}/${tournament}`;

				let level = match.level;

				if (level == 'ATP-Tour') {
					level = `ATP-${match.draw}`;
				}

				if (path == owner) {
					return <Table.Cell>{`${date} ${tournament} (${level})`}</Table.Cell>;
				}

				return (
					<Table.Cell>
						<Link to={`/tourney/${date}/${tournament}`}>{`${date} ${tournament}`}</Link>
						{` (${level})`}
					</Table.Cell>
				);
			}

			function generateWinner(match) {
				let wrk = match.wrk == undefined ? '' : ` (${match.wrk})`;

				if (owner == match.winner) {
					return (
						<td>
							<strong>{match.winner}</strong> {wrk}
						</td>
					);
				}
				return (
					<td>
						<Link to={`/player/${match.winner}`}>{match.winner}</Link>
						{wrk}
					</td>
				);
			}

			function generateLoser(match) {
				let lrk = match.lrk == undefined ? '' : ` (${match.lrk})`;

				if (owner == match.loser) {
					return <td className='me'>{`${match.loser} ${lrk}`}</td>;
				}
				return (
					<td>
						<Link to={`/player/${match.loser}`}>{match.loser}</Link>
						{lrk}
					</td>
				);
			}

			function generateHeadToHead(match) {
				if (owner == 'head-to-head') {
					return undefined;
				}

				return (
					<td className=' text-center align-center'>
						<Link to={`/head-to-head/${match.winner}/${match.loser}`}>
							<ChevronRightIcon className='block m-auto' />
						</Link>
					</td>
				);
			}

			function generateRows(matches) {
				let rows = [];

				if (sortField != '') {
					matches = [...matches];
					matches.sort((A, B) => {
						let valueA = A[sortField];
						let valueB = B[sortField];
						if (sortOrder == 'DESC') {
							return valueA > valueB;
						}
						return valueA < valueB;
					});
				}

				for (let index = 0; index < matches.length; index++) {
					let match = matches[index];

					rows.push(
						<Table.Row key={index}>
							{generateTournament(match)}
							{generateWinner(match)}
							{generateLoser(match)}
							<td>{match.round}</td>
							<td>{match.score}</td>
							{generateHeadToHead(match)}
						</Table.Row>
					);
				}
				return rows;
			}

			return <Table.Body>{generateRows(matches)}</Table.Body>;
		}

		return (
			<Table className='striped text-sm hover'>
				<Header />
				<Body />
			</Table>
		);
	}

	return <Matches />;
};

export default Component;
