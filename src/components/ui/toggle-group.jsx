import * as ToggleGroup from '@radix-ui/react-toggle-group';
import clsx from 'clsx';

function Component({ defaultValue, onChange, children }) {
	function onValueChange(value) {
		if (value && onChange) {
			onChange(value);
		}
	}

	return (
		<ToggleGroup.Root defaultValue={defaultValue} type='single' onValueChange={onValueChange} className='inline-flex border rounded-sm overflow-hidden'>
			{children}
		</ToggleGroup.Root>
	);
}

Component.Item = function Item({ value, className, children }) {

	className = clsx(className, [
		'px-4 py-2 text-sm cursor-pointer transition',
		'not-first:border-l',

		'bg-primary-100',
		'text-primary-950',
		'hover:bg-primary-500',
		'hover:text-primary-50',
		'data-[state=on]:text-primary-50',
		'data-[state=on]:bg-primary-600',

		'dark:bg-primary-900',
		'dark:text-primary-50',
		'dark:data-[state=on]:bg-primary-700'
	]);

	return (
		<ToggleGroup.Item value={value} className={className}>
			{children}
		</ToggleGroup.Item>
	);
};

export default Component;
