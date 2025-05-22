import Page from '../../components/page';
import Menu from '../../components/menu';

export default function SettingsPage() {

	function Content () {

		return (
			<>
				<Page.Title>
					Inställningar
				</Page.Title>

				<Page.Container>
					<p>Place code here...</p>
				</Page.Container>
			</>
		);
	};

	return (
		<Page id='settings-page'>
			<Menu></Menu>
			<Page.Content>
				<Content></Content>
			</Page.Content>
		</Page>
	);
}
