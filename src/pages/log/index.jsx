import React from 'react';
import mysql from '../../js/atp-service';

import { useParams } from 'react-router';

import { Container } from '../../components/ui';
import Table from '../../components/ui/data-table';
import Page from '../../components/page';
import Menu from '../../components/menu';
import { useQuery } from '@tanstack/react-query';

function LogTable({ rows }) {

	function Content() {
		return (
			<Table rows={rows} className=''>
				<Table.Column id='timestamp'>
					<Table.Title className=''>Datum/tid</Table.Title>

					<Table.Value className=''>
						{({ row }) => {
							return new Date(row.timestamp).toLocaleString();
						}}
					</Table.Value>

					<Table.Cell className='whitespace-nowrap w-1'>
						{({ row, value }) => {
							return value;
						}}
					</Table.Cell>
				</Table.Column>

				<Table.Column id='message' className=''>
					<Table.Title className=''>Meddelande</Table.Title>
				</Table.Column>
			</Table>
		);
	}

	return <Content />;
}

let Component = () => {
	const queryKey = `logs`;
	const queryOptions = {};
	const { data: response, isPending, isError, error } = useQuery({ queryKey: [queryKey], queryFn: fetch });

	async function fetch() {
		try {
			let sql = '';

			sql += `SELECT * FROM log WHERE timestamp >= CURDATE() - INTERVAL 1 DAY ORDER BY timestamp ASC;`;
			let log = await mysql.query({ sql });

			return { log };
		} catch (error) {
			console.log(error.message);
			return null;
		}
	}

	function Content() {
		if (response == null) {
			return;
		}

		let { log } = response;

		return (
			<Page.Container>
				<Page.Title>{`Logg senaste dygnet`}</Page.Title>
				<Container>
					<LogTable rows={log} />
				</Container>
			</Page.Container>
		);
	}

	return (
		<>
			<Page id='log-page'>
				<Menu />
				<Content />
			</Page>
		</>
	);
};

export default Component;
