
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

	buttonClass = clsx(buttonClass, 'rounded-full  transition-colors');
	buttonClass = clsx(buttonClass, 'data-[state=active]:bg-primary-700 data-[state=active]:text-primary-50');
	buttonClass = clsx(buttonClass, 'dark:data-[state=active]:bg-primary-600');

	let spanClass = '';
	spanClass = clsx(spanClass, 'px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide');
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

	className = clsx('flex w-fit gap-1 rounded-full border border-primary-300 bg-primary-100 p-1 mb-2 dark:border-primary-600 dark:bg-primary-900', className);

	return <Original.List className={className} ref={ref} {...props}></Original.List>;
});

export default Component;
