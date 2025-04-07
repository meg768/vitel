import './table.scss';
import React from 'react';
import classNames from 'classnames';

const Table = React.forwardRef((properties, ref) => {
	let { className, ...props } = properties;

	className = classNames('ui table ', className);

	return <table className={className} ref={ref} {...props} />;
});

export default Table;
