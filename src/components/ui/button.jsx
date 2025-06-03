import React from 'react';
import clsx from 'clsx';import { Link } from 'react-router';

import colors from '../colors';

const Button = React.forwardRef((properties, ref) => {
	let { children, className, link, disabled, ...props } = properties;

	className = clsx(className, [
		'rounded-sm px-3 py-2',
		'bg-primary-700 text-primary-50',
		'hover:bg-primary-600 hover:dark:bg-primary-600'
	]);

	if (disabled) {
		className = clsx('opacity-50', className);
	}

	if (link) {
		return (
			<Link to={link} className=''>
				<button className={className} ref={ref} {...props}>
					{children}
				</button>
			</Link>
		);
	}
	return <button className={className} ref={ref} {...props}>
		{children}
	</button>;
});

export default Button;
