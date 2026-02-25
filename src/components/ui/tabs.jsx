
import * as Original  from '@radix-ui/react-tabs';
import clsx from 'clsx';
import React from 'react';
let Component = {};

Component.Root = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = clsx('ui ', className);

	return <Original.Root className={className} ref={ref} {...props}></Original.Root>;
});

Component.Trigger = React.forwardRef((properties, ref) => {
	let { className, children, ...props } = properties;


	let buttonClass = '';

	buttonClass = clsx(buttonClass, 'border-transparent border-b-2');
	buttonClass = clsx(buttonClass, 'dark:data-[state=active]:border-b-primary-500');
	buttonClass = clsx(buttonClass, 'data-[state=active]:border-b-primary-300');

	let spanClass = '';
	spanClass = clsx(spanClass, 'px-3 m-1 rounded-sm');
	spanClass = clsx(spanClass, 'hover:text-primary-500');

	return (
		<Original.Trigger className={buttonClass} {...props} ref={ref}>
			<div className={spanClass}>{children}</div>
		</Original.Trigger>
	);
});

Component.Content = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = clsx('', className);

	return <Original.Content className={className} ref={ref} {...props}></Original.Content>;
});

Component.List = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = clsx('flex space-x-2 pb-2', className);

	return <Original.List className={className} ref={ref} {...props}></Original.List>;
});

export default Component;
