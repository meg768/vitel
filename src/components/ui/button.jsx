import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router';


const Button = React.forwardRef((properties, ref) => {
	let { children, className, link, disabled, ...props } = properties;

	className = clsx(['rounded-sm px-3 py-2', 'bg-primary-700 text-primary-50', 'hover:bg-primary-600 hover:dark:bg-primary-600'], className);

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
	return (
		<button className={className} ref={ref} {...props}>
			{children}
		</button>
	);
});

export default Button;
