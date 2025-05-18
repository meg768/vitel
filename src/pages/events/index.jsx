import React from 'react';
import mysql from '../../js/atp-service';
import { Container } from '../../components/ui';
import Events from '../../components/events';
import Page from '../../components/page';
import QueryPage from '../../components/query-page';

let Component = () => {
	const queryKey = `events`;

	async function fetch() {
		let sql = '';

		sql += `SELECT * FROM events WHERE date >= CURRENT_DATE - INTERVAL 1 YEAR ORDER BY date DESC`;

		let events = await mysql.query({ sql });

		return { events };
	}

	function Content({ events }) {

		let content = <p>Läser in...</p>;

		if (events) {
			content = <Events events={events} />;
		}

		return (
			<>
				<Page.Title>{`Turneringar`}</Page.Title>
				<Container>{content}</Container>
			</>
		);
	}

	return (
		<>
			<QueryPage id='events-page' queryKey={queryKey} queryFn={fetch}>
				{Content}
			</QueryPage>
		</>
	);
};

export default Component;
