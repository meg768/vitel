import React from 'react';

import Link from '../../components/ui/link';
import reportContent from './report.md?raw';

const MISSION_LINES = [
	'Scan the world markets every day for special situations and catalyst trades.',
	'Highlight bigger-than-normal moves across assets and equities globally.',
	'Use the page as an early-warning system for changes in the world.'
];

function parseReport(content) {
	const lines = content.split('\n');
	const title = (lines.find(line => line.startsWith('# ')) ?? '').replace(/^# /, '').trim();
	const sections = [];
	let meta = [];
	let currentSection = null;

	for (const rawLine of lines) {
		const line = rawLine.trimEnd();

		if (line.startsWith('# ')) {
			continue;
		}

		if (line.startsWith('## ')) {
			currentSection = {
				title: line.replace(/^## /, '').trim(),
				lines: []
			};
			sections.push(currentSection);
			continue;
		}

		if (currentSection) {
			currentSection.lines.push(line);
			continue;
		}

		if (line.trim()) {
			meta.push(line.trim());
		}
	}

	meta = meta.filter(Boolean);

	return { title, meta, sections };
}

function splitSectionLines(lines) {
	const blocks = [];
	let currentBlock = null;

	for (const rawLine of lines) {
		const line = rawLine.trim();

		if (!line) {
			currentBlock = null;
			continue;
		}

		const isBullet = line.startsWith('- ');

		if (!currentBlock || currentBlock.type !== (isBullet ? 'bullet' : 'paragraph')) {
			currentBlock = {
				type: isBullet ? 'bullet' : 'paragraph',
				lines: []
			};
			blocks.push(currentBlock);
		}

		currentBlock.lines.push(isBullet ? line.replace(/^- /, '').trim() : line);
	}

	return blocks;
}

function parseSourceEntry(line) {
	const match = line.match(/^(.*?):\s+(https?:\/\/\S+)$/);

	if (!match) {
		return null;
	}

	return {
		label: match[1].trim(),
		url: match[2].trim()
	};
}

function Card({ title, children, className = '' }) {
	return (
		<section className={`border-t border-primary-400 pt-4 dark:border-primary-600 ${className}`.trim()}>
			<div className='font-["Georgia","Times_New_Roman",serif] text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-primary-700 dark:text-primary-300'>
				{title}
			</div>
			<div className='mt-3 space-y-3 font-["Georgia","Times_New_Roman",serif] text-[1.02rem] leading-7 text-primary-900 dark:text-primary-100'>
				{children}
			</div>
		</section>
	);
}

function BulletList({ items }) {
	return (
		<ul className='space-y-3'>
			{items.map(item => (
				<li key={item} className='flex gap-3'>
					<span className='mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-700 dark:bg-primary-300' />
					<span>{item}</span>
				</li>
			))}
		</ul>
	);
}

function Sources({ lines }) {
	const entries = lines
		.map(line => line.trim())
		.filter(Boolean)
		.map(parseSourceEntry)
		.filter(Boolean);

	if (!entries.length) {
		return null;
	}

	return (
		<ul className='space-y-3 text-[0.96rem] leading-7'>
			{entries.map(entry => (
				<li key={entry.url} className='flex gap-3'>
					<span className='mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-700 dark:bg-primary-300' />
					<span>
						{entry.label}:{' '}
						<Link
							to={entry.url}
							target='_blank'
							rel='noreferrer'
							className='text-primary-700 dark:text-primary-300'
						>
							{entry.url}
						</Link>
					</span>
				</li>
			))}
		</ul>
	);
}

function Section({ section }) {
	const blocks = splitSectionLines(section.lines);

	if (section.title === 'Sources') {
		return (
			<Card title={section.title}>
				<Sources lines={section.lines} />
			</Card>
		);
	}

	return (
		<Card title={section.title}>
			{blocks.map((block, index) => {
				if (block.type === 'bullet') {
					return <BulletList key={`${section.title}-${index}`} items={block.lines} />;
				}

				return (
					<div key={`${section.title}-${index}`} className='space-y-3'>
						{block.lines.map(line => (
							<p key={line}>{line}</p>
						))}
					</div>
				);
			})}
		</Card>
	);
}

function Component() {
	const report = parseReport(reportContent);
	const [dateLine, editionLine] = report.meta;

	return (
		<div className='min-h-screen bg-primary-100/40 px-4 py-6 text-primary-900 dark:bg-primary-950 dark:text-primary-100'>
			<div className='space-y-8'>
				<div className='mx-auto max-w-4xl border border-primary-300 bg-primary-50 px-5 py-6 shadow-sm dark:border-primary-700 dark:bg-primary-950 sm:px-8'>
					<header className='border-b-3 border-primary-900 pb-4 dark:border-primary-100'>
						<div className='text-center'>
							<div className='font-["Georgia","Times_New_Roman",serif] text-[0.72rem] uppercase tracking-[0.35em] text-primary-700 dark:text-primary-300'>
								Global Market Change Monitor
							</div>
							<h1 className='mt-3 font-["Georgia","Times_New_Roman",serif] text-4xl font-bold leading-none text-primary-950 dark:text-primary-50 sm:text-5xl'>
								{report.title || 'Market Scanner Daily'}
							</h1>
							<div className='mt-4 border-t border-primary-400 pt-3 text-[0.8rem] uppercase tracking-[0.2em] text-primary-700 dark:border-primary-600 dark:text-primary-300'>
								{dateLine ? <span>{dateLine}</span> : null}
								{dateLine && editionLine ? <span className='mx-3'>•</span> : null}
								{editionLine ? <span>{editionLine}</span> : null}
							</div>
						</div>
					</header>

					<div className='mt-6 space-y-6'>
						<Card title='Mission'>
							<BulletList items={MISSION_LINES} />
						</Card>
						<Card title='Editor&apos;s Note'>
							<p>
								This prototype is intentionally static and local. No live fetch, no runtime dependency on external APIs.
							</p>
						</Card>
					</div>

					<div className='mt-8 space-y-6'>
						{report.sections.map(section => (
							<Section key={section.title} section={section} />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Component;
