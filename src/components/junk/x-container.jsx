import classNames from 'classnames';

function Component({ className, ...props }) {

	className = classNames('p-3', className);
	
	return <div className={className}>{props.children}</div>;
}

export default Component;
