
import atp500 from '../assets/atp-500.png';
import atp250 from '../assets/atp-250.png';
import atpMasters from '../assets/atp-masters.png';
import unitedCup from '../assets/united-cup.png';
import davisCup from '../assets/davis-cup.png';
import laverCup from '../assets/laver-cup.png';
import australianOpen from '../assets/australian-open.png';
import wimbledon from '../assets/wimbledon.png';
import usOpen from '../assets/us-open.png';
import rolandGarros from '../assets/roland-garros.png';
import atpNittoFinals from '../assets/atp-nitto-finals.png';
import atpNextGenFinals from '../assets/atp-next-gen-finals.png';

function Component({ event, ...props }) {
	let url = undefined;

	switch (event.type) {
		case 'Masters': {
			url = atpMasters;
			break;
		}
		case 'ATP-500': {
			url = atp500;
			break;
		}
		case 'ATP-250': {
			url = atp250;
			break;
		}
		case 'Grand Slam': {
			switch (event.name) {
				case 'Australian Open': {
					url = australianOpen;
					break;
				}
				case 'Wimbledon': {
					url = wimbledon;
					break;
				}
				case 'US Open': {
					url = usOpen;
					break;
				}
				case 'Roland Garros': {
					url = rolandGarros;
					break;
				}
			}
			break;
		}
		case 'Davis Cup': {
			url = davisCup;
			break;
		}
		case 'Rod Laver Cup': {
			url = laverCup;
			break;
		}
		case 'United Cup': {
			url = unitedCup;
			break;
		}
		case 'XXI': {
			url = atpNextGenFinals;
			break;
		}
		case 'WC': {
			url = atpNittoFinals;
			break;
		}
	}

	return <img src={url} {...props} />;
}

export default Component;
