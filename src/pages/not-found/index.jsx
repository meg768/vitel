import Page from '../../components/page';

let Component = () => {
	return (
		<Page id='not-found-page'>
			<Page.Menu />
			<Page.Content>
				<Page.Emoji emoji='🤷' message='What?!' />
			</Page.Content>
		</Page>
	);
};

export default Component;
