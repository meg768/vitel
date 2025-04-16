//import './table.scss';
import React from 'react';
import classNames from 'classnames';

let Table = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = classNames('', className);

	return <table className={className} ref={ref} {...props} />;
});

Table.Body = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = classNames('', className);

	return <tbody className={className} ref={ref} {...props} />;
});

Table.Header = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = classNames('', className);

	return <thead className={className} ref={ref} {...props} />;
});

Table.Row = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = classNames('', className);

	return <tr className={className} ref={ref} {...props} />;
});

Table.Cell = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = classNames('', className);

	return <td className={className} ref={ref} {...props} />;
});

Table.Head = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = classNames('', className);

	return <th className={className} ref={ref} {...props} />;
});

export default Table;
