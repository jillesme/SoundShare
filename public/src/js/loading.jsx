import routerStore from './router/stores/router';

var loading = {};

loading.status = 'idle';

loading.bar = document.querySelectorAll('.loading__bar')[0];
loading.container = document.querySelectorAll('.loading')[0];

var loadingBar = React.createClass({
	getInitialState: function () {
		return {
			percentage: 0,
			active: false
		};
	},
	reqCompleted: 0,
	reqTotal: 0,
	start: function (payload) {
		if( payload.state.resolve ) {
			if( this.timeout ) {
				clearTimeout( this.timeout );
			}

			if( this.status === 'started' ) {
				return;
			}
			this.setState({
				active: true
			});

			this.reqTotal = Object.keys(payload.state.resolve).length;

			this.status = 'started';

			this.set(0.2);
		}
	},
	finishPromise: function () {
		this.reqCompleted++;

		if( this.reqCompleted >= this.reqTotal ) {
			this.complete();
		} else {
			this.set( this.reqCompleted / this.reqTotal );
		}
	},
	set: function ( number ) {
		if( this.status !== 'started' ) {
			return;
		}

		var percentage = ( number * 100 );

		this.percentage = number;

		this.setState({
			percentage: percentage
		});

		if( this.incrementTimeout ) {
			clearTimeout( this.incrementTimeout );
		}

		this.incrementTimeout = setTimeout( () =>  {
			this.increment();
		}, 250 );
	},
	increment: function () {
		if( this.percentage >= 1 ) {
			return;
		}

		var random = 0;

		var status = this.percentage;

	    if (status >= 0 && status < 0.25) {
			random = (Math.random() * (5 - 3 + 1) + 3) / 100;
	    } else if (status >= 0.25 && status < 0.65) {
			random = (Math.random() * 3) / 100;
	    } else if (status >= 0.65 && status < 0.9) {
			random = (Math.random() * 2) / 100;
	    } else if (status >= 0.9 && status < 0.99) {
	    	random = 0.005;
	    } else {
	    	random = 0;
	    }

	    var percentage = this.percentage + random;

	    this.set( percentage );
	},
	complete: function () {
		this.set(1);

		this.status = 'idle';
		this.reqTotal = 0;
		this.reqCompleted = 0;

		if( this.timeout ) {
			clearTimeout( this.timeout );
		}

		var _this = this;
		this.timeout = setTimeout( function() {
			_this.setState({
				percentage: 0,
				active: false
			});
		}, 250 );
	},
	componentWillMount: function () {
		routerStore.on('stateChangeStart', this.start);
		routerStore.on('statePromiseFinished', this.finishPromise);
	},
	componentWillUnmount: function () {
		routerStore.off('stateChangeStart', this.start);
		routerStore.off('statePromiseFinished', this.finishPromise);
	},
	render: function () {
		var cx = React.addons.classSet;

		var loadingClass = cx({
			loading: true,
			active: this.state.active
		});

		var style = {
			width: this.state.percentage + '%'
		};

		return (
			<div className={ loadingClass }>
		      <div className="loading__bar" style={ style }>
		        <div className="loading__percentage"></div>
		      </div>
		    </div>
			);
	}
})

module.exports = loadingBar;