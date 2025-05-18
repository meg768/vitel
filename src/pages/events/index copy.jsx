
import React from 'react';
import mysql from '../../js/atp-service';

import { useParams } from 'react-router';

import { Container } from '../../components/ui';
import Events from '../../components/events';
import Page from '../../components/page';
import Menu from '../../components/menu';
import { useQuery } from '@tanstack/react-query';


let Component = () => {
	const queryKey = `events`;
	const queryOptions = {};
	const { data: response, isPending, isError, error } = useQuery({ queryKey: [queryKey], queryFn: fetch });

	async function fetch() {
		try {
			let sql = '';

			sql += `SELECT * FROM events WHERE date >= CURRENT_DATE - INTERVAL 1 YEAR ORDER BY date DESC`;

			let events = await mysql.query({ sql });

			return { events };
		} catch (error) {
			console.log(error.message);
			return null;
		}
	}

	function Content() {
		if (response == null) {
			return;
		}

		let { events } = response;


		return (
			<Page.Container >
				<Page.Title>{`Turneringar`}</Page.Title>
				<Container>
					<Events events={events} />
				</Container>
			</Page.Container>
		);
	}

	return (
		<>
			<Page id='events-page'>
				<Menu spinner={isPending}/>
				<Content />
			</Page>
		</>
	);
};

export default Component;
