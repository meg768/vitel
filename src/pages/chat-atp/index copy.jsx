import { useState } from 'react';
import { Button } from '../../components/ui';
import Page from '../../components/page';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LocalStorage from '../../js/local-storage';
import clsx from 'clsx';

import './index.css';



function Prose({ children }) {
	let className = '';
	className = clsx(className, 'prose max-w-none mt-4 text-primary-800 dark:text-primary-100');
/*
	className = clsx(className, 'prose-p:text-primary-800 dark:prose-p:text-primary-100');
	className = clsx(className, 'prose-td:text-primary-800 dark:prose-td:text-primary-100');
	className = clsx(className, 'prose-th:text-primary-800 dark:prose-th:text-primary-100');
	className = clsx(className, 'prose-ul:text-primary-800 dark:prose-ul:text-primary-100');
	className = clsx(className, 'prose-li:text-primary-800 dark:prose-li:text-primary-100');
	className = clsx(className, 'prose-ol:text-primary-800 dark:prose-ol:text-primary-100');
	className = clsx(className, 'prose-h1:text-primary-800 dark:prose-h1:text-primary-100');
	className = clsx(className, 'prose-h2:text-primary-800 dark:prose-h2:text-primary-100');
	className = clsx(className, 'prose-h3:text-primary-800 dark:prose-h3:text-primary-100');
*/
	//className = clsx(className, 'prose-blockquote:text-primary-800 dark:prose-blockquote:text-primary-100');
	//className = clsx(className, 'prose-code:text-primary-800 dark:prose-code:text-primary-100');
	//className = clsx(className, 'prose-pre:text-primary-800 dark:prose-pre:text-primary-100');


	return <div className={className}>{children}</div>;
}

function ProseExamples() {
	return (
		<>
			<h1>H1: Rubrik på första nivå</h1>
			<h2>H2: Rubrik på andra nivå</h2>
			<h3>H3: Rubrik på tredje nivå</h3>

			<p>
				Detta är en vanlig paragraf med lite <strong>fet stil</strong>, <em>kursiv stil</em> och en <a href='https://example.com'>länk</a>.
			</p>

			<ul>
				<li>Första punkt</li>
				<li>Andra punkt</li>
				<li>Tredje punkt</li>
			</ul>

			<ol>
				<li>Första steg</li>
				<li>Andra steg</li>
				<li>Tredje steg</li>
			</ol>

			<blockquote>Detta är ett blockcitat. Används ofta för att lyfta fram något klokt.</blockquote>

			<p>
				Detta är lite kod <code>const x = 42;</code> inuti en mening.
			</p>

			<pre>
				<code>{`function hello() {
  console.log("Hej världen!");
}`}</code>
			</pre>

			<table>
				<thead>
					<tr>
						<th>Namn</th>
						<th>Land</th>
						<th>Ranking</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Rafael Nadal</td>
						<td>ESP</td>
						<td>2</td>
					</tr>
					<tr>
						<td>Roger Federer</td>
						<td>SUI</td>
						<td>1</td>
					</tr>
				</tbody>
			</table>
		</>
	);
}

function Input({ question, setQuestion, onSubmit, pending }) {
	return (
		<div className='flex gap-2'>
			<input
				className='border border-primary-300 p-2 w-full outline-none rounded-sm'
				placeholder={`Skriv 'Hjälp' eller formulera en fråga`}
				value={question}
				autoFocus
				disabled={pending}
				onChange={e => setQuestion(e.target.value)}
				onKeyDown={e => e.key === 'Enter' && onSubmit()}
			/>
			<Button disabled={pending} onClick={onSubmit}>
				Fråga
			</Button>
		</div>
	);
}

function Output({ submitted, reply, error }) {
	if (!submitted) return null;
	if (!reply) {
		return <div className='mt-4 text-primary-500'>{error || 'Väntar på svar från assistenten...'}</div>;
	}

	let proseClass = '';

	proseClass = 'prose max-w-none mt-4 ';
	proseClass = clsx(proseClass, 'prose-p:text-primary-200');

	return (
		<div className='mt-4'>
			<div>
				<div className='text-sm text-gray-500'>Din fråga</div>
				<div className='text-lg font-semibold text-primary-800'>{submitted}</div>
			</div>
			<Prose>
				<Markdown remarkPlugins={[remarkGfm]}>{reply.reply}</Markdown>
			</Prose>
		</div>
	);
}

function Content({ question, setQuestion, onSubmit, pending, submitted, reply, error }) {
	return (
		<>
			<Page.Title>Fråga ATP-assistenten</Page.Title>
			<Page.Container>
				<Input question={question} pending={pending} setQuestion={setQuestion} onSubmit={onSubmit} />
				<Output submitted={submitted} reply={reply} error={error} pending={pending} />
				<Prose>
					<ProseExamples />
				</Prose>
			</Page.Container>
		</>
	);
}

function Component() {
	const [question, setQuestion] = useState('');
	const [submitted, setSubmitted] = useState('');
	const [reply, setReply] = useState(null);
	const [pending, setPending] = useState(false);
	const [error, setError] = useState('');

	async function fetchReply(q) {
		try {
			setPending(true);
			let url = `${import.meta.env.VITE_API_URL}/chat`;
			if (q) url += `?prompt=${encodeURIComponent(q)}`;
			console.log('Fetching reply for:', url);
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Fel vid anrop: ${res.status}`);
			const data = await res.json();
			setPending(false);
			setReply(data);
			setQuestion('');
			setError('');
		} catch (err) {
			setPending(false);
			setReply(null);
			setError(err.message);
		}
	}

	function onSubmit() {
		if (!question.trim()) return;
		setReply(null);
		setSubmitted(question);
		fetchReply(question);
	}

	return (
		<Page id='chat-atp-page'>
			<Page.Menu />
			<Page.Content>
				<Content pending={pending} question={question} setQuestion={setQuestion} onSubmit={onSubmit} submitted={submitted} reply={reply} error={error} />
			</Page.Content>
		</Page>
	);
}

export default Component;
