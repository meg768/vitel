import { useSearchParams } from 'react-router';

import Players from '../../components/players';
import Page from '../../components/page';

import { useSQL } from '../../js/vitel.js';

let Component = () => {
	const [searchParams] = useSearchParams();
	let query = searchParams.get('query') || {};

	if (query) {
		try {
			query = JSON.parse(decodeURIComponent(query));
		} catch (error) {
			query = {};
		}	
	}

	function Content() {
		let {sql, format} = query;

		if (!sql) {
			sql = `SELECT * FROM players WHERE NOT rank IS NULL ORDER BY rank LIMIT 100`;
		}

		let { response, error } = useSQL({ sql, format, cache: 1000 * 60 * 5 });
		let players = response;

		if (error) {
			return <Page.Error>Misslyckades med att läsa in spelare - {error.message}</Page.Error>;
		}

		if (players) {
			return <Players players={players} />;
		}

		return <Page.Loading>Läser in spelare...</Page.Loading>;
	}

	return (
		<Page id='players-page'>
			<Page.Menu />
			<Page.Content>
				<Page.Title>{query.title ? query.title : 'Spelare'}</Page.Title>
				<Page.Container>
					<Content/>
				</Page.Container>
			</Page.Content>
		</Page>
	);
};

export default Component;
