import React from 'react';
import classNames from 'classnames';

//import './button.scss';

const Button = React.forwardRef((properties, ref) => {
	let { className, disabled, ...props } = properties;

	className = classNames('ui button text-white  bg-primary-700 hover:bg-primary-600 dark:bg-primary-800', className);
	className = classNames(className, 'rounded-sm px-3 py-2');

	if (disabled) {
		className = classNames('opacity-50', className);
	}

	return <button className={className} ref={ref} {...props}></button>;
});

export default Button;
