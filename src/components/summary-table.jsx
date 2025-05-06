import React from 'react';

import { Table } from '../components/ui';
import classNames from 'classnames';

let Component = ({ children }) => {
	return (
		<div className='overflow-auto'>
			<Table className='w-full border-1 dark:border-primary-700'>
				<Table.Body className={''}>{children}</Table.Body>
			</Table>
		</div>
	);
};

Component.Cell = ({ children, name, value, className, ...props }) => {
	function Label() {
		return <div className={'whitespace-nowrap text-primary-500 dark:text-primary-300 mt-1 text-[80%] px-2'}>{name == undefined ? '-' : name}</div>;
	}

	function Value() {
		return <div className={'whitespace-nowrap px-2 py-1'}>{value == undefined ? '-' : value}</div>;
	}

	className = classNames(className, 'border border-1');

	if (children) {
		return (
			<Table.Cell className={className} {...props}>
				{children}
			</Table.Cell>
		);
	}
	return (
		<Table.Cell className={classNames(className, 'align-top text-left')} {...props}>
			<div className='flex flex-col'>
				<Label />
				<Value />
			</div>
		</Table.Cell>
	);
};

Component.Row = ({ children }) => {
	return <Table.Row>{children}</Table.Row>;
};

export default Component;
