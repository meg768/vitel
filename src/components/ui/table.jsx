import React from 'react';
import clsx from 'clsx';
let Table = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = clsx('', className);

	return <table className={className} ref={ref} {...props} />;
});

Table.Body = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = clsx('', className);

	return <tbody className={className} ref={ref} {...props} />;
});

Table.Header = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = clsx('', className);

	return <thead className={className} ref={ref} {...props} />;
});

Table.Row = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = clsx('', className);

	return <tr className={className} ref={ref} {...props} />;
});

Table.Cell = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = clsx('', className);

	return <td className={className} ref={ref} {...props} />;
});

Table.Head = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = clsx('', className);

	return <th className={className} ref={ref} {...props} />;
});

export default Table;
