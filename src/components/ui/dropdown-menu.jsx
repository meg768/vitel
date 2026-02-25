import clsx from 'clsx';
import { DropdownMenu as Original } from 'radix-ui';
import React from 'react';

import './dropdown-menu.scss';
let Component = {};

Component.Item = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = clsx('ui dropdownmenu item', className);

	return <Original.Item className={className} ref={ref} {...props}></Original.Item>;
});

Component.Content = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = clsx('ui dropdownmenu content ', className);

	return <Original.Content className={className} ref={ref} {...props}></Original.Content>;
});

Component.Arrow = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = clsx('ui dropdownmenu arrow ', className);

	return <Original.Arrow className={className} ref={ref} {...props}></Original.Arrow>;
});

Component.Root = Original.Root;
Component.Trigger = Original.Trigger;
Component.Portal = Original.Portal;

export default Component;
