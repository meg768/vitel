import Page from '../../components/page';

function Component() {
	function Content() {
		return (
			<>
				<Page.Title>ABC</Page.Title>
				<Page.Container>{/* Intentionally blank for now */}</Page.Container>
			</>
		);
	}

	return (
		<Page id='abc-page'>
			<Page.Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
}

export default Component;
