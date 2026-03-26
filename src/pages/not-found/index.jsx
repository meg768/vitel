import Page from '../../components/page';

export default function NotFoundPage() {
	return (
		<Page id='not-found-page'>
			<Page.Menu />
			<Page.Content>
				<Page.Emoji emoji='🤷' message='What?!' />
			</Page.Content>
		</Page>
	);
}
