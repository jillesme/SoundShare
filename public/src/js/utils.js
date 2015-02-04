var utils = {
	hasNode(node, nodeList) {
		if( nodeList ) {
			for (var i = 0; i < nodeList.length; i++) {
				if (nodeList[i].name === node) {
					return true;
				}
			}

			return false;
		}

		return false;
	},
	getStatus(response, classes, classPrefix) {
		if( response.status === 'CREATED' ) {
			status = 'Draft';
			classes[classPrefix + '--draft'] = true;
		}

		if( response.status === 'ACTIVE' ) {
			if( response.currentRenderedNodes ) {
				if (this.hasNode('STAApproval', response.currentRenderedNodes)) {
					status = 'Awaiting Approval';
					classes[classPrefix + '--awaiting'] = true;
				}

				if (this.hasNode('STARejectedSupplierReview', response.currentRenderedNodes)) {
					status = 'Rejected';
					classes[classPrefix + '--rejected'] = true;
				}
			} else {
				status = 'Pending';
				classes[classPrefix + '--pending'] = true;
			}
		}

		if( response.status === 'COMPLETED' ) {
			status = 'Approved';
			classes[classPrefix + '--approved'] = true;
		}

		return { status, classes };
	},
	/**
	 * Copy without binding by reference
	 * @param  {Object|Array} source      Source to copy from
	 * @param  {Object|Array} destination Target
	 * @return {Object|Array}             Copied object/array
	 */
	copy: function( source, destination ) {
		if(!destination) {
			if( this.isArray(source) ) {
				destination = [];
			} else if( this.isObject(source) ) {
				destination = {};
			} else {
				throw new Error( typeof source + ' is not supported by Utils.copy');
			}
		}

		for( var i in source ) {
			destination[i] = source[i];
		}

		return destination;
	},
	/**
	 * Find the difference between two arrays
	 * @param  {Array} a1 New Array
	 * @param  {Array} a2 Previous Array
	 * @return {Array}    Array of objects of changes from prev > new
	 */
	arrayDiff: function( a1, a2 ) {
		var differences = [];

		for( var i = 0; i < a1.length; i++ ) {
			if( a2.indexOf( a1[i] ) === -1 ) {
				differences.push({
					action: 'added',
					value: a1[i]
				});
			}
		}
		for( var i = 0; i < a2.length; i++ ) {
			if( a1.indexOf( a2[i] ) === -1 ) {
				differences.push({
					action: 'removed',
					value: a2[i]
				});
			}
		}

		return differences;
	},
	/**
	 * Compute if two items are equals
	 * @param  {*} o1 Any type of data to compare
	 * @param  {*} o2 Any type of data to compare
	 * @return {bool} Whether or not they're equal
	 */
	equals: function( o1, o2 ) {
		if (o1 === o2) return true;
		if (o1 === null || o2 === null) return false;
		if (o1 !== o1 && o2 !== o2) return true;
		var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
		if (t1 == t2) {
			if (t1 == 'object') {
				if (this.isArray(o1)) {
					if (!this.isArray(o2)) return false;
					if ((length = o1.length) == o2.length) {
						for(key=0; key<length; key++) {
							if (!this.equals(o1[key], o2[key])) return false;
						}
						return true;
					}
				} else if (this.isDate(o1)) {
					if (!this.isDate(o2)) return false;
					return this.equals(o1.getTime(), o2.getTime());
				} else if (this.isRegExp(o1) && this.isRegExp(o2)) {
					return o1.toString() == o2.toString();
				} else {
					keySet = {};
					for(key in o1) {
						if (key.charAt(0) === '$' || this.isFunction(o1[key])) continue;
						if (!this.equals(o1[key], o2[key])) return false;
						keySet[key] = true;
					}
					for(key in o2) {
						if (!keySet.hasOwnProperty(key) &&
							key.charAt(0) !== '$' &&
							o2[key] !== undefined &&
							!this.isFunction(o2[key])) return false;
					}
					return true;
				}
			}
		}
		return false;
	},
	/**
	 * Convert strings from item:desc to itemDesc
	 * @param  {String} string String to be formatted
	 * @return {String}        Formatted string
	 */
	convertToCamelCase: function( string ) {
		return string.replace(/:([a-z])/g, function (g) { return g[1].toUpperCase(); })
	},
	/**
	 * Extend an object
	 * @param  {Object} source      Source object to extend
	 * @param  {Object} destination Target object to extend into
	 * @return {Object}             Extended object
	 */
	extend: function( source, destination ) {
		for( var i in source ) {
			destination[i] = source[i];
		}

		return destination;
	},
	/**
	 * Find closest parent from DOM event
	 * @param  {Object} event     DOM event obj
	 * @param  {String} className Class name to look for
	 * @return {Object|Null}      Result of search
	 */
	findClosestParent: function(event, className) {
		var parent = event.parentNode;
		while (parent!=document.body && parent != null) {
			if ((parent) && parent.className && parent.className.indexOf(className) != -1) {
				return parent;
			} else {
				parent = parent ? parent.parentNode : null;
			}
		}
		return null;
	},
	checkState: function( state, currentState ) {
		var _this = this;

		function compareState( stateName, currentState ) {
			var show = false;
			if( stateName ) {
				if( _this.isString( stateName ) ) {
					show = stateName === currentState;
				} else if( _this.isArray( stateName ) ) {
					var index = stateName.indexOf( currentState );

					show = index > -1;
				}
			}
			return show;
		}

		if( state ) {
			var show = false;
			if( this.isArray( currentState ) ) {
				currentState.forEach( function( element ) {
					var result = compareState( state, element );

					if( !!result ) {
						show = true;
					}
				}, this );
			} else {
				show = compareState( state, currentState );
			}

			return show;
		}

		return true;
	},
	convert(data, newData) {
		if (this.isArray(data)) {
			newData = [];

			for (var i = 0; i < data.length; i++) {
				if (isObject(data[i])) {
					newData.push({});

					this.convert(data[i], newData[i]);
				} else {
					newData = data;
				}
			}
		} else if (this.isObject(data)) {
			for (var i in data) {
				if (typeof data[i].value !== 'undefined') {
					if (this.isObject(data[i].value)) {
						newData[i] = {};
						this.convert(data[i].value, newData[i]);
					} else if (this.isArray(data[i].value)) {
						newData[i] = [];
						for (var t = 0; t < data[i].value.length; t++) {
							if (this.isObject(data[i].value[t])) {
								newData[i].push({});
								this.convert(data[i].value[t], newData[i][t]);
							} else {
								newData[i] = data[i].value;
							}
						}
					} else {
						newData[i] = data[i].value;
					}
				} else {
					newData[i] = data[i].value;
				}
			}
		} else {
			newData = data;
		}
	},
	convert2(data, newData) {
		console.trace();
		if (this.isArray(data)) {
			newData = [];

			for (var i = 0; i < data.length; i++) {
				if (isObject(data[i])) {
					newData.push({});

					this.convert(data[i], newData[i]);
				} else {
					newData = data;
				}
			}
		} else if (this.isObject(data)) {
			for (var i in data) {
				console.log(data[i], i);
				if (typeof data[i].value !== 'undefined') {
					if (this.isObject(data[i].value)) {
						newData[i] = {};
						this.convert(data[i].value, newData[i]);
					} else if (this.isArray(data[i].value)) {
						newData[i] = [];
						for (var t = 0; t < data[i].value.length; t++) {
							if (this.isObject(data[i].value[t])) {
								newData[i].push({});
								this.convert(data[i].value[t], newData[i][t]);
							} else {
								newData[i] = data[i].value;
							}
						}
					} else {
						newData[i] = data[i].value;
					}
				} else {
					newData[i] = data[i].value;
				}
			}
		} else {
			newData = data;
		}
	}
};

/**
 * Object Types
 * @type {Array}
 */
var objTypes = [
	'Array', 'Object', 'String', 'Date', 'RegExp',
	'Function', 'Boolean', 'Number', 'Null', 'Undefined'
];

// Create individual functions on top of our Utils object for each objType
for (var i = objTypes.length; i--;) {
	utils['is' + objTypes[i]] = (function (objectType) {
		return function (elem) {
			return toString.call(elem).slice(8, -1) === objectType;
		};
	})(objTypes[i]);
}

export default utils;