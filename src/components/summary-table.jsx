

import clsx from 'clsx';

import Table from './ui/table';
let Component = ({ children }) => {
	return (
		<div className='summary-table-frame overflow-hidden rounded-lg border border-primary-300 dark:border-primary-700'>
			<div className='overflow-auto'>
				<Table className='w-full border-collapse'>
					<Table.Body className={''}>{children}</Table.Body>
				</Table>
			</div>
		</div>
	);
};

Component.Cell = ({ children, name, value, className, ...props }) => {
	function Label() {
		return <div className={'opacity-75 whitespace-nowrap font-semibold uppercase tracking-wide text-xxs  text-primary-800 dark:text-primary-200 mt-1 px-2'}>{name == undefined ? '-' : name}</div>;
	}

	function Value() {
		return <div className={'whitespace-nowrap px-2 py-1'}>{value == undefined ? '-' : value}</div>;
	}

	className = clsx(className, 'border-r border-b border-primary-300 dark:border-primary-700');

	if (children) {
		return (
			<Table.Cell className={className} {...props}>
				{children}
			</Table.Cell>
		);
	}
	return (
		<Table.Cell className={clsx(className, 'align-top text-left')} {...props}>
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
