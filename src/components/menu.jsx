import { Link } from 'react-router';
import { Button } from '../components';

import GearIcon from '../assets/radix-icons/gear.svg?react';
import AtpLogo from '../assets/logos/atp-logo.svg?react';


function Component() {

	function MenuItem(props) {
		let buttonClass = 'bg-transparent! hover:bg-primary-700!';

		return (
			<div className='flex items-center'>
				<Link to={props.link}>
					<Button className={buttonClass}>{props.children}</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className='border-b-1 border-primary-800'>
			<div className='flex   justify-between items-center w-full bg-primary-900 p-2 gap-1 dark:bg-primary-900   whitespace-nowrap overflow-auto'>
				<div className='flex space-x-1 items-center'>
					<MenuItem link='/#'>
						<AtpLogo className='w-20 h-auto ' />
					</MenuItem>
					<MenuItem link='/events'>Turneringar</MenuItem>
					<MenuItem link='/players'>Spelare</MenuItem>
					<MenuItem link='/currently'>Pågående</MenuItem>
					<MenuItem link='/qna'>Q&A</MenuItem>
					<MenuItem link='/live'>Live</MenuItem>
				</div>
				<div className='flex space-x-1 items-center '>
					<MenuItem link='/settings'>
						<GearIcon className='w-6 h-6 ' />
					</MenuItem>
				</div>
			</div>
		</div>
	);
}


export default Component;
