import clsx from 'clsx';
function Component({ className, ...props }) {

	className = clsx('p-3', className);
	
	return <div className={className}>{props.children}</div>;
}

export default Component;
