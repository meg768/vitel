
import clsx from 'clsx';
import React from 'react';
const Input = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = clsx('outline-none', className);

	return <input className={className} ref={ref} {...props} />;
});


export default Input;
