import store from '../stores/router';

var actions = {
	changeState: function (name) {
		this.dispatcher.dispatch({
			action: 'changeState',
			data: name
		});
	},
	stateChangeStart: function (state) {
		this.dispatcher.dispatch({
			action: 'stateChangeStart',
			data: {
				state: state
			}
		});
	},
	stateChangeFinish: function (state, data) {
		this.dispatcher.dispatch({
			action: 'stateChangeFinish',
			data: {
				state: state,
				data: data
			}
		});
	},
	statePromiseFinished: function (promise) {
		this.dispatcher.dispatch({
			action: 'statePromiseFinished',
			data: promise
		});
	},
	statePromiseFailed: function (promise) {
		this.dispatcher.dispatch({
			action: 'statePromiseFailed',
			data: promise
		});
	},
	registerState: function (name, config) {
		this.dispatcher.dispatch({
			action: 'registerState',
			data: {
				name: name,
				config: config
			}
		});
	}
};

var actions = store.createActions(actions);

export default actions;