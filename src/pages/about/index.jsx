import AtpTourLogo from '../../assets/logos/atp-tour.svg?react';
import Page from '../../components/page';
import Markdown from '../../components/ui/markdown';
import documentation from './vitel.md?raw';

function AboutPage() {
	return (
		<Page id='about-page'>
			<Page.Menu />
			<Page.Content>
				<Page.Title className='flex items-center gap-5'>
					<div className='flex-none bg-transparent'>
						<AtpTourLogo fill='currentColor' className='h-10 w-auto bg-transparent' />
					</div>
					<span className='bg-transparent'>Om Vitel</span>
				</Page.Title>
				<Page.Container>
					<Markdown className='text-primary-900 dark:text-primary-100 prose-h2:mt-8 prose-h2:mb-2 prose-h3:mt-6 prose-h3:mb-2 prose-p:mb-3 prose-ul:my-3'>
						{documentation}
					</Markdown>
				</Page.Container>
			</Page.Content>
			<Page.StatusBar status='ready'>Dokumentation för Vitel.</Page.StatusBar>
		</Page>
	);
}

export default AboutPage;
