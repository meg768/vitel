import Page from '../../components/page';
import Link from '../../components/ui/link';

import prospects from './prospects.js';
import goat from './goat.js';
import topPlayers from './top-players.js';

let Component = () => {
	function Content() {
		return (
			<Page.Content>
				<Page.Title>Testbänk</Page.Title>
				<Page.Container>
					<div className='text-lg pt-4 pb-2'>
						Här är några frågor som kan vara intressanta att ställa till databasen. Det är inte säkert att de ger något vettigt svar...
					</div>
					<Query {...prospects} />
					<Query {...goat} />
					<Query {...topPlayers} />
				</Page.Container>
			</Page.Content>
		);
	}

	function Query({ sql, format = null, title = null, description = '-', ...props }) {
		return (
			<div className='text-xl  border-1 p-3 mt-3 mb-3 bg-primary-500/10 rounded-md hover:bg-primary-500/20'>
				<Link hover={false} query={{ sql, format, title }} to={`/players`} {...props}>
					<div>{title} </div>
					<div className={'text-sm! bg-transparent '}>{description}</div>
				</Link>
			</div>
		);
	}

	return (
		<>
			<Page id='trial-page'>
				<Page.Menu />
				<Content />
			</Page>
		</>
	);
};

export default Component;
