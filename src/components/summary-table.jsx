import React from 'react';

import {Table}  from '../components/ui';
import classNames from 'classnames';

let Component = ({ children }) => {
	return (
		<Table className='w-full border-1 dark:border-primary-900'>
			<Table.Body className={''} >{children}</Table.Body>
		</Table>
	);
};

Component.Cell = ({ children, name, value, className, ...props }) => {
	function Label() {
		if (name) {
			return <label className={'opacity-[50%] text-[80%] px-2'}>{name}</label>;
		}
	}

	function Value() {
		if (value) {
			return <p className={' px-2 py-1'}>{value}</p>;
		}
	}

	className = classNames(className, 'border border-1');

	return (
		<Table.Cell  className={className} {...props}>
			<Label />
			<Value />
			{children}
		</Table.Cell>
	);
};

Component.Row = ({ children }) => {
	return <Table.Row>{children}</Table.Row>;
};

export default Component;
