import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';


const Button = React.forwardRef((properties, ref) => {
	let { children, className, link, disabled, ...props } = properties;

	className = classNames('ui button text-primary-100  bg-primary-700 hover:bg-primary-600 dark:bg-primary-800', className);
	className = classNames(className, 'rounded-sm px-3 py-2');

	if (disabled) {
		className = classNames('opacity-50', className);
	}

	if (link) {
		return (
			<button className={className} ref={ref} {...props}>
				<Link to={link} className=''>
					{children}
				</Link>
			</button>
		);
	}
	return <button className={className} ref={ref} {...props}>
		{children}
	</button>;
});

export default Button;
