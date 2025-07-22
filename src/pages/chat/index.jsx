import { useState, useRef, useEffect } from 'react';
import Page from '../../components/page';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';
import './index.css';

function Component() {
	const storedMessages = localStorage.getItem('chat-history');
	const [messages, setMessages] = useState(storedMessages ? JSON.parse(storedMessages) : [{ role: 'assistant', content: `**Hej!** Jag är Bob – ställ en fråga om tennis!` }]);
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
		e.preventDefault();
		if (!input.trim()) return;

		const userMessage = { role: 'user', content: input.trim() };
		setMessages(prev => [...prev, userMessage].slice(-20)); // 👈 begränsa till 20 inlägg
		setInput('');
		setIsLoading(true);

		try {
			const url = `${import.meta.env.VITE_API_URL}/chat?prompt=${encodeURIComponent(input.trim())}`;
			const res = await fetch(url);
			const data = await res.json();
			const bobMessage = { role: 'assistant', content: data.reply };
			setMessages(prev => [...prev, bobMessage].slice(-20)); // 👈 begränsa här också
		} catch (err) {
			setMessages(prev => [...prev, { role: 'assistant', content: '**Fel:** Kunde inte kontakta Bob.' }].slice(-20));
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
		let className = '';
		className = clsx(
			'prose w-full max-w-none text-primary-800 dark:text-primary-100',
			'prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-table:my-2 prose-th:py-1 prose-td:py-1',
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

	return (
		<Page>
			<Page.Menu />
			<Page.Content>
				<Page.Title>Fråga ATP-assistenten</Page.Title>



				<Page.Container className='flex flex-col h-[calc(100vh-8rem)]'>
					<div className='flex-1 overflow-y-auto divide-y divide-gray-200' aria-live='polite'>
						{messages.map((msg, i) => (
							<div key={i} className='px-2 py-3 w-full whitespace-pre-wrap'>
								<Prose>
									{msg.role === 'user' && <strong>Du: </strong>}
									{msg.role === 'assistant' && <strong>Bob: </strong>}
									<ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
								</Prose>
							</div>
						))}

						{isLoading && (
							<div className='px-2 py-3 w-full whitespace-pre-wrap'>
								<Prose>
									<strong>Bob: </strong>
									<em>skriver</em>
									<TypingDots />
								</Prose>
							</div>
						)}

						<div ref={bottomRef} />
					</div>

					<form onSubmit={handleSubmit} className='p-2 border-t flex gap-2'>
						<textarea
							value={input}
							onChange={e => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder='Skriv något till ATP-assistenten...'
							rows={1}
							className='flex-1 border border-primary-300 rounded p-2 resize-none outline-none'
							disabled={isLoading}
						/>
						<button type='submit' className='bg-primary-500 hover:bg-primary-600 text-white px-4 rounded' disabled={isLoading}>
							{isLoading ? '...' : 'Skicka'}
						</button>
					</form>
				</Page.Container>
			</Page.Content>
		</Page>
	);
}

export default Component;
