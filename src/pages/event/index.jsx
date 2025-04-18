
import React from 'react';
import mysql from '../../js/mysql-express';

import { Link, useParams } from 'react-router';

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
			<Page.Title className='flex items-center'>
				<div className='flex-none'>
					<Link target='_blank' to={event.url}>
						{event.name}
					</Link>
					{` ${year}`}
				</div>
				<div className='flex-grow'></div>
				<div className='flex-none'>
					<EventLogo className='max-h-15' event={event} />
				</div>
			</Page.Title>
		);
	}

	function Content() {
		if (!response) {
			return;
		}

		let { matches, event } = response;

		return (
			<Page.Container>
				<Title />
				<Container>
					<Page.Title level={2}>Översikt</Page.Title>
					<EventSummary event={event} matches={matches} />
					<Page.Title level={2}>Matcher</Page.Title>
					<Matches matches={matches} owner={`${params.id}`}></Matches>
				</Container>
			</Page.Container>
		);
	}

	return (
		<>
			<Page id='event-page'>
				<Menu />
				<Content />
			</Page>
		</>
	);
};

export default Component;
