import routerStore from '../stores/router';

var view = React.createClass( {
	componentWillMount() {
		var _this = this;

		routerStore.on('stateChangeFinish', this.handleStateChange);
	},
	componentWillUnmount() {
		routerStore.off('stateChangeFinish', this.handleStateChange);
	},
	handleStateChange: function (payload) {
		setTimeout( () => {
			this.setState({
				currentState: payload.state,
				data: payload.data
			});
		}, 0);
	},
	getInitialState: function( ) {
		return {
			currentState: {
				view: null
			},
			data: {

			}
		};
	},
	render() {
		var currentState = this.state.currentState;
		var data = this.state.data;

		if( !currentState.view ) {
			return null;
		}

		var key = currentState.forceRemount ? +new Date() : currentState.name;

		return React.createElement(currentState.view, {
			key: key,
			data: data,
			currentState: currentState
		} );
	}
} );

export default view;