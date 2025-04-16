import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';


let flags = {
	USA: '🇺🇸',
	GER: '🇩🇪',
	DEU: '🇩🇪',
	SWE: '🇸🇪',
	GBR: '🇬🇧',
	AUS: '🇦🇺',
	FRA: '🇫🇷',
	RUS: '🇷🇺',
	DEN: '🇩🇰',
	DNK: '🇩🇰',
    SVK: '🇸🇰',
	BUL: '🇧🇬',
	CHE: '🇨🇿',
	ARG: '🇦🇷',
	ESP: '🇪🇸',
	AUT: '🇦🇹',
	GRC: '🇬🇷',
	JPN: '🇯🇵',
	CRO: '🇭🇷',
	POR: '🇵🇹',
	CHN: '🇨🇳',
	CHI: '🇨🇱',
	FIN: '🇫🇮',
	CZE: '🇨🇿',
	SRB: '🇷🇸',
	BEL: '🇧🇪',
	CAN: '🇨🇦',
	POL: '🇵🇱',
	NOR: '🇳🇴',
	NLD: '🇳🇱',
	BRA: '🇧🇷',
	SUI: '🇨🇭',
    KAZ: '🇰🇿',
    HUN: '🇭🇺',
    ISR: '🇮🇱',
    TPE: '🇹🇼',
    UKR: '🇺🇦',
	LBN: '🇱🇧',
	ITA: '🇮🇹'
};

function Component (params) {
	
	let { className, country, ...props } = params;
	let src = `https://www.atptour.com/en/~/media/images/flags/${country}.svg`;

	 
	className = classNames('flex border-2 border-none-300 content-center items-center rounded-full overflow-hidden', className);

	// Hover
	className = classNames('transform transition-transform duration-300 hover:scale-110', className);

	return (
		<div className={className}>
			<img className='w-full h-full object-cover' src={src}/>
		</div>
	);
}

export default Component;
