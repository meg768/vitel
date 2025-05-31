import Events from '../../components/events';
import Page from '../../components/page';
import Menu from '../../components/menu';

import { useSQL } from '../../js/vitel.js';

function Component()  {

	function fetch() {
		let sql = '';
		sql += `SELECT * FROM events WHERE date >= CURRENT_DATE - INTERVAL 1 YEAR ORDER BY date DESC`;

		return useSQL({ sql, format: [], cache: 1000 * 60 * 5 });
	}

	function Content() {
		let { data: events, error } = fetch();

		if (error) {
			return <Page.Error>Misslyckades med att läsa in turneringar - {error.message}</Page.Error>;
		}

		if (!events) {
			return <Page.Loading>Läser in turneringar...</Page.Loading>;
		}

		return (
			<>
				<Page.Title>{`Turneringar`}</Page.Title>
				<Page.Container>
					<Events events={events} />
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
};

export default Component;
