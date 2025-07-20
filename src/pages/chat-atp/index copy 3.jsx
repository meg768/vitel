import { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui';
import Page from '../../components/page';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';

function Prose({ children }) {
	let className = '';
	className = clsx(className, 'prose max-w-none mt-4 text-primary-800 dark:text-primary-100');

	className = clsx(className, 'prose-p:text-primary-800 dark:prose-p:text-primary-100');
	className = clsx(className, 'prose-td:text-primary-800 dark:prose-td:text-primary-100');
	className = clsx(className, 'prose-th:text-primary-800 dark:prose-th:text-primary-100');
	className = clsx(className, 'prose-ul:text-primary-800 dark:prose-ul:text-primary-100');
	className = clsx(className, 'prose-li:text-primary-800 dark:prose-li:text-primary-100');
	className = clsx(className, 'prose-ol:text-primary-800 dark:prose-ol:text-primary-100');
	className = clsx(className, 'prose-h1:text-primary-800 dark:prose-h1:text-primary-100');
	className = clsx(className, 'prose-h2:text-primary-800 dark:prose-h2:text-primary-100');
	className = clsx(className, 'prose-h3:text-primary-800 dark:prose-h3:text-primary-100');

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

function Component() {
	const [question, setQuestion] = useState('');
	const [pending, setPending] = useState(false);
	const [error, setError] = useState('');
	const [chat, setChat] = useState(null);
	const [chatHistory, setChatHistory] = useState([]);

	const bottomElement = useRef(null);

	useEffect(() => {
		try {
			const stored = JSON.parse(localStorage.getItem('chatHistory'));
			if (Array.isArray(stored)) setChatHistory(stored);
		} catch (err) {
			setChatHistory([]);
		}
	}, []);

	useEffect(() => {
		if (bottomElement.current) {
			bottomElement.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [chatHistory]);


	function Input() {
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

function Output() {
	if (pending) {
		return <div className='mt-4'>{error || 'Väntar på svar från assistenten...'}</div>;
	}

	if (!chatHistory.length) return null;

	return (
		<div className='mt-4 space-y-6'>
			{chatHistory.map((entry, index) => (
				<div key={index}>
					<div className='text-sm text-gray-500'>Fråga:</div>
					<div className='text-lg font-semibold text-primary-800'>{entry.prompt}</div>
					<Prose>
						<Markdown remarkPlugins={[remarkGfm]}>{entry.reply}</Markdown>
					</Prose>
				</div>
			))}
			<div ref={bottomElement} />
		</div>
	);
}

	function Content() {
		return (
			<>
				<Page.Title>Fråga ATP-assistenten</Page.Title>
				<Page.Container>
					<Output />
					<Input />
				</Page.Container>
			</>
		);
	}

async function fetchReply(q) {
	try {
		setPending(true);
		const url = `${import.meta.env.VITE_API_URL}/chat?prompt=${encodeURIComponent(q)}`;
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Fel vid anrop: ${res.status}`);
		const data = await res.json();

		const newEntry = { prompt: q, reply: data.reply };
		let updated = [...chatHistory, newEntry];

		setChatHistory(updated);
		localStorage.setItem('chatHistory', JSON.stringify(updated));
		setQuestion('');
		setError('');
	} catch (err) {
		setError(err.message);
	} finally {
		setPending(false);
	}
}

	function onSubmit() {
		if (!question.trim()) return;
		fetchReply(question);
	}

	return (
		<Page id='chat-atp-page'>
			<Page.Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
}

export default Component;
