import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router';


const Button = React.forwardRef((properties, ref) => {
	let { children, className, link, disabled, ...props } = properties;

	className = clsx([
		'rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider',
		'transition-colors duration-150',
		'border-primary-500 bg-primary-700 text-primary-50',
		'hover:border-primary-300 hover:bg-primary-600',
		'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400',
		'dark:border-primary-500 dark:bg-primary-700 dark:hover:border-primary-300 dark:hover:bg-primary-600'
	], className);

	if (disabled) {
		className = clsx('cursor-not-allowed opacity-50', className);
	}

	if (link) {
		return (
			<Link to={link} className=''>
				<button className={className} ref={ref} disabled={disabled} {...props}>
					{children}
				</button>
			</Link>
		);
	}
	return (
		<button className={className} ref={ref} disabled={disabled} {...props}>
			{children}
		</button>
	);
});

export default Button;
