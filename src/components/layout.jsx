import clsx from 'clsx';
export default function Layout(props) {
	let className = '';
	className = clsx(className, 'bg-white dark:bg-primary-950');
	className = clsx(className, 'text-primary-900 dark:text-primary-100');
	className = clsx(className, 'border-primary-200 dark:border-primary-600');

	return (
		<div id='layout' className={clsx(className, 'relative min-w-md')}>
			<div className='relative z-0 min-h-screen'>
				<div {...props}></div>
			</div>
		</div>
	);
}
