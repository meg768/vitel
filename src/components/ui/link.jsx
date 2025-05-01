
import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';


function Component({to, className, ...props}) {

	className = classNames(className, 'hover:text-link-500 bg-transparent');

	return (
		<Link to={to} className={className} {...props}>
		</Link>
	);
}

export default Component;
