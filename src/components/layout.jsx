import classNames from 'classnames';

export default function Layout(props) {
	let className = '';
	className = classNames(className, 'bg-white dark:bg-primary-950');
	className = classNames(className, 'text-primary-900 dark:text-primary-100');
	className = classNames(className, 'border-primary-200 dark:border-primary-600');

	return (
		<div id='layout' className={classNames(className, 'relative min-w-2xl')}>
			<div className='relative z-0 min-h-screen'>
				<div {...props}></div>
			</div>
		</div>
	);
}
