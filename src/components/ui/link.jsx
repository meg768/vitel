import React from 'react';
import clsx from 'clsx';import { Link } from 'react-router';

function Query({ sql, format = null, title = null, ...props }) {
	let query = { sql, format, title };
	query = JSON.stringify(query);
	query = encodeURIComponent(query);

	let url = `/players?query=${query}`;

	return (
		<div className='text-[100%] py-1'>
			<Link to={url} {...props}>
				{title}
			</Link>
		</div>
	);
}

function Component({ to, query, hover = true, className, ...props }) {

	className = clsx(className, 'bg-transparent');

	if (hover) {
		className = clsx(className, 'hover:text-primary-600 hover:dark:text-primary-400');
	}

	if (query) {
		query = JSON.stringify(query);
		query = encodeURIComponent(query);

		to += `?query=${query}`;
	}

	return <Link to={to} className={className} {...props}></Link>;
}

export default Component;
