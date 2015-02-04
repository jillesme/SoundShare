/*
	Components
 */

var matchFactory 	= require('./matchFactory');

import linkTo from './components/linkTo';
import view from './components/view';

import routerActions from './actions/router';
import routerStore from './stores/router';

var router = {};

router.states = {};
router.fallbackState = '';

router.registerState = function ( name, config ) {
	var compiledState = new matchFactory( config.url );

	var newState = config;
	newState.name = name;
	newState.compiledState = compiledState;

	this.states[name] = newState;

	routerActions.registerState(name, config);
};

router.otherwise = function ( stateName ) {
	this.fallbackState = this.states[stateName];
};

router.changeState = function (state) {
	routerActions.stateChangeStart(state);

	var promises = [];

	if( state.resolve ) {
		var resolveKeys = Object.keys(state.resolve);

		var resolves = state.resolve;
		for( var i in resolves ) {
			var resolve = resolves[i];

			var statePromise = resolve.call( this, state.params );

			promises.push(statePromise);

			statePromise.then(routerActions.statePromiseFinished, routerActions.statePromiseFailed);
		}
	}

	var promise = Q.all(promises);

	promise.then( function (data) {
		var dataToPass = {};

		if( state.resolve ) {
			data.forEach( function (response, index) {
				var key = resolveKeys[index];
				dataToPass[ key ] = response; 
			} );
		}

		routerActions.stateChangeFinish(state, dataToPass);
	} );
};

router.handleStateChange = function () {
	var url = window.location.hash.replace('#', '');

	var states = this.states;
	var changed = false;
	for( var i in states ) {
		var state = states[i];

		var check = state.compiledState.exec(url);
		for( var i in check ) {
			check[i] = decodeURIComponent(check[i]);
		}
		state.params = check;

		if( check ) {
			changed = true;
			this.changeState( state );
		}
	}

	if( !changed ) {
		window.location.hash = this.fallbackState.compiledState.prefix;
	}
};

window.onhashchange = router.handleStateChange.bind(router);

router.linkTo = linkTo;
router.view = view;

router.actions = routerActions;
router.store = routerStore;

export default router;