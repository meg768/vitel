import { useState } from 'react';
import { Button } from '../../components/ui';
import Page from '../../components/page';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './index.css';

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

	return (
		<div className='mt-4'>
			<div>
				<div className='text-sm text-gray-500'>Din fråga</div>
				<div className='text-lg font-semibold text-primary-800'>{submitted}</div>
			</div>
			<div className='markdown prose max-w-none mt-4 '>
				<Markdown remarkPlugins={[remarkGfm]}>{reply.reply}</Markdown>
			</div>
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
