import React from 'react';
import atp from '../../js/atp-service';

import Table from '../../components/ui/data-table';
import Link from '../../components/ui/link';
import Flag from '../../components/flag';
import { Container } from '../../components/ui';
import Page from '../../components/page';
import Menu from '../../components/menu';
import { useQuery } from '@tanstack/react-query';
import { HamburgerMenuIcon, DotFilledIcon, CheckIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';

function LiveTable({ rows }) {

	function Players({ playerA, playerB }) {
		return (
			<div className='flex items-center gap-2'>
				<Flag className='w-5! h-5! border-1! border-primary-200' country={playerA.country}></Flag>
				<Link to={`/player/${playerA.id}`}>{`${playerA.name}, ${playerA.country}`}</Link>
				<span>{' vs '}</span>
				<Flag className='w-5! h-5! border-1! border-primary-200' country={playerB.country}></Flag>
				<Link to={`/player/${playerB.id}`}>{`${playerB.name}, ${playerB.country}`}</Link>
			</div>
		);
	}

		function PlayersSimple({ playerA, playerB }) {
			return (
				<div className='flex items-center gap-2'>
					<Link to={`/player/${playerA.id}`}>{`${playerA.name}, ${playerA.country}`}</Link>
					<span>{' vs '}</span>
					<Link to={`/player/${playerB.id}`}>{`${playerB.name}, ${playerB.country}`}</Link>
				</div>
			);
		}

	function Content() {
		return (
			<Table rows={rows} className=''>
				<Table.Column id='name' className=''>
					<Table.Title className=''>Tournering</Table.Title>

					<Table.Cell className=''>
						{({ row, value }) => {
							return (
								<>
									<Link to={`/event/${row.event}`}>{value}</Link>
								</>
							);
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column className=''>
					<Table.Title className=''>Spelare</Table.Title>
					<Table.Value className=''>
						{({ row }) => {
							return <Players playerA={row.player} playerB={row.opponent} />;
						}}
					</Table.Value>
					<Table.Cell className=''>
						{({ row, value }) => {
							return value;
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='score' className=''>
					<Table.Title className=''>Ställning</Table.Title>
				</Table.Column>

				<Table.Column className='justify-center'>
					<Table.Title className=''>♨︎</Table.Title>
					<Table.Cell className=''>
						{({ row, value }) => {
							return (
								<Link to={`/head-to-head/${row.player.id}/${row.opponent.id}`}>
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

let Component = () => {
	const queryKey = `events`;
	const queryOptions = {};
	const { data: response, isPending, isError, error } = useQuery({ queryKey: [queryKey], queryFn: fetch });

	async function fetch() {
		try {
			let live = await atp.get('atp/live');

			return { live };
		} catch (error) {
			console.log(error.message);
			return null;
		}
	}

	function Content() {
		if (response == null) {
			return;
		}

		let { live } = response;

		return (
			<Page.Container>
				<Page.Title>{`Pågående matcher`}</Page.Title>
				<Container>
					<LiveTable rows={live} />
				</Container>
			</Page.Container>
		);
	}

	return (
		<>
			<Page id='live-page'>
				<Menu />
				<Content />
			</Page>
		</>
	);
};

export default Component;
