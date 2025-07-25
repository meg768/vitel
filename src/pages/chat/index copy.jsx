import { useState, useRef, useEffect } from 'react';
import Page from '../../components/page';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';
import './index.css';

function Component() {
	const storedMessages = localStorage.getItem('chat-history');
	const [messages, setMessages] = useState(
		storedMessages ? JSON.parse(storedMessages) : [{ role: 'assistant', content: `**Hej!** Jag är Bob – ställ en fråga om tennis! Be om hjälp om du vill.` }]
	);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const bottomRef = useRef(null);

	useEffect(() => {
		localStorage.setItem('chat-history', JSON.stringify(messages));
	}, [messages]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, isLoading]);

	async function handleSubmit(e) {

		const maxMessages = 8;
		e.preventDefault();
		if (!input.trim()) return;

		const userMessage = { role: 'user', content: input.trim() };
		setMessages(prev => [...prev, userMessage].slice(-maxMessages));
		setInput('');
		setIsLoading(true);

		try {
			const url = `${import.meta.env.VITE_API_URL}/chat?prompt=${encodeURIComponent(input.trim())}`;
			const res = await fetch(url);
			const data = await res.json();
			const bobMessage = { role: 'assistant', content: data.reply };
			setMessages(prev => [...prev, bobMessage].slice(-maxMessages));
		} catch (err) {
			setMessages(prev => [...prev, { role: 'assistant', content: '**Fel:** Kunde inte kontakta Bob.' }].slice(-maxMessages));
		} finally {
			setIsLoading(false);
		}
	}

	function handleKeyDown(e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	}

	function Prose({ children }) {
		let className = clsx(
			'prose w-full max-w-none text-primary-800 dark:text-primary-100',
			'prose-p:my-1 prose-ul:my-2 prose-li:my-0 prose-table:my-4 prose-th:py-1 prose-td:py-1',
			'dark:prose-p:text-primary-100',
			'dark:prose-li:text-primary-100',
			'dark:prose-th:text-primary-100',
			'dark:prose-td:text-primary-100'
		);
		return <div className={className}>{children}</div>;
	}

	function TypingDots() {
		return (
			<span className='dot-wave'>
				<span></span>
				<span></span>
				<span></span>
			</span>
		);
	}

	function Conversation() {
		return (
			<div className='divide-y divide-primary-200' aria-live='polite'>
				{messages.map((msg, i) => (
					<div key={i} className='px-2 py-2 w-full Xwhitespace-pre-wrap'>
						<Prose>
							{msg.role === 'user' && <strong>Du: </strong>}
							{msg.role === 'assistant' && <strong>Bob: </strong>}
							<ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
						</Prose>
					</div>
				))}

				{isLoading && (
					<div className='px-2 py-2 w-full Xwhitespace-pre-wrap'>
						<Prose>
							<em>{'Bob skriver '}</em>
							<TypingDots />
						</Prose>
					</div>
				)}

				<div ref={bottomRef} />
			</div>
		);
	}


	return (
		<Page>
			<Page.Menu />
			<Page.Content className='xpy-0!'>
				<Page.Title>Fråga ATP-assistenten</Page.Title>

				<div className='flex flex-col'>
					<div className='flex-1 overflow-y-auto px-1'>
						<Conversation />
					</div>

					<form onSubmit={handleSubmit} className='sticky bottom-4  bg-transparent flex xgap-20 xpy-0  z-10 '>
						<textarea
							value={input}
							onChange={e => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder='Skriv något till ATP-assistenten...'
							rows={2}
							className='flex-1 border  border-primary-300 bg-white rounded-xl p-3 XXXmx-10 my-5 resize-none outline-none'
							disabled={isLoading}
						/>
					</form>
				</div>
			</Page.Content>
		</Page>
	);
}

export default Component;
