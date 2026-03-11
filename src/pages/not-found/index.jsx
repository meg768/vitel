import Page from '../../components/page';

let Component = () => {

	function Content() {

		return (
			<>
					<Page.Information>
						<p className='font-bold text-xl'>Sidan kunde inte hittas</p>
						<p>Antagligen för att funktionen inte finns tillgänglig än.</p>
					</Page.Information>
			</>
		);
	}

	return (
		<Page id='not-found-page'>
			<Page.Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
};

export default Component;
