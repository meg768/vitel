import classNames from 'classnames';

export default function Layout(props) {
	return (
		<div className='relative min-w-2xl min-h-screen'>
			<div className='relative z-0 bg-white dark:bg-primary-950 min-h-screen '>
				<div {...props}></div>
			</div>
		</div>
	);

	return (
		<div className='relative min-w-2xl min-h-screen'>
			{/* Background image – fixed and behind everything */}
			<div className="fixed inset-0 -z-10 bg-transparent bg-[url('/assets/atp-tour.svg')] opacity-99 bg-cover bg-center bg-no-repeat"></div>

			<div className='relative z-0 bg-primary-50/98	 dark:bg-primary-950/99 min-h-screen '>
				<div {...props}></div>
			</div>
		</div>
	);
}
