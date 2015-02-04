import Router from '../router/router';

class Index extends React.Component {
	constructor() {

	}

	componentDidMount() {
		Router.handleStateChange();
	}

	render() {
		return (
			<div>
				<Router.view />
			</div>
		);
	}
}

export { Index };