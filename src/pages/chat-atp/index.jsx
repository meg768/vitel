import { useState } from 'react';
import { Button } from '../../components/ui';
import Page from '../../components/page';
import Markdown from 'react-markdown';

function Input({ question, setQuestion, onSubmit }) {
	return (
		<div className='flex gap-2'>
			<input
				className='border border-primary-300 p-2 w-full outline-none rounded-sm'
				placeholder='Hur många Grand Slam-titlar har Federer?'
				value={question}
				autoFocus
				onChange={e => setQuestion(e.target.value)}
				onKeyDown={e => e.key === 'Enter' && onSubmit()}
			/>
			<Button onClick={onSubmit}>Fråga</Button>
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
			<Markdown>{reply.reply}</Markdown>
		</div>
	);
}

function Content({ question, setQuestion, onSubmit, submitted, reply, error }) {
	return (
		<>
			<Page.Title>Fråga ATP-assistenten</Page.Title>
			<Page.Container>
				<Input question={question} setQuestion={setQuestion} onSubmit={onSubmit} />
				<Output submitted={submitted} reply={reply} error={error} />
			</Page.Container>
		</>
	);
}

function Component() {
	const [question, setQuestion] = useState('');
	const [submitted, setSubmitted] = useState('');
	const [reply, setReply] = useState(null);
	const [error, setError] = useState('');

	async function fetchReply(q) {
		try {
			q = `Q: ${q}`;
			let url = `${import.meta.env.VITE_API_URL}/chat`;
			if (q) url += `?prompt=${encodeURIComponent(q)}`;
			console.log('Fetching reply for:', url);
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Fel vid anrop: ${res.status}`);
			const data = await res.json();
			setReply(data);
			setError('');
		} catch (err) {
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
				<Content question={question} setQuestion={setQuestion} onSubmit={onSubmit} submitted={submitted} reply={reply} error={error} />
			</Page.Content>
		</Page>
	);
}

export default Component;
