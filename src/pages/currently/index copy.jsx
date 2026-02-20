import React from 'react';
import Page from '../../components/page';

import { useSQL } from '../../js/vitel.js';

let Component = () => {
	function Content() {
		let sql = `SELECT * FROM currently`;
		let { data, error } = useSQL({ sql, cache: 1000 * 60 * 5 });

		if (error) {
			return <Page.Error>Misslyckades med att läsa in aktuella turneringar - {error.message}</Page.Error>;
		}

		if (!data) {
			return <Page.Loading>Läser in...</Page.Loading>;
		}

		return (
			<>
				<Page.Title>Pågående turneringar</Page.Title>
				<Page.Container>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
				</Page.Container>
			</>
		);
	}

	return (
		<Page>
			<Page.Menu/>
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
};

export default Component;
