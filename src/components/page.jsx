import './page.scss';
import classNames from 'classnames';


function Component({ className, ...props }) {
	className = classNames('page   min-w-2xl  dark:bg-primary-950 dark:text-none-300 min-h-full bg-white', className);

	return <div className={className} {...props}/>;
}

Component.Title = function(props) {

	let {className, ...other} = props;

	
	className = classNames('border rounded-sm border-none-300 bg-none-50  p-3', className);
	className = classNames('dark:bg-primary-800 dark:border-primary-600 dark:text-primary-100', className);
	return <h1 className={className} {...other}></h1>
}

Component.Container = function(props) {
	let { className, ...other } = props;
	className = classNames('p-3 px-3 lg:px-15', className);
	
	return (
		<div className={className} {...other}>
			{props.children}
		</div>
	);

}

export default Component;
