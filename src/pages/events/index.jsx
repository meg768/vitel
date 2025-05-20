import React from 'react';
import mysql from '../../js/atp-service';
import { Container } from '../../components/ui';
import Events from '../../components/events';
import Page from '../../components/page';
import Menu from '../../components/menu';

let Component = () => {
	const queryKey = `events`;

	async function fetch() {
		let sql = '';

		sql += `SELECT * FROM events WHERE date >= CURRENT_DATE - INTERVAL 1 YEAR ORDER BY date DESC`;

		let events = await mysql.query({ sql });

		return { events };
	}

	function Content(response) {
		let events = response?.events;
		let content = <Page.Loading>Läser in turneringar...</Page.Loading>;

		if (events) {
			content = <Events events={events} />;
		}

		return (
			<Page.Content>
				<Page.Title>{`Turneringar`}</Page.Title>
				<Page.Container>{content}</Page.Container>
			</Page.Content>
		);
	}

	return (
		<Page id='events-page'>
			<Menu></Menu>
			<Page.Query queryKey={queryKey} queryFn={fetch}>
				{Content}
			</Page.Query>
		</Page>
	);
};

export default Component;
