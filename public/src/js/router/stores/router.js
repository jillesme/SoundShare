var store = require('../../flux/store');
var dispatcher = require('../../dispatchers/ecar');

var routerStore = new store({
	dispatcher: dispatcher
});

routerStore.currentState = {};
routerStore.states = {};

routerStore.registerHandlers({
	changeState: function (payload) {
		this.emit('changeState', payload);
	},
	registerState: function (payload) {
		this.states[payload.name] = payload.config;
		this.emit('stateAdded', payload);
	},
	stateChangeFinish: function (payload) {
		this.currentState = payload;
		this.emit('stateChangeFinish', payload);
	},
	stateChangeStart: function (payload) {
		this.currentState = payload;
		this.emit('stateChangeStart', payload);
	},
	statePromiseFinished: function (payload) {
		this.emit('statePromiseFinished', payload);
	}
});

routerStore.getCurrentState = function () {
	return this.currentState;
};

routerStore.getStates = function () {
	return this.states;
};

export default routerStore;