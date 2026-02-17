import { useSearchParams } from 'react-router';
import Page from '../../components/page';
import { useSQL } from '../../js/vitel';

function Component() {
	const [searchParams] = useSearchParams();

	const params = {};
	params.sql = searchParams.get('sql') || null;
	params.title = searchParams.get('title') || null;
	params.description = searchParams.get('description') || null;

	console.log('Query page received query:', params);

	function Title() {
		return <Page.Title className='flex justify-left items-center gap-2'>{params.title || 'Query'}</Page.Title>;
	}

	function Content() {
		return (
			<>
				<Title />
				<Page.Container>
					<pre className='text-xs bg-black/10 p-2 rounded overflow-auto'>{params.sql}</pre>
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
