require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/** @jsx React.DOM */var navigation = require('./navigation');
var search = require('./search');

module.exports = React.createClass( {displayName: 'exports',
	render: function () {

		return (
		    React.DOM.header({className: "header"}, 
		      React.DOM.div({className: "header__fixed"}, 

		        React.DOM.a({href: "/#/", className: "header__logo"}), 

		       	search(null), 
	          	navigation(null)

		      )

		    )
			);
	}
} );
},{"./navigation":2,"./search":3}],2:[function(require,module,exports){
/** @jsx React.DOM */var router = require('../router/router');

function findClosestParent( event, className ) {
	var parent = event.parentNode;
    while (parent!=document.body && parent != null) {
      if ((parent) && parent.className && parent.className.indexOf(className) != -1) {
        return parent;
      } else {
        parent = parent ? parent.parentNode : null;
      }
    }
    return null;
}

module.exports = React.createClass( {displayName: 'exports',
	getInitialState: function () {
		return {
			open: false,
			dropdownHover: -1
		};
	},
	componentDidMount: function () {
		var _this = this;

		document.addEventListener('click', function(e){
	      if( !findClosestParent(e.target, 'navigation__link') ) {
	        if( _this.state.open ) {
	          _this.setState({
	          	open: false
	          });
	        }
	      }
	    });
	},
	setHover: function ( id ) {
		this.setState({
			dropdownHover: id
		});
	},
	removeHover: function () {
		this.setState({
			dropdownHover: -1
		});
	},
	toggleDropdown: function ( event ) {
		event.preventDefault();

		this.setState({
			open: !this.state.open
		});
	},
	render: function () {
		var cx = React.addons.classSet;

		var dropdownClass = cx({
			'dropdown': true,
			'dropdown--open': this.state.open,
			'dropdown--top': this.state.dropdownHover === 0
		});

		return (
			React.DOM.div({className: "navigation"}, 
				React.DOM.ul({className: "navigation__list"}, 
		            React.DOM.li({className: "navigation__item"}, 
		              React.DOM.a({className: "navigation__link", href: "#"}, 
		                React.DOM.i({className: "fa fa-info fa-fw navigation__icon navigation__icon--info"})
		              )
		            ), 
		            React.DOM.li({className: "navigation__item navigation__item--dropdown"}, 
		              React.DOM.a({
		              	className: "navigation__link", 
		              	href: "", 
		              	onClick:  this.toggleDropdown}, 
		                React.DOM.i({className: "fa fa-bars fa-fw navigation__icon navigation__icon--dropdown"})
		              ), 

		              React.DOM.ul({className: dropdownClass }, 
		                React.DOM.li({
		                	className: "dropdown__item"
		                	}, 
		                  router.linkTo({
		                  	stateName: "create", 
		                  	className: "dropdown__link", 
		                  	onMouseOver:  this.setHover.bind(this, 0), 
		                  	onMouseOut:  this.removeHover}, 
		                    React.DOM.i({className: "fa fa-plus fa-fw dropdown__icon"}), 

		                    "Create eCar"
		                  )
		                ), 
		                React.DOM.li({className: "dropdown__item"}, 
		                  router.linkTo({
		                  	stateName: "current", 
		                  	href: "#", className: "dropdown__link"}, 
		                    React.DOM.i({className: "fa fa-list fa-fw dropdown__icon"}), 

		                    "Current eCars"
		                  )
		                ), 
		                React.DOM.li({className: "dropdown__item"}, 
		                  React.DOM.a({href: "#", className: "dropdown__link"}, 
		                    React.DOM.i({className: "fa fa-paperclip fa-fw dropdown__icon"}), 

		                    "Reporting"
		                  )
		                ), 
		                React.DOM.li({className: "dropdown__item"}, 
		                  React.DOM.a({href: "#", className: "dropdown__link"}, 
		                    React.DOM.i({className: "fa fa-cog fa-fw dropdown__icon"}), 

		                    "Administration"
		                  )
		                )
		              )
		            )
	         	 )
         	 )
			);
	}
} );
},{"../router/router":10}],3:[function(require,module,exports){
/** @jsx React.DOM */var Search = React.createClass( {displayName: 'Search',
	handleSearch: function ( event ) {
		if( event.keyCode === 13 ) {
			window.location = '/#/search/' + event.target.value.split(' ').join('+');
		}
	},
	render: function () {
		return (
		    React.DOM.div({className: "search"}, 
		          React.DOM.i({className: "fa fa-search search__icon"}), 

	          React.DOM.input({
	          	type: "text", 
	          	placeholder: "Search eCars", 
	          	className: "search__box", 
	          	onKeyDown:  this.handleSearch}), 

	          React.DOM.span({className: "search__tip"}, 
	            "Press ", React.DOM.span({className: "search__tip--button"}, "Enter"), " to search"
	          )
	        )

			);
	}
} );

module.exports = Search;
},{}],4:[function(require,module,exports){
/** @jsx React.DOM */module.exports = React.createClass({displayName: 'exports',
	render: function () {
		return (
			React.DOM.div(null, 
				"coasdsasdsdsds"
			)
			);
	}
});
},{}],5:[function(require,module,exports){
/** @jsx React.DOM */module.exports = React.createClass({displayName: 'exports',
	render: function () {
		return (
			React.DOM.div(null, 
				"coasds"
			)
			);
	}
});
},{}],6:[function(require,module,exports){
/** @jsx React.DOM */var router = require('../router/router');

var pageHeader = require('../components/header');

var loadingElement = document.querySelectorAll('.loading')[0];

module.exports = React.createClass({displayName: 'exports',
	componentDidMount: function () {
		loadingElement.classList.remove('active');

		router.handleState();
	},
	render: function () {
		return (
			React.DOM.div(null, 
				pageHeader(null), 

				router.view(null)
			)
			);
	}
});
},{"../components/header":1,"../router/router":10}],7:[function(require,module,exports){
/** @jsx React.DOM */var xhr = require('../xhr');

var loadingElement = document.querySelectorAll('.loading')[0];

var Search = React.createClass({displayName: 'Search',
	componentWillMount: function () {
		loadingElement.classList.remove('active');
	},
	render: function () {
		console.log(this.props);
		var test = [];
		for( var i = 0; i < 2; i++ ) {
			test.push(React.DOM.div(null, "hello"));
		}
		return (
			React.DOM.div(null, 
				test 
			)
			);
	}
});


Search.resolve = {
	'test': function( params ) {
		return xhr('GET', '/rest/test');
	},
	'test2': function( params ) {
		return xhr('GET', '/rest/test2');
	}
};

module.exports = Search;
},{"../xhr":11}],8:[function(require,module,exports){
var router = require('./router/router');

var create = require('./pages/create');
var current = require('./pages/current');
var search = require('./pages/search');

router.registerState('create', {
	url: '/create',
	view: create
});

router.registerState('current', {
	url: '/current',
	view: current
});

router.registerState('search', {
	url: '/search/:query',
	optionalParams: ['query'],
	view: search,
	resolve: search.resolve,
	loadingNode: '.loading',
});

router.otherwise('current');
},{"./pages/create":4,"./pages/current":5,"./pages/search":7,"./router/router":10}],9:[function(require,module,exports){
var match = {};

match.compile = function ( url ) {
	return new matchFactory( url );
};

var matchFactory = function ( url, config ) {
	 var placeholder = /([:*])(\w+)|\{(\w+)(?:\:((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g;

	config = config || {};

    var compiled = '^';
    var last = 0;
    var m;

    var segments = this.segments = [];
    var params = this.params = {};

    var id, regexp, segment, type, cfg;

    var pattern = url;
    function extend( target, dest ) {
    	console.log(target,dest);
    	for( var i in dest ) {
    		target[i] = dest[i];
    	}

    	return target;
    }

  function addParameter(id, type, config) {
    if (!/^\w+(-+\w+)*$/.test(id)) throw new Error("Invalid parameter name '" + id + "' in pattern '" + pattern + "'");
    if (params[id]) throw new Error("Duplicate parameter name '" + id + "' in pattern '" + pattern + "'");

    params[id] = extend({ type: type || new Type(), $value: function(test){return test;} }, config);
  }
  function $value(value) {
    /*jshint validthis: true */
    return value ? this.type.decode(value) : $UrlMatcherFactory.$$getDefaultValue(this);
  }

    function quoteRegExp(string, pattern, isOptional) {
	    var result = string.replace(/[\\\[\]\^$*+?.()|{}]/g, "\\$&");
	 	if (!pattern) return result;
	 	var flag = isOptional ? '?' : '';
		return result + flag + '(' + pattern + ')' + flag;
	}

	  function paramConfig(param) {
    if (!config.params || !config.params[param]) return {};
    var cfg = config.params[param];
    return typeof cfg === 'object' ? cfg : { value: cfg };
  }

  	while ((m = placeholder.exec(pattern))) {

	    id      = m[2] || m[3]; // IE[78] returns '' for unmatched groups instead of null
	    regexp  = m[4] || (m[1] == '*' ? '.*' : '[^/]*');
	    segment = pattern.substring(last, m.index);
	    type    = this.$types[regexp] || new Type({ pattern: new RegExp(regexp) });
	    cfg     = paramConfig(id);

	    if (segment.indexOf('?') >= 0) break; // we're into the search part

	    compiled += quoteRegExp(segment, type.$subPattern(), cfg && cfg.value);

	    addParameter(id, type, cfg);
	  	segments.push(segment);
	    last = placeholder.lastIndex;
	}
	segment = pattern.substring(last);

	var i = segment.indexOf('?');

	if (i >= 0) {
	    var search = this.sourceSearch = segment.substring(i);
	    segment = segment.substring(0, i);
	    this.sourcePath = pattern.substring(0, last + i);

	    // Allow parameters to be separated by '?' as well as '&' to make concat() easier
	    search.substring(1).split(/[&?]/).forEach( function(key) {
	      //addParameter(key, null, paramConfig(key));
	    });
	} else {
	    this.sourcePath = pattern;
		this.sourceSearch = '';
	}

	compiled += quoteRegExp(segment) + (config.strict === false ? '\/?' : '') + '$';
	segments.push(segment);

	this.regexp = new RegExp(compiled, config.caseInsensitive ? 'i' : undefined);
	this.prefix = segments[0];
};

matchFactory.prototype.exec = function (path, searchParams) {
  var m = this.regexp.exec(path);
  if (!m) return null;
  searchParams = searchParams || {};

  var params = this.parameters(), nTotal = params.length,
    nPath = this.segments.length - 1,
    values = {}, i, cfg, param;

  if (nPath !== m.length - 1) throw new Error("Unbalanced capture group in route '" + this.source + "'");

  for (i = 0; i < nPath; i++) {
    param = params[i];
    cfg = this.params[param];
    console.log(this.params);
    values[param] = cfg.$value(m[i + 1]);
  }
  for (/**/; i < nTotal; i++) {
    param = params[i];
    cfg = this.params[param];
    values[param] = cfg.$value(searchParams[param]);
  }

  return values;
};

matchFactory.prototype.validates = function (params) {
  var result = true, isOptional, cfg, self = this;

  for( var key in params ) {
  	var val = params[key];
    if (!self.params[key]) return;
    cfg = self.params[key];
    isOptional = !val && cfg && cfg.value;
    result = result;
  }
  return result;
};

matchFactory.prototype.format = function (values) {
  var segments = this.segments, params = this.parameters();

  if (!values) return segments.join('').replace('//', '/');

  var nPath = segments.length - 1, nTotal = params.length,
    result = segments[0], i, search, value, param, cfg, array;

  if (!this.validates(values)) return '';

  for (i = 0; i < nPath; i++) {
    param = params[i];
    value = values[param];
    cfg   = this.params[param];

    if (!value && (segments[i] === '/' && segments[i + 1] === '/')) continue;
    if (value != null) result += encodeURIComponent(value);
    result += segments[i + 1];
  }

  for (/**/; i < nTotal; i++) {
    param = params[i];
    value = values[param];
    if (value == null) continue;
    array = typeof value === 'array';

    if (array) {
      value = value.map(encodeURIComponent).join('&' + param + '=');
    }
    result += (search ? '&' : '?') + param + '=' + (array ? value : encodeURIComponent(value));
    search = true;
  }
  return result.replace('//', '/');
};

matchFactory.prototype.parameters = function (param) {
  if (!param) return Object.keys(this.params);
  return this.params[param] || null;
};


matchFactory.prototype.$types = {};

function Type( config ) {
	for( var i in config ) {
		this[i] = config[i];
	}
}

Type.prototype.$subPattern = function() {
  var sub = this.pattern.toString();
  return sub.substr(1, sub.length - 2);
};


module.exports = match;
},{}],10:[function(require,module,exports){
/** @jsx React.DOM */var match = require('./match');

var router = {};

router.states = {};
router.callbacks = {};
router.fallbackState = {};

router.registerCallback = function ( viewName, callback ) {
	if( !this.callbacks[viewName] ) {
		this.callbacks[viewName] = [];

	}
	this.callbacks[viewName].push( callback );

	var _this = this;
	return function () {
		var index = _this.callbacks[viewName].indexOf(callback);

		_this.callbacks[viewName].splice(index, 1);
	};
};

router.change = function ( state ) {
	var callbacks = state.target ? this.callbacks[state.target] : this.callbacks['default'];

	if( state.loadingNode ) {
		var loadingElement = document.querySelectorAll(state.loadingNode)[0];

		loadingElement.classList.add('active');
	}

	var promises = [];


	var promise;
	var data = {};
	if( state.resolve ) {
		var resolveKeys = Object.keys(state.resolve);

		var t = 0;
		var length = resolveKeys.length - 1;

		for( var i in state.resolve ) {
			var statePromise = state.resolve[i].call( this, state.params );

			promises.push( statePromise );
		}

		promise = Q.all(promises);
	} else {
		promise = Q.all([]);
	}

	promise.then( function ( data ) {
		var dataToPass = {};

		if( state.resolve ) {
			data.forEach( function ( response, index ) {
				dataToPass[ resolveKeys[index] ] = response;
			} );
		}

		if( callbacks  ) {
			callbacks.forEach( function( element ) {
				element(state, dataToPass);
			} );
		}
	} );
};

router.registerState = function ( name, config ) {
	var compiledState = match.compile( config.url );

	var newState = config;
	newState.name = name;
	newState.compiledState = compiledState;

	router.states[name] = newState;
};

router.handleState = function () {
	var changed = false;
	var states = router.states;
	var url = window.location.hash.replace('#', '');
	for( var i in states ) {
		var state = states[i];
		var check = state.compiledState.exec( url );
		state.params = check;

		if( check ) {
			changed = true;
			router.change( state );
		}
	}

	if( !changed ) {
		window.location.hash = router.fallbackState.compiledState.prefix;
	}
};

router.otherwise = function ( stateName ) {
	this.fallbackState = this.states[stateName];
};

router.linkTo = React.createClass( {displayName: 'linkTo',
	getInitialState: function () {
		var state = router.states[this.props.stateName];

		if( state ) {
			return {
				href: '#' + state.compiledState.format( this.props.params || {} )
			};
		} else {
			throw new Error('State ' + this.props.stateName + ' does not exist');
		}
	},
	render: function () {
		var href = this.state.href;

		return this.transferPropsTo(
			React.DOM.a({href: href },  this.props.children)
			);
	}
} );

router.view = React.createClass( {displayName: 'view',
	componentWillMount: function () {
		var _this = this;

		var viewName = this.props.name || 'default';

		this.setState({
			callback: router.registerCallback( viewName, function( state, data ) {
				_this.setState( {
					currentState: state,
					data: data
				});
			} )
		} );
	},
	componentWillUnmount: function () {
		this.state.callback();
	},
	componentDidUpdate: function () {
		var state = this.state.currentState;
		if( state.loadingNode ) {
			var loadingElement = document.querySelectorAll(state.loadingNode)[0];

			if( state.loadingNode && typeof state.willCloseSelf === 'undefined' ) {
				loadingElement.classList.remove('active');
			}
		}
	},
	getInitialState: function( ) {
		return {
			currentState: {
				view: null
			},
			data: {

			},
			callback: function (){}
		};
	},
	render: function () {
		var currentState = this.state.currentState;
		var data = this.state.data;

		if( !currentState.view ) {
			return null;
		}

		var key = currentState.forceRemount ? +new Date() : currentState.name;

		return currentState.view( {
			key: key,
			data: data,
			currentState: currentState
		} );
	}
} );

window.onhashchange = router.handleState;

module.exports = router;
},{"./match":9}],11:[function(require,module,exports){
module.exports = function ( type, url, params ) {
    var request = new XMLHttpRequest();
    var deferred = Q.defer();

	var str = '';
    if( params ) {
		for (var key in params) {
		    if (str != "") {
		        str += '&';
		    }
		    str += key + '=' + params[key];
		}
    }

    request.open(type, url + str, true);
    request.onload = onload;
    request.onerror = onerror;
    request.onprogress = onprogress;
    request.send();

    function onload() {
        if (request.status === 200) {
            var response;
            try {
                response = JSON.parse(request.responseText);
            } catch ( e ) {
                response = request.responseText;
            }

            deferred.resolve(response);
        } else {
            deferred.reject(new Error("Status code was " + request.status));
        }
    }

    function onerror() {
        deferred.reject(new Error("Can't XHR " + JSON.stringify(url)));
    }

    function onprogress(event) {
        deferred.notify(event.loaded / event.total);
    }

    return deferred.promise;
};
},{}],"ecar":[function(require,module,exports){
/** @jsx React.DOM */require('./router');

var index = require('./pages/index');

var element = document.querySelectorAll('.app')[0];

React.renderComponent( index(null), element );
},{"./pages/index":6,"./router":8}]},{},["ecar"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9jb21wb25lbnRzL2hlYWRlci5qc3giLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9lY2FyLXRhY3RpY2FsL3B1YmxpYy9zcmMvanMvY29tcG9uZW50cy9uYXZpZ2F0aW9uLmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9jb21wb25lbnRzL3NlYXJjaC5qc3giLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9lY2FyLXRhY3RpY2FsL3B1YmxpYy9zcmMvanMvcGFnZXMvY3JlYXRlLmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9wYWdlcy9jdXJyZW50LmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9wYWdlcy9pbmRleC5qc3giLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9lY2FyLXRhY3RpY2FsL3B1YmxpYy9zcmMvanMvcGFnZXMvc2VhcmNoLmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9yb3V0ZXIuanMiLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9lY2FyLXRhY3RpY2FsL3B1YmxpYy9zcmMvanMvcm91dGVyL21hdGNoLmpzIiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvZWNhci10YWN0aWNhbC9wdWJsaWMvc3JjL2pzL3JvdXRlci9yb3V0ZXIuanN4IiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvZWNhci10YWN0aWNhbC9wdWJsaWMvc3JjL2pzL3hoci5qcyIsIi4vcHVibGljL3NyYy9qcy9lY2FyLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovdmFyIG5hdmlnYXRpb24gPSByZXF1aXJlKCcuL25hdmlnYXRpb24nKTtcbnZhciBzZWFyY2ggPSByZXF1aXJlKCcuL3NlYXJjaCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKCB7ZGlzcGxheU5hbWU6ICdleHBvcnRzJyxcblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cblx0XHRyZXR1cm4gKFxuXHRcdCAgICBSZWFjdC5ET00uaGVhZGVyKHtjbGFzc05hbWU6IFwiaGVhZGVyXCJ9LCBcblx0XHQgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiaGVhZGVyX19maXhlZFwifSwgXG5cblx0XHQgICAgICAgIFJlYWN0LkRPTS5hKHtocmVmOiBcIi8jL1wiLCBjbGFzc05hbWU6IFwiaGVhZGVyX19sb2dvXCJ9KSwgXG5cblx0XHQgICAgICAgXHRzZWFyY2gobnVsbCksIFxuXHQgICAgICAgICAgXHRuYXZpZ2F0aW9uKG51bGwpXG5cblx0XHQgICAgICApXG5cblx0XHQgICAgKVxuXHRcdFx0KTtcblx0fVxufSApOyIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL3ZhciByb3V0ZXIgPSByZXF1aXJlKCcuLi9yb3V0ZXIvcm91dGVyJyk7XG5cbmZ1bmN0aW9uIGZpbmRDbG9zZXN0UGFyZW50KCBldmVudCwgY2xhc3NOYW1lICkge1xuXHR2YXIgcGFyZW50ID0gZXZlbnQucGFyZW50Tm9kZTtcbiAgICB3aGlsZSAocGFyZW50IT1kb2N1bWVudC5ib2R5ICYmIHBhcmVudCAhPSBudWxsKSB7XG4gICAgICBpZiAoKHBhcmVudCkgJiYgcGFyZW50LmNsYXNzTmFtZSAmJiBwYXJlbnQuY2xhc3NOYW1lLmluZGV4T2YoY2xhc3NOYW1lKSAhPSAtMSkge1xuICAgICAgICByZXR1cm4gcGFyZW50O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyZW50ID0gcGFyZW50ID8gcGFyZW50LnBhcmVudE5vZGUgOiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcygge2Rpc3BsYXlOYW1lOiAnZXhwb3J0cycsXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRvcGVuOiBmYWxzZSxcblx0XHRcdGRyb3Bkb3duSG92ZXI6IC0xXG5cdFx0fTtcblx0fSxcblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKXtcblx0ICAgICAgaWYoICFmaW5kQ2xvc2VzdFBhcmVudChlLnRhcmdldCwgJ25hdmlnYXRpb25fX2xpbmsnKSApIHtcblx0ICAgICAgICBpZiggX3RoaXMuc3RhdGUub3BlbiApIHtcblx0ICAgICAgICAgIF90aGlzLnNldFN0YXRlKHtcblx0ICAgICAgICAgIFx0b3BlbjogZmFsc2Vcblx0ICAgICAgICAgIH0pO1xuXHQgICAgICAgIH1cblx0ICAgICAgfVxuXHQgICAgfSk7XG5cdH0sXG5cdHNldEhvdmVyOiBmdW5jdGlvbiAoIGlkICkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0ZHJvcGRvd25Ib3ZlcjogaWRcblx0XHR9KTtcblx0fSxcblx0cmVtb3ZlSG92ZXI6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGRyb3Bkb3duSG92ZXI6IC0xXG5cdFx0fSk7XG5cdH0sXG5cdHRvZ2dsZURyb3Bkb3duOiBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdG9wZW46ICF0aGlzLnN0YXRlLm9wZW5cblx0XHR9KTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5cdFx0dmFyIGRyb3Bkb3duQ2xhc3MgPSBjeCh7XG5cdFx0XHQnZHJvcGRvd24nOiB0cnVlLFxuXHRcdFx0J2Ryb3Bkb3duLS1vcGVuJzogdGhpcy5zdGF0ZS5vcGVuLFxuXHRcdFx0J2Ryb3Bkb3duLS10b3AnOiB0aGlzLnN0YXRlLmRyb3Bkb3duSG92ZXIgPT09IDBcblx0XHR9KTtcblxuXHRcdHJldHVybiAoXG5cdFx0XHRSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwibmF2aWdhdGlvblwifSwgXG5cdFx0XHRcdFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcIm5hdmlnYXRpb25fX2xpc3RcIn0sIFxuXHRcdCAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcIm5hdmlnYXRpb25fX2l0ZW1cIn0sIFxuXHRcdCAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2NsYXNzTmFtZTogXCJuYXZpZ2F0aW9uX19saW5rXCIsIGhyZWY6IFwiI1wifSwgXG5cdFx0ICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiZmEgZmEtaW5mbyBmYS1mdyBuYXZpZ2F0aW9uX19pY29uIG5hdmlnYXRpb25fX2ljb24tLWluZm9cIn0pXG5cdFx0ICAgICAgICAgICAgICApXG5cdFx0ICAgICAgICAgICAgKSwgXG5cdFx0ICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6IFwibmF2aWdhdGlvbl9faXRlbSBuYXZpZ2F0aW9uX19pdGVtLS1kcm9wZG93blwifSwgXG5cdFx0ICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7XG5cdFx0ICAgICAgICAgICAgICBcdGNsYXNzTmFtZTogXCJuYXZpZ2F0aW9uX19saW5rXCIsIFxuXHRcdCAgICAgICAgICAgICAgXHRocmVmOiBcIlwiLCBcblx0XHQgICAgICAgICAgICAgIFx0b25DbGljazogIHRoaXMudG9nZ2xlRHJvcGRvd259LCBcblx0XHQgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogXCJmYSBmYS1iYXJzIGZhLWZ3IG5hdmlnYXRpb25fX2ljb24gbmF2aWdhdGlvbl9faWNvbi0tZHJvcGRvd25cIn0pXG5cdFx0ICAgICAgICAgICAgICApLCBcblxuXHRcdCAgICAgICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IGRyb3Bkb3duQ2xhc3MgfSwgXG5cdFx0ICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7XG5cdFx0ICAgICAgICAgICAgICAgIFx0Y2xhc3NOYW1lOiBcImRyb3Bkb3duX19pdGVtXCJcblx0XHQgICAgICAgICAgICAgICAgXHR9LCBcblx0XHQgICAgICAgICAgICAgICAgICByb3V0ZXIubGlua1RvKHtcblx0XHQgICAgICAgICAgICAgICAgICBcdHN0YXRlTmFtZTogXCJjcmVhdGVcIiwgXG5cdFx0ICAgICAgICAgICAgICAgICAgXHRjbGFzc05hbWU6IFwiZHJvcGRvd25fX2xpbmtcIiwgXG5cdFx0ICAgICAgICAgICAgICAgICAgXHRvbk1vdXNlT3ZlcjogIHRoaXMuc2V0SG92ZXIuYmluZCh0aGlzLCAwKSwgXG5cdFx0ICAgICAgICAgICAgICAgICAgXHRvbk1vdXNlT3V0OiAgdGhpcy5yZW1vdmVIb3Zlcn0sIFxuXHRcdCAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogXCJmYSBmYS1wbHVzIGZhLWZ3IGRyb3Bkb3duX19pY29uXCJ9KSwgXG5cblx0XHQgICAgICAgICAgICAgICAgICAgIFwiQ3JlYXRlIGVDYXJcIlxuXHRcdCAgICAgICAgICAgICAgICAgIClcblx0XHQgICAgICAgICAgICAgICAgKSwgXG5cdFx0ICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcImRyb3Bkb3duX19pdGVtXCJ9LCBcblx0XHQgICAgICAgICAgICAgICAgICByb3V0ZXIubGlua1RvKHtcblx0XHQgICAgICAgICAgICAgICAgICBcdHN0YXRlTmFtZTogXCJjdXJyZW50XCIsIFxuXHRcdCAgICAgICAgICAgICAgICAgIFx0aHJlZjogXCIjXCIsIGNsYXNzTmFtZTogXCJkcm9wZG93bl9fbGlua1wifSwgXG5cdFx0ICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uaSh7Y2xhc3NOYW1lOiBcImZhIGZhLWxpc3QgZmEtZncgZHJvcGRvd25fX2ljb25cIn0pLCBcblxuXHRcdCAgICAgICAgICAgICAgICAgICAgXCJDdXJyZW50IGVDYXJzXCJcblx0XHQgICAgICAgICAgICAgICAgICApXG5cdFx0ICAgICAgICAgICAgICAgICksIFxuXHRcdCAgICAgICAgICAgICAgICBSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogXCJkcm9wZG93bl9faXRlbVwifSwgXG5cdFx0ICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmEoe2hyZWY6IFwiI1wiLCBjbGFzc05hbWU6IFwiZHJvcGRvd25fX2xpbmtcIn0sIFxuXHRcdCAgICAgICAgICAgICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogXCJmYSBmYS1wYXBlcmNsaXAgZmEtZncgZHJvcGRvd25fX2ljb25cIn0pLCBcblxuXHRcdCAgICAgICAgICAgICAgICAgICAgXCJSZXBvcnRpbmdcIlxuXHRcdCAgICAgICAgICAgICAgICAgIClcblx0XHQgICAgICAgICAgICAgICAgKSwgXG5cdFx0ICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcImRyb3Bkb3duX19pdGVtXCJ9LCBcblx0XHQgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uYSh7aHJlZjogXCIjXCIsIGNsYXNzTmFtZTogXCJkcm9wZG93bl9fbGlua1wifSwgXG5cdFx0ICAgICAgICAgICAgICAgICAgICBSZWFjdC5ET00uaSh7Y2xhc3NOYW1lOiBcImZhIGZhLWNvZyBmYS1mdyBkcm9wZG93bl9faWNvblwifSksIFxuXG5cdFx0ICAgICAgICAgICAgICAgICAgICBcIkFkbWluaXN0cmF0aW9uXCJcblx0XHQgICAgICAgICAgICAgICAgICApXG5cdFx0ICAgICAgICAgICAgICAgIClcblx0XHQgICAgICAgICAgICAgIClcblx0XHQgICAgICAgICAgICApXG5cdCAgICAgICAgIFx0IClcbiAgICAgICAgIFx0IClcblx0XHRcdCk7XG5cdH1cbn0gKTsiLCIvKiogQGpzeCBSZWFjdC5ET00gKi92YXIgU2VhcmNoID0gUmVhY3QuY3JlYXRlQ2xhc3MoIHtkaXNwbGF5TmFtZTogJ1NlYXJjaCcsXG5cdGhhbmRsZVNlYXJjaDogZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHRpZiggZXZlbnQua2V5Q29kZSA9PT0gMTMgKSB7XG5cdFx0XHR3aW5kb3cubG9jYXRpb24gPSAnLyMvc2VhcmNoLycgKyBldmVudC50YXJnZXQudmFsdWUuc3BsaXQoJyAnKS5qb2luKCcrJyk7XG5cdFx0fVxuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdCAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwic2VhcmNoXCJ9LCBcblx0XHQgICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogXCJmYSBmYS1zZWFyY2ggc2VhcmNoX19pY29uXCJ9KSwgXG5cblx0ICAgICAgICAgIFJlYWN0LkRPTS5pbnB1dCh7XG5cdCAgICAgICAgICBcdHR5cGU6IFwidGV4dFwiLCBcblx0ICAgICAgICAgIFx0cGxhY2Vob2xkZXI6IFwiU2VhcmNoIGVDYXJzXCIsIFxuXHQgICAgICAgICAgXHRjbGFzc05hbWU6IFwic2VhcmNoX19ib3hcIiwgXG5cdCAgICAgICAgICBcdG9uS2V5RG93bjogIHRoaXMuaGFuZGxlU2VhcmNofSksIFxuXG5cdCAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInNlYXJjaF9fdGlwXCJ9LCBcblx0ICAgICAgICAgICAgXCJQcmVzcyBcIiwgUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogXCJzZWFyY2hfX3RpcC0tYnV0dG9uXCJ9LCBcIkVudGVyXCIpLCBcIiB0byBzZWFyY2hcIlxuXHQgICAgICAgICAgKVxuXHQgICAgICAgIClcblxuXHRcdFx0KTtcblx0fVxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlYXJjaDsiLCIvKiogQGpzeCBSZWFjdC5ET00gKi9tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ2V4cG9ydHMnLFxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0UmVhY3QuRE9NLmRpdihudWxsLCBcblx0XHRcdFx0XCJjb2FzZHNhc2RzZHNkc1wiXG5cdFx0XHQpXG5cdFx0XHQpO1xuXHR9XG59KTsiLCIvKiogQGpzeCBSZWFjdC5ET00gKi9tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ2V4cG9ydHMnLFxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0UmVhY3QuRE9NLmRpdihudWxsLCBcblx0XHRcdFx0XCJjb2FzZHNcIlxuXHRcdFx0KVxuXHRcdFx0KTtcblx0fVxufSk7IiwiLyoqIEBqc3ggUmVhY3QuRE9NICovdmFyIHJvdXRlciA9IHJlcXVpcmUoJy4uL3JvdXRlci9yb3V0ZXInKTtcblxudmFyIHBhZ2VIZWFkZXIgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL2hlYWRlcicpO1xuXG52YXIgbG9hZGluZ0VsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubG9hZGluZycpWzBdO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ2V4cG9ydHMnLFxuXHRjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuXHRcdGxvYWRpbmdFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuXG5cdFx0cm91dGVyLmhhbmRsZVN0YXRlKCk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHRSZWFjdC5ET00uZGl2KG51bGwsIFxuXHRcdFx0XHRwYWdlSGVhZGVyKG51bGwpLCBcblxuXHRcdFx0XHRyb3V0ZXIudmlldyhudWxsKVxuXHRcdFx0KVxuXHRcdFx0KTtcblx0fVxufSk7IiwiLyoqIEBqc3ggUmVhY3QuRE9NICovdmFyIHhociA9IHJlcXVpcmUoJy4uL3hocicpO1xuXG52YXIgbG9hZGluZ0VsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubG9hZGluZycpWzBdO1xuXG52YXIgU2VhcmNoID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnU2VhcmNoJyxcblx0Y29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiAoKSB7XG5cdFx0bG9hZGluZ0VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXHRcdGNvbnNvbGUubG9nKHRoaXMucHJvcHMpO1xuXHRcdHZhciB0ZXN0ID0gW107XG5cdFx0Zm9yKCB2YXIgaSA9IDA7IGkgPCAyOyBpKysgKSB7XG5cdFx0XHR0ZXN0LnB1c2goUmVhY3QuRE9NLmRpdihudWxsLCBcImhlbGxvXCIpKTtcblx0XHR9XG5cdFx0cmV0dXJuIChcblx0XHRcdFJlYWN0LkRPTS5kaXYobnVsbCwgXG5cdFx0XHRcdHRlc3QgXG5cdFx0XHQpXG5cdFx0XHQpO1xuXHR9XG59KTtcblxuXG5TZWFyY2gucmVzb2x2ZSA9IHtcblx0J3Rlc3QnOiBmdW5jdGlvbiggcGFyYW1zICkge1xuXHRcdHJldHVybiB4aHIoJ0dFVCcsICcvcmVzdC90ZXN0Jyk7XG5cdH0sXG5cdCd0ZXN0Mic6IGZ1bmN0aW9uKCBwYXJhbXMgKSB7XG5cdFx0cmV0dXJuIHhocignR0VUJywgJy9yZXN0L3Rlc3QyJyk7XG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2VhcmNoOyIsInZhciByb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlci9yb3V0ZXInKTtcblxudmFyIGNyZWF0ZSA9IHJlcXVpcmUoJy4vcGFnZXMvY3JlYXRlJyk7XG52YXIgY3VycmVudCA9IHJlcXVpcmUoJy4vcGFnZXMvY3VycmVudCcpO1xudmFyIHNlYXJjaCA9IHJlcXVpcmUoJy4vcGFnZXMvc2VhcmNoJyk7XG5cbnJvdXRlci5yZWdpc3RlclN0YXRlKCdjcmVhdGUnLCB7XG5cdHVybDogJy9jcmVhdGUnLFxuXHR2aWV3OiBjcmVhdGVcbn0pO1xuXG5yb3V0ZXIucmVnaXN0ZXJTdGF0ZSgnY3VycmVudCcsIHtcblx0dXJsOiAnL2N1cnJlbnQnLFxuXHR2aWV3OiBjdXJyZW50XG59KTtcblxucm91dGVyLnJlZ2lzdGVyU3RhdGUoJ3NlYXJjaCcsIHtcblx0dXJsOiAnL3NlYXJjaC86cXVlcnknLFxuXHRvcHRpb25hbFBhcmFtczogWydxdWVyeSddLFxuXHR2aWV3OiBzZWFyY2gsXG5cdHJlc29sdmU6IHNlYXJjaC5yZXNvbHZlLFxuXHRsb2FkaW5nTm9kZTogJy5sb2FkaW5nJyxcbn0pO1xuXG5yb3V0ZXIub3RoZXJ3aXNlKCdjdXJyZW50Jyk7IiwidmFyIG1hdGNoID0ge307XG5cbm1hdGNoLmNvbXBpbGUgPSBmdW5jdGlvbiAoIHVybCApIHtcblx0cmV0dXJuIG5ldyBtYXRjaEZhY3RvcnkoIHVybCApO1xufTtcblxudmFyIG1hdGNoRmFjdG9yeSA9IGZ1bmN0aW9uICggdXJsLCBjb25maWcgKSB7XG5cdCB2YXIgcGxhY2Vob2xkZXIgPSAvKFs6Kl0pKFxcdyspfFxceyhcXHcrKSg/OlxcOigoPzpbXnt9XFxcXF0rfFxcXFwufFxceyg/Oltee31cXFxcXSt8XFxcXC4pKlxcfSkrKSk/XFx9L2c7XG5cblx0Y29uZmlnID0gY29uZmlnIHx8IHt9O1xuXG4gICAgdmFyIGNvbXBpbGVkID0gJ14nO1xuICAgIHZhciBsYXN0ID0gMDtcbiAgICB2YXIgbTtcblxuICAgIHZhciBzZWdtZW50cyA9IHRoaXMuc2VnbWVudHMgPSBbXTtcbiAgICB2YXIgcGFyYW1zID0gdGhpcy5wYXJhbXMgPSB7fTtcblxuICAgIHZhciBpZCwgcmVnZXhwLCBzZWdtZW50LCB0eXBlLCBjZmc7XG5cbiAgICB2YXIgcGF0dGVybiA9IHVybDtcbiAgICBmdW5jdGlvbiBleHRlbmQoIHRhcmdldCwgZGVzdCApIHtcbiAgICBcdGNvbnNvbGUubG9nKHRhcmdldCxkZXN0KTtcbiAgICBcdGZvciggdmFyIGkgaW4gZGVzdCApIHtcbiAgICBcdFx0dGFyZ2V0W2ldID0gZGVzdFtpXTtcbiAgICBcdH1cblxuICAgIFx0cmV0dXJuIHRhcmdldDtcbiAgICB9XG5cbiAgZnVuY3Rpb24gYWRkUGFyYW1ldGVyKGlkLCB0eXBlLCBjb25maWcpIHtcbiAgICBpZiAoIS9eXFx3KygtK1xcdyspKiQvLnRlc3QoaWQpKSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHBhcmFtZXRlciBuYW1lICdcIiArIGlkICsgXCInIGluIHBhdHRlcm4gJ1wiICsgcGF0dGVybiArIFwiJ1wiKTtcbiAgICBpZiAocGFyYW1zW2lkXSkgdGhyb3cgbmV3IEVycm9yKFwiRHVwbGljYXRlIHBhcmFtZXRlciBuYW1lICdcIiArIGlkICsgXCInIGluIHBhdHRlcm4gJ1wiICsgcGF0dGVybiArIFwiJ1wiKTtcblxuICAgIHBhcmFtc1tpZF0gPSBleHRlbmQoeyB0eXBlOiB0eXBlIHx8IG5ldyBUeXBlKCksICR2YWx1ZTogZnVuY3Rpb24odGVzdCl7cmV0dXJuIHRlc3Q7fSB9LCBjb25maWcpO1xuICB9XG4gIGZ1bmN0aW9uICR2YWx1ZSh2YWx1ZSkge1xuICAgIC8qanNoaW50IHZhbGlkdGhpczogdHJ1ZSAqL1xuICAgIHJldHVybiB2YWx1ZSA/IHRoaXMudHlwZS5kZWNvZGUodmFsdWUpIDogJFVybE1hdGNoZXJGYWN0b3J5LiQkZ2V0RGVmYXVsdFZhbHVlKHRoaXMpO1xuICB9XG5cbiAgICBmdW5jdGlvbiBxdW90ZVJlZ0V4cChzdHJpbmcsIHBhdHRlcm4sIGlzT3B0aW9uYWwpIHtcblx0ICAgIHZhciByZXN1bHQgPSBzdHJpbmcucmVwbGFjZSgvW1xcXFxcXFtcXF1cXF4kKis/LigpfHt9XS9nLCBcIlxcXFwkJlwiKTtcblx0IFx0aWYgKCFwYXR0ZXJuKSByZXR1cm4gcmVzdWx0O1xuXHQgXHR2YXIgZmxhZyA9IGlzT3B0aW9uYWwgPyAnPycgOiAnJztcblx0XHRyZXR1cm4gcmVzdWx0ICsgZmxhZyArICcoJyArIHBhdHRlcm4gKyAnKScgKyBmbGFnO1xuXHR9XG5cblx0ICBmdW5jdGlvbiBwYXJhbUNvbmZpZyhwYXJhbSkge1xuICAgIGlmICghY29uZmlnLnBhcmFtcyB8fCAhY29uZmlnLnBhcmFtc1twYXJhbV0pIHJldHVybiB7fTtcbiAgICB2YXIgY2ZnID0gY29uZmlnLnBhcmFtc1twYXJhbV07XG4gICAgcmV0dXJuIHR5cGVvZiBjZmcgPT09ICdvYmplY3QnID8gY2ZnIDogeyB2YWx1ZTogY2ZnIH07XG4gIH1cblxuICBcdHdoaWxlICgobSA9IHBsYWNlaG9sZGVyLmV4ZWMocGF0dGVybikpKSB7XG5cblx0ICAgIGlkICAgICAgPSBtWzJdIHx8IG1bM107IC8vIElFWzc4XSByZXR1cm5zICcnIGZvciB1bm1hdGNoZWQgZ3JvdXBzIGluc3RlYWQgb2YgbnVsbFxuXHQgICAgcmVnZXhwICA9IG1bNF0gfHwgKG1bMV0gPT0gJyonID8gJy4qJyA6ICdbXi9dKicpO1xuXHQgICAgc2VnbWVudCA9IHBhdHRlcm4uc3Vic3RyaW5nKGxhc3QsIG0uaW5kZXgpO1xuXHQgICAgdHlwZSAgICA9IHRoaXMuJHR5cGVzW3JlZ2V4cF0gfHwgbmV3IFR5cGUoeyBwYXR0ZXJuOiBuZXcgUmVnRXhwKHJlZ2V4cCkgfSk7XG5cdCAgICBjZmcgICAgID0gcGFyYW1Db25maWcoaWQpO1xuXG5cdCAgICBpZiAoc2VnbWVudC5pbmRleE9mKCc/JykgPj0gMCkgYnJlYWs7IC8vIHdlJ3JlIGludG8gdGhlIHNlYXJjaCBwYXJ0XG5cblx0ICAgIGNvbXBpbGVkICs9IHF1b3RlUmVnRXhwKHNlZ21lbnQsIHR5cGUuJHN1YlBhdHRlcm4oKSwgY2ZnICYmIGNmZy52YWx1ZSk7XG5cblx0ICAgIGFkZFBhcmFtZXRlcihpZCwgdHlwZSwgY2ZnKTtcblx0ICBcdHNlZ21lbnRzLnB1c2goc2VnbWVudCk7XG5cdCAgICBsYXN0ID0gcGxhY2Vob2xkZXIubGFzdEluZGV4O1xuXHR9XG5cdHNlZ21lbnQgPSBwYXR0ZXJuLnN1YnN0cmluZyhsYXN0KTtcblxuXHR2YXIgaSA9IHNlZ21lbnQuaW5kZXhPZignPycpO1xuXG5cdGlmIChpID49IDApIHtcblx0ICAgIHZhciBzZWFyY2ggPSB0aGlzLnNvdXJjZVNlYXJjaCA9IHNlZ21lbnQuc3Vic3RyaW5nKGkpO1xuXHQgICAgc2VnbWVudCA9IHNlZ21lbnQuc3Vic3RyaW5nKDAsIGkpO1xuXHQgICAgdGhpcy5zb3VyY2VQYXRoID0gcGF0dGVybi5zdWJzdHJpbmcoMCwgbGFzdCArIGkpO1xuXG5cdCAgICAvLyBBbGxvdyBwYXJhbWV0ZXJzIHRvIGJlIHNlcGFyYXRlZCBieSAnPycgYXMgd2VsbCBhcyAnJicgdG8gbWFrZSBjb25jYXQoKSBlYXNpZXJcblx0ICAgIHNlYXJjaC5zdWJzdHJpbmcoMSkuc3BsaXQoL1smP10vKS5mb3JFYWNoKCBmdW5jdGlvbihrZXkpIHtcblx0ICAgICAgLy9hZGRQYXJhbWV0ZXIoa2V5LCBudWxsLCBwYXJhbUNvbmZpZyhrZXkpKTtcblx0ICAgIH0pO1xuXHR9IGVsc2Uge1xuXHQgICAgdGhpcy5zb3VyY2VQYXRoID0gcGF0dGVybjtcblx0XHR0aGlzLnNvdXJjZVNlYXJjaCA9ICcnO1xuXHR9XG5cblx0Y29tcGlsZWQgKz0gcXVvdGVSZWdFeHAoc2VnbWVudCkgKyAoY29uZmlnLnN0cmljdCA9PT0gZmFsc2UgPyAnXFwvPycgOiAnJykgKyAnJCc7XG5cdHNlZ21lbnRzLnB1c2goc2VnbWVudCk7XG5cblx0dGhpcy5yZWdleHAgPSBuZXcgUmVnRXhwKGNvbXBpbGVkLCBjb25maWcuY2FzZUluc2Vuc2l0aXZlID8gJ2knIDogdW5kZWZpbmVkKTtcblx0dGhpcy5wcmVmaXggPSBzZWdtZW50c1swXTtcbn07XG5cbm1hdGNoRmFjdG9yeS5wcm90b3R5cGUuZXhlYyA9IGZ1bmN0aW9uIChwYXRoLCBzZWFyY2hQYXJhbXMpIHtcbiAgdmFyIG0gPSB0aGlzLnJlZ2V4cC5leGVjKHBhdGgpO1xuICBpZiAoIW0pIHJldHVybiBudWxsO1xuICBzZWFyY2hQYXJhbXMgPSBzZWFyY2hQYXJhbXMgfHwge307XG5cbiAgdmFyIHBhcmFtcyA9IHRoaXMucGFyYW1ldGVycygpLCBuVG90YWwgPSBwYXJhbXMubGVuZ3RoLFxuICAgIG5QYXRoID0gdGhpcy5zZWdtZW50cy5sZW5ndGggLSAxLFxuICAgIHZhbHVlcyA9IHt9LCBpLCBjZmcsIHBhcmFtO1xuXG4gIGlmIChuUGF0aCAhPT0gbS5sZW5ndGggLSAxKSB0aHJvdyBuZXcgRXJyb3IoXCJVbmJhbGFuY2VkIGNhcHR1cmUgZ3JvdXAgaW4gcm91dGUgJ1wiICsgdGhpcy5zb3VyY2UgKyBcIidcIik7XG5cbiAgZm9yIChpID0gMDsgaSA8IG5QYXRoOyBpKyspIHtcbiAgICBwYXJhbSA9IHBhcmFtc1tpXTtcbiAgICBjZmcgPSB0aGlzLnBhcmFtc1twYXJhbV07XG4gICAgY29uc29sZS5sb2codGhpcy5wYXJhbXMpO1xuICAgIHZhbHVlc1twYXJhbV0gPSBjZmcuJHZhbHVlKG1baSArIDFdKTtcbiAgfVxuICBmb3IgKC8qKi87IGkgPCBuVG90YWw7IGkrKykge1xuICAgIHBhcmFtID0gcGFyYW1zW2ldO1xuICAgIGNmZyA9IHRoaXMucGFyYW1zW3BhcmFtXTtcbiAgICB2YWx1ZXNbcGFyYW1dID0gY2ZnLiR2YWx1ZShzZWFyY2hQYXJhbXNbcGFyYW1dKTtcbiAgfVxuXG4gIHJldHVybiB2YWx1ZXM7XG59O1xuXG5tYXRjaEZhY3RvcnkucHJvdG90eXBlLnZhbGlkYXRlcyA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgdmFyIHJlc3VsdCA9IHRydWUsIGlzT3B0aW9uYWwsIGNmZywgc2VsZiA9IHRoaXM7XG5cbiAgZm9yKCB2YXIga2V5IGluIHBhcmFtcyApIHtcbiAgXHR2YXIgdmFsID0gcGFyYW1zW2tleV07XG4gICAgaWYgKCFzZWxmLnBhcmFtc1trZXldKSByZXR1cm47XG4gICAgY2ZnID0gc2VsZi5wYXJhbXNba2V5XTtcbiAgICBpc09wdGlvbmFsID0gIXZhbCAmJiBjZmcgJiYgY2ZnLnZhbHVlO1xuICAgIHJlc3VsdCA9IHJlc3VsdDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxubWF0Y2hGYWN0b3J5LnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gIHZhciBzZWdtZW50cyA9IHRoaXMuc2VnbWVudHMsIHBhcmFtcyA9IHRoaXMucGFyYW1ldGVycygpO1xuXG4gIGlmICghdmFsdWVzKSByZXR1cm4gc2VnbWVudHMuam9pbignJykucmVwbGFjZSgnLy8nLCAnLycpO1xuXG4gIHZhciBuUGF0aCA9IHNlZ21lbnRzLmxlbmd0aCAtIDEsIG5Ub3RhbCA9IHBhcmFtcy5sZW5ndGgsXG4gICAgcmVzdWx0ID0gc2VnbWVudHNbMF0sIGksIHNlYXJjaCwgdmFsdWUsIHBhcmFtLCBjZmcsIGFycmF5O1xuXG4gIGlmICghdGhpcy52YWxpZGF0ZXModmFsdWVzKSkgcmV0dXJuICcnO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBuUGF0aDsgaSsrKSB7XG4gICAgcGFyYW0gPSBwYXJhbXNbaV07XG4gICAgdmFsdWUgPSB2YWx1ZXNbcGFyYW1dO1xuICAgIGNmZyAgID0gdGhpcy5wYXJhbXNbcGFyYW1dO1xuXG4gICAgaWYgKCF2YWx1ZSAmJiAoc2VnbWVudHNbaV0gPT09ICcvJyAmJiBzZWdtZW50c1tpICsgMV0gPT09ICcvJykpIGNvbnRpbnVlO1xuICAgIGlmICh2YWx1ZSAhPSBudWxsKSByZXN1bHQgKz0gZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcbiAgICByZXN1bHQgKz0gc2VnbWVudHNbaSArIDFdO1xuICB9XG5cbiAgZm9yICgvKiovOyBpIDwgblRvdGFsOyBpKyspIHtcbiAgICBwYXJhbSA9IHBhcmFtc1tpXTtcbiAgICB2YWx1ZSA9IHZhbHVlc1twYXJhbV07XG4gICAgaWYgKHZhbHVlID09IG51bGwpIGNvbnRpbnVlO1xuICAgIGFycmF5ID0gdHlwZW9mIHZhbHVlID09PSAnYXJyYXknO1xuXG4gICAgaWYgKGFycmF5KSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlLm1hcChlbmNvZGVVUklDb21wb25lbnQpLmpvaW4oJyYnICsgcGFyYW0gKyAnPScpO1xuICAgIH1cbiAgICByZXN1bHQgKz0gKHNlYXJjaCA/ICcmJyA6ICc/JykgKyBwYXJhbSArICc9JyArIChhcnJheSA/IHZhbHVlIDogZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG4gICAgc2VhcmNoID0gdHJ1ZTtcbiAgfVxuICByZXR1cm4gcmVzdWx0LnJlcGxhY2UoJy8vJywgJy8nKTtcbn07XG5cbm1hdGNoRmFjdG9yeS5wcm90b3R5cGUucGFyYW1ldGVycyA9IGZ1bmN0aW9uIChwYXJhbSkge1xuICBpZiAoIXBhcmFtKSByZXR1cm4gT2JqZWN0LmtleXModGhpcy5wYXJhbXMpO1xuICByZXR1cm4gdGhpcy5wYXJhbXNbcGFyYW1dIHx8IG51bGw7XG59O1xuXG5cbm1hdGNoRmFjdG9yeS5wcm90b3R5cGUuJHR5cGVzID0ge307XG5cbmZ1bmN0aW9uIFR5cGUoIGNvbmZpZyApIHtcblx0Zm9yKCB2YXIgaSBpbiBjb25maWcgKSB7XG5cdFx0dGhpc1tpXSA9IGNvbmZpZ1tpXTtcblx0fVxufVxuXG5UeXBlLnByb3RvdHlwZS4kc3ViUGF0dGVybiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc3ViID0gdGhpcy5wYXR0ZXJuLnRvU3RyaW5nKCk7XG4gIHJldHVybiBzdWIuc3Vic3RyKDEsIHN1Yi5sZW5ndGggLSAyKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBtYXRjaDsiLCIvKiogQGpzeCBSZWFjdC5ET00gKi92YXIgbWF0Y2ggPSByZXF1aXJlKCcuL21hdGNoJyk7XG5cbnZhciByb3V0ZXIgPSB7fTtcblxucm91dGVyLnN0YXRlcyA9IHt9O1xucm91dGVyLmNhbGxiYWNrcyA9IHt9O1xucm91dGVyLmZhbGxiYWNrU3RhdGUgPSB7fTtcblxucm91dGVyLnJlZ2lzdGVyQ2FsbGJhY2sgPSBmdW5jdGlvbiAoIHZpZXdOYW1lLCBjYWxsYmFjayApIHtcblx0aWYoICF0aGlzLmNhbGxiYWNrc1t2aWV3TmFtZV0gKSB7XG5cdFx0dGhpcy5jYWxsYmFja3Nbdmlld05hbWVdID0gW107XG5cblx0fVxuXHR0aGlzLmNhbGxiYWNrc1t2aWV3TmFtZV0ucHVzaCggY2FsbGJhY2sgKTtcblxuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdHZhciBpbmRleCA9IF90aGlzLmNhbGxiYWNrc1t2aWV3TmFtZV0uaW5kZXhPZihjYWxsYmFjayk7XG5cblx0XHRfdGhpcy5jYWxsYmFja3Nbdmlld05hbWVdLnNwbGljZShpbmRleCwgMSk7XG5cdH07XG59O1xuXG5yb3V0ZXIuY2hhbmdlID0gZnVuY3Rpb24gKCBzdGF0ZSApIHtcblx0dmFyIGNhbGxiYWNrcyA9IHN0YXRlLnRhcmdldCA/IHRoaXMuY2FsbGJhY2tzW3N0YXRlLnRhcmdldF0gOiB0aGlzLmNhbGxiYWNrc1snZGVmYXVsdCddO1xuXG5cdGlmKCBzdGF0ZS5sb2FkaW5nTm9kZSApIHtcblx0XHR2YXIgbG9hZGluZ0VsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHN0YXRlLmxvYWRpbmdOb2RlKVswXTtcblxuXHRcdGxvYWRpbmdFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXHR9XG5cblx0dmFyIHByb21pc2VzID0gW107XG5cblxuXHR2YXIgcHJvbWlzZTtcblx0dmFyIGRhdGEgPSB7fTtcblx0aWYoIHN0YXRlLnJlc29sdmUgKSB7XG5cdFx0dmFyIHJlc29sdmVLZXlzID0gT2JqZWN0LmtleXMoc3RhdGUucmVzb2x2ZSk7XG5cblx0XHR2YXIgdCA9IDA7XG5cdFx0dmFyIGxlbmd0aCA9IHJlc29sdmVLZXlzLmxlbmd0aCAtIDE7XG5cblx0XHRmb3IoIHZhciBpIGluIHN0YXRlLnJlc29sdmUgKSB7XG5cdFx0XHR2YXIgc3RhdGVQcm9taXNlID0gc3RhdGUucmVzb2x2ZVtpXS5jYWxsKCB0aGlzLCBzdGF0ZS5wYXJhbXMgKTtcblxuXHRcdFx0cHJvbWlzZXMucHVzaCggc3RhdGVQcm9taXNlICk7XG5cdFx0fVxuXG5cdFx0cHJvbWlzZSA9IFEuYWxsKHByb21pc2VzKTtcblx0fSBlbHNlIHtcblx0XHRwcm9taXNlID0gUS5hbGwoW10pO1xuXHR9XG5cblx0cHJvbWlzZS50aGVuKCBmdW5jdGlvbiAoIGRhdGEgKSB7XG5cdFx0dmFyIGRhdGFUb1Bhc3MgPSB7fTtcblxuXHRcdGlmKCBzdGF0ZS5yZXNvbHZlICkge1xuXHRcdFx0ZGF0YS5mb3JFYWNoKCBmdW5jdGlvbiAoIHJlc3BvbnNlLCBpbmRleCApIHtcblx0XHRcdFx0ZGF0YVRvUGFzc1sgcmVzb2x2ZUtleXNbaW5kZXhdIF0gPSByZXNwb25zZTtcblx0XHRcdH0gKTtcblx0XHR9XG5cblx0XHRpZiggY2FsbGJhY2tzICApIHtcblx0XHRcdGNhbGxiYWNrcy5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbWVudCApIHtcblx0XHRcdFx0ZWxlbWVudChzdGF0ZSwgZGF0YVRvUGFzcyk7XG5cdFx0XHR9ICk7XG5cdFx0fVxuXHR9ICk7XG59O1xuXG5yb3V0ZXIucmVnaXN0ZXJTdGF0ZSA9IGZ1bmN0aW9uICggbmFtZSwgY29uZmlnICkge1xuXHR2YXIgY29tcGlsZWRTdGF0ZSA9IG1hdGNoLmNvbXBpbGUoIGNvbmZpZy51cmwgKTtcblxuXHR2YXIgbmV3U3RhdGUgPSBjb25maWc7XG5cdG5ld1N0YXRlLm5hbWUgPSBuYW1lO1xuXHRuZXdTdGF0ZS5jb21waWxlZFN0YXRlID0gY29tcGlsZWRTdGF0ZTtcblxuXHRyb3V0ZXIuc3RhdGVzW25hbWVdID0gbmV3U3RhdGU7XG59O1xuXG5yb3V0ZXIuaGFuZGxlU3RhdGUgPSBmdW5jdGlvbiAoKSB7XG5cdHZhciBjaGFuZ2VkID0gZmFsc2U7XG5cdHZhciBzdGF0ZXMgPSByb3V0ZXIuc3RhdGVzO1xuXHR2YXIgdXJsID0gd2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsICcnKTtcblx0Zm9yKCB2YXIgaSBpbiBzdGF0ZXMgKSB7XG5cdFx0dmFyIHN0YXRlID0gc3RhdGVzW2ldO1xuXHRcdHZhciBjaGVjayA9IHN0YXRlLmNvbXBpbGVkU3RhdGUuZXhlYyggdXJsICk7XG5cdFx0c3RhdGUucGFyYW1zID0gY2hlY2s7XG5cblx0XHRpZiggY2hlY2sgKSB7XG5cdFx0XHRjaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdHJvdXRlci5jaGFuZ2UoIHN0YXRlICk7XG5cdFx0fVxuXHR9XG5cblx0aWYoICFjaGFuZ2VkICkge1xuXHRcdHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gcm91dGVyLmZhbGxiYWNrU3RhdGUuY29tcGlsZWRTdGF0ZS5wcmVmaXg7XG5cdH1cbn07XG5cbnJvdXRlci5vdGhlcndpc2UgPSBmdW5jdGlvbiAoIHN0YXRlTmFtZSApIHtcblx0dGhpcy5mYWxsYmFja1N0YXRlID0gdGhpcy5zdGF0ZXNbc3RhdGVOYW1lXTtcbn07XG5cbnJvdXRlci5saW5rVG8gPSBSZWFjdC5jcmVhdGVDbGFzcygge2Rpc3BsYXlOYW1lOiAnbGlua1RvJyxcblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIHN0YXRlID0gcm91dGVyLnN0YXRlc1t0aGlzLnByb3BzLnN0YXRlTmFtZV07XG5cblx0XHRpZiggc3RhdGUgKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRocmVmOiAnIycgKyBzdGF0ZS5jb21waWxlZFN0YXRlLmZvcm1hdCggdGhpcy5wcm9wcy5wYXJhbXMgfHwge30gKVxuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdTdGF0ZSAnICsgdGhpcy5wcm9wcy5zdGF0ZU5hbWUgKyAnIGRvZXMgbm90IGV4aXN0Jyk7XG5cdFx0fVxuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgaHJlZiA9IHRoaXMuc3RhdGUuaHJlZjtcblxuXHRcdHJldHVybiB0aGlzLnRyYW5zZmVyUHJvcHNUbyhcblx0XHRcdFJlYWN0LkRPTS5hKHtocmVmOiBocmVmIH0sICB0aGlzLnByb3BzLmNoaWxkcmVuKVxuXHRcdFx0KTtcblx0fVxufSApO1xuXG5yb3V0ZXIudmlldyA9IFJlYWN0LmNyZWF0ZUNsYXNzKCB7ZGlzcGxheU5hbWU6ICd2aWV3Jyxcblx0Y29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIF90aGlzID0gdGhpcztcblxuXHRcdHZhciB2aWV3TmFtZSA9IHRoaXMucHJvcHMubmFtZSB8fCAnZGVmYXVsdCc7XG5cblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGNhbGxiYWNrOiByb3V0ZXIucmVnaXN0ZXJDYWxsYmFjayggdmlld05hbWUsIGZ1bmN0aW9uKCBzdGF0ZSwgZGF0YSApIHtcblx0XHRcdFx0X3RoaXMuc2V0U3RhdGUoIHtcblx0XHRcdFx0XHRjdXJyZW50U3RhdGU6IHN0YXRlLFxuXHRcdFx0XHRcdGRhdGE6IGRhdGFcblx0XHRcdFx0fSk7XG5cdFx0XHR9IClcblx0XHR9ICk7XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5zdGF0ZS5jYWxsYmFjaygpO1xuXHR9LFxuXHRjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgc3RhdGUgPSB0aGlzLnN0YXRlLmN1cnJlbnRTdGF0ZTtcblx0XHRpZiggc3RhdGUubG9hZGluZ05vZGUgKSB7XG5cdFx0XHR2YXIgbG9hZGluZ0VsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHN0YXRlLmxvYWRpbmdOb2RlKVswXTtcblxuXHRcdFx0aWYoIHN0YXRlLmxvYWRpbmdOb2RlICYmIHR5cGVvZiBzdGF0ZS53aWxsQ2xvc2VTZWxmID09PSAndW5kZWZpbmVkJyApIHtcblx0XHRcdFx0bG9hZGluZ0VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCApIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Y3VycmVudFN0YXRlOiB7XG5cdFx0XHRcdHZpZXc6IG51bGxcblx0XHRcdH0sXG5cdFx0XHRkYXRhOiB7XG5cblx0XHRcdH0sXG5cdFx0XHRjYWxsYmFjazogZnVuY3Rpb24gKCl7fVxuXHRcdH07XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBjdXJyZW50U3RhdGUgPSB0aGlzLnN0YXRlLmN1cnJlbnRTdGF0ZTtcblx0XHR2YXIgZGF0YSA9IHRoaXMuc3RhdGUuZGF0YTtcblxuXHRcdGlmKCAhY3VycmVudFN0YXRlLnZpZXcgKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHR2YXIga2V5ID0gY3VycmVudFN0YXRlLmZvcmNlUmVtb3VudCA/ICtuZXcgRGF0ZSgpIDogY3VycmVudFN0YXRlLm5hbWU7XG5cblx0XHRyZXR1cm4gY3VycmVudFN0YXRlLnZpZXcoIHtcblx0XHRcdGtleToga2V5LFxuXHRcdFx0ZGF0YTogZGF0YSxcblx0XHRcdGN1cnJlbnRTdGF0ZTogY3VycmVudFN0YXRlXG5cdFx0fSApO1xuXHR9XG59ICk7XG5cbndpbmRvdy5vbmhhc2hjaGFuZ2UgPSByb3V0ZXIuaGFuZGxlU3RhdGU7XG5cbm1vZHVsZS5leHBvcnRzID0gcm91dGVyOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCB0eXBlLCB1cmwsIHBhcmFtcyApIHtcbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblxuXHR2YXIgc3RyID0gJyc7XG4gICAgaWYoIHBhcmFtcyApIHtcblx0XHRmb3IgKHZhciBrZXkgaW4gcGFyYW1zKSB7XG5cdFx0ICAgIGlmIChzdHIgIT0gXCJcIikge1xuXHRcdCAgICAgICAgc3RyICs9ICcmJztcblx0XHQgICAgfVxuXHRcdCAgICBzdHIgKz0ga2V5ICsgJz0nICsgcGFyYW1zW2tleV07XG5cdFx0fVxuICAgIH1cblxuICAgIHJlcXVlc3Qub3Blbih0eXBlLCB1cmwgKyBzdHIsIHRydWUpO1xuICAgIHJlcXVlc3Qub25sb2FkID0gb25sb2FkO1xuICAgIHJlcXVlc3Qub25lcnJvciA9IG9uZXJyb3I7XG4gICAgcmVxdWVzdC5vbnByb2dyZXNzID0gb25wcm9ncmVzcztcbiAgICByZXF1ZXN0LnNlbmQoKTtcblxuICAgIGZ1bmN0aW9uIG9ubG9hZCgpIHtcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKCBlICkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gcmVxdWVzdC5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KG5ldyBFcnJvcihcIlN0YXR1cyBjb2RlIHdhcyBcIiArIHJlcXVlc3Quc3RhdHVzKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbmVycm9yKCkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QobmV3IEVycm9yKFwiQ2FuJ3QgWEhSIFwiICsgSlNPTi5zdHJpbmdpZnkodXJsKSkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9ucHJvZ3Jlc3MoZXZlbnQpIHtcbiAgICAgICAgZGVmZXJyZWQubm90aWZ5KGV2ZW50LmxvYWRlZCAvIGV2ZW50LnRvdGFsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07IiwiLyoqIEBqc3ggUmVhY3QuRE9NICovcmVxdWlyZSgnLi9yb3V0ZXInKTtcblxudmFyIGluZGV4ID0gcmVxdWlyZSgnLi9wYWdlcy9pbmRleCcpO1xuXG52YXIgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hcHAnKVswXTtcblxuUmVhY3QucmVuZGVyQ29tcG9uZW50KCBpbmRleChudWxsKSwgZWxlbWVudCApOyJdfQ==
