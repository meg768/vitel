import React from 'react';

import './dropdown-menu.scss';
import { DropdownMenu as Original } from 'radix-ui';
import classNames from 'classnames';

let Component = {};

Component.Item = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = classNames('ui dropdownmenu item', className);

	return <Original.Item className={className} ref={ref} {...props}></Original.Item>;
});

Component.Content = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = classNames('ui dropdownmenu content ', className);

	return <Original.Content className={className} ref={ref} {...props}></Original.Content>;
});

Component.Arrow = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = classNames('ui dropdownmenu arrow ', className);

	return <Original.Arrow className={className} ref={ref} {...props}></Original.Arrow>;
});

Component.Root = Original.Root;
Component.Trigger = Original.Trigger;
Component.Portal = Original.Portal;

export default Component;
