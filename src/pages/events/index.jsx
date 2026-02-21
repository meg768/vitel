import { useSearchParams } from 'react-router';

import Events from '../../components/events';
import Page from '../../components/page';
import Menu from '../../components/menu';

import { useSQL } from '../../js/vitel.js';

function Component() {
	function getQuery() {
		const [searchParams] = useSearchParams();
		let query = searchParams.get('query');

		if (query) {
			try {
				query = JSON.parse(decodeURIComponent(query));
			} catch (error) {
				query = {};
			}
		}

		return query || {};
	}

	function fetch(query) {
		let { sql, format } = query;

		if (!sql) {
			sql = `SELECT * FROM events WHERE date >= CURRENT_DATE - INTERVAL 1 YEAR ORDER BY date DESC LIMIT 100`;
			format = [];
		}

		return useSQL({ sql, format });
	}

	function Content() {
		let query = getQuery();
		let { data: events, error } = fetch(query);

		if (error) {
			return <Page.Error>Misslyckades med att läsa in turneringar - {error.message}</Page.Error>;
		}

		if (!events) {
			return <Page.Loading>Läser in turneringar...</Page.Loading>;
		}

		return (
			<>
				<Page.Title>{query.title ? query.title : 'Turneringar'}</Page.Title>
				<Page.Container>
					<Events events={events} hide={['event_date']} />
				</Page.Container>
			</>
		);
	}

	return (
		<Page id='events-page'>
			<Menu></Menu>
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
}

export default Component;
