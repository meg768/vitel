import './tabs.scss';

import React from 'react';
import { Tabs as Original } from 'radix-ui';
import classNames from 'classnames';

let Component = {};

Component.Root = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = classNames('ui tabs', className);

	return <Original.Root className={className} ref={ref} {...props}></Original.Root>;
});

Component.Trigger = React.forwardRef((properties, ref) => {
	let { className, children, ...props } = properties;

	className = classNames('', className);

	return (
		<Original.Trigger className={className} {...props} ref={ref}>
			<span>{children}</span>
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

	className = classNames('', className);

	return <Original.List className={className} ref={ref} {...props}></Original.List>;
});

export default Component;
