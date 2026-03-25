import Page from '../../components/page';
import Button from '../../components/ui/button';

export default function TrialPage() {
	function Content() {
		return (
			<>
				<Page.Title>Testsida</Page.Title>
				<Page.Container className='space-y-4'>
					<Page.Information>
						Den här sidan är till för att prova komponenter, layout och tillfälliga experiment.
					</Page.Information>

					<div className='flex flex-wrap gap-2'>
						<Button link='/matches'>Till matcher</Button>
						<Button link='/settings'>Till inställningar</Button>
					</div>

					<div className='space-y-2'>
						<Page.Title level={4}>Exempelkomponenter</Page.Title>
						<Page.Information>Informationsruta för UI-test.</Page.Information>
						<Page.Warning>Varningsruta för UI-test.</Page.Warning>
						<Page.Error>Felruta för UI-test.</Page.Error>
					</div>
				</Page.Container>
			</>
		);
	}

	return (
		<Page id='trial-page'>
			<Page.Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
}
