// src/pages/ask-bob/index.jsx
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Page from '../../components/page';

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

function TypingDots() {
	return (
		<span className='inline-flex items-center gap-1 align-middle'>
			<em>Bob skriver</em>
			<span className='dot-wave'>
				<span></span>
				<span></span>
				<span></span>
			</span>
		</span>
	);
}

// --- Enkel cache i localStorage ---
const CACHE_PREFIX = 'bob-reply:';
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 min

function readCache(prompt) {
	try {
		const raw = localStorage.getItem(CACHE_PREFIX + prompt);
		if (!raw) return null;
		const { reply, ts } = JSON.parse(raw);
		if (!reply || !ts) return null;
		if (Date.now() - ts > CACHE_TTL_MS) return null;
		return reply;
	} catch {
		return null;
	}
}

function writeCache(prompt, reply) {
	try {
		localStorage.setItem(CACHE_PREFIX + prompt, JSON.stringify({ reply, ts: Date.now() }));
	} catch {}
}

export default function AskBobPage() {
	const [sp] = useSearchParams();
	const prompt = sp.get('prompt') || sp.get('query') || '';
	const [reply, setReply] = useState('');
	const [status, setStatus] = useState('idle'); // idle | loading | done | error
	const [error, setError] = useState(null);

	const fetchReply = useCallback(
		async (opts = { ignoreCache: false }) => {
			if (!prompt) return;

			if (!opts.ignoreCache) {
				const cached = readCache(prompt);
				if (cached) {
					setReply(cached);
					setStatus('done');
					return;
				}
			}

			setStatus('loading');
			setError(null);

			try {
				const url = `${import.meta.env.VITE_API_URL}/chat?prompt=${encodeURIComponent(prompt)}`;
				const res = await fetch(url);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const data = await res.json();
				const text = data.reply || '';

				setReply(text);
				setStatus('done');
				writeCache(prompt, text);
			} catch (e) {
				setError(e instanceof Error ? e.message : 'Okänt fel');
				setStatus('error');
			}
		},
		[prompt]
	);

	useEffect(() => {
		if (!prompt) return;
		fetchReply({ ignoreCache: false });
	}, [prompt, fetchReply]);

	return (
		<Page>
			<Page.Menu />
			<Page.Content>
				<Page.Title>Fråga Bob</Page.Title>
				<Page.Container>
					{!prompt && (
						<p>
							Ange en prompt i URL:en, t.ex. <code>#/ask-bob?prompt=Federer%20vs%20Nadal</code>
						</p>
					)}

					{prompt && (
						<>
							<p>
								<h2 className='mt-4 mb-2 text-lg font-semibold'>Fråga</h2>
								{prompt}
							</p>

							{status === 'loading' && (
								<div className='mt-3'>
									<TypingDots />
								</div>
							)}

							{status === 'error' && (
								<p className='mt-3'>
									<strong>Fel:</strong> Kunde inte hämta svar ({error}).
								</p>
							)}

							{status === 'done' && (
								<>
									<h2 className='mt-4 mb-2 text-lg font-semibold'>Svar</h2>
									<Prose>
										<ReactMarkdown remarkPlugins={[remarkGfm]}>{reply || ''}</ReactMarkdown>
									</Prose>
								</>
							)}
						</>
					)}
				</Page.Container>
			</Page.Content>
		</Page>
	);
}
