import React from 'react';

import { Link } from 'react-router';

import Table from './ui/table';
import { HamburgerMenuIcon, DotFilledIcon, CheckIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';

let Component = ({ players }) => {
	let [sort, setSort] = React.useState(null);

	function Players() {
		if (!players) {
			return;
		}

		function Header() {
			let columns = ['Namn', 'Ranking', 'Land', 'Ålder'];
			let sortFields = ['name', 'rank', 'country', 'age'];

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
			function Rank({ player }) {
				return <Table.Cell>{player.rank ? player.rank : '-'}</Table.Cell>;
			}

			function Name({ player }) {
				return (
					<Table.Cell>
						<Link to={`/player/${player.id}`}>{player.name}</Link>
					</Table.Cell>
				);
			}
			function Country({ player }) {
				return <Table.Cell>{player.country ? player.country : '-'}</Table.Cell>;
			}
			function Age({ player }) {
				return <Table.Cell>{player.age ? player.age : '-'}</Table.Cell>;
			}

			function Row({ player }) {}
			function Rows({ players }) {
				let rows = [];

				if (sort) {
					players = [...players];
					players.sort((A, B) => {
						let valueA = A[sort.field];
						let valueB = B[sort.field];
						if (sort.order == 'ASC') {
							return valueA > valueB;
						}
						return valueA < valueB;
					});
				}

				for (let index = 0; index < players.length; index++) {
					let player = players[index];

					rows.push(
						<Table.Row key={index}>
							<Name player={player} />
							<Rank player={player} />
							<Country player={player} />
							<Age player={player} />
						</Table.Row>
					);
				}
				return rows;
			}

			return (
				<Table.Body>
					<Rows players={players} />
				</Table.Body>
			);
		}

		return (
			<Table className='striped hover'>
				<Header />
				<Body />
			</Table>
		);
	}

	return <Players />;
};

export default Component;
