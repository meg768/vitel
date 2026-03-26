
import Page from '../../components/page';
import Link from '../../components/ui/link';
import Markdown from '../../components/ui/markdown';

import { queries } from '../../js/queries';

export default function QnAPage() {
	function Intro() {
		return <div className='pb-2 pt-4 text-lg'>Här är några frågor som kan vara intressanta att ställa till databasen. Det är inte säkert att de ger något vettigt svar...</div>;
	}

	function QueryLink({ name, title = null, description = '-', ...props }) {
		const link = `/query/${name}`;

		return (
			<Link hover={false} to={link} className='mb-3 block rounded-md border p-4 transition-colors hover:bg-primary-50 dark:hover:bg-primary-900' {...props}>
				<div className='text-2xl'>{title}</div>
				<Markdown className='mt-1'>{description}</Markdown>
			</Link>
		);
	}

	function QueryList() {
		return (
			<div>
				{queries.map(query => (
					<QueryLink key={query.id} name={query.name} title={query.title} description={query.description} />
				))}
			</div>
		);
	}

	return (
		<Page id='qna-page'>
			<Page.Menu />
			<Page.Content>
				<Page.Title>Q&A</Page.Title>
				<Page.Container>
					<Intro />
					<QueryList />
				</Page.Container>
			</Page.Content>
		</Page>
	);
}
