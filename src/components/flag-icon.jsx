
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

function Component ({country}) {
	return flags[country];
}

export default Component;
