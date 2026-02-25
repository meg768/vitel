
import Page from '../../components/page';
import Link from '../../components/ui/link';
import Markdown from '../../components/ui/markdown';

import { queries } from '../../js/queries';


let Component = () => {
	function Content() {
		return (
			<Page.Content>
				<Page.Title>Q&A</Page.Title>
				<Page.Container>
					<Title />
					<Queries />
				</Page.Container>
			</Page.Content>
		);
	}

	function Title() {
		return <div className='text-lg pt-4 pb-2'>Här är några frågor som kan vara intressanta att ställa till databasen. Det är inte säkert att de ger något vettigt svar...</div>;
	}

	function Queries() {
		return (
			<div>
				{queries.map(q => (
					 <Query key={q.id} name={q.name} title={q.title} description={q.description} sql={q.sql} />
				))}
			</div>
		);
	}

	function Query({ sql, name, title = null, description = '-', ...props }) {
		const link = `/query/${name}`;

		return (
			<Link hover={false} to={link} className='block border p-4 rounded-md mb-3 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors' {...props}>
				{/* Header */}
				<div className='text-2xl'>{title}</div>
				{/* Description */}
				<Markdown className='mt-1'>{description}</Markdown>
			</Link>
		);
	}
	return (
		<>
			<Page id='qna-page'>
				<Page.Menu />
				<Content />
			</Page>
		</>
	);
};

export default Component;
