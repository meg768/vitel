
import React from 'react';
import classNames from 'classnames';

const Input = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = classNames('ui input p-1 border-neutral-300 border-2 outline-none rounded-sm', className);

	return <input className={className} ref={ref} {...props} />;
});


export default Input;
