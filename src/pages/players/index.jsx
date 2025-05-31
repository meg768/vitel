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
		let { sql, format } = query;

		if (!sql) {
			sql = `SELECT * FROM players WHERE NOT rank IS NULL ORDER BY rank LIMIT 100`;
		}

		let { data: players, error } = useSQL({ sql, format, cache: 1000 * 60 * 5 });

		if (error) {
			return <Page.Error>Misslyckades med att läsa in spelare - {error.message}</Page.Error>;
		}

		if (!players) {
			return <Page.Loading>Läser in spelare...</Page.Loading>;
		}

		return (
			<>
				<Page.Title>{query.title ? query.title : 'Spelare'}</Page.Title>
				<Page.Container>
					<Players players={players} />
				</Page.Container>
			</>
		);
	}

	return (
		<Page id='players-page'>
			<Page.Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
};

export default Component;
