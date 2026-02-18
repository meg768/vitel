import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';

function Component({ className, ...props }) {
	className = clsx('prose max-w-none prose-p:text-inherit prose-li:text-inherit prose-strong:text-inherit prose-headings:text-inherit dark:prose-invert', className);

	return (
		<div className={className}>
			<ReactMarkdown>{props.children}</ReactMarkdown>
		</div>
	);
}

export default Component;
