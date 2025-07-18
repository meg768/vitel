import { useState } from 'react';
import { Button } from '../../components/ui';
import Page from '../../components/page';
import Markdown from 'react-markdown';

function Component() {
	const [question, setQuestion] = useState('');
	const [submitted, setSubmitted] = useState('');
	const [reply, setReply] = useState(null);
	const [error, setError] = useState('');

	async function fetchReply(q) {
		try {
			let url = `${import.meta.env.VITE_API_URL}/chat`;

			if (q) url += `?prompt=${encodeURIComponent(q)}`;
			console.log('Fetching reply for:', url);
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Fel vid anrop: ${res.status}`);
			const data = await res.json(); // Eller .json() om svaret är JSON
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

	function Input() {
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

	function Output() {
		if (!submitted) return null;
		if (!reply) {
			return (
				<div className='mt-4 text-red-500'>
					{error || 'Inget svar från assistenten.'}
				</div>
			);
		}

/*
		return (
			<div className='mt-4'>
				<div>
					{JSON.stringify(reply, null, 2)	}
				</div>
			</div>
		);
*/
		return (
			<div className='mt-4'>
				<div>
					<Markdown>{reply.reply}</Markdown>
				</div>
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
