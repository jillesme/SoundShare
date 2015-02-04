require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Utils = require('./utils');
var adapt = require('./core');

/**
 * Controller Object, holds controller values
 */
function Controller() {

}

/**
 * Create everything to do with the controller
 * @param {adapt} adapt Adapt Instance
 */
function ControllerService( adapt ) {
  /**
   * Adapt Instance
   * @type {adapt}
   */
  this.$adapt = adapt;

  /**
   * Controller Items
   * @type {Controller}
   */
  this.items = new Controller();

  // Create a new controller from our defaults
  this.extendController(this.$adapt.config.controller, this.items);

  // Create a new controller from the view configuration
  this.createController(this.$adapt.config.view, this.items);
}

/**
 * Create the base controller from the view object
 * @param  {Object} obj    View object to copy
 * @param  {Object} target Controller object to copy to
 */
ControllerService.prototype.createController = function(obj, target) {
  try {
    for( var i in obj ) {
      var val;

      // if it's a tab type
      if( obj[i].tabType ) {
        // there are only two different types of tab, so assign the values based on _this
        // TODO: make this dynamic
        val = {
          tab: null,
          accordion: []
        }[obj[i].tabType];
      } else if( obj[i].type ) {
        // else, we'll grab the default model value from the component
        var item = adapt.component(obj[i].type.split(':')[0]);

        var possibleItem = Utils.convertToCamelCase(obj[i].type);

        if( adapt.components[possibleItem] ) {
          item = adapt.components[possibleItem];
        }

        val = item.defaultModelValue !== undefined ? item.defaultModelValue : '';
      } else {
        val = null;
      }

      if( obj[i].items ) {
        // if the view has an items array, i.e. columns or tabs
        if( Utils.isArray(obj[i].items) ) {
          // if it's an array, we need to loop through them and create controller values for each item in that array
          var _this = this;
          obj[i].items.forEach( function( element, index, array ) {
            // only pass through target, as these are invisible in the controller
            _this.createController( element, target );
          } );
        } else if( Utils.isObject(obj[i].items ) ) {
          // if it's an object, pass it all through, invisibly
          this.createController( obj[i].items, target );
        }
      } else if( obj[i].model ) {
        // if it has a model, we might not need to copy anything over
        if( Utils.isObject( obj[i].model ) ) {
          if( target[i] ) {
            // if default controller values exist, we need to create a new controller item for the whole of the controller (that way we can give partial controller values and things don't break)
            for( var r = 0; r < target[i].value.length; r++ ) {
              this.createController( obj[i].model, target[i] );
            }
          } else {
            target[i] = {};

            this.createController( obj[i].model, target[i] );
          }
        } else {
          target[i] = {};

          for( var r = 0; r < obj[i].model.length; r++ ) {
            this.createController( obj[i].model[r].items, target[i] );
          }
        }
      } else if( obj[i].tabs ) {
        // if we have tabs, we need to loop through all the tab pages and create controller values for them
        for( var r = 0; r < obj[i].tabs.length; r++ ) {
          this.createController( obj[i].tabs[r].items, target );
        }
      } else {
        // we can assume there are no more children for this controller value, and just set it to the value set above
        if( !target[i]&& val !== null ) {
          target[i] = {};
        }
      }
    }
  } catch( e ) {
    console.warn(e.message);
  }
};

/**
 * Prepopulate the base controller from previous values
 * @param  {Object} obj    Previous value to copy over
 * @param  {Object} target Target to copy it over to
 */
ControllerService.prototype.extendController = function(obj, target) {
  for( var i in obj ) {
    if( !target[i] ) {
      // if the target doesn't exist, create a base object
      target[i] = [];
    }

    if( Utils.isArray( obj[i] ) ) {
      var _this = this;

      console.log(obj[i]);

      // loop through the previous values
      obj[i].forEach( function( element, index ) {
        target[i].push( element );
      } );
    } else {
      // we've exhausted all options, copy it over
      target[i] = obj[i];
    }
  }
};

module.exports = ControllerService;

},{"./core":2,"./utils":7}],2:[function(require,module,exports){
/** @jsx React.DOM */'use strict';

var Utils = require('./utils');

var Adapt = {};

/**
 * Store all the components
 * @type {Object}
 */
Adapt.components = {};

/**
 * Get/set components
 * @param  {String} name   Name of component
 * @param  {Object} config Component configuration
 * @return {Object}        Component
 */
Adapt.component = function component(name, config) {
  if( config ) {
    if( config.extend ) {
      config.extend.forEach( function( element, index ) {
        config = Utils.extend(Utils.copy(config), Utils.copy(element));
      } );
    }

    this.components[name] = React.createClass(config);
  }
  if(!this.components[name]) {
    throw new Error('[' + name + '] is not a component');
  }
  return this.components[name];
};

/**
 * Store all the mixins
 * @type {Object}
 */
Adapt.mixins = {};

/**
 * Get/set mixins
 * @param  {String} name   Name of mixin
 * @param  {Object} config Mixin configuration
 * @return {Object}        Mixin
 */
Adapt.mixin = function mixin(name, config) {
  if( config ) {
    this.mixins[name] = config;
  }
  if(!this.mixins[name]) {
    throw new Error('[' + name + '] is not a mixin');
  }
  return this.mixins[name];
};

module.exports = Adapt;

},{"./utils":7}],3:[function(require,module,exports){
'use strict';

var Utils = require('./utils');

/**
 * Find function
 */
function Find( ) {

  /**
   * Main finding function
   * @param  {String} toFind String of what to find in the items object
   * @return {Object}        Found object with helper functions
   */
  return function findItem( toFind ) {

    /**
     * This will be the service that Find is initialised it
     * @type {Model|View}
     */
    var Service = this;

    /**
     * Look up function
     * @param  {String} string String to find
     * @param  {Object} model  Object to look in
     * @return {Array}         Array of matches
     */
    function lookup( string, model ) {
      var split = string.split('.');

      // copy the model over to a temp
      var tempModel = model;

      for( var i = 0; i < split.length; i++ ) {
        if( Utils.isArray( tempModel ) ) {
          // if the model is an array, we need to go deeper
          if( tempModel.value ) {
            // we don't want to keep writing "item.value.item", so we automatically go down a level
            tempModel = tempModel.value;
          }
          if( tempModel.items ) {
            // we don't want to keep writing "item.items.item", so we automatically go down a level
            tempModel = tempModel.items;
          }
          var tm = [];

          for( var r = 0; r < tempModel.length; r++ ) {

            if( tempModel[r].value ) {
              // automatically go down a level
              tempModel = tempModel[r].value;
            }
            if( tempModel[r].items ) {
              // automatically go down a level
              tempModel = tempModel[r].items;
            }

            // we've found it, push them into the temp model
            if( Utils.isArray( tempModel ) ) {
              tm.push(tempModel[r][split[i]]);
            } else {
              tm.push(tempModel[split[i]]);
            }
          }
          tempModel = tm;
        } else {
          // to keep it consistent, return an array of the found item
          tempModel = [tempModel[split[i]]];
        }
      }

      return tempModel;
    }

    var found;

    // try and find it, if not, we'll assign it to an empty object
    // this allows us to set observers and expression values on unknown items
    try {
      found = lookup( toFind, this.items );
    } catch(e) {
      found = {};
    }

    /**
     * Observe a value
     * @param  {Function} callback Callback when the value changes
     * @param  {String}   item     Optional item to observe
     */
    found.observe = function( callback, item ) {
      // setup the observer in the observe object
      if( !Service.observe[toFind] ) {
        Service.observe[toFind] = {};
      }

      // if we have an item, use that, if not we assume we're going to look at the value
      var val = item || 'value';

      // setup the observer
      if( !Service.observe[toFind][val] ) {
        Service.observe[toFind][val] = [];
      }

      // push it in
      Service.observe[toFind][val].push(callback);

      // notify everyone else
      Service.$adapt.observe.digest();
    };

    /**
     * Add an item in the object
     * @param {Integer} index  Index of where to insert the object
     * @param {Object} parent  Object to insert into
     * @param {String} name    Key of the new object
     * @param {Object} obj     New object to insert
     */
    var addItem = function( index, parent, name, obj ) {
      // grab the original order in array form
      var originalOrder = Object.keys(parent.items);

      // insert the name into the original order
      originalOrder.splice(index, 0, name);

      // copy over the old parent, so we don't get binding
      var oldParent = Utils.copy(parent.items);

      // insert the new object into the parent, we don't care about position here
      oldParent[name] = obj;

      var newParent = {};

      // loop through the original order (with our new value inserted in the correct position)
      originalOrder.forEach( function( element, index ) {
        // then copy it over, in the correct position
        newParent[element] = oldParent[element];
      } );

      // update the parent object
      parent.items = newParent;
    };

    /**
     * Append an object to an object
     * @param  {String} name                   Name of the new object
     * @param  {Object} obj                    Object values for the new object
     * @param  {Object} defaultModelValue      Optional default value to put into the model
     * @param  {Object} defaultControllerValue Optional default value to put into the controller
     */
    found.append = function( name, obj, defaultModelValue, defaultControllerValue ) {
      // get the found item
      var foundItem = found[0];

      // create a new model to pass through to our model functions
      var models = {};
      models[name] = obj;

      // setup the new model and new controller
      var newModel = {};
      var newController = {};

      if( defaultModelValue && !Utils.isString(defaultModelValue) ) {
        // if we have a new default model value that isn't a string, we need to create a model value for it from the component
        var modelConfig = {};

        modelConfig[name] = defaultModelValue;
        newModel = Utils.copy(obj);

        // use the helper model functions to create the model
        Service.$adapt.model.extendModel( modelConfig, newModel );
      }

      if( !defaultControllerValue ) {
        // if we don't have a controller value, we need one!
        var controllerConfig = {};

        controllerConfig[name] = Utils.copy(obj);

        Service.$adapt.controller.createController( controllerConfig, newController );
      }

      // finally create the new model
      Service.$adapt.model.createModel( models, newModel );

      // push the new object into the exisiting model
      var modelObj = Service.$adapt.model.items;
      modelObj[name] = { value: '' };

      // push the new controller into the existing controller
      var controllerObj = Service.$adapt.controller.items;
      controllerObj[name] = newController[name] || defaultControllerValue;

      if( defaultModelValue && Utils.isString(defaultModelValue)  ) {
        // if we have a string, just copy the value over
        modelObj[name].value = defaultModelValue;
      } else {
        // if we don't, set the model to the new model value we created
        modelObj[name].value = newModel[name].value;
      }

      // calculate the index to put the new item in
      var index = Object.keys(foundItem.items).length;

      // finally, add the item
      addItem( index, foundItem, name, obj);

      // notify everyone else
      Service.$adapt.observe.digest();
    };

    /**
     * Destory an object in an object
     * @param  {String} name Name of what to destroy
     */
    found.destroy = function( name ) {
      var foundItem = found[0];

      // store the original order of the object
      var originalOrder = Object.keys(foundItem.items);

      // find out where the item is we want to delete
      var index = originalOrder.indexOf(name);

      if( index > -1 ) {
        // if it actually exists, let's remove it
        originalOrder.splice(index, 1);

        // we'll copy over the old parent to avoid binding by reference
        var oldParent = Utils.copy(foundItem.items);

        var newParent = {};

        var model = Service.$adapt.model.items;
        var controller = Service.$adapt.controller.items;

        // loop through the new order, sans removed element, and put it into a new parent
        originalOrder.forEach( function( element, index ) {
          newParent[element] = oldParent[element];
        } );

        // delete the appropriate model and controller values
        delete model[name];
        delete controller[name];

        // update the parent object
        foundItem.items = newParent;

        // notify everyone else
        Service.$adapt.observe.digest();
      }
    };

    /**
     * Register a value expression
     * @param {Function} expression The value for the item
     */
    found.setValue = function( expression ) {
      Service.values[toFind] = expression;

      Service.$adapt.observe.digest();
    };

    return found;
  };
}

module.exports = Find;

},{"./utils":7}],4:[function(require,module,exports){
// form
require('../components/form');
require('../components/loop');

// mixins
require('../mixins/flat');
require('../mixins/object');
require('../mixins/arrayObject');
require('../mixins/array');

// decorative
require('../components/label');
require('../components/description');
require('../components/column');
require('../components/columnRows');
require('../components/hr');
require('../components/accordion');
require('../components/tabcordion');
require('../components/table');
require('../components/header');
require('../components/tabs');

// components
require('../components/item');
require('../components/textarea');
require('../components/input');
require('../components/inputDate');
require('../components/select');
require('../components/selectMultiple');
require('../components/checkbox');
require('../components/radio');
require('../components/button');

},{"../components/accordion":9,"../components/button":10,"../components/checkbox":11,"../components/column":12,"../components/columnRows":13,"../components/description":14,"../components/form":15,"../components/header":16,"../components/hr":17,"../components/input":18,"../components/inputDate":19,"../components/item":20,"../components/label":21,"../components/loop":22,"../components/radio":23,"../components/select":24,"../components/selectMultiple":25,"../components/tabcordion":26,"../components/table":27,"../components/tabs":28,"../components/textarea":29,"../mixins/array":30,"../mixins/arrayObject":31,"../mixins/flat":32,"../mixins/object":33}],5:[function(require,module,exports){
'use strict';

var Find  = require('./find');
var Utils = require('./utils');

var adapt  = require('./core');

/**
 * Model Object, holds model values
 */
function Model( ) {

}

/**
 * Create everything to do with the model
 * @param {adapt} adapt Adapt Instance
 */
function ModelService( adapt ) {
  /**
   * Adapt Instance
   * @type {adapt}
   */
  this.$adapt = adapt;

  /**
   * Model Items
   * @type {Model}
   */
  this.items = new Model();

  // Create a model from our defaults
  this.extendModel(this.$adapt.config.model, this.items);

  // Create the model from the view configuration
  this.createModel(this.$adapt.config.view, this.items);

  this.find = new Find();

  /**
   * Value expressions for model items
   * @type {Object}
   */
  this.values = {};

  /**
   * value observers for model items
   * @type {Object}
   */
  this.observe = {};
}

/**
 * Create the base model off of the view object
 * @param  {Object} obj    View object to copy
 * @param  {Object} target Model object to copy to
 */
ModelService.prototype.createModel = function(obj, target) {
  try {
    for( var i in obj ) {

      // if there is no type or tabType, we can't do any model binding
      if(!obj[i].type && !obj[i].tabType) {
        console.warn('[model]: No type selected, assuming model data doesn\'t exist');
      }

      var val;

      // if it's a tab type
      if( obj[i].tabType ) {
        // there are only two different types of tab, so assign the values based on _this
        // TODO: make this dynamic
        val = {
          tab: null,
          accordion: []
        }[obj[i].tabType];
      } else if( obj[i].type ) {
        // else, we'll grab the default model value from the component
        var item = adapt.component(obj[i].type.split(':')[0]);

        // see if the possible component exists
        var possibleItem = Utils.convertToCamelCase(obj[i].type);

        if( adapt.components[possibleItem] ) {
          item = adapt.components[possibleItem];
        }

        // set it
        val = item.defaultModelValue !== undefined ? item.defaultModelValue : '';
      } else {
        val = null;
      }

      if( obj[i].items ) {
        // if the view has an items array, i.e. columns or tabs
        if( Utils.isArray(obj[i].items) ) {
          // if it's an array, we need to loop through them and create model values for each item in that array
          var _this = this;
          obj[i].items.forEach( function( element, index, array ) {
            // only pass through target, as these are invisible in the model
            _this.createModel( element, target );
          } );
        } else if( Utils.isObject(obj[i].items ) ) {
          // if it's an object, pass it all through, invisibly
          this.createModel( obj[i].items, target );
        }
      } else if( obj[i].model ) {
        // if it has a model, we might not need to copy anything over
        if( Utils.isObject( obj[i].model ) ) {
          if( target[i] ) {
            // if default model values exist, we need to create a new model item for the whole of the model (that way we can give partial model values and things don't break)
            for( var r = 0; r < target[i].value.length; r++ ) {
              this.createModel( obj[i].model, target[i].value[r] );
            }
          } else {
            // else we just need to make the model value an array, ready for populating
            target[i] = { value: [] };
          }
        } else {
          target[i] = { value: [] };

          for( var r = 0; r < obj[i].model.length; r++ ) {
            target[i].value.push({});

            this.createModel( obj[i].model[r].items, target[i].value[r] );
          }
        }
      } else if( obj[i].tabs ) {
        // if we have tabs, we need to loop through all the tab pages and create model values for them
        for( var r = 0; r < obj[i].tabs.length; r++ ) {
          this.createModel( obj[i].tabs[r].items, target );
        }
      } else {
        // we can assume there are no more children for this model value, and just set it to the value set above
        if( !target[i]&& val !== null ) {
          target[i] = {
            value: val
          };
        }
      }
    }
  } catch( e ) {
    console.warn(e.message);
  }
};

/**
 * Prepopulate the base model from previous values
 * @param  {Object} obj    Previous value to copy over
 * @param  {Object} target Target to copy it over to
 */
ModelService.prototype.extendModel = function(obj, target) {
  for( var i in obj ) {
    if( !target[i] ) {
      // if the target doesn't exist, create a base object
      target[i] = {};
    }
    if( Utils.isArray( obj[i] ) ) {
      // if given an array, make the value of the model an array ready to be pushed in
      target[i].value = [];

      var _this = this;
      obj[i].forEach( function( element, index ) {
        // loop through the previous values
        target[i].value.push({}); // push a new array into the model

        // recursive <3
        _this.extendModel( element, target[i].value[index] );
      } );
    } else if( Utils.isObject( obj[i] ) ) {

    } else {
      // we've exhausted all options, copy it over
      target[i].value = obj[i];
    }
  }
};

module.exports = ModelService;

},{"./core":2,"./find":3,"./utils":7}],6:[function(require,module,exports){
'use strict';

var Utils = require('./utils');

/**
 * Main Observe function
 */
function Observe( ) {
  /**
   * Array of records stored
   * @type {Array}
   */
  this.records = [];
}

/**
 * Add an observe listener
 * @param {Function} watchExp Function to watch
 * @param {Function} listener Listener to call
 */
Observe.prototype.addListener = function addListener( watchExp, listener ) {
  var records = this.records;

  var listenerObj = {
    watchExp: watchExp,
    listener: listener,
    lastValue: ''
  };

  records.push(listenerObj);

  // return a function that removes our listener from the records array
  return function() {
    records.splice(records.indexOf(listenerObj), 1);
  }
};

/**
 * Digest Cycle
 */
Observe.prototype.digest = function digest( ) {
  var dirty;
  var ttl = 10; // how many iterations we can make before we assume the data is unstable

  do {
    var length = this.records.length;

    dirty = false;

    while(length--) {
      var item = this.records[length];

      if( item ) {
        var
          newVal = item.watchExp(),
          oldVal = item.lastValue;

        if( !Utils.equals(newVal, oldVal ) ) {
          if( !( Utils.isArray(newVal) || Utils.isObject(newVal) ) ) {
            // if the new value is not an array or object, we can just set it without worrying about binding
            item.lastValue = newVal;
          } else {
            // if it is an array or object, we have to copy it over to stop any binding by reference
            item.lastValue = Utils.copy(newVal);
          }

          var params = [newVal, oldVal];

          if( Utils.isArray(newVal) && Utils.isArray(oldVal) ) {
            // if its an an array, we will pass through the difference as the third parameter
            params.push( Utils.arrayDiff(newVal, oldVal) );
          }

          item.listener.apply( this, params );

          dirty = true;
        } else {
          dirty = false;
        }
      }
    }

    if( dirty && !(ttl--) ) {
      throw 'Maximum digest iterations reached';
    }
  } while(dirty);
};

module.exports = Observe;

},{"./utils":7}],7:[function(require,module,exports){
'use strict';

/**
 * Utils object
 * @type {Object}
 */
var Utils = {
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
  Utils['is' + objTypes[i]] = (function (objectType) {
    return function (elem) {
      return toString.call(elem).slice(8, -1) === objectType;
    };
  })(objTypes[i]);
}

module.exports = Utils;

},{}],8:[function(require,module,exports){
'use strict';

var Find = require('./find');

/**
 * View object, holds view data
 * @param {Object} items View object data
 */
function View (items) {
  // store the items passed through in itself
  for (var i in items) {
    this[i] = items[i];
  }
}

/**
 * Everything to do with the view
 * @param {adapt} adapt Adapt instance
 */
function ViewService (adapt) {
  /**
   * Adapt Instance
   * @type {adapt}
   */
  this.$adapt = adapt;

  /**
   * View Items
   * @type {Object}
   */
  this.items = {};

  // Create the view from the configuration
  this.createView(this.$adapt.config.view, this.items);

  // Create a new find instance for this service
  this.find = new Find();
}

/**
 * Create the View
 * @param  {Object} obj    The view configuration
 * @param  {Object} target The target view items
 */
ViewService.prototype.createView = function createView (obj, target) {
  for (var i in obj) {
    // pass through our configuration to a new view
    target[i] = new View(obj[i]);
    if (obj[i].items) {
      // we need to go deeper
      this.createView(obj[i].items, target[i].items);
    }
  }
};

module.exports = ViewService;

},{"./find":3}],9:[function(require,module,exports){
/** @jsx React.DOM */'use strict';

var adapt = require('../api/core');
var Utils = require('../api/utils');

var AdaptAccordion = {
  displayName: 'AdaptAccordion',
  extend: [adapt.mixins.arrayObject],
  getInitialState: function () {
    // set the initial state to have all accordions closed
    return {
      open: -1
    };
  },
  openAccordion: function (id) {
    // toggle the accordion to be open, or closed if it is already open
    this.setState({
      open: id == this.state.open ? -1 : id
    });
  },
  render: function () {
    var cx = React.addons.classSet;
    var item = this.props.config.item;
    var config = this.props.config;
    var openID = this.state.open;
    var items = [];
    var model = config.model[config.name].value;

    var loop = adapt.components.loop;
    var _this = this;

    if(model) {
      // set the controller and view, accordions aren't invisible in the VC so we need to go down a level
      var childController = config.controller[config.name];
      var childModel = config.model[config.name].value;

      var dynamicItem = adapt.components.item;

      for( var i = 0; i < model.length; i++ ) {
        var children = [];

        // accordions models are arrays, and we need the appropriate model value for this iteration
        var finalModel = childModel[i];

        // accordions are the same, so we loop through the view's model for each accordion
        // TODO: make accordions have different views, to allow dynamically added elements

        children = loop(
          {
            items: item.model,
            controller: childController,
            values: config.values,
            observe: config.observe,
            nameTrail: config.nameTrail + config.name + '.',
            model: finalModel,
            adapt: _this.props.adapt
          }
        );

        // does the accordion have a title element for each one?
        var title = 'Item'; // we'll set a default anyway
        if (item.title) {
          // accordions can have titles, so we need to replace any variables requested
          var REGEX_CURLY = /{([^}]+)}/g;

          title = item.title;
          title = title.replace(REGEX_CURLY, function( match ) {
            if( match === '{index}' ) {
              // {index} allows us to display the number of the accordion (plus one..)
              return i + 1;
            }

            var possibleVariable = match.replace('{', '').replace('}', ''); // there's probably a regex for this somewhere

            if( finalModel[possibleVariable] ) {
              // the variable exists in the model! let's bind them
              return finalModel[possibleVariable];
            }

            return false;
          } );
        }

        // are they open?
        var titleClasses = cx({
          'element__accordion--title': true,
          'open': i === openID
        });

        var contentClasses = cx({
          'element__accordion--content': true,
          'open': i === openID
        });

        // push the child into the items array, so we can render it below
        items.push(
          React.DOM.div({className: "element__accordion--child"}, 
            React.DOM.div({
              className: titleClasses, 
              onClick:  this.openAccordion.bind(this, i) }, 
              React.DOM.h3(null, title ), 
              React.DOM.i({className: "fa fa-chevron-down"}), 
              React.DOM.i({className: "fa fa-chevron-up"})
            ), 
            React.DOM.a({
              className: "element__accordion--remove no-select", 
              onClick:  this.remove.bind(this, i) }, 
              React.DOM.i({className: "fa fa-times"})
            ), 
            React.DOM.div({className: contentClasses }, 
              children 
            )
          )
        );
      };
    }

    var title;
    if( item.title ) {
      // if the accordion has a title, we need to render it
      // grab the header component
      var header = adapt.components.header;

      // pass in a config, this is a bit overkill but it allows us to use it both here and in the JSON definition of the view
      title = header( {
        config: {
          item: {
            title: item.title,
            type: 'header:h2'
          }
        },
        adapt: this.props.adapt
      } );
    }

    // return the accordion!
    return (
      React.DOM.div({className: "element__accordion clear"}, 
        React.DOM.header({className: "element__accordion--header"}, 
          title, 
          React.DOM.div({
            className: "element__button element__button--add no-select", 
            onClick:  this.add}, 
            React.DOM.i({className: "fa fa-plus"}), " Add Item"
          )
        ), 

        items 
      )
    );
  }
};

adapt.component('accordion', AdaptAccordion);

},{"../api/core":2,"../api/utils":7}],10:[function(require,module,exports){
/** @jsx React.DOM */var adapt = require('../api/core');
var Utils = require('../api/utils');

var AdaptButton = {
  statics: {
    defaultModelValue: []
  },
  getInitialState: function( ){
    var config = this.props.config;

    return {
      model: Utils.copy(config.model[ config.name ].value)
    }
  },
  displayName: 'AdaptButton',
  setObservers: function () {
    var that = this;
    var config = this.props.config;

    var observers = config.observe[config.nameTrail + config.name];

    for( var i in observers) {
      observers[i].forEach( function( element, index ) {
        that.listeners.push(
          that.props.adapt.observe.addListener(function(){
            return config.model[config.name][i] || config.item[i];
          }, element )
        );
      });
    }
  },
  listeners: [],
  componentWillUnmount: function( ) {
    this.state.listeners.forEach( function( element ) {
      element();
    } );
  },
  toggleCheckbox: function( key ) {
    var model = this.state.model;

    var index = model.indexOf(key);

    if( index > -1 ) {
      model.splice(index, 1);
    } else {
      model.push(key);
    }

    this.props.config.model[ this.props.config.name ].value = model;
    this.props.adapt.observe.digest();

    this.setState({
      model: model,
      na: !model.length
    });
  },
  componentWillMount: function () {
    var that = this;
    var config = this.props.config;

    var model = config.model[config.name];

    var expressionValue;

    if( config.observe[config.nameTrail + config.name] ) {
      this.setObservers();
    }
  },
  render: function( ) {
    var cx = React.addons.classSet;

    var
      model = this.state.model,
      type = this.state.type,
      item = this.props.config.item;

    var naSelected = this.state.na || !model.length;

    var label = adapt.component('label');

    var checkboxes = [];
    var items = item.options;

    return (
      React.DOM.div({className: "field field__checkbox"}, 
        
          typeof item.label === 'undefined' ? '' :
          adapt.components.label({config:  { item: item}, adapt:  this.props.adapt}), 
          

        React.DOM.div({className: "field__checkbox--container"}, 

          
            typeof item.desc === 'undefined' ? '' :
            adapt.components.description({config:  { item: item}, adapt:  this.props.adapt})
            
        )
      )
    );
  }
};

adapt.component('button', AdaptButton);

},{"../api/core":2,"../api/utils":7}],11:[function(require,module,exports){
/** @jsx React.DOM */'use strict';

var adapt = require('../api/core');
var utils = require('../api/utils');

var AdaptCheckbox = {
  statics: {
    defaultModelValue: []
  },
  getInitialState: function (){
    var config = this.props.config;

    // the model value is an array, which for some reason, gets binded by reference - let's stop that by returning a copied version
    return {
      model: utils.copy( config.model[config.name].value )
    };
  },
  displayName: 'AdaptCheckbox',
  setObservers: function () {
    // loop through the observers and set them
    var _this = this;
    var config = this.props.config;

    // grab the observers, using the full name of the component
    var observers = config.observe[config.nameTrail + config.name];

    for( var i in observers) {
      observers[i].forEach( function( element, index ) {
        // push the listener into an array, so we can unbind them all when the component unmounts
        _this.listeners.push(
          _this.props.adapt.observe.addListener(function(){
            // return either the watch value in the model, or the watch value in the view
            return config.model[config.name][i] || config.item[i];
          }, element )
        );
      });
    }
  },
  listeners: [],
  componentWillUnmount: function( ) {
    // unregister all the events
    this.state.listeners.forEach( function( element ) {
      element();
    } );
  },
  toggleCheckbox: function( key ) {
    var model = this.state.model;
    var config = this.props.config;

    // grab the (possible) index of the value in the model
    var index = model.indexOf(key);

    if( index > -1 ) {
      // it's already in the model, remove it
      model.splice(index, 1);
    } else {
      // add it to the model
      model.push(key);
    }

    // push it back into the model and notify everything else
    config.model[ config.name ].value = model;
    this.props.adapt.observe.digest();

    // keep the model in sync
    this.setState({
      model: model,
      na: !model.length
    });
  },
  componentWillMount: function () {
    var config = this.props.config;

    // if observers are set, set them
    if( config.observe[config.nameTrail + config.name] ) {
      this.setObservers();
    }
  },
  toggleNA: function( ) {
    // the NA button is selected when nothing is selected, also clears selection when clicked
    var model = this.state.model;
    var na;
    var config = this.props.config;

    // check if there are any items in the model
    if( model.length ) {
      this.oldValues = model; // store them, so if the user accidentally clicks on NA they can restore them by clicking on it again

      na = true; // set the NA button to active
      model = []; // clear the model

      // update the state
      this.setState({
        na: true,
        model: []
      });
    } else {
      if( this.state.na ) {
        // if there are no items selected, and NA is selected, change the items back
        na = false;
        model = this.oldValues || [];
      } else {
        // there are no items selected, so we need to set NA to active
        na = true;
      }
    }

    // push it back into the model
    config.model[ config.name ].value = model;
    this.props.adapt.observe.digest();

    // keep the view in sync
    this.setState({
      model: model,
      na: na
    });
  },
  render: function( ) {
    var cx = React.addons.classSet;

    var model = this.state.model;
    var type = this.state.type;
    var item = this.props.config.item;

    var naSelected = this.state.na || !model.length;

    var label = adapt.component('label');

    var checkboxes = [];
    var items = item.options;

    // do we even want that NA button?
    if( item.includeNA ) {
      var classes = cx({
        'field__checkbox--item': true,
        'field__checkbox--active': naSelected
      });

      checkboxes.push(
        React.DOM.div({
          className: classes, 
          key: "na", 
          onClick:  this.toggleNA}, 
          React.DOM.i({className: "fa fa-fw fa-check"}), 
          React.DOM.i({className: "fa fa-fw fa-times"}), 

          "N/A"
        )
        );
    }

    // loop through all the checkboxes and push them into an array
    for( var i in items ) {
      var classes = cx({
        'field__checkbox--item': true,
        'field__checkbox--active': model.indexOf(i) > -1
        });

      checkboxes.push(
        React.DOM.div({
          className: classes, 
          key:  this.props.config.name + i, 
          onClick:  this.toggleCheckbox.bind(this, i) }, 
          React.DOM.i({className: "fa fa-fw fa-check"}), 
          React.DOM.i({className: "fa fa-fw fa-times"}), 
           items[i] 
        )
      );
    }

    var label = null;
    if( item.label ) {
      var labelComponent = adapt.components.label;

      label = labelComponent( {
        config: {
          item: item
        },
        adapt: this.props.adapt
      } );
    }

    var desc;
    if( item.decs ) {
      var descComponent = adapt.components.desc;

      dec = descComponent( {
        config: {
          item: item
        },
        adapt: this.props.adapt
      } );
    }

    return (
      React.DOM.div({className: "field field__checkbox"}, 
        label, 
        checkboxes, 
        React.DOM.div({className: "field__checkbox--container"}, 
          desc 
        )
      )
    );
  }
};

adapt.component('checkbox', AdaptCheckbox);

},{"../api/core":2,"../api/utils":7}],12:[function(require,module,exports){
/** @jsx React.DOM */var adapt = require('../api/core');

var Utils = require('../api/utils');

var AdaptColumn = {
  displayName: 'AdaptColumn',
  render: function( ) {
    var item = this.props.config.item;

    var view = item.items;
    var width = item.span;

    var columns = {};

    var that = this;

    var totalWidth = 0;

    if( Utils.isArray(width) ) {
      width.forEach( function( element, index, array ) {
        totalWidth += element;
      } );
    }

var _this = this;
    var t = 0;
    view.forEach( function( element, index, array ) {
      if( t >= width.length ) {
        t = 0;
      }

      var items = {};

      var loop = adapt.components.loop;

      items = loop(
          {
            items: element,
            controller: that.props.config.controller,
            values: that.props.config.values,
            observe: that.props.config.observe,
            nameTrail: that.props.config.nameTrail,
            model: that.props.config.model,
            adapt: _this.props.adapt
          }
        );

      var className = 'column__container column__container--' + width;
      var style = {};

      if( Utils.isArray( width ) ) {
        className = 'column__container';
        style.width = ( ( width[t] / totalWidth ) * ( 100 - width.length + 1 ) ) + '%';

        if( t == width.length - 1 ) {
          style.marginRight = '0px';
        }
      }

      columns['column-' + index ] = (
        React.DOM.div({className: className, style: style }, 
          items
        )
        );

      t++;
    } );


    return (
      React.DOM.div({className: "column clear"}, 
        columns
      )
    );
  }
};

adapt.component('column', AdaptColumn);

},{"../api/core":2,"../api/utils":7}],13:[function(require,module,exports){
/** @jsx React.DOM */var adapt = require('../api/core');
var Utils = require('../api/utils');

var AdaptColumnRows = {
  displayName: 'AdaptColumnRows',
  getInitialState: function () {
    return {
      listeners: []
    }
  },
  componentWillMount: function () {
    var _this = this;
    this.state.listeners.push(
      this.props.adapt.observe.addListener( function() {
        return _this.props.config.item.items;
      }, function ( newVal ) {
        _this.forceUpdate();
      } )
    );
  },
  componentWillUnmount: function () {
    this.state.listeners.forEach( function( element ) {
      element();
    } );
  },
  render: function( ) {
    var item = this.props.config.item;

    var view = item.items;
    var width = item.span;

    var columns = {};

    var that = this;

    var totalWidth = 0;

    if( Utils.isArray(width) ) {
      width.forEach( function( element, index, array ) {
      totalWidth += element;
      } );
    }

    var r = 0;
    var t = 0;
    for( var i in view ) {
      if( t >= width.length ) {
        t = 0;
      }
      var items = {};

      var className = 'column__container column__container--' + width;
      var style = {};

      if( Utils.isArray( width ) ) {
        className = 'column__container';
        style.width = ( ( width[t] / totalWidth ) * ( 100 - width.length + 1 ) ) + '%';

        if( t == width.length - 1 ) {
          style.marginRight = '0px';
        }
      }

      var config = {
        model: that.props.config.model,
        name: i,
        item: view[i],
        values: that.props.config.values,
        controller: that.props.config.controller,
        observe: that.props.config.observe,
        nameTrail: that.props.config.nameTrail
      };

      var item = (this.transferPropsTo(adapt.components.item({config: config })));

      columns['column-' + r ] = (
        React.DOM.div({className: className, style: style }, 
          item
        )
        );

      r++;
      t++;
    }


    return (
      React.DOM.div({className: "column clear"}, 
        columns
      )
    );
  }
};

adapt.component('columnRows', AdaptColumnRows);

},{"../api/core":2,"../api/utils":7}],14:[function(require,module,exports){
/** @jsx React.DOM */var adapt = require('../api/core');

var AdaptDescription = {
  displayName: 'AdaptDescription',
  componentWillMount: function () {
    var that = this;
    var item = this.props.config.item;
    this.listener = this.props.adapt.observe.addListener(function () {
      return item.desc;
    }, function (newVal, oldVal) {
      that.setState({text: newVal});
    });
  },
  componentWillUnmount: function () {
    this.listener();
  },
  getInitialState: function () {
    var config = this.props.config;
    return {
      text: config.item.desc
    };
  },
  render: function () {
    return React.DOM.p({className: "field__description"},  this.props.config.item.desc);
  }
};

adapt.component('description', AdaptDescription);

},{"../api/core":2}],15:[function(require,module,exports){
/** @jsx React.DOM */'use strict';

var view  = require('../api/view');
var model = require('../api/model');
var adapt = require('../api/core');

var AdaptForm = {
  render: function () {
    var adaptInstance = this.props.adapt;
    var model = adaptInstance.model;
    var view = adaptInstance.view.items;
    var items = [];

    var dynamicItem = adapt.component('item');

    for (var prop in view) {
      var item = view[prop];

      items.push(
        this.transferPropsTo(
          dynamicItem( {
            config: {
              model: model.items,
              values: model.values,
              observe: model.observe,
              controller: adaptInstance.controller.items,
              name: prop,
              nameTrail: '',
              item: view[prop]
            }
          } )
        )
      );
    }

    var classes = {
      'hello': 1 === 1
    };


    return (
      React.DOM.form({className: "dynamic__form", autoComplete: "off"}, 
        items 
      )
    );
  }
};

adapt.component('form', AdaptForm);

},{"../api/core":2,"../api/model":5,"../api/view":8}],16:[function(require,module,exports){
/** @jsx React.DOM */var adapt = require('../api/core');

var AdaptHeader = {
  displayName: 'AdaptHeader',
  componentWillMount: function( ) {
    var that = this;
    var item = this.props.config.item;
    this.listener = this.props.adapt.observe.addListener(function( ) {
      return item.label;
    }, function( newVal, oldVal ) {
      that.setState({text: newVal});
    });
  },
  componentWillUnmount: function () {
    this.listener();
  },
  getInitialState: function () {
    var config = this.props.config;

    return {
      text: config.item.text,
      size: config.item.type.split(':')[1] || 'h1'
    };
  },
  render: function () {
    return React.DOM.span({className:  'header header__' + this.state.size},  this.props.config.item.text);
  }
};

adapt.component('header', AdaptHeader);

},{"../api/core":2}],17:[function(require,module,exports){
/** @jsx React.DOM */var adapt = require('../api/core');

var AdaptHr = {
  displayName: 'AdaptHr',
  render: function( ) {
    return (
      React.DOM.div({className: "element__hr"})
    );
  }
};

adapt.component('hr', AdaptHr);

},{"../api/core":2}],18:[function(require,module,exports){
/** @jsx React.DOM */var adapt = require('../api/core');

var AdaptInput = {
  extend: [adapt.mixins.flat],
  displayName: 'AdaptInput',
  render: function( ) {
    var model = '';
    if( this.props.config.model[this.props.config.name] ) {
      model = this.props.config.model[this.props.config.name].value;
    }
    var modelClass = '';
    if( this.props.config.model[this.props.config.name] ) {
      modelClass = this.props.config.model[this.props.config.name].model;
    }
    var type = this.state.type;
    var item = this.props.config.item;

    var controller = {};
    if( this.props.config.controller && this.props.config.controller[ this.props.config.name ] ) {
      controller = this.props.config.controller[ this.props.config.name ];
    }

    var label = adapt.component('label');

    return (
      React.DOM.div({className:  modelClass + ' field field__input' + ( typeof item.desc === 'undefined' ? '' : ' has-desc') }, 
        
          typeof item.label === 'undefined' ? '' :
          adapt.components.label({config:  { item: item}, adapt:  this.props.adapt}), 
          
        React.DOM.div({className: "field__input--container"}, 
          React.DOM.input({value: model, autoComplete: "off", type: "text", onChange:  this.handleChange, placeholder:  item.placeholder, disabled:  controller.disabled}), 
          
            typeof item.desc === 'undefined' ? '' :
            adapt.components.description({config:  { item: item}, adapt:  this.props.adapt})
            
        )
      )
    );
  }
};

adapt.component('input', AdaptInput);

},{"../api/core":2}],19:[function(require,module,exports){
/** @jsx React.DOM */var Utils = require('../api/utils');
var adapt = require('../api/core');

var AdaptInputDate = {
  extend: [adapt.mixins.flat],
  displayName: 'AdaptInputDate',
  setStatus: function( value ) {
    this.setState({open: value});
  },
  getDefaultProps: function () {
    return {
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };
  },
  componentDidMount: function( ) {
    this.id = Math.random() * 100;

    var that = this;
    document.addEventListener('mousedown', function(e){
      if( !Utils.findClosestParent(e.target, 'field__inputdate--' + that.state.name + that.id) ) {
        if( that.state.open ) {
          that.setStatus(false);
        }
      }
    });
  },
  handleChange: function(event) {
    var DATE_REGEXP = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/;

    var value = event.target.value;

    if( DATE_REGEXP.test(value ) ) {
      value = value.split('/');
      var day = value[0];
      var month = value[1];
      var year = value[2];

      this.setState({
        model: new Date(year, month - 1, day).getTime(),
        tempValue: this.formatTime(new Date(year, month - 1, day).getTime()),
        currentDate: new Date(year, month - 1, 1)
      });

      this.props.config.model[ this.props.config.name ].value = new Date(year, month - 1, day).getTime();
    } else {
      this.setState({
        model: '',
        tempValue: value
      });
      this.props.config.model[ this.props.config.name ].value = '';
    }

    this.props.adapt.observe.digest();
  },
  parseMonth: function(month, year) {
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var firstDay = new Date(year, month, 1).getDay();
    var lastMonth = new Date(year - (month === 0 ? 1 : 0), (month === 0 ? 11 : month - 1) + 1, 0);
    var nextMonth = new Date(year + (month === 11 ? 1 : 0), (month === 11 ? 0 : month + 1), 1);
    var last = firstDay;
    var nextMonthDays;
    var days = {};

    this.state.date.nextMonth = {
      month: nextMonth.getMonth(),
      year: nextMonth.getFullYear()
    };
    this.state.date.lastMonth = {
      month: lastMonth.getMonth(),
      year: lastMonth.getFullYear()
    };

    var month = this.state.currentDate ? this.state.currentDate.getMonth() : new Date(this.state.today).getMonth();

    this.state.date.displayMonth = this.months[month];
    this.state.date.displayYear = year;

    for (var j = last; j--;) {
      var day = {
        day: lastMonth.getDate() - j,
        year: lastMonth.getFullYear(),
        month: lastMonth.getMonth(),
      };

      days['day-' + day.day + '-' + day.month] = (
        React.DOM.li({onClick:  this.changeDate.bind(this, day) }, 
           lastMonth.getDate() - j
        )
        );
    }

    for (var i = 0; i < daysInMonth; i++) {
      var timestamp = new Date(year, month, i + 1).getTime();

      var day = {
        day: i + 1,
        today: timestamp === this.state.today,
        year: year,
        month: month,
        timestamp: timestamp,
        currentMonth: true
      };

      days['day-' + day.day + '-' + day.month] = (
        React.DOM.li({
          onClick:  this.changeDate.bind(this, day), 
          className:  ( day.today ? 'today ' : '' ) + 'month' + ( timestamp == this.state.model ? ' selected' : '') }, 
           day.day
        )
        );
    }

    var length = Object.keys(days).length;

    nextMonthDays = (Math.ceil(length / 7) * 7) - length;

    for (var z = 0; z < nextMonthDays; z++) {

      var day = {
        day: z + 1,
        year: nextMonth.getFullYear(),
        month: nextMonth.getMonth()
      };

      days['day-' + day.day + '-' + day.month] = (
        React.DOM.li({onClick:  this.changeDate.bind(this, day) }, 
           z + 1
        )
      );
    }

    return days;

  },
  changeMonth: function( month, year ) {
    this.parseMonth(month, year);
    this.setState({currentDate: new Date(year, month, 1)});
  },
  changeDate: function( day ) {
    if( day && day.day ) {
      this.state.model = new Date(day.year, day.month, day.day).getTime();
      this.state.open = false;
      this.state.tempValue = this.formatTime(this.state.model);

      this.props.config.model[ this.props.config.name ].value = this.state.model;
      this.props.adapt.observe.digest();
    }
    this.changeMonth(day.month, day.year);
  },
  formatTime: function(value) {
    value = new Date(value);
    return ('0' + value.getDate()).slice(-2) + '/' + ('0' + (value.getMonth()+1)).slice(-2) + '/' + value.getFullYear();
  },
  render: function( ) {
    var
      value = this.state.model,
      type = this.state.type,
      item = this.state.item;

    this.state.open = this.state.open || false;

    this.state.date = {};

    this.months = [
     'January', 'February', 'March', 'April', 'May', 'June',
     'July','August','September','October','November','December'
    ];

    this.state.today = new Date();

    this.state.today = new Date(this.state.today.getFullYear(), this.state.today.getMonth(), this.state.today.getDate()).getTime();

    if( value ) {
      var a = new Date(value);
      this.state.model = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
    }

    this.state.currentDate = value || this.state.currentDate ? ( this.state.currentDate || new Date(value) ) : false;

    var month = this.state.currentDate ? this.state.currentDate.getMonth() : new Date(this.state.today).getMonth();
    var year = this.state.currentDate ? this.state.currentDate.getFullYear() : new Date(this.state.today).getFullYear();

    this.state.date.lastMonth = {};
    this.state.date.nextMonth = {};
    this.state.date.days = this.parseMonth(month, year);
    this.state.date.displayMonth = this.months[month];
    this.state.date.displayYear = year;

    function days (value, index) {
      return React.DOM.li({key: index }, value );
    }

    return (
      React.DOM.div({className: 'field field__inputdate field__input field__inputdate--' + this.state.name + this.id}, 
        
          typeof item.label === 'undefined' ? '' :
          adapt.components.label({config:  { item: item}, adapt:  this.props.adapt}), 
          
        React.DOM.div({className:  ( this.state.open ? 'open ' : '' ) + 'field__inputdate--container'}, 
          React.DOM.input({onFocus:  this.setStatus.bind(this, true), value:  this.state.tempValue, type: "text", onChange:  this.handleChange, placeholder: "dd/mm/yyyy", onClick:  this.setStatus.bind(this, true) }), 
          React.DOM.i({className: "fa fa-calendar no-select", onClick:  this.setStatus.bind(this, !this.state.open) }), 
          React.DOM.div({className: "inputdate__dropdown no-select"}, 
            React.DOM.div({className: "inputdate__dropdown--header"}, 
              React.DOM.i({className: "fa fa-chevron-left", onClick:  this.changeDate.bind(this, this.state.date.lastMonth) }), 
              React.DOM.i({className: "fa fa-chevron-right", onClick:  this.changeDate.bind(this, this.state.date.nextMonth) }), 
              React.DOM.div(null, 
                 this.state.date.displayMonth + ' ' + this.state.date.displayYear
              )
            ), 
            React.DOM.ul({className: "inputdate__days"}, 
               this.props.days.map(days) 
            ), 
            React.DOM.ul({className: "inputdate__list"}, 
               this.state.date.days
            )
          ), 
          
            typeof item.desc === 'undefined' ? '' :
            adapt.components.description({config:  { item: item}, adapt:  this.props.adapt})
          
        )
      )
    );
  }
};

adapt.component('inputDate', AdaptInputDate);

},{"../api/core":2,"../api/utils":7}],20:[function(require,module,exports){
/** @jsx React.DOM */'use strict';

var utils = require('../api/utils');
var adapt = require('../api/core');

var AdaptItem = {
  displayName: 'AdaptItem',
  render: function () {
    var item = this.props.config.item;

    var dynamicItem = adapt.component(item.type.split(':')[0]);

    var possibleItem = utils.convertToCamelCase(item.type);

    if( adapt.components[possibleItem] ) {
      dynamicItem = adapt.component(possibleItem);
    }

    this.props.config.item.fullName = this.props.config.nameTrail + this.props.config.name;

    return this.transferPropsTo( dynamicItem() );
  }
};

adapt.component('item', AdaptItem);

},{"../api/core":2,"../api/utils":7}],21:[function(require,module,exports){
/** @jsx React.DOM */var adapt = require('../api/core');

var AdaptLabel = {
  displayName: 'AdaptLabel',
  componentWillMount: function( ) {
    var that = this;
    var item = this.props.config.item;
    this.listener = this.props.adapt.observe.addListener(function( ) {
      return item.label;
    }, function( newVal, oldVal ) {
      that.setState({text: newVal});
    });
  },
  componentWillUnmount: function () {
    this.listener();
  },
  getInitialState: function () {
    var config = this.props.config;
    return {
      text: config.item.label
    };
  },
  render: function () {
    return React.DOM.h4({className: "label"},  this.props.config.item.label);
  }
};

adapt.component('label', AdaptLabel);

},{"../api/core":2}],22:[function(require,module,exports){
/** @jsx React.DOM */'use strict';

var view  = require('../api/view');
var utils = require('../api/utils');
var adapt = require('../api/core');

var AdaptLoop = {
  getInitialState: function () {
    return {
      listeners: [],
      currentState: this.props.adapt.state
    };
  },
  displayName: 'AdaptLoop',
  componentWillMount: function () {
    var _this = this;
    this.state.listeners.push(
      this.props.adapt.observe.addListener( function() {
        return _this.props.adapt.state;
      }, function ( newVal ) {
        _this.setState({
          currentState: newVal
        });
      } )
    );
  },
  componentWillUnmount: function () {
    this.state.listeners.forEach( function( element ) {
      element();
    } );
  },
  render: function () {
    var items = this.props.items;
    var controller = this.props.controller;
    var values = this.props.values;
    var nameTrail = this.props.nameTrail;
    var observe = this.props.observe;
    var model = this.props.model;

    var render = [];

    var dynamicItem = adapt.components.item;
    var currentState = this.state.currentState;

    for( var i in items ) {
      var show = true;
      var item = items[i];

      if( utils.checkState( item.state, currentState ) ) {
        render.push(
          this.transferPropsTo(
            dynamicItem( {
              config: {
                model: model,
                name: i,
                item: item,
                controller: controller,
                values: values,
                observe: observe,
                nameTrail: nameTrail
              }
            } )
          )
        );
      }
    }

    return React.DOM.div(null, render );
  }
};

adapt.component('loop', AdaptLoop);

},{"../api/core":2,"../api/utils":7,"../api/view":8}],23:[function(require,module,exports){
/** @jsx React.DOM */var adapt = require('../api/core');
var Utils = require('../api/utils');

var AdaptRadio = {
  extend: [adapt.mixins.flat],
  displayName: 'AdaptRadio',
  render: function( ) {
    var cx = React.addons.classSet;

    var
      model = this.state.model,
      type = this.state.type,
      item = this.props.config.item;

    var naSelected = this.state.na || !model.length;

    var label = adapt.component('label');

    var checkboxes = [];
    var items = item.options;

    if( item.includeNA ) {
      var classes = cx({
        'field__radio--item': true,
        'field__radio--active': naSelected
        });

      checkboxes.push(
        React.DOM.div({className: classes, key: "na", onClick:  this.toggleNA}, 
          React.DOM.i({className: "fa fa-fw fa-circle"}), 
          React.DOM.i({className: "fa fa-fw fa-circle-o"}), 

          "N/A"
        )
        );
    }

    for( var i in items ) {
      var classes = cx({
        'field__radio--item': true,
        'field__radio--active': model === i
        });


      checkboxes.push(
        React.DOM.div({className: classes, key:  this.props.config.name + i, onClick:  this.handleChange.bind(this, { target: { value: i } }) }, 
          React.DOM.i({className: "fa fa-fw fa-circle-o"}), 
          React.DOM.i({className: "fa fa-fw fa-check-circle"}), 
           items[i] 
        )
        );
    }

    return (
      React.DOM.div({className: "field field__radio"}, 
        
          typeof item.label === 'undefined' ? '' :
          adapt.components.label({config:  { item: item}, adapt:  this.props.adapt}), 
          
        checkboxes, 
        React.DOM.div({className: "field__radio--container"}, 

          
            typeof item.desc === 'undefined' ? '' :
            adapt.components.description({config:  { item: item}, adapt:  this.props.adapt})
            
        )
      )
    );
  }
};

adapt.component('radio', AdaptRadio);

},{"../api/core":2,"../api/utils":7}],24:[function(require,module,exports){
/** @jsx React.DOM */var Utils = require('../api/utils');
var adapt = require('../api/core');

var AdaptSelect = {
  displayName: 'AdaptSelect',
  extend: [adapt.mixins.flat],
  handleClick: function(i) {
    this.setState({model: this.state.item.options[i].value, open: false});

    this.props.config.model[ this.props.config.name ].value = this.state.item.options[i].value;
    this.props.adapt.observe.digest();
  },
  setStatus: function( value ) {
    this.setState({open: value});
  },
  componentDidMount: function( ) {
    var that = this;
    document.addEventListener('click', function(e){
      if( !Utils.findClosestParent(e.target, 'field__select--' + that.state.name) ) {
        if( that.state.open ) {
          that.setStatus(false);
        }
      }
    });
  },
  render: function( ) {
    var
      value = this.state.model,
      type = this.state.type,
      item = this.props.config.item;

    this.state.open = this.state.open || false;

    var items = {};

    if( item.options ) {
      for( var i = 0; i < item.options.length; i++ ) {
        items['item-' + i] = (
          React.DOM.li({onClick:  this.handleClick.bind(this, i), className:  value == item.options[i].value ? 'active' : ''}, 
            React.DOM.i({className: "fa fa-check"}), 
             item.options[i].label
          )
          );
      }
    } else {
      console.warn('[select]: No options provided');
    }

    var displayValue;
    if( value ) {
      var index = this.state.item.options.filter(function(obj){
        return obj.value == value;
      });

      if( index.length ) {
        displayValue = index[0].label;
      }
    }

    return (
      React.DOM.div({className: 'field field__select field__select--' + this.state.name}, 
        
          typeof item.label === 'undefined' ? '' :
          adapt.components.label({config:  { item: item}, adapt:  this.props.adapt}), 
          
        React.DOM.div({className: "field__select--container"}, 
          React.DOM.div({className:  ( this.state.open ? 'open ' : '' ) + 'field__select--current no-select', onClick:  this.setStatus.bind(this, !this.state.open) }, 
            React.DOM.i({className: "fa fa-sort"}), 
             displayValue || 'Please select..'
          ), 
          React.DOM.ul({className:  ( this.state.open ? 'open ' : '' ) + 'field__select--dropdown'}, 
            items 
          ), 
          
            typeof item.desc === 'undefined' ? '' :
            adapt.components.description({config:  { item: item}, adapt:  this.props.adapt})
            
        )
      )
    );
  }
};

adapt.component('select', AdaptSelect);

},{"../api/core":2,"../api/utils":7}],25:[function(require,module,exports){
/** @jsx React.DOM */var adapt = require('../api/core');
var Utils = require('../api/utils');

var AdaptSelectMultiple = {
  displayName: 'AdaptSelectMultiple',
  statics: {
    defaultModelValue: []
  },
  extend: [adapt.mixins.array],
  render: function( ) {
    var
      value = this.state.model,
      type = this.state.type,
      item = this.props.config.item,
      options = this.props.config.item.options;

    var optionList = {};

    if( options ) {
      for( var i = 0; i < options.length; i++ ) {
        optionList['option-' + i] = (
            React.DOM.li({className: (value.indexOf(options[i].value) > -1 ? 'active': '') + ' field__selectmultiple--item no-select', ref:  'option' + i, onClick:  this.handleChange.bind(this, i) }, 
              React.DOM.i({className: "fa fa-check fa-fw"}), 

               options[i].label
            )
          );
      }
    } else {
      console.warn('[selectMultiple]: No options provided');
    }

    return (
      React.DOM.div({className: "field field__select"}, 
        
          typeof item.label === 'undefined' ? '' :
          adapt.components.label({config:  { item: item}, adapt:  this.props.adapt}), 
          
        React.DOM.div({className: "field__select--container"}, 
          React.DOM.ul({className: "field__selectmultiple"}, 
            optionList 
          ), 
          
            typeof item.desc === 'undefined' ? '' :
            adapt.components.description({config:  { item: item}, adapt:  this.props.adapt})
            
        )
      )
    );
  }
};

adapt.component('selectMultiple', AdaptSelectMultiple);

},{"../api/core":2,"../api/utils":7}],26:[function(require,module,exports){
/** @jsx React.DOM */'use strict';

var adapt = require('../api/core');
var Utils = require('../api/utils');

var AdaptTabcordion = {
  displayName: 'AdaptTabcordion',
  getInitialState: function( ) {
    var config = this.props.config;

    return {
      item: config.item,
      model: config.model,
      openTab: 0,
      openAccordion: 1,
      accordions: {},
      openDropdown: -1
    };
  },
  open: function( tabId, accordionId ) {
    this.setState( {
      openTab: tabId,
      openAccordion: accordionId > -1 ? accordionId : -1
    } );
  },
  addAccordion: function( accordionName ) {

    var newModel = {};
    var config = this.props.config;

    this.props.adapt.model.createModel(config.item.items[accordionName].model, newModel);

    config.model[accordionName].value.push(newModel);

    this.props.adapt.observe.digest();

    this.setState({
      openAccordion: config.model[accordionName].value.length - 1
    });

  },
  componentDidMount: function( ) {
    var _this = this;
    document.addEventListener('click', function(e){
      if( !Utils.findClosestParent(e.target, 'tabcordion__accordion--item') ) {
        _this.setState({
          openDropdown: -1
        });
      }
    });
  },
  copyAccordion: function( accordionName, accordionId) {
    var config = this.props.config;

    var newModel = {};
    var config = this.props.config;

    this.props.config.model[accordionName].value.push(
      JSON.parse(JSON.stringify((config.model[accordionName].value[accordionId])))
      );

    this.props.adapt.observe.digest();

    this.setState({
      openAccordion: config.model[accordionName].value.length - 1,
      openDropdown: -1
    })
  },
  listeners: [],
  removeAccordion: function( accordionName, accordionId ) {
    var config = this.props.config;

    var currentlyOpened = this.state.accordions[accordionName][this.state.openAccordion];

    var arr = config.model[ accordionName ].value;
    arr.splice(accordionId, 1);

    this.props.config.model[ accordionName ].value = arr;

    this.state.accordions[accordionName].splice(accordionId, 1);

    this.props.adapt.observe.digest();

    var toOpen;
    if( accordionId === this.state.openAccordion ) {
      if( this.props.config.model[accordionName ].value.length ) {
        if( accordionId > 0 ) {
          toOpen = accordionId - 1;
        } else {
          toOpen = 0;
        }
      } else {
        toOpen = -1;
      }
    } else {
      toOpen = this.state.accordions[accordionName].indexOf(currentlyOpened);
    }

    this.setState({
      openAccordion: toOpen,
      openDropdown: -1
    })
  },
  openDropdown: function(id) {
    this.setState({
      openDropdown: id === this.state.openDropdown ? -1 : id
    });
  },
  render: function( ) {
    var cx = React.addons.classSet;

    var item = this.props.config.item;
    var model = this.state.model;
    var config = this.props.config;

    var header = [];
    var content = [];

    var items = item.items;

    var _this = this;

    var openTab = this.state.openTab;
    var openAccordion = this.state.openAccordion;

    var r = 0;
    for( var i in items ) {
    	var handleType = {
    		tab: function(r) {
          var classes = cx({
            'tabcordion__nav--item': true,
            'tabcordion__nav--active': openTab === r
            });

    			header.push(
    				React.DOM.li({key: i, className: classes, onClick:  this.open.bind(this, r) }, 
    					 items[i].title
    				)
    				);

          var element = items[i];

          var children = [];

          var loop = adapt.components.loop;

          children = loop(
              {
                items: element.items,
                controller: config.controller,
                values: config.values,
                observe: config.observe,
                nameTrail: config.nameTrail,
                model: model,
                adapt: _this.props.adapt
              }
            );

          var classes = cx({
              'tabcordion__content--item': true,
              'clear': true,
              'tabcordion__content--active': openTab === r
            });

          content.push(
            React.DOM.div({className: classes, key: i }, 
              children 
            )
            );
    		},
    		accordion: function(r) {

    			var navChildren = [];

          model[i].value.forEach( function( element, index ) {
            var title = items[i].accordionTitle;
            var subtitle = items[i].accordionSubtitle;

            var contentChildren = [];

            title = title.replace(/{([^}]+)}/g, function( match ) {
              var replace = {
                '{index}': function( ) {
                  return index + 1;
                }
              };

              return (replace[match] || replace['default'])();
            } );

            if( subtitle ) {
              subtitle = subtitle.replace(/{([^}]+)}/g, function( match ) {
                var replace = {
                  '{index}': function( ) {
                    return index + 1;
                  },
                  'default': function( ) {
                    var modelName = match.replace('{', '').replace('}', '');

                    if(  model[i].value[index][modelName] ) {
                      return model[i].value[index][modelName].value;
                    } else {
                      return '';
                    }
                  }
                };

                return (replace[match] || replace['default'])();
              } );
            }

            var classes = cx({
              'tabcordion__accordion--item': true,
              'tabcordion__accordion--active': openAccordion === index && openTab === r
            });

            var dropDownClasses = cx({
              'tabcordion__accordion--dropdown': true,
              'tabcordion__accordion--dropdown--active': this.state.openDropdown === index
            });

            var arrowClasses = cx({
              'fa fa-fw': true,
              'fa-caret-down': !(this.state.openDropdown === index),
              'fa-caret-up': this.state.openDropdown === index
            });

      			navChildren.push(
      				React.DOM.li({key: index, className: classes }, 
                React.DOM.span({className: "tabcordion__accordion--holder", onClick:  this.open.bind(this, r, index) }, 
    					   	title, 

                  React.DOM.span({className: "tabcordion__accordion--title", dangerouslySetInnerHTML: {__html: subtitle || '&nbsp;'}}
                  )
                ), 

                React.DOM.i({className: arrowClasses, onClick:  this.openDropdown.bind(this, index) }), 

                React.DOM.div({className: dropDownClasses }, 
                  React.DOM.span({onClick:  this.copyAccordion.bind(this, i, index) }, 
                    "Duplicate"
                  ), 
                  React.DOM.span({className: "remove", onClick:  this.removeAccordion.bind(this, i, index) }, 
                    "Remove"
                  )
                )
  					 )
      			);

            var loop = adapt.components.loop;

            contentChildren = loop(
              {
                items: items[i].model,
                controller: config.controller[i],
                values: config.values,
                observe: config.observe,
                nameTrail: config.nameTrail + i + '.',
                model: model[i].value[index],
                adapt: _this.props.adapt
              }
            );

            var classes = cx({
              'tabcordion__content--item': true,
              'clear': true,
              'tabcordion__content--active': openAccordion === index && openTab === r
            });

            if( !this.state.accordions[i] ) {
              this.state.accordions[i] = [];
            }

            if( !this.state.accordions[i][index] ) {
              this.state.accordions[i][index] = +new Date() + Math.random();
            }

            var key = this.state.accordions[i][index];

            content.push(
              React.DOM.div({className: classes, key: key }, 
                contentChildren 
              )
              );
          }, this );

          var classes = cx({
            'tabcordion__nav--item': true,
            'tabcordion__nav--active': openTab === r
          });

    			header.push(
    				React.DOM.li({className: classes }, 
        				 items[i].title, 

        				React.DOM.ul({className: "tabcordion__accordion"}, 
        					navChildren, 
        					React.DOM.li({className: "tabcordion__accordion--item tabcordion__accordion--add", onClick:  this.addAccordion.bind( this, i) }, 
        						React.DOM.i({className: "fa fa-plus fa-fw"}), 
        						 items[i].addText || 'Add Item'
        					)
        				)
        			)
    				);
    		}
    	}

      handleType[items[i].tabType].call(this, r);

      ++r;
    }

    return (
      React.DOM.div({className: "tabcordion no-select clear"}, 
        React.DOM.div({className: "tabcordion__nav"}, 
        	React.DOM.ul({className: "tabcordion__nav--list"}, 
        		header 
        	), 
          React.DOM.span({className: "tabcordion__divider"})
        ), 
        React.DOM.div({className: "tabcordion__content"}, 
          content 
        )
      )
    );
  }
};

adapt.component('tabcordion', AdaptTabcordion);

},{"../api/core":2,"../api/utils":7}],27:[function(require,module,exports){
/** @jsx React.DOM */var adapt = require('../api/core');
var Utils = require('../api/utils');

var AdaptTable = {
  displayName: 'AdaptTable',
  extend: [adapt.mixins.arrayObject],
  render: function( ) {
    var item = this.props.config.item;
    var config = this.props.config;
    var openID = this.state.open || -1;
    var items = [];
    var model = this.state.model;

    var simple = !!config.item.type.split(':')[1];

    var header = [];

    console.log(item.model);

    for( var i in item.model ) {
      header.push(
        React.DOM.th({key: i }, 
           item.model[i].label
        )
        );
    }

    var t = 0;

    if (model) {
      for( var i = 0; i < model.length; i++ ) {
        var children = [];

        if(!simple) {
          children.push( React.DOM.td({className: "id"},  i + 1) );
        }

        var config = this.props.config;

        for( var r in item.model ) {
          var newItem = Utils.copy(item.model[r]);
          delete newItem.desc;
          delete newItem.label;

          var itemConfig = {
            model: config.model[config.name].value[i],
            controller: config.controller[config.name],
            name: r,
            item: newItem,
            values: config.values,
            observe: config.observe,
            nameTrail: config.nameTrail + config.name + '.'
          };

          var contents = this.transferPropsTo(adapt.components.item({config: itemConfig }));

          children.push(
              React.DOM.td({key:  t + r}, 
                contents 
              )
                );

          t++;
        }

        children.push(
          React.DOM.td({className: "th__options"}, 
            React.DOM.span({onClick:  this.remove.bind(this, i) }, 
              React.DOM.i({className: "fa fa-times fa-fw"})
            )
          )
          );

        var REGEX_CURLY = /{([^}]+)}/g;

        items.push(
          React.DOM.tr({key: i }, 
            children
          )
        );
      };
    }

    return (
      React.DOM.div({className:  'element__table clear no-select ' + ( simple ? 'element__table--simple' : '') }, 
        React.DOM.table({cellPadding: "0", cellSpacing: "0"}, 
          React.DOM.thead({className:  items.length ? '' : 'empty'}, 
            React.DOM.tr(null, 
              
                simple ? '' :
                React.DOM.th({className: "id"}, "#"), 
              
              header, 
              React.DOM.th({className: "th__options"}, 
                React.DOM.span({onClick:  this.add}, 
                  React.DOM.i({className: "fa fa-plus fa-fw"})
                )
              )
            )
          ), 
          React.DOM.tbody(null, 
            items
          )
        )
      )
    );
  }
};

adapt.component('table', AdaptTable);

},{"../api/core":2,"../api/utils":7}],28:[function(require,module,exports){
/** @jsx React.DOM */'use strict';

var adapt = require('../api/core');
var Utils = require('../api/utils');

var AdaptTabs = {
  displayName: 'AdaptTabs',
  getInitialState: function( ) {
    var config = this.props.config;

    var style = 'default';
    var split = config.item.type.split(':');
    if( split.length > 1 ) {
      style = split[1];
    }
    return {
      item: config.item,
      model: config.model,
      open: 0,
      style: 'tabs' + style
    };
  },
  open: function(id) {
    this.setState({open: id});
  },
  render: function( ) {

    var item = this.props.config.item;
    var model = this.state.model;
    var config = this.props.config;


    var header = [];
    var content = [];

    var items = item.items;

    var t = 0;
    for( var i in items ) {
      if( Utils.checkState( items[i].state, this.props.adapt.state ) ) {
        header.push(
          React.DOM.li({key: i, onClick:  this.open.bind(this, t), className:  this.state.style + '__header--item ' + ( this.state.open == t ? this.state.style + '__header--open' : '' ) + ( this.state.open - 1 == t ? this.state.style + '__header--beforeopen' : '') }, 
             items[i].title
          )
          );

        var children = [];

        var loop = adapt.components.loop;

        children = loop(
            {
              items: items[i].items,
              controller: config.controller,
              values: config.values,
              observe: config.observe,
              nameTrail: config.nameTrail,
              model: config.model,
              adapt: this.props.adapt
            }
          );

        var style = {};
        if( items[i].padding ) {
          style.padding = items[i].padding;
        }


        content.push(
          React.DOM.div({style: style, className:  this.state.style + '__content--item ' + ( this.state.open == t ? this.state.style + '__content--open' : '') }, 
            children 
          )
          );
      }

      t++;
    }

    return (
      React.DOM.div({className:  this.state.style + ' no-select'}, 
        React.DOM.ul({className:  this.state.style + '__header clear'}, 
          header 
        ), 
        React.DOM.div({className:  this.state.style + '__content'}, 
          content 
        )
      )
    );
  }
};

adapt.component('tabs', AdaptTabs);

},{"../api/core":2,"../api/utils":7}],29:[function(require,module,exports){
/** @jsx React.DOM */var adapt = require('../api/core');

var AdaptTextarea = {
  extend: [adapt.mixins.flat],
  displayName: 'AdaptTextarea',
  render: function( ) {
    var
      model = this.state.model,
      type = this.state.type,
      item = this.state.item;

      var label = adapt.component('label');

    return (
      React.DOM.div({className: "field field__textarea"}, 
        
          typeof item.label === 'undefined' ? '' :
          adapt.components.label({config:  { item: item}, adapt:  this.props.adapt}), 
          
        React.DOM.div({className: "field__textarea--container"}, 
          React.DOM.textarea({onChange:  this.handleChange, placeholder:  item.placeholder, value: model }), 
          
            typeof item.desc === 'undefined' ? '' :
            adapt.components.description({config:  { item: item}, adapt:  this.props.adapt})
            
        )
      )
    );
  }
};

adapt.component('textarea', AdaptTextarea);

},{"../api/core":2}],30:[function(require,module,exports){
'use strict';

var adapt = require('../api/core');

var array = {
  statics: {
    defaultModelValue: []
  },
  getInitialState: function( ) {
    var config = this.props.config;

    return {
      model: config.model[config.name].value,
      item: config.item,
      name: config.name,
    };
  },
  handleChange: function(i) {
    var
      model = this.state.model,
      options = this.props.config.item.options;

    // find the location of the item
    var index = model.indexOf(options[i].value);
    if( index > -1 ) {
      // remove it
      model.splice(index, 1);
    } else {
      // add it
      model.push(options[i].value);
    }

    // update the model
    this.props.config.model[ this.props.config.name ].value = model;

    // let everyone know
    this.props.adapt.observe.digest();

    // keep the view in sync
    this.setState({model: model});
  },
};

adapt.mixin('array', array);

},{"../api/core":2}],31:[function(require,module,exports){
'use strict';

var adapt = require('../api/core');

var arrayObject = {
  statics: {
    defaultModelValue: []
  },
  getInitialState: function( ) {
    var config = this.props.config;

    return {
      model: config.model[config.name].value
    };
  },
  remove: function(id) {
    var config = this.props.config;

    var arr = config.model[config.name].value;
    arr.splice(id, 1);

    this.props.config.model[ this.props.config.name ].value = arr;

    this.props.adapt.observe.digest();

    this.setState({model: arr});

    if( !arr.length ) {
      this.setState( { open: -1 } );
    }
  },
  add: function( ) {
    var newModel = {};
    var config = this.props.config;

    this.props.adapt.model.createModel(config.item.model, newModel);

    config.model[config.name].value.push(newModel);

    this.props.adapt.observe.digest();

    this.forceUpdate();
  },
};

adapt.mixin('arrayObject', arrayObject);

},{"../api/core":2}],32:[function(require,module,exports){
var adapt = require('../api/core');

var flat = {
  statics: {
    defaultModelValue: ''
  },
  expressionValue: function () {},
  setExpressionValue: function () {
    var that = this;
    var config = this.props.config;

    if( config.values[config.nameTrail + config.name] ) {
      this.expressionValue();


      this.expressionValue = this.props.adapt.observe.addListener(function () {
        return config.values[config.nameTrail + config.name].call(config.model);
      }, function(newVal) {
        that.props.config.model[that.props.config.name].value = newVal;

        that.setState({
          model: newVal
        });
      });

      this.setState({
        model: config.values[config.nameTrail + config.name].call(config.model),
      });
    }
  },
  setObservers: function () {
    var that = this;
    var config = this.props.config;

    var observers = config.observe[config.nameTrail + config.name];

    for( var i in observers) {
      observers[i].forEach( function( element, index ) {
        that.listeners.push(
          that.props.adapt.observe.addListener(function(){
            return config.model[config.name][i];
          }, function (newVal, oldVal, diff) {
            return element.call(config.model, newVal, oldVal, diff, config.name);
          } )
        );
      });
    }
  },
  listeners: [],
  componentWillMount: function () {
    var that = this;
    var config = this.props.config;

    var model = config.model[config.name];

    var expressionValue;

    if( config.values[config.nameTrail + config.name] ) {
      this.setExpressionValue();
    }

    if( config.observe[config.nameTrail + config.name] ) {
      this.setObservers();
    }

    this.state.listeners.push(
      this.props.adapt.observe.addListener(function () {
        return config.values[config.nameTrail + config.name];
      }, function( newVal ) {
        that.setExpressionValue();
      } )
    );

    this.state.listeners.push(
      this.props.adapt.observe.addListener(function () {
        return config.observe[config.nameTrail + config.name];
      }, function( newVal ) {
        that.setObservers();
      } )
    );

    this.state.listeners.push(
      this.props.adapt.observe.addListener(function () {
        try {
          return config.model[config.name].model;
        } catch(e){
          return null;
        }
      }, function( newVal, oldVal ) {
        if( newVal !== null ) {
          that.setState({modelClass: newVal});
        }
      } )
    );

    this.state.listeners.push(
        this.props.adapt.observe.addListener(function () {
          try {
            return config.model[config.name].value;
          } catch(e){
            return null;
          }
      }, function( newVal, oldVal ) {
          if( newVal !== null ) {
            that.setState({model: newVal});
          }
      } )
    );
  },
  componentWillUnmount: function( ) {
    this.expressionValue();

    this.state.listeners.forEach( function( element ) {
      element();
    } );
  },
  getInitialState: function( ) {
    var config = this.props.config;

    return {
      model: config.model[config.name].value,
      modelClass: '',
      item: config.item,
      name: config.name,
      listeners: []
    };
  },
  handleChange: function(event) {
    this.props.config.model[ this.props.config.name ].value = event.target.value;
    this.props.adapt.observe.digest();

    this.setState({model: event.target.value});
  }
};

adapt.mixin('flat', flat);

},{"../api/core":2}],33:[function(require,module,exports){
var adapt = require('../api/core');

var object = {};

adapt.mixin('object', object);

},{"../api/core":2}],"adapt":[function(require,module,exports){
/** @jsx React.DOM */'use strict';

var Core       = require('./api/core');

require('./api/items');

var Observe    = require('./api/observe');
var View       = require('./api/view');
var Model      = require('./api/model');
var Controller = require('./api/controller');
var Utils = require('./api/utils');

function Adapt(config) {
  this.config = config;
  this.observe = new Observe();
  this.view = new View(this);
  this.model = new Model(this);
  this.controller = new Controller(this);

  var state = config.state;
  if( state ) {
    if( Utils.isArray(state) ) {
      this.state = state;
    } else {
      this.state = [state || 'default'];
    }
  } else {
    this.state = ['default'];
  }
}

Adapt.prototype.render = function (element) {
  var form = Core.components.form;

  console.dir(Core.components.select);

  React.renderComponent( form( { adapt: this} ), element);

  this.observe.digest();
};

Adapt.prototype.setState = function (state) {
  if( Utils.isArray( state ) ) {
    this.state = state;
  } else {
    this.state = [state];
  }

  this.observe.digest();
};

Adapt.prototype.addState = function (state) {
  this.state.push(state);

  this.observe.digest();
};

Adapt.prototype.removeState = function (state) {
  var index = this.state.indexOf(state);

  if( index > -1 ) {
    this.state.splice(index, 1);
  }
};

Adapt.forms = {};

Adapt.form = function form(name, config) {
  if (config) {
    this.forms[name] = new Adapt(config);
  }
  if (!this.forms[name]) {
    throw new Error('[' + name + '] is not a form');
  }
  return this.forms[name];
};

Adapt.components = Core.components;
Adapt.component = Core.component;
Adapt.mixins = Core.mixins;
Adapt.mixin = Core.mixin;

window.Adapt = Adapt;
module.exports = Adapt;

},{"./api/controller":1,"./api/core":2,"./api/items":4,"./api/model":5,"./api/observe":6,"./api/utils":7,"./api/view":8}]},{},["adapt"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBpL2NvbnRyb2xsZXIuanMiLCJzcmMvYXBpL2NvcmUuanN4Iiwic3JjL2FwaS9maW5kLmpzIiwic3JjL2FwaS9pdGVtcy5qcyIsInNyYy9hcGkvbW9kZWwuanMiLCJzcmMvYXBpL29ic2VydmUuanMiLCJzcmMvYXBpL3V0aWxzLmpzIiwic3JjL2FwaS92aWV3LmpzIiwic3JjL2NvbXBvbmVudHMvYWNjb3JkaW9uLmpzeCIsInNyYy9jb21wb25lbnRzL2J1dHRvbi5qc3giLCJzcmMvY29tcG9uZW50cy9jaGVja2JveC5qc3giLCJzcmMvY29tcG9uZW50cy9jb2x1bW4uanN4Iiwic3JjL2NvbXBvbmVudHMvY29sdW1uUm93cy5qc3giLCJzcmMvY29tcG9uZW50cy9kZXNjcmlwdGlvbi5qc3giLCJzcmMvY29tcG9uZW50cy9mb3JtLmpzeCIsInNyYy9jb21wb25lbnRzL2hlYWRlci5qc3giLCJzcmMvY29tcG9uZW50cy9oci5qc3giLCJzcmMvY29tcG9uZW50cy9pbnB1dC5qc3giLCJzcmMvY29tcG9uZW50cy9pbnB1dERhdGUuanN4Iiwic3JjL2NvbXBvbmVudHMvaXRlbS5qc3giLCJzcmMvY29tcG9uZW50cy9sYWJlbC5qc3giLCJzcmMvY29tcG9uZW50cy9sb29wLmpzeCIsInNyYy9jb21wb25lbnRzL3JhZGlvLmpzeCIsInNyYy9jb21wb25lbnRzL3NlbGVjdC5qc3giLCJzcmMvY29tcG9uZW50cy9zZWxlY3RNdWx0aXBsZS5qc3giLCJzcmMvY29tcG9uZW50cy90YWJjb3JkaW9uLmpzeCIsInNyYy9jb21wb25lbnRzL3RhYmxlLmpzeCIsInNyYy9jb21wb25lbnRzL3RhYnMuanN4Iiwic3JjL2NvbXBvbmVudHMvdGV4dGFyZWEuanN4Iiwic3JjL21peGlucy9hcnJheS5qcyIsInNyYy9taXhpbnMvYXJyYXlPYmplY3QuanMiLCJzcmMvbWl4aW5zL2ZsYXQuanMiLCJzcmMvbWl4aW5zL29iamVjdC5qcyIsInNyYy9hZGFwdC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGFkYXB0ID0gcmVxdWlyZSgnLi9jb3JlJyk7XG5cbi8qKlxuICogQ29udHJvbGxlciBPYmplY3QsIGhvbGRzIGNvbnRyb2xsZXIgdmFsdWVzXG4gKi9cbmZ1bmN0aW9uIENvbnRyb2xsZXIoKSB7XG5cbn1cblxuLyoqXG4gKiBDcmVhdGUgZXZlcnl0aGluZyB0byBkbyB3aXRoIHRoZSBjb250cm9sbGVyXG4gKiBAcGFyYW0ge2FkYXB0fSBhZGFwdCBBZGFwdCBJbnN0YW5jZVxuICovXG5mdW5jdGlvbiBDb250cm9sbGVyU2VydmljZSggYWRhcHQgKSB7XG4gIC8qKlxuICAgKiBBZGFwdCBJbnN0YW5jZVxuICAgKiBAdHlwZSB7YWRhcHR9XG4gICAqL1xuICB0aGlzLiRhZGFwdCA9IGFkYXB0O1xuXG4gIC8qKlxuICAgKiBDb250cm9sbGVyIEl0ZW1zXG4gICAqIEB0eXBlIHtDb250cm9sbGVyfVxuICAgKi9cbiAgdGhpcy5pdGVtcyA9IG5ldyBDb250cm9sbGVyKCk7XG5cbiAgLy8gQ3JlYXRlIGEgbmV3IGNvbnRyb2xsZXIgZnJvbSBvdXIgZGVmYXVsdHNcbiAgdGhpcy5leHRlbmRDb250cm9sbGVyKHRoaXMuJGFkYXB0LmNvbmZpZy5jb250cm9sbGVyLCB0aGlzLml0ZW1zKTtcblxuICAvLyBDcmVhdGUgYSBuZXcgY29udHJvbGxlciBmcm9tIHRoZSB2aWV3IGNvbmZpZ3VyYXRpb25cbiAgdGhpcy5jcmVhdGVDb250cm9sbGVyKHRoaXMuJGFkYXB0LmNvbmZpZy52aWV3LCB0aGlzLml0ZW1zKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgdGhlIGJhc2UgY29udHJvbGxlciBmcm9tIHRoZSB2aWV3IG9iamVjdFxuICogQHBhcmFtICB7T2JqZWN0fSBvYmogICAgVmlldyBvYmplY3QgdG8gY29weVxuICogQHBhcmFtICB7T2JqZWN0fSB0YXJnZXQgQ29udHJvbGxlciBvYmplY3QgdG8gY29weSB0b1xuICovXG5Db250cm9sbGVyU2VydmljZS5wcm90b3R5cGUuY3JlYXRlQ29udHJvbGxlciA9IGZ1bmN0aW9uKG9iaiwgdGFyZ2V0KSB7XG4gIHRyeSB7XG4gICAgZm9yKCB2YXIgaSBpbiBvYmogKSB7XG4gICAgICB2YXIgdmFsO1xuXG4gICAgICAvLyBpZiBpdCdzIGEgdGFiIHR5cGVcbiAgICAgIGlmKCBvYmpbaV0udGFiVHlwZSApIHtcbiAgICAgICAgLy8gdGhlcmUgYXJlIG9ubHkgdHdvIGRpZmZlcmVudCB0eXBlcyBvZiB0YWIsIHNvIGFzc2lnbiB0aGUgdmFsdWVzIGJhc2VkIG9uIF90aGlzXG4gICAgICAgIC8vIFRPRE86IG1ha2UgdGhpcyBkeW5hbWljXG4gICAgICAgIHZhbCA9IHtcbiAgICAgICAgICB0YWI6IG51bGwsXG4gICAgICAgICAgYWNjb3JkaW9uOiBbXVxuICAgICAgICB9W29ialtpXS50YWJUeXBlXTtcbiAgICAgIH0gZWxzZSBpZiggb2JqW2ldLnR5cGUgKSB7XG4gICAgICAgIC8vIGVsc2UsIHdlJ2xsIGdyYWIgdGhlIGRlZmF1bHQgbW9kZWwgdmFsdWUgZnJvbSB0aGUgY29tcG9uZW50XG4gICAgICAgIHZhciBpdGVtID0gYWRhcHQuY29tcG9uZW50KG9ialtpXS50eXBlLnNwbGl0KCc6JylbMF0pO1xuXG4gICAgICAgIHZhciBwb3NzaWJsZUl0ZW0gPSBVdGlscy5jb252ZXJ0VG9DYW1lbENhc2Uob2JqW2ldLnR5cGUpO1xuXG4gICAgICAgIGlmKCBhZGFwdC5jb21wb25lbnRzW3Bvc3NpYmxlSXRlbV0gKSB7XG4gICAgICAgICAgaXRlbSA9IGFkYXB0LmNvbXBvbmVudHNbcG9zc2libGVJdGVtXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhbCA9IGl0ZW0uZGVmYXVsdE1vZGVsVmFsdWUgIT09IHVuZGVmaW5lZCA/IGl0ZW0uZGVmYXVsdE1vZGVsVmFsdWUgOiAnJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmKCBvYmpbaV0uaXRlbXMgKSB7XG4gICAgICAgIC8vIGlmIHRoZSB2aWV3IGhhcyBhbiBpdGVtcyBhcnJheSwgaS5lLiBjb2x1bW5zIG9yIHRhYnNcbiAgICAgICAgaWYoIFV0aWxzLmlzQXJyYXkob2JqW2ldLml0ZW1zKSApIHtcbiAgICAgICAgICAvLyBpZiBpdCdzIGFuIGFycmF5LCB3ZSBuZWVkIHRvIGxvb3AgdGhyb3VnaCB0aGVtIGFuZCBjcmVhdGUgY29udHJvbGxlciB2YWx1ZXMgZm9yIGVhY2ggaXRlbSBpbiB0aGF0IGFycmF5XG4gICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICBvYmpbaV0uaXRlbXMuZm9yRWFjaCggZnVuY3Rpb24oIGVsZW1lbnQsIGluZGV4LCBhcnJheSApIHtcbiAgICAgICAgICAgIC8vIG9ubHkgcGFzcyB0aHJvdWdoIHRhcmdldCwgYXMgdGhlc2UgYXJlIGludmlzaWJsZSBpbiB0aGUgY29udHJvbGxlclxuICAgICAgICAgICAgX3RoaXMuY3JlYXRlQ29udHJvbGxlciggZWxlbWVudCwgdGFyZ2V0ICk7XG4gICAgICAgICAgfSApO1xuICAgICAgICB9IGVsc2UgaWYoIFV0aWxzLmlzT2JqZWN0KG9ialtpXS5pdGVtcyApICkge1xuICAgICAgICAgIC8vIGlmIGl0J3MgYW4gb2JqZWN0LCBwYXNzIGl0IGFsbCB0aHJvdWdoLCBpbnZpc2libHlcbiAgICAgICAgICB0aGlzLmNyZWF0ZUNvbnRyb2xsZXIoIG9ialtpXS5pdGVtcywgdGFyZ2V0ICk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiggb2JqW2ldLm1vZGVsICkge1xuICAgICAgICAvLyBpZiBpdCBoYXMgYSBtb2RlbCwgd2UgbWlnaHQgbm90IG5lZWQgdG8gY29weSBhbnl0aGluZyBvdmVyXG4gICAgICAgIGlmKCBVdGlscy5pc09iamVjdCggb2JqW2ldLm1vZGVsICkgKSB7XG4gICAgICAgICAgaWYoIHRhcmdldFtpXSApIHtcbiAgICAgICAgICAgIC8vIGlmIGRlZmF1bHQgY29udHJvbGxlciB2YWx1ZXMgZXhpc3QsIHdlIG5lZWQgdG8gY3JlYXRlIGEgbmV3IGNvbnRyb2xsZXIgaXRlbSBmb3IgdGhlIHdob2xlIG9mIHRoZSBjb250cm9sbGVyICh0aGF0IHdheSB3ZSBjYW4gZ2l2ZSBwYXJ0aWFsIGNvbnRyb2xsZXIgdmFsdWVzIGFuZCB0aGluZ3MgZG9uJ3QgYnJlYWspXG4gICAgICAgICAgICBmb3IoIHZhciByID0gMDsgciA8IHRhcmdldFtpXS52YWx1ZS5sZW5ndGg7IHIrKyApIHtcbiAgICAgICAgICAgICAgdGhpcy5jcmVhdGVDb250cm9sbGVyKCBvYmpbaV0ubW9kZWwsIHRhcmdldFtpXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRbaV0gPSB7fTtcblxuICAgICAgICAgICAgdGhpcy5jcmVhdGVDb250cm9sbGVyKCBvYmpbaV0ubW9kZWwsIHRhcmdldFtpXSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXRbaV0gPSB7fTtcblxuICAgICAgICAgIGZvciggdmFyIHIgPSAwOyByIDwgb2JqW2ldLm1vZGVsLmxlbmd0aDsgcisrICkge1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDb250cm9sbGVyKCBvYmpbaV0ubW9kZWxbcl0uaXRlbXMsIHRhcmdldFtpXSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmKCBvYmpbaV0udGFicyApIHtcbiAgICAgICAgLy8gaWYgd2UgaGF2ZSB0YWJzLCB3ZSBuZWVkIHRvIGxvb3AgdGhyb3VnaCBhbGwgdGhlIHRhYiBwYWdlcyBhbmQgY3JlYXRlIGNvbnRyb2xsZXIgdmFsdWVzIGZvciB0aGVtXG4gICAgICAgIGZvciggdmFyIHIgPSAwOyByIDwgb2JqW2ldLnRhYnMubGVuZ3RoOyByKysgKSB7XG4gICAgICAgICAgdGhpcy5jcmVhdGVDb250cm9sbGVyKCBvYmpbaV0udGFic1tyXS5pdGVtcywgdGFyZ2V0ICk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHdlIGNhbiBhc3N1bWUgdGhlcmUgYXJlIG5vIG1vcmUgY2hpbGRyZW4gZm9yIHRoaXMgY29udHJvbGxlciB2YWx1ZSwgYW5kIGp1c3Qgc2V0IGl0IHRvIHRoZSB2YWx1ZSBzZXQgYWJvdmVcbiAgICAgICAgaWYoICF0YXJnZXRbaV0mJiB2YWwgIT09IG51bGwgKSB7XG4gICAgICAgICAgdGFyZ2V0W2ldID0ge307XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2goIGUgKSB7XG4gICAgY29uc29sZS53YXJuKGUubWVzc2FnZSk7XG4gIH1cbn07XG5cbi8qKlxuICogUHJlcG9wdWxhdGUgdGhlIGJhc2UgY29udHJvbGxlciBmcm9tIHByZXZpb3VzIHZhbHVlc1xuICogQHBhcmFtICB7T2JqZWN0fSBvYmogICAgUHJldmlvdXMgdmFsdWUgdG8gY29weSBvdmVyXG4gKiBAcGFyYW0gIHtPYmplY3R9IHRhcmdldCBUYXJnZXQgdG8gY29weSBpdCBvdmVyIHRvXG4gKi9cbkNvbnRyb2xsZXJTZXJ2aWNlLnByb3RvdHlwZS5leHRlbmRDb250cm9sbGVyID0gZnVuY3Rpb24ob2JqLCB0YXJnZXQpIHtcbiAgZm9yKCB2YXIgaSBpbiBvYmogKSB7XG4gICAgaWYoICF0YXJnZXRbaV0gKSB7XG4gICAgICAvLyBpZiB0aGUgdGFyZ2V0IGRvZXNuJ3QgZXhpc3QsIGNyZWF0ZSBhIGJhc2Ugb2JqZWN0XG4gICAgICB0YXJnZXRbaV0gPSBbXTtcbiAgICB9XG5cbiAgICBpZiggVXRpbHMuaXNBcnJheSggb2JqW2ldICkgKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICBjb25zb2xlLmxvZyhvYmpbaV0pO1xuXG4gICAgICAvLyBsb29wIHRocm91Z2ggdGhlIHByZXZpb3VzIHZhbHVlc1xuICAgICAgb2JqW2ldLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50LCBpbmRleCApIHtcbiAgICAgICAgdGFyZ2V0W2ldLnB1c2goIGVsZW1lbnQgKTtcbiAgICAgIH0gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gd2UndmUgZXhoYXVzdGVkIGFsbCBvcHRpb25zLCBjb3B5IGl0IG92ZXJcbiAgICAgIHRhcmdldFtpXSA9IG9ialtpXTtcbiAgICB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbGxlclNlcnZpY2U7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi8ndXNlIHN0cmljdCc7XG5cbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIEFkYXB0ID0ge307XG5cbi8qKlxuICogU3RvcmUgYWxsIHRoZSBjb21wb25lbnRzXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5BZGFwdC5jb21wb25lbnRzID0ge307XG5cbi8qKlxuICogR2V0L3NldCBjb21wb25lbnRzXG4gKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWUgICBOYW1lIG9mIGNvbXBvbmVudFxuICogQHBhcmFtICB7T2JqZWN0fSBjb25maWcgQ29tcG9uZW50IGNvbmZpZ3VyYXRpb25cbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgIENvbXBvbmVudFxuICovXG5BZGFwdC5jb21wb25lbnQgPSBmdW5jdGlvbiBjb21wb25lbnQobmFtZSwgY29uZmlnKSB7XG4gIGlmKCBjb25maWcgKSB7XG4gICAgaWYoIGNvbmZpZy5leHRlbmQgKSB7XG4gICAgICBjb25maWcuZXh0ZW5kLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50LCBpbmRleCApIHtcbiAgICAgICAgY29uZmlnID0gVXRpbHMuZXh0ZW5kKFV0aWxzLmNvcHkoY29uZmlnKSwgVXRpbHMuY29weShlbGVtZW50KSk7XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgdGhpcy5jb21wb25lbnRzW25hbWVdID0gUmVhY3QuY3JlYXRlQ2xhc3MoY29uZmlnKTtcbiAgfVxuICBpZighdGhpcy5jb21wb25lbnRzW25hbWVdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdbJyArIG5hbWUgKyAnXSBpcyBub3QgYSBjb21wb25lbnQnKTtcbiAgfVxuICByZXR1cm4gdGhpcy5jb21wb25lbnRzW25hbWVdO1xufTtcblxuLyoqXG4gKiBTdG9yZSBhbGwgdGhlIG1peGluc1xuICogQHR5cGUge09iamVjdH1cbiAqL1xuQWRhcHQubWl4aW5zID0ge307XG5cbi8qKlxuICogR2V0L3NldCBtaXhpbnNcbiAqIEBwYXJhbSAge1N0cmluZ30gbmFtZSAgIE5hbWUgb2YgbWl4aW5cbiAqIEBwYXJhbSAge09iamVjdH0gY29uZmlnIE1peGluIGNvbmZpZ3VyYXRpb25cbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgIE1peGluXG4gKi9cbkFkYXB0Lm1peGluID0gZnVuY3Rpb24gbWl4aW4obmFtZSwgY29uZmlnKSB7XG4gIGlmKCBjb25maWcgKSB7XG4gICAgdGhpcy5taXhpbnNbbmFtZV0gPSBjb25maWc7XG4gIH1cbiAgaWYoIXRoaXMubWl4aW5zW25hbWVdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdbJyArIG5hbWUgKyAnXSBpcyBub3QgYSBtaXhpbicpO1xuICB9XG4gIHJldHVybiB0aGlzLm1peGluc1tuYW1lXTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQWRhcHQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxuLyoqXG4gKiBGaW5kIGZ1bmN0aW9uXG4gKi9cbmZ1bmN0aW9uIEZpbmQoICkge1xuXG4gIC8qKlxuICAgKiBNYWluIGZpbmRpbmcgZnVuY3Rpb25cbiAgICogQHBhcmFtICB7U3RyaW5nfSB0b0ZpbmQgU3RyaW5nIG9mIHdoYXQgdG8gZmluZCBpbiB0aGUgaXRlbXMgb2JqZWN0XG4gICAqIEByZXR1cm4ge09iamVjdH0gICAgICAgIEZvdW5kIG9iamVjdCB3aXRoIGhlbHBlciBmdW5jdGlvbnNcbiAgICovXG4gIHJldHVybiBmdW5jdGlvbiBmaW5kSXRlbSggdG9GaW5kICkge1xuXG4gICAgLyoqXG4gICAgICogVGhpcyB3aWxsIGJlIHRoZSBzZXJ2aWNlIHRoYXQgRmluZCBpcyBpbml0aWFsaXNlZCBpdFxuICAgICAqIEB0eXBlIHtNb2RlbHxWaWV3fVxuICAgICAqL1xuICAgIHZhciBTZXJ2aWNlID0gdGhpcztcblxuICAgIC8qKlxuICAgICAqIExvb2sgdXAgZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IHN0cmluZyBTdHJpbmcgdG8gZmluZFxuICAgICAqIEBwYXJhbSAge09iamVjdH0gbW9kZWwgIE9iamVjdCB0byBsb29rIGluXG4gICAgICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgQXJyYXkgb2YgbWF0Y2hlc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGxvb2t1cCggc3RyaW5nLCBtb2RlbCApIHtcbiAgICAgIHZhciBzcGxpdCA9IHN0cmluZy5zcGxpdCgnLicpO1xuXG4gICAgICAvLyBjb3B5IHRoZSBtb2RlbCBvdmVyIHRvIGEgdGVtcFxuICAgICAgdmFyIHRlbXBNb2RlbCA9IG1vZGVsO1xuXG4gICAgICBmb3IoIHZhciBpID0gMDsgaSA8IHNwbGl0Lmxlbmd0aDsgaSsrICkge1xuICAgICAgICBpZiggVXRpbHMuaXNBcnJheSggdGVtcE1vZGVsICkgKSB7XG4gICAgICAgICAgLy8gaWYgdGhlIG1vZGVsIGlzIGFuIGFycmF5LCB3ZSBuZWVkIHRvIGdvIGRlZXBlclxuICAgICAgICAgIGlmKCB0ZW1wTW9kZWwudmFsdWUgKSB7XG4gICAgICAgICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIGtlZXAgd3JpdGluZyBcIml0ZW0udmFsdWUuaXRlbVwiLCBzbyB3ZSBhdXRvbWF0aWNhbGx5IGdvIGRvd24gYSBsZXZlbFxuICAgICAgICAgICAgdGVtcE1vZGVsID0gdGVtcE1vZGVsLnZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiggdGVtcE1vZGVsLml0ZW1zICkge1xuICAgICAgICAgICAgLy8gd2UgZG9uJ3Qgd2FudCB0byBrZWVwIHdyaXRpbmcgXCJpdGVtLml0ZW1zLml0ZW1cIiwgc28gd2UgYXV0b21hdGljYWxseSBnbyBkb3duIGEgbGV2ZWxcbiAgICAgICAgICAgIHRlbXBNb2RlbCA9IHRlbXBNb2RlbC5pdGVtcztcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIHRtID0gW107XG5cbiAgICAgICAgICBmb3IoIHZhciByID0gMDsgciA8IHRlbXBNb2RlbC5sZW5ndGg7IHIrKyApIHtcblxuICAgICAgICAgICAgaWYoIHRlbXBNb2RlbFtyXS52YWx1ZSApIHtcbiAgICAgICAgICAgICAgLy8gYXV0b21hdGljYWxseSBnbyBkb3duIGEgbGV2ZWxcbiAgICAgICAgICAgICAgdGVtcE1vZGVsID0gdGVtcE1vZGVsW3JdLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoIHRlbXBNb2RlbFtyXS5pdGVtcyApIHtcbiAgICAgICAgICAgICAgLy8gYXV0b21hdGljYWxseSBnbyBkb3duIGEgbGV2ZWxcbiAgICAgICAgICAgICAgdGVtcE1vZGVsID0gdGVtcE1vZGVsW3JdLml0ZW1zO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB3ZSd2ZSBmb3VuZCBpdCwgcHVzaCB0aGVtIGludG8gdGhlIHRlbXAgbW9kZWxcbiAgICAgICAgICAgIGlmKCBVdGlscy5pc0FycmF5KCB0ZW1wTW9kZWwgKSApIHtcbiAgICAgICAgICAgICAgdG0ucHVzaCh0ZW1wTW9kZWxbcl1bc3BsaXRbaV1dKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRtLnB1c2godGVtcE1vZGVsW3NwbGl0W2ldXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRlbXBNb2RlbCA9IHRtO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHRvIGtlZXAgaXQgY29uc2lzdGVudCwgcmV0dXJuIGFuIGFycmF5IG9mIHRoZSBmb3VuZCBpdGVtXG4gICAgICAgICAgdGVtcE1vZGVsID0gW3RlbXBNb2RlbFtzcGxpdFtpXV1dO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0ZW1wTW9kZWw7XG4gICAgfVxuXG4gICAgdmFyIGZvdW5kO1xuXG4gICAgLy8gdHJ5IGFuZCBmaW5kIGl0LCBpZiBub3QsIHdlJ2xsIGFzc2lnbiBpdCB0byBhbiBlbXB0eSBvYmplY3RcbiAgICAvLyB0aGlzIGFsbG93cyB1cyB0byBzZXQgb2JzZXJ2ZXJzIGFuZCBleHByZXNzaW9uIHZhbHVlcyBvbiB1bmtub3duIGl0ZW1zXG4gICAgdHJ5IHtcbiAgICAgIGZvdW5kID0gbG9va3VwKCB0b0ZpbmQsIHRoaXMuaXRlbXMgKTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGZvdW5kID0ge307XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT2JzZXJ2ZSBhIHZhbHVlXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIHdoZW4gdGhlIHZhbHVlIGNoYW5nZXNcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgaXRlbSAgICAgT3B0aW9uYWwgaXRlbSB0byBvYnNlcnZlXG4gICAgICovXG4gICAgZm91bmQub2JzZXJ2ZSA9IGZ1bmN0aW9uKCBjYWxsYmFjaywgaXRlbSApIHtcbiAgICAgIC8vIHNldHVwIHRoZSBvYnNlcnZlciBpbiB0aGUgb2JzZXJ2ZSBvYmplY3RcbiAgICAgIGlmKCAhU2VydmljZS5vYnNlcnZlW3RvRmluZF0gKSB7XG4gICAgICAgIFNlcnZpY2Uub2JzZXJ2ZVt0b0ZpbmRdID0ge307XG4gICAgICB9XG5cbiAgICAgIC8vIGlmIHdlIGhhdmUgYW4gaXRlbSwgdXNlIHRoYXQsIGlmIG5vdCB3ZSBhc3N1bWUgd2UncmUgZ29pbmcgdG8gbG9vayBhdCB0aGUgdmFsdWVcbiAgICAgIHZhciB2YWwgPSBpdGVtIHx8ICd2YWx1ZSc7XG5cbiAgICAgIC8vIHNldHVwIHRoZSBvYnNlcnZlclxuICAgICAgaWYoICFTZXJ2aWNlLm9ic2VydmVbdG9GaW5kXVt2YWxdICkge1xuICAgICAgICBTZXJ2aWNlLm9ic2VydmVbdG9GaW5kXVt2YWxdID0gW107XG4gICAgICB9XG5cbiAgICAgIC8vIHB1c2ggaXQgaW5cbiAgICAgIFNlcnZpY2Uub2JzZXJ2ZVt0b0ZpbmRdW3ZhbF0ucHVzaChjYWxsYmFjayk7XG5cbiAgICAgIC8vIG5vdGlmeSBldmVyeW9uZSBlbHNlXG4gICAgICBTZXJ2aWNlLiRhZGFwdC5vYnNlcnZlLmRpZ2VzdCgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYW4gaXRlbSBpbiB0aGUgb2JqZWN0XG4gICAgICogQHBhcmFtIHtJbnRlZ2VyfSBpbmRleCAgSW5kZXggb2Ygd2hlcmUgdG8gaW5zZXJ0IHRoZSBvYmplY3RcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcGFyZW50ICBPYmplY3QgdG8gaW5zZXJ0IGludG9cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAgICBLZXkgb2YgdGhlIG5ldyBvYmplY3RcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqICAgICBOZXcgb2JqZWN0IHRvIGluc2VydFxuICAgICAqL1xuICAgIHZhciBhZGRJdGVtID0gZnVuY3Rpb24oIGluZGV4LCBwYXJlbnQsIG5hbWUsIG9iaiApIHtcbiAgICAgIC8vIGdyYWIgdGhlIG9yaWdpbmFsIG9yZGVyIGluIGFycmF5IGZvcm1cbiAgICAgIHZhciBvcmlnaW5hbE9yZGVyID0gT2JqZWN0LmtleXMocGFyZW50Lml0ZW1zKTtcblxuICAgICAgLy8gaW5zZXJ0IHRoZSBuYW1lIGludG8gdGhlIG9yaWdpbmFsIG9yZGVyXG4gICAgICBvcmlnaW5hbE9yZGVyLnNwbGljZShpbmRleCwgMCwgbmFtZSk7XG5cbiAgICAgIC8vIGNvcHkgb3ZlciB0aGUgb2xkIHBhcmVudCwgc28gd2UgZG9uJ3QgZ2V0IGJpbmRpbmdcbiAgICAgIHZhciBvbGRQYXJlbnQgPSBVdGlscy5jb3B5KHBhcmVudC5pdGVtcyk7XG5cbiAgICAgIC8vIGluc2VydCB0aGUgbmV3IG9iamVjdCBpbnRvIHRoZSBwYXJlbnQsIHdlIGRvbid0IGNhcmUgYWJvdXQgcG9zaXRpb24gaGVyZVxuICAgICAgb2xkUGFyZW50W25hbWVdID0gb2JqO1xuXG4gICAgICB2YXIgbmV3UGFyZW50ID0ge307XG5cbiAgICAgIC8vIGxvb3AgdGhyb3VnaCB0aGUgb3JpZ2luYWwgb3JkZXIgKHdpdGggb3VyIG5ldyB2YWx1ZSBpbnNlcnRlZCBpbiB0aGUgY29ycmVjdCBwb3NpdGlvbilcbiAgICAgIG9yaWdpbmFsT3JkZXIuZm9yRWFjaCggZnVuY3Rpb24oIGVsZW1lbnQsIGluZGV4ICkge1xuICAgICAgICAvLyB0aGVuIGNvcHkgaXQgb3ZlciwgaW4gdGhlIGNvcnJlY3QgcG9zaXRpb25cbiAgICAgICAgbmV3UGFyZW50W2VsZW1lbnRdID0gb2xkUGFyZW50W2VsZW1lbnRdO1xuICAgICAgfSApO1xuXG4gICAgICAvLyB1cGRhdGUgdGhlIHBhcmVudCBvYmplY3RcbiAgICAgIHBhcmVudC5pdGVtcyA9IG5ld1BhcmVudDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQXBwZW5kIGFuIG9iamVjdCB0byBhbiBvYmplY3RcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWUgICAgICAgICAgICAgICAgICAgTmFtZSBvZiB0aGUgbmV3IG9iamVjdFxuICAgICAqIEBwYXJhbSAge09iamVjdH0gb2JqICAgICAgICAgICAgICAgICAgICBPYmplY3QgdmFsdWVzIGZvciB0aGUgbmV3IG9iamVjdFxuICAgICAqIEBwYXJhbSAge09iamVjdH0gZGVmYXVsdE1vZGVsVmFsdWUgICAgICBPcHRpb25hbCBkZWZhdWx0IHZhbHVlIHRvIHB1dCBpbnRvIHRoZSBtb2RlbFxuICAgICAqIEBwYXJhbSAge09iamVjdH0gZGVmYXVsdENvbnRyb2xsZXJWYWx1ZSBPcHRpb25hbCBkZWZhdWx0IHZhbHVlIHRvIHB1dCBpbnRvIHRoZSBjb250cm9sbGVyXG4gICAgICovXG4gICAgZm91bmQuYXBwZW5kID0gZnVuY3Rpb24oIG5hbWUsIG9iaiwgZGVmYXVsdE1vZGVsVmFsdWUsIGRlZmF1bHRDb250cm9sbGVyVmFsdWUgKSB7XG4gICAgICAvLyBnZXQgdGhlIGZvdW5kIGl0ZW1cbiAgICAgIHZhciBmb3VuZEl0ZW0gPSBmb3VuZFswXTtcblxuICAgICAgLy8gY3JlYXRlIGEgbmV3IG1vZGVsIHRvIHBhc3MgdGhyb3VnaCB0byBvdXIgbW9kZWwgZnVuY3Rpb25zXG4gICAgICB2YXIgbW9kZWxzID0ge307XG4gICAgICBtb2RlbHNbbmFtZV0gPSBvYmo7XG5cbiAgICAgIC8vIHNldHVwIHRoZSBuZXcgbW9kZWwgYW5kIG5ldyBjb250cm9sbGVyXG4gICAgICB2YXIgbmV3TW9kZWwgPSB7fTtcbiAgICAgIHZhciBuZXdDb250cm9sbGVyID0ge307XG5cbiAgICAgIGlmKCBkZWZhdWx0TW9kZWxWYWx1ZSAmJiAhVXRpbHMuaXNTdHJpbmcoZGVmYXVsdE1vZGVsVmFsdWUpICkge1xuICAgICAgICAvLyBpZiB3ZSBoYXZlIGEgbmV3IGRlZmF1bHQgbW9kZWwgdmFsdWUgdGhhdCBpc24ndCBhIHN0cmluZywgd2UgbmVlZCB0byBjcmVhdGUgYSBtb2RlbCB2YWx1ZSBmb3IgaXQgZnJvbSB0aGUgY29tcG9uZW50XG4gICAgICAgIHZhciBtb2RlbENvbmZpZyA9IHt9O1xuXG4gICAgICAgIG1vZGVsQ29uZmlnW25hbWVdID0gZGVmYXVsdE1vZGVsVmFsdWU7XG4gICAgICAgIG5ld01vZGVsID0gVXRpbHMuY29weShvYmopO1xuXG4gICAgICAgIC8vIHVzZSB0aGUgaGVscGVyIG1vZGVsIGZ1bmN0aW9ucyB0byBjcmVhdGUgdGhlIG1vZGVsXG4gICAgICAgIFNlcnZpY2UuJGFkYXB0Lm1vZGVsLmV4dGVuZE1vZGVsKCBtb2RlbENvbmZpZywgbmV3TW9kZWwgKTtcbiAgICAgIH1cblxuICAgICAgaWYoICFkZWZhdWx0Q29udHJvbGxlclZhbHVlICkge1xuICAgICAgICAvLyBpZiB3ZSBkb24ndCBoYXZlIGEgY29udHJvbGxlciB2YWx1ZSwgd2UgbmVlZCBvbmUhXG4gICAgICAgIHZhciBjb250cm9sbGVyQ29uZmlnID0ge307XG5cbiAgICAgICAgY29udHJvbGxlckNvbmZpZ1tuYW1lXSA9IFV0aWxzLmNvcHkob2JqKTtcblxuICAgICAgICBTZXJ2aWNlLiRhZGFwdC5jb250cm9sbGVyLmNyZWF0ZUNvbnRyb2xsZXIoIGNvbnRyb2xsZXJDb25maWcsIG5ld0NvbnRyb2xsZXIgKTtcbiAgICAgIH1cblxuICAgICAgLy8gZmluYWxseSBjcmVhdGUgdGhlIG5ldyBtb2RlbFxuICAgICAgU2VydmljZS4kYWRhcHQubW9kZWwuY3JlYXRlTW9kZWwoIG1vZGVscywgbmV3TW9kZWwgKTtcblxuICAgICAgLy8gcHVzaCB0aGUgbmV3IG9iamVjdCBpbnRvIHRoZSBleGlzaXRpbmcgbW9kZWxcbiAgICAgIHZhciBtb2RlbE9iaiA9IFNlcnZpY2UuJGFkYXB0Lm1vZGVsLml0ZW1zO1xuICAgICAgbW9kZWxPYmpbbmFtZV0gPSB7IHZhbHVlOiAnJyB9O1xuXG4gICAgICAvLyBwdXNoIHRoZSBuZXcgY29udHJvbGxlciBpbnRvIHRoZSBleGlzdGluZyBjb250cm9sbGVyXG4gICAgICB2YXIgY29udHJvbGxlck9iaiA9IFNlcnZpY2UuJGFkYXB0LmNvbnRyb2xsZXIuaXRlbXM7XG4gICAgICBjb250cm9sbGVyT2JqW25hbWVdID0gbmV3Q29udHJvbGxlcltuYW1lXSB8fCBkZWZhdWx0Q29udHJvbGxlclZhbHVlO1xuXG4gICAgICBpZiggZGVmYXVsdE1vZGVsVmFsdWUgJiYgVXRpbHMuaXNTdHJpbmcoZGVmYXVsdE1vZGVsVmFsdWUpICApIHtcbiAgICAgICAgLy8gaWYgd2UgaGF2ZSBhIHN0cmluZywganVzdCBjb3B5IHRoZSB2YWx1ZSBvdmVyXG4gICAgICAgIG1vZGVsT2JqW25hbWVdLnZhbHVlID0gZGVmYXVsdE1vZGVsVmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBpZiB3ZSBkb24ndCwgc2V0IHRoZSBtb2RlbCB0byB0aGUgbmV3IG1vZGVsIHZhbHVlIHdlIGNyZWF0ZWRcbiAgICAgICAgbW9kZWxPYmpbbmFtZV0udmFsdWUgPSBuZXdNb2RlbFtuYW1lXS52YWx1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gY2FsY3VsYXRlIHRoZSBpbmRleCB0byBwdXQgdGhlIG5ldyBpdGVtIGluXG4gICAgICB2YXIgaW5kZXggPSBPYmplY3Qua2V5cyhmb3VuZEl0ZW0uaXRlbXMpLmxlbmd0aDtcblxuICAgICAgLy8gZmluYWxseSwgYWRkIHRoZSBpdGVtXG4gICAgICBhZGRJdGVtKCBpbmRleCwgZm91bmRJdGVtLCBuYW1lLCBvYmopO1xuXG4gICAgICAvLyBub3RpZnkgZXZlcnlvbmUgZWxzZVxuICAgICAgU2VydmljZS4kYWRhcHQub2JzZXJ2ZS5kaWdlc3QoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGVzdG9yeSBhbiBvYmplY3QgaW4gYW4gb2JqZWN0XG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lIE5hbWUgb2Ygd2hhdCB0byBkZXN0cm95XG4gICAgICovXG4gICAgZm91bmQuZGVzdHJveSA9IGZ1bmN0aW9uKCBuYW1lICkge1xuICAgICAgdmFyIGZvdW5kSXRlbSA9IGZvdW5kWzBdO1xuXG4gICAgICAvLyBzdG9yZSB0aGUgb3JpZ2luYWwgb3JkZXIgb2YgdGhlIG9iamVjdFxuICAgICAgdmFyIG9yaWdpbmFsT3JkZXIgPSBPYmplY3Qua2V5cyhmb3VuZEl0ZW0uaXRlbXMpO1xuXG4gICAgICAvLyBmaW5kIG91dCB3aGVyZSB0aGUgaXRlbSBpcyB3ZSB3YW50IHRvIGRlbGV0ZVxuICAgICAgdmFyIGluZGV4ID0gb3JpZ2luYWxPcmRlci5pbmRleE9mKG5hbWUpO1xuXG4gICAgICBpZiggaW5kZXggPiAtMSApIHtcbiAgICAgICAgLy8gaWYgaXQgYWN0dWFsbHkgZXhpc3RzLCBsZXQncyByZW1vdmUgaXRcbiAgICAgICAgb3JpZ2luYWxPcmRlci5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICAgIC8vIHdlJ2xsIGNvcHkgb3ZlciB0aGUgb2xkIHBhcmVudCB0byBhdm9pZCBiaW5kaW5nIGJ5IHJlZmVyZW5jZVxuICAgICAgICB2YXIgb2xkUGFyZW50ID0gVXRpbHMuY29weShmb3VuZEl0ZW0uaXRlbXMpO1xuXG4gICAgICAgIHZhciBuZXdQYXJlbnQgPSB7fTtcblxuICAgICAgICB2YXIgbW9kZWwgPSBTZXJ2aWNlLiRhZGFwdC5tb2RlbC5pdGVtcztcbiAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBTZXJ2aWNlLiRhZGFwdC5jb250cm9sbGVyLml0ZW1zO1xuXG4gICAgICAgIC8vIGxvb3AgdGhyb3VnaCB0aGUgbmV3IG9yZGVyLCBzYW5zIHJlbW92ZWQgZWxlbWVudCwgYW5kIHB1dCBpdCBpbnRvIGEgbmV3IHBhcmVudFxuICAgICAgICBvcmlnaW5hbE9yZGVyLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50LCBpbmRleCApIHtcbiAgICAgICAgICBuZXdQYXJlbnRbZWxlbWVudF0gPSBvbGRQYXJlbnRbZWxlbWVudF07XG4gICAgICAgIH0gKTtcblxuICAgICAgICAvLyBkZWxldGUgdGhlIGFwcHJvcHJpYXRlIG1vZGVsIGFuZCBjb250cm9sbGVyIHZhbHVlc1xuICAgICAgICBkZWxldGUgbW9kZWxbbmFtZV07XG4gICAgICAgIGRlbGV0ZSBjb250cm9sbGVyW25hbWVdO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgcGFyZW50IG9iamVjdFxuICAgICAgICBmb3VuZEl0ZW0uaXRlbXMgPSBuZXdQYXJlbnQ7XG5cbiAgICAgICAgLy8gbm90aWZ5IGV2ZXJ5b25lIGVsc2VcbiAgICAgICAgU2VydmljZS4kYWRhcHQub2JzZXJ2ZS5kaWdlc3QoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgYSB2YWx1ZSBleHByZXNzaW9uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZXhwcmVzc2lvbiBUaGUgdmFsdWUgZm9yIHRoZSBpdGVtXG4gICAgICovXG4gICAgZm91bmQuc2V0VmFsdWUgPSBmdW5jdGlvbiggZXhwcmVzc2lvbiApIHtcbiAgICAgIFNlcnZpY2UudmFsdWVzW3RvRmluZF0gPSBleHByZXNzaW9uO1xuXG4gICAgICBTZXJ2aWNlLiRhZGFwdC5vYnNlcnZlLmRpZ2VzdCgpO1xuICAgIH07XG5cbiAgICByZXR1cm4gZm91bmQ7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmluZDtcbiIsIi8vIGZvcm1cbnJlcXVpcmUoJy4uL2NvbXBvbmVudHMvZm9ybScpO1xucmVxdWlyZSgnLi4vY29tcG9uZW50cy9sb29wJyk7XG5cbi8vIG1peGluc1xucmVxdWlyZSgnLi4vbWl4aW5zL2ZsYXQnKTtcbnJlcXVpcmUoJy4uL21peGlucy9vYmplY3QnKTtcbnJlcXVpcmUoJy4uL21peGlucy9hcnJheU9iamVjdCcpO1xucmVxdWlyZSgnLi4vbWl4aW5zL2FycmF5Jyk7XG5cbi8vIGRlY29yYXRpdmVcbnJlcXVpcmUoJy4uL2NvbXBvbmVudHMvbGFiZWwnKTtcbnJlcXVpcmUoJy4uL2NvbXBvbmVudHMvZGVzY3JpcHRpb24nKTtcbnJlcXVpcmUoJy4uL2NvbXBvbmVudHMvY29sdW1uJyk7XG5yZXF1aXJlKCcuLi9jb21wb25lbnRzL2NvbHVtblJvd3MnKTtcbnJlcXVpcmUoJy4uL2NvbXBvbmVudHMvaHInKTtcbnJlcXVpcmUoJy4uL2NvbXBvbmVudHMvYWNjb3JkaW9uJyk7XG5yZXF1aXJlKCcuLi9jb21wb25lbnRzL3RhYmNvcmRpb24nKTtcbnJlcXVpcmUoJy4uL2NvbXBvbmVudHMvdGFibGUnKTtcbnJlcXVpcmUoJy4uL2NvbXBvbmVudHMvaGVhZGVyJyk7XG5yZXF1aXJlKCcuLi9jb21wb25lbnRzL3RhYnMnKTtcblxuLy8gY29tcG9uZW50c1xucmVxdWlyZSgnLi4vY29tcG9uZW50cy9pdGVtJyk7XG5yZXF1aXJlKCcuLi9jb21wb25lbnRzL3RleHRhcmVhJyk7XG5yZXF1aXJlKCcuLi9jb21wb25lbnRzL2lucHV0Jyk7XG5yZXF1aXJlKCcuLi9jb21wb25lbnRzL2lucHV0RGF0ZScpO1xucmVxdWlyZSgnLi4vY29tcG9uZW50cy9zZWxlY3QnKTtcbnJlcXVpcmUoJy4uL2NvbXBvbmVudHMvc2VsZWN0TXVsdGlwbGUnKTtcbnJlcXVpcmUoJy4uL2NvbXBvbmVudHMvY2hlY2tib3gnKTtcbnJlcXVpcmUoJy4uL2NvbXBvbmVudHMvcmFkaW8nKTtcbnJlcXVpcmUoJy4uL2NvbXBvbmVudHMvYnV0dG9uJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBGaW5kICA9IHJlcXVpcmUoJy4vZmluZCcpO1xudmFyIFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgYWRhcHQgID0gcmVxdWlyZSgnLi9jb3JlJyk7XG5cbi8qKlxuICogTW9kZWwgT2JqZWN0LCBob2xkcyBtb2RlbCB2YWx1ZXNcbiAqL1xuZnVuY3Rpb24gTW9kZWwoICkge1xuXG59XG5cbi8qKlxuICogQ3JlYXRlIGV2ZXJ5dGhpbmcgdG8gZG8gd2l0aCB0aGUgbW9kZWxcbiAqIEBwYXJhbSB7YWRhcHR9IGFkYXB0IEFkYXB0IEluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIE1vZGVsU2VydmljZSggYWRhcHQgKSB7XG4gIC8qKlxuICAgKiBBZGFwdCBJbnN0YW5jZVxuICAgKiBAdHlwZSB7YWRhcHR9XG4gICAqL1xuICB0aGlzLiRhZGFwdCA9IGFkYXB0O1xuXG4gIC8qKlxuICAgKiBNb2RlbCBJdGVtc1xuICAgKiBAdHlwZSB7TW9kZWx9XG4gICAqL1xuICB0aGlzLml0ZW1zID0gbmV3IE1vZGVsKCk7XG5cbiAgLy8gQ3JlYXRlIGEgbW9kZWwgZnJvbSBvdXIgZGVmYXVsdHNcbiAgdGhpcy5leHRlbmRNb2RlbCh0aGlzLiRhZGFwdC5jb25maWcubW9kZWwsIHRoaXMuaXRlbXMpO1xuXG4gIC8vIENyZWF0ZSB0aGUgbW9kZWwgZnJvbSB0aGUgdmlldyBjb25maWd1cmF0aW9uXG4gIHRoaXMuY3JlYXRlTW9kZWwodGhpcy4kYWRhcHQuY29uZmlnLnZpZXcsIHRoaXMuaXRlbXMpO1xuXG4gIHRoaXMuZmluZCA9IG5ldyBGaW5kKCk7XG5cbiAgLyoqXG4gICAqIFZhbHVlIGV4cHJlc3Npb25zIGZvciBtb2RlbCBpdGVtc1xuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgdGhpcy52YWx1ZXMgPSB7fTtcblxuICAvKipcbiAgICogdmFsdWUgb2JzZXJ2ZXJzIGZvciBtb2RlbCBpdGVtc1xuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgdGhpcy5vYnNlcnZlID0ge307XG59XG5cbi8qKlxuICogQ3JlYXRlIHRoZSBiYXNlIG1vZGVsIG9mZiBvZiB0aGUgdmlldyBvYmplY3RcbiAqIEBwYXJhbSAge09iamVjdH0gb2JqICAgIFZpZXcgb2JqZWN0IHRvIGNvcHlcbiAqIEBwYXJhbSAge09iamVjdH0gdGFyZ2V0IE1vZGVsIG9iamVjdCB0byBjb3B5IHRvXG4gKi9cbk1vZGVsU2VydmljZS5wcm90b3R5cGUuY3JlYXRlTW9kZWwgPSBmdW5jdGlvbihvYmosIHRhcmdldCkge1xuICB0cnkge1xuICAgIGZvciggdmFyIGkgaW4gb2JqICkge1xuXG4gICAgICAvLyBpZiB0aGVyZSBpcyBubyB0eXBlIG9yIHRhYlR5cGUsIHdlIGNhbid0IGRvIGFueSBtb2RlbCBiaW5kaW5nXG4gICAgICBpZighb2JqW2ldLnR5cGUgJiYgIW9ialtpXS50YWJUeXBlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignW21vZGVsXTogTm8gdHlwZSBzZWxlY3RlZCwgYXNzdW1pbmcgbW9kZWwgZGF0YSBkb2VzblxcJ3QgZXhpc3QnKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHZhbDtcblxuICAgICAgLy8gaWYgaXQncyBhIHRhYiB0eXBlXG4gICAgICBpZiggb2JqW2ldLnRhYlR5cGUgKSB7XG4gICAgICAgIC8vIHRoZXJlIGFyZSBvbmx5IHR3byBkaWZmZXJlbnQgdHlwZXMgb2YgdGFiLCBzbyBhc3NpZ24gdGhlIHZhbHVlcyBiYXNlZCBvbiBfdGhpc1xuICAgICAgICAvLyBUT0RPOiBtYWtlIHRoaXMgZHluYW1pY1xuICAgICAgICB2YWwgPSB7XG4gICAgICAgICAgdGFiOiBudWxsLFxuICAgICAgICAgIGFjY29yZGlvbjogW11cbiAgICAgICAgfVtvYmpbaV0udGFiVHlwZV07XG4gICAgICB9IGVsc2UgaWYoIG9ialtpXS50eXBlICkge1xuICAgICAgICAvLyBlbHNlLCB3ZSdsbCBncmFiIHRoZSBkZWZhdWx0IG1vZGVsIHZhbHVlIGZyb20gdGhlIGNvbXBvbmVudFxuICAgICAgICB2YXIgaXRlbSA9IGFkYXB0LmNvbXBvbmVudChvYmpbaV0udHlwZS5zcGxpdCgnOicpWzBdKTtcblxuICAgICAgICAvLyBzZWUgaWYgdGhlIHBvc3NpYmxlIGNvbXBvbmVudCBleGlzdHNcbiAgICAgICAgdmFyIHBvc3NpYmxlSXRlbSA9IFV0aWxzLmNvbnZlcnRUb0NhbWVsQ2FzZShvYmpbaV0udHlwZSk7XG5cbiAgICAgICAgaWYoIGFkYXB0LmNvbXBvbmVudHNbcG9zc2libGVJdGVtXSApIHtcbiAgICAgICAgICBpdGVtID0gYWRhcHQuY29tcG9uZW50c1twb3NzaWJsZUl0ZW1dO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2V0IGl0XG4gICAgICAgIHZhbCA9IGl0ZW0uZGVmYXVsdE1vZGVsVmFsdWUgIT09IHVuZGVmaW5lZCA/IGl0ZW0uZGVmYXVsdE1vZGVsVmFsdWUgOiAnJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmKCBvYmpbaV0uaXRlbXMgKSB7XG4gICAgICAgIC8vIGlmIHRoZSB2aWV3IGhhcyBhbiBpdGVtcyBhcnJheSwgaS5lLiBjb2x1bW5zIG9yIHRhYnNcbiAgICAgICAgaWYoIFV0aWxzLmlzQXJyYXkob2JqW2ldLml0ZW1zKSApIHtcbiAgICAgICAgICAvLyBpZiBpdCdzIGFuIGFycmF5LCB3ZSBuZWVkIHRvIGxvb3AgdGhyb3VnaCB0aGVtIGFuZCBjcmVhdGUgbW9kZWwgdmFsdWVzIGZvciBlYWNoIGl0ZW0gaW4gdGhhdCBhcnJheVxuICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgb2JqW2ldLml0ZW1zLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50LCBpbmRleCwgYXJyYXkgKSB7XG4gICAgICAgICAgICAvLyBvbmx5IHBhc3MgdGhyb3VnaCB0YXJnZXQsIGFzIHRoZXNlIGFyZSBpbnZpc2libGUgaW4gdGhlIG1vZGVsXG4gICAgICAgICAgICBfdGhpcy5jcmVhdGVNb2RlbCggZWxlbWVudCwgdGFyZ2V0ICk7XG4gICAgICAgICAgfSApO1xuICAgICAgICB9IGVsc2UgaWYoIFV0aWxzLmlzT2JqZWN0KG9ialtpXS5pdGVtcyApICkge1xuICAgICAgICAgIC8vIGlmIGl0J3MgYW4gb2JqZWN0LCBwYXNzIGl0IGFsbCB0aHJvdWdoLCBpbnZpc2libHlcbiAgICAgICAgICB0aGlzLmNyZWF0ZU1vZGVsKCBvYmpbaV0uaXRlbXMsIHRhcmdldCApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYoIG9ialtpXS5tb2RlbCApIHtcbiAgICAgICAgLy8gaWYgaXQgaGFzIGEgbW9kZWwsIHdlIG1pZ2h0IG5vdCBuZWVkIHRvIGNvcHkgYW55dGhpbmcgb3ZlclxuICAgICAgICBpZiggVXRpbHMuaXNPYmplY3QoIG9ialtpXS5tb2RlbCApICkge1xuICAgICAgICAgIGlmKCB0YXJnZXRbaV0gKSB7XG4gICAgICAgICAgICAvLyBpZiBkZWZhdWx0IG1vZGVsIHZhbHVlcyBleGlzdCwgd2UgbmVlZCB0byBjcmVhdGUgYSBuZXcgbW9kZWwgaXRlbSBmb3IgdGhlIHdob2xlIG9mIHRoZSBtb2RlbCAodGhhdCB3YXkgd2UgY2FuIGdpdmUgcGFydGlhbCBtb2RlbCB2YWx1ZXMgYW5kIHRoaW5ncyBkb24ndCBicmVhaylcbiAgICAgICAgICAgIGZvciggdmFyIHIgPSAwOyByIDwgdGFyZ2V0W2ldLnZhbHVlLmxlbmd0aDsgcisrICkge1xuICAgICAgICAgICAgICB0aGlzLmNyZWF0ZU1vZGVsKCBvYmpbaV0ubW9kZWwsIHRhcmdldFtpXS52YWx1ZVtyXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBlbHNlIHdlIGp1c3QgbmVlZCB0byBtYWtlIHRoZSBtb2RlbCB2YWx1ZSBhbiBhcnJheSwgcmVhZHkgZm9yIHBvcHVsYXRpbmdcbiAgICAgICAgICAgIHRhcmdldFtpXSA9IHsgdmFsdWU6IFtdIH07XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRhcmdldFtpXSA9IHsgdmFsdWU6IFtdIH07XG5cbiAgICAgICAgICBmb3IoIHZhciByID0gMDsgciA8IG9ialtpXS5tb2RlbC5sZW5ndGg7IHIrKyApIHtcbiAgICAgICAgICAgIHRhcmdldFtpXS52YWx1ZS5wdXNoKHt9KTtcblxuICAgICAgICAgICAgdGhpcy5jcmVhdGVNb2RlbCggb2JqW2ldLm1vZGVsW3JdLml0ZW1zLCB0YXJnZXRbaV0udmFsdWVbcl0gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiggb2JqW2ldLnRhYnMgKSB7XG4gICAgICAgIC8vIGlmIHdlIGhhdmUgdGFicywgd2UgbmVlZCB0byBsb29wIHRocm91Z2ggYWxsIHRoZSB0YWIgcGFnZXMgYW5kIGNyZWF0ZSBtb2RlbCB2YWx1ZXMgZm9yIHRoZW1cbiAgICAgICAgZm9yKCB2YXIgciA9IDA7IHIgPCBvYmpbaV0udGFicy5sZW5ndGg7IHIrKyApIHtcbiAgICAgICAgICB0aGlzLmNyZWF0ZU1vZGVsKCBvYmpbaV0udGFic1tyXS5pdGVtcywgdGFyZ2V0ICk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHdlIGNhbiBhc3N1bWUgdGhlcmUgYXJlIG5vIG1vcmUgY2hpbGRyZW4gZm9yIHRoaXMgbW9kZWwgdmFsdWUsIGFuZCBqdXN0IHNldCBpdCB0byB0aGUgdmFsdWUgc2V0IGFib3ZlXG4gICAgICAgIGlmKCAhdGFyZ2V0W2ldJiYgdmFsICE9PSBudWxsICkge1xuICAgICAgICAgIHRhcmdldFtpXSA9IHtcbiAgICAgICAgICAgIHZhbHVlOiB2YWxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoKCBlICkge1xuICAgIGNvbnNvbGUud2FybihlLm1lc3NhZ2UpO1xuICB9XG59O1xuXG4vKipcbiAqIFByZXBvcHVsYXRlIHRoZSBiYXNlIG1vZGVsIGZyb20gcHJldmlvdXMgdmFsdWVzXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9iaiAgICBQcmV2aW91cyB2YWx1ZSB0byBjb3B5IG92ZXJcbiAqIEBwYXJhbSAge09iamVjdH0gdGFyZ2V0IFRhcmdldCB0byBjb3B5IGl0IG92ZXIgdG9cbiAqL1xuTW9kZWxTZXJ2aWNlLnByb3RvdHlwZS5leHRlbmRNb2RlbCA9IGZ1bmN0aW9uKG9iaiwgdGFyZ2V0KSB7XG4gIGZvciggdmFyIGkgaW4gb2JqICkge1xuICAgIGlmKCAhdGFyZ2V0W2ldICkge1xuICAgICAgLy8gaWYgdGhlIHRhcmdldCBkb2Vzbid0IGV4aXN0LCBjcmVhdGUgYSBiYXNlIG9iamVjdFxuICAgICAgdGFyZ2V0W2ldID0ge307XG4gICAgfVxuICAgIGlmKCBVdGlscy5pc0FycmF5KCBvYmpbaV0gKSApIHtcbiAgICAgIC8vIGlmIGdpdmVuIGFuIGFycmF5LCBtYWtlIHRoZSB2YWx1ZSBvZiB0aGUgbW9kZWwgYW4gYXJyYXkgcmVhZHkgdG8gYmUgcHVzaGVkIGluXG4gICAgICB0YXJnZXRbaV0udmFsdWUgPSBbXTtcblxuICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgIG9ialtpXS5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbWVudCwgaW5kZXggKSB7XG4gICAgICAgIC8vIGxvb3AgdGhyb3VnaCB0aGUgcHJldmlvdXMgdmFsdWVzXG4gICAgICAgIHRhcmdldFtpXS52YWx1ZS5wdXNoKHt9KTsgLy8gcHVzaCBhIG5ldyBhcnJheSBpbnRvIHRoZSBtb2RlbFxuXG4gICAgICAgIC8vIHJlY3Vyc2l2ZSA8M1xuICAgICAgICBfdGhpcy5leHRlbmRNb2RlbCggZWxlbWVudCwgdGFyZ2V0W2ldLnZhbHVlW2luZGV4XSApO1xuICAgICAgfSApO1xuICAgIH0gZWxzZSBpZiggVXRpbHMuaXNPYmplY3QoIG9ialtpXSApICkge1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHdlJ3ZlIGV4aGF1c3RlZCBhbGwgb3B0aW9ucywgY29weSBpdCBvdmVyXG4gICAgICB0YXJnZXRbaV0udmFsdWUgPSBvYmpbaV07XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVsU2VydmljZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG4vKipcbiAqIE1haW4gT2JzZXJ2ZSBmdW5jdGlvblxuICovXG5mdW5jdGlvbiBPYnNlcnZlKCApIHtcbiAgLyoqXG4gICAqIEFycmF5IG9mIHJlY29yZHMgc3RvcmVkXG4gICAqIEB0eXBlIHtBcnJheX1cbiAgICovXG4gIHRoaXMucmVjb3JkcyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZCBhbiBvYnNlcnZlIGxpc3RlbmVyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB3YXRjaEV4cCBGdW5jdGlvbiB0byB3YXRjaFxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgTGlzdGVuZXIgdG8gY2FsbFxuICovXG5PYnNlcnZlLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZExpc3RlbmVyKCB3YXRjaEV4cCwgbGlzdGVuZXIgKSB7XG4gIHZhciByZWNvcmRzID0gdGhpcy5yZWNvcmRzO1xuXG4gIHZhciBsaXN0ZW5lck9iaiA9IHtcbiAgICB3YXRjaEV4cDogd2F0Y2hFeHAsXG4gICAgbGlzdGVuZXI6IGxpc3RlbmVyLFxuICAgIGxhc3RWYWx1ZTogJydcbiAgfTtcblxuICByZWNvcmRzLnB1c2gobGlzdGVuZXJPYmopO1xuXG4gIC8vIHJldHVybiBhIGZ1bmN0aW9uIHRoYXQgcmVtb3ZlcyBvdXIgbGlzdGVuZXIgZnJvbSB0aGUgcmVjb3JkcyBhcnJheVxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmVjb3Jkcy5zcGxpY2UocmVjb3Jkcy5pbmRleE9mKGxpc3RlbmVyT2JqKSwgMSk7XG4gIH1cbn07XG5cbi8qKlxuICogRGlnZXN0IEN5Y2xlXG4gKi9cbk9ic2VydmUucHJvdG90eXBlLmRpZ2VzdCA9IGZ1bmN0aW9uIGRpZ2VzdCggKSB7XG4gIHZhciBkaXJ0eTtcbiAgdmFyIHR0bCA9IDEwOyAvLyBob3cgbWFueSBpdGVyYXRpb25zIHdlIGNhbiBtYWtlIGJlZm9yZSB3ZSBhc3N1bWUgdGhlIGRhdGEgaXMgdW5zdGFibGVcblxuICBkbyB7XG4gICAgdmFyIGxlbmd0aCA9IHRoaXMucmVjb3Jkcy5sZW5ndGg7XG5cbiAgICBkaXJ0eSA9IGZhbHNlO1xuXG4gICAgd2hpbGUobGVuZ3RoLS0pIHtcbiAgICAgIHZhciBpdGVtID0gdGhpcy5yZWNvcmRzW2xlbmd0aF07XG5cbiAgICAgIGlmKCBpdGVtICkge1xuICAgICAgICB2YXJcbiAgICAgICAgICBuZXdWYWwgPSBpdGVtLndhdGNoRXhwKCksXG4gICAgICAgICAgb2xkVmFsID0gaXRlbS5sYXN0VmFsdWU7XG5cbiAgICAgICAgaWYoICFVdGlscy5lcXVhbHMobmV3VmFsLCBvbGRWYWwgKSApIHtcbiAgICAgICAgICBpZiggISggVXRpbHMuaXNBcnJheShuZXdWYWwpIHx8IFV0aWxzLmlzT2JqZWN0KG5ld1ZhbCkgKSApIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZSBuZXcgdmFsdWUgaXMgbm90IGFuIGFycmF5IG9yIG9iamVjdCwgd2UgY2FuIGp1c3Qgc2V0IGl0IHdpdGhvdXQgd29ycnlpbmcgYWJvdXQgYmluZGluZ1xuICAgICAgICAgICAgaXRlbS5sYXN0VmFsdWUgPSBuZXdWYWw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGlmIGl0IGlzIGFuIGFycmF5IG9yIG9iamVjdCwgd2UgaGF2ZSB0byBjb3B5IGl0IG92ZXIgdG8gc3RvcCBhbnkgYmluZGluZyBieSByZWZlcmVuY2VcbiAgICAgICAgICAgIGl0ZW0ubGFzdFZhbHVlID0gVXRpbHMuY29weShuZXdWYWwpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBwYXJhbXMgPSBbbmV3VmFsLCBvbGRWYWxdO1xuXG4gICAgICAgICAgaWYoIFV0aWxzLmlzQXJyYXkobmV3VmFsKSAmJiBVdGlscy5pc0FycmF5KG9sZFZhbCkgKSB7XG4gICAgICAgICAgICAvLyBpZiBpdHMgYW4gYW4gYXJyYXksIHdlIHdpbGwgcGFzcyB0aHJvdWdoIHRoZSBkaWZmZXJlbmNlIGFzIHRoZSB0aGlyZCBwYXJhbWV0ZXJcbiAgICAgICAgICAgIHBhcmFtcy5wdXNoKCBVdGlscy5hcnJheURpZmYobmV3VmFsLCBvbGRWYWwpICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaXRlbS5saXN0ZW5lci5hcHBseSggdGhpcywgcGFyYW1zICk7XG5cbiAgICAgICAgICBkaXJ0eSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGlydHkgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCBkaXJ0eSAmJiAhKHR0bC0tKSApIHtcbiAgICAgIHRocm93ICdNYXhpbXVtIGRpZ2VzdCBpdGVyYXRpb25zIHJlYWNoZWQnO1xuICAgIH1cbiAgfSB3aGlsZShkaXJ0eSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9ic2VydmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXRpbHMgb2JqZWN0XG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG52YXIgVXRpbHMgPSB7XG4gIC8qKlxuICAgKiBDb3B5IHdpdGhvdXQgYmluZGluZyBieSByZWZlcmVuY2VcbiAgICogQHBhcmFtICB7T2JqZWN0fEFycmF5fSBzb3VyY2UgICAgICBTb3VyY2UgdG8gY29weSBmcm9tXG4gICAqIEBwYXJhbSAge09iamVjdHxBcnJheX0gZGVzdGluYXRpb24gVGFyZ2V0XG4gICAqIEByZXR1cm4ge09iamVjdHxBcnJheX0gICAgICAgICAgICAgQ29waWVkIG9iamVjdC9hcnJheVxuICAgKi9cbiAgY29weTogZnVuY3Rpb24oIHNvdXJjZSwgZGVzdGluYXRpb24gKSB7XG4gICAgaWYoIWRlc3RpbmF0aW9uKSB7XG4gICAgICBpZiggdGhpcy5pc0FycmF5KHNvdXJjZSkgKSB7XG4gICAgICAgIGRlc3RpbmF0aW9uID0gW107XG4gICAgICB9IGVsc2UgaWYoIHRoaXMuaXNPYmplY3Qoc291cmNlKSApIHtcbiAgICAgICAgZGVzdGluYXRpb24gPSB7fTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvciggdHlwZW9mIHNvdXJjZSArICcgaXMgbm90IHN1cHBvcnRlZCBieSBVdGlscy5jb3B5Jyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yKCB2YXIgaSBpbiBzb3VyY2UgKSB7XG4gICAgICBkZXN0aW5hdGlvbltpXSA9IHNvdXJjZVtpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVzdGluYXRpb247XG4gIH0sXG4gIC8qKlxuICAgKiBGaW5kIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdHdvIGFycmF5c1xuICAgKiBAcGFyYW0gIHtBcnJheX0gYTEgTmV3IEFycmF5XG4gICAqIEBwYXJhbSAge0FycmF5fSBhMiBQcmV2aW91cyBBcnJheVxuICAgKiBAcmV0dXJuIHtBcnJheX0gICAgQXJyYXkgb2Ygb2JqZWN0cyBvZiBjaGFuZ2VzIGZyb20gcHJldiA+IG5ld1xuICAgKi9cbiAgYXJyYXlEaWZmOiBmdW5jdGlvbiggYTEsIGEyICkge1xuICAgIHZhciBkaWZmZXJlbmNlcyA9IFtdO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBhMS5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCBhMi5pbmRleE9mKCBhMVtpXSApID09PSAtMSApIHtcbiAgICAgICAgZGlmZmVyZW5jZXMucHVzaCh7XG4gICAgICAgICAgYWN0aW9uOiAnYWRkZWQnLFxuICAgICAgICAgIHZhbHVlOiBhMVtpXVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBhMi5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCBhMS5pbmRleE9mKCBhMltpXSApID09PSAtMSApIHtcbiAgICAgICAgZGlmZmVyZW5jZXMucHVzaCh7XG4gICAgICAgICAgYWN0aW9uOiAncmVtb3ZlZCcsXG4gICAgICAgICAgdmFsdWU6IGEyW2ldXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkaWZmZXJlbmNlcztcbiAgfSxcbiAgLyoqXG4gICAqIENvbXB1dGUgaWYgdHdvIGl0ZW1zIGFyZSBlcXVhbHNcbiAgICogQHBhcmFtICB7Kn0gbzEgQW55IHR5cGUgb2YgZGF0YSB0byBjb21wYXJlXG4gICAqIEBwYXJhbSAgeyp9IG8yIEFueSB0eXBlIG9mIGRhdGEgdG8gY29tcGFyZVxuICAgKiBAcmV0dXJuIHtib29sfSBXaGV0aGVyIG9yIG5vdCB0aGV5J3JlIGVxdWFsXG4gICAqL1xuICBlcXVhbHM6IGZ1bmN0aW9uKCBvMSwgbzIgKSB7XG4gICAgaWYgKG8xID09PSBvMikgcmV0dXJuIHRydWU7XG4gICAgaWYgKG8xID09PSBudWxsIHx8IG8yID09PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKG8xICE9PSBvMSAmJiBvMiAhPT0gbzIpIHJldHVybiB0cnVlO1xuICAgIHZhciB0MSA9IHR5cGVvZiBvMSwgdDIgPSB0eXBlb2YgbzIsIGxlbmd0aCwga2V5LCBrZXlTZXQ7XG4gICAgaWYgKHQxID09IHQyKSB7XG4gICAgICBpZiAodDEgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNBcnJheShvMSkpIHtcbiAgICAgICAgICBpZiAoIXRoaXMuaXNBcnJheShvMikpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICBpZiAoKGxlbmd0aCA9IG8xLmxlbmd0aCkgPT0gbzIubGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3Ioa2V5PTA7IGtleTxsZW5ndGg7IGtleSsrKSB7XG4gICAgICAgICAgICAgIGlmICghdGhpcy5lcXVhbHMobzFba2V5XSwgbzJba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzRGF0ZShvMSkpIHtcbiAgICAgICAgICBpZiAoIXRoaXMuaXNEYXRlKG8yKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIHJldHVybiB0aGlzLmVxdWFscyhvMS5nZXRUaW1lKCksIG8yLmdldFRpbWUoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1JlZ0V4cChvMSkgJiYgdGhpcy5pc1JlZ0V4cChvMikpIHtcbiAgICAgICAgICByZXR1cm4gbzEudG9TdHJpbmcoKSA9PSBvMi50b1N0cmluZygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGtleVNldCA9IHt9O1xuICAgICAgICAgIGZvcihrZXkgaW4gbzEpIHtcbiAgICAgICAgICAgIGlmIChrZXkuY2hhckF0KDApID09PSAnJCcgfHwgdGhpcy5pc0Z1bmN0aW9uKG8xW2tleV0pKSBjb250aW51ZTtcbiAgICAgICAgICAgIGlmICghdGhpcy5lcXVhbHMobzFba2V5XSwgbzJba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGtleVNldFtrZXldID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZm9yKGtleSBpbiBvMikge1xuICAgICAgICAgICAgaWYgKCFrZXlTZXQuaGFzT3duUHJvcGVydHkoa2V5KSAmJlxuICAgICAgICAgICAgICAgIGtleS5jaGFyQXQoMCkgIT09ICckJyAmJlxuICAgICAgICAgICAgICAgIG8yW2tleV0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICF0aGlzLmlzRnVuY3Rpb24obzJba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICAvKipcbiAgICogQ29udmVydCBzdHJpbmdzIGZyb20gaXRlbTpkZXNjIHRvIGl0ZW1EZXNjXG4gICAqIEBwYXJhbSAge1N0cmluZ30gc3RyaW5nIFN0cmluZyB0byBiZSBmb3JtYXR0ZWRcbiAgICogQHJldHVybiB7U3RyaW5nfSAgICAgICAgRm9ybWF0dGVkIHN0cmluZ1xuICAgKi9cbiAgY29udmVydFRvQ2FtZWxDYXNlOiBmdW5jdGlvbiggc3RyaW5nICkge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvOihbYS16XSkvZywgZnVuY3Rpb24gKGcpIHsgcmV0dXJuIGdbMV0udG9VcHBlckNhc2UoKTsgfSlcbiAgfSxcbiAgLyoqXG4gICAqIEV4dGVuZCBhbiBvYmplY3RcbiAgICogQHBhcmFtICB7T2JqZWN0fSBzb3VyY2UgICAgICBTb3VyY2Ugb2JqZWN0IHRvIGV4dGVuZFxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRlc3RpbmF0aW9uIFRhcmdldCBvYmplY3QgdG8gZXh0ZW5kIGludG9cbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgICBFeHRlbmRlZCBvYmplY3RcbiAgICovXG4gIGV4dGVuZDogZnVuY3Rpb24oIHNvdXJjZSwgZGVzdGluYXRpb24gKSB7XG4gICAgZm9yKCB2YXIgaSBpbiBzb3VyY2UgKSB7XG4gICAgICBkZXN0aW5hdGlvbltpXSA9IHNvdXJjZVtpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVzdGluYXRpb247XG4gIH0sXG4gIC8qKlxuICAgKiBGaW5kIGNsb3Nlc3QgcGFyZW50IGZyb20gRE9NIGV2ZW50XG4gICAqIEBwYXJhbSAge09iamVjdH0gZXZlbnQgICAgIERPTSBldmVudCBvYmpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBjbGFzc05hbWUgQ2xhc3MgbmFtZSB0byBsb29rIGZvclxuICAgKiBAcmV0dXJuIHtPYmplY3R8TnVsbH0gICAgICBSZXN1bHQgb2Ygc2VhcmNoXG4gICAqL1xuICBmaW5kQ2xvc2VzdFBhcmVudDogZnVuY3Rpb24oZXZlbnQsIGNsYXNzTmFtZSkge1xuICAgIHZhciBwYXJlbnQgPSBldmVudC5wYXJlbnROb2RlO1xuICAgIHdoaWxlIChwYXJlbnQhPWRvY3VtZW50LmJvZHkgJiYgcGFyZW50ICE9IG51bGwpIHtcbiAgICAgIGlmICgocGFyZW50KSAmJiBwYXJlbnQuY2xhc3NOYW1lICYmIHBhcmVudC5jbGFzc05hbWUuaW5kZXhPZihjbGFzc05hbWUpICE9IC0xKSB7XG4gICAgICAgIHJldHVybiBwYXJlbnQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJlbnQgPSBwYXJlbnQgPyBwYXJlbnQucGFyZW50Tm9kZSA6IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9LFxuICBjaGVja1N0YXRlOiBmdW5jdGlvbiggc3RhdGUsIGN1cnJlbnRTdGF0ZSApIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gY29tcGFyZVN0YXRlKCBzdGF0ZU5hbWUsIGN1cnJlbnRTdGF0ZSApIHtcbiAgICAgIHZhciBzaG93ID0gZmFsc2U7XG4gICAgICBpZiggc3RhdGVOYW1lICkge1xuICAgICAgICBpZiggX3RoaXMuaXNTdHJpbmcoIHN0YXRlTmFtZSApICkge1xuICAgICAgICAgIHNob3cgPSBzdGF0ZU5hbWUgPT09IGN1cnJlbnRTdGF0ZTtcbiAgICAgICAgfSBlbHNlIGlmKCBfdGhpcy5pc0FycmF5KCBzdGF0ZU5hbWUgKSApIHtcbiAgICAgICAgICB2YXIgaW5kZXggPSBzdGF0ZU5hbWUuaW5kZXhPZiggY3VycmVudFN0YXRlICk7XG5cbiAgICAgICAgICBzaG93ID0gaW5kZXggPiAtMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHNob3c7XG4gICAgfVxuXG4gICAgaWYoIHN0YXRlICkge1xuICAgICAgdmFyIHNob3cgPSBmYWxzZTtcbiAgICAgIGlmKCB0aGlzLmlzQXJyYXkoIGN1cnJlbnRTdGF0ZSApICkge1xuICAgICAgICBjdXJyZW50U3RhdGUuZm9yRWFjaCggZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCA9IGNvbXBhcmVTdGF0ZSggc3RhdGUsIGVsZW1lbnQgKTtcblxuICAgICAgICAgIGlmKCAhIXJlc3VsdCApIHtcbiAgICAgICAgICAgIHNob3cgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2hvdyA9IGNvbXBhcmVTdGF0ZSggc3RhdGUsIGN1cnJlbnRTdGF0ZSApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2hvdztcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcblxuLyoqXG4gKiBPYmplY3QgVHlwZXNcbiAqIEB0eXBlIHtBcnJheX1cbiAqL1xudmFyIG9ialR5cGVzID0gW1xuICAnQXJyYXknLCAnT2JqZWN0JywgJ1N0cmluZycsICdEYXRlJywgJ1JlZ0V4cCcsXG4gICdGdW5jdGlvbicsICdCb29sZWFuJywgJ051bWJlcicsICdOdWxsJywgJ1VuZGVmaW5lZCdcbl07XG5cbi8vIENyZWF0ZSBpbmRpdmlkdWFsIGZ1bmN0aW9ucyBvbiB0b3Agb2Ygb3VyIFV0aWxzIG9iamVjdCBmb3IgZWFjaCBvYmpUeXBlXG5mb3IgKHZhciBpID0gb2JqVHlwZXMubGVuZ3RoOyBpLS07KSB7XG4gIFV0aWxzWydpcycgKyBvYmpUeXBlc1tpXV0gPSAoZnVuY3Rpb24gKG9iamVjdFR5cGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKGVsZW0pLnNsaWNlKDgsIC0xKSA9PT0gb2JqZWN0VHlwZTtcbiAgICB9O1xuICB9KShvYmpUeXBlc1tpXSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBGaW5kID0gcmVxdWlyZSgnLi9maW5kJyk7XG5cbi8qKlxuICogVmlldyBvYmplY3QsIGhvbGRzIHZpZXcgZGF0YVxuICogQHBhcmFtIHtPYmplY3R9IGl0ZW1zIFZpZXcgb2JqZWN0IGRhdGFcbiAqL1xuZnVuY3Rpb24gVmlldyAoaXRlbXMpIHtcbiAgLy8gc3RvcmUgdGhlIGl0ZW1zIHBhc3NlZCB0aHJvdWdoIGluIGl0c2VsZlxuICBmb3IgKHZhciBpIGluIGl0ZW1zKSB7XG4gICAgdGhpc1tpXSA9IGl0ZW1zW2ldO1xuICB9XG59XG5cbi8qKlxuICogRXZlcnl0aGluZyB0byBkbyB3aXRoIHRoZSB2aWV3XG4gKiBAcGFyYW0ge2FkYXB0fSBhZGFwdCBBZGFwdCBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBWaWV3U2VydmljZSAoYWRhcHQpIHtcbiAgLyoqXG4gICAqIEFkYXB0IEluc3RhbmNlXG4gICAqIEB0eXBlIHthZGFwdH1cbiAgICovXG4gIHRoaXMuJGFkYXB0ID0gYWRhcHQ7XG5cbiAgLyoqXG4gICAqIFZpZXcgSXRlbXNcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHRoaXMuaXRlbXMgPSB7fTtcblxuICAvLyBDcmVhdGUgdGhlIHZpZXcgZnJvbSB0aGUgY29uZmlndXJhdGlvblxuICB0aGlzLmNyZWF0ZVZpZXcodGhpcy4kYWRhcHQuY29uZmlnLnZpZXcsIHRoaXMuaXRlbXMpO1xuXG4gIC8vIENyZWF0ZSBhIG5ldyBmaW5kIGluc3RhbmNlIGZvciB0aGlzIHNlcnZpY2VcbiAgdGhpcy5maW5kID0gbmV3IEZpbmQoKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgdGhlIFZpZXdcbiAqIEBwYXJhbSAge09iamVjdH0gb2JqICAgIFRoZSB2aWV3IGNvbmZpZ3VyYXRpb25cbiAqIEBwYXJhbSAge09iamVjdH0gdGFyZ2V0IFRoZSB0YXJnZXQgdmlldyBpdGVtc1xuICovXG5WaWV3U2VydmljZS5wcm90b3R5cGUuY3JlYXRlVmlldyA9IGZ1bmN0aW9uIGNyZWF0ZVZpZXcgKG9iaiwgdGFyZ2V0KSB7XG4gIGZvciAodmFyIGkgaW4gb2JqKSB7XG4gICAgLy8gcGFzcyB0aHJvdWdoIG91ciBjb25maWd1cmF0aW9uIHRvIGEgbmV3IHZpZXdcbiAgICB0YXJnZXRbaV0gPSBuZXcgVmlldyhvYmpbaV0pO1xuICAgIGlmIChvYmpbaV0uaXRlbXMpIHtcbiAgICAgIC8vIHdlIG5lZWQgdG8gZ28gZGVlcGVyXG4gICAgICB0aGlzLmNyZWF0ZVZpZXcob2JqW2ldLml0ZW1zLCB0YXJnZXRbaV0uaXRlbXMpO1xuICAgIH1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3U2VydmljZTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqLyd1c2Ugc3RyaWN0JztcblxudmFyIGFkYXB0ID0gcmVxdWlyZSgnLi4vYXBpL2NvcmUnKTtcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4uL2FwaS91dGlscycpO1xuXG52YXIgQWRhcHRBY2NvcmRpb24gPSB7XG4gIGRpc3BsYXlOYW1lOiAnQWRhcHRBY2NvcmRpb24nLFxuICBleHRlbmQ6IFthZGFwdC5taXhpbnMuYXJyYXlPYmplY3RdLFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBzZXQgdGhlIGluaXRpYWwgc3RhdGUgdG8gaGF2ZSBhbGwgYWNjb3JkaW9ucyBjbG9zZWRcbiAgICByZXR1cm4ge1xuICAgICAgb3BlbjogLTFcbiAgICB9O1xuICB9LFxuICBvcGVuQWNjb3JkaW9uOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAvLyB0b2dnbGUgdGhlIGFjY29yZGlvbiB0byBiZSBvcGVuLCBvciBjbG9zZWQgaWYgaXQgaXMgYWxyZWFkeSBvcGVuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBvcGVuOiBpZCA9PSB0aGlzLnN0YXRlLm9wZW4gPyAtMSA6IGlkXG4gICAgfSk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcbiAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuY29uZmlnLml0ZW07XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBvcGVuSUQgPSB0aGlzLnN0YXRlLm9wZW47XG4gICAgdmFyIGl0ZW1zID0gW107XG4gICAgdmFyIG1vZGVsID0gY29uZmlnLm1vZGVsW2NvbmZpZy5uYW1lXS52YWx1ZTtcblxuICAgIHZhciBsb29wID0gYWRhcHQuY29tcG9uZW50cy5sb29wO1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZihtb2RlbCkge1xuICAgICAgLy8gc2V0IHRoZSBjb250cm9sbGVyIGFuZCB2aWV3LCBhY2NvcmRpb25zIGFyZW4ndCBpbnZpc2libGUgaW4gdGhlIFZDIHNvIHdlIG5lZWQgdG8gZ28gZG93biBhIGxldmVsXG4gICAgICB2YXIgY2hpbGRDb250cm9sbGVyID0gY29uZmlnLmNvbnRyb2xsZXJbY29uZmlnLm5hbWVdO1xuICAgICAgdmFyIGNoaWxkTW9kZWwgPSBjb25maWcubW9kZWxbY29uZmlnLm5hbWVdLnZhbHVlO1xuXG4gICAgICB2YXIgZHluYW1pY0l0ZW0gPSBhZGFwdC5jb21wb25lbnRzLml0ZW07XG5cbiAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgbW9kZWwubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IFtdO1xuXG4gICAgICAgIC8vIGFjY29yZGlvbnMgbW9kZWxzIGFyZSBhcnJheXMsIGFuZCB3ZSBuZWVkIHRoZSBhcHByb3ByaWF0ZSBtb2RlbCB2YWx1ZSBmb3IgdGhpcyBpdGVyYXRpb25cbiAgICAgICAgdmFyIGZpbmFsTW9kZWwgPSBjaGlsZE1vZGVsW2ldO1xuXG4gICAgICAgIC8vIGFjY29yZGlvbnMgYXJlIHRoZSBzYW1lLCBzbyB3ZSBsb29wIHRocm91Z2ggdGhlIHZpZXcncyBtb2RlbCBmb3IgZWFjaCBhY2NvcmRpb25cbiAgICAgICAgLy8gVE9ETzogbWFrZSBhY2NvcmRpb25zIGhhdmUgZGlmZmVyZW50IHZpZXdzLCB0byBhbGxvdyBkeW5hbWljYWxseSBhZGRlZCBlbGVtZW50c1xuXG4gICAgICAgIGNoaWxkcmVuID0gbG9vcChcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpdGVtczogaXRlbS5tb2RlbCxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNoaWxkQ29udHJvbGxlcixcbiAgICAgICAgICAgIHZhbHVlczogY29uZmlnLnZhbHVlcyxcbiAgICAgICAgICAgIG9ic2VydmU6IGNvbmZpZy5vYnNlcnZlLFxuICAgICAgICAgICAgbmFtZVRyYWlsOiBjb25maWcubmFtZVRyYWlsICsgY29uZmlnLm5hbWUgKyAnLicsXG4gICAgICAgICAgICBtb2RlbDogZmluYWxNb2RlbCxcbiAgICAgICAgICAgIGFkYXB0OiBfdGhpcy5wcm9wcy5hZGFwdFxuICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICAvLyBkb2VzIHRoZSBhY2NvcmRpb24gaGF2ZSBhIHRpdGxlIGVsZW1lbnQgZm9yIGVhY2ggb25lP1xuICAgICAgICB2YXIgdGl0bGUgPSAnSXRlbSc7IC8vIHdlJ2xsIHNldCBhIGRlZmF1bHQgYW55d2F5XG4gICAgICAgIGlmIChpdGVtLnRpdGxlKSB7XG4gICAgICAgICAgLy8gYWNjb3JkaW9ucyBjYW4gaGF2ZSB0aXRsZXMsIHNvIHdlIG5lZWQgdG8gcmVwbGFjZSBhbnkgdmFyaWFibGVzIHJlcXVlc3RlZFxuICAgICAgICAgIHZhciBSRUdFWF9DVVJMWSA9IC97KFtefV0rKX0vZztcblxuICAgICAgICAgIHRpdGxlID0gaXRlbS50aXRsZTtcbiAgICAgICAgICB0aXRsZSA9IHRpdGxlLnJlcGxhY2UoUkVHRVhfQ1VSTFksIGZ1bmN0aW9uKCBtYXRjaCApIHtcbiAgICAgICAgICAgIGlmKCBtYXRjaCA9PT0gJ3tpbmRleH0nICkge1xuICAgICAgICAgICAgICAvLyB7aW5kZXh9IGFsbG93cyB1cyB0byBkaXNwbGF5IHRoZSBudW1iZXIgb2YgdGhlIGFjY29yZGlvbiAocGx1cyBvbmUuLilcbiAgICAgICAgICAgICAgcmV0dXJuIGkgKyAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcG9zc2libGVWYXJpYWJsZSA9IG1hdGNoLnJlcGxhY2UoJ3snLCAnJykucmVwbGFjZSgnfScsICcnKTsgLy8gdGhlcmUncyBwcm9iYWJseSBhIHJlZ2V4IGZvciB0aGlzIHNvbWV3aGVyZVxuXG4gICAgICAgICAgICBpZiggZmluYWxNb2RlbFtwb3NzaWJsZVZhcmlhYmxlXSApIHtcbiAgICAgICAgICAgICAgLy8gdGhlIHZhcmlhYmxlIGV4aXN0cyBpbiB0aGUgbW9kZWwhIGxldCdzIGJpbmQgdGhlbVxuICAgICAgICAgICAgICByZXR1cm4gZmluYWxNb2RlbFtwb3NzaWJsZVZhcmlhYmxlXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFyZSB0aGV5IG9wZW4/XG4gICAgICAgIHZhciB0aXRsZUNsYXNzZXMgPSBjeCh7XG4gICAgICAgICAgJ2VsZW1lbnRfX2FjY29yZGlvbi0tdGl0bGUnOiB0cnVlLFxuICAgICAgICAgICdvcGVuJzogaSA9PT0gb3BlbklEXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBjb250ZW50Q2xhc3NlcyA9IGN4KHtcbiAgICAgICAgICAnZWxlbWVudF9fYWNjb3JkaW9uLS1jb250ZW50JzogdHJ1ZSxcbiAgICAgICAgICAnb3Blbic6IGkgPT09IG9wZW5JRFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBwdXNoIHRoZSBjaGlsZCBpbnRvIHRoZSBpdGVtcyBhcnJheSwgc28gd2UgY2FuIHJlbmRlciBpdCBiZWxvd1xuICAgICAgICBpdGVtcy5wdXNoKFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJlbGVtZW50X19hY2NvcmRpb24tLWNoaWxkXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe1xuICAgICAgICAgICAgICBjbGFzc05hbWU6IHRpdGxlQ2xhc3NlcywgXG4gICAgICAgICAgICAgIG9uQ2xpY2s6ICB0aGlzLm9wZW5BY2NvcmRpb24uYmluZCh0aGlzLCBpKSB9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmgzKG51bGwsIHRpdGxlICksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uaSh7Y2xhc3NOYW1lOiBcImZhIGZhLWNoZXZyb24tZG93blwifSksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uaSh7Y2xhc3NOYW1lOiBcImZhIGZhLWNoZXZyb24tdXBcIn0pXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5hKHtcbiAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImVsZW1lbnRfX2FjY29yZGlvbi0tcmVtb3ZlIG5vLXNlbGVjdFwiLCBcbiAgICAgICAgICAgICAgb25DbGljazogIHRoaXMucmVtb3ZlLmJpbmQodGhpcywgaSkgfSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiZmEgZmEtdGltZXNcIn0pXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogY29udGVudENsYXNzZXMgfSwgXG4gICAgICAgICAgICAgIGNoaWxkcmVuIFxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIHRpdGxlO1xuICAgIGlmKCBpdGVtLnRpdGxlICkge1xuICAgICAgLy8gaWYgdGhlIGFjY29yZGlvbiBoYXMgYSB0aXRsZSwgd2UgbmVlZCB0byByZW5kZXIgaXRcbiAgICAgIC8vIGdyYWIgdGhlIGhlYWRlciBjb21wb25lbnRcbiAgICAgIHZhciBoZWFkZXIgPSBhZGFwdC5jb21wb25lbnRzLmhlYWRlcjtcblxuICAgICAgLy8gcGFzcyBpbiBhIGNvbmZpZywgdGhpcyBpcyBhIGJpdCBvdmVya2lsbCBidXQgaXQgYWxsb3dzIHVzIHRvIHVzZSBpdCBib3RoIGhlcmUgYW5kIGluIHRoZSBKU09OIGRlZmluaXRpb24gb2YgdGhlIHZpZXdcbiAgICAgIHRpdGxlID0gaGVhZGVyKCB7XG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgIHRpdGxlOiBpdGVtLnRpdGxlLFxuICAgICAgICAgICAgdHlwZTogJ2hlYWRlcjpoMidcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGFkYXB0OiB0aGlzLnByb3BzLmFkYXB0XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJuIHRoZSBhY2NvcmRpb24hXG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJlbGVtZW50X19hY2NvcmRpb24gY2xlYXJcIn0sIFxuICAgICAgICBSZWFjdC5ET00uaGVhZGVyKHtjbGFzc05hbWU6IFwiZWxlbWVudF9fYWNjb3JkaW9uLS1oZWFkZXJcIn0sIFxuICAgICAgICAgIHRpdGxlLCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogXCJlbGVtZW50X19idXR0b24gZWxlbWVudF9fYnV0dG9uLS1hZGQgbm8tc2VsZWN0XCIsIFxuICAgICAgICAgICAgb25DbGljazogIHRoaXMuYWRkfSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uaSh7Y2xhc3NOYW1lOiBcImZhIGZhLXBsdXNcIn0pLCBcIiBBZGQgSXRlbVwiXG4gICAgICAgICAgKVxuICAgICAgICApLCBcblxuICAgICAgICBpdGVtcyBcbiAgICAgIClcbiAgICApO1xuICB9XG59O1xuXG5hZGFwdC5jb21wb25lbnQoJ2FjY29yZGlvbicsIEFkYXB0QWNjb3JkaW9uKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL3ZhciBhZGFwdCA9IHJlcXVpcmUoJy4uL2FwaS9jb3JlJyk7XG52YXIgVXRpbHMgPSByZXF1aXJlKCcuLi9hcGkvdXRpbHMnKTtcblxudmFyIEFkYXB0QnV0dG9uID0ge1xuICBzdGF0aWNzOiB7XG4gICAgZGVmYXVsdE1vZGVsVmFsdWU6IFtdXG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oICl7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1vZGVsOiBVdGlscy5jb3B5KGNvbmZpZy5tb2RlbFsgY29uZmlnLm5hbWUgXS52YWx1ZSlcbiAgICB9XG4gIH0sXG4gIGRpc3BsYXlOYW1lOiAnQWRhcHRCdXR0b24nLFxuICBzZXRPYnNlcnZlcnM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgdmFyIG9ic2VydmVycyA9IGNvbmZpZy5vYnNlcnZlW2NvbmZpZy5uYW1lVHJhaWwgKyBjb25maWcubmFtZV07XG5cbiAgICBmb3IoIHZhciBpIGluIG9ic2VydmVycykge1xuICAgICAgb2JzZXJ2ZXJzW2ldLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50LCBpbmRleCApIHtcbiAgICAgICAgdGhhdC5saXN0ZW5lcnMucHVzaChcbiAgICAgICAgICB0aGF0LnByb3BzLmFkYXB0Lm9ic2VydmUuYWRkTGlzdGVuZXIoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiBjb25maWcubW9kZWxbY29uZmlnLm5hbWVdW2ldIHx8IGNvbmZpZy5pdGVtW2ldO1xuICAgICAgICAgIH0sIGVsZW1lbnQgKVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBsaXN0ZW5lcnM6IFtdLFxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oICkge1xuICAgIHRoaXMuc3RhdGUubGlzdGVuZXJzLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuICAgICAgZWxlbWVudCgpO1xuICAgIH0gKTtcbiAgfSxcbiAgdG9nZ2xlQ2hlY2tib3g6IGZ1bmN0aW9uKCBrZXkgKSB7XG4gICAgdmFyIG1vZGVsID0gdGhpcy5zdGF0ZS5tb2RlbDtcblxuICAgIHZhciBpbmRleCA9IG1vZGVsLmluZGV4T2Yoa2V5KTtcblxuICAgIGlmKCBpbmRleCA+IC0xICkge1xuICAgICAgbW9kZWwuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbW9kZWwucHVzaChrZXkpO1xuICAgIH1cblxuICAgIHRoaXMucHJvcHMuY29uZmlnLm1vZGVsWyB0aGlzLnByb3BzLmNvbmZpZy5uYW1lIF0udmFsdWUgPSBtb2RlbDtcbiAgICB0aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuZGlnZXN0KCk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG1vZGVsOiBtb2RlbCxcbiAgICAgIG5hOiAhbW9kZWwubGVuZ3RoXG4gICAgfSk7XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICB2YXIgbW9kZWwgPSBjb25maWcubW9kZWxbY29uZmlnLm5hbWVdO1xuXG4gICAgdmFyIGV4cHJlc3Npb25WYWx1ZTtcblxuICAgIGlmKCBjb25maWcub2JzZXJ2ZVtjb25maWcubmFtZVRyYWlsICsgY29uZmlnLm5hbWVdICkge1xuICAgICAgdGhpcy5zZXRPYnNlcnZlcnMoKTtcbiAgICB9XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oICkge1xuICAgIHZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxuICAgIHZhclxuICAgICAgbW9kZWwgPSB0aGlzLnN0YXRlLm1vZGVsLFxuICAgICAgdHlwZSA9IHRoaXMuc3RhdGUudHlwZSxcbiAgICAgIGl0ZW0gPSB0aGlzLnByb3BzLmNvbmZpZy5pdGVtO1xuXG4gICAgdmFyIG5hU2VsZWN0ZWQgPSB0aGlzLnN0YXRlLm5hIHx8ICFtb2RlbC5sZW5ndGg7XG5cbiAgICB2YXIgbGFiZWwgPSBhZGFwdC5jb21wb25lbnQoJ2xhYmVsJyk7XG5cbiAgICB2YXIgY2hlY2tib3hlcyA9IFtdO1xuICAgIHZhciBpdGVtcyA9IGl0ZW0ub3B0aW9ucztcblxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiZmllbGQgZmllbGRfX2NoZWNrYm94XCJ9LCBcbiAgICAgICAgXG4gICAgICAgICAgdHlwZW9mIGl0ZW0ubGFiZWwgPT09ICd1bmRlZmluZWQnID8gJycgOlxuICAgICAgICAgIGFkYXB0LmNvbXBvbmVudHMubGFiZWwoe2NvbmZpZzogIHsgaXRlbTogaXRlbX0sIGFkYXB0OiAgdGhpcy5wcm9wcy5hZGFwdH0pLCBcbiAgICAgICAgICBcblxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiZmllbGRfX2NoZWNrYm94LS1jb250YWluZXJcIn0sIFxuXG4gICAgICAgICAgXG4gICAgICAgICAgICB0eXBlb2YgaXRlbS5kZXNjID09PSAndW5kZWZpbmVkJyA/ICcnIDpcbiAgICAgICAgICAgIGFkYXB0LmNvbXBvbmVudHMuZGVzY3JpcHRpb24oe2NvbmZpZzogIHsgaXRlbTogaXRlbX0sIGFkYXB0OiAgdGhpcy5wcm9wcy5hZGFwdH0pXG4gICAgICAgICAgICBcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn07XG5cbmFkYXB0LmNvbXBvbmVudCgnYnV0dG9uJywgQWRhcHRCdXR0b24pO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovJ3VzZSBzdHJpY3QnO1xuXG52YXIgYWRhcHQgPSByZXF1aXJlKCcuLi9hcGkvY29yZScpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vYXBpL3V0aWxzJyk7XG5cbnZhciBBZGFwdENoZWNrYm94ID0ge1xuICBzdGF0aWNzOiB7XG4gICAgZGVmYXVsdE1vZGVsVmFsdWU6IFtdXG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCl7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgLy8gdGhlIG1vZGVsIHZhbHVlIGlzIGFuIGFycmF5LCB3aGljaCBmb3Igc29tZSByZWFzb24sIGdldHMgYmluZGVkIGJ5IHJlZmVyZW5jZSAtIGxldCdzIHN0b3AgdGhhdCBieSByZXR1cm5pbmcgYSBjb3BpZWQgdmVyc2lvblxuICAgIHJldHVybiB7XG4gICAgICBtb2RlbDogdXRpbHMuY29weSggY29uZmlnLm1vZGVsW2NvbmZpZy5uYW1lXS52YWx1ZSApXG4gICAgfTtcbiAgfSxcbiAgZGlzcGxheU5hbWU6ICdBZGFwdENoZWNrYm94JyxcbiAgc2V0T2JzZXJ2ZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gbG9vcCB0aHJvdWdoIHRoZSBvYnNlcnZlcnMgYW5kIHNldCB0aGVtXG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICAvLyBncmFiIHRoZSBvYnNlcnZlcnMsIHVzaW5nIHRoZSBmdWxsIG5hbWUgb2YgdGhlIGNvbXBvbmVudFxuICAgIHZhciBvYnNlcnZlcnMgPSBjb25maWcub2JzZXJ2ZVtjb25maWcubmFtZVRyYWlsICsgY29uZmlnLm5hbWVdO1xuXG4gICAgZm9yKCB2YXIgaSBpbiBvYnNlcnZlcnMpIHtcbiAgICAgIG9ic2VydmVyc1tpXS5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbWVudCwgaW5kZXggKSB7XG4gICAgICAgIC8vIHB1c2ggdGhlIGxpc3RlbmVyIGludG8gYW4gYXJyYXksIHNvIHdlIGNhbiB1bmJpbmQgdGhlbSBhbGwgd2hlbiB0aGUgY29tcG9uZW50IHVubW91bnRzXG4gICAgICAgIF90aGlzLmxpc3RlbmVycy5wdXNoKFxuICAgICAgICAgIF90aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuYWRkTGlzdGVuZXIoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIC8vIHJldHVybiBlaXRoZXIgdGhlIHdhdGNoIHZhbHVlIGluIHRoZSBtb2RlbCwgb3IgdGhlIHdhdGNoIHZhbHVlIGluIHRoZSB2aWV3XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLm1vZGVsW2NvbmZpZy5uYW1lXVtpXSB8fCBjb25maWcuaXRlbVtpXTtcbiAgICAgICAgICB9LCBlbGVtZW50IClcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgbGlzdGVuZXJzOiBbXSxcbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCApIHtcbiAgICAvLyB1bnJlZ2lzdGVyIGFsbCB0aGUgZXZlbnRzXG4gICAgdGhpcy5zdGF0ZS5saXN0ZW5lcnMuZm9yRWFjaCggZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG4gICAgICBlbGVtZW50KCk7XG4gICAgfSApO1xuICB9LFxuICB0b2dnbGVDaGVja2JveDogZnVuY3Rpb24oIGtleSApIHtcbiAgICB2YXIgbW9kZWwgPSB0aGlzLnN0YXRlLm1vZGVsO1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIC8vIGdyYWIgdGhlIChwb3NzaWJsZSkgaW5kZXggb2YgdGhlIHZhbHVlIGluIHRoZSBtb2RlbFxuICAgIHZhciBpbmRleCA9IG1vZGVsLmluZGV4T2Yoa2V5KTtcblxuICAgIGlmKCBpbmRleCA+IC0xICkge1xuICAgICAgLy8gaXQncyBhbHJlYWR5IGluIHRoZSBtb2RlbCwgcmVtb3ZlIGl0XG4gICAgICBtb2RlbC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBhZGQgaXQgdG8gdGhlIG1vZGVsXG4gICAgICBtb2RlbC5wdXNoKGtleSk7XG4gICAgfVxuXG4gICAgLy8gcHVzaCBpdCBiYWNrIGludG8gdGhlIG1vZGVsIGFuZCBub3RpZnkgZXZlcnl0aGluZyBlbHNlXG4gICAgY29uZmlnLm1vZGVsWyBjb25maWcubmFtZSBdLnZhbHVlID0gbW9kZWw7XG4gICAgdGhpcy5wcm9wcy5hZGFwdC5vYnNlcnZlLmRpZ2VzdCgpO1xuXG4gICAgLy8ga2VlcCB0aGUgbW9kZWwgaW4gc3luY1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbW9kZWw6IG1vZGVsLFxuICAgICAgbmE6ICFtb2RlbC5sZW5ndGhcbiAgICB9KTtcbiAgfSxcbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgLy8gaWYgb2JzZXJ2ZXJzIGFyZSBzZXQsIHNldCB0aGVtXG4gICAgaWYoIGNvbmZpZy5vYnNlcnZlW2NvbmZpZy5uYW1lVHJhaWwgKyBjb25maWcubmFtZV0gKSB7XG4gICAgICB0aGlzLnNldE9ic2VydmVycygpO1xuICAgIH1cbiAgfSxcbiAgdG9nZ2xlTkE6IGZ1bmN0aW9uKCApIHtcbiAgICAvLyB0aGUgTkEgYnV0dG9uIGlzIHNlbGVjdGVkIHdoZW4gbm90aGluZyBpcyBzZWxlY3RlZCwgYWxzbyBjbGVhcnMgc2VsZWN0aW9uIHdoZW4gY2xpY2tlZFxuICAgIHZhciBtb2RlbCA9IHRoaXMuc3RhdGUubW9kZWw7XG4gICAgdmFyIG5hO1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSBhbnkgaXRlbXMgaW4gdGhlIG1vZGVsXG4gICAgaWYoIG1vZGVsLmxlbmd0aCApIHtcbiAgICAgIHRoaXMub2xkVmFsdWVzID0gbW9kZWw7IC8vIHN0b3JlIHRoZW0sIHNvIGlmIHRoZSB1c2VyIGFjY2lkZW50YWxseSBjbGlja3Mgb24gTkEgdGhleSBjYW4gcmVzdG9yZSB0aGVtIGJ5IGNsaWNraW5nIG9uIGl0IGFnYWluXG5cbiAgICAgIG5hID0gdHJ1ZTsgLy8gc2V0IHRoZSBOQSBidXR0b24gdG8gYWN0aXZlXG4gICAgICBtb2RlbCA9IFtdOyAvLyBjbGVhciB0aGUgbW9kZWxcblxuICAgICAgLy8gdXBkYXRlIHRoZSBzdGF0ZVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIG5hOiB0cnVlLFxuICAgICAgICBtb2RlbDogW11cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiggdGhpcy5zdGF0ZS5uYSApIHtcbiAgICAgICAgLy8gaWYgdGhlcmUgYXJlIG5vIGl0ZW1zIHNlbGVjdGVkLCBhbmQgTkEgaXMgc2VsZWN0ZWQsIGNoYW5nZSB0aGUgaXRlbXMgYmFja1xuICAgICAgICBuYSA9IGZhbHNlO1xuICAgICAgICBtb2RlbCA9IHRoaXMub2xkVmFsdWVzIHx8IFtdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gdGhlcmUgYXJlIG5vIGl0ZW1zIHNlbGVjdGVkLCBzbyB3ZSBuZWVkIHRvIHNldCBOQSB0byBhY3RpdmVcbiAgICAgICAgbmEgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHB1c2ggaXQgYmFjayBpbnRvIHRoZSBtb2RlbFxuICAgIGNvbmZpZy5tb2RlbFsgY29uZmlnLm5hbWUgXS52YWx1ZSA9IG1vZGVsO1xuICAgIHRoaXMucHJvcHMuYWRhcHQub2JzZXJ2ZS5kaWdlc3QoKTtcblxuICAgIC8vIGtlZXAgdGhlIHZpZXcgaW4gc3luY1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbW9kZWw6IG1vZGVsLFxuICAgICAgbmE6IG5hXG4gICAgfSk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oICkge1xuICAgIHZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxuICAgIHZhciBtb2RlbCA9IHRoaXMuc3RhdGUubW9kZWw7XG4gICAgdmFyIHR5cGUgPSB0aGlzLnN0YXRlLnR5cGU7XG4gICAgdmFyIGl0ZW0gPSB0aGlzLnByb3BzLmNvbmZpZy5pdGVtO1xuXG4gICAgdmFyIG5hU2VsZWN0ZWQgPSB0aGlzLnN0YXRlLm5hIHx8ICFtb2RlbC5sZW5ndGg7XG5cbiAgICB2YXIgbGFiZWwgPSBhZGFwdC5jb21wb25lbnQoJ2xhYmVsJyk7XG5cbiAgICB2YXIgY2hlY2tib3hlcyA9IFtdO1xuICAgIHZhciBpdGVtcyA9IGl0ZW0ub3B0aW9ucztcblxuICAgIC8vIGRvIHdlIGV2ZW4gd2FudCB0aGF0IE5BIGJ1dHRvbj9cbiAgICBpZiggaXRlbS5pbmNsdWRlTkEgKSB7XG4gICAgICB2YXIgY2xhc3NlcyA9IGN4KHtcbiAgICAgICAgJ2ZpZWxkX19jaGVja2JveC0taXRlbSc6IHRydWUsXG4gICAgICAgICdmaWVsZF9fY2hlY2tib3gtLWFjdGl2ZSc6IG5hU2VsZWN0ZWRcbiAgICAgIH0pO1xuXG4gICAgICBjaGVja2JveGVzLnB1c2goXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe1xuICAgICAgICAgIGNsYXNzTmFtZTogY2xhc3NlcywgXG4gICAgICAgICAga2V5OiBcIm5hXCIsIFxuICAgICAgICAgIG9uQ2xpY2s6ICB0aGlzLnRvZ2dsZU5BfSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogXCJmYSBmYS1mdyBmYS1jaGVja1wifSksIFxuICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiZmEgZmEtZncgZmEtdGltZXNcIn0pLCBcblxuICAgICAgICAgIFwiTi9BXCJcbiAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8vIGxvb3AgdGhyb3VnaCBhbGwgdGhlIGNoZWNrYm94ZXMgYW5kIHB1c2ggdGhlbSBpbnRvIGFuIGFycmF5XG4gICAgZm9yKCB2YXIgaSBpbiBpdGVtcyApIHtcbiAgICAgIHZhciBjbGFzc2VzID0gY3goe1xuICAgICAgICAnZmllbGRfX2NoZWNrYm94LS1pdGVtJzogdHJ1ZSxcbiAgICAgICAgJ2ZpZWxkX19jaGVja2JveC0tYWN0aXZlJzogbW9kZWwuaW5kZXhPZihpKSA+IC0xXG4gICAgICAgIH0pO1xuXG4gICAgICBjaGVja2JveGVzLnB1c2goXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe1xuICAgICAgICAgIGNsYXNzTmFtZTogY2xhc3NlcywgXG4gICAgICAgICAga2V5OiAgdGhpcy5wcm9wcy5jb25maWcubmFtZSArIGksIFxuICAgICAgICAgIG9uQ2xpY2s6ICB0aGlzLnRvZ2dsZUNoZWNrYm94LmJpbmQodGhpcywgaSkgfSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogXCJmYSBmYS1mdyBmYS1jaGVja1wifSksIFxuICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiZmEgZmEtZncgZmEtdGltZXNcIn0pLCBcbiAgICAgICAgICAgaXRlbXNbaV0gXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdmFyIGxhYmVsID0gbnVsbDtcbiAgICBpZiggaXRlbS5sYWJlbCApIHtcbiAgICAgIHZhciBsYWJlbENvbXBvbmVudCA9IGFkYXB0LmNvbXBvbmVudHMubGFiZWw7XG5cbiAgICAgIGxhYmVsID0gbGFiZWxDb21wb25lbnQoIHtcbiAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgaXRlbTogaXRlbVxuICAgICAgICB9LFxuICAgICAgICBhZGFwdDogdGhpcy5wcm9wcy5hZGFwdFxuICAgICAgfSApO1xuICAgIH1cblxuICAgIHZhciBkZXNjO1xuICAgIGlmKCBpdGVtLmRlY3MgKSB7XG4gICAgICB2YXIgZGVzY0NvbXBvbmVudCA9IGFkYXB0LmNvbXBvbmVudHMuZGVzYztcblxuICAgICAgZGVjID0gZGVzY0NvbXBvbmVudCgge1xuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICBpdGVtOiBpdGVtXG4gICAgICAgIH0sXG4gICAgICAgIGFkYXB0OiB0aGlzLnByb3BzLmFkYXB0XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJmaWVsZCBmaWVsZF9fY2hlY2tib3hcIn0sIFxuICAgICAgICBsYWJlbCwgXG4gICAgICAgIGNoZWNrYm94ZXMsIFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiZmllbGRfX2NoZWNrYm94LS1jb250YWluZXJcIn0sIFxuICAgICAgICAgIGRlc2MgXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG59O1xuXG5hZGFwdC5jb21wb25lbnQoJ2NoZWNrYm94JywgQWRhcHRDaGVja2JveCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi92YXIgYWRhcHQgPSByZXF1aXJlKCcuLi9hcGkvY29yZScpO1xuXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuLi9hcGkvdXRpbHMnKTtcblxudmFyIEFkYXB0Q29sdW1uID0ge1xuICBkaXNwbGF5TmFtZTogJ0FkYXB0Q29sdW1uJyxcbiAgcmVuZGVyOiBmdW5jdGlvbiggKSB7XG4gICAgdmFyIGl0ZW0gPSB0aGlzLnByb3BzLmNvbmZpZy5pdGVtO1xuXG4gICAgdmFyIHZpZXcgPSBpdGVtLml0ZW1zO1xuICAgIHZhciB3aWR0aCA9IGl0ZW0uc3BhbjtcblxuICAgIHZhciBjb2x1bW5zID0ge307XG5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICB2YXIgdG90YWxXaWR0aCA9IDA7XG5cbiAgICBpZiggVXRpbHMuaXNBcnJheSh3aWR0aCkgKSB7XG4gICAgICB3aWR0aC5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbWVudCwgaW5kZXgsIGFycmF5ICkge1xuICAgICAgICB0b3RhbFdpZHRoICs9IGVsZW1lbnQ7XG4gICAgICB9ICk7XG4gICAgfVxuXG52YXIgX3RoaXMgPSB0aGlzO1xuICAgIHZhciB0ID0gMDtcbiAgICB2aWV3LmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50LCBpbmRleCwgYXJyYXkgKSB7XG4gICAgICBpZiggdCA+PSB3aWR0aC5sZW5ndGggKSB7XG4gICAgICAgIHQgPSAwO1xuICAgICAgfVxuXG4gICAgICB2YXIgaXRlbXMgPSB7fTtcblxuICAgICAgdmFyIGxvb3AgPSBhZGFwdC5jb21wb25lbnRzLmxvb3A7XG5cbiAgICAgIGl0ZW1zID0gbG9vcChcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpdGVtczogZWxlbWVudCxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IHRoYXQucHJvcHMuY29uZmlnLmNvbnRyb2xsZXIsXG4gICAgICAgICAgICB2YWx1ZXM6IHRoYXQucHJvcHMuY29uZmlnLnZhbHVlcyxcbiAgICAgICAgICAgIG9ic2VydmU6IHRoYXQucHJvcHMuY29uZmlnLm9ic2VydmUsXG4gICAgICAgICAgICBuYW1lVHJhaWw6IHRoYXQucHJvcHMuY29uZmlnLm5hbWVUcmFpbCxcbiAgICAgICAgICAgIG1vZGVsOiB0aGF0LnByb3BzLmNvbmZpZy5tb2RlbCxcbiAgICAgICAgICAgIGFkYXB0OiBfdGhpcy5wcm9wcy5hZGFwdFxuICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgdmFyIGNsYXNzTmFtZSA9ICdjb2x1bW5fX2NvbnRhaW5lciBjb2x1bW5fX2NvbnRhaW5lci0tJyArIHdpZHRoO1xuICAgICAgdmFyIHN0eWxlID0ge307XG5cbiAgICAgIGlmKCBVdGlscy5pc0FycmF5KCB3aWR0aCApICkge1xuICAgICAgICBjbGFzc05hbWUgPSAnY29sdW1uX19jb250YWluZXInO1xuICAgICAgICBzdHlsZS53aWR0aCA9ICggKCB3aWR0aFt0XSAvIHRvdGFsV2lkdGggKSAqICggMTAwIC0gd2lkdGgubGVuZ3RoICsgMSApICkgKyAnJSc7XG5cbiAgICAgICAgaWYoIHQgPT0gd2lkdGgubGVuZ3RoIC0gMSApIHtcbiAgICAgICAgICBzdHlsZS5tYXJnaW5SaWdodCA9ICcwcHgnO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbHVtbnNbJ2NvbHVtbi0nICsgaW5kZXggXSA9IChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBjbGFzc05hbWUsIHN0eWxlOiBzdHlsZSB9LCBcbiAgICAgICAgICBpdGVtc1xuICAgICAgICApXG4gICAgICAgICk7XG5cbiAgICAgIHQrKztcbiAgICB9ICk7XG5cblxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiY29sdW1uIGNsZWFyXCJ9LCBcbiAgICAgICAgY29sdW1uc1xuICAgICAgKVxuICAgICk7XG4gIH1cbn07XG5cbmFkYXB0LmNvbXBvbmVudCgnY29sdW1uJywgQWRhcHRDb2x1bW4pO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovdmFyIGFkYXB0ID0gcmVxdWlyZSgnLi4vYXBpL2NvcmUnKTtcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4uL2FwaS91dGlscycpO1xuXG52YXIgQWRhcHRDb2x1bW5Sb3dzID0ge1xuICBkaXNwbGF5TmFtZTogJ0FkYXB0Q29sdW1uUm93cycsXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBsaXN0ZW5lcnM6IFtdXG4gICAgfVxuICB9LFxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMuc3RhdGUubGlzdGVuZXJzLnB1c2goXG4gICAgICB0aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuYWRkTGlzdGVuZXIoIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3RoaXMucHJvcHMuY29uZmlnLml0ZW0uaXRlbXM7XG4gICAgICB9LCBmdW5jdGlvbiAoIG5ld1ZhbCApIHtcbiAgICAgICAgX3RoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgIH0gKVxuICAgICk7XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zdGF0ZS5saXN0ZW5lcnMuZm9yRWFjaCggZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG4gICAgICBlbGVtZW50KCk7XG4gICAgfSApO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCApIHtcbiAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuY29uZmlnLml0ZW07XG5cbiAgICB2YXIgdmlldyA9IGl0ZW0uaXRlbXM7XG4gICAgdmFyIHdpZHRoID0gaXRlbS5zcGFuO1xuXG4gICAgdmFyIGNvbHVtbnMgPSB7fTtcblxuICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgIHZhciB0b3RhbFdpZHRoID0gMDtcblxuICAgIGlmKCBVdGlscy5pc0FycmF5KHdpZHRoKSApIHtcbiAgICAgIHdpZHRoLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50LCBpbmRleCwgYXJyYXkgKSB7XG4gICAgICB0b3RhbFdpZHRoICs9IGVsZW1lbnQ7XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgdmFyIHIgPSAwO1xuICAgIHZhciB0ID0gMDtcbiAgICBmb3IoIHZhciBpIGluIHZpZXcgKSB7XG4gICAgICBpZiggdCA+PSB3aWR0aC5sZW5ndGggKSB7XG4gICAgICAgIHQgPSAwO1xuICAgICAgfVxuICAgICAgdmFyIGl0ZW1zID0ge307XG5cbiAgICAgIHZhciBjbGFzc05hbWUgPSAnY29sdW1uX19jb250YWluZXIgY29sdW1uX19jb250YWluZXItLScgKyB3aWR0aDtcbiAgICAgIHZhciBzdHlsZSA9IHt9O1xuXG4gICAgICBpZiggVXRpbHMuaXNBcnJheSggd2lkdGggKSApIHtcbiAgICAgICAgY2xhc3NOYW1lID0gJ2NvbHVtbl9fY29udGFpbmVyJztcbiAgICAgICAgc3R5bGUud2lkdGggPSAoICggd2lkdGhbdF0gLyB0b3RhbFdpZHRoICkgKiAoIDEwMCAtIHdpZHRoLmxlbmd0aCArIDEgKSApICsgJyUnO1xuXG4gICAgICAgIGlmKCB0ID09IHdpZHRoLmxlbmd0aCAtIDEgKSB7XG4gICAgICAgICAgc3R5bGUubWFyZ2luUmlnaHQgPSAnMHB4JztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgY29uZmlnID0ge1xuICAgICAgICBtb2RlbDogdGhhdC5wcm9wcy5jb25maWcubW9kZWwsXG4gICAgICAgIG5hbWU6IGksXG4gICAgICAgIGl0ZW06IHZpZXdbaV0sXG4gICAgICAgIHZhbHVlczogdGhhdC5wcm9wcy5jb25maWcudmFsdWVzLFxuICAgICAgICBjb250cm9sbGVyOiB0aGF0LnByb3BzLmNvbmZpZy5jb250cm9sbGVyLFxuICAgICAgICBvYnNlcnZlOiB0aGF0LnByb3BzLmNvbmZpZy5vYnNlcnZlLFxuICAgICAgICBuYW1lVHJhaWw6IHRoYXQucHJvcHMuY29uZmlnLm5hbWVUcmFpbFxuICAgICAgfTtcblxuICAgICAgdmFyIGl0ZW0gPSAodGhpcy50cmFuc2ZlclByb3BzVG8oYWRhcHQuY29tcG9uZW50cy5pdGVtKHtjb25maWc6IGNvbmZpZyB9KSkpO1xuXG4gICAgICBjb2x1bW5zWydjb2x1bW4tJyArIHIgXSA9IChcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBjbGFzc05hbWUsIHN0eWxlOiBzdHlsZSB9LCBcbiAgICAgICAgICBpdGVtXG4gICAgICAgIClcbiAgICAgICAgKTtcblxuICAgICAgcisrO1xuICAgICAgdCsrO1xuICAgIH1cblxuXG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJjb2x1bW4gY2xlYXJcIn0sIFxuICAgICAgICBjb2x1bW5zXG4gICAgICApXG4gICAgKTtcbiAgfVxufTtcblxuYWRhcHQuY29tcG9uZW50KCdjb2x1bW5Sb3dzJywgQWRhcHRDb2x1bW5Sb3dzKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL3ZhciBhZGFwdCA9IHJlcXVpcmUoJy4uL2FwaS9jb3JlJyk7XG5cbnZhciBBZGFwdERlc2NyaXB0aW9uID0ge1xuICBkaXNwbGF5TmFtZTogJ0FkYXB0RGVzY3JpcHRpb24nLFxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIGl0ZW0gPSB0aGlzLnByb3BzLmNvbmZpZy5pdGVtO1xuICAgIHRoaXMubGlzdGVuZXIgPSB0aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGl0ZW0uZGVzYztcbiAgICB9LCBmdW5jdGlvbiAobmV3VmFsLCBvbGRWYWwpIHtcbiAgICAgIHRoYXQuc2V0U3RhdGUoe3RleHQ6IG5ld1ZhbH0pO1xuICAgIH0pO1xuICB9LFxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMubGlzdGVuZXIoKTtcbiAgfSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHJldHVybiB7XG4gICAgICB0ZXh0OiBjb25maWcuaXRlbS5kZXNjXG4gICAgfTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJlYWN0LkRPTS5wKHtjbGFzc05hbWU6IFwiZmllbGRfX2Rlc2NyaXB0aW9uXCJ9LCAgdGhpcy5wcm9wcy5jb25maWcuaXRlbS5kZXNjKTtcbiAgfVxufTtcblxuYWRhcHQuY29tcG9uZW50KCdkZXNjcmlwdGlvbicsIEFkYXB0RGVzY3JpcHRpb24pO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovJ3VzZSBzdHJpY3QnO1xuXG52YXIgdmlldyAgPSByZXF1aXJlKCcuLi9hcGkvdmlldycpO1xudmFyIG1vZGVsID0gcmVxdWlyZSgnLi4vYXBpL21vZGVsJyk7XG52YXIgYWRhcHQgPSByZXF1aXJlKCcuLi9hcGkvY29yZScpO1xuXG52YXIgQWRhcHRGb3JtID0ge1xuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYWRhcHRJbnN0YW5jZSA9IHRoaXMucHJvcHMuYWRhcHQ7XG4gICAgdmFyIG1vZGVsID0gYWRhcHRJbnN0YW5jZS5tb2RlbDtcbiAgICB2YXIgdmlldyA9IGFkYXB0SW5zdGFuY2Uudmlldy5pdGVtcztcbiAgICB2YXIgaXRlbXMgPSBbXTtcblxuICAgIHZhciBkeW5hbWljSXRlbSA9IGFkYXB0LmNvbXBvbmVudCgnaXRlbScpO1xuXG4gICAgZm9yICh2YXIgcHJvcCBpbiB2aWV3KSB7XG4gICAgICB2YXIgaXRlbSA9IHZpZXdbcHJvcF07XG5cbiAgICAgIGl0ZW1zLnB1c2goXG4gICAgICAgIHRoaXMudHJhbnNmZXJQcm9wc1RvKFxuICAgICAgICAgIGR5bmFtaWNJdGVtKCB7XG4gICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgbW9kZWw6IG1vZGVsLml0ZW1zLFxuICAgICAgICAgICAgICB2YWx1ZXM6IG1vZGVsLnZhbHVlcyxcbiAgICAgICAgICAgICAgb2JzZXJ2ZTogbW9kZWwub2JzZXJ2ZSxcbiAgICAgICAgICAgICAgY29udHJvbGxlcjogYWRhcHRJbnN0YW5jZS5jb250cm9sbGVyLml0ZW1zLFxuICAgICAgICAgICAgICBuYW1lOiBwcm9wLFxuICAgICAgICAgICAgICBuYW1lVHJhaWw6ICcnLFxuICAgICAgICAgICAgICBpdGVtOiB2aWV3W3Byb3BdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdmFyIGNsYXNzZXMgPSB7XG4gICAgICAnaGVsbG8nOiAxID09PSAxXG4gICAgfTtcblxuXG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LkRPTS5mb3JtKHtjbGFzc05hbWU6IFwiZHluYW1pY19fZm9ybVwiLCBhdXRvQ29tcGxldGU6IFwib2ZmXCJ9LCBcbiAgICAgICAgaXRlbXMgXG4gICAgICApXG4gICAgKTtcbiAgfVxufTtcblxuYWRhcHQuY29tcG9uZW50KCdmb3JtJywgQWRhcHRGb3JtKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL3ZhciBhZGFwdCA9IHJlcXVpcmUoJy4uL2FwaS9jb3JlJyk7XG5cbnZhciBBZGFwdEhlYWRlciA9IHtcbiAgZGlzcGxheU5hbWU6ICdBZGFwdEhlYWRlcicsXG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oICkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuY29uZmlnLml0ZW07XG4gICAgdGhpcy5saXN0ZW5lciA9IHRoaXMucHJvcHMuYWRhcHQub2JzZXJ2ZS5hZGRMaXN0ZW5lcihmdW5jdGlvbiggKSB7XG4gICAgICByZXR1cm4gaXRlbS5sYWJlbDtcbiAgICB9LCBmdW5jdGlvbiggbmV3VmFsLCBvbGRWYWwgKSB7XG4gICAgICB0aGF0LnNldFN0YXRlKHt0ZXh0OiBuZXdWYWx9KTtcbiAgICB9KTtcbiAgfSxcbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmxpc3RlbmVyKCk7XG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHJldHVybiB7XG4gICAgICB0ZXh0OiBjb25maWcuaXRlbS50ZXh0LFxuICAgICAgc2l6ZTogY29uZmlnLml0ZW0udHlwZS5zcGxpdCgnOicpWzFdIHx8ICdoMSdcbiAgICB9O1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmVhY3QuRE9NLnNwYW4oe2NsYXNzTmFtZTogICdoZWFkZXIgaGVhZGVyX18nICsgdGhpcy5zdGF0ZS5zaXplfSwgIHRoaXMucHJvcHMuY29uZmlnLml0ZW0udGV4dCk7XG4gIH1cbn07XG5cbmFkYXB0LmNvbXBvbmVudCgnaGVhZGVyJywgQWRhcHRIZWFkZXIpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovdmFyIGFkYXB0ID0gcmVxdWlyZSgnLi4vYXBpL2NvcmUnKTtcblxudmFyIEFkYXB0SHIgPSB7XG4gIGRpc3BsYXlOYW1lOiAnQWRhcHRIcicsXG4gIHJlbmRlcjogZnVuY3Rpb24oICkge1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiZWxlbWVudF9faHJcIn0pXG4gICAgKTtcbiAgfVxufTtcblxuYWRhcHQuY29tcG9uZW50KCdocicsIEFkYXB0SHIpO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovdmFyIGFkYXB0ID0gcmVxdWlyZSgnLi4vYXBpL2NvcmUnKTtcblxudmFyIEFkYXB0SW5wdXQgPSB7XG4gIGV4dGVuZDogW2FkYXB0Lm1peGlucy5mbGF0XSxcbiAgZGlzcGxheU5hbWU6ICdBZGFwdElucHV0JyxcbiAgcmVuZGVyOiBmdW5jdGlvbiggKSB7XG4gICAgdmFyIG1vZGVsID0gJyc7XG4gICAgaWYoIHRoaXMucHJvcHMuY29uZmlnLm1vZGVsW3RoaXMucHJvcHMuY29uZmlnLm5hbWVdICkge1xuICAgICAgbW9kZWwgPSB0aGlzLnByb3BzLmNvbmZpZy5tb2RlbFt0aGlzLnByb3BzLmNvbmZpZy5uYW1lXS52YWx1ZTtcbiAgICB9XG4gICAgdmFyIG1vZGVsQ2xhc3MgPSAnJztcbiAgICBpZiggdGhpcy5wcm9wcy5jb25maWcubW9kZWxbdGhpcy5wcm9wcy5jb25maWcubmFtZV0gKSB7XG4gICAgICBtb2RlbENsYXNzID0gdGhpcy5wcm9wcy5jb25maWcubW9kZWxbdGhpcy5wcm9wcy5jb25maWcubmFtZV0ubW9kZWw7XG4gICAgfVxuICAgIHZhciB0eXBlID0gdGhpcy5zdGF0ZS50eXBlO1xuICAgIHZhciBpdGVtID0gdGhpcy5wcm9wcy5jb25maWcuaXRlbTtcblxuICAgIHZhciBjb250cm9sbGVyID0ge307XG4gICAgaWYoIHRoaXMucHJvcHMuY29uZmlnLmNvbnRyb2xsZXIgJiYgdGhpcy5wcm9wcy5jb25maWcuY29udHJvbGxlclsgdGhpcy5wcm9wcy5jb25maWcubmFtZSBdICkge1xuICAgICAgY29udHJvbGxlciA9IHRoaXMucHJvcHMuY29uZmlnLmNvbnRyb2xsZXJbIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgXTtcbiAgICB9XG5cbiAgICB2YXIgbGFiZWwgPSBhZGFwdC5jb21wb25lbnQoJ2xhYmVsJyk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiAgbW9kZWxDbGFzcyArICcgZmllbGQgZmllbGRfX2lucHV0JyArICggdHlwZW9mIGl0ZW0uZGVzYyA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6ICcgaGFzLWRlc2MnKSB9LCBcbiAgICAgICAgXG4gICAgICAgICAgdHlwZW9mIGl0ZW0ubGFiZWwgPT09ICd1bmRlZmluZWQnID8gJycgOlxuICAgICAgICAgIGFkYXB0LmNvbXBvbmVudHMubGFiZWwoe2NvbmZpZzogIHsgaXRlbTogaXRlbX0sIGFkYXB0OiAgdGhpcy5wcm9wcy5hZGFwdH0pLCBcbiAgICAgICAgICBcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImZpZWxkX19pbnB1dC0tY29udGFpbmVyXCJ9LCBcbiAgICAgICAgICBSZWFjdC5ET00uaW5wdXQoe3ZhbHVlOiBtb2RlbCwgYXV0b0NvbXBsZXRlOiBcIm9mZlwiLCB0eXBlOiBcInRleHRcIiwgb25DaGFuZ2U6ICB0aGlzLmhhbmRsZUNoYW5nZSwgcGxhY2Vob2xkZXI6ICBpdGVtLnBsYWNlaG9sZGVyLCBkaXNhYmxlZDogIGNvbnRyb2xsZXIuZGlzYWJsZWR9KSwgXG4gICAgICAgICAgXG4gICAgICAgICAgICB0eXBlb2YgaXRlbS5kZXNjID09PSAndW5kZWZpbmVkJyA/ICcnIDpcbiAgICAgICAgICAgIGFkYXB0LmNvbXBvbmVudHMuZGVzY3JpcHRpb24oe2NvbmZpZzogIHsgaXRlbTogaXRlbX0sIGFkYXB0OiAgdGhpcy5wcm9wcy5hZGFwdH0pXG4gICAgICAgICAgICBcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn07XG5cbmFkYXB0LmNvbXBvbmVudCgnaW5wdXQnLCBBZGFwdElucHV0KTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL3ZhciBVdGlscyA9IHJlcXVpcmUoJy4uL2FwaS91dGlscycpO1xudmFyIGFkYXB0ID0gcmVxdWlyZSgnLi4vYXBpL2NvcmUnKTtcblxudmFyIEFkYXB0SW5wdXREYXRlID0ge1xuICBleHRlbmQ6IFthZGFwdC5taXhpbnMuZmxhdF0sXG4gIGRpc3BsYXlOYW1lOiAnQWRhcHRJbnB1dERhdGUnLFxuICBzZXRTdGF0dXM6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcbiAgICB0aGlzLnNldFN0YXRlKHtvcGVuOiB2YWx1ZX0pO1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGF5czogWydTdW4nLCAnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaScsICdTYXQnXVxuICAgIH07XG4gIH0sXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiggKSB7XG4gICAgdGhpcy5pZCA9IE1hdGgucmFuZG9tKCkgKiAxMDA7XG5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICBpZiggIVV0aWxzLmZpbmRDbG9zZXN0UGFyZW50KGUudGFyZ2V0LCAnZmllbGRfX2lucHV0ZGF0ZS0tJyArIHRoYXQuc3RhdGUubmFtZSArIHRoYXQuaWQpICkge1xuICAgICAgICBpZiggdGhhdC5zdGF0ZS5vcGVuICkge1xuICAgICAgICAgIHRoYXQuc2V0U3RhdHVzKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBoYW5kbGVDaGFuZ2U6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIERBVEVfUkVHRVhQID0gL14oWzAtOV17Mn0pXFwvKFswLTldezJ9KVxcLyhbMC05XXs0fSkkLztcblxuICAgIHZhciB2YWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcblxuICAgIGlmKCBEQVRFX1JFR0VYUC50ZXN0KHZhbHVlICkgKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlLnNwbGl0KCcvJyk7XG4gICAgICB2YXIgZGF5ID0gdmFsdWVbMF07XG4gICAgICB2YXIgbW9udGggPSB2YWx1ZVsxXTtcbiAgICAgIHZhciB5ZWFyID0gdmFsdWVbMl07XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBtb2RlbDogbmV3IERhdGUoeWVhciwgbW9udGggLSAxLCBkYXkpLmdldFRpbWUoKSxcbiAgICAgICAgdGVtcFZhbHVlOiB0aGlzLmZvcm1hdFRpbWUobmV3IERhdGUoeWVhciwgbW9udGggLSAxLCBkYXkpLmdldFRpbWUoKSksXG4gICAgICAgIGN1cnJlbnREYXRlOiBuZXcgRGF0ZSh5ZWFyLCBtb250aCAtIDEsIDEpXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5wcm9wcy5jb25maWcubW9kZWxbIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgXS52YWx1ZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoIC0gMSwgZGF5KS5nZXRUaW1lKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBtb2RlbDogJycsXG4gICAgICAgIHRlbXBWYWx1ZTogdmFsdWVcbiAgICAgIH0pO1xuICAgICAgdGhpcy5wcm9wcy5jb25maWcubW9kZWxbIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgXS52YWx1ZSA9ICcnO1xuICAgIH1cblxuICAgIHRoaXMucHJvcHMuYWRhcHQub2JzZXJ2ZS5kaWdlc3QoKTtcbiAgfSxcbiAgcGFyc2VNb250aDogZnVuY3Rpb24obW9udGgsIHllYXIpIHtcbiAgICB2YXIgZGF5c0luTW9udGggPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCArIDEsIDApLmdldERhdGUoKTtcbiAgICB2YXIgZmlyc3REYXkgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSkuZ2V0RGF5KCk7XG4gICAgdmFyIGxhc3RNb250aCA9IG5ldyBEYXRlKHllYXIgLSAobW9udGggPT09IDAgPyAxIDogMCksIChtb250aCA9PT0gMCA/IDExIDogbW9udGggLSAxKSArIDEsIDApO1xuICAgIHZhciBuZXh0TW9udGggPSBuZXcgRGF0ZSh5ZWFyICsgKG1vbnRoID09PSAxMSA/IDEgOiAwKSwgKG1vbnRoID09PSAxMSA/IDAgOiBtb250aCArIDEpLCAxKTtcbiAgICB2YXIgbGFzdCA9IGZpcnN0RGF5O1xuICAgIHZhciBuZXh0TW9udGhEYXlzO1xuICAgIHZhciBkYXlzID0ge307XG5cbiAgICB0aGlzLnN0YXRlLmRhdGUubmV4dE1vbnRoID0ge1xuICAgICAgbW9udGg6IG5leHRNb250aC5nZXRNb250aCgpLFxuICAgICAgeWVhcjogbmV4dE1vbnRoLmdldEZ1bGxZZWFyKClcbiAgICB9O1xuICAgIHRoaXMuc3RhdGUuZGF0ZS5sYXN0TW9udGggPSB7XG4gICAgICBtb250aDogbGFzdE1vbnRoLmdldE1vbnRoKCksXG4gICAgICB5ZWFyOiBsYXN0TW9udGguZ2V0RnVsbFllYXIoKVxuICAgIH07XG5cbiAgICB2YXIgbW9udGggPSB0aGlzLnN0YXRlLmN1cnJlbnREYXRlID8gdGhpcy5zdGF0ZS5jdXJyZW50RGF0ZS5nZXRNb250aCgpIDogbmV3IERhdGUodGhpcy5zdGF0ZS50b2RheSkuZ2V0TW9udGgoKTtcblxuICAgIHRoaXMuc3RhdGUuZGF0ZS5kaXNwbGF5TW9udGggPSB0aGlzLm1vbnRoc1ttb250aF07XG4gICAgdGhpcy5zdGF0ZS5kYXRlLmRpc3BsYXlZZWFyID0geWVhcjtcblxuICAgIGZvciAodmFyIGogPSBsYXN0OyBqLS07KSB7XG4gICAgICB2YXIgZGF5ID0ge1xuICAgICAgICBkYXk6IGxhc3RNb250aC5nZXREYXRlKCkgLSBqLFxuICAgICAgICB5ZWFyOiBsYXN0TW9udGguZ2V0RnVsbFllYXIoKSxcbiAgICAgICAgbW9udGg6IGxhc3RNb250aC5nZXRNb250aCgpLFxuICAgICAgfTtcblxuICAgICAgZGF5c1snZGF5LScgKyBkYXkuZGF5ICsgJy0nICsgZGF5Lm1vbnRoXSA9IChcbiAgICAgICAgUmVhY3QuRE9NLmxpKHtvbkNsaWNrOiAgdGhpcy5jaGFuZ2VEYXRlLmJpbmQodGhpcywgZGF5KSB9LCBcbiAgICAgICAgICAgbGFzdE1vbnRoLmdldERhdGUoKSAtIGpcbiAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF5c0luTW9udGg7IGkrKykge1xuICAgICAgdmFyIHRpbWVzdGFtcCA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCBpICsgMSkuZ2V0VGltZSgpO1xuXG4gICAgICB2YXIgZGF5ID0ge1xuICAgICAgICBkYXk6IGkgKyAxLFxuICAgICAgICB0b2RheTogdGltZXN0YW1wID09PSB0aGlzLnN0YXRlLnRvZGF5LFxuICAgICAgICB5ZWFyOiB5ZWFyLFxuICAgICAgICBtb250aDogbW9udGgsXG4gICAgICAgIHRpbWVzdGFtcDogdGltZXN0YW1wLFxuICAgICAgICBjdXJyZW50TW9udGg6IHRydWVcbiAgICAgIH07XG5cbiAgICAgIGRheXNbJ2RheS0nICsgZGF5LmRheSArICctJyArIGRheS5tb250aF0gPSAoXG4gICAgICAgIFJlYWN0LkRPTS5saSh7XG4gICAgICAgICAgb25DbGljazogIHRoaXMuY2hhbmdlRGF0ZS5iaW5kKHRoaXMsIGRheSksIFxuICAgICAgICAgIGNsYXNzTmFtZTogICggZGF5LnRvZGF5ID8gJ3RvZGF5ICcgOiAnJyApICsgJ21vbnRoJyArICggdGltZXN0YW1wID09IHRoaXMuc3RhdGUubW9kZWwgPyAnIHNlbGVjdGVkJyA6ICcnKSB9LCBcbiAgICAgICAgICAgZGF5LmRheVxuICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgdmFyIGxlbmd0aCA9IE9iamVjdC5rZXlzKGRheXMpLmxlbmd0aDtcblxuICAgIG5leHRNb250aERheXMgPSAoTWF0aC5jZWlsKGxlbmd0aCAvIDcpICogNykgLSBsZW5ndGg7XG5cbiAgICBmb3IgKHZhciB6ID0gMDsgeiA8IG5leHRNb250aERheXM7IHorKykge1xuXG4gICAgICB2YXIgZGF5ID0ge1xuICAgICAgICBkYXk6IHogKyAxLFxuICAgICAgICB5ZWFyOiBuZXh0TW9udGguZ2V0RnVsbFllYXIoKSxcbiAgICAgICAgbW9udGg6IG5leHRNb250aC5nZXRNb250aCgpXG4gICAgICB9O1xuXG4gICAgICBkYXlzWydkYXktJyArIGRheS5kYXkgKyAnLScgKyBkYXkubW9udGhdID0gKFxuICAgICAgICBSZWFjdC5ET00ubGkoe29uQ2xpY2s6ICB0aGlzLmNoYW5nZURhdGUuYmluZCh0aGlzLCBkYXkpIH0sIFxuICAgICAgICAgICB6ICsgMVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBkYXlzO1xuXG4gIH0sXG4gIGNoYW5nZU1vbnRoOiBmdW5jdGlvbiggbW9udGgsIHllYXIgKSB7XG4gICAgdGhpcy5wYXJzZU1vbnRoKG1vbnRoLCB5ZWFyKTtcbiAgICB0aGlzLnNldFN0YXRlKHtjdXJyZW50RGF0ZTogbmV3IERhdGUoeWVhciwgbW9udGgsIDEpfSk7XG4gIH0sXG4gIGNoYW5nZURhdGU6IGZ1bmN0aW9uKCBkYXkgKSB7XG4gICAgaWYoIGRheSAmJiBkYXkuZGF5ICkge1xuICAgICAgdGhpcy5zdGF0ZS5tb2RlbCA9IG5ldyBEYXRlKGRheS55ZWFyLCBkYXkubW9udGgsIGRheS5kYXkpLmdldFRpbWUoKTtcbiAgICAgIHRoaXMuc3RhdGUub3BlbiA9IGZhbHNlO1xuICAgICAgdGhpcy5zdGF0ZS50ZW1wVmFsdWUgPSB0aGlzLmZvcm1hdFRpbWUodGhpcy5zdGF0ZS5tb2RlbCk7XG5cbiAgICAgIHRoaXMucHJvcHMuY29uZmlnLm1vZGVsWyB0aGlzLnByb3BzLmNvbmZpZy5uYW1lIF0udmFsdWUgPSB0aGlzLnN0YXRlLm1vZGVsO1xuICAgICAgdGhpcy5wcm9wcy5hZGFwdC5vYnNlcnZlLmRpZ2VzdCgpO1xuICAgIH1cbiAgICB0aGlzLmNoYW5nZU1vbnRoKGRheS5tb250aCwgZGF5LnllYXIpO1xuICB9LFxuICBmb3JtYXRUaW1lOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhbHVlID0gbmV3IERhdGUodmFsdWUpO1xuICAgIHJldHVybiAoJzAnICsgdmFsdWUuZ2V0RGF0ZSgpKS5zbGljZSgtMikgKyAnLycgKyAoJzAnICsgKHZhbHVlLmdldE1vbnRoKCkrMSkpLnNsaWNlKC0yKSArICcvJyArIHZhbHVlLmdldEZ1bGxZZWFyKCk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oICkge1xuICAgIHZhclxuICAgICAgdmFsdWUgPSB0aGlzLnN0YXRlLm1vZGVsLFxuICAgICAgdHlwZSA9IHRoaXMuc3RhdGUudHlwZSxcbiAgICAgIGl0ZW0gPSB0aGlzLnN0YXRlLml0ZW07XG5cbiAgICB0aGlzLnN0YXRlLm9wZW4gPSB0aGlzLnN0YXRlLm9wZW4gfHwgZmFsc2U7XG5cbiAgICB0aGlzLnN0YXRlLmRhdGUgPSB7fTtcblxuICAgIHRoaXMubW9udGhzID0gW1xuICAgICAnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsXG4gICAgICdKdWx5JywnQXVndXN0JywnU2VwdGVtYmVyJywnT2N0b2JlcicsJ05vdmVtYmVyJywnRGVjZW1iZXInXG4gICAgXTtcblxuICAgIHRoaXMuc3RhdGUudG9kYXkgPSBuZXcgRGF0ZSgpO1xuXG4gICAgdGhpcy5zdGF0ZS50b2RheSA9IG5ldyBEYXRlKHRoaXMuc3RhdGUudG9kYXkuZ2V0RnVsbFllYXIoKSwgdGhpcy5zdGF0ZS50b2RheS5nZXRNb250aCgpLCB0aGlzLnN0YXRlLnRvZGF5LmdldERhdGUoKSkuZ2V0VGltZSgpO1xuXG4gICAgaWYoIHZhbHVlICkge1xuICAgICAgdmFyIGEgPSBuZXcgRGF0ZSh2YWx1ZSk7XG4gICAgICB0aGlzLnN0YXRlLm1vZGVsID0gbmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLCBhLmdldE1vbnRoKCksIGEuZ2V0RGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0ZS5jdXJyZW50RGF0ZSA9IHZhbHVlIHx8IHRoaXMuc3RhdGUuY3VycmVudERhdGUgPyAoIHRoaXMuc3RhdGUuY3VycmVudERhdGUgfHwgbmV3IERhdGUodmFsdWUpICkgOiBmYWxzZTtcblxuICAgIHZhciBtb250aCA9IHRoaXMuc3RhdGUuY3VycmVudERhdGUgPyB0aGlzLnN0YXRlLmN1cnJlbnREYXRlLmdldE1vbnRoKCkgOiBuZXcgRGF0ZSh0aGlzLnN0YXRlLnRvZGF5KS5nZXRNb250aCgpO1xuICAgIHZhciB5ZWFyID0gdGhpcy5zdGF0ZS5jdXJyZW50RGF0ZSA/IHRoaXMuc3RhdGUuY3VycmVudERhdGUuZ2V0RnVsbFllYXIoKSA6IG5ldyBEYXRlKHRoaXMuc3RhdGUudG9kYXkpLmdldEZ1bGxZZWFyKCk7XG5cbiAgICB0aGlzLnN0YXRlLmRhdGUubGFzdE1vbnRoID0ge307XG4gICAgdGhpcy5zdGF0ZS5kYXRlLm5leHRNb250aCA9IHt9O1xuICAgIHRoaXMuc3RhdGUuZGF0ZS5kYXlzID0gdGhpcy5wYXJzZU1vbnRoKG1vbnRoLCB5ZWFyKTtcbiAgICB0aGlzLnN0YXRlLmRhdGUuZGlzcGxheU1vbnRoID0gdGhpcy5tb250aHNbbW9udGhdO1xuICAgIHRoaXMuc3RhdGUuZGF0ZS5kaXNwbGF5WWVhciA9IHllYXI7XG5cbiAgICBmdW5jdGlvbiBkYXlzICh2YWx1ZSwgaW5kZXgpIHtcbiAgICAgIHJldHVybiBSZWFjdC5ET00ubGkoe2tleTogaW5kZXggfSwgdmFsdWUgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiAnZmllbGQgZmllbGRfX2lucHV0ZGF0ZSBmaWVsZF9faW5wdXQgZmllbGRfX2lucHV0ZGF0ZS0tJyArIHRoaXMuc3RhdGUubmFtZSArIHRoaXMuaWR9LCBcbiAgICAgICAgXG4gICAgICAgICAgdHlwZW9mIGl0ZW0ubGFiZWwgPT09ICd1bmRlZmluZWQnID8gJycgOlxuICAgICAgICAgIGFkYXB0LmNvbXBvbmVudHMubGFiZWwoe2NvbmZpZzogIHsgaXRlbTogaXRlbX0sIGFkYXB0OiAgdGhpcy5wcm9wcy5hZGFwdH0pLCBcbiAgICAgICAgICBcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiAgKCB0aGlzLnN0YXRlLm9wZW4gPyAnb3BlbiAnIDogJycgKSArICdmaWVsZF9faW5wdXRkYXRlLS1jb250YWluZXInfSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmlucHV0KHtvbkZvY3VzOiAgdGhpcy5zZXRTdGF0dXMuYmluZCh0aGlzLCB0cnVlKSwgdmFsdWU6ICB0aGlzLnN0YXRlLnRlbXBWYWx1ZSwgdHlwZTogXCJ0ZXh0XCIsIG9uQ2hhbmdlOiAgdGhpcy5oYW5kbGVDaGFuZ2UsIHBsYWNlaG9sZGVyOiBcImRkL21tL3l5eXlcIiwgb25DbGljazogIHRoaXMuc2V0U3RhdHVzLmJpbmQodGhpcywgdHJ1ZSkgfSksIFxuICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiZmEgZmEtY2FsZW5kYXIgbm8tc2VsZWN0XCIsIG9uQ2xpY2s6ICB0aGlzLnNldFN0YXR1cy5iaW5kKHRoaXMsICF0aGlzLnN0YXRlLm9wZW4pIH0pLCBcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiaW5wdXRkYXRlX19kcm9wZG93biBuby1zZWxlY3RcIn0sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImlucHV0ZGF0ZV9fZHJvcGRvd24tLWhlYWRlclwifSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiZmEgZmEtY2hldnJvbi1sZWZ0XCIsIG9uQ2xpY2s6ICB0aGlzLmNoYW5nZURhdGUuYmluZCh0aGlzLCB0aGlzLnN0YXRlLmRhdGUubGFzdE1vbnRoKSB9KSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiZmEgZmEtY2hldnJvbi1yaWdodFwiLCBvbkNsaWNrOiAgdGhpcy5jaGFuZ2VEYXRlLmJpbmQodGhpcywgdGhpcy5zdGF0ZS5kYXRlLm5leHRNb250aCkgfSksIFxuICAgICAgICAgICAgICBSZWFjdC5ET00uZGl2KG51bGwsIFxuICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLmRhdGUuZGlzcGxheU1vbnRoICsgJyAnICsgdGhpcy5zdGF0ZS5kYXRlLmRpc3BsYXlZZWFyXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwiaW5wdXRkYXRlX19kYXlzXCJ9LCBcbiAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZGF5cy5tYXAoZGF5cykgXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiBcImlucHV0ZGF0ZV9fbGlzdFwifSwgXG4gICAgICAgICAgICAgICB0aGlzLnN0YXRlLmRhdGUuZGF5c1xuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZW9mIGl0ZW0uZGVzYyA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6XG4gICAgICAgICAgICBhZGFwdC5jb21wb25lbnRzLmRlc2NyaXB0aW9uKHtjb25maWc6ICB7IGl0ZW06IGl0ZW19LCBhZGFwdDogIHRoaXMucHJvcHMuYWRhcHR9KVxuICAgICAgICAgIFxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxufTtcblxuYWRhcHQuY29tcG9uZW50KCdpbnB1dERhdGUnLCBBZGFwdElucHV0RGF0ZSk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi8ndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL2FwaS91dGlscycpO1xudmFyIGFkYXB0ID0gcmVxdWlyZSgnLi4vYXBpL2NvcmUnKTtcblxudmFyIEFkYXB0SXRlbSA9IHtcbiAgZGlzcGxheU5hbWU6ICdBZGFwdEl0ZW0nLFxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuY29uZmlnLml0ZW07XG5cbiAgICB2YXIgZHluYW1pY0l0ZW0gPSBhZGFwdC5jb21wb25lbnQoaXRlbS50eXBlLnNwbGl0KCc6JylbMF0pO1xuXG4gICAgdmFyIHBvc3NpYmxlSXRlbSA9IHV0aWxzLmNvbnZlcnRUb0NhbWVsQ2FzZShpdGVtLnR5cGUpO1xuXG4gICAgaWYoIGFkYXB0LmNvbXBvbmVudHNbcG9zc2libGVJdGVtXSApIHtcbiAgICAgIGR5bmFtaWNJdGVtID0gYWRhcHQuY29tcG9uZW50KHBvc3NpYmxlSXRlbSk7XG4gICAgfVxuXG4gICAgdGhpcy5wcm9wcy5jb25maWcuaXRlbS5mdWxsTmFtZSA9IHRoaXMucHJvcHMuY29uZmlnLm5hbWVUcmFpbCArIHRoaXMucHJvcHMuY29uZmlnLm5hbWU7XG5cbiAgICByZXR1cm4gdGhpcy50cmFuc2ZlclByb3BzVG8oIGR5bmFtaWNJdGVtKCkgKTtcbiAgfVxufTtcblxuYWRhcHQuY29tcG9uZW50KCdpdGVtJywgQWRhcHRJdGVtKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL3ZhciBhZGFwdCA9IHJlcXVpcmUoJy4uL2FwaS9jb3JlJyk7XG5cbnZhciBBZGFwdExhYmVsID0ge1xuICBkaXNwbGF5TmFtZTogJ0FkYXB0TGFiZWwnLFxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCApIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIGl0ZW0gPSB0aGlzLnByb3BzLmNvbmZpZy5pdGVtO1xuICAgIHRoaXMubGlzdGVuZXIgPSB0aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuYWRkTGlzdGVuZXIoZnVuY3Rpb24oICkge1xuICAgICAgcmV0dXJuIGl0ZW0ubGFiZWw7XG4gICAgfSwgZnVuY3Rpb24oIG5ld1ZhbCwgb2xkVmFsICkge1xuICAgICAgdGhhdC5zZXRTdGF0ZSh7dGV4dDogbmV3VmFsfSk7XG4gICAgfSk7XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5saXN0ZW5lcigpO1xuICB9LFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRleHQ6IGNvbmZpZy5pdGVtLmxhYmVsXG4gICAgfTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJlYWN0LkRPTS5oNCh7Y2xhc3NOYW1lOiBcImxhYmVsXCJ9LCAgdGhpcy5wcm9wcy5jb25maWcuaXRlbS5sYWJlbCk7XG4gIH1cbn07XG5cbmFkYXB0LmNvbXBvbmVudCgnbGFiZWwnLCBBZGFwdExhYmVsKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqLyd1c2Ugc3RyaWN0JztcblxudmFyIHZpZXcgID0gcmVxdWlyZSgnLi4vYXBpL3ZpZXcnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL2FwaS91dGlscycpO1xudmFyIGFkYXB0ID0gcmVxdWlyZSgnLi4vYXBpL2NvcmUnKTtcblxudmFyIEFkYXB0TG9vcCA9IHtcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxpc3RlbmVyczogW10sXG4gICAgICBjdXJyZW50U3RhdGU6IHRoaXMucHJvcHMuYWRhcHQuc3RhdGVcbiAgICB9O1xuICB9LFxuICBkaXNwbGF5TmFtZTogJ0FkYXB0TG9vcCcsXG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy5zdGF0ZS5saXN0ZW5lcnMucHVzaChcbiAgICAgIHRoaXMucHJvcHMuYWRhcHQub2JzZXJ2ZS5hZGRMaXN0ZW5lciggZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5wcm9wcy5hZGFwdC5zdGF0ZTtcbiAgICAgIH0sIGZ1bmN0aW9uICggbmV3VmFsICkge1xuICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgY3VycmVudFN0YXRlOiBuZXdWYWxcbiAgICAgICAgfSk7XG4gICAgICB9IClcbiAgICApO1xuICB9LFxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc3RhdGUubGlzdGVuZXJzLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuICAgICAgZWxlbWVudCgpO1xuICAgIH0gKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGl0ZW1zID0gdGhpcy5wcm9wcy5pdGVtcztcbiAgICB2YXIgY29udHJvbGxlciA9IHRoaXMucHJvcHMuY29udHJvbGxlcjtcbiAgICB2YXIgdmFsdWVzID0gdGhpcy5wcm9wcy52YWx1ZXM7XG4gICAgdmFyIG5hbWVUcmFpbCA9IHRoaXMucHJvcHMubmFtZVRyYWlsO1xuICAgIHZhciBvYnNlcnZlID0gdGhpcy5wcm9wcy5vYnNlcnZlO1xuICAgIHZhciBtb2RlbCA9IHRoaXMucHJvcHMubW9kZWw7XG5cbiAgICB2YXIgcmVuZGVyID0gW107XG5cbiAgICB2YXIgZHluYW1pY0l0ZW0gPSBhZGFwdC5jb21wb25lbnRzLml0ZW07XG4gICAgdmFyIGN1cnJlbnRTdGF0ZSA9IHRoaXMuc3RhdGUuY3VycmVudFN0YXRlO1xuXG4gICAgZm9yKCB2YXIgaSBpbiBpdGVtcyApIHtcbiAgICAgIHZhciBzaG93ID0gdHJ1ZTtcbiAgICAgIHZhciBpdGVtID0gaXRlbXNbaV07XG5cbiAgICAgIGlmKCB1dGlscy5jaGVja1N0YXRlKCBpdGVtLnN0YXRlLCBjdXJyZW50U3RhdGUgKSApIHtcbiAgICAgICAgcmVuZGVyLnB1c2goXG4gICAgICAgICAgdGhpcy50cmFuc2ZlclByb3BzVG8oXG4gICAgICAgICAgICBkeW5hbWljSXRlbSgge1xuICAgICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICBtb2RlbDogbW9kZWwsXG4gICAgICAgICAgICAgICAgbmFtZTogaSxcbiAgICAgICAgICAgICAgICBpdGVtOiBpdGVtLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZTogb2JzZXJ2ZSxcbiAgICAgICAgICAgICAgICBuYW1lVHJhaWw6IG5hbWVUcmFpbFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IClcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFJlYWN0LkRPTS5kaXYobnVsbCwgcmVuZGVyICk7XG4gIH1cbn07XG5cbmFkYXB0LmNvbXBvbmVudCgnbG9vcCcsIEFkYXB0TG9vcCk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi92YXIgYWRhcHQgPSByZXF1aXJlKCcuLi9hcGkvY29yZScpO1xudmFyIFV0aWxzID0gcmVxdWlyZSgnLi4vYXBpL3V0aWxzJyk7XG5cbnZhciBBZGFwdFJhZGlvID0ge1xuICBleHRlbmQ6IFthZGFwdC5taXhpbnMuZmxhdF0sXG4gIGRpc3BsYXlOYW1lOiAnQWRhcHRSYWRpbycsXG4gIHJlbmRlcjogZnVuY3Rpb24oICkge1xuICAgIHZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxuICAgIHZhclxuICAgICAgbW9kZWwgPSB0aGlzLnN0YXRlLm1vZGVsLFxuICAgICAgdHlwZSA9IHRoaXMuc3RhdGUudHlwZSxcbiAgICAgIGl0ZW0gPSB0aGlzLnByb3BzLmNvbmZpZy5pdGVtO1xuXG4gICAgdmFyIG5hU2VsZWN0ZWQgPSB0aGlzLnN0YXRlLm5hIHx8ICFtb2RlbC5sZW5ndGg7XG5cbiAgICB2YXIgbGFiZWwgPSBhZGFwdC5jb21wb25lbnQoJ2xhYmVsJyk7XG5cbiAgICB2YXIgY2hlY2tib3hlcyA9IFtdO1xuICAgIHZhciBpdGVtcyA9IGl0ZW0ub3B0aW9ucztcblxuICAgIGlmKCBpdGVtLmluY2x1ZGVOQSApIHtcbiAgICAgIHZhciBjbGFzc2VzID0gY3goe1xuICAgICAgICAnZmllbGRfX3JhZGlvLS1pdGVtJzogdHJ1ZSxcbiAgICAgICAgJ2ZpZWxkX19yYWRpby0tYWN0aXZlJzogbmFTZWxlY3RlZFxuICAgICAgICB9KTtcblxuICAgICAgY2hlY2tib3hlcy5wdXNoKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IGNsYXNzZXMsIGtleTogXCJuYVwiLCBvbkNsaWNrOiAgdGhpcy50b2dnbGVOQX0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiZmEgZmEtZncgZmEtY2lyY2xlXCJ9KSwgXG4gICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogXCJmYSBmYS1mdyBmYS1jaXJjbGUtb1wifSksIFxuXG4gICAgICAgICAgXCJOL0FcIlxuICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZm9yKCB2YXIgaSBpbiBpdGVtcyApIHtcbiAgICAgIHZhciBjbGFzc2VzID0gY3goe1xuICAgICAgICAnZmllbGRfX3JhZGlvLS1pdGVtJzogdHJ1ZSxcbiAgICAgICAgJ2ZpZWxkX19yYWRpby0tYWN0aXZlJzogbW9kZWwgPT09IGlcbiAgICAgICAgfSk7XG5cblxuICAgICAgY2hlY2tib3hlcy5wdXNoKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IGNsYXNzZXMsIGtleTogIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgKyBpLCBvbkNsaWNrOiAgdGhpcy5oYW5kbGVDaGFuZ2UuYmluZCh0aGlzLCB7IHRhcmdldDogeyB2YWx1ZTogaSB9IH0pIH0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiZmEgZmEtZncgZmEtY2lyY2xlLW9cIn0pLCBcbiAgICAgICAgICBSZWFjdC5ET00uaSh7Y2xhc3NOYW1lOiBcImZhIGZhLWZ3IGZhLWNoZWNrLWNpcmNsZVwifSksIFxuICAgICAgICAgICBpdGVtc1tpXSBcbiAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwiZmllbGQgZmllbGRfX3JhZGlvXCJ9LCBcbiAgICAgICAgXG4gICAgICAgICAgdHlwZW9mIGl0ZW0ubGFiZWwgPT09ICd1bmRlZmluZWQnID8gJycgOlxuICAgICAgICAgIGFkYXB0LmNvbXBvbmVudHMubGFiZWwoe2NvbmZpZzogIHsgaXRlbTogaXRlbX0sIGFkYXB0OiAgdGhpcy5wcm9wcy5hZGFwdH0pLCBcbiAgICAgICAgICBcbiAgICAgICAgY2hlY2tib3hlcywgXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJmaWVsZF9fcmFkaW8tLWNvbnRhaW5lclwifSwgXG5cbiAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGVvZiBpdGVtLmRlc2MgPT09ICd1bmRlZmluZWQnID8gJycgOlxuICAgICAgICAgICAgYWRhcHQuY29tcG9uZW50cy5kZXNjcmlwdGlvbih7Y29uZmlnOiAgeyBpdGVtOiBpdGVtfSwgYWRhcHQ6ICB0aGlzLnByb3BzLmFkYXB0fSlcbiAgICAgICAgICAgIFxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxufTtcblxuYWRhcHQuY29tcG9uZW50KCdyYWRpbycsIEFkYXB0UmFkaW8pO1xuIiwiLyoqIEBqc3ggUmVhY3QuRE9NICovdmFyIFV0aWxzID0gcmVxdWlyZSgnLi4vYXBpL3V0aWxzJyk7XG52YXIgYWRhcHQgPSByZXF1aXJlKCcuLi9hcGkvY29yZScpO1xuXG52YXIgQWRhcHRTZWxlY3QgPSB7XG4gIGRpc3BsYXlOYW1lOiAnQWRhcHRTZWxlY3QnLFxuICBleHRlbmQ6IFthZGFwdC5taXhpbnMuZmxhdF0sXG4gIGhhbmRsZUNsaWNrOiBmdW5jdGlvbihpKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7bW9kZWw6IHRoaXMuc3RhdGUuaXRlbS5vcHRpb25zW2ldLnZhbHVlLCBvcGVuOiBmYWxzZX0pO1xuXG4gICAgdGhpcy5wcm9wcy5jb25maWcubW9kZWxbIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgXS52YWx1ZSA9IHRoaXMuc3RhdGUuaXRlbS5vcHRpb25zW2ldLnZhbHVlO1xuICAgIHRoaXMucHJvcHMuYWRhcHQub2JzZXJ2ZS5kaWdlc3QoKTtcbiAgfSxcbiAgc2V0U3RhdHVzOiBmdW5jdGlvbiggdmFsdWUgKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7b3BlbjogdmFsdWV9KTtcbiAgfSxcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCApIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgICAgIGlmKCAhVXRpbHMuZmluZENsb3Nlc3RQYXJlbnQoZS50YXJnZXQsICdmaWVsZF9fc2VsZWN0LS0nICsgdGhhdC5zdGF0ZS5uYW1lKSApIHtcbiAgICAgICAgaWYoIHRoYXQuc3RhdGUub3BlbiApIHtcbiAgICAgICAgICB0aGF0LnNldFN0YXR1cyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiggKSB7XG4gICAgdmFyXG4gICAgICB2YWx1ZSA9IHRoaXMuc3RhdGUubW9kZWwsXG4gICAgICB0eXBlID0gdGhpcy5zdGF0ZS50eXBlLFxuICAgICAgaXRlbSA9IHRoaXMucHJvcHMuY29uZmlnLml0ZW07XG5cbiAgICB0aGlzLnN0YXRlLm9wZW4gPSB0aGlzLnN0YXRlLm9wZW4gfHwgZmFsc2U7XG5cbiAgICB2YXIgaXRlbXMgPSB7fTtcblxuICAgIGlmKCBpdGVtLm9wdGlvbnMgKSB7XG4gICAgICBmb3IoIHZhciBpID0gMDsgaSA8IGl0ZW0ub3B0aW9ucy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgaXRlbXNbJ2l0ZW0tJyArIGldID0gKFxuICAgICAgICAgIFJlYWN0LkRPTS5saSh7b25DbGljazogIHRoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzLCBpKSwgY2xhc3NOYW1lOiAgdmFsdWUgPT0gaXRlbS5vcHRpb25zW2ldLnZhbHVlID8gJ2FjdGl2ZScgOiAnJ30sIFxuICAgICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogXCJmYSBmYS1jaGVja1wifSksIFxuICAgICAgICAgICAgIGl0ZW0ub3B0aW9uc1tpXS5sYWJlbFxuICAgICAgICAgIClcbiAgICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tzZWxlY3RdOiBObyBvcHRpb25zIHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgdmFyIGRpc3BsYXlWYWx1ZTtcbiAgICBpZiggdmFsdWUgKSB7XG4gICAgICB2YXIgaW5kZXggPSB0aGlzLnN0YXRlLml0ZW0ub3B0aW9ucy5maWx0ZXIoZnVuY3Rpb24ob2JqKXtcbiAgICAgICAgcmV0dXJuIG9iai52YWx1ZSA9PSB2YWx1ZTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiggaW5kZXgubGVuZ3RoICkge1xuICAgICAgICBkaXNwbGF5VmFsdWUgPSBpbmRleFswXS5sYWJlbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiAnZmllbGQgZmllbGRfX3NlbGVjdCBmaWVsZF9fc2VsZWN0LS0nICsgdGhpcy5zdGF0ZS5uYW1lfSwgXG4gICAgICAgIFxuICAgICAgICAgIHR5cGVvZiBpdGVtLmxhYmVsID09PSAndW5kZWZpbmVkJyA/ICcnIDpcbiAgICAgICAgICBhZGFwdC5jb21wb25lbnRzLmxhYmVsKHtjb25maWc6ICB7IGl0ZW06IGl0ZW19LCBhZGFwdDogIHRoaXMucHJvcHMuYWRhcHR9KSwgXG4gICAgICAgICAgXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJmaWVsZF9fc2VsZWN0LS1jb250YWluZXJcIn0sIFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogICggdGhpcy5zdGF0ZS5vcGVuID8gJ29wZW4gJyA6ICcnICkgKyAnZmllbGRfX3NlbGVjdC0tY3VycmVudCBuby1zZWxlY3QnLCBvbkNsaWNrOiAgdGhpcy5zZXRTdGF0dXMuYmluZCh0aGlzLCAhdGhpcy5zdGF0ZS5vcGVuKSB9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiZmEgZmEtc29ydFwifSksIFxuICAgICAgICAgICAgIGRpc3BsYXlWYWx1ZSB8fCAnUGxlYXNlIHNlbGVjdC4uJ1xuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LkRPTS51bCh7Y2xhc3NOYW1lOiAgKCB0aGlzLnN0YXRlLm9wZW4gPyAnb3BlbiAnIDogJycgKSArICdmaWVsZF9fc2VsZWN0LS1kcm9wZG93bid9LCBcbiAgICAgICAgICAgIGl0ZW1zIFxuICAgICAgICAgICksIFxuICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZW9mIGl0ZW0uZGVzYyA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6XG4gICAgICAgICAgICBhZGFwdC5jb21wb25lbnRzLmRlc2NyaXB0aW9uKHtjb25maWc6ICB7IGl0ZW06IGl0ZW19LCBhZGFwdDogIHRoaXMucHJvcHMuYWRhcHR9KVxuICAgICAgICAgICAgXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG59O1xuXG5hZGFwdC5jb21wb25lbnQoJ3NlbGVjdCcsIEFkYXB0U2VsZWN0KTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL3ZhciBhZGFwdCA9IHJlcXVpcmUoJy4uL2FwaS9jb3JlJyk7XG52YXIgVXRpbHMgPSByZXF1aXJlKCcuLi9hcGkvdXRpbHMnKTtcblxudmFyIEFkYXB0U2VsZWN0TXVsdGlwbGUgPSB7XG4gIGRpc3BsYXlOYW1lOiAnQWRhcHRTZWxlY3RNdWx0aXBsZScsXG4gIHN0YXRpY3M6IHtcbiAgICBkZWZhdWx0TW9kZWxWYWx1ZTogW11cbiAgfSxcbiAgZXh0ZW5kOiBbYWRhcHQubWl4aW5zLmFycmF5XSxcbiAgcmVuZGVyOiBmdW5jdGlvbiggKSB7XG4gICAgdmFyXG4gICAgICB2YWx1ZSA9IHRoaXMuc3RhdGUubW9kZWwsXG4gICAgICB0eXBlID0gdGhpcy5zdGF0ZS50eXBlLFxuICAgICAgaXRlbSA9IHRoaXMucHJvcHMuY29uZmlnLml0ZW0sXG4gICAgICBvcHRpb25zID0gdGhpcy5wcm9wcy5jb25maWcuaXRlbS5vcHRpb25zO1xuXG4gICAgdmFyIG9wdGlvbkxpc3QgPSB7fTtcblxuICAgIGlmKCBvcHRpb25zICkge1xuICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBvcHRpb25zLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBvcHRpb25MaXN0WydvcHRpb24tJyArIGldID0gKFxuICAgICAgICAgICAgUmVhY3QuRE9NLmxpKHtjbGFzc05hbWU6ICh2YWx1ZS5pbmRleE9mKG9wdGlvbnNbaV0udmFsdWUpID4gLTEgPyAnYWN0aXZlJzogJycpICsgJyBmaWVsZF9fc2VsZWN0bXVsdGlwbGUtLWl0ZW0gbm8tc2VsZWN0JywgcmVmOiAgJ29wdGlvbicgKyBpLCBvbkNsaWNrOiAgdGhpcy5oYW5kbGVDaGFuZ2UuYmluZCh0aGlzLCBpKSB9LCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogXCJmYSBmYS1jaGVjayBmYS1md1wifSksIFxuXG4gICAgICAgICAgICAgICBvcHRpb25zW2ldLmxhYmVsXG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKCdbc2VsZWN0TXVsdGlwbGVdOiBObyBvcHRpb25zIHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJmaWVsZCBmaWVsZF9fc2VsZWN0XCJ9LCBcbiAgICAgICAgXG4gICAgICAgICAgdHlwZW9mIGl0ZW0ubGFiZWwgPT09ICd1bmRlZmluZWQnID8gJycgOlxuICAgICAgICAgIGFkYXB0LmNvbXBvbmVudHMubGFiZWwoe2NvbmZpZzogIHsgaXRlbTogaXRlbX0sIGFkYXB0OiAgdGhpcy5wcm9wcy5hZGFwdH0pLCBcbiAgICAgICAgICBcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImZpZWxkX19zZWxlY3QtLWNvbnRhaW5lclwifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwiZmllbGRfX3NlbGVjdG11bHRpcGxlXCJ9LCBcbiAgICAgICAgICAgIG9wdGlvbkxpc3QgXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgXG4gICAgICAgICAgICB0eXBlb2YgaXRlbS5kZXNjID09PSAndW5kZWZpbmVkJyA/ICcnIDpcbiAgICAgICAgICAgIGFkYXB0LmNvbXBvbmVudHMuZGVzY3JpcHRpb24oe2NvbmZpZzogIHsgaXRlbTogaXRlbX0sIGFkYXB0OiAgdGhpcy5wcm9wcy5hZGFwdH0pXG4gICAgICAgICAgICBcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn07XG5cbmFkYXB0LmNvbXBvbmVudCgnc2VsZWN0TXVsdGlwbGUnLCBBZGFwdFNlbGVjdE11bHRpcGxlKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqLyd1c2Ugc3RyaWN0JztcblxudmFyIGFkYXB0ID0gcmVxdWlyZSgnLi4vYXBpL2NvcmUnKTtcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4uL2FwaS91dGlscycpO1xuXG52YXIgQWRhcHRUYWJjb3JkaW9uID0ge1xuICBkaXNwbGF5TmFtZTogJ0FkYXB0VGFiY29yZGlvbicsXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oICkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHJldHVybiB7XG4gICAgICBpdGVtOiBjb25maWcuaXRlbSxcbiAgICAgIG1vZGVsOiBjb25maWcubW9kZWwsXG4gICAgICBvcGVuVGFiOiAwLFxuICAgICAgb3BlbkFjY29yZGlvbjogMSxcbiAgICAgIGFjY29yZGlvbnM6IHt9LFxuICAgICAgb3BlbkRyb3Bkb3duOiAtMVxuICAgIH07XG4gIH0sXG4gIG9wZW46IGZ1bmN0aW9uKCB0YWJJZCwgYWNjb3JkaW9uSWQgKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSgge1xuICAgICAgb3BlblRhYjogdGFiSWQsXG4gICAgICBvcGVuQWNjb3JkaW9uOiBhY2NvcmRpb25JZCA+IC0xID8gYWNjb3JkaW9uSWQgOiAtMVxuICAgIH0gKTtcbiAgfSxcbiAgYWRkQWNjb3JkaW9uOiBmdW5jdGlvbiggYWNjb3JkaW9uTmFtZSApIHtcblxuICAgIHZhciBuZXdNb2RlbCA9IHt9O1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHRoaXMucHJvcHMuYWRhcHQubW9kZWwuY3JlYXRlTW9kZWwoY29uZmlnLml0ZW0uaXRlbXNbYWNjb3JkaW9uTmFtZV0ubW9kZWwsIG5ld01vZGVsKTtcblxuICAgIGNvbmZpZy5tb2RlbFthY2NvcmRpb25OYW1lXS52YWx1ZS5wdXNoKG5ld01vZGVsKTtcblxuICAgIHRoaXMucHJvcHMuYWRhcHQub2JzZXJ2ZS5kaWdlc3QoKTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgb3BlbkFjY29yZGlvbjogY29uZmlnLm1vZGVsW2FjY29yZGlvbk5hbWVdLnZhbHVlLmxlbmd0aCAtIDFcbiAgICB9KTtcblxuICB9LFxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oICkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgICAgIGlmKCAhVXRpbHMuZmluZENsb3Nlc3RQYXJlbnQoZS50YXJnZXQsICd0YWJjb3JkaW9uX19hY2NvcmRpb24tLWl0ZW0nKSApIHtcbiAgICAgICAgX3RoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIG9wZW5Ecm9wZG93bjogLTFcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIGNvcHlBY2NvcmRpb246IGZ1bmN0aW9uKCBhY2NvcmRpb25OYW1lLCBhY2NvcmRpb25JZCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHZhciBuZXdNb2RlbCA9IHt9O1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHRoaXMucHJvcHMuY29uZmlnLm1vZGVsW2FjY29yZGlvbk5hbWVdLnZhbHVlLnB1c2goXG4gICAgICBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KChjb25maWcubW9kZWxbYWNjb3JkaW9uTmFtZV0udmFsdWVbYWNjb3JkaW9uSWRdKSkpXG4gICAgICApO1xuXG4gICAgdGhpcy5wcm9wcy5hZGFwdC5vYnNlcnZlLmRpZ2VzdCgpO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBvcGVuQWNjb3JkaW9uOiBjb25maWcubW9kZWxbYWNjb3JkaW9uTmFtZV0udmFsdWUubGVuZ3RoIC0gMSxcbiAgICAgIG9wZW5Ecm9wZG93bjogLTFcbiAgICB9KVxuICB9LFxuICBsaXN0ZW5lcnM6IFtdLFxuICByZW1vdmVBY2NvcmRpb246IGZ1bmN0aW9uKCBhY2NvcmRpb25OYW1lLCBhY2NvcmRpb25JZCApIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICB2YXIgY3VycmVudGx5T3BlbmVkID0gdGhpcy5zdGF0ZS5hY2NvcmRpb25zW2FjY29yZGlvbk5hbWVdW3RoaXMuc3RhdGUub3BlbkFjY29yZGlvbl07XG5cbiAgICB2YXIgYXJyID0gY29uZmlnLm1vZGVsWyBhY2NvcmRpb25OYW1lIF0udmFsdWU7XG4gICAgYXJyLnNwbGljZShhY2NvcmRpb25JZCwgMSk7XG5cbiAgICB0aGlzLnByb3BzLmNvbmZpZy5tb2RlbFsgYWNjb3JkaW9uTmFtZSBdLnZhbHVlID0gYXJyO1xuXG4gICAgdGhpcy5zdGF0ZS5hY2NvcmRpb25zW2FjY29yZGlvbk5hbWVdLnNwbGljZShhY2NvcmRpb25JZCwgMSk7XG5cbiAgICB0aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuZGlnZXN0KCk7XG5cbiAgICB2YXIgdG9PcGVuO1xuICAgIGlmKCBhY2NvcmRpb25JZCA9PT0gdGhpcy5zdGF0ZS5vcGVuQWNjb3JkaW9uICkge1xuICAgICAgaWYoIHRoaXMucHJvcHMuY29uZmlnLm1vZGVsW2FjY29yZGlvbk5hbWUgXS52YWx1ZS5sZW5ndGggKSB7XG4gICAgICAgIGlmKCBhY2NvcmRpb25JZCA+IDAgKSB7XG4gICAgICAgICAgdG9PcGVuID0gYWNjb3JkaW9uSWQgLSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRvT3BlbiA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRvT3BlbiA9IC0xO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0b09wZW4gPSB0aGlzLnN0YXRlLmFjY29yZGlvbnNbYWNjb3JkaW9uTmFtZV0uaW5kZXhPZihjdXJyZW50bHlPcGVuZWQpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgb3BlbkFjY29yZGlvbjogdG9PcGVuLFxuICAgICAgb3BlbkRyb3Bkb3duOiAtMVxuICAgIH0pXG4gIH0sXG4gIG9wZW5Ecm9wZG93bjogZnVuY3Rpb24oaWQpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG9wZW5Ecm9wZG93bjogaWQgPT09IHRoaXMuc3RhdGUub3BlbkRyb3Bkb3duID8gLTEgOiBpZFxuICAgIH0pO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCApIHtcbiAgICB2YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbiAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuY29uZmlnLml0ZW07XG4gICAgdmFyIG1vZGVsID0gdGhpcy5zdGF0ZS5tb2RlbDtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICB2YXIgaGVhZGVyID0gW107XG4gICAgdmFyIGNvbnRlbnQgPSBbXTtcblxuICAgIHZhciBpdGVtcyA9IGl0ZW0uaXRlbXM7XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIG9wZW5UYWIgPSB0aGlzLnN0YXRlLm9wZW5UYWI7XG4gICAgdmFyIG9wZW5BY2NvcmRpb24gPSB0aGlzLnN0YXRlLm9wZW5BY2NvcmRpb247XG5cbiAgICB2YXIgciA9IDA7XG4gICAgZm9yKCB2YXIgaSBpbiBpdGVtcyApIHtcbiAgICBcdHZhciBoYW5kbGVUeXBlID0ge1xuICAgIFx0XHR0YWI6IGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgICB2YXIgY2xhc3NlcyA9IGN4KHtcbiAgICAgICAgICAgICd0YWJjb3JkaW9uX19uYXYtLWl0ZW0nOiB0cnVlLFxuICAgICAgICAgICAgJ3RhYmNvcmRpb25fX25hdi0tYWN0aXZlJzogb3BlblRhYiA9PT0gclxuICAgICAgICAgICAgfSk7XG5cbiAgICBcdFx0XHRoZWFkZXIucHVzaChcbiAgICBcdFx0XHRcdFJlYWN0LkRPTS5saSh7a2V5OiBpLCBjbGFzc05hbWU6IGNsYXNzZXMsIG9uQ2xpY2s6ICB0aGlzLm9wZW4uYmluZCh0aGlzLCByKSB9LCBcbiAgICBcdFx0XHRcdFx0IGl0ZW1zW2ldLnRpdGxlXG4gICAgXHRcdFx0XHQpXG4gICAgXHRcdFx0XHQpO1xuXG4gICAgICAgICAgdmFyIGVsZW1lbnQgPSBpdGVtc1tpXTtcblxuICAgICAgICAgIHZhciBjaGlsZHJlbiA9IFtdO1xuXG4gICAgICAgICAgdmFyIGxvb3AgPSBhZGFwdC5jb21wb25lbnRzLmxvb3A7XG5cbiAgICAgICAgICBjaGlsZHJlbiA9IGxvb3AoXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpdGVtczogZWxlbWVudC5pdGVtcyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBjb25maWcuY29udHJvbGxlcixcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbmZpZy52YWx1ZXMsXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZTogY29uZmlnLm9ic2VydmUsXG4gICAgICAgICAgICAgICAgbmFtZVRyYWlsOiBjb25maWcubmFtZVRyYWlsLFxuICAgICAgICAgICAgICAgIG1vZGVsOiBtb2RlbCxcbiAgICAgICAgICAgICAgICBhZGFwdDogX3RoaXMucHJvcHMuYWRhcHRcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgIHZhciBjbGFzc2VzID0gY3goe1xuICAgICAgICAgICAgICAndGFiY29yZGlvbl9fY29udGVudC0taXRlbSc6IHRydWUsXG4gICAgICAgICAgICAgICdjbGVhcic6IHRydWUsXG4gICAgICAgICAgICAgICd0YWJjb3JkaW9uX19jb250ZW50LS1hY3RpdmUnOiBvcGVuVGFiID09PSByXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgIGNvbnRlbnQucHVzaChcbiAgICAgICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogY2xhc3Nlcywga2V5OiBpIH0sIFxuICAgICAgICAgICAgICBjaGlsZHJlbiBcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgXHRcdH0sXG4gICAgXHRcdGFjY29yZGlvbjogZnVuY3Rpb24ocikge1xuXG4gICAgXHRcdFx0dmFyIG5hdkNoaWxkcmVuID0gW107XG5cbiAgICAgICAgICBtb2RlbFtpXS52YWx1ZS5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbWVudCwgaW5kZXggKSB7XG4gICAgICAgICAgICB2YXIgdGl0bGUgPSBpdGVtc1tpXS5hY2NvcmRpb25UaXRsZTtcbiAgICAgICAgICAgIHZhciBzdWJ0aXRsZSA9IGl0ZW1zW2ldLmFjY29yZGlvblN1YnRpdGxlO1xuXG4gICAgICAgICAgICB2YXIgY29udGVudENoaWxkcmVuID0gW107XG5cbiAgICAgICAgICAgIHRpdGxlID0gdGl0bGUucmVwbGFjZSgveyhbXn1dKyl9L2csIGZ1bmN0aW9uKCBtYXRjaCApIHtcbiAgICAgICAgICAgICAgdmFyIHJlcGxhY2UgPSB7XG4gICAgICAgICAgICAgICAgJ3tpbmRleH0nOiBmdW5jdGlvbiggKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5kZXggKyAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICByZXR1cm4gKHJlcGxhY2VbbWF0Y2hdIHx8IHJlcGxhY2VbJ2RlZmF1bHQnXSkoKTtcbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgICAgaWYoIHN1YnRpdGxlICkge1xuICAgICAgICAgICAgICBzdWJ0aXRsZSA9IHN1YnRpdGxlLnJlcGxhY2UoL3soW159XSspfS9nLCBmdW5jdGlvbiggbWF0Y2ggKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlcGxhY2UgPSB7XG4gICAgICAgICAgICAgICAgICAne2luZGV4fSc6IGZ1bmN0aW9uKCApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGluZGV4ICsgMTtcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAnZGVmYXVsdCc6IGZ1bmN0aW9uKCApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1vZGVsTmFtZSA9IG1hdGNoLnJlcGxhY2UoJ3snLCAnJykucmVwbGFjZSgnfScsICcnKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiggIG1vZGVsW2ldLnZhbHVlW2luZGV4XVttb2RlbE5hbWVdICkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtb2RlbFtpXS52YWx1ZVtpbmRleF1bbW9kZWxOYW1lXS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIChyZXBsYWNlW21hdGNoXSB8fCByZXBsYWNlWydkZWZhdWx0J10pKCk7XG4gICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGNsYXNzZXMgPSBjeCh7XG4gICAgICAgICAgICAgICd0YWJjb3JkaW9uX19hY2NvcmRpb24tLWl0ZW0nOiB0cnVlLFxuICAgICAgICAgICAgICAndGFiY29yZGlvbl9fYWNjb3JkaW9uLS1hY3RpdmUnOiBvcGVuQWNjb3JkaW9uID09PSBpbmRleCAmJiBvcGVuVGFiID09PSByXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFyIGRyb3BEb3duQ2xhc3NlcyA9IGN4KHtcbiAgICAgICAgICAgICAgJ3RhYmNvcmRpb25fX2FjY29yZGlvbi0tZHJvcGRvd24nOiB0cnVlLFxuICAgICAgICAgICAgICAndGFiY29yZGlvbl9fYWNjb3JkaW9uLS1kcm9wZG93bi0tYWN0aXZlJzogdGhpcy5zdGF0ZS5vcGVuRHJvcGRvd24gPT09IGluZGV4XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFyIGFycm93Q2xhc3NlcyA9IGN4KHtcbiAgICAgICAgICAgICAgJ2ZhIGZhLWZ3JzogdHJ1ZSxcbiAgICAgICAgICAgICAgJ2ZhLWNhcmV0LWRvd24nOiAhKHRoaXMuc3RhdGUub3BlbkRyb3Bkb3duID09PSBpbmRleCksXG4gICAgICAgICAgICAgICdmYS1jYXJldC11cCc6IHRoaXMuc3RhdGUub3BlbkRyb3Bkb3duID09PSBpbmRleFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgIFx0XHRcdG5hdkNoaWxkcmVuLnB1c2goXG4gICAgICBcdFx0XHRcdFJlYWN0LkRPTS5saSh7a2V5OiBpbmRleCwgY2xhc3NOYW1lOiBjbGFzc2VzIH0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGFiY29yZGlvbl9fYWNjb3JkaW9uLS1ob2xkZXJcIiwgb25DbGljazogIHRoaXMub3Blbi5iaW5kKHRoaXMsIHIsIGluZGV4KSB9LCBcbiAgICBcdFx0XHRcdFx0ICAgXHR0aXRsZSwgXG5cbiAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGFiY29yZGlvbl9fYWNjb3JkaW9uLS10aXRsZVwiLCBkYW5nZXJvdXNseVNldElubmVySFRNTDoge19faHRtbDogc3VidGl0bGUgfHwgJyZuYnNwOyd9fVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksIFxuXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmkoe2NsYXNzTmFtZTogYXJyb3dDbGFzc2VzLCBvbkNsaWNrOiAgdGhpcy5vcGVuRHJvcGRvd24uYmluZCh0aGlzLCBpbmRleCkgfSksIFxuXG4gICAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBkcm9wRG93bkNsYXNzZXMgfSwgXG4gICAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7b25DbGljazogIHRoaXMuY29weUFjY29yZGlvbi5iaW5kKHRoaXMsIGksIGluZGV4KSB9LCBcbiAgICAgICAgICAgICAgICAgICAgXCJEdXBsaWNhdGVcIlxuICAgICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7Y2xhc3NOYW1lOiBcInJlbW92ZVwiLCBvbkNsaWNrOiAgdGhpcy5yZW1vdmVBY2NvcmRpb24uYmluZCh0aGlzLCBpLCBpbmRleCkgfSwgXG4gICAgICAgICAgICAgICAgICAgIFwiUmVtb3ZlXCJcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gIFx0XHRcdFx0XHQgKVxuICAgICAgXHRcdFx0KTtcblxuICAgICAgICAgICAgdmFyIGxvb3AgPSBhZGFwdC5jb21wb25lbnRzLmxvb3A7XG5cbiAgICAgICAgICAgIGNvbnRlbnRDaGlsZHJlbiA9IGxvb3AoXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpdGVtczogaXRlbXNbaV0ubW9kZWwsXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogY29uZmlnLmNvbnRyb2xsZXJbaV0sXG4gICAgICAgICAgICAgICAgdmFsdWVzOiBjb25maWcudmFsdWVzLFxuICAgICAgICAgICAgICAgIG9ic2VydmU6IGNvbmZpZy5vYnNlcnZlLFxuICAgICAgICAgICAgICAgIG5hbWVUcmFpbDogY29uZmlnLm5hbWVUcmFpbCArIGkgKyAnLicsXG4gICAgICAgICAgICAgICAgbW9kZWw6IG1vZGVsW2ldLnZhbHVlW2luZGV4XSxcbiAgICAgICAgICAgICAgICBhZGFwdDogX3RoaXMucHJvcHMuYWRhcHRcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgdmFyIGNsYXNzZXMgPSBjeCh7XG4gICAgICAgICAgICAgICd0YWJjb3JkaW9uX19jb250ZW50LS1pdGVtJzogdHJ1ZSxcbiAgICAgICAgICAgICAgJ2NsZWFyJzogdHJ1ZSxcbiAgICAgICAgICAgICAgJ3RhYmNvcmRpb25fX2NvbnRlbnQtLWFjdGl2ZSc6IG9wZW5BY2NvcmRpb24gPT09IGluZGV4ICYmIG9wZW5UYWIgPT09IHJcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiggIXRoaXMuc3RhdGUuYWNjb3JkaW9uc1tpXSApIHtcbiAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5hY2NvcmRpb25zW2ldID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKCAhdGhpcy5zdGF0ZS5hY2NvcmRpb25zW2ldW2luZGV4XSApIHtcbiAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5hY2NvcmRpb25zW2ldW2luZGV4XSA9ICtuZXcgRGF0ZSgpICsgTWF0aC5yYW5kb20oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGtleSA9IHRoaXMuc3RhdGUuYWNjb3JkaW9uc1tpXVtpbmRleF07XG5cbiAgICAgICAgICAgIGNvbnRlbnQucHVzaChcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBjbGFzc2VzLCBrZXk6IGtleSB9LCBcbiAgICAgICAgICAgICAgICBjb250ZW50Q2hpbGRyZW4gXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICB9LCB0aGlzICk7XG5cbiAgICAgICAgICB2YXIgY2xhc3NlcyA9IGN4KHtcbiAgICAgICAgICAgICd0YWJjb3JkaW9uX19uYXYtLWl0ZW0nOiB0cnVlLFxuICAgICAgICAgICAgJ3RhYmNvcmRpb25fX25hdi0tYWN0aXZlJzogb3BlblRhYiA9PT0gclxuICAgICAgICAgIH0pO1xuXG4gICAgXHRcdFx0aGVhZGVyLnB1c2goXG4gICAgXHRcdFx0XHRSZWFjdC5ET00ubGkoe2NsYXNzTmFtZTogY2xhc3NlcyB9LCBcbiAgICAgICAgXHRcdFx0XHQgaXRlbXNbaV0udGl0bGUsIFxuXG4gICAgICAgIFx0XHRcdFx0UmVhY3QuRE9NLnVsKHtjbGFzc05hbWU6IFwidGFiY29yZGlvbl9fYWNjb3JkaW9uXCJ9LCBcbiAgICAgICAgXHRcdFx0XHRcdG5hdkNoaWxkcmVuLCBcbiAgICAgICAgXHRcdFx0XHRcdFJlYWN0LkRPTS5saSh7Y2xhc3NOYW1lOiBcInRhYmNvcmRpb25fX2FjY29yZGlvbi0taXRlbSB0YWJjb3JkaW9uX19hY2NvcmRpb24tLWFkZFwiLCBvbkNsaWNrOiAgdGhpcy5hZGRBY2NvcmRpb24uYmluZCggdGhpcywgaSkgfSwgXG4gICAgICAgIFx0XHRcdFx0XHRcdFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiZmEgZmEtcGx1cyBmYS1md1wifSksIFxuICAgICAgICBcdFx0XHRcdFx0XHQgaXRlbXNbaV0uYWRkVGV4dCB8fCAnQWRkIEl0ZW0nXG4gICAgICAgIFx0XHRcdFx0XHQpXG4gICAgICAgIFx0XHRcdFx0KVxuICAgICAgICBcdFx0XHQpXG4gICAgXHRcdFx0XHQpO1xuICAgIFx0XHR9XG4gICAgXHR9XG5cbiAgICAgIGhhbmRsZVR5cGVbaXRlbXNbaV0udGFiVHlwZV0uY2FsbCh0aGlzLCByKTtcblxuICAgICAgKytyO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwidGFiY29yZGlvbiBuby1zZWxlY3QgY2xlYXJcIn0sIFxuICAgICAgICBSZWFjdC5ET00uZGl2KHtjbGFzc05hbWU6IFwidGFiY29yZGlvbl9fbmF2XCJ9LCBcbiAgICAgICAgXHRSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogXCJ0YWJjb3JkaW9uX19uYXYtLWxpc3RcIn0sIFxuICAgICAgICBcdFx0aGVhZGVyIFxuICAgICAgICBcdCksIFxuICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtjbGFzc05hbWU6IFwidGFiY29yZGlvbl9fZGl2aWRlclwifSlcbiAgICAgICAgKSwgXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJ0YWJjb3JkaW9uX19jb250ZW50XCJ9LCBcbiAgICAgICAgICBjb250ZW50IFxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxufTtcblxuYWRhcHQuY29tcG9uZW50KCd0YWJjb3JkaW9uJywgQWRhcHRUYWJjb3JkaW9uKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqL3ZhciBhZGFwdCA9IHJlcXVpcmUoJy4uL2FwaS9jb3JlJyk7XG52YXIgVXRpbHMgPSByZXF1aXJlKCcuLi9hcGkvdXRpbHMnKTtcblxudmFyIEFkYXB0VGFibGUgPSB7XG4gIGRpc3BsYXlOYW1lOiAnQWRhcHRUYWJsZScsXG4gIGV4dGVuZDogW2FkYXB0Lm1peGlucy5hcnJheU9iamVjdF0sXG4gIHJlbmRlcjogZnVuY3Rpb24oICkge1xuICAgIHZhciBpdGVtID0gdGhpcy5wcm9wcy5jb25maWcuaXRlbTtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIG9wZW5JRCA9IHRoaXMuc3RhdGUub3BlbiB8fCAtMTtcbiAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICB2YXIgbW9kZWwgPSB0aGlzLnN0YXRlLm1vZGVsO1xuXG4gICAgdmFyIHNpbXBsZSA9ICEhY29uZmlnLml0ZW0udHlwZS5zcGxpdCgnOicpWzFdO1xuXG4gICAgdmFyIGhlYWRlciA9IFtdO1xuXG4gICAgY29uc29sZS5sb2coaXRlbS5tb2RlbCk7XG5cbiAgICBmb3IoIHZhciBpIGluIGl0ZW0ubW9kZWwgKSB7XG4gICAgICBoZWFkZXIucHVzaChcbiAgICAgICAgUmVhY3QuRE9NLnRoKHtrZXk6IGkgfSwgXG4gICAgICAgICAgIGl0ZW0ubW9kZWxbaV0ubGFiZWxcbiAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHZhciB0ID0gMDtcblxuICAgIGlmIChtb2RlbCkge1xuICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBtb2RlbC5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gW107XG5cbiAgICAgICAgaWYoIXNpbXBsZSkge1xuICAgICAgICAgIGNoaWxkcmVuLnB1c2goIFJlYWN0LkRPTS50ZCh7Y2xhc3NOYW1lOiBcImlkXCJ9LCAgaSArIDEpICk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICAgICAgZm9yKCB2YXIgciBpbiBpdGVtLm1vZGVsICkge1xuICAgICAgICAgIHZhciBuZXdJdGVtID0gVXRpbHMuY29weShpdGVtLm1vZGVsW3JdKTtcbiAgICAgICAgICBkZWxldGUgbmV3SXRlbS5kZXNjO1xuICAgICAgICAgIGRlbGV0ZSBuZXdJdGVtLmxhYmVsO1xuXG4gICAgICAgICAgdmFyIGl0ZW1Db25maWcgPSB7XG4gICAgICAgICAgICBtb2RlbDogY29uZmlnLm1vZGVsW2NvbmZpZy5uYW1lXS52YWx1ZVtpXSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbmZpZy5jb250cm9sbGVyW2NvbmZpZy5uYW1lXSxcbiAgICAgICAgICAgIG5hbWU6IHIsXG4gICAgICAgICAgICBpdGVtOiBuZXdJdGVtLFxuICAgICAgICAgICAgdmFsdWVzOiBjb25maWcudmFsdWVzLFxuICAgICAgICAgICAgb2JzZXJ2ZTogY29uZmlnLm9ic2VydmUsXG4gICAgICAgICAgICBuYW1lVHJhaWw6IGNvbmZpZy5uYW1lVHJhaWwgKyBjb25maWcubmFtZSArICcuJ1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICB2YXIgY29udGVudHMgPSB0aGlzLnRyYW5zZmVyUHJvcHNUbyhhZGFwdC5jb21wb25lbnRzLml0ZW0oe2NvbmZpZzogaXRlbUNvbmZpZyB9KSk7XG5cbiAgICAgICAgICBjaGlsZHJlbi5wdXNoKFxuICAgICAgICAgICAgICBSZWFjdC5ET00udGQoe2tleTogIHQgKyByfSwgXG4gICAgICAgICAgICAgICAgY29udGVudHMgXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgdCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hpbGRyZW4ucHVzaChcbiAgICAgICAgICBSZWFjdC5ET00udGQoe2NsYXNzTmFtZTogXCJ0aF9fb3B0aW9uc1wifSwgXG4gICAgICAgICAgICBSZWFjdC5ET00uc3Bhbih7b25DbGljazogIHRoaXMucmVtb3ZlLmJpbmQodGhpcywgaSkgfSwgXG4gICAgICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiZmEgZmEtdGltZXMgZmEtZndcIn0pXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICAgICk7XG5cbiAgICAgICAgdmFyIFJFR0VYX0NVUkxZID0gL3soW159XSspfS9nO1xuXG4gICAgICAgIGl0ZW1zLnB1c2goXG4gICAgICAgICAgUmVhY3QuRE9NLnRyKHtrZXk6IGkgfSwgXG4gICAgICAgICAgICBjaGlsZHJlblxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogICdlbGVtZW50X190YWJsZSBjbGVhciBuby1zZWxlY3QgJyArICggc2ltcGxlID8gJ2VsZW1lbnRfX3RhYmxlLS1zaW1wbGUnIDogJycpIH0sIFxuICAgICAgICBSZWFjdC5ET00udGFibGUoe2NlbGxQYWRkaW5nOiBcIjBcIiwgY2VsbFNwYWNpbmc6IFwiMFwifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnRoZWFkKHtjbGFzc05hbWU6ICBpdGVtcy5sZW5ndGggPyAnJyA6ICdlbXB0eSd9LCBcbiAgICAgICAgICAgIFJlYWN0LkRPTS50cihudWxsLCBcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc2ltcGxlID8gJycgOlxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS50aCh7Y2xhc3NOYW1lOiBcImlkXCJ9LCBcIiNcIiksIFxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgaGVhZGVyLCBcbiAgICAgICAgICAgICAgUmVhY3QuRE9NLnRoKHtjbGFzc05hbWU6IFwidGhfX29wdGlvbnNcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKHtvbkNsaWNrOiAgdGhpcy5hZGR9LCBcbiAgICAgICAgICAgICAgICAgIFJlYWN0LkRPTS5pKHtjbGFzc05hbWU6IFwiZmEgZmEtcGx1cyBmYS1md1wifSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5ET00udGJvZHkobnVsbCwgXG4gICAgICAgICAgICBpdGVtc1xuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn07XG5cbmFkYXB0LmNvbXBvbmVudCgndGFibGUnLCBBZGFwdFRhYmxlKTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqLyd1c2Ugc3RyaWN0JztcblxudmFyIGFkYXB0ID0gcmVxdWlyZSgnLi4vYXBpL2NvcmUnKTtcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4uL2FwaS91dGlscycpO1xuXG52YXIgQWRhcHRUYWJzID0ge1xuICBkaXNwbGF5TmFtZTogJ0FkYXB0VGFicycsXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oICkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHZhciBzdHlsZSA9ICdkZWZhdWx0JztcbiAgICB2YXIgc3BsaXQgPSBjb25maWcuaXRlbS50eXBlLnNwbGl0KCc6Jyk7XG4gICAgaWYoIHNwbGl0Lmxlbmd0aCA+IDEgKSB7XG4gICAgICBzdHlsZSA9IHNwbGl0WzFdO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgaXRlbTogY29uZmlnLml0ZW0sXG4gICAgICBtb2RlbDogY29uZmlnLm1vZGVsLFxuICAgICAgb3BlbjogMCxcbiAgICAgIHN0eWxlOiAndGFicycgKyBzdHlsZVxuICAgIH07XG4gIH0sXG4gIG9wZW46IGZ1bmN0aW9uKGlkKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7b3BlbjogaWR9KTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiggKSB7XG5cbiAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuY29uZmlnLml0ZW07XG4gICAgdmFyIG1vZGVsID0gdGhpcy5zdGF0ZS5tb2RlbDtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cblxuICAgIHZhciBoZWFkZXIgPSBbXTtcbiAgICB2YXIgY29udGVudCA9IFtdO1xuXG4gICAgdmFyIGl0ZW1zID0gaXRlbS5pdGVtcztcblxuICAgIHZhciB0ID0gMDtcbiAgICBmb3IoIHZhciBpIGluIGl0ZW1zICkge1xuICAgICAgaWYoIFV0aWxzLmNoZWNrU3RhdGUoIGl0ZW1zW2ldLnN0YXRlLCB0aGlzLnByb3BzLmFkYXB0LnN0YXRlICkgKSB7XG4gICAgICAgIGhlYWRlci5wdXNoKFxuICAgICAgICAgIFJlYWN0LkRPTS5saSh7a2V5OiBpLCBvbkNsaWNrOiAgdGhpcy5vcGVuLmJpbmQodGhpcywgdCksIGNsYXNzTmFtZTogIHRoaXMuc3RhdGUuc3R5bGUgKyAnX19oZWFkZXItLWl0ZW0gJyArICggdGhpcy5zdGF0ZS5vcGVuID09IHQgPyB0aGlzLnN0YXRlLnN0eWxlICsgJ19faGVhZGVyLS1vcGVuJyA6ICcnICkgKyAoIHRoaXMuc3RhdGUub3BlbiAtIDEgPT0gdCA/IHRoaXMuc3RhdGUuc3R5bGUgKyAnX19oZWFkZXItLWJlZm9yZW9wZW4nIDogJycpIH0sIFxuICAgICAgICAgICAgIGl0ZW1zW2ldLnRpdGxlXG4gICAgICAgICAgKVxuICAgICAgICAgICk7XG5cbiAgICAgICAgdmFyIGNoaWxkcmVuID0gW107XG5cbiAgICAgICAgdmFyIGxvb3AgPSBhZGFwdC5jb21wb25lbnRzLmxvb3A7XG5cbiAgICAgICAgY2hpbGRyZW4gPSBsb29wKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBpdGVtczogaXRlbXNbaV0uaXRlbXMsXG4gICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbmZpZy5jb250cm9sbGVyLFxuICAgICAgICAgICAgICB2YWx1ZXM6IGNvbmZpZy52YWx1ZXMsXG4gICAgICAgICAgICAgIG9ic2VydmU6IGNvbmZpZy5vYnNlcnZlLFxuICAgICAgICAgICAgICBuYW1lVHJhaWw6IGNvbmZpZy5uYW1lVHJhaWwsXG4gICAgICAgICAgICAgIG1vZGVsOiBjb25maWcubW9kZWwsXG4gICAgICAgICAgICAgIGFkYXB0OiB0aGlzLnByb3BzLmFkYXB0XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcblxuICAgICAgICB2YXIgc3R5bGUgPSB7fTtcbiAgICAgICAgaWYoIGl0ZW1zW2ldLnBhZGRpbmcgKSB7XG4gICAgICAgICAgc3R5bGUucGFkZGluZyA9IGl0ZW1zW2ldLnBhZGRpbmc7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGNvbnRlbnQucHVzaChcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHtzdHlsZTogc3R5bGUsIGNsYXNzTmFtZTogIHRoaXMuc3RhdGUuc3R5bGUgKyAnX19jb250ZW50LS1pdGVtICcgKyAoIHRoaXMuc3RhdGUub3BlbiA9PSB0ID8gdGhpcy5zdGF0ZS5zdHlsZSArICdfX2NvbnRlbnQtLW9wZW4nIDogJycpIH0sIFxuICAgICAgICAgICAgY2hpbGRyZW4gXG4gICAgICAgICAgKVxuICAgICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHQrKztcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiAgdGhpcy5zdGF0ZS5zdHlsZSArICcgbm8tc2VsZWN0J30sIFxuICAgICAgICBSZWFjdC5ET00udWwoe2NsYXNzTmFtZTogIHRoaXMuc3RhdGUuc3R5bGUgKyAnX19oZWFkZXIgY2xlYXInfSwgXG4gICAgICAgICAgaGVhZGVyIFxuICAgICAgICApLCBcbiAgICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiAgdGhpcy5zdGF0ZS5zdHlsZSArICdfX2NvbnRlbnQnfSwgXG4gICAgICAgICAgY29udGVudCBcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn07XG5cbmFkYXB0LmNvbXBvbmVudCgndGFicycsIEFkYXB0VGFicyk7XG4iLCIvKiogQGpzeCBSZWFjdC5ET00gKi92YXIgYWRhcHQgPSByZXF1aXJlKCcuLi9hcGkvY29yZScpO1xuXG52YXIgQWRhcHRUZXh0YXJlYSA9IHtcbiAgZXh0ZW5kOiBbYWRhcHQubWl4aW5zLmZsYXRdLFxuICBkaXNwbGF5TmFtZTogJ0FkYXB0VGV4dGFyZWEnLFxuICByZW5kZXI6IGZ1bmN0aW9uKCApIHtcbiAgICB2YXJcbiAgICAgIG1vZGVsID0gdGhpcy5zdGF0ZS5tb2RlbCxcbiAgICAgIHR5cGUgPSB0aGlzLnN0YXRlLnR5cGUsXG4gICAgICBpdGVtID0gdGhpcy5zdGF0ZS5pdGVtO1xuXG4gICAgICB2YXIgbGFiZWwgPSBhZGFwdC5jb21wb25lbnQoJ2xhYmVsJyk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuRE9NLmRpdih7Y2xhc3NOYW1lOiBcImZpZWxkIGZpZWxkX190ZXh0YXJlYVwifSwgXG4gICAgICAgIFxuICAgICAgICAgIHR5cGVvZiBpdGVtLmxhYmVsID09PSAndW5kZWZpbmVkJyA/ICcnIDpcbiAgICAgICAgICBhZGFwdC5jb21wb25lbnRzLmxhYmVsKHtjb25maWc6ICB7IGl0ZW06IGl0ZW19LCBhZGFwdDogIHRoaXMucHJvcHMuYWRhcHR9KSwgXG4gICAgICAgICAgXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoe2NsYXNzTmFtZTogXCJmaWVsZF9fdGV4dGFyZWEtLWNvbnRhaW5lclwifSwgXG4gICAgICAgICAgUmVhY3QuRE9NLnRleHRhcmVhKHtvbkNoYW5nZTogIHRoaXMuaGFuZGxlQ2hhbmdlLCBwbGFjZWhvbGRlcjogIGl0ZW0ucGxhY2Vob2xkZXIsIHZhbHVlOiBtb2RlbCB9KSwgXG4gICAgICAgICAgXG4gICAgICAgICAgICB0eXBlb2YgaXRlbS5kZXNjID09PSAndW5kZWZpbmVkJyA/ICcnIDpcbiAgICAgICAgICAgIGFkYXB0LmNvbXBvbmVudHMuZGVzY3JpcHRpb24oe2NvbmZpZzogIHsgaXRlbTogaXRlbX0sIGFkYXB0OiAgdGhpcy5wcm9wcy5hZGFwdH0pXG4gICAgICAgICAgICBcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn07XG5cbmFkYXB0LmNvbXBvbmVudCgndGV4dGFyZWEnLCBBZGFwdFRleHRhcmVhKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGFkYXB0ID0gcmVxdWlyZSgnLi4vYXBpL2NvcmUnKTtcblxudmFyIGFycmF5ID0ge1xuICBzdGF0aWNzOiB7XG4gICAgZGVmYXVsdE1vZGVsVmFsdWU6IFtdXG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oICkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHJldHVybiB7XG4gICAgICBtb2RlbDogY29uZmlnLm1vZGVsW2NvbmZpZy5uYW1lXS52YWx1ZSxcbiAgICAgIGl0ZW06IGNvbmZpZy5pdGVtLFxuICAgICAgbmFtZTogY29uZmlnLm5hbWUsXG4gICAgfTtcbiAgfSxcbiAgaGFuZGxlQ2hhbmdlOiBmdW5jdGlvbihpKSB7XG4gICAgdmFyXG4gICAgICBtb2RlbCA9IHRoaXMuc3RhdGUubW9kZWwsXG4gICAgICBvcHRpb25zID0gdGhpcy5wcm9wcy5jb25maWcuaXRlbS5vcHRpb25zO1xuXG4gICAgLy8gZmluZCB0aGUgbG9jYXRpb24gb2YgdGhlIGl0ZW1cbiAgICB2YXIgaW5kZXggPSBtb2RlbC5pbmRleE9mKG9wdGlvbnNbaV0udmFsdWUpO1xuICAgIGlmKCBpbmRleCA+IC0xICkge1xuICAgICAgLy8gcmVtb3ZlIGl0XG4gICAgICBtb2RlbC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBhZGQgaXRcbiAgICAgIG1vZGVsLnB1c2gob3B0aW9uc1tpXS52YWx1ZSk7XG4gICAgfVxuXG4gICAgLy8gdXBkYXRlIHRoZSBtb2RlbFxuICAgIHRoaXMucHJvcHMuY29uZmlnLm1vZGVsWyB0aGlzLnByb3BzLmNvbmZpZy5uYW1lIF0udmFsdWUgPSBtb2RlbDtcblxuICAgIC8vIGxldCBldmVyeW9uZSBrbm93XG4gICAgdGhpcy5wcm9wcy5hZGFwdC5vYnNlcnZlLmRpZ2VzdCgpO1xuXG4gICAgLy8ga2VlcCB0aGUgdmlldyBpbiBzeW5jXG4gICAgdGhpcy5zZXRTdGF0ZSh7bW9kZWw6IG1vZGVsfSk7XG4gIH0sXG59O1xuXG5hZGFwdC5taXhpbignYXJyYXknLCBhcnJheSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBhZGFwdCA9IHJlcXVpcmUoJy4uL2FwaS9jb3JlJyk7XG5cbnZhciBhcnJheU9iamVjdCA9IHtcbiAgc3RhdGljczoge1xuICAgIGRlZmF1bHRNb2RlbFZhbHVlOiBbXVxuICB9LFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCApIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbW9kZWw6IGNvbmZpZy5tb2RlbFtjb25maWcubmFtZV0udmFsdWVcbiAgICB9O1xuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uKGlkKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgdmFyIGFyciA9IGNvbmZpZy5tb2RlbFtjb25maWcubmFtZV0udmFsdWU7XG4gICAgYXJyLnNwbGljZShpZCwgMSk7XG5cbiAgICB0aGlzLnByb3BzLmNvbmZpZy5tb2RlbFsgdGhpcy5wcm9wcy5jb25maWcubmFtZSBdLnZhbHVlID0gYXJyO1xuXG4gICAgdGhpcy5wcm9wcy5hZGFwdC5vYnNlcnZlLmRpZ2VzdCgpO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7bW9kZWw6IGFycn0pO1xuXG4gICAgaWYoICFhcnIubGVuZ3RoICkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSggeyBvcGVuOiAtMSB9ICk7XG4gICAgfVxuICB9LFxuICBhZGQ6IGZ1bmN0aW9uKCApIHtcbiAgICB2YXIgbmV3TW9kZWwgPSB7fTtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICB0aGlzLnByb3BzLmFkYXB0Lm1vZGVsLmNyZWF0ZU1vZGVsKGNvbmZpZy5pdGVtLm1vZGVsLCBuZXdNb2RlbCk7XG5cbiAgICBjb25maWcubW9kZWxbY29uZmlnLm5hbWVdLnZhbHVlLnB1c2gobmV3TW9kZWwpO1xuXG4gICAgdGhpcy5wcm9wcy5hZGFwdC5vYnNlcnZlLmRpZ2VzdCgpO1xuXG4gICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICB9LFxufTtcblxuYWRhcHQubWl4aW4oJ2FycmF5T2JqZWN0JywgYXJyYXlPYmplY3QpO1xuIiwidmFyIGFkYXB0ID0gcmVxdWlyZSgnLi4vYXBpL2NvcmUnKTtcblxudmFyIGZsYXQgPSB7XG4gIHN0YXRpY3M6IHtcbiAgICBkZWZhdWx0TW9kZWxWYWx1ZTogJydcbiAgfSxcbiAgZXhwcmVzc2lvblZhbHVlOiBmdW5jdGlvbiAoKSB7fSxcbiAgc2V0RXhwcmVzc2lvblZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIGlmKCBjb25maWcudmFsdWVzW2NvbmZpZy5uYW1lVHJhaWwgKyBjb25maWcubmFtZV0gKSB7XG4gICAgICB0aGlzLmV4cHJlc3Npb25WYWx1ZSgpO1xuXG5cbiAgICAgIHRoaXMuZXhwcmVzc2lvblZhbHVlID0gdGhpcy5wcm9wcy5hZGFwdC5vYnNlcnZlLmFkZExpc3RlbmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy52YWx1ZXNbY29uZmlnLm5hbWVUcmFpbCArIGNvbmZpZy5uYW1lXS5jYWxsKGNvbmZpZy5tb2RlbCk7XG4gICAgICB9LCBmdW5jdGlvbihuZXdWYWwpIHtcbiAgICAgICAgdGhhdC5wcm9wcy5jb25maWcubW9kZWxbdGhhdC5wcm9wcy5jb25maWcubmFtZV0udmFsdWUgPSBuZXdWYWw7XG5cbiAgICAgICAgdGhhdC5zZXRTdGF0ZSh7XG4gICAgICAgICAgbW9kZWw6IG5ld1ZhbFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbW9kZWw6IGNvbmZpZy52YWx1ZXNbY29uZmlnLm5hbWVUcmFpbCArIGNvbmZpZy5uYW1lXS5jYWxsKGNvbmZpZy5tb2RlbCksXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIHNldE9ic2VydmVyczogZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICB2YXIgb2JzZXJ2ZXJzID0gY29uZmlnLm9ic2VydmVbY29uZmlnLm5hbWVUcmFpbCArIGNvbmZpZy5uYW1lXTtcblxuICAgIGZvciggdmFyIGkgaW4gb2JzZXJ2ZXJzKSB7XG4gICAgICBvYnNlcnZlcnNbaV0uZm9yRWFjaCggZnVuY3Rpb24oIGVsZW1lbnQsIGluZGV4ICkge1xuICAgICAgICB0aGF0Lmxpc3RlbmVycy5wdXNoKFxuICAgICAgICAgIHRoYXQucHJvcHMuYWRhcHQub2JzZXJ2ZS5hZGRMaXN0ZW5lcihmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5tb2RlbFtjb25maWcubmFtZV1baV07XG4gICAgICAgICAgfSwgZnVuY3Rpb24gKG5ld1ZhbCwgb2xkVmFsLCBkaWZmKSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5jYWxsKGNvbmZpZy5tb2RlbCwgbmV3VmFsLCBvbGRWYWwsIGRpZmYsIGNvbmZpZy5uYW1lKTtcbiAgICAgICAgICB9IClcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgbGlzdGVuZXJzOiBbXSxcbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHZhciBtb2RlbCA9IGNvbmZpZy5tb2RlbFtjb25maWcubmFtZV07XG5cbiAgICB2YXIgZXhwcmVzc2lvblZhbHVlO1xuXG4gICAgaWYoIGNvbmZpZy52YWx1ZXNbY29uZmlnLm5hbWVUcmFpbCArIGNvbmZpZy5uYW1lXSApIHtcbiAgICAgIHRoaXMuc2V0RXhwcmVzc2lvblZhbHVlKCk7XG4gICAgfVxuXG4gICAgaWYoIGNvbmZpZy5vYnNlcnZlW2NvbmZpZy5uYW1lVHJhaWwgKyBjb25maWcubmFtZV0gKSB7XG4gICAgICB0aGlzLnNldE9ic2VydmVycygpO1xuICAgIH1cblxuICAgIHRoaXMuc3RhdGUubGlzdGVuZXJzLnB1c2goXG4gICAgICB0aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gY29uZmlnLnZhbHVlc1tjb25maWcubmFtZVRyYWlsICsgY29uZmlnLm5hbWVdO1xuICAgICAgfSwgZnVuY3Rpb24oIG5ld1ZhbCApIHtcbiAgICAgICAgdGhhdC5zZXRFeHByZXNzaW9uVmFsdWUoKTtcbiAgICAgIH0gKVxuICAgICk7XG5cbiAgICB0aGlzLnN0YXRlLmxpc3RlbmVycy5wdXNoKFxuICAgICAgdGhpcy5wcm9wcy5hZGFwdC5vYnNlcnZlLmFkZExpc3RlbmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5vYnNlcnZlW2NvbmZpZy5uYW1lVHJhaWwgKyBjb25maWcubmFtZV07XG4gICAgICB9LCBmdW5jdGlvbiggbmV3VmFsICkge1xuICAgICAgICB0aGF0LnNldE9ic2VydmVycygpO1xuICAgICAgfSApXG4gICAgKTtcblxuICAgIHRoaXMuc3RhdGUubGlzdGVuZXJzLnB1c2goXG4gICAgICB0aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBjb25maWcubW9kZWxbY29uZmlnLm5hbWVdLm1vZGVsO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9LCBmdW5jdGlvbiggbmV3VmFsLCBvbGRWYWwgKSB7XG4gICAgICAgIGlmKCBuZXdWYWwgIT09IG51bGwgKSB7XG4gICAgICAgICAgdGhhdC5zZXRTdGF0ZSh7bW9kZWxDbGFzczogbmV3VmFsfSk7XG4gICAgICAgIH1cbiAgICAgIH0gKVxuICAgICk7XG5cbiAgICB0aGlzLnN0YXRlLmxpc3RlbmVycy5wdXNoKFxuICAgICAgICB0aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLm1vZGVsW2NvbmZpZy5uYW1lXS52YWx1ZTtcbiAgICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuICAgICAgfSwgZnVuY3Rpb24oIG5ld1ZhbCwgb2xkVmFsICkge1xuICAgICAgICAgIGlmKCBuZXdWYWwgIT09IG51bGwgKSB7XG4gICAgICAgICAgICB0aGF0LnNldFN0YXRlKHttb2RlbDogbmV3VmFsfSk7XG4gICAgICAgICAgfVxuICAgICAgfSApXG4gICAgKTtcbiAgfSxcbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCApIHtcbiAgICB0aGlzLmV4cHJlc3Npb25WYWx1ZSgpO1xuXG4gICAgdGhpcy5zdGF0ZS5saXN0ZW5lcnMuZm9yRWFjaCggZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG4gICAgICBlbGVtZW50KCk7XG4gICAgfSApO1xuICB9LFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCApIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbW9kZWw6IGNvbmZpZy5tb2RlbFtjb25maWcubmFtZV0udmFsdWUsXG4gICAgICBtb2RlbENsYXNzOiAnJyxcbiAgICAgIGl0ZW06IGNvbmZpZy5pdGVtLFxuICAgICAgbmFtZTogY29uZmlnLm5hbWUsXG4gICAgICBsaXN0ZW5lcnM6IFtdXG4gICAgfTtcbiAgfSxcbiAgaGFuZGxlQ2hhbmdlOiBmdW5jdGlvbihldmVudCkge1xuICAgIHRoaXMucHJvcHMuY29uZmlnLm1vZGVsWyB0aGlzLnByb3BzLmNvbmZpZy5uYW1lIF0udmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgdGhpcy5wcm9wcy5hZGFwdC5vYnNlcnZlLmRpZ2VzdCgpO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7bW9kZWw6IGV2ZW50LnRhcmdldC52YWx1ZX0pO1xuICB9XG59O1xuXG5hZGFwdC5taXhpbignZmxhdCcsIGZsYXQpO1xuIiwidmFyIGFkYXB0ID0gcmVxdWlyZSgnLi4vYXBpL2NvcmUnKTtcblxudmFyIG9iamVjdCA9IHt9O1xuXG5hZGFwdC5taXhpbignb2JqZWN0Jywgb2JqZWN0KTtcbiIsIi8qKiBAanN4IFJlYWN0LkRPTSAqLyd1c2Ugc3RyaWN0JztcblxudmFyIENvcmUgICAgICAgPSByZXF1aXJlKCcuL2FwaS9jb3JlJyk7XG5cbnJlcXVpcmUoJy4vYXBpL2l0ZW1zJyk7XG5cbnZhciBPYnNlcnZlICAgID0gcmVxdWlyZSgnLi9hcGkvb2JzZXJ2ZScpO1xudmFyIFZpZXcgICAgICAgPSByZXF1aXJlKCcuL2FwaS92aWV3Jyk7XG52YXIgTW9kZWwgICAgICA9IHJlcXVpcmUoJy4vYXBpL21vZGVsJyk7XG52YXIgQ29udHJvbGxlciA9IHJlcXVpcmUoJy4vYXBpL2NvbnRyb2xsZXInKTtcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vYXBpL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIEFkYXB0KGNvbmZpZykge1xuICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgdGhpcy5vYnNlcnZlID0gbmV3IE9ic2VydmUoKTtcbiAgdGhpcy52aWV3ID0gbmV3IFZpZXcodGhpcyk7XG4gIHRoaXMubW9kZWwgPSBuZXcgTW9kZWwodGhpcyk7XG4gIHRoaXMuY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMpO1xuXG4gIHZhciBzdGF0ZSA9IGNvbmZpZy5zdGF0ZTtcbiAgaWYoIHN0YXRlICkge1xuICAgIGlmKCBVdGlscy5pc0FycmF5KHN0YXRlKSApIHtcbiAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGF0ZSA9IFtzdGF0ZSB8fCAnZGVmYXVsdCddO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aGlzLnN0YXRlID0gWydkZWZhdWx0J107XG4gIH1cbn1cblxuQWRhcHQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIHZhciBmb3JtID0gQ29yZS5jb21wb25lbnRzLmZvcm07XG5cbiAgY29uc29sZS5kaXIoQ29yZS5jb21wb25lbnRzLnNlbGVjdCk7XG5cbiAgUmVhY3QucmVuZGVyQ29tcG9uZW50KCBmb3JtKCB7IGFkYXB0OiB0aGlzfSApLCBlbGVtZW50KTtcblxuICB0aGlzLm9ic2VydmUuZGlnZXN0KCk7XG59O1xuXG5BZGFwdC5wcm90b3R5cGUuc2V0U3RhdGUgPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgaWYoIFV0aWxzLmlzQXJyYXkoIHN0YXRlICkgKSB7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuc3RhdGUgPSBbc3RhdGVdO1xuICB9XG5cbiAgdGhpcy5vYnNlcnZlLmRpZ2VzdCgpO1xufTtcblxuQWRhcHQucHJvdG90eXBlLmFkZFN0YXRlID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4gIHRoaXMuc3RhdGUucHVzaChzdGF0ZSk7XG5cbiAgdGhpcy5vYnNlcnZlLmRpZ2VzdCgpO1xufTtcblxuQWRhcHQucHJvdG90eXBlLnJlbW92ZVN0YXRlID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4gIHZhciBpbmRleCA9IHRoaXMuc3RhdGUuaW5kZXhPZihzdGF0ZSk7XG5cbiAgaWYoIGluZGV4ID4gLTEgKSB7XG4gICAgdGhpcy5zdGF0ZS5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG59O1xuXG5BZGFwdC5mb3JtcyA9IHt9O1xuXG5BZGFwdC5mb3JtID0gZnVuY3Rpb24gZm9ybShuYW1lLCBjb25maWcpIHtcbiAgaWYgKGNvbmZpZykge1xuICAgIHRoaXMuZm9ybXNbbmFtZV0gPSBuZXcgQWRhcHQoY29uZmlnKTtcbiAgfVxuICBpZiAoIXRoaXMuZm9ybXNbbmFtZV0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1snICsgbmFtZSArICddIGlzIG5vdCBhIGZvcm0nKTtcbiAgfVxuICByZXR1cm4gdGhpcy5mb3Jtc1tuYW1lXTtcbn07XG5cbkFkYXB0LmNvbXBvbmVudHMgPSBDb3JlLmNvbXBvbmVudHM7XG5BZGFwdC5jb21wb25lbnQgPSBDb3JlLmNvbXBvbmVudDtcbkFkYXB0Lm1peGlucyA9IENvcmUubWl4aW5zO1xuQWRhcHQubWl4aW4gPSBDb3JlLm1peGluO1xuXG53aW5kb3cuQWRhcHQgPSBBZGFwdDtcbm1vZHVsZS5leHBvcnRzID0gQWRhcHQ7XG4iXX0=
