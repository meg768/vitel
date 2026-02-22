import { useSearchParams, useParams } from 'react-router';
import { useSQL } from '../../js/vitel';
import Page from '../../components/page';
import Table from '../../components/ui/data-table';
import Markdown from '../../components/ui/markdown';
import { queries } from '../../js/queries';

function getMetaData(rows) {
	if (!rows || rows.length === 0) {
		return { columns: [], meta: {} };
	}

	const columns = Object.keys(rows[0]);

	const meta = {};

	for (const col of columns) {
		const values = rows.map(r => r[col]).filter(v => v !== null && v !== undefined && v !== '');
		const isNumber = values.length > 0 && values.every(v => Number.isFinite(typeof v === 'number' ? v : Number(String(v).replace(',', '.'))));
		const isDate = !isNumber && values.length > 0 && values.every(v => !isNaN(Date.parse(v)));

		let type = 'text';
		if (isNumber) type = 'number';
		else if (isDate) type = 'date';

		meta[col] = {
			type,
			align: type === 'number' ? 'right' : 'left',
			isNumeric: type === 'number',
			isDate: type === 'date'
		};
	}

	return { columns, meta };
}

function Component() {
	const { name } = useParams();
	const query = queries.find(item => item.name === name);

	function Title() {
		return <Page.Title className='flex justify-left items-center gap-2'>{query.title || 'Query'}</Page.Title>;
	}

	function Content() {
		let { data, error } = useSQL({ sql: query.sql });

		if (error) {
			return <Page.Error>Misslyckades med att läsa in - {error.message}</Page.Error>;
		}

		if (!data) {
			return <Page.Loading>Läser in data...</Page.Loading>;
		}

		const { columns, meta } = getMetaData(data);

		return (
			<>
				<Title />
				<Page.Container>
					{/* Description */}
					<Markdown className='border p-2 bg-primary-50 dark:bg-primary-900 rounded-md mb-3'>{query.description}</Markdown>
					{/* Table */}
					<Table rows={data} className='striped hover'>
						{columns.map(id => (
							<Table.Column key={id} id={id}>
								<Table.Title className={meta[id].align === 'right' ? 'text-right' : ''}>{id}</Table.Title>

								<Table.Cell className={meta[id].align === 'right' ? 'text-right' : ''}>
									{({ value }) => {
										if (meta[id].isNumeric) {
											return Number(value).toLocaleString('sv-SE');
										}

										if (meta[id].isDate) {
											return new Date(value).toLocaleDateString('sv-SE');
										}

										return value;
									}}
								</Table.Cell>
							</Table.Column>
						))}
					</Table>
				</Page.Container>
			</>
		);
	}

	return (
		<Page id='query-page'>
			<Page.Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
}

export default Component;
