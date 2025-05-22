import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';

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

	className = classNames(className, 'bg-transparent');

	if (hover) {
		className = classNames(className, 'hover:text-link-500');
	}

	if (query) {
		query = JSON.stringify(query);
		query = encodeURIComponent(query);

		to += `?query=${query}`;
	}

	return <Link to={to} className={className} {...props}></Link>;
}

export default Component;
