import { Link as RouterLink } from 'react-router';

import Table from '../../components/ui/data-table';
import Link from '../../components/ui/link';
import Button  from '../../components/ui/button';
import Flag from '../../components/flag';
import Page from '../../components/page';

import ChevronRightIcon from '../../assets/radix-icons/chevron-right.svg?react';

import { useRequest } from '../../js/vitel.js';

function isMatchFinished(score) {
	if (typeof score !== 'string' || score.trim() === '') {
		return true;
	}

	// Remove tiebreaks from the score
	score = score.replace(/\(\d+\)/g, '');

	const parts = score.trim().split(/\s+/);

	// Check if any part matches RET-like code (e.g., RET, RETD, retd, retired)
	if (parts.some(p => /^ret/i.test(p))) {
		return true;
	}

	// If there's only one part, it means the match is not finished
	if (parts.length == 1) {
		return false;
	}

	let playerA = 0;
	let playerB = 0;

	for (const part of parts) {
		if (part.length !== 2) {
			// If any part is not exactly two characters, consider it invalid
			// This can happen if the score is malformed or incomplete
			continue;
		}

		let A = parseInt(part[0], 10);
		let B = parseInt(part[1], 10);

		if (isNaN(A) || isNaN(B)) {
			// If any part is not a valid number, consider part invalid
			continue;
		}

		// If not 6 games played, match is not finished
		if (A + B < 6) {
			return false;
		}

		let setFinished = false;

		// If one player has more than 6 games, they must have won the set
		// or if the difference is 2 or more, one player has won the set
		// (e.g., 6-4, 7-5, etc.)
		if (A > 6 || B > 6) {
			setFinished = true;
		}

		// If the difference is 2 or more, and one player has 6 or more games
		// the set is finished
		if ((A >= 6 || B >= 6) && Math.abs(A - B) >= 2) {
			setFinished = true;
		}

		// If any set is not finished, the match is not finished
		if (!setFinished) {
			return false;
		}

		if (A > B) {
			playerA++;
		} else if (B > A) {
			playerB++;
		}
	}

	const maxSets = parts.length > 3 ? 5 : 3;
	const setsToWin = Math.ceil(maxSets / 2);

	return playerA >= setsToWin || playerB >= setsToWin;
}

function LiveTable({ rows, finished = false }) {
	function Players({ playerA, playerB }) {

		let flagClassName = 'w-5! h-5! border-primary-800 dark:border-primary-200';

		return (
			<div className='flex items-center gap-2 bg-transparent'>
				<Flag className={flagClassName} country={playerA.country}></Flag>
				<Link to={`/player/${playerA.id}`}>{`${playerA.name}, ${playerA.country}`}</Link>
				<span>{' vs '}</span>
				<Flag className={flagClassName} country={playerB.country}></Flag>
				<Link to={`/player/${playerB.id}`}>{`${playerB.name}, ${playerB.country}`}</Link>
			</div>
		);
	}

	function Content() {
		return (
			<Table rows={rows} className=''>
				<Table.Column id='name' className=''>
					<Table.Title className=''>Turnering</Table.Title>

					<Table.Cell className=''>
						{({ row, value }) => {
							return <Link to={`/event/${row.event}`}>{value}</Link>;
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
				</Table.Column>

				<Table.Column id='score' className=''>
					<Table.Title className=''>{finished ? 'Resultat' : 'Ställning'}</Table.Title>
					<Table.Cell>
						{({ value }) => value
							?.replace(/(\d)(\(\d+\))(\d)/g, (_, a, tb, b) => `${a}-${b}${tb}`)
							?.replace(/(\d)(\d)(\(\d+\))?/g, (_, a, b, tb) => `${a}-${b}${tb ?? ''}`)}
					</Table.Cell>
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
	// This component fetches and displays live ATP matches.
	// It uses the ATP service to get the matches and displays them in a table format.
	// It also splits the matches into active and finished matches.
	// Active matches are displayed with a link to TV4-Play and max.com for viewing.

	function FinishedMatches({ matches }) {
		if (matches.length == 0) {
			return;
		}

		return (
			<>
				<Page.Title level={2}>Avslutade</Page.Title>
				<LiveTable rows={matches} finished={true} />
			</>
		);
	}

	function ActiveMatches({ matches }) {
		if (matches.length == 0) {
			return;
		}

		return (
			<>
				<Page.Title level={2}>Pågående</Page.Title>
				<LiveTable rows={matches} finished={false} />

				<div className='flex justify-center pt-4 gap-4'>
					<Button>
						<RouterLink to={'https://www.tv4play.se/kategorier/atp-tour'} target={'_blank'} className=''>
							Se på TV4-Play
						</RouterLink>
					</Button>
					<Button>
						<RouterLink to={'https://play.max.com/sports/tennis'} target={'_blank'} className=''>
							Se på max.com
						</RouterLink>
					</Button>
				</div>
			</>
		);
	}

	function Matches({ matches }) {
		let finishedMatches = [];
		let activeMatches = [];

		// Split up into finished and unfinished matches
		for (let row of matches) {
			if (isMatchFinished(row.score)) {
				finishedMatches.push(row);
			} else {
				activeMatches.push(row);
			}
		}

		if (activeMatches.length === 0 && finishedMatches.length === 0) {
			return (
				<div className='flex flex-col items-center justify-center text-center py-12'>
					<div className='text-8xl'>😢</div>
					<div className='mt-4 text-xl text-primary-700 dark:text-primary-300'>Inga matcher idag</div>
				</div>
			);
		}
	

		return (
			<>
				<ActiveMatches matches={activeMatches} />
				<FinishedMatches matches={finishedMatches} />
			</>
		);
	}

	function Content() {
		let { data: matches, error } = useRequest({ path: 'live', method: 'GET', cache: 0 });

		if (error) {
			return <Page.Error>Misslyckades med att läsa in dagens matcher - {error.message}</Page.Error>;
		}

		if (!matches) {
			return <Page.Loading>Läser in dagens matcher...</Page.Loading>;
		}


		return (
			<>
				<Page.Title>{`Dagens matcher`}</Page.Title>
				<Page.Container>
					<Matches matches={matches} />
				</Page.Container>
			</>
		);
	}

	return (
		<Page>
			<Page.Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
};

export default Component;
