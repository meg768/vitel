import ActivityLogIcon from '../../assets/radix-icons/activity-log.svg?react';
import Page from '../../components/page';
import Table from '../../components/ui/data-table';
import { useSQL } from '../../js/vitel';

const LOG_SQL = 'SELECT * FROM log WHERE timestamp >= CURDATE() - INTERVAL 1 DAY ORDER BY timestamp ASC;';

function LogTable({ rows }) {
	return (
		<Table rows={rows}>
			<Table.Column id='timestamp'>
				<Table.Title>Datum/tid</Table.Title>

				<Table.Value>
					{({ row }) => {
						return new Date(row.timestamp).toLocaleString();
					}}
				</Table.Value>

				<Table.Cell className='w-1 whitespace-nowrap'>
					{({ value }) => {
						return value;
					}}
				</Table.Cell>
			</Table.Column>

			<Table.Column id='message'>
				<Table.Title>Meddelande</Table.Title>
			</Table.Column>
		</Table>
	);
}

export default function LogPage() {
	const { data: logRows, error } = useSQL({ sql: LOG_SQL });

	function Content() {
		if (error) {
			return <Page.Error>{error.message}</Page.Error>;
		}

		if (!logRows) {
			return <Page.Loading>Läser in...</Page.Loading>;
		}

		return (
			<>
				<Page.Title className='gap-2'>
					<Page.TitleIcon>
						<ActivityLogIcon className='h-5 w-5 bg-transparent' aria-hidden='true' />
					</Page.TitleIcon>
					<span className='bg-transparent'>Logg senaste dygnet</span>
				</Page.Title>
				<Page.Container>
					<LogTable rows={logRows} />
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
