import React from 'react';
import mysql from '../../js/atp-service';

import { useParams } from 'react-router';
import Link from '../../components/ui/link';

import { Container } from '../../components/ui';
import Matches from '../../components/matches';
import Page from '../../components/page';
import EventLogo from '../../components/event-logo';
import Menu from '../../components/menu';
import { useQuery } from '@tanstack/react-query';

import EventSummary from '../../components/event-summary';

let Component = () => {
	const params = useParams();
	const queryKey = `event/${JSON.stringify(useParams())}`;
	const queryOptions = {};
	const { data: response, isPending, isError, error } = useQuery({ queryKey: [queryKey], queryFn: fetch });

	async function fetch() {
		try {
			let sql = '';
			let format = [];

			sql += `SELECT * FROM flatly WHERE event_id = ? `;
			sql += `ORDER BY event_date DESC, `;
			sql += `FIELD(round, 'F', 'SF', 'QF', 'R16', 'R32', 'R64', 'R128', 'Q3', 'Q2', 'Q1', 'BR'); `;

			format = format.concat([params.id]);

			sql += `SELECT * FROM events where id = ? `;

			format = format.concat([params.id]);

			let details = await mysql.query({ sql, format });
			let [matches, [event]] = details;

			return { matches: matches, event: event };
		} catch (error) {
			console.log(error.message);
		}
	}

	function Title({}) {
		let { matches, event } = response;
		let date = new Date(event.date).toLocaleDateString();
		let year = new Date(event.date).getFullYear();

		return (
			<Page.Title className='flex items-center '>
				<div className='flex-none bg-transparent'>
					<Link target='_blank' to={event.url}>
						{event.name}
					</Link>
					{` ${year}`}
				</div>
				<div className='flex-grow'></div>
				<div className='flex-none bg-transparent'>
					<EventLogo className='max-h-15 ' event={event} />
				</div>
			</Page.Title>
		);
	}

	function Content() {
		if (isError) {
			return (
				<Page.Error>
					<p className='font-bold text-xl'>{`Ett fel inträffade.  `}</p>
					<p className=''>{`${error.message}`}</p>
				</Page.Error>
			);
		}


		if (!response) {
			return;
		}

		let { matches, event } = response;

		if (!event) {
			return (
				<Page.Error>
					<p className='font-bold text-xl'>{`Kunde inte hitta turnering med ID '${params.id}'.  `}</p>
					<p className=''>{`Antagligen är det en ny turnering som ännu inte importerats. `}</p>
				</Page.Error>
			);
		}

		return (
			<>
				<Title />
				<Container>
					<Page.Title level={2}>Översikt</Page.Title>
					<EventSummary event={event} matches={matches} />
					<Page.Title level={2}>Matcher</Page.Title>
					<Matches matches={matches} owner={`${params.id}`}></Matches>
				</Container>
			</>
		);
	}

	return (
		<>
			<Page id='event-page'>
				<Menu spinner={isPending} />
				<Page.Container>
					<Content />
				</Page.Container>
			</Page>
		</>
	);
};

export default Component;
