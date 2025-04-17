import './page.scss';
import classNames from 'classnames';

function Component({ className, ...props }) {
	className = classNames('page dasrk min-w-2xl min-h-full', className);
	className = classNames('bg-white text-primary-900 border-black/10', className);
	className = classNames('dark:bg-primary-950	 dark:text-none-300 dark:border-white/30', className);

	return <div className={className} {...props} />;
}


Component.Title = function(props) {

	let {className, ...other} = props;

	
	className = classNames('', className);
	className = classNames('border rounded-sm  bg-none-50  text-primary-900 p-3', className);
	className = classNames('dark:bg-primary-900 dark:text-primary-400  ', className);
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
