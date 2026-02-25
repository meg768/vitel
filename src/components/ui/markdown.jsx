import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';

function Component({ className, ...props }) {
	// The `prose` class is from Tailwind CSS Typography plugin, which provides beautiful default styles for markdown content.
	// The `prose-invert` class is used to invert the colors for dark mode.
	// The additional classes ensure that the text color is inherited from the parent element, which allows for better integration with the overall design of the application.
	// Call clsx on multiple lines for better readability
	className = clsx('prose', className);
	className = clsx('max-w-none', className);
	className = clsx('dark:prose-invert', className);
	className = clsx('prose-p:text-inherit', className);
	className = clsx('prose-headings:text-inherit', className);
	className = clsx('prose-strong:text-inherit', className);
	className = clsx('prose-li:text-inherit', className);
	className = clsx('prose-li:marker:text-inherit', className);
	className = clsx('prose-p:my-0', className);
	className = clsx('prose-li:my-0', className);

	return (
		<div className={className}>
			<ReactMarkdown>{props.children}</ReactMarkdown>
		</div>
	);
}

export default Component;
