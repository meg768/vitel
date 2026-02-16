import LogoUnitedCup from '../assets/united-cup.svg?react';
import LogoNextGenFinals from '../assets/atp-next-gen-finals.svg?react';
import LogoWimbledon from '../assets/wimbledon.svg?react';
import LogoRolandGarros from '../assets/roland-garros.svg?react';
import LogoUsOpen from '../assets/us-open.svg?react';
import LogoAustralianOpen from '../assets/australian-open.svg?react';
import LogoLaverCup from '../assets/laver-cup.svg?react';
import LogoDavisCup from '../assets/davis-cup.svg?react';
import LogoAtp250 from '../assets/atp-250.svg?react';
import LogoAtpMasters from '../assets/atp-masters.svg?react';
import LogoAtpNittoFinals from '../assets/atp-nitto-finals.svg?react';

import LogoAtp500 from '../assets/atp-500.svg?react';

function EventLogo({ event, ...props }) {
	switch (event.name) {
		case 'Nitto ATP Finals': {
			return <LogoAtpNittoFinals {...props} />;
		}
		case 'Wimbledon': {
			return <LogoWimbledon {...props} />;
		}
		case 'Roland Garros': {
			return <LogoRolandGarros {...props} />;
		}
		case 'US Open': {
			return <LogoUsOpen {...props} />;
		}
		case 'Australian Open': {
			return <LogoAustralianOpen {...props} />;
		}
	}

	switch (event.type) {
		case 'Rod Laver Cup': {
			return <LogoLaverCup {...props} />;
		}
		case 'Masters': {
			return <LogoAtpMasters {...props} />;
		}
		case 'ATP-500': {
			return <LogoAtp500 {...props} />;
		}
		case 'ATP-250': {
			return <LogoAtp250 {...props} />;
		}
		case 'Davis Cup': {
			return <LogoDavisCup {...props} />;
		}
		case 'United Cup': {
			return <LogoUnitedCup {...props} />;
		}
		case 'Next Gen Finals': {
			return <LogoNextGenFinals {...props} />;
		}
	}

	return null;
}

export default EventLogo;
