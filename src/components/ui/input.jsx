
import React from 'react';
import classNames from 'classnames';

const Input = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = classNames('outline-none', className);

	return <input className={className} ref={ref} {...props} />;
});


export default Input;
