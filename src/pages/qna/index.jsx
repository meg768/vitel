
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
		const summary = description?.trim() || 'Öppna frågan för att se SQL och resultat.';

		return (
			<Link
				hover={false}
				to={link}
				className='mb-3 block rounded-md border border-primary-300 bg-primary-50 p-4 transition-colors duration-150 hover:bg-primary-100 dark:border-primary-700 dark:bg-primary-900 dark:hover:bg-primary-800'
				{...props}
			>
				<div className='text-2xl'>{title}</div>
				<Markdown className='mt-2 text-sm leading-6 text-primary-700 prose-p:text-primary-700 prose-strong:text-primary-800 prose-li:text-primary-700 prose-li:marker:text-primary-500 dark:text-primary-300 dark:prose-p:text-primary-300 dark:prose-strong:text-primary-100 dark:prose-li:text-primary-300 dark:prose-li:marker:text-primary-400'>
					{summary}
				</Markdown>
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
