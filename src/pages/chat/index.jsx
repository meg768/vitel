import { useState, useRef, useEffect } from 'react';
import Page from '../../components/page';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';
import TextareaAutosize from 'react-textarea-autosize';
import './index.css';

function TypingDots() {
	return (
		<span className='dot-wave'>
			<span></span>
			<span></span>
			<span></span>
		</span>
	);
}

function Prose({ children }) {
	const className = clsx(
		'prose w-full max-w-none text-primary-800 dark:text-primary-100',
		'dark:prose-invert',
		'prose-p:my-1 prose-ul:my-2 prose-li:my-0 prose-table:my-4 prose-th:py-1 prose-td:py-1',
		'dark:prose-th:border-gray-800',
		'dark:prose-td:border-gray-800',
		'dark:prose-table:border-gray-800',
		'dark:prose-hr:border-gray-800'
	);
	return <div className={className}>{children}</div>;
}

function UserPrompt({ value, onChange, onSubmit, onArrowUp, onArrowDown, disabled }) {
	function onKeyDown(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			onSubmit(event);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			onArrowUp();
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			onArrowDown();
		}
	}

	const textAreaClassName = clsx(
		'resize-none rounded-md border-1 w-full px-4 py-4 my-2 shadow-sm outline-none opacity-95',
		'bg-primary-50 border-primary-200',
		'dark:bg-primary-900 dark:border-primary-700'
	);

	return (
		<div className='sticky bottom-4 z-10 px-1 py-4 bg-transparent'>
			<TextareaAutosize
				placeholder='Ställ en fråga till Bob'
				className={textAreaClassName}
				value={value}
				onChange={onChange}
				onKeyDown={onKeyDown}
				disabled={disabled}
				minRows={1}
				maxRows={3}
			/>
		</div>
	);
}

function Component() {
	const CHAT_HISTORY_KEY = 'chat-history';
	const QUESTION_HISTORY_KEY = 'chat-history-questions';
	const MAX_HISTORY_ENTRIES = 50;
	const MAX_CHAT_CHARACTERS = 8000; // Begränsa mängden sparad text

	const storedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
	const [messages, setMessages] = useState(
		storedMessages ? JSON.parse(storedMessages) : [{ role: 'assistant', content: `**Hej!** Jag är Bob – ställ en fråga om tennis! Be om hjälp om du vill.` }]
	);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [historyIndex, setHistoryIndex] = useState(null);
	const bottomRef = useRef(null);

	useEffect(() => {
		localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
	}, [messages]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, isLoading]);

	function trimMessagesToCharLimit(messages, limit) {
		let totalChars = 0;
		const result = [];

		for (let i = messages.length - 1; i >= 0; i--) {
			const msg = messages[i];
			const contentLength = msg.content.length;

			if (totalChars + contentLength <= limit) {
				result.unshift(msg);
				totalChars += contentLength;
			} else {
				break;
			}
		}
		return result;
	}

	function getStoredQuestionHistory() {
		const stored = localStorage.getItem(QUESTION_HISTORY_KEY);
		return stored ? JSON.parse(stored) : [];
	}

	function saveToQuestionHistory(newQuestion) {
		let history = getStoredQuestionHistory();
		if (history[history.length - 1] !== newQuestion) {
			history.push(newQuestion);
			if (history.length > MAX_HISTORY_ENTRIES) {
				history = history.slice(-MAX_HISTORY_ENTRIES);
			}
			localStorage.setItem(QUESTION_HISTORY_KEY, JSON.stringify(history));
		}
	}

	function getUserHistory() {
		return getStoredQuestionHistory();
	}

	function onArrowUp() {
		const history = getUserHistory();
		if (history.length === 0) return;

		setHistoryIndex(prev => {
			let newIndex = prev === null ? history.length - 1 : Math.max(prev - 1, 0);
			setInput(history[newIndex]);
			return newIndex;
		});
	}

	function onArrowDown() {
		const history = getUserHistory();
		if (history.length === 0) return;

		setHistoryIndex(prev => {
			if (prev === null) return null;
			let newIndex = prev + 1;
			if (newIndex >= history.length) {
				setInput('');
				return null;
			}
			setInput(history[newIndex]);
			return newIndex;
		});
	}

	async function onSubmit(e) {
		e.preventDefault();
		if (!input.trim()) return;

		const userMessage = { role: 'user', content: input.trim() };
		saveToQuestionHistory(userMessage.content);
		setMessages(prev => {
			const updated = [...prev, userMessage];
			return trimMessagesToCharLimit(updated, MAX_CHAT_CHARACTERS);
		});
		setHistoryIndex(null);
		setInput('');
		setIsLoading(true);

		try {
			const url = `${import.meta.env.VITE_API_URL}/chat?prompt=${encodeURIComponent(userMessage.content)}`;
			const res = await fetch(url);
			const data = await res.json();
			const bobMessage = { role: 'assistant', content: data.reply };
			setMessages(prev => {
				const updated = [...prev, bobMessage];
				return trimMessagesToCharLimit(updated, MAX_CHAT_CHARACTERS);
			});
		} catch (err) {
			setMessages(prev => {
				const updated = [...prev, { role: 'assistant', content: '**Fel:** Kunde inte kontakta Bob.' }];
				return trimMessagesToCharLimit(updated, MAX_CHAT_CHARACTERS);
			});
		} finally {
			setIsLoading(false);
		}
	}

	function Conversation() {
		function Messages() {
			return messages.map((msg, i) => {
				if (msg.role === 'user') {
					return (
						<div key={i} className='flex justify-end px-2 py-2'>
							<div className='relative border-1 bg-primary-50 dark:bg-primary-900 text-primary-900 dark:text-primary-50 border-primary-200 dark:border-primary-700 px-3 py-3 rounded-md  max-w-[75%]'>
								<ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
							</div>
						</div>
					);
				} else {
					return (
						<div key={i} className='px-2 py-2 w-full'>
							<Prose>
								<ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
							</Prose>
						</div>
					);
				}
			});
		}

		function Replying() {
			if (!isLoading) return null;
			return (
				<div className='px-2 py-2 w-full'>
					<Prose>
						<em>{'Bob skriver '}</em>
						<TypingDots />
					</Prose>
				</div>
			);
		}

		return (
			<div className='flex-1 overflow-y-auto px-1'>
				<div className='' aria-live='polite'>
					<Messages />
					<Replying />
					<div ref={bottomRef} />
				</div>
			</div>
		);
	}

	function onUserPromptChange(event) {
		setHistoryIndex(null);
		setInput(event.target.value);
	}

	return (
		<Page>
			<Page.Menu />
			<Page.Content className='xpy-0!'>
				<Page.Title>Fråga ATP-assistenten</Page.Title>
				<div className='flex flex-col'>
					<Conversation />
					<UserPrompt value={input} onChange={onUserPromptChange} onSubmit={onSubmit} onArrowUp={onArrowUp} onArrowDown={onArrowDown} disabled={isLoading} />
				</div>
			</Page.Content>
		</Page>
	);
}

export default Component;
