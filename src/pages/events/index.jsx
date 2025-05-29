import Events from '../../components/events';
import Page from '../../components/page';
import Menu from '../../components/menu';

import { useSQL } from '../../js/vitel.js';

let Component = () => {
	function Content() {
		let sql = '';
		sql += `SELECT * FROM events WHERE date >= CURRENT_DATE - INTERVAL 1 YEAR ORDER BY date DESC`;

		let { response: events, error } = useSQL({ sql, format: [], cache: 1000 * 60 * 5 });

		if (error) {
			return <Page.Error>Misslyckades med att läsa in turneringar - {error.message}</Page.Error>;
		}

		if (events) {
			return <Events events={events} />;
		}
		
		return <Page.Loading>Läser in turneringar...</Page.Loading>;
	}

	return (
		<Page id='events-page'>
			<Menu></Menu>
			<Page.Content>
				<Page.Title>{`Turneringar`}</Page.Title>
				<Page.Container>
					<Content/>
				</Page.Container>
			</Page.Content>
		</Page>
	);
};

export default Component;
