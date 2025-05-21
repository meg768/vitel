import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';

export default function ThemeDialog({ children }) {
	const [open, setOpen] = useState(false);
	const [mode, setMode] = useState('light');
	const [court, setCourt] = useState('hard');

	const root = document.getElementById('root');

	const courtLabel = {
		hard: 'Cement',
		clay: 'Grus',
		grass: 'Gräs'
	};

	const modeLabel = {
		light: 'Ljust',
		dark: 'Mörkt'
	};

	const syncWithRoot = () => {
		if (!root) return;

		const classList = root.classList;
		const currentMode = classList.contains('dark') ? 'dark' : 'light';
		const currentCourt = classList.contains('clay') ? 'clay' : classList.contains('grass') ? 'grass' : 'hard';

		setMode(currentMode);
		setCourt(currentCourt);

		localStorage.setItem('theme', currentMode + (currentCourt !== 'hard' ? ` ${currentCourt}` : ''));
	};

	const applyTheme = (newMode, newCourt) => {
		if (!root) return;

		root.classList.remove('light', 'dark', 'clay', 'grass');
		root.classList.add(newMode);
		if (newCourt !== 'hard') root.classList.add(newCourt);

		localStorage.setItem('theme', newMode + (newCourt !== 'hard' ? ` ${newCourt}` : ''));
	};

	const handleChange = (newMode, newCourt) => {
		setMode(newMode);
		setCourt(newCourt);
		applyTheme(newMode, newCourt);
	};

	const handleOpenChange = isOpen => {
		setOpen(isOpen);
		if (isOpen) syncWithRoot();
	};

	return (
		<Dialog.Root open={open} onOpenChange={handleOpenChange}>
			<Dialog.Trigger asChild>{children}</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Overlay className='fixed inset-0 bg-black/50 backdrop-blur-sm' />
				<Dialog.Content className='fixed top-1/2 left-1/2 w-80 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white dark:bg-gray-900 p-6 shadow-xl space-y-5'>
					<Dialog.Title className='text-lg font-bold text-gray-800 dark:text-white'>Temainställningar</Dialog.Title>

					{/* Light / Dark */}
					<div className='space-y-1'>
						<div className='text-sm text-gray-600 dark:text-gray-300'>Läge</div>
						<div className='flex gap-2'>
							{['light', 'dark'].map(m => (
								<button
									key={m}
									onClick={() => handleChange(m, court)}
									className={`px-3 py-1 rounded border ${
										mode === m ? 'bg-primary-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
									}`}
								>
									{modeLabel[m]}
								</button>
							))}
						</div>
					</div>

					{/* Court Style */}
					<div className='space-y-1'>
						<div className='text-sm text-gray-600 dark:text-gray-300'>Underlag</div>
						<div className='flex gap-2'>
							{['hard', 'clay', 'grass'].map(c => (
								<button
									key={c}
									onClick={() => handleChange(mode, c)}
									className={`px-3 py-1 rounded border ${
										court === c ? 'bg-primary-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
									}`}
								>
									{courtLabel[c]}
								</button>
							))}
						</div>
					</div>

					<Dialog.Close className='absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white'>✕</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
