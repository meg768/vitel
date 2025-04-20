
import React from 'react';
import { Tabs as Original } from 'radix-ui';
import classNames from 'classnames';

let Component = {};

Component.Root = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = classNames('ui tabxs   ', className);

	return <Original.Root className={className} ref={ref} {...props}></Original.Root>;
});

Component.Trigger = React.forwardRef((properties, ref) => {
	let { className, children, ...props } = properties;


	let buttonClass = '';

	buttonClass = classNames(buttonClass, 'border-transparent border-b-2');
	buttonClass = classNames(buttonClass, 'dark:data-[state=active]:border-b-primary-500');
	buttonClass = classNames(buttonClass, 'data-[state=active]:border-b-primary-300');
	buttonClass = classNames(buttonClass, '');
	buttonClass = classNames(buttonClass, '');

	let spanClass = '';
	spanClass = classNames(spanClass, 'px-3 m-1 rounded-sm');
	spanClass = classNames(spanClass, 'hover:text-primary-500');

	return (
		<Original.Trigger className={buttonClass} {...props} ref={ref}>
			<div className={spanClass}>{children}</div>
		</Original.Trigger>
	);
});

Component.Content = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = classNames('', className);

	return <Original.Content className={className} ref={ref} {...props}></Original.Content>;
});

Component.List = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = classNames('flex space-x-2 pb-2', className);

	return <Original.List className={className} ref={ref} {...props}></Original.List>;
});

export default Component;
