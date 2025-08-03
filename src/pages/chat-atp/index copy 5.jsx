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

	return <div className={className}>{children}</div>;
}

function Component() {
	const [question, setQuestion] = useState('');
	const [pending, setPending] = useState(false);
	const [error, setError] = useState('');
	const [chat, setChat] = useState(null);
	const bottomRef = useRef(null);

	useEffect(() => {
		try {
			const json = localStorage.getItem('chat');
			if (json) setChat(JSON.parse(json));
		} catch {
			setChat(null);
		}
	}, []);
/*
	useEffect(() => {
		if ((chat || pending) && bottomRef.current) {
			bottomRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [chat, pending]);
*/
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
			return (
				<div className='mt-4 text-primary-500 flex items-center gap-2'>
					<span>Assistenten skriver...</span>
					<div className='flex space-x-1'>
						<span className='w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:-300ms] scale-125' />
						<span className='w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:-150ms] scale-125' />
						<span className='w-2 h-2 bg-primary-500 rounded-full animate-bounce scale-125' />
					</div>
					<div ref={bottomRef} />
				</div>
			);
		}

		if (!chat) return null;

		return (
			<div className='mt-4'>
				<div className='text-sm text-gray-500'>Fråga:</div>
				<div className='text-lg font-semibold text-primary-800'>{chat.prompt}</div>
				<Prose>
					<Markdown remarkPlugins={[remarkGfm]}>{chat.reply}</Markdown>
				</Prose>
				<div ref={bottomRef} />
			</div>
		);
	}

	function Content() {
		return (
			<>
				<Page.Title>Fråga ATP-assistenten</Page.Title>
				<Page.Container>
					<Input />
					<Output />
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
			const chatState = { prompt: q, reply: data.reply };
			setChat(chatState);
			localStorage.setItem('chat', JSON.stringify(chatState));
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
