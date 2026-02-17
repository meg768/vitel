import React from 'react';
import Page from '../../components/page';
import Link from '../../components/ui/link';
import ReactMarkdown from 'react-markdown';

const sqlFiles = import.meta.glob('./queries/*.sql', {
	query: '?raw',
	import: 'default',
	eager: true
});

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

	function parseQueryFile(raw, filename) {
		const text = raw ?? '';

		// Hitta första /* ... */-blocket (multiline)
		const commentMatch = text.match(/\/\*([\s\S]*?)\*\//);

		let title = null;
		let description = null;

		if (commentMatch) {
			const comment = commentMatch[1];

			// Plocka @title och @description som sektioner tills nästa @... eller slut
			const titleMatch = comment.match(/@title\s*([\s\S]*?)(?=@\w+|\s*$)/i);
			const descMatch = comment.match(/@description\s*([\s\S]*?)(?=@\w+|\s*$)/i);

			title = titleMatch ? titleMatch[1].trim() : null;
			description = descMatch ? descMatch[1].trim() : null;
		}

		// SQL = ta bort första kommentaren (om finns), trimma
		const sql = commentMatch ? text.replace(commentMatch[0], '').trim() : text.trim();

		// Fallbacks
		const fallbackTitle = filename.replace(/\.sql$/i, '').replace(/[-_]/g, ' ');
		return {
			title: title && title.length ? title : fallbackTitle,
			description: description && description.length ? description : `SQL från filen ${filename}`,
			sql
		};
	}

	function Queries() {
		const queries = Object.entries(sqlFiles)
			.map(([path, raw]) => {
				const filename = path.split('/').pop();
				const parsed = parseQueryFile(raw, filename);

				return {
					id: path,
					title: parsed.title,
					sql: parsed.sql,
					description: parsed.description
				};
			})
			.sort((a, b) => a.title.localeCompare(b.title, 'sv'));

		return (
			<div>
				{queries.map(q => (
					<Query key={q.id} title={q.title} description={q.description} sql={q.sql} />
				))}
			</div>
		);
	}
	function Query({ sql, title = null, description = '-', ...props }) {
		return (
			<div className='border-1 p-3 mt-3 mb-3 rounded-md '>
				<div>
					<div className='font-semibold'>{title}</div>
					<div className='my-2 prose prose-sm max-w-none prose-p:text-inherit prose-li:text-inherit prose-strong:text-inherit prose-headings:text-inherit dark:prose-invert'>
						<ReactMarkdown>{description}</ReactMarkdown>
					</div>{' '}
					<pre className='text-xs bg-black/10 p-2 rounded overflow-auto'>{sql}</pre>
				</div>
			</div>
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
