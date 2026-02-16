import SvgUnitedCup from '../assets/united-cup.jsx';
import SvgNextGenFinals from '../assets/atp-next-gen-finals.jsx';
import SvgWimbledon from '../assets/wimbledon.jsx';
import SvgRolandGarros from '../assets/roland-garros.jsx';
import SvgUsOpen from '../assets/us-open.jsx';
import SvgAustralianOpen from '../assets/australian-open.jsx';
import SvgLaverCup from '../assets/laver-cup.jsx';
import SvgDavisCup from '../assets/davis-cup.jsx';
import SvgAtp250 from '../assets/atp-250.jsx';
import SvgAtp500 from '../assets/atp-500.jsx';
import SvgAtpMasters from '../assets/atp-masters.jsx';
import SvgAtpNittoFinals from '../assets/atp-nitto-finals.jsx';

function EventLogo({ event, ...props }) {
	let url = undefined;

	switch (event.name) {
		case 'Nitto ATP Finals': {
			return <SvgAtpNittoFinals fill='currentColor' {...props} />;
		}
		case 'Wimbledon': {
			return <SvgWimbledon fill='currentColor' {...props} />;
		}
		case 'Roland Garros': {
			return <SvgRolandGarros fill='currentColor' {...props} />;
		}
		case 'US Open': {
			return <SvgUsOpen fill='currentColor' {...props} />;
		}
		case 'Australian Open': {
			return <SvgAustralianOpen fill='currentColor' {...props} />;
		}
	}

	switch (event.type) {
		case 'Rod Laver Cup': {
			return <SvgLaverCup fill='currentColor' {...props} />;
		}
		case 'Masters': {
			return <SvgAtpMasters fill='currentColor' {...props} />;
		}
		case 'ATP-500': {
			return <SvgAtp500 fill='currentColor' {...props} />;
		}
		case 'ATP-250': {
			return <SvgAtp250 fill='currentColor' {...props} />;
		}
		case 'Davis Cup': {
			return <SvgDavisCup fill='currentColor' {...props} />;
		}
		case 'United Cup': {
			return <SvgUnitedCup fill='currentColor' {...props} />;
		}
		case 'Next Gen Finals': {
			return <SvgNextGenFinals fill='currentColor' {...props} />;
		}
	}

	if (!url) return null;

	return <img src={url} alt={event?.name ?? event?.type ?? ''} {...props} />;
}

export default EventLogo;
