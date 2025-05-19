import React from 'react';
import mysql from '../../js/atp-service';

import { useParams } from 'react-router';

import { Container } from '../../components/ui';
import Players from '../../components/players';
import Page from '../../components/page';
import Menu from '../../components/menu';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';

let Component = () => {
	const [searchParams] = useSearchParams();

	let query = getQuery();

	const queryKey = query ? `players-${JSON.stringify(query)}` : 'players-noquery';
	console.log(`QueryKey: ${queryKey}`);
	// const { data: response, isPending, isLoading, isFetching, isPreviousData, isError, error } = useQuery({ queryKey: [queryKey], queryFn: fetch });

	// function isReady() {
	// 	return !isLoading && !isPending && !isFetching && !isPreviousData && response != null;
	// }

	function getQuery() {
		let query = searchParams.get('query');

		if (!query) {
			return null;
		}
		try {
			query = JSON.parse(decodeURIComponent(query));
		} catch (error) {
			query = null;
		}
		return query;
	}

	async function fetch() {
		try {
			let query = getQuery();

			if (!query || !query.sql) {
				query = {};
				query.sql = `SELECT * FROM players WHERE NOT rank IS NULL ORDER BY rank LIMIT 100`;
			} else {
			}

			let players = await mysql.query(query);

			return { players };
		} catch (error) {
			console.log(error.message);
			return null;
		}
	}

	function Title() {
		let title = getQuery()?.title;

		if (!title) {
			title = 'Spelare';
		}
		return <Page.Title>{title}</Page.Title>;
	}

	function Content(response) {
		if (!response) {
			return;
		}

		let {players} = response;

		return (
			<>
				<Title />
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
				<Page.Query queryKey={queryKey} queryFn={fetch}>
					{Content}
				</Page.Query>
			</Page.Content>
		</Page>
	);

	return (
		<>
			<Page id='players-page'>
				<Menu spinner={isPending} />
				<Content />
			</Page>
		</>
	);
};

export default Component;
