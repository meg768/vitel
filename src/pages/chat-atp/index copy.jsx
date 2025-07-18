import { useState } from 'react';
import { Button } from '../../components/ui';

import Page from '../../components/page';

function Component() {
	const [question, setQuestion] = useState('');
	const [submitted, setSubmitted] = useState('');
	const [reply, setReply] = useState('');

	function fetch() {
		/*
			Implementation for fetching data and updating the reply.

			Fetch from URL https://tennis.egelberg.se/api/ask
			using GET method with the question as a query parameter named 'question'

			Then use setReply to update the reply state with the response data.
			Handle errors by setting the error state with setError.
			Please use fetch API to make the request.
			Use await for the fetch call to complete before updating the state.
		*/
	}

	function onSubmit() {
		console.log('Submitting question:', question);
		setSubmitted(question);
	}

	function Input() {

		function onChange(event) {
			const value = event.target.value;
			setQuestion(value);
		}

		function onKeyDown(event) {
			if (event.key === 'Enter') {
				onSubmit();
			}
		}
		return (
			<div className='flex gap-2'>
				<input
					className='border border-primary-300 p-2 w-full outline-none rounded-sm'
					placeholder='Hur många Grand Slam-titlar har Federer?'
					value={question}
					autoFocus={true}
					onChange={onChange}
					onKeyDown={onKeyDown}
				/>
				<Button className='' onClick={onSubmit}>
					Fråga
				</Button>
			</div>
		);
	}
	function Output() {

		if (!submitted) {
			return
		}
		return (
			<div>
				<div>Fråga: {submitted}</div>
				<div>Svar: {reply}</div>
			</div>
		);
	}

	function Content() {
		return (
			<>
				<Page.Title>Fråga ATP-assistenten</Page.Title>
				<Page.Container>
					<div>
						<Input />
					</div>
					<div>
						<Output />
					</div>
				</Page.Container>
			</>
		);
	}

	return (
		<Page id='chat-atp-page'>
			<Page.Menu />
			<Page.Content>
				<Content />
			</Page.Content>
		</Page>
	);
}

export default Component;
