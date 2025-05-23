import React from 'react';
import atp from '../../js/atp-service';

import Table from '../../components/ui/data-table';
import Link from '../../components/ui/link';
import { Link as RouterLink } from 'react-router';

import Flag from '../../components/flag';
import { Button } from '../../components/ui';
import { Container } from '../../components/ui';
import Page from '../../components/page';
import Menu from '../../components/menu';
import { useQuery } from '@tanstack/react-query';
import { HamburgerMenuIcon, DotFilledIcon, CheckIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';

function isMatchFinished(score) {
	if (typeof score !== 'string' || score.trim() === '') return false;

	const sets = score.trim().split(/\s+/);

	const maxSets = sets.length > 3 ? 5 : 3;
	const setsToWin = Math.ceil(maxSets / 2);

	let player1Sets = 0;
	let player2Sets = 0;

	for (const set of sets) {
		// Remove tiebreak info in parentheses, e.g. (4), (10)
		const cleaned = set.replace(/\(\d+\)/g, '');
		if (!/^\d{2}$/.test(cleaned)) return false;

		const p1 = parseInt(cleaned[0], 10);
		const p2 = parseInt(cleaned[1], 10);

		if (p1 < 6 && p2 < 6) return false; // Incomplete set

		const max = Math.max(p1, p2);
		const min = Math.min(p1, p2);
		const diff = Math.abs(p1 - p2);

		const valid =
			(max === 6 && diff >= 2) || // 6–0 to 6–4
			(max === 7 && (min === 5 || min === 6)); // 7–5 or 7–6
		if (!valid) return false;

		if (p1 > p2) player1Sets++;
		else player2Sets++;
	}

	return player1Sets === setsToWin || player2Sets === setsToWin;
}

function LiveTable({ rows }) {
	function Doo({ score }) {
		if (isMatchFinished(score)) {
			return <CheckIcon className='block m-auto bg-transparent text-green-500' />;
		} else {
			return <DotFilledIcon className='block m-auto bg-transparent text-red-500' />;
		}
	}

	function Players({ playerA, playerB }) {
		return (
			<div className='flex items-center gap-2 bg-transparent'>
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

				<Table.Column className=''>
					<Table.Title className=''>Avslutad</Table.Title>
					<Table.Value className=''>
						{({ row }) => {
							return <Doo score={row.score} />;
						}}
					</Table.Value>
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
	const queryKey = `live`;
	const queryOptions = {};
	// const { data: response, isPending, isError, error } = useQuery({ queryKey: [queryKey], queryFn: fetch });

	async function fetch() {
		try {
			let live = await atp.get('live');

			return { live };
		} catch (error) {
			console.log(error.message);
			return null;
		}
	}

	function Content(response) {
		let { live } = response || {};

		let content = <Page.Loading>Läser in dagens matcher...</Page.Loading>;

		if (live) {
			content = <LiveTable rows={live} />;
		}

		return (
			<>
				<Page.Title>{`Dagens (pågående) matcher`}</Page.Title>
				<Page.Container>
					<div>{content}</div>
					<div className='flex justify-center py-4'>
						<Button>
							<RouterLink to={'https://www.tv4play.se/kategorier/atp-tour'} target={'_blank'} className=''>
								Se på TV4-Play
							</RouterLink>
						</Button>
					</div>
				</Page.Container>
			</>
		);
	}

	return (
		<Page id='live-page'>
			<Page.Menu />
			<Page.Content>
				<Page.Query queryKey={queryKey} queryFn={fetch}>
					{Content}
				</Page.Query>
			</Page.Content>
		</Page>
	);

	return (
		<>
			<Page id='live-page'>
				<Menu spinner={!response} />
				<Content />
			</Page>
		</>
	);
};

export default Component;
