
import clsx from 'clsx';
import { Link } from 'react-router';

function Component({ to, query, hover = true, className, ...props }) {
	className = clsx(className, 'bg-transparent');

	if (hover) {
		className = clsx(className, 'hover:opacity-60');
	}

	if (query) {
		query = JSON.stringify(query);
		query = encodeURIComponent(query);

		to += `?query=${query}`;
	}

	return <Link to={to} className={className} {...props}></Link>;
}

export default Component;
