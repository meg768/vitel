import { useSQL } from '../../js/vitel';

import Table from '../../components/ui/data-table';
import Page from '../../components/page';

function Component() {
	const queryKey = `logs`;

	function fetch() {
		let sql = '';
		sql += `SELECT * FROM log WHERE timestamp >= CURDATE() - INTERVAL 1 DAY ORDER BY timestamp ASC;`;

		return useSQL({ sql });
	}

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

	function Content() {
		let { data: log, error } = fetch();

		if (error) {
			return <Page.Error>{error.message}</Page.Error>;
		}

		if (!log) {
			return <Page.Loading>Läser in...</Page.Loading>;
		}

		return (
			<>
				<Page.Title>Logg senaste dygnet</Page.Title>
				<Page.Container>
					<LogTable rows={log} />
				</Page.Container>
			</>
		);
	}

	return (
		<Page id='event-page'>
			<Page.Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
}

export default Component;
