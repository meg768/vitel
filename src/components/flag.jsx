import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import Avatar from './avatar';

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

	className = classNames('flex content-center items-center bg-none-100', className);


	return (
		<div className={className}>
			<img className='w-full h-auto border-1' src={src} />
		</div>
	);
}

function ComponentXX (params) {
	
	let { country, ...props } = params;
	let src = `https://www.atptour.com/en/~/media/images/flags/${country}.svg`;

	 
	return (
		<>
			<Avatar src={src} {...props} />
		</>
	);
}

export default ComponentXX;
