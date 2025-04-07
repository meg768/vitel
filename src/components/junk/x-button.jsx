import React from 'react';
import classNames from 'classnames';

import './button.scss';

const Button = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = classNames('ui button px-3 py-2 text-white font-semibold rounded-md shadow-xs bg-primary-500 hover:bg-primary-600', className);

	return <button className={className} ref={ref} {...props} ></button>;
});


export default Button;
