import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';

function Component({ className, ...props }) {

    className = clsx('prose max-w-none dark:prose-invert', 'prose-p:text-inherit prose-headings:text-inherit prose-strong:text-inherit prose-li:text-inherit prose-li:marker:text-inherit', className);

	return (
		<div className={className}>
			<ReactMarkdown>{props.children}</ReactMarkdown>
		</div>
	);
}

export default Component;
