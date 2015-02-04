var router 		= require('../router');

import routerStore from '../stores/router';

var linkTo = React.createClass( {
	componentWillMount() {
		var _this = this;

		routerStore.on('stateChangeStart', this.handleStateChange);
	},
	componentWillUnmount() {
		routerStore.off('stateChangeStart', this.handleStateChange);
	},
	handleStateChange(payload) {
		this.setState({
			active: payload.state.name === this.props.stateName,
			state: payload.state
		});
	},
	getInitialState() {
		var states = routerStore.getStates();
		var state = states[this.props.stateName];

		if( state ) {
			return {
				href: '#' + state.compiledState.format( this.props.params || {} ),
				active: false
			};
		} else {
			throw new Error('State ' + this.props.stateName + ' does not exist');
		}
	},
	render() {
		var href = this.state.href;
		var cx = React.addons.classSet;

		var classes = cx({
			'active': this.state.active
		});

		return this.transferPropsTo(
			<a href={ href } className={ classes }>{ this.props.children }</a>
			);
	}
} );

export default linkTo;