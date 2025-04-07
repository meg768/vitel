import React from 'react';

import { Link } from 'react-router';

import Table from './ui/table';
import { HamburgerMenuIcon, DotFilledIcon, CheckIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';

function DataTable({ rows, children, ...props }) {

	function Table(props) {
		return <table {...props}></table>;
	}

	function Headers(props) {

		children = React.Children.map(children, (child) => {
			return React.cloneElement(child, { rows: rows });
		});

		return (
			<tr>
				{children}
			</tr>
		);

	}

	function Head(props) {
		return <thead {...props}></thead>
	}

	function Body(props) {
		return <tbody {...props}></tbody>;
	}

	function Cell() {}

	function Rows() {}

	return (
		<Table>
			<Head>
				<Headers />
			</Head>
			<Body>
				<Rows />
			</Body>
		</Table>
	);
}

DataTable.Column = function ({ rows, children, ...props }) {
	children = React.Children.map(children, (child) => {
		return React.cloneElement(child, { rows: rows });
	});

	return (
		<th>
			
		</th>
	);
};

DataTable.Title = function ({ rows, children, ...props }) {};

<DataTable rows=''>
	<DataTable.Column>
		<DataTable.Title>Turnering</DataTable.Title>
		<DataTable.Value>
			{({ row, index }) => {
				return row.tournament;
			}}
		</DataTable.Value>
	</DataTable.Column>
</DataTable>;

let Component = ({ matches, owner }) => {
	let [sort, setSort] = React.useState(null);

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

			function onSort(index) {
				let field = sortFields[index];

				if (field != undefined) {
					let order = 'ASC';

					if (sort && sort.field == field) {
						order = sort.order == 'DESC' ? 'ASC' : 'DESC';
					}

					setSort({ field: field, order: order });
					console.log({ field: field, order: order });
				}
			}

			function HeadIcon({ index }) {
				function SortIcon({ index, className }) {
					let field = sortFields[index];
					className = classNames('text-[0.75em]! opacity-50', className);

					if (sort && field && sort.field == field) {
						return <span className={className}>{sort.order == 'ASC' ? '▲' : '▼'}</span>;
					}
				}

				return (
					<div>
						<SortIcon index={index} />
					</div>
				);
			}
			columns = columns.map((column, index) => {
				return (
					<Table.Head className='' key={index} onClick={onSort.bind(this, index)}>
						<div className='flex gap-1'>
							<div className=''>{column}</div>
							<HeadIcon index={index} />
						</div>
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
				let type = match.type;

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

			function sortMatches() {}
			function generateRows(matches) {
				let rows = [];

				if (sort) {
					matches = [...matches];
					matches.sort((A, B) => {
						let valueA = A[sort.field];
						let valueB = B[sort.field];
						if (sort.order == 'ASC') {
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
