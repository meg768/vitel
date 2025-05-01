import classNames from 'classnames';

export default function Layout(props) {


	return (
		<div className='relative min-h-screen'>
			{/* Background image – fixed and behind everything */}
			<div className="fixed inset-0 -z-10 bg-[url('/assets/bg.png')] bg-cover bg-center bg-no-repeat"></div>

			<div className='relative z-0 bg-black/90 min-h-screen'>
				<div {...props}></div>
			</div>
		</div>
	);
}
