import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';

import colors from '../colors';

const Button = React.forwardRef((properties, ref) => {
	let { children, className, link, disabled, ...props } = properties;

	className = classNames('text-primary-50  bg-primary-700 hover:bg-primary-600 dark:bg-primary-800', className);
	//className = classNames(className, 'hover:bg-primary-600 hover:dark:bg-primary-800');
	className = classNames(className, 'rounded-sm px-3 py-2');

	if (disabled) {
		className = classNames('opacity-50', className);
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
