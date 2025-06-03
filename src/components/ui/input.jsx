
import React from 'react';
import clsx from 'clsx';
const Input = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = clsx('outline-none', className);

	return <input className={className} ref={ref} {...props} />;
});


export default Input;
