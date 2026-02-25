
import clsx from 'clsx';

function Component({ className, src, ...props }) {

	className = clsx('flex w-10 h-10 border-1 content-center items-center rounded-full overflow-hidden', className);

	return (
		<div className={className} {...props}>
			<img className='w-full h-full object-cover' src={src} />
		</div>
	);
}

export default Component;
