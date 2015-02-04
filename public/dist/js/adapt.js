require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Core       = require('./api/core');

require('./api/items');

var Observe    = require('./api/observe');
var View       = require('./api/view');
var Model      = require('./api/model');
var Controller = require('./api/controller');
var Utils = require('./api/utils');

function Adapt(config) {
  this.config = config;
  this.observe = new Observe(this);
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

},{"./api/controller":2,"./api/core":3,"./api/items":5,"./api/model":6,"./api/observe":7,"./api/utils":8,"./api/view":9}],2:[function(require,module,exports){
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

},{"./core":3,"./utils":8}],3:[function(require,module,exports){
'use strict';

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

},{"./utils":8}],4:[function(require,module,exports){
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

},{"./utils":8}],5:[function(require,module,exports){
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

},{"../components/accordion":10,"../components/button":11,"../components/checkbox":12,"../components/column":13,"../components/columnRows":14,"../components/description":15,"../components/form":16,"../components/header":17,"../components/hr":18,"../components/input":19,"../components/inputDate":20,"../components/item":21,"../components/label":22,"../components/loop":23,"../components/radio":24,"../components/select":25,"../components/selectMultiple":26,"../components/tabcordion":27,"../components/table":28,"../components/tabs":29,"../components/textarea":30,"../mixins/array":31,"../mixins/arrayObject":32,"../mixins/flat":33,"../mixins/object":34}],6:[function(require,module,exports){
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
        if( Utils.isObject(element) ) {
          // loop through the previous values
          target[i].value.push({}); // push a new array into the model

          // recursive <3
          _this.extendModel(element, target[i].value[index]);
        } else {
          target[i].value = obj[i];
        }
      } );
    } else if( Utils.isObject( obj[i] ) ) {

    } else {
      // we've exhausted all options, copy it over
      target[i].value = obj[i];
    }
  }
};

module.exports = ModelService;

},{"./core":3,"./find":4,"./utils":8}],7:[function(require,module,exports){
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

},{"./utils":8}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{"./find":4}],10:[function(require,module,exports){
'use strict';

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
          React.createElement("div", {className: "element__accordion--child"}, 
            React.createElement("div", {
              className: titleClasses, 
              onClick:  this.openAccordion.bind(this, i) }, 
              React.createElement("h3", null, title ), 
              React.createElement("i", {className: "fa fa-chevron-down"}), 
              React.createElement("i", {className: "fa fa-chevron-up"})
            ), 
            React.createElement("a", {
              className: "element__accordion--remove no-select", 
              onClick:  this.remove.bind(this, i) }, 
              React.createElement("i", {className: "fa fa-times"})
            ), 
            React.createElement("div", {className: contentClasses }, 
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
      React.createElement("div", {className: "element__accordion clear"}, 
        React.createElement("header", {className: "element__accordion--header"}, 
          title, 
          React.createElement("div", {
            className: "element__button element__button--add no-select", 
            onClick:  this.add}, 
            React.createElement("i", {className: "fa fa-plus"}), " Add Item"
          )
        ), 

        items 
      )
    );
  }
};

adapt.component('accordion', AdaptAccordion);

},{"../api/core":3,"../api/utils":8}],11:[function(require,module,exports){
var adapt = require('../api/core');
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
      React.createElement("div", {className: "field field__checkbox"}, 
        
          typeof item.label === 'undefined' ? '' :
          React.createElement(adapt.components.label, {config:  { item: item}, adapt:  this.props.adapt}), 
          

        React.createElement("div", {className: "field__checkbox--container"}, 

          
            typeof item.desc === 'undefined' ? '' :
            React.createElement(adapt.components.description, {config:  { item: item}, adapt:  this.props.adapt})
            
        )
      )
    );
  }
};

adapt.component('button', AdaptButton);

},{"../api/core":3,"../api/utils":8}],12:[function(require,module,exports){
'use strict';

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

    var controller = {};
    if( this.props.config.controller && this.props.config.controller[ this.props.config.name ] ) {
      controller = this.props.config.controller[ this.props.config.name ];
    }

    // do we even want that NA button?
    if( item.includeNA ) {
      var classes = cx({
        'field__checkbox--item': true,
        'field__checkbox--active': naSelected,
        'field__checkbox--disabled': controller.disabled
      });

      checkboxes.push(
        React.createElement("div", {
          className: classes, 
          key: "na", 
          onClick:  !controller.disabled ? this.toggleNA : function(){}}, 
          React.createElement("i", {className: "fa fa-fw fa-check"}), 
          React.createElement("i", {className: "fa fa-fw fa-times"}), 

          "N/A"
        )
        );
    }

    // loop through all the checkboxes and push them into an array
    for( var i in items ) {
      var classes = cx({
        'field__checkbox--item': true,
        'field__checkbox--active': model.indexOf(i) > -1,
        'field__checkbox--disabled': controller.disabled
        });

      checkboxes.push(
        React.createElement("div", {
          'data-locator':  this.props.config.nameTrail + this.props.config.name + '-checkbox-' + i, 
          className: classes, 
          key:  this.props.config.name + i, 
          onClick:  !controller.disabled ? this.toggleCheckbox.bind(this, i) : function(){}}, 
          React.createElement("i", {className: "fa fa-fw fa-check"}), 
          React.createElement("i", {className: "fa fa-fw fa-times"}), 
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
      React.createElement("div", {className: "field field__checkbox", 'data-locator':  this.props.config.nameTrail + this.props.config.name + '-container'}, 
        label, 
        checkboxes, 
        React.createElement("div", {className: "field__checkbox--container"}, 
          desc 
        )
      )
    );
  }
};

adapt.component('checkbox', AdaptCheckbox);

},{"../api/core":3,"../api/utils":8}],13:[function(require,module,exports){
var adapt = require('../api/core');

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
        React.createElement("div", {className: className, style: style }, 
          items
        )
        );

      t++;
    } );


    return (
      React.createElement("div", {className: "column clear"}, 
        columns
      )
    );
  }
};

adapt.component('column', AdaptColumn);

},{"../api/core":3,"../api/utils":8}],14:[function(require,module,exports){
var adapt = require('../api/core');
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

      var item = (this.transferPropsTo(React.createElement(adapt.components.item, {config: config })));

      columns['column-' + r ] = (
        React.createElement("div", {className: className, style: style }, 
          item
        )
        );

      r++;
      t++;
    }


    return (
      React.createElement("div", {className: "column clear"}, 
        columns
      )
    );
  }
};

adapt.component('columnRows', AdaptColumnRows);

},{"../api/core":3,"../api/utils":8}],15:[function(require,module,exports){
var adapt = require('../api/core');

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
    return React.createElement("p", {className: "field__description"},  this.props.config.item.desc);
  }
};

adapt.component('description', AdaptDescription);

},{"../api/core":3}],16:[function(require,module,exports){
'use strict';

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
      React.createElement("form", {className: "dynamic__form", autoComplete: "off"}, 
        items 
      )
    );
  }
};

adapt.component('form', AdaptForm);

},{"../api/core":3,"../api/model":6,"../api/view":9}],17:[function(require,module,exports){
var adapt = require('../api/core');

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
    return React.createElement("span", {className:  'header header__' + this.state.size},  this.props.config.item.text);
  }
};

adapt.component('header', AdaptHeader);

},{"../api/core":3}],18:[function(require,module,exports){
var adapt = require('../api/core');

var AdaptHr = {
  displayName: 'AdaptHr',
  render: function( ) {
    return (
      React.createElement("div", {className: "element__hr"})
    );
  }
};

adapt.component('hr', AdaptHr);

},{"../api/core":3}],19:[function(require,module,exports){
var adapt = require('../api/core');

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
      React.createElement("div", {className:  modelClass + ' field field__input' + ( typeof item.desc === 'undefined' ? '' : ' has-desc'), 'data-locator':  this.props.config.nameTrail + this.props.config.name + '-container'}, 
        
          typeof item.label === 'undefined' ? '' :
          React.createElement(adapt.components.label, {config:  { item: item}, adapt:  this.props.adapt}), 
          
        React.createElement("div", {className: "field__input--container"}, 
          React.createElement("input", {value: model, autoComplete: "off", type: "text", onChange:  this.handleChange, placeholder:  item.placeholder, disabled:  controller.disabled, 'data-locator':  this.props.config.nameTrail + this.props.config.name}), 
          
            typeof item.desc === 'undefined' ? '' :
            React.createElement(adapt.components.description, {config:  { item: item}, adapt:  this.props.adapt})
            
        )
      )
    );
  }
};

adapt.component('input', AdaptInput);

},{"../api/core":3}],20:[function(require,module,exports){
var Utils = require('../api/utils');
var adapt = require('../api/core');

var AdaptInputDate = {
  extend: [adapt.mixins.flat],
  displayName: 'AdaptInputDate',
  setStatus: function( value ) {
    var controller = {};
    if( this.props.config.controller && this.props.config.controller[ this.props.config.name ] ) {
      controller = this.props.config.controller[ this.props.config.name ];
    }

    if( controller.disabled ) {
      value = false;
    }

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
        React.createElement("li", {onClick:  this.changeDate.bind(this, day) }, 
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
        React.createElement("li", {
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
        React.createElement("li", {onClick:  this.changeDate.bind(this, day) }, 
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

    if( value && !this.state.tempValue ) {
      this.state.tempValue = this.formatTime(value);
    }

    var controller = {};
    if( this.props.config.controller && this.props.config.controller[ this.props.config.name ] ) {
      controller = this.props.config.controller[ this.props.config.name ];
    }

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
      return React.createElement("li", {key: index }, value );
    }

    return (
      React.createElement("div", {className: 'field field__inputdate field__input field__inputdate--' + this.state.name + this.id, 'data-locator':  this.props.config.nameTrail + this.props.config.name + '-container'}, 
        
          typeof item.label === 'undefined' ? '' :
          React.createElement(adapt.components.label, {config:  { item: item}, adapt:  this.props.adapt}), 
          
        React.createElement("div", {className:  ( this.state.open ? 'open ' : '' ) + 'field__inputdate--container'}, 
          React.createElement("input", {'data-locator':  this.props.config.nameTrail + this.props.config.name, onFocus:  this.setStatus.bind(this, true), value:  this.state.tempValue, type: "text", onChange:  this.handleChange, placeholder: "dd/mm/yyyy", onClick:  this.setStatus.bind(this, true), disabled:  controller.disabled}), 
          React.createElement("i", {className: "fa fa-calendar no-select", onClick:  this.setStatus.bind(this, !this.state.open) }), 
          React.createElement("div", {className: "inputdate__dropdown no-select"}, 
            React.createElement("div", {className: "inputdate__dropdown--header"}, 
              React.createElement("i", {className: "fa fa-chevron-left", onClick:  this.changeDate.bind(this, this.state.date.lastMonth) }), 
              React.createElement("i", {className: "fa fa-chevron-right", onClick:  this.changeDate.bind(this, this.state.date.nextMonth) }), 
              React.createElement("div", null, 
                 this.state.date.displayMonth + ' ' + this.state.date.displayYear
              )
            ), 
            React.createElement("ul", {className: "inputdate__days"}, 
               this.props.days.map(days) 
            ), 
            React.createElement("ul", {className: "inputdate__list"}, 
               this.state.date.days
            )
          ), 
          
            typeof item.desc === 'undefined' ? '' :
            React.createElement(adapt.components.description, {config:  { item: item}, adapt:  this.props.adapt})
          
        )
      )
    );
  }
};

adapt.component('inputDate', AdaptInputDate);

},{"../api/core":3,"../api/utils":8}],21:[function(require,module,exports){
'use strict';

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

},{"../api/core":3,"../api/utils":8}],22:[function(require,module,exports){
var adapt = require('../api/core');

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
    return React.createElement("h4", {className: "label"},  this.props.config.item.label);
  }
};

adapt.component('label', AdaptLabel);

},{"../api/core":3}],23:[function(require,module,exports){
'use strict';

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

    return React.createElement("div", null, render );
  }
};

adapt.component('loop', AdaptLoop);

},{"../api/core":3,"../api/utils":8,"../api/view":9}],24:[function(require,module,exports){
var adapt = require('../api/core');
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

    var controller = {};
    if( this.props.config.controller && this.props.config.controller[ this.props.config.name ] ) {
      controller = this.props.config.controller[ this.props.config.name ];
    }

    var label = adapt.component('label');

    var checkboxes = [];
    var items = item.options;

    if( item.includeNA ) {
      var classes = cx({
        'field__radio--item': true,
        'field__radio--active': naSelected
        });

      checkboxes.push(
        React.createElement("div", {className: classes, key: "na", onClick:  this.toggleNA}, 
          React.createElement("i", {className: "fa fa-fw fa-circle"}), 
          React.createElement("i", {className: "fa fa-fw fa-circle-o"}), 

          "N/A"
        )
        );
    }

    for( var i in items ) {
      var classes = cx({
        'field__radio--item': true,
        'field__radio--active': model === i,
        'field__radio--disabled': controller.disabled
        });


      checkboxes.push(
        React.createElement("div", {'data-locator':  this.props.config.nameTrail + this.props.config.name + '-radio-' + i, className: classes, key:  this.props.config.name + i, onClick:  !controller.disabled ? this.handleChange.bind(this, { target: { value: i } } ) : function(){}}, 
          React.createElement("i", {className: "fa fa-fw fa-circle-o"}), 
          React.createElement("i", {className: "fa fa-fw fa-check-circle"}), 
           items[i] 
        )
        );
    }

    return (
      React.createElement("div", {className: "field field__radio", 'data-locator':  this.props.config.nameTrail + this.props.config.name + '-container'}, 
        
          typeof item.label === 'undefined' ? '' :
          React.createElement(adapt.components.label, {config:  { item: item}, adapt:  this.props.adapt}), 
          
        checkboxes, 
        React.createElement("div", {className: "field__radio--container"}, 

          
            typeof item.desc === 'undefined' ? '' :
            React.createElement(adapt.components.description, {config:  { item: item}, adapt:  this.props.adapt})
            
        )
      )
    );
  }
};

adapt.component('radio', AdaptRadio);

},{"../api/core":3,"../api/utils":8}],25:[function(require,module,exports){
var Utils = require('../api/utils');
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

    var controller = {};
    if( this.props.config.controller && this.props.config.controller[ this.props.config.name ] ) {
      controller = this.props.config.controller[ this.props.config.name ];
    }

    if( item.options ) {
      for( var i = 0; i < item.options.length; i++ ) {
        items['item-' + i] = (
          React.createElement("li", {'data-locator':  this.props.config.nameTrail + this.props.config.name + '-option-' + item.options[i].value, onClick:  !controller.disabled ? this.handleClick.bind(this, i) : function(){}, className:  value == item.options[i].value ? 'active' : ''}, 
            React.createElement("i", {className: "fa fa-check"}), 
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
      React.createElement("div", {className: 'field field__select field__select--' + this.state.name + ( controller.disabled ? ' field__select--disabled' : ''), 'data-locator':  this.props.config.nameTrail + this.props.config.name + '-container'}, 
        
          typeof item.label === 'undefined' ? '' :
          React.createElement(adapt.components.label, {config:  { item: item}, adapt:  this.props.adapt}), 
          
        React.createElement("div", {className: "field__select--container", 'data-locator':  this.props.config.nameTrail + this.props.config.name}, 
          React.createElement("div", {className:  ( this.state.open ? 'open ' : '' ) + 'field__select--current no-select', onClick:  !controller.disabled ? this.setStatus.bind(this, !this.state.open) : function(){}}, 
            React.createElement("i", {className: "fa fa-sort"}), 
             displayValue || 'Please select..'
          ), 
          React.createElement("ul", {className:  ( this.state.open ? 'open ' : '' ) + 'field__select--dropdown'}, 
            items 
          ), 
          
            typeof item.desc === 'undefined' ? '' :
            React.createElement(adapt.components.description, {config:  { item: item}, adapt:  this.props.adapt})
            
        )
      )
    );
  }
};

adapt.component('select', AdaptSelect);

},{"../api/core":3,"../api/utils":8}],26:[function(require,module,exports){
var adapt = require('../api/core');
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
            React.createElement("li", {'data-locator':  this.props.config.nameTrail + this.props.config.name + '-item-' + options[i].value, className: (value.indexOf(options[i].value) > -1 ? 'active': '') + ' field__selectmultiple--item no-select', ref:  'option' + i, onClick:  this.handleChange.bind(this, i) }, 
              React.createElement("i", {className: "fa fa-check fa-fw"}), 

               options[i].label
            )
          );
      }
    } else {
      console.warn('[selectMultiple]: No options provided');
    }

    return (
      React.createElement("div", {className: "field field__select", 'data-locator':  this.props.config.nameTrail + this.props.config.name + '-container'}, 
        
          typeof item.label === 'undefined' ? '' :
          React.createElement(adapt.components.label, {config:  { item: item}, adapt:  this.props.adapt}), 
          
        React.createElement("div", {className: "field__select--container"}, 
          React.createElement("ul", {className: "field__selectmultiple"}, 
            optionList 
          ), 
          
            typeof item.desc === 'undefined' ? '' :
            React.createElement(adapt.components.description, {config:  { item: item}, adapt:  this.props.adapt})
            
        )
      )
    );
  }
};

adapt.component('selectMultiple', AdaptSelectMultiple);

},{"../api/core":3,"../api/utils":8}],27:[function(require,module,exports){
'use strict';

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
    				React.createElement("li", {key: i, className: classes, onClick:  this.open.bind(this, r) }, 
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
            React.createElement("div", {className: classes, key: i }, 
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
      				React.createElement("li", {key: index, className: classes }, 
                React.createElement("span", {className: "tabcordion__accordion--holder", onClick:  this.open.bind(this, r, index) }, 
    					   	title, 

                  React.createElement("span", {className: "tabcordion__accordion--title", dangerouslySetInnerHTML: {__html: subtitle || '&nbsp;'}}
                  )
                ), 

                React.createElement("i", {className: arrowClasses, onClick:  this.openDropdown.bind(this, index) }), 

                React.createElement("div", {className: dropDownClasses }, 
                  React.createElement("span", {onClick:  this.copyAccordion.bind(this, i, index) }, 
                    "Duplicate"
                  ), 
                  React.createElement("span", {className: "remove", onClick:  this.removeAccordion.bind(this, i, index) }, 
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
              React.createElement("div", {className: classes, key: key }, 
                contentChildren 
              )
              );
          }, this );

          var classes = cx({
            'tabcordion__nav--item': true,
            'tabcordion__nav--active': openTab === r
          });

    			header.push(
    				React.createElement("li", {className: classes }, 
        				 items[i].title, 

        				React.createElement("ul", {className: "tabcordion__accordion"}, 
        					navChildren, 
        					React.createElement("li", {className: "tabcordion__accordion--item tabcordion__accordion--add", onClick:  this.addAccordion.bind( this, i) }, 
        						React.createElement("i", {className: "fa fa-plus fa-fw"}), 
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
      React.createElement("div", {className: "tabcordion no-select clear"}, 
        React.createElement("div", {className: "tabcordion__nav"}, 
        	React.createElement("ul", {className: "tabcordion__nav--list"}, 
        		header 
        	), 
          React.createElement("span", {className: "tabcordion__divider"})
        ), 
        React.createElement("div", {className: "tabcordion__content"}, 
          content 
        )
      )
    );
  }
};

adapt.component('tabcordion', AdaptTabcordion);

},{"../api/core":3,"../api/utils":8}],28:[function(require,module,exports){
var adapt = require('../api/core');
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
        React.createElement("th", {key: i }, 
           item.model[i].label
        )
        );
    }

    var t = 0;

    if (model) {
      for( var i = 0; i < model.length; i++ ) {
        var children = [];

        if(!simple) {
          children.push( React.createElement("td", {className: "id"},  i + 1) );
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

          var contents = this.transferPropsTo(React.createElement(adapt.components.item, {config: itemConfig }));

          children.push(
              React.createElement("td", {key:  t + r}, 
                contents 
              )
                );

          t++;
        }

        children.push(
          React.createElement("td", {className: "th__options"}, 
            React.createElement("span", {onClick:  this.remove.bind(this, i) }, 
              React.createElement("i", {className: "fa fa-times fa-fw"})
            )
          )
          );

        var REGEX_CURLY = /{([^}]+)}/g;

        items.push(
          React.createElement("tr", {key: i, 'data-locator':  this.props.config.nameTrail + this.props.config.name + '-row-' + i}, 
            children
          )
        );
      };
    }

    return (
      React.createElement("div", {className:  'element__table clear no-select ' + ( simple ? 'element__table--simple' : ''), 'data-locator':  this.props.config.nameTrail + this.props.config.name + '-container'}, 
        React.createElement("table", {cellPadding: "0", cellSpacing: "0"}, 
          React.createElement("thead", {className:  items.length ? '' : 'empty'}, 
            React.createElement("tr", null, 
              
                simple ? '' :
                React.createElement("th", {className: "id"}, "#"), 
              
              header, 
              React.createElement("th", {className: "th__options"}, 
                React.createElement("span", {onClick:  this.add}, 
                  React.createElement("i", {className: "fa fa-plus fa-fw"})
                )
              )
            )
          ), 
          React.createElement("tbody", null, 
            items
          )
        )
      )
    );
  }
};

adapt.component('table', AdaptTable);

},{"../api/core":3,"../api/utils":8}],29:[function(require,module,exports){
'use strict';

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
          React.createElement("li", {'data-locator':  this.props.config.nameTrail + this.props.config.name + '-tab-' + i, key: i, onClick:  this.open.bind(this, t), className:  this.state.style + '__header--item ' + ( this.state.open == t ? this.state.style + '__header--open' : '' ) + ( this.state.open - 1 == t ? this.state.style + '__header--beforeopen' : '') }, 
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
          React.createElement("div", {'data-locator':  this.props.config.nameTrail + this.props.config.name + '-content-' + i, style: style, className:  this.state.style + '__content--item ' + ( this.state.open == t ? this.state.style + '__content--open' : '') }, 
            children 
          )
          );
      }

      t++;
    }

    return (
      React.createElement("div", {className:  this.state.style + ' no-select', 'data-locator':  this.props.config.nameTrail + this.props.config.name + '-container'}, 
        React.createElement("ul", {className:  this.state.style + '__header clear'}, 
          header 
        ), 
        React.createElement("div", {className:  this.state.style + '__content'}, 
          content 
        )
      )
    );
  }
};

adapt.component('tabs', AdaptTabs);

},{"../api/core":3,"../api/utils":8}],30:[function(require,module,exports){
var adapt = require('../api/core');

var AdaptTextarea = {
  extend: [adapt.mixins.flat],
  displayName: 'AdaptTextarea',
  render: function( ) {
    var
      model = this.state.model,
      type = this.state.type,
      item = this.state.item;

      var label = adapt.component('label');

    var controller = {};
    if( this.props.config.controller && this.props.config.controller[ this.props.config.name ] ) {
      controller = this.props.config.controller[ this.props.config.name ];
    }

    return (
      React.createElement("div", {className: "field field__textarea", 'data-locator':  this.props.config.nameTrail + this.props.config.name + '-container'}, 
        
          typeof item.label === 'undefined' ? '' :
          React.createElement(adapt.components.label, {config:  { item: item}, adapt:  this.props.adapt}), 
          
        React.createElement("div", {className: "field__textarea--container"}, 
          React.createElement("textarea", {'data-locator':  this.props.config.nameTrail + this.props.config.name, onChange:  this.handleChange, placeholder:  item.placeholder, value: model, disabled:  controller.disabled}), 
          
            typeof item.desc === 'undefined' ? '' :
            React.createElement(adapt.components.description, {config:  { item: item}, adapt:  this.props.adapt})
            
        )
      )
    );
  }
};

adapt.component('textarea', AdaptTextarea);

},{"../api/core":3}],31:[function(require,module,exports){
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

},{"../api/core":3}],32:[function(require,module,exports){
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

},{"../api/core":3}],33:[function(require,module,exports){
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

},{"../api/core":3}],34:[function(require,module,exports){
var adapt = require('../api/core');

var object = {};

adapt.mixin('object', object);

},{"../api/core":3}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9hZGFwdC9zcmMvYWRhcHQuanN4IiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvYWRhcHQvc3JjL2FwaS9jb250cm9sbGVyLmpzIiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvYWRhcHQvc3JjL2FwaS9jb3JlLmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2FkYXB0L3NyYy9hcGkvZmluZC5qcyIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2FkYXB0L3NyYy9hcGkvaXRlbXMuanMiLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9hZGFwdC9zcmMvYXBpL21vZGVsLmpzIiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvYWRhcHQvc3JjL2FwaS9vYnNlcnZlLmpzIiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvYWRhcHQvc3JjL2FwaS91dGlscy5qcyIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2FkYXB0L3NyYy9hcGkvdmlldy5qcyIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2FkYXB0L3NyYy9jb21wb25lbnRzL2FjY29yZGlvbi5qc3giLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9hZGFwdC9zcmMvY29tcG9uZW50cy9idXR0b24uanN4IiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvYWRhcHQvc3JjL2NvbXBvbmVudHMvY2hlY2tib3guanN4IiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvYWRhcHQvc3JjL2NvbXBvbmVudHMvY29sdW1uLmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2FkYXB0L3NyYy9jb21wb25lbnRzL2NvbHVtblJvd3MuanN4IiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvYWRhcHQvc3JjL2NvbXBvbmVudHMvZGVzY3JpcHRpb24uanN4IiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvYWRhcHQvc3JjL2NvbXBvbmVudHMvZm9ybS5qc3giLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9hZGFwdC9zcmMvY29tcG9uZW50cy9oZWFkZXIuanN4IiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvYWRhcHQvc3JjL2NvbXBvbmVudHMvaHIuanN4IiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvYWRhcHQvc3JjL2NvbXBvbmVudHMvaW5wdXQuanN4IiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvYWRhcHQvc3JjL2NvbXBvbmVudHMvaW5wdXREYXRlLmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2FkYXB0L3NyYy9jb21wb25lbnRzL2l0ZW0uanN4IiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvYWRhcHQvc3JjL2NvbXBvbmVudHMvbGFiZWwuanN4IiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvYWRhcHQvc3JjL2NvbXBvbmVudHMvbG9vcC5qc3giLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9hZGFwdC9zcmMvY29tcG9uZW50cy9yYWRpby5qc3giLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9hZGFwdC9zcmMvY29tcG9uZW50cy9zZWxlY3QuanN4IiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvYWRhcHQvc3JjL2NvbXBvbmVudHMvc2VsZWN0TXVsdGlwbGUuanN4IiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvYWRhcHQvc3JjL2NvbXBvbmVudHMvdGFiY29yZGlvbi5qc3giLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9hZGFwdC9zcmMvY29tcG9uZW50cy90YWJsZS5qc3giLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9hZGFwdC9zcmMvY29tcG9uZW50cy90YWJzLmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2FkYXB0L3NyYy9jb21wb25lbnRzL3RleHRhcmVhLmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2FkYXB0L3NyYy9taXhpbnMvYXJyYXkuanMiLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9hZGFwdC9zcmMvbWl4aW5zL2FycmF5T2JqZWN0LmpzIiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvYWRhcHQvc3JjL21peGlucy9mbGF0LmpzIiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvYWRhcHQvc3JjL21peGlucy9vYmplY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvcmUgICAgICAgPSByZXF1aXJlKCcuL2FwaS9jb3JlJyk7XG5cbnJlcXVpcmUoJy4vYXBpL2l0ZW1zJyk7XG5cbnZhciBPYnNlcnZlICAgID0gcmVxdWlyZSgnLi9hcGkvb2JzZXJ2ZScpO1xudmFyIFZpZXcgICAgICAgPSByZXF1aXJlKCcuL2FwaS92aWV3Jyk7XG52YXIgTW9kZWwgICAgICA9IHJlcXVpcmUoJy4vYXBpL21vZGVsJyk7XG52YXIgQ29udHJvbGxlciA9IHJlcXVpcmUoJy4vYXBpL2NvbnRyb2xsZXInKTtcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vYXBpL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIEFkYXB0KGNvbmZpZykge1xuICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgdGhpcy5vYnNlcnZlID0gbmV3IE9ic2VydmUoKTtcbiAgdGhpcy52aWV3ID0gbmV3IFZpZXcodGhpcyk7XG4gIHRoaXMubW9kZWwgPSBuZXcgTW9kZWwodGhpcyk7XG4gIHRoaXMuY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKHRoaXMpO1xuXG4gIHZhciBzdGF0ZSA9IGNvbmZpZy5zdGF0ZTtcbiAgaWYoIHN0YXRlICkge1xuICAgIGlmKCBVdGlscy5pc0FycmF5KHN0YXRlKSApIHtcbiAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGF0ZSA9IFtzdGF0ZSB8fCAnZGVmYXVsdCddO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aGlzLnN0YXRlID0gWydkZWZhdWx0J107XG4gIH1cbn1cblxuQWRhcHQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIHZhciBmb3JtID0gQ29yZS5jb21wb25lbnRzLmZvcm07XG5cbiAgY29uc29sZS5kaXIoQ29yZS5jb21wb25lbnRzLnNlbGVjdCk7XG5cbiAgUmVhY3QucmVuZGVyQ29tcG9uZW50KCBmb3JtKCB7IGFkYXB0OiB0aGlzfSApLCBlbGVtZW50KTtcblxuICB0aGlzLm9ic2VydmUuZGlnZXN0KCk7XG59O1xuXG5BZGFwdC5wcm90b3R5cGUuc2V0U3RhdGUgPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgaWYoIFV0aWxzLmlzQXJyYXkoIHN0YXRlICkgKSB7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuc3RhdGUgPSBbc3RhdGVdO1xuICB9XG5cbiAgdGhpcy5vYnNlcnZlLmRpZ2VzdCgpO1xufTtcblxuQWRhcHQucHJvdG90eXBlLmFkZFN0YXRlID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4gIHRoaXMuc3RhdGUucHVzaChzdGF0ZSk7XG5cbiAgdGhpcy5vYnNlcnZlLmRpZ2VzdCgpO1xufTtcblxuQWRhcHQucHJvdG90eXBlLnJlbW92ZVN0YXRlID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4gIHZhciBpbmRleCA9IHRoaXMuc3RhdGUuaW5kZXhPZihzdGF0ZSk7XG5cbiAgaWYoIGluZGV4ID4gLTEgKSB7XG4gICAgdGhpcy5zdGF0ZS5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG59O1xuXG5BZGFwdC5mb3JtcyA9IHt9O1xuXG5BZGFwdC5mb3JtID0gZnVuY3Rpb24gZm9ybShuYW1lLCBjb25maWcpIHtcbiAgaWYgKGNvbmZpZykge1xuICAgIHRoaXMuZm9ybXNbbmFtZV0gPSBuZXcgQWRhcHQoY29uZmlnKTtcbiAgfVxuICBpZiAoIXRoaXMuZm9ybXNbbmFtZV0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1snICsgbmFtZSArICddIGlzIG5vdCBhIGZvcm0nKTtcbiAgfVxuICByZXR1cm4gdGhpcy5mb3Jtc1tuYW1lXTtcbn07XG5cbkFkYXB0LmNvbXBvbmVudHMgPSBDb3JlLmNvbXBvbmVudHM7XG5BZGFwdC5jb21wb25lbnQgPSBDb3JlLmNvbXBvbmVudDtcbkFkYXB0Lm1peGlucyA9IENvcmUubWl4aW5zO1xuQWRhcHQubWl4aW4gPSBDb3JlLm1peGluO1xuXG53aW5kb3cuQWRhcHQgPSBBZGFwdDtcbm1vZHVsZS5leHBvcnRzID0gQWRhcHQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBhZGFwdCA9IHJlcXVpcmUoJy4vY29yZScpO1xuXG4vKipcbiAqIENvbnRyb2xsZXIgT2JqZWN0LCBob2xkcyBjb250cm9sbGVyIHZhbHVlc1xuICovXG5mdW5jdGlvbiBDb250cm9sbGVyKCkge1xuXG59XG5cbi8qKlxuICogQ3JlYXRlIGV2ZXJ5dGhpbmcgdG8gZG8gd2l0aCB0aGUgY29udHJvbGxlclxuICogQHBhcmFtIHthZGFwdH0gYWRhcHQgQWRhcHQgSW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gQ29udHJvbGxlclNlcnZpY2UoIGFkYXB0ICkge1xuICAvKipcbiAgICogQWRhcHQgSW5zdGFuY2VcbiAgICogQHR5cGUge2FkYXB0fVxuICAgKi9cbiAgdGhpcy4kYWRhcHQgPSBhZGFwdDtcblxuICAvKipcbiAgICogQ29udHJvbGxlciBJdGVtc1xuICAgKiBAdHlwZSB7Q29udHJvbGxlcn1cbiAgICovXG4gIHRoaXMuaXRlbXMgPSBuZXcgQ29udHJvbGxlcigpO1xuXG4gIC8vIENyZWF0ZSBhIG5ldyBjb250cm9sbGVyIGZyb20gb3VyIGRlZmF1bHRzXG4gIHRoaXMuZXh0ZW5kQ29udHJvbGxlcih0aGlzLiRhZGFwdC5jb25maWcuY29udHJvbGxlciwgdGhpcy5pdGVtcyk7XG5cbiAgLy8gQ3JlYXRlIGEgbmV3IGNvbnRyb2xsZXIgZnJvbSB0aGUgdmlldyBjb25maWd1cmF0aW9uXG4gIHRoaXMuY3JlYXRlQ29udHJvbGxlcih0aGlzLiRhZGFwdC5jb25maWcudmlldywgdGhpcy5pdGVtcyk7XG59XG5cbi8qKlxuICogQ3JlYXRlIHRoZSBiYXNlIGNvbnRyb2xsZXIgZnJvbSB0aGUgdmlldyBvYmplY3RcbiAqIEBwYXJhbSAge09iamVjdH0gb2JqICAgIFZpZXcgb2JqZWN0IHRvIGNvcHlcbiAqIEBwYXJhbSAge09iamVjdH0gdGFyZ2V0IENvbnRyb2xsZXIgb2JqZWN0IHRvIGNvcHkgdG9cbiAqL1xuQ29udHJvbGxlclNlcnZpY2UucHJvdG90eXBlLmNyZWF0ZUNvbnRyb2xsZXIgPSBmdW5jdGlvbihvYmosIHRhcmdldCkge1xuICB0cnkge1xuICAgIGZvciggdmFyIGkgaW4gb2JqICkge1xuICAgICAgdmFyIHZhbDtcblxuICAgICAgLy8gaWYgaXQncyBhIHRhYiB0eXBlXG4gICAgICBpZiggb2JqW2ldLnRhYlR5cGUgKSB7XG4gICAgICAgIC8vIHRoZXJlIGFyZSBvbmx5IHR3byBkaWZmZXJlbnQgdHlwZXMgb2YgdGFiLCBzbyBhc3NpZ24gdGhlIHZhbHVlcyBiYXNlZCBvbiBfdGhpc1xuICAgICAgICAvLyBUT0RPOiBtYWtlIHRoaXMgZHluYW1pY1xuICAgICAgICB2YWwgPSB7XG4gICAgICAgICAgdGFiOiBudWxsLFxuICAgICAgICAgIGFjY29yZGlvbjogW11cbiAgICAgICAgfVtvYmpbaV0udGFiVHlwZV07XG4gICAgICB9IGVsc2UgaWYoIG9ialtpXS50eXBlICkge1xuICAgICAgICAvLyBlbHNlLCB3ZSdsbCBncmFiIHRoZSBkZWZhdWx0IG1vZGVsIHZhbHVlIGZyb20gdGhlIGNvbXBvbmVudFxuICAgICAgICB2YXIgaXRlbSA9IGFkYXB0LmNvbXBvbmVudChvYmpbaV0udHlwZS5zcGxpdCgnOicpWzBdKTtcblxuICAgICAgICB2YXIgcG9zc2libGVJdGVtID0gVXRpbHMuY29udmVydFRvQ2FtZWxDYXNlKG9ialtpXS50eXBlKTtcblxuICAgICAgICBpZiggYWRhcHQuY29tcG9uZW50c1twb3NzaWJsZUl0ZW1dICkge1xuICAgICAgICAgIGl0ZW0gPSBhZGFwdC5jb21wb25lbnRzW3Bvc3NpYmxlSXRlbV07XG4gICAgICAgIH1cblxuICAgICAgICB2YWwgPSBpdGVtLmRlZmF1bHRNb2RlbFZhbHVlICE9PSB1bmRlZmluZWQgPyBpdGVtLmRlZmF1bHRNb2RlbFZhbHVlIDogJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWwgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiggb2JqW2ldLml0ZW1zICkge1xuICAgICAgICAvLyBpZiB0aGUgdmlldyBoYXMgYW4gaXRlbXMgYXJyYXksIGkuZS4gY29sdW1ucyBvciB0YWJzXG4gICAgICAgIGlmKCBVdGlscy5pc0FycmF5KG9ialtpXS5pdGVtcykgKSB7XG4gICAgICAgICAgLy8gaWYgaXQncyBhbiBhcnJheSwgd2UgbmVlZCB0byBsb29wIHRocm91Z2ggdGhlbSBhbmQgY3JlYXRlIGNvbnRyb2xsZXIgdmFsdWVzIGZvciBlYWNoIGl0ZW0gaW4gdGhhdCBhcnJheVxuICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgb2JqW2ldLml0ZW1zLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50LCBpbmRleCwgYXJyYXkgKSB7XG4gICAgICAgICAgICAvLyBvbmx5IHBhc3MgdGhyb3VnaCB0YXJnZXQsIGFzIHRoZXNlIGFyZSBpbnZpc2libGUgaW4gdGhlIGNvbnRyb2xsZXJcbiAgICAgICAgICAgIF90aGlzLmNyZWF0ZUNvbnRyb2xsZXIoIGVsZW1lbnQsIHRhcmdldCApO1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgfSBlbHNlIGlmKCBVdGlscy5pc09iamVjdChvYmpbaV0uaXRlbXMgKSApIHtcbiAgICAgICAgICAvLyBpZiBpdCdzIGFuIG9iamVjdCwgcGFzcyBpdCBhbGwgdGhyb3VnaCwgaW52aXNpYmx5XG4gICAgICAgICAgdGhpcy5jcmVhdGVDb250cm9sbGVyKCBvYmpbaV0uaXRlbXMsIHRhcmdldCApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYoIG9ialtpXS5tb2RlbCApIHtcbiAgICAgICAgLy8gaWYgaXQgaGFzIGEgbW9kZWwsIHdlIG1pZ2h0IG5vdCBuZWVkIHRvIGNvcHkgYW55dGhpbmcgb3ZlclxuICAgICAgICBpZiggVXRpbHMuaXNPYmplY3QoIG9ialtpXS5tb2RlbCApICkge1xuICAgICAgICAgIGlmKCB0YXJnZXRbaV0gKSB7XG4gICAgICAgICAgICAvLyBpZiBkZWZhdWx0IGNvbnRyb2xsZXIgdmFsdWVzIGV4aXN0LCB3ZSBuZWVkIHRvIGNyZWF0ZSBhIG5ldyBjb250cm9sbGVyIGl0ZW0gZm9yIHRoZSB3aG9sZSBvZiB0aGUgY29udHJvbGxlciAodGhhdCB3YXkgd2UgY2FuIGdpdmUgcGFydGlhbCBjb250cm9sbGVyIHZhbHVlcyBhbmQgdGhpbmdzIGRvbid0IGJyZWFrKVxuICAgICAgICAgICAgZm9yKCB2YXIgciA9IDA7IHIgPCB0YXJnZXRbaV0udmFsdWUubGVuZ3RoOyByKysgKSB7XG4gICAgICAgICAgICAgIHRoaXMuY3JlYXRlQ29udHJvbGxlciggb2JqW2ldLm1vZGVsLCB0YXJnZXRbaV0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0W2ldID0ge307XG5cbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ29udHJvbGxlciggb2JqW2ldLm1vZGVsLCB0YXJnZXRbaV0gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFyZ2V0W2ldID0ge307XG5cbiAgICAgICAgICBmb3IoIHZhciByID0gMDsgciA8IG9ialtpXS5tb2RlbC5sZW5ndGg7IHIrKyApIHtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ29udHJvbGxlciggb2JqW2ldLm1vZGVsW3JdLml0ZW1zLCB0YXJnZXRbaV0gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiggb2JqW2ldLnRhYnMgKSB7XG4gICAgICAgIC8vIGlmIHdlIGhhdmUgdGFicywgd2UgbmVlZCB0byBsb29wIHRocm91Z2ggYWxsIHRoZSB0YWIgcGFnZXMgYW5kIGNyZWF0ZSBjb250cm9sbGVyIHZhbHVlcyBmb3IgdGhlbVxuICAgICAgICBmb3IoIHZhciByID0gMDsgciA8IG9ialtpXS50YWJzLmxlbmd0aDsgcisrICkge1xuICAgICAgICAgIHRoaXMuY3JlYXRlQ29udHJvbGxlciggb2JqW2ldLnRhYnNbcl0uaXRlbXMsIHRhcmdldCApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyB3ZSBjYW4gYXNzdW1lIHRoZXJlIGFyZSBubyBtb3JlIGNoaWxkcmVuIGZvciB0aGlzIGNvbnRyb2xsZXIgdmFsdWUsIGFuZCBqdXN0IHNldCBpdCB0byB0aGUgdmFsdWUgc2V0IGFib3ZlXG4gICAgICAgIGlmKCAhdGFyZ2V0W2ldJiYgdmFsICE9PSBudWxsICkge1xuICAgICAgICAgIHRhcmdldFtpXSA9IHt9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoKCBlICkge1xuICAgIGNvbnNvbGUud2FybihlLm1lc3NhZ2UpO1xuICB9XG59O1xuXG4vKipcbiAqIFByZXBvcHVsYXRlIHRoZSBiYXNlIGNvbnRyb2xsZXIgZnJvbSBwcmV2aW91cyB2YWx1ZXNcbiAqIEBwYXJhbSAge09iamVjdH0gb2JqICAgIFByZXZpb3VzIHZhbHVlIHRvIGNvcHkgb3ZlclxuICogQHBhcmFtICB7T2JqZWN0fSB0YXJnZXQgVGFyZ2V0IHRvIGNvcHkgaXQgb3ZlciB0b1xuICovXG5Db250cm9sbGVyU2VydmljZS5wcm90b3R5cGUuZXh0ZW5kQ29udHJvbGxlciA9IGZ1bmN0aW9uKG9iaiwgdGFyZ2V0KSB7XG4gIGZvciggdmFyIGkgaW4gb2JqICkge1xuICAgIGlmKCAhdGFyZ2V0W2ldICkge1xuICAgICAgLy8gaWYgdGhlIHRhcmdldCBkb2Vzbid0IGV4aXN0LCBjcmVhdGUgYSBiYXNlIG9iamVjdFxuICAgICAgdGFyZ2V0W2ldID0gW107XG4gICAgfVxuXG4gICAgaWYoIFV0aWxzLmlzQXJyYXkoIG9ialtpXSApICkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgY29uc29sZS5sb2cob2JqW2ldKTtcblxuICAgICAgLy8gbG9vcCB0aHJvdWdoIHRoZSBwcmV2aW91cyB2YWx1ZXNcbiAgICAgIG9ialtpXS5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbWVudCwgaW5kZXggKSB7XG4gICAgICAgIHRhcmdldFtpXS5wdXNoKCBlbGVtZW50ICk7XG4gICAgICB9ICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHdlJ3ZlIGV4aGF1c3RlZCBhbGwgb3B0aW9ucywgY29weSBpdCBvdmVyXG4gICAgICB0YXJnZXRbaV0gPSBvYmpbaV07XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xsZXJTZXJ2aWNlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBBZGFwdCA9IHt9O1xuXG4vKipcbiAqIFN0b3JlIGFsbCB0aGUgY29tcG9uZW50c1xuICogQHR5cGUge09iamVjdH1cbiAqL1xuQWRhcHQuY29tcG9uZW50cyA9IHt9O1xuXG4vKipcbiAqIEdldC9zZXQgY29tcG9uZW50c1xuICogQHBhcmFtICB7U3RyaW5nfSBuYW1lICAgTmFtZSBvZiBjb21wb25lbnRcbiAqIEBwYXJhbSAge09iamVjdH0gY29uZmlnIENvbXBvbmVudCBjb25maWd1cmF0aW9uXG4gKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICBDb21wb25lbnRcbiAqL1xuQWRhcHQuY29tcG9uZW50ID0gZnVuY3Rpb24gY29tcG9uZW50KG5hbWUsIGNvbmZpZykge1xuICBpZiggY29uZmlnICkge1xuICAgIGlmKCBjb25maWcuZXh0ZW5kICkge1xuICAgICAgY29uZmlnLmV4dGVuZC5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbWVudCwgaW5kZXggKSB7XG4gICAgICAgIGNvbmZpZyA9IFV0aWxzLmV4dGVuZChVdGlscy5jb3B5KGNvbmZpZyksIFV0aWxzLmNvcHkoZWxlbWVudCkpO1xuICAgICAgfSApO1xuICAgIH1cblxuICAgIHRoaXMuY29tcG9uZW50c1tuYW1lXSA9IFJlYWN0LmNyZWF0ZUNsYXNzKGNvbmZpZyk7XG4gIH1cbiAgaWYoIXRoaXMuY29tcG9uZW50c1tuYW1lXSkge1xuICAgIHRocm93IG5ldyBFcnJvcignWycgKyBuYW1lICsgJ10gaXMgbm90IGEgY29tcG9uZW50Jyk7XG4gIH1cbiAgcmV0dXJuIHRoaXMuY29tcG9uZW50c1tuYW1lXTtcbn07XG5cbi8qKlxuICogU3RvcmUgYWxsIHRoZSBtaXhpbnNcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbkFkYXB0Lm1peGlucyA9IHt9O1xuXG4vKipcbiAqIEdldC9zZXQgbWl4aW5zXG4gKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWUgICBOYW1lIG9mIG1peGluXG4gKiBAcGFyYW0gIHtPYmplY3R9IGNvbmZpZyBNaXhpbiBjb25maWd1cmF0aW9uXG4gKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICBNaXhpblxuICovXG5BZGFwdC5taXhpbiA9IGZ1bmN0aW9uIG1peGluKG5hbWUsIGNvbmZpZykge1xuICBpZiggY29uZmlnICkge1xuICAgIHRoaXMubWl4aW5zW25hbWVdID0gY29uZmlnO1xuICB9XG4gIGlmKCF0aGlzLm1peGluc1tuYW1lXSkge1xuICAgIHRocm93IG5ldyBFcnJvcignWycgKyBuYW1lICsgJ10gaXMgbm90IGEgbWl4aW4nKTtcbiAgfVxuICByZXR1cm4gdGhpcy5taXhpbnNbbmFtZV07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFkYXB0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbi8qKlxuICogRmluZCBmdW5jdGlvblxuICovXG5mdW5jdGlvbiBGaW5kKCApIHtcblxuICAvKipcbiAgICogTWFpbiBmaW5kaW5nIGZ1bmN0aW9uXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdG9GaW5kIFN0cmluZyBvZiB3aGF0IHRvIGZpbmQgaW4gdGhlIGl0ZW1zIG9iamVjdFxuICAgKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICBGb3VuZCBvYmplY3Qgd2l0aCBoZWxwZXIgZnVuY3Rpb25zXG4gICAqL1xuICByZXR1cm4gZnVuY3Rpb24gZmluZEl0ZW0oIHRvRmluZCApIHtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgd2lsbCBiZSB0aGUgc2VydmljZSB0aGF0IEZpbmQgaXMgaW5pdGlhbGlzZWQgaXRcbiAgICAgKiBAdHlwZSB7TW9kZWx8Vmlld31cbiAgICAgKi9cbiAgICB2YXIgU2VydmljZSA9IHRoaXM7XG5cbiAgICAvKipcbiAgICAgKiBMb29rIHVwIGZ1bmN0aW9uXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBzdHJpbmcgU3RyaW5nIHRvIGZpbmRcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IG1vZGVsICBPYmplY3QgdG8gbG9vayBpblxuICAgICAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgIEFycmF5IG9mIG1hdGNoZXNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBsb29rdXAoIHN0cmluZywgbW9kZWwgKSB7XG4gICAgICB2YXIgc3BsaXQgPSBzdHJpbmcuc3BsaXQoJy4nKTtcblxuICAgICAgLy8gY29weSB0aGUgbW9kZWwgb3ZlciB0byBhIHRlbXBcbiAgICAgIHZhciB0ZW1wTW9kZWwgPSBtb2RlbDtcblxuICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBzcGxpdC5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgaWYoIFV0aWxzLmlzQXJyYXkoIHRlbXBNb2RlbCApICkge1xuICAgICAgICAgIC8vIGlmIHRoZSBtb2RlbCBpcyBhbiBhcnJheSwgd2UgbmVlZCB0byBnbyBkZWVwZXJcbiAgICAgICAgICBpZiggdGVtcE1vZGVsLnZhbHVlICkge1xuICAgICAgICAgICAgLy8gd2UgZG9uJ3Qgd2FudCB0byBrZWVwIHdyaXRpbmcgXCJpdGVtLnZhbHVlLml0ZW1cIiwgc28gd2UgYXV0b21hdGljYWxseSBnbyBkb3duIGEgbGV2ZWxcbiAgICAgICAgICAgIHRlbXBNb2RlbCA9IHRlbXBNb2RlbC52YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYoIHRlbXBNb2RlbC5pdGVtcyApIHtcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IHdhbnQgdG8ga2VlcCB3cml0aW5nIFwiaXRlbS5pdGVtcy5pdGVtXCIsIHNvIHdlIGF1dG9tYXRpY2FsbHkgZ28gZG93biBhIGxldmVsXG4gICAgICAgICAgICB0ZW1wTW9kZWwgPSB0ZW1wTW9kZWwuaXRlbXM7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciB0bSA9IFtdO1xuXG4gICAgICAgICAgZm9yKCB2YXIgciA9IDA7IHIgPCB0ZW1wTW9kZWwubGVuZ3RoOyByKysgKSB7XG5cbiAgICAgICAgICAgIGlmKCB0ZW1wTW9kZWxbcl0udmFsdWUgKSB7XG4gICAgICAgICAgICAgIC8vIGF1dG9tYXRpY2FsbHkgZ28gZG93biBhIGxldmVsXG4gICAgICAgICAgICAgIHRlbXBNb2RlbCA9IHRlbXBNb2RlbFtyXS52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKCB0ZW1wTW9kZWxbcl0uaXRlbXMgKSB7XG4gICAgICAgICAgICAgIC8vIGF1dG9tYXRpY2FsbHkgZ28gZG93biBhIGxldmVsXG4gICAgICAgICAgICAgIHRlbXBNb2RlbCA9IHRlbXBNb2RlbFtyXS5pdGVtcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gd2UndmUgZm91bmQgaXQsIHB1c2ggdGhlbSBpbnRvIHRoZSB0ZW1wIG1vZGVsXG4gICAgICAgICAgICBpZiggVXRpbHMuaXNBcnJheSggdGVtcE1vZGVsICkgKSB7XG4gICAgICAgICAgICAgIHRtLnB1c2godGVtcE1vZGVsW3JdW3NwbGl0W2ldXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0bS5wdXNoKHRlbXBNb2RlbFtzcGxpdFtpXV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB0ZW1wTW9kZWwgPSB0bTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyB0byBrZWVwIGl0IGNvbnNpc3RlbnQsIHJldHVybiBhbiBhcnJheSBvZiB0aGUgZm91bmQgaXRlbVxuICAgICAgICAgIHRlbXBNb2RlbCA9IFt0ZW1wTW9kZWxbc3BsaXRbaV1dXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGVtcE1vZGVsO1xuICAgIH1cblxuICAgIHZhciBmb3VuZDtcblxuICAgIC8vIHRyeSBhbmQgZmluZCBpdCwgaWYgbm90LCB3ZSdsbCBhc3NpZ24gaXQgdG8gYW4gZW1wdHkgb2JqZWN0XG4gICAgLy8gdGhpcyBhbGxvd3MgdXMgdG8gc2V0IG9ic2VydmVycyBhbmQgZXhwcmVzc2lvbiB2YWx1ZXMgb24gdW5rbm93biBpdGVtc1xuICAgIHRyeSB7XG4gICAgICBmb3VuZCA9IGxvb2t1cCggdG9GaW5kLCB0aGlzLml0ZW1zICk7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBmb3VuZCA9IHt9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE9ic2VydmUgYSB2YWx1ZVxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayB3aGVuIHRoZSB2YWx1ZSBjaGFuZ2VzXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSAgIGl0ZW0gICAgIE9wdGlvbmFsIGl0ZW0gdG8gb2JzZXJ2ZVxuICAgICAqL1xuICAgIGZvdW5kLm9ic2VydmUgPSBmdW5jdGlvbiggY2FsbGJhY2ssIGl0ZW0gKSB7XG4gICAgICAvLyBzZXR1cCB0aGUgb2JzZXJ2ZXIgaW4gdGhlIG9ic2VydmUgb2JqZWN0XG4gICAgICBpZiggIVNlcnZpY2Uub2JzZXJ2ZVt0b0ZpbmRdICkge1xuICAgICAgICBTZXJ2aWNlLm9ic2VydmVbdG9GaW5kXSA9IHt9O1xuICAgICAgfVxuXG4gICAgICAvLyBpZiB3ZSBoYXZlIGFuIGl0ZW0sIHVzZSB0aGF0LCBpZiBub3Qgd2UgYXNzdW1lIHdlJ3JlIGdvaW5nIHRvIGxvb2sgYXQgdGhlIHZhbHVlXG4gICAgICB2YXIgdmFsID0gaXRlbSB8fCAndmFsdWUnO1xuXG4gICAgICAvLyBzZXR1cCB0aGUgb2JzZXJ2ZXJcbiAgICAgIGlmKCAhU2VydmljZS5vYnNlcnZlW3RvRmluZF1bdmFsXSApIHtcbiAgICAgICAgU2VydmljZS5vYnNlcnZlW3RvRmluZF1bdmFsXSA9IFtdO1xuICAgICAgfVxuXG4gICAgICAvLyBwdXNoIGl0IGluXG4gICAgICBTZXJ2aWNlLm9ic2VydmVbdG9GaW5kXVt2YWxdLnB1c2goY2FsbGJhY2spO1xuXG4gICAgICAvLyBub3RpZnkgZXZlcnlvbmUgZWxzZVxuICAgICAgU2VydmljZS4kYWRhcHQub2JzZXJ2ZS5kaWdlc3QoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkIGFuIGl0ZW0gaW4gdGhlIG9iamVjdFxuICAgICAqIEBwYXJhbSB7SW50ZWdlcn0gaW5kZXggIEluZGV4IG9mIHdoZXJlIHRvIGluc2VydCB0aGUgb2JqZWN0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IHBhcmVudCAgT2JqZWN0IHRvIGluc2VydCBpbnRvXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgICAgS2V5IG9mIHRoZSBuZXcgb2JqZWN0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iaiAgICAgTmV3IG9iamVjdCB0byBpbnNlcnRcbiAgICAgKi9cbiAgICB2YXIgYWRkSXRlbSA9IGZ1bmN0aW9uKCBpbmRleCwgcGFyZW50LCBuYW1lLCBvYmogKSB7XG4gICAgICAvLyBncmFiIHRoZSBvcmlnaW5hbCBvcmRlciBpbiBhcnJheSBmb3JtXG4gICAgICB2YXIgb3JpZ2luYWxPcmRlciA9IE9iamVjdC5rZXlzKHBhcmVudC5pdGVtcyk7XG5cbiAgICAgIC8vIGluc2VydCB0aGUgbmFtZSBpbnRvIHRoZSBvcmlnaW5hbCBvcmRlclxuICAgICAgb3JpZ2luYWxPcmRlci5zcGxpY2UoaW5kZXgsIDAsIG5hbWUpO1xuXG4gICAgICAvLyBjb3B5IG92ZXIgdGhlIG9sZCBwYXJlbnQsIHNvIHdlIGRvbid0IGdldCBiaW5kaW5nXG4gICAgICB2YXIgb2xkUGFyZW50ID0gVXRpbHMuY29weShwYXJlbnQuaXRlbXMpO1xuXG4gICAgICAvLyBpbnNlcnQgdGhlIG5ldyBvYmplY3QgaW50byB0aGUgcGFyZW50LCB3ZSBkb24ndCBjYXJlIGFib3V0IHBvc2l0aW9uIGhlcmVcbiAgICAgIG9sZFBhcmVudFtuYW1lXSA9IG9iajtcblxuICAgICAgdmFyIG5ld1BhcmVudCA9IHt9O1xuXG4gICAgICAvLyBsb29wIHRocm91Z2ggdGhlIG9yaWdpbmFsIG9yZGVyICh3aXRoIG91ciBuZXcgdmFsdWUgaW5zZXJ0ZWQgaW4gdGhlIGNvcnJlY3QgcG9zaXRpb24pXG4gICAgICBvcmlnaW5hbE9yZGVyLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50LCBpbmRleCApIHtcbiAgICAgICAgLy8gdGhlbiBjb3B5IGl0IG92ZXIsIGluIHRoZSBjb3JyZWN0IHBvc2l0aW9uXG4gICAgICAgIG5ld1BhcmVudFtlbGVtZW50XSA9IG9sZFBhcmVudFtlbGVtZW50XTtcbiAgICAgIH0gKTtcblxuICAgICAgLy8gdXBkYXRlIHRoZSBwYXJlbnQgb2JqZWN0XG4gICAgICBwYXJlbnQuaXRlbXMgPSBuZXdQYXJlbnQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFwcGVuZCBhbiBvYmplY3QgdG8gYW4gb2JqZWN0XG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lICAgICAgICAgICAgICAgICAgIE5hbWUgb2YgdGhlIG5ldyBvYmplY3RcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IG9iaiAgICAgICAgICAgICAgICAgICAgT2JqZWN0IHZhbHVlcyBmb3IgdGhlIG5ldyBvYmplY3RcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IGRlZmF1bHRNb2RlbFZhbHVlICAgICAgT3B0aW9uYWwgZGVmYXVsdCB2YWx1ZSB0byBwdXQgaW50byB0aGUgbW9kZWxcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IGRlZmF1bHRDb250cm9sbGVyVmFsdWUgT3B0aW9uYWwgZGVmYXVsdCB2YWx1ZSB0byBwdXQgaW50byB0aGUgY29udHJvbGxlclxuICAgICAqL1xuICAgIGZvdW5kLmFwcGVuZCA9IGZ1bmN0aW9uKCBuYW1lLCBvYmosIGRlZmF1bHRNb2RlbFZhbHVlLCBkZWZhdWx0Q29udHJvbGxlclZhbHVlICkge1xuICAgICAgLy8gZ2V0IHRoZSBmb3VuZCBpdGVtXG4gICAgICB2YXIgZm91bmRJdGVtID0gZm91bmRbMF07XG5cbiAgICAgIC8vIGNyZWF0ZSBhIG5ldyBtb2RlbCB0byBwYXNzIHRocm91Z2ggdG8gb3VyIG1vZGVsIGZ1bmN0aW9uc1xuICAgICAgdmFyIG1vZGVscyA9IHt9O1xuICAgICAgbW9kZWxzW25hbWVdID0gb2JqO1xuXG4gICAgICAvLyBzZXR1cCB0aGUgbmV3IG1vZGVsIGFuZCBuZXcgY29udHJvbGxlclxuICAgICAgdmFyIG5ld01vZGVsID0ge307XG4gICAgICB2YXIgbmV3Q29udHJvbGxlciA9IHt9O1xuXG4gICAgICBpZiggZGVmYXVsdE1vZGVsVmFsdWUgJiYgIVV0aWxzLmlzU3RyaW5nKGRlZmF1bHRNb2RlbFZhbHVlKSApIHtcbiAgICAgICAgLy8gaWYgd2UgaGF2ZSBhIG5ldyBkZWZhdWx0IG1vZGVsIHZhbHVlIHRoYXQgaXNuJ3QgYSBzdHJpbmcsIHdlIG5lZWQgdG8gY3JlYXRlIGEgbW9kZWwgdmFsdWUgZm9yIGl0IGZyb20gdGhlIGNvbXBvbmVudFxuICAgICAgICB2YXIgbW9kZWxDb25maWcgPSB7fTtcblxuICAgICAgICBtb2RlbENvbmZpZ1tuYW1lXSA9IGRlZmF1bHRNb2RlbFZhbHVlO1xuICAgICAgICBuZXdNb2RlbCA9IFV0aWxzLmNvcHkob2JqKTtcblxuICAgICAgICAvLyB1c2UgdGhlIGhlbHBlciBtb2RlbCBmdW5jdGlvbnMgdG8gY3JlYXRlIHRoZSBtb2RlbFxuICAgICAgICBTZXJ2aWNlLiRhZGFwdC5tb2RlbC5leHRlbmRNb2RlbCggbW9kZWxDb25maWcsIG5ld01vZGVsICk7XG4gICAgICB9XG5cbiAgICAgIGlmKCAhZGVmYXVsdENvbnRyb2xsZXJWYWx1ZSApIHtcbiAgICAgICAgLy8gaWYgd2UgZG9uJ3QgaGF2ZSBhIGNvbnRyb2xsZXIgdmFsdWUsIHdlIG5lZWQgb25lIVxuICAgICAgICB2YXIgY29udHJvbGxlckNvbmZpZyA9IHt9O1xuXG4gICAgICAgIGNvbnRyb2xsZXJDb25maWdbbmFtZV0gPSBVdGlscy5jb3B5KG9iaik7XG5cbiAgICAgICAgU2VydmljZS4kYWRhcHQuY29udHJvbGxlci5jcmVhdGVDb250cm9sbGVyKCBjb250cm9sbGVyQ29uZmlnLCBuZXdDb250cm9sbGVyICk7XG4gICAgICB9XG5cbiAgICAgIC8vIGZpbmFsbHkgY3JlYXRlIHRoZSBuZXcgbW9kZWxcbiAgICAgIFNlcnZpY2UuJGFkYXB0Lm1vZGVsLmNyZWF0ZU1vZGVsKCBtb2RlbHMsIG5ld01vZGVsICk7XG5cbiAgICAgIC8vIHB1c2ggdGhlIG5ldyBvYmplY3QgaW50byB0aGUgZXhpc2l0aW5nIG1vZGVsXG4gICAgICB2YXIgbW9kZWxPYmogPSBTZXJ2aWNlLiRhZGFwdC5tb2RlbC5pdGVtcztcbiAgICAgIG1vZGVsT2JqW25hbWVdID0geyB2YWx1ZTogJycgfTtcblxuICAgICAgLy8gcHVzaCB0aGUgbmV3IGNvbnRyb2xsZXIgaW50byB0aGUgZXhpc3RpbmcgY29udHJvbGxlclxuICAgICAgdmFyIGNvbnRyb2xsZXJPYmogPSBTZXJ2aWNlLiRhZGFwdC5jb250cm9sbGVyLml0ZW1zO1xuICAgICAgY29udHJvbGxlck9ialtuYW1lXSA9IG5ld0NvbnRyb2xsZXJbbmFtZV0gfHwgZGVmYXVsdENvbnRyb2xsZXJWYWx1ZTtcblxuICAgICAgaWYoIGRlZmF1bHRNb2RlbFZhbHVlICYmIFV0aWxzLmlzU3RyaW5nKGRlZmF1bHRNb2RlbFZhbHVlKSAgKSB7XG4gICAgICAgIC8vIGlmIHdlIGhhdmUgYSBzdHJpbmcsIGp1c3QgY29weSB0aGUgdmFsdWUgb3ZlclxuICAgICAgICBtb2RlbE9ialtuYW1lXS52YWx1ZSA9IGRlZmF1bHRNb2RlbFZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gaWYgd2UgZG9uJ3QsIHNldCB0aGUgbW9kZWwgdG8gdGhlIG5ldyBtb2RlbCB2YWx1ZSB3ZSBjcmVhdGVkXG4gICAgICAgIG1vZGVsT2JqW25hbWVdLnZhbHVlID0gbmV3TW9kZWxbbmFtZV0udmFsdWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgaW5kZXggdG8gcHV0IHRoZSBuZXcgaXRlbSBpblxuICAgICAgdmFyIGluZGV4ID0gT2JqZWN0LmtleXMoZm91bmRJdGVtLml0ZW1zKS5sZW5ndGg7XG5cbiAgICAgIC8vIGZpbmFsbHksIGFkZCB0aGUgaXRlbVxuICAgICAgYWRkSXRlbSggaW5kZXgsIGZvdW5kSXRlbSwgbmFtZSwgb2JqKTtcblxuICAgICAgLy8gbm90aWZ5IGV2ZXJ5b25lIGVsc2VcbiAgICAgIFNlcnZpY2UuJGFkYXB0Lm9ic2VydmUuZGlnZXN0KCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERlc3RvcnkgYW4gb2JqZWN0IGluIGFuIG9iamVjdFxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZSBOYW1lIG9mIHdoYXQgdG8gZGVzdHJveVxuICAgICAqL1xuICAgIGZvdW5kLmRlc3Ryb3kgPSBmdW5jdGlvbiggbmFtZSApIHtcbiAgICAgIHZhciBmb3VuZEl0ZW0gPSBmb3VuZFswXTtcblxuICAgICAgLy8gc3RvcmUgdGhlIG9yaWdpbmFsIG9yZGVyIG9mIHRoZSBvYmplY3RcbiAgICAgIHZhciBvcmlnaW5hbE9yZGVyID0gT2JqZWN0LmtleXMoZm91bmRJdGVtLml0ZW1zKTtcblxuICAgICAgLy8gZmluZCBvdXQgd2hlcmUgdGhlIGl0ZW0gaXMgd2Ugd2FudCB0byBkZWxldGVcbiAgICAgIHZhciBpbmRleCA9IG9yaWdpbmFsT3JkZXIuaW5kZXhPZihuYW1lKTtcblxuICAgICAgaWYoIGluZGV4ID4gLTEgKSB7XG4gICAgICAgIC8vIGlmIGl0IGFjdHVhbGx5IGV4aXN0cywgbGV0J3MgcmVtb3ZlIGl0XG4gICAgICAgIG9yaWdpbmFsT3JkZXIuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgICAgICAvLyB3ZSdsbCBjb3B5IG92ZXIgdGhlIG9sZCBwYXJlbnQgdG8gYXZvaWQgYmluZGluZyBieSByZWZlcmVuY2VcbiAgICAgICAgdmFyIG9sZFBhcmVudCA9IFV0aWxzLmNvcHkoZm91bmRJdGVtLml0ZW1zKTtcblxuICAgICAgICB2YXIgbmV3UGFyZW50ID0ge307XG5cbiAgICAgICAgdmFyIG1vZGVsID0gU2VydmljZS4kYWRhcHQubW9kZWwuaXRlbXM7XG4gICAgICAgIHZhciBjb250cm9sbGVyID0gU2VydmljZS4kYWRhcHQuY29udHJvbGxlci5pdGVtcztcblxuICAgICAgICAvLyBsb29wIHRocm91Z2ggdGhlIG5ldyBvcmRlciwgc2FucyByZW1vdmVkIGVsZW1lbnQsIGFuZCBwdXQgaXQgaW50byBhIG5ldyBwYXJlbnRcbiAgICAgICAgb3JpZ2luYWxPcmRlci5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbWVudCwgaW5kZXggKSB7XG4gICAgICAgICAgbmV3UGFyZW50W2VsZW1lbnRdID0gb2xkUGFyZW50W2VsZW1lbnRdO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgLy8gZGVsZXRlIHRoZSBhcHByb3ByaWF0ZSBtb2RlbCBhbmQgY29udHJvbGxlciB2YWx1ZXNcbiAgICAgICAgZGVsZXRlIG1vZGVsW25hbWVdO1xuICAgICAgICBkZWxldGUgY29udHJvbGxlcltuYW1lXTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIHBhcmVudCBvYmplY3RcbiAgICAgICAgZm91bmRJdGVtLml0ZW1zID0gbmV3UGFyZW50O1xuXG4gICAgICAgIC8vIG5vdGlmeSBldmVyeW9uZSBlbHNlXG4gICAgICAgIFNlcnZpY2UuJGFkYXB0Lm9ic2VydmUuZGlnZXN0KCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGEgdmFsdWUgZXhwcmVzc2lvblxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGV4cHJlc3Npb24gVGhlIHZhbHVlIGZvciB0aGUgaXRlbVxuICAgICAqL1xuICAgIGZvdW5kLnNldFZhbHVlID0gZnVuY3Rpb24oIGV4cHJlc3Npb24gKSB7XG4gICAgICBTZXJ2aWNlLnZhbHVlc1t0b0ZpbmRdID0gZXhwcmVzc2lvbjtcblxuICAgICAgU2VydmljZS4kYWRhcHQub2JzZXJ2ZS5kaWdlc3QoKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZvdW5kO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbmQ7XG4iLCIvLyBmb3JtXG5yZXF1aXJlKCcuLi9jb21wb25lbnRzL2Zvcm0nKTtcbnJlcXVpcmUoJy4uL2NvbXBvbmVudHMvbG9vcCcpO1xuXG4vLyBtaXhpbnNcbnJlcXVpcmUoJy4uL21peGlucy9mbGF0Jyk7XG5yZXF1aXJlKCcuLi9taXhpbnMvb2JqZWN0Jyk7XG5yZXF1aXJlKCcuLi9taXhpbnMvYXJyYXlPYmplY3QnKTtcbnJlcXVpcmUoJy4uL21peGlucy9hcnJheScpO1xuXG4vLyBkZWNvcmF0aXZlXG5yZXF1aXJlKCcuLi9jb21wb25lbnRzL2xhYmVsJyk7XG5yZXF1aXJlKCcuLi9jb21wb25lbnRzL2Rlc2NyaXB0aW9uJyk7XG5yZXF1aXJlKCcuLi9jb21wb25lbnRzL2NvbHVtbicpO1xucmVxdWlyZSgnLi4vY29tcG9uZW50cy9jb2x1bW5Sb3dzJyk7XG5yZXF1aXJlKCcuLi9jb21wb25lbnRzL2hyJyk7XG5yZXF1aXJlKCcuLi9jb21wb25lbnRzL2FjY29yZGlvbicpO1xucmVxdWlyZSgnLi4vY29tcG9uZW50cy90YWJjb3JkaW9uJyk7XG5yZXF1aXJlKCcuLi9jb21wb25lbnRzL3RhYmxlJyk7XG5yZXF1aXJlKCcuLi9jb21wb25lbnRzL2hlYWRlcicpO1xucmVxdWlyZSgnLi4vY29tcG9uZW50cy90YWJzJyk7XG5cbi8vIGNvbXBvbmVudHNcbnJlcXVpcmUoJy4uL2NvbXBvbmVudHMvaXRlbScpO1xucmVxdWlyZSgnLi4vY29tcG9uZW50cy90ZXh0YXJlYScpO1xucmVxdWlyZSgnLi4vY29tcG9uZW50cy9pbnB1dCcpO1xucmVxdWlyZSgnLi4vY29tcG9uZW50cy9pbnB1dERhdGUnKTtcbnJlcXVpcmUoJy4uL2NvbXBvbmVudHMvc2VsZWN0Jyk7XG5yZXF1aXJlKCcuLi9jb21wb25lbnRzL3NlbGVjdE11bHRpcGxlJyk7XG5yZXF1aXJlKCcuLi9jb21wb25lbnRzL2NoZWNrYm94Jyk7XG5yZXF1aXJlKCcuLi9jb21wb25lbnRzL3JhZGlvJyk7XG5yZXF1aXJlKCcuLi9jb21wb25lbnRzL2J1dHRvbicpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRmluZCAgPSByZXF1aXJlKCcuL2ZpbmQnKTtcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxudmFyIGFkYXB0ICA9IHJlcXVpcmUoJy4vY29yZScpO1xuXG4vKipcbiAqIE1vZGVsIE9iamVjdCwgaG9sZHMgbW9kZWwgdmFsdWVzXG4gKi9cbmZ1bmN0aW9uIE1vZGVsKCApIHtcblxufVxuXG4vKipcbiAqIENyZWF0ZSBldmVyeXRoaW5nIHRvIGRvIHdpdGggdGhlIG1vZGVsXG4gKiBAcGFyYW0ge2FkYXB0fSBhZGFwdCBBZGFwdCBJbnN0YW5jZVxuICovXG5mdW5jdGlvbiBNb2RlbFNlcnZpY2UoIGFkYXB0ICkge1xuICAvKipcbiAgICogQWRhcHQgSW5zdGFuY2VcbiAgICogQHR5cGUge2FkYXB0fVxuICAgKi9cbiAgdGhpcy4kYWRhcHQgPSBhZGFwdDtcblxuICAvKipcbiAgICogTW9kZWwgSXRlbXNcbiAgICogQHR5cGUge01vZGVsfVxuICAgKi9cbiAgdGhpcy5pdGVtcyA9IG5ldyBNb2RlbCgpO1xuXG4gIC8vIENyZWF0ZSBhIG1vZGVsIGZyb20gb3VyIGRlZmF1bHRzXG4gIHRoaXMuZXh0ZW5kTW9kZWwodGhpcy4kYWRhcHQuY29uZmlnLm1vZGVsLCB0aGlzLml0ZW1zKTtcblxuICAvLyBDcmVhdGUgdGhlIG1vZGVsIGZyb20gdGhlIHZpZXcgY29uZmlndXJhdGlvblxuICB0aGlzLmNyZWF0ZU1vZGVsKHRoaXMuJGFkYXB0LmNvbmZpZy52aWV3LCB0aGlzLml0ZW1zKTtcblxuICB0aGlzLmZpbmQgPSBuZXcgRmluZCgpO1xuXG4gIC8qKlxuICAgKiBWYWx1ZSBleHByZXNzaW9ucyBmb3IgbW9kZWwgaXRlbXNcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHRoaXMudmFsdWVzID0ge307XG5cbiAgLyoqXG4gICAqIHZhbHVlIG9ic2VydmVycyBmb3IgbW9kZWwgaXRlbXNcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHRoaXMub2JzZXJ2ZSA9IHt9O1xufVxuXG4vKipcbiAqIENyZWF0ZSB0aGUgYmFzZSBtb2RlbCBvZmYgb2YgdGhlIHZpZXcgb2JqZWN0XG4gKiBAcGFyYW0gIHtPYmplY3R9IG9iaiAgICBWaWV3IG9iamVjdCB0byBjb3B5XG4gKiBAcGFyYW0gIHtPYmplY3R9IHRhcmdldCBNb2RlbCBvYmplY3QgdG8gY29weSB0b1xuICovXG5Nb2RlbFNlcnZpY2UucHJvdG90eXBlLmNyZWF0ZU1vZGVsID0gZnVuY3Rpb24ob2JqLCB0YXJnZXQpIHtcbiAgdHJ5IHtcbiAgICBmb3IoIHZhciBpIGluIG9iaiApIHtcblxuICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gdHlwZSBvciB0YWJUeXBlLCB3ZSBjYW4ndCBkbyBhbnkgbW9kZWwgYmluZGluZ1xuICAgICAgaWYoIW9ialtpXS50eXBlICYmICFvYmpbaV0udGFiVHlwZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1ttb2RlbF06IE5vIHR5cGUgc2VsZWN0ZWQsIGFzc3VtaW5nIG1vZGVsIGRhdGEgZG9lc25cXCd0IGV4aXN0Jyk7XG4gICAgICB9XG5cbiAgICAgIHZhciB2YWw7XG5cbiAgICAgIC8vIGlmIGl0J3MgYSB0YWIgdHlwZVxuICAgICAgaWYoIG9ialtpXS50YWJUeXBlICkge1xuICAgICAgICAvLyB0aGVyZSBhcmUgb25seSB0d28gZGlmZmVyZW50IHR5cGVzIG9mIHRhYiwgc28gYXNzaWduIHRoZSB2YWx1ZXMgYmFzZWQgb24gX3RoaXNcbiAgICAgICAgLy8gVE9ETzogbWFrZSB0aGlzIGR5bmFtaWNcbiAgICAgICAgdmFsID0ge1xuICAgICAgICAgIHRhYjogbnVsbCxcbiAgICAgICAgICBhY2NvcmRpb246IFtdXG4gICAgICAgIH1bb2JqW2ldLnRhYlR5cGVdO1xuICAgICAgfSBlbHNlIGlmKCBvYmpbaV0udHlwZSApIHtcbiAgICAgICAgLy8gZWxzZSwgd2UnbGwgZ3JhYiB0aGUgZGVmYXVsdCBtb2RlbCB2YWx1ZSBmcm9tIHRoZSBjb21wb25lbnRcbiAgICAgICAgdmFyIGl0ZW0gPSBhZGFwdC5jb21wb25lbnQob2JqW2ldLnR5cGUuc3BsaXQoJzonKVswXSk7XG5cbiAgICAgICAgLy8gc2VlIGlmIHRoZSBwb3NzaWJsZSBjb21wb25lbnQgZXhpc3RzXG4gICAgICAgIHZhciBwb3NzaWJsZUl0ZW0gPSBVdGlscy5jb252ZXJ0VG9DYW1lbENhc2Uob2JqW2ldLnR5cGUpO1xuXG4gICAgICAgIGlmKCBhZGFwdC5jb21wb25lbnRzW3Bvc3NpYmxlSXRlbV0gKSB7XG4gICAgICAgICAgaXRlbSA9IGFkYXB0LmNvbXBvbmVudHNbcG9zc2libGVJdGVtXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNldCBpdFxuICAgICAgICB2YWwgPSBpdGVtLmRlZmF1bHRNb2RlbFZhbHVlICE9PSB1bmRlZmluZWQgPyBpdGVtLmRlZmF1bHRNb2RlbFZhbHVlIDogJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWwgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiggb2JqW2ldLml0ZW1zICkge1xuICAgICAgICAvLyBpZiB0aGUgdmlldyBoYXMgYW4gaXRlbXMgYXJyYXksIGkuZS4gY29sdW1ucyBvciB0YWJzXG4gICAgICAgIGlmKCBVdGlscy5pc0FycmF5KG9ialtpXS5pdGVtcykgKSB7XG4gICAgICAgICAgLy8gaWYgaXQncyBhbiBhcnJheSwgd2UgbmVlZCB0byBsb29wIHRocm91Z2ggdGhlbSBhbmQgY3JlYXRlIG1vZGVsIHZhbHVlcyBmb3IgZWFjaCBpdGVtIGluIHRoYXQgYXJyYXlcbiAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgIG9ialtpXS5pdGVtcy5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbWVudCwgaW5kZXgsIGFycmF5ICkge1xuICAgICAgICAgICAgLy8gb25seSBwYXNzIHRocm91Z2ggdGFyZ2V0LCBhcyB0aGVzZSBhcmUgaW52aXNpYmxlIGluIHRoZSBtb2RlbFxuICAgICAgICAgICAgX3RoaXMuY3JlYXRlTW9kZWwoIGVsZW1lbnQsIHRhcmdldCApO1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgfSBlbHNlIGlmKCBVdGlscy5pc09iamVjdChvYmpbaV0uaXRlbXMgKSApIHtcbiAgICAgICAgICAvLyBpZiBpdCdzIGFuIG9iamVjdCwgcGFzcyBpdCBhbGwgdGhyb3VnaCwgaW52aXNpYmx5XG4gICAgICAgICAgdGhpcy5jcmVhdGVNb2RlbCggb2JqW2ldLml0ZW1zLCB0YXJnZXQgKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmKCBvYmpbaV0ubW9kZWwgKSB7XG4gICAgICAgIC8vIGlmIGl0IGhhcyBhIG1vZGVsLCB3ZSBtaWdodCBub3QgbmVlZCB0byBjb3B5IGFueXRoaW5nIG92ZXJcbiAgICAgICAgaWYoIFV0aWxzLmlzT2JqZWN0KCBvYmpbaV0ubW9kZWwgKSApIHtcbiAgICAgICAgICBpZiggdGFyZ2V0W2ldICkge1xuICAgICAgICAgICAgLy8gaWYgZGVmYXVsdCBtb2RlbCB2YWx1ZXMgZXhpc3QsIHdlIG5lZWQgdG8gY3JlYXRlIGEgbmV3IG1vZGVsIGl0ZW0gZm9yIHRoZSB3aG9sZSBvZiB0aGUgbW9kZWwgKHRoYXQgd2F5IHdlIGNhbiBnaXZlIHBhcnRpYWwgbW9kZWwgdmFsdWVzIGFuZCB0aGluZ3MgZG9uJ3QgYnJlYWspXG4gICAgICAgICAgICBmb3IoIHZhciByID0gMDsgciA8IHRhcmdldFtpXS52YWx1ZS5sZW5ndGg7IHIrKyApIHtcbiAgICAgICAgICAgICAgdGhpcy5jcmVhdGVNb2RlbCggb2JqW2ldLm1vZGVsLCB0YXJnZXRbaV0udmFsdWVbcl0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gZWxzZSB3ZSBqdXN0IG5lZWQgdG8gbWFrZSB0aGUgbW9kZWwgdmFsdWUgYW4gYXJyYXksIHJlYWR5IGZvciBwb3B1bGF0aW5nXG4gICAgICAgICAgICB0YXJnZXRbaV0gPSB7IHZhbHVlOiBbXSB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXRbaV0gPSB7IHZhbHVlOiBbXSB9O1xuXG4gICAgICAgICAgZm9yKCB2YXIgciA9IDA7IHIgPCBvYmpbaV0ubW9kZWwubGVuZ3RoOyByKysgKSB7XG4gICAgICAgICAgICB0YXJnZXRbaV0udmFsdWUucHVzaCh7fSk7XG5cbiAgICAgICAgICAgIHRoaXMuY3JlYXRlTW9kZWwoIG9ialtpXS5tb2RlbFtyXS5pdGVtcywgdGFyZ2V0W2ldLnZhbHVlW3JdICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYoIG9ialtpXS50YWJzICkge1xuICAgICAgICAvLyBpZiB3ZSBoYXZlIHRhYnMsIHdlIG5lZWQgdG8gbG9vcCB0aHJvdWdoIGFsbCB0aGUgdGFiIHBhZ2VzIGFuZCBjcmVhdGUgbW9kZWwgdmFsdWVzIGZvciB0aGVtXG4gICAgICAgIGZvciggdmFyIHIgPSAwOyByIDwgb2JqW2ldLnRhYnMubGVuZ3RoOyByKysgKSB7XG4gICAgICAgICAgdGhpcy5jcmVhdGVNb2RlbCggb2JqW2ldLnRhYnNbcl0uaXRlbXMsIHRhcmdldCApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyB3ZSBjYW4gYXNzdW1lIHRoZXJlIGFyZSBubyBtb3JlIGNoaWxkcmVuIGZvciB0aGlzIG1vZGVsIHZhbHVlLCBhbmQganVzdCBzZXQgaXQgdG8gdGhlIHZhbHVlIHNldCBhYm92ZVxuICAgICAgICBpZiggIXRhcmdldFtpXSYmIHZhbCAhPT0gbnVsbCApIHtcbiAgICAgICAgICB0YXJnZXRbaV0gPSB7XG4gICAgICAgICAgICB2YWx1ZTogdmFsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCggZSApIHtcbiAgICBjb25zb2xlLndhcm4oZS5tZXNzYWdlKTtcbiAgfVxufTtcblxuLyoqXG4gKiBQcmVwb3B1bGF0ZSB0aGUgYmFzZSBtb2RlbCBmcm9tIHByZXZpb3VzIHZhbHVlc1xuICogQHBhcmFtICB7T2JqZWN0fSBvYmogICAgUHJldmlvdXMgdmFsdWUgdG8gY29weSBvdmVyXG4gKiBAcGFyYW0gIHtPYmplY3R9IHRhcmdldCBUYXJnZXQgdG8gY29weSBpdCBvdmVyIHRvXG4gKi9cbk1vZGVsU2VydmljZS5wcm90b3R5cGUuZXh0ZW5kTW9kZWwgPSBmdW5jdGlvbihvYmosIHRhcmdldCkge1xuICBmb3IoIHZhciBpIGluIG9iaiApIHtcbiAgICBpZiggIXRhcmdldFtpXSApIHtcbiAgICAgIC8vIGlmIHRoZSB0YXJnZXQgZG9lc24ndCBleGlzdCwgY3JlYXRlIGEgYmFzZSBvYmplY3RcbiAgICAgIHRhcmdldFtpXSA9IHt9O1xuICAgIH1cbiAgICBpZiggVXRpbHMuaXNBcnJheSggb2JqW2ldICkgKSB7XG4gICAgICAvLyBpZiBnaXZlbiBhbiBhcnJheSwgbWFrZSB0aGUgdmFsdWUgb2YgdGhlIG1vZGVsIGFuIGFycmF5IHJlYWR5IHRvIGJlIHB1c2hlZCBpblxuICAgICAgdGFyZ2V0W2ldLnZhbHVlID0gW107XG5cbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICBvYmpbaV0uZm9yRWFjaCggZnVuY3Rpb24oIGVsZW1lbnQsIGluZGV4ICkge1xuICAgICAgICBpZiggVXRpbHMuaXNPYmplY3QoZWxlbWVudCkgKSB7XG4gICAgICAgICAgLy8gbG9vcCB0aHJvdWdoIHRoZSBwcmV2aW91cyB2YWx1ZXNcbiAgICAgICAgICB0YXJnZXRbaV0udmFsdWUucHVzaCh7fSk7IC8vIHB1c2ggYSBuZXcgYXJyYXkgaW50byB0aGUgbW9kZWxcblxuICAgICAgICAgIC8vIHJlY3Vyc2l2ZSA8M1xuICAgICAgICAgIF90aGlzLmV4dGVuZE1vZGVsKGVsZW1lbnQsIHRhcmdldFtpXS52YWx1ZVtpbmRleF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRhcmdldFtpXS52YWx1ZSA9IG9ialtpXTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH0gZWxzZSBpZiggVXRpbHMuaXNPYmplY3QoIG9ialtpXSApICkge1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHdlJ3ZlIGV4aGF1c3RlZCBhbGwgb3B0aW9ucywgY29weSBpdCBvdmVyXG4gICAgICB0YXJnZXRbaV0udmFsdWUgPSBvYmpbaV07XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVsU2VydmljZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG4vKipcbiAqIE1haW4gT2JzZXJ2ZSBmdW5jdGlvblxuICovXG5mdW5jdGlvbiBPYnNlcnZlKCApIHtcbiAgLyoqXG4gICAqIEFycmF5IG9mIHJlY29yZHMgc3RvcmVkXG4gICAqIEB0eXBlIHtBcnJheX1cbiAgICovXG4gIHRoaXMucmVjb3JkcyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZCBhbiBvYnNlcnZlIGxpc3RlbmVyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB3YXRjaEV4cCBGdW5jdGlvbiB0byB3YXRjaFxuICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgTGlzdGVuZXIgdG8gY2FsbFxuICovXG5PYnNlcnZlLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZExpc3RlbmVyKCB3YXRjaEV4cCwgbGlzdGVuZXIgKSB7XG4gIHZhciByZWNvcmRzID0gdGhpcy5yZWNvcmRzO1xuXG4gIHZhciBsaXN0ZW5lck9iaiA9IHtcbiAgICB3YXRjaEV4cDogd2F0Y2hFeHAsXG4gICAgbGlzdGVuZXI6IGxpc3RlbmVyLFxuICAgIGxhc3RWYWx1ZTogJydcbiAgfTtcblxuICByZWNvcmRzLnB1c2gobGlzdGVuZXJPYmopO1xuXG4gIC8vIHJldHVybiBhIGZ1bmN0aW9uIHRoYXQgcmVtb3ZlcyBvdXIgbGlzdGVuZXIgZnJvbSB0aGUgcmVjb3JkcyBhcnJheVxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmVjb3Jkcy5zcGxpY2UocmVjb3Jkcy5pbmRleE9mKGxpc3RlbmVyT2JqKSwgMSk7XG4gIH1cbn07XG5cbi8qKlxuICogRGlnZXN0IEN5Y2xlXG4gKi9cbk9ic2VydmUucHJvdG90eXBlLmRpZ2VzdCA9IGZ1bmN0aW9uIGRpZ2VzdCggKSB7XG4gIHZhciBkaXJ0eTtcbiAgdmFyIHR0bCA9IDEwOyAvLyBob3cgbWFueSBpdGVyYXRpb25zIHdlIGNhbiBtYWtlIGJlZm9yZSB3ZSBhc3N1bWUgdGhlIGRhdGEgaXMgdW5zdGFibGVcblxuICBkbyB7XG4gICAgdmFyIGxlbmd0aCA9IHRoaXMucmVjb3Jkcy5sZW5ndGg7XG5cbiAgICBkaXJ0eSA9IGZhbHNlO1xuXG4gICAgd2hpbGUobGVuZ3RoLS0pIHtcbiAgICAgIHZhciBpdGVtID0gdGhpcy5yZWNvcmRzW2xlbmd0aF07XG5cbiAgICAgIGlmKCBpdGVtICkge1xuICAgICAgICB2YXJcbiAgICAgICAgICBuZXdWYWwgPSBpdGVtLndhdGNoRXhwKCksXG4gICAgICAgICAgb2xkVmFsID0gaXRlbS5sYXN0VmFsdWU7XG5cbiAgICAgICAgaWYoICFVdGlscy5lcXVhbHMobmV3VmFsLCBvbGRWYWwgKSApIHtcbiAgICAgICAgICBpZiggISggVXRpbHMuaXNBcnJheShuZXdWYWwpIHx8IFV0aWxzLmlzT2JqZWN0KG5ld1ZhbCkgKSApIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZSBuZXcgdmFsdWUgaXMgbm90IGFuIGFycmF5IG9yIG9iamVjdCwgd2UgY2FuIGp1c3Qgc2V0IGl0IHdpdGhvdXQgd29ycnlpbmcgYWJvdXQgYmluZGluZ1xuICAgICAgICAgICAgaXRlbS5sYXN0VmFsdWUgPSBuZXdWYWw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGlmIGl0IGlzIGFuIGFycmF5IG9yIG9iamVjdCwgd2UgaGF2ZSB0byBjb3B5IGl0IG92ZXIgdG8gc3RvcCBhbnkgYmluZGluZyBieSByZWZlcmVuY2VcbiAgICAgICAgICAgIGl0ZW0ubGFzdFZhbHVlID0gVXRpbHMuY29weShuZXdWYWwpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBwYXJhbXMgPSBbbmV3VmFsLCBvbGRWYWxdO1xuXG4gICAgICAgICAgaWYoIFV0aWxzLmlzQXJyYXkobmV3VmFsKSAmJiBVdGlscy5pc0FycmF5KG9sZFZhbCkgKSB7XG4gICAgICAgICAgICAvLyBpZiBpdHMgYW4gYW4gYXJyYXksIHdlIHdpbGwgcGFzcyB0aHJvdWdoIHRoZSBkaWZmZXJlbmNlIGFzIHRoZSB0aGlyZCBwYXJhbWV0ZXJcbiAgICAgICAgICAgIHBhcmFtcy5wdXNoKCBVdGlscy5hcnJheURpZmYobmV3VmFsLCBvbGRWYWwpICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaXRlbS5saXN0ZW5lci5hcHBseSggdGhpcywgcGFyYW1zICk7XG5cbiAgICAgICAgICBkaXJ0eSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGlydHkgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCBkaXJ0eSAmJiAhKHR0bC0tKSApIHtcbiAgICAgIHRocm93ICdNYXhpbXVtIGRpZ2VzdCBpdGVyYXRpb25zIHJlYWNoZWQnO1xuICAgIH1cbiAgfSB3aGlsZShkaXJ0eSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9ic2VydmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXRpbHMgb2JqZWN0XG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG52YXIgVXRpbHMgPSB7XG4gIC8qKlxuICAgKiBDb3B5IHdpdGhvdXQgYmluZGluZyBieSByZWZlcmVuY2VcbiAgICogQHBhcmFtICB7T2JqZWN0fEFycmF5fSBzb3VyY2UgICAgICBTb3VyY2UgdG8gY29weSBmcm9tXG4gICAqIEBwYXJhbSAge09iamVjdHxBcnJheX0gZGVzdGluYXRpb24gVGFyZ2V0XG4gICAqIEByZXR1cm4ge09iamVjdHxBcnJheX0gICAgICAgICAgICAgQ29waWVkIG9iamVjdC9hcnJheVxuICAgKi9cbiAgY29weTogZnVuY3Rpb24oIHNvdXJjZSwgZGVzdGluYXRpb24gKSB7XG4gICAgaWYoIWRlc3RpbmF0aW9uKSB7XG4gICAgICBpZiggdGhpcy5pc0FycmF5KHNvdXJjZSkgKSB7XG4gICAgICAgIGRlc3RpbmF0aW9uID0gW107XG4gICAgICB9IGVsc2UgaWYoIHRoaXMuaXNPYmplY3Qoc291cmNlKSApIHtcbiAgICAgICAgZGVzdGluYXRpb24gPSB7fTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvciggdHlwZW9mIHNvdXJjZSArICcgaXMgbm90IHN1cHBvcnRlZCBieSBVdGlscy5jb3B5Jyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yKCB2YXIgaSBpbiBzb3VyY2UgKSB7XG4gICAgICBkZXN0aW5hdGlvbltpXSA9IHNvdXJjZVtpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVzdGluYXRpb247XG4gIH0sXG4gIC8qKlxuICAgKiBGaW5kIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdHdvIGFycmF5c1xuICAgKiBAcGFyYW0gIHtBcnJheX0gYTEgTmV3IEFycmF5XG4gICAqIEBwYXJhbSAge0FycmF5fSBhMiBQcmV2aW91cyBBcnJheVxuICAgKiBAcmV0dXJuIHtBcnJheX0gICAgQXJyYXkgb2Ygb2JqZWN0cyBvZiBjaGFuZ2VzIGZyb20gcHJldiA+IG5ld1xuICAgKi9cbiAgYXJyYXlEaWZmOiBmdW5jdGlvbiggYTEsIGEyICkge1xuICAgIHZhciBkaWZmZXJlbmNlcyA9IFtdO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBhMS5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCBhMi5pbmRleE9mKCBhMVtpXSApID09PSAtMSApIHtcbiAgICAgICAgZGlmZmVyZW5jZXMucHVzaCh7XG4gICAgICAgICAgYWN0aW9uOiAnYWRkZWQnLFxuICAgICAgICAgIHZhbHVlOiBhMVtpXVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBhMi5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCBhMS5pbmRleE9mKCBhMltpXSApID09PSAtMSApIHtcbiAgICAgICAgZGlmZmVyZW5jZXMucHVzaCh7XG4gICAgICAgICAgYWN0aW9uOiAncmVtb3ZlZCcsXG4gICAgICAgICAgdmFsdWU6IGEyW2ldXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkaWZmZXJlbmNlcztcbiAgfSxcbiAgLyoqXG4gICAqIENvbXB1dGUgaWYgdHdvIGl0ZW1zIGFyZSBlcXVhbHNcbiAgICogQHBhcmFtICB7Kn0gbzEgQW55IHR5cGUgb2YgZGF0YSB0byBjb21wYXJlXG4gICAqIEBwYXJhbSAgeyp9IG8yIEFueSB0eXBlIG9mIGRhdGEgdG8gY29tcGFyZVxuICAgKiBAcmV0dXJuIHtib29sfSBXaGV0aGVyIG9yIG5vdCB0aGV5J3JlIGVxdWFsXG4gICAqL1xuICBlcXVhbHM6IGZ1bmN0aW9uKCBvMSwgbzIgKSB7XG4gICAgaWYgKG8xID09PSBvMikgcmV0dXJuIHRydWU7XG4gICAgaWYgKG8xID09PSBudWxsIHx8IG8yID09PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKG8xICE9PSBvMSAmJiBvMiAhPT0gbzIpIHJldHVybiB0cnVlO1xuICAgIHZhciB0MSA9IHR5cGVvZiBvMSwgdDIgPSB0eXBlb2YgbzIsIGxlbmd0aCwga2V5LCBrZXlTZXQ7XG4gICAgaWYgKHQxID09IHQyKSB7XG4gICAgICBpZiAodDEgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNBcnJheShvMSkpIHtcbiAgICAgICAgICBpZiAoIXRoaXMuaXNBcnJheShvMikpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICBpZiAoKGxlbmd0aCA9IG8xLmxlbmd0aCkgPT0gbzIubGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3Ioa2V5PTA7IGtleTxsZW5ndGg7IGtleSsrKSB7XG4gICAgICAgICAgICAgIGlmICghdGhpcy5lcXVhbHMobzFba2V5XSwgbzJba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzRGF0ZShvMSkpIHtcbiAgICAgICAgICBpZiAoIXRoaXMuaXNEYXRlKG8yKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIHJldHVybiB0aGlzLmVxdWFscyhvMS5nZXRUaW1lKCksIG8yLmdldFRpbWUoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1JlZ0V4cChvMSkgJiYgdGhpcy5pc1JlZ0V4cChvMikpIHtcbiAgICAgICAgICByZXR1cm4gbzEudG9TdHJpbmcoKSA9PSBvMi50b1N0cmluZygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGtleVNldCA9IHt9O1xuICAgICAgICAgIGZvcihrZXkgaW4gbzEpIHtcbiAgICAgICAgICAgIGlmIChrZXkuY2hhckF0KDApID09PSAnJCcgfHwgdGhpcy5pc0Z1bmN0aW9uKG8xW2tleV0pKSBjb250aW51ZTtcbiAgICAgICAgICAgIGlmICghdGhpcy5lcXVhbHMobzFba2V5XSwgbzJba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGtleVNldFtrZXldID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZm9yKGtleSBpbiBvMikge1xuICAgICAgICAgICAgaWYgKCFrZXlTZXQuaGFzT3duUHJvcGVydHkoa2V5KSAmJlxuICAgICAgICAgICAgICAgIGtleS5jaGFyQXQoMCkgIT09ICckJyAmJlxuICAgICAgICAgICAgICAgIG8yW2tleV0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICF0aGlzLmlzRnVuY3Rpb24obzJba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICAvKipcbiAgICogQ29udmVydCBzdHJpbmdzIGZyb20gaXRlbTpkZXNjIHRvIGl0ZW1EZXNjXG4gICAqIEBwYXJhbSAge1N0cmluZ30gc3RyaW5nIFN0cmluZyB0byBiZSBmb3JtYXR0ZWRcbiAgICogQHJldHVybiB7U3RyaW5nfSAgICAgICAgRm9ybWF0dGVkIHN0cmluZ1xuICAgKi9cbiAgY29udmVydFRvQ2FtZWxDYXNlOiBmdW5jdGlvbiggc3RyaW5nICkge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvOihbYS16XSkvZywgZnVuY3Rpb24gKGcpIHsgcmV0dXJuIGdbMV0udG9VcHBlckNhc2UoKTsgfSlcbiAgfSxcbiAgLyoqXG4gICAqIEV4dGVuZCBhbiBvYmplY3RcbiAgICogQHBhcmFtICB7T2JqZWN0fSBzb3VyY2UgICAgICBTb3VyY2Ugb2JqZWN0IHRvIGV4dGVuZFxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRlc3RpbmF0aW9uIFRhcmdldCBvYmplY3QgdG8gZXh0ZW5kIGludG9cbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgICBFeHRlbmRlZCBvYmplY3RcbiAgICovXG4gIGV4dGVuZDogZnVuY3Rpb24oIHNvdXJjZSwgZGVzdGluYXRpb24gKSB7XG4gICAgZm9yKCB2YXIgaSBpbiBzb3VyY2UgKSB7XG4gICAgICBkZXN0aW5hdGlvbltpXSA9IHNvdXJjZVtpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVzdGluYXRpb247XG4gIH0sXG4gIC8qKlxuICAgKiBGaW5kIGNsb3Nlc3QgcGFyZW50IGZyb20gRE9NIGV2ZW50XG4gICAqIEBwYXJhbSAge09iamVjdH0gZXZlbnQgICAgIERPTSBldmVudCBvYmpcbiAgICogQHBhcmFtICB7U3RyaW5nfSBjbGFzc05hbWUgQ2xhc3MgbmFtZSB0byBsb29rIGZvclxuICAgKiBAcmV0dXJuIHtPYmplY3R8TnVsbH0gICAgICBSZXN1bHQgb2Ygc2VhcmNoXG4gICAqL1xuICBmaW5kQ2xvc2VzdFBhcmVudDogZnVuY3Rpb24oZXZlbnQsIGNsYXNzTmFtZSkge1xuICAgIHZhciBwYXJlbnQgPSBldmVudC5wYXJlbnROb2RlO1xuICAgIHdoaWxlIChwYXJlbnQhPWRvY3VtZW50LmJvZHkgJiYgcGFyZW50ICE9IG51bGwpIHtcbiAgICAgIGlmICgocGFyZW50KSAmJiBwYXJlbnQuY2xhc3NOYW1lICYmIHBhcmVudC5jbGFzc05hbWUuaW5kZXhPZihjbGFzc05hbWUpICE9IC0xKSB7XG4gICAgICAgIHJldHVybiBwYXJlbnQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJlbnQgPSBwYXJlbnQgPyBwYXJlbnQucGFyZW50Tm9kZSA6IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9LFxuICBjaGVja1N0YXRlOiBmdW5jdGlvbiggc3RhdGUsIGN1cnJlbnRTdGF0ZSApIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gY29tcGFyZVN0YXRlKCBzdGF0ZU5hbWUsIGN1cnJlbnRTdGF0ZSApIHtcbiAgICAgIHZhciBzaG93ID0gZmFsc2U7XG4gICAgICBpZiggc3RhdGVOYW1lICkge1xuICAgICAgICBpZiggX3RoaXMuaXNTdHJpbmcoIHN0YXRlTmFtZSApICkge1xuICAgICAgICAgIHNob3cgPSBzdGF0ZU5hbWUgPT09IGN1cnJlbnRTdGF0ZTtcbiAgICAgICAgfSBlbHNlIGlmKCBfdGhpcy5pc0FycmF5KCBzdGF0ZU5hbWUgKSApIHtcbiAgICAgICAgICB2YXIgaW5kZXggPSBzdGF0ZU5hbWUuaW5kZXhPZiggY3VycmVudFN0YXRlICk7XG5cbiAgICAgICAgICBzaG93ID0gaW5kZXggPiAtMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHNob3c7XG4gICAgfVxuXG4gICAgaWYoIHN0YXRlICkge1xuICAgICAgdmFyIHNob3cgPSBmYWxzZTtcbiAgICAgIGlmKCB0aGlzLmlzQXJyYXkoIGN1cnJlbnRTdGF0ZSApICkge1xuICAgICAgICBjdXJyZW50U3RhdGUuZm9yRWFjaCggZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCA9IGNvbXBhcmVTdGF0ZSggc3RhdGUsIGVsZW1lbnQgKTtcblxuICAgICAgICAgIGlmKCAhIXJlc3VsdCApIHtcbiAgICAgICAgICAgIHNob3cgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2hvdyA9IGNvbXBhcmVTdGF0ZSggc3RhdGUsIGN1cnJlbnRTdGF0ZSApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2hvdztcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcblxuLyoqXG4gKiBPYmplY3QgVHlwZXNcbiAqIEB0eXBlIHtBcnJheX1cbiAqL1xudmFyIG9ialR5cGVzID0gW1xuICAnQXJyYXknLCAnT2JqZWN0JywgJ1N0cmluZycsICdEYXRlJywgJ1JlZ0V4cCcsXG4gICdGdW5jdGlvbicsICdCb29sZWFuJywgJ051bWJlcicsICdOdWxsJywgJ1VuZGVmaW5lZCdcbl07XG5cbi8vIENyZWF0ZSBpbmRpdmlkdWFsIGZ1bmN0aW9ucyBvbiB0b3Agb2Ygb3VyIFV0aWxzIG9iamVjdCBmb3IgZWFjaCBvYmpUeXBlXG5mb3IgKHZhciBpID0gb2JqVHlwZXMubGVuZ3RoOyBpLS07KSB7XG4gIFV0aWxzWydpcycgKyBvYmpUeXBlc1tpXV0gPSAoZnVuY3Rpb24gKG9iamVjdFR5cGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKGVsZW0pLnNsaWNlKDgsIC0xKSA9PT0gb2JqZWN0VHlwZTtcbiAgICB9O1xuICB9KShvYmpUeXBlc1tpXSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVXRpbHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBGaW5kID0gcmVxdWlyZSgnLi9maW5kJyk7XG5cbi8qKlxuICogVmlldyBvYmplY3QsIGhvbGRzIHZpZXcgZGF0YVxuICogQHBhcmFtIHtPYmplY3R9IGl0ZW1zIFZpZXcgb2JqZWN0IGRhdGFcbiAqL1xuZnVuY3Rpb24gVmlldyAoaXRlbXMpIHtcbiAgLy8gc3RvcmUgdGhlIGl0ZW1zIHBhc3NlZCB0aHJvdWdoIGluIGl0c2VsZlxuICBmb3IgKHZhciBpIGluIGl0ZW1zKSB7XG4gICAgdGhpc1tpXSA9IGl0ZW1zW2ldO1xuICB9XG59XG5cbi8qKlxuICogRXZlcnl0aGluZyB0byBkbyB3aXRoIHRoZSB2aWV3XG4gKiBAcGFyYW0ge2FkYXB0fSBhZGFwdCBBZGFwdCBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBWaWV3U2VydmljZSAoYWRhcHQpIHtcbiAgLyoqXG4gICAqIEFkYXB0IEluc3RhbmNlXG4gICAqIEB0eXBlIHthZGFwdH1cbiAgICovXG4gIHRoaXMuJGFkYXB0ID0gYWRhcHQ7XG5cbiAgLyoqXG4gICAqIFZpZXcgSXRlbXNcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHRoaXMuaXRlbXMgPSB7fTtcblxuICAvLyBDcmVhdGUgdGhlIHZpZXcgZnJvbSB0aGUgY29uZmlndXJhdGlvblxuICB0aGlzLmNyZWF0ZVZpZXcodGhpcy4kYWRhcHQuY29uZmlnLnZpZXcsIHRoaXMuaXRlbXMpO1xuXG4gIC8vIENyZWF0ZSBhIG5ldyBmaW5kIGluc3RhbmNlIGZvciB0aGlzIHNlcnZpY2VcbiAgdGhpcy5maW5kID0gbmV3IEZpbmQoKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgdGhlIFZpZXdcbiAqIEBwYXJhbSAge09iamVjdH0gb2JqICAgIFRoZSB2aWV3IGNvbmZpZ3VyYXRpb25cbiAqIEBwYXJhbSAge09iamVjdH0gdGFyZ2V0IFRoZSB0YXJnZXQgdmlldyBpdGVtc1xuICovXG5WaWV3U2VydmljZS5wcm90b3R5cGUuY3JlYXRlVmlldyA9IGZ1bmN0aW9uIGNyZWF0ZVZpZXcgKG9iaiwgdGFyZ2V0KSB7XG4gIGZvciAodmFyIGkgaW4gb2JqKSB7XG4gICAgLy8gcGFzcyB0aHJvdWdoIG91ciBjb25maWd1cmF0aW9uIHRvIGEgbmV3IHZpZXdcbiAgICB0YXJnZXRbaV0gPSBuZXcgVmlldyhvYmpbaV0pO1xuICAgIGlmIChvYmpbaV0uaXRlbXMpIHtcbiAgICAgIC8vIHdlIG5lZWQgdG8gZ28gZGVlcGVyXG4gICAgICB0aGlzLmNyZWF0ZVZpZXcob2JqW2ldLml0ZW1zLCB0YXJnZXRbaV0uaXRlbXMpO1xuICAgIH1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3U2VydmljZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGFkYXB0ID0gcmVxdWlyZSgnLi4vYXBpL2NvcmUnKTtcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4uL2FwaS91dGlscycpO1xuXG52YXIgQWRhcHRBY2NvcmRpb24gPSB7XG4gIGRpc3BsYXlOYW1lOiAnQWRhcHRBY2NvcmRpb24nLFxuICBleHRlbmQ6IFthZGFwdC5taXhpbnMuYXJyYXlPYmplY3RdLFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBzZXQgdGhlIGluaXRpYWwgc3RhdGUgdG8gaGF2ZSBhbGwgYWNjb3JkaW9ucyBjbG9zZWRcbiAgICByZXR1cm4ge1xuICAgICAgb3BlbjogLTFcbiAgICB9O1xuICB9LFxuICBvcGVuQWNjb3JkaW9uOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAvLyB0b2dnbGUgdGhlIGFjY29yZGlvbiB0byBiZSBvcGVuLCBvciBjbG9zZWQgaWYgaXQgaXMgYWxyZWFkeSBvcGVuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBvcGVuOiBpZCA9PSB0aGlzLnN0YXRlLm9wZW4gPyAtMSA6IGlkXG4gICAgfSk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcbiAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuY29uZmlnLml0ZW07XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBvcGVuSUQgPSB0aGlzLnN0YXRlLm9wZW47XG4gICAgdmFyIGl0ZW1zID0gW107XG4gICAgdmFyIG1vZGVsID0gY29uZmlnLm1vZGVsW2NvbmZpZy5uYW1lXS52YWx1ZTtcblxuICAgIHZhciBsb29wID0gYWRhcHQuY29tcG9uZW50cy5sb29wO1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZihtb2RlbCkge1xuICAgICAgLy8gc2V0IHRoZSBjb250cm9sbGVyIGFuZCB2aWV3LCBhY2NvcmRpb25zIGFyZW4ndCBpbnZpc2libGUgaW4gdGhlIFZDIHNvIHdlIG5lZWQgdG8gZ28gZG93biBhIGxldmVsXG4gICAgICB2YXIgY2hpbGRDb250cm9sbGVyID0gY29uZmlnLmNvbnRyb2xsZXJbY29uZmlnLm5hbWVdO1xuICAgICAgdmFyIGNoaWxkTW9kZWwgPSBjb25maWcubW9kZWxbY29uZmlnLm5hbWVdLnZhbHVlO1xuXG4gICAgICB2YXIgZHluYW1pY0l0ZW0gPSBhZGFwdC5jb21wb25lbnRzLml0ZW07XG5cbiAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgbW9kZWwubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IFtdO1xuXG4gICAgICAgIC8vIGFjY29yZGlvbnMgbW9kZWxzIGFyZSBhcnJheXMsIGFuZCB3ZSBuZWVkIHRoZSBhcHByb3ByaWF0ZSBtb2RlbCB2YWx1ZSBmb3IgdGhpcyBpdGVyYXRpb25cbiAgICAgICAgdmFyIGZpbmFsTW9kZWwgPSBjaGlsZE1vZGVsW2ldO1xuXG4gICAgICAgIC8vIGFjY29yZGlvbnMgYXJlIHRoZSBzYW1lLCBzbyB3ZSBsb29wIHRocm91Z2ggdGhlIHZpZXcncyBtb2RlbCBmb3IgZWFjaCBhY2NvcmRpb25cbiAgICAgICAgLy8gVE9ETzogbWFrZSBhY2NvcmRpb25zIGhhdmUgZGlmZmVyZW50IHZpZXdzLCB0byBhbGxvdyBkeW5hbWljYWxseSBhZGRlZCBlbGVtZW50c1xuXG4gICAgICAgIGNoaWxkcmVuID0gbG9vcChcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpdGVtczogaXRlbS5tb2RlbCxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNoaWxkQ29udHJvbGxlcixcbiAgICAgICAgICAgIHZhbHVlczogY29uZmlnLnZhbHVlcyxcbiAgICAgICAgICAgIG9ic2VydmU6IGNvbmZpZy5vYnNlcnZlLFxuICAgICAgICAgICAgbmFtZVRyYWlsOiBjb25maWcubmFtZVRyYWlsICsgY29uZmlnLm5hbWUgKyAnLicsXG4gICAgICAgICAgICBtb2RlbDogZmluYWxNb2RlbCxcbiAgICAgICAgICAgIGFkYXB0OiBfdGhpcy5wcm9wcy5hZGFwdFxuICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICAvLyBkb2VzIHRoZSBhY2NvcmRpb24gaGF2ZSBhIHRpdGxlIGVsZW1lbnQgZm9yIGVhY2ggb25lP1xuICAgICAgICB2YXIgdGl0bGUgPSAnSXRlbSc7IC8vIHdlJ2xsIHNldCBhIGRlZmF1bHQgYW55d2F5XG4gICAgICAgIGlmIChpdGVtLnRpdGxlKSB7XG4gICAgICAgICAgLy8gYWNjb3JkaW9ucyBjYW4gaGF2ZSB0aXRsZXMsIHNvIHdlIG5lZWQgdG8gcmVwbGFjZSBhbnkgdmFyaWFibGVzIHJlcXVlc3RlZFxuICAgICAgICAgIHZhciBSRUdFWF9DVVJMWSA9IC97KFtefV0rKX0vZztcblxuICAgICAgICAgIHRpdGxlID0gaXRlbS50aXRsZTtcbiAgICAgICAgICB0aXRsZSA9IHRpdGxlLnJlcGxhY2UoUkVHRVhfQ1VSTFksIGZ1bmN0aW9uKCBtYXRjaCApIHtcbiAgICAgICAgICAgIGlmKCBtYXRjaCA9PT0gJ3tpbmRleH0nICkge1xuICAgICAgICAgICAgICAvLyB7aW5kZXh9IGFsbG93cyB1cyB0byBkaXNwbGF5IHRoZSBudW1iZXIgb2YgdGhlIGFjY29yZGlvbiAocGx1cyBvbmUuLilcbiAgICAgICAgICAgICAgcmV0dXJuIGkgKyAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcG9zc2libGVWYXJpYWJsZSA9IG1hdGNoLnJlcGxhY2UoJ3snLCAnJykucmVwbGFjZSgnfScsICcnKTsgLy8gdGhlcmUncyBwcm9iYWJseSBhIHJlZ2V4IGZvciB0aGlzIHNvbWV3aGVyZVxuXG4gICAgICAgICAgICBpZiggZmluYWxNb2RlbFtwb3NzaWJsZVZhcmlhYmxlXSApIHtcbiAgICAgICAgICAgICAgLy8gdGhlIHZhcmlhYmxlIGV4aXN0cyBpbiB0aGUgbW9kZWwhIGxldCdzIGJpbmQgdGhlbVxuICAgICAgICAgICAgICByZXR1cm4gZmluYWxNb2RlbFtwb3NzaWJsZVZhcmlhYmxlXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFyZSB0aGV5IG9wZW4/XG4gICAgICAgIHZhciB0aXRsZUNsYXNzZXMgPSBjeCh7XG4gICAgICAgICAgJ2VsZW1lbnRfX2FjY29yZGlvbi0tdGl0bGUnOiB0cnVlLFxuICAgICAgICAgICdvcGVuJzogaSA9PT0gb3BlbklEXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBjb250ZW50Q2xhc3NlcyA9IGN4KHtcbiAgICAgICAgICAnZWxlbWVudF9fYWNjb3JkaW9uLS1jb250ZW50JzogdHJ1ZSxcbiAgICAgICAgICAnb3Blbic6IGkgPT09IG9wZW5JRFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBwdXNoIHRoZSBjaGlsZCBpbnRvIHRoZSBpdGVtcyBhcnJheSwgc28gd2UgY2FuIHJlbmRlciBpdCBiZWxvd1xuICAgICAgICBpdGVtcy5wdXNoKFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJlbGVtZW50X19hY2NvcmRpb24tLWNoaWxkXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgICAgICAgICBjbGFzc05hbWU6IHRpdGxlQ2xhc3NlcywgXG4gICAgICAgICAgICAgIG9uQ2xpY2s6ICB0aGlzLm9wZW5BY2NvcmRpb24uYmluZCh0aGlzLCBpKSB9LCBcbiAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImgzXCIsIG51bGwsIHRpdGxlICksIFxuICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLWNoZXZyb24tZG93blwifSksIFxuICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLWNoZXZyb24tdXBcIn0pXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJhXCIsIHtcbiAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImVsZW1lbnRfX2FjY29yZGlvbi0tcmVtb3ZlIG5vLXNlbGVjdFwiLCBcbiAgICAgICAgICAgICAgb25DbGljazogIHRoaXMucmVtb3ZlLmJpbmQodGhpcywgaSkgfSwgXG4gICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IFwiZmEgZmEtdGltZXNcIn0pXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogY29udGVudENsYXNzZXMgfSwgXG4gICAgICAgICAgICAgIGNoaWxkcmVuIFxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIHRpdGxlO1xuICAgIGlmKCBpdGVtLnRpdGxlICkge1xuICAgICAgLy8gaWYgdGhlIGFjY29yZGlvbiBoYXMgYSB0aXRsZSwgd2UgbmVlZCB0byByZW5kZXIgaXRcbiAgICAgIC8vIGdyYWIgdGhlIGhlYWRlciBjb21wb25lbnRcbiAgICAgIHZhciBoZWFkZXIgPSBhZGFwdC5jb21wb25lbnRzLmhlYWRlcjtcblxuICAgICAgLy8gcGFzcyBpbiBhIGNvbmZpZywgdGhpcyBpcyBhIGJpdCBvdmVya2lsbCBidXQgaXQgYWxsb3dzIHVzIHRvIHVzZSBpdCBib3RoIGhlcmUgYW5kIGluIHRoZSBKU09OIGRlZmluaXRpb24gb2YgdGhlIHZpZXdcbiAgICAgIHRpdGxlID0gaGVhZGVyKCB7XG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgIHRpdGxlOiBpdGVtLnRpdGxlLFxuICAgICAgICAgICAgdHlwZTogJ2hlYWRlcjpoMidcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGFkYXB0OiB0aGlzLnByb3BzLmFkYXB0XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJuIHRoZSBhY2NvcmRpb24hXG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJlbGVtZW50X19hY2NvcmRpb24gY2xlYXJcIn0sIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaGVhZGVyXCIsIHtjbGFzc05hbWU6IFwiZWxlbWVudF9fYWNjb3JkaW9uLS1oZWFkZXJcIn0sIFxuICAgICAgICAgIHRpdGxlLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogXCJlbGVtZW50X19idXR0b24gZWxlbWVudF9fYnV0dG9uLS1hZGQgbm8tc2VsZWN0XCIsIFxuICAgICAgICAgICAgb25DbGljazogIHRoaXMuYWRkfSwgXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLXBsdXNcIn0pLCBcIiBBZGQgSXRlbVwiXG4gICAgICAgICAgKVxuICAgICAgICApLCBcblxuICAgICAgICBpdGVtcyBcbiAgICAgIClcbiAgICApO1xuICB9XG59O1xuXG5hZGFwdC5jb21wb25lbnQoJ2FjY29yZGlvbicsIEFkYXB0QWNjb3JkaW9uKTtcbiIsInZhciBhZGFwdCA9IHJlcXVpcmUoJy4uL2FwaS9jb3JlJyk7XG52YXIgVXRpbHMgPSByZXF1aXJlKCcuLi9hcGkvdXRpbHMnKTtcblxudmFyIEFkYXB0QnV0dG9uID0ge1xuICBzdGF0aWNzOiB7XG4gICAgZGVmYXVsdE1vZGVsVmFsdWU6IFtdXG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oICl7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1vZGVsOiBVdGlscy5jb3B5KGNvbmZpZy5tb2RlbFsgY29uZmlnLm5hbWUgXS52YWx1ZSlcbiAgICB9XG4gIH0sXG4gIGRpc3BsYXlOYW1lOiAnQWRhcHRCdXR0b24nLFxuICBzZXRPYnNlcnZlcnM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgdmFyIG9ic2VydmVycyA9IGNvbmZpZy5vYnNlcnZlW2NvbmZpZy5uYW1lVHJhaWwgKyBjb25maWcubmFtZV07XG5cbiAgICBmb3IoIHZhciBpIGluIG9ic2VydmVycykge1xuICAgICAgb2JzZXJ2ZXJzW2ldLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50LCBpbmRleCApIHtcbiAgICAgICAgdGhhdC5saXN0ZW5lcnMucHVzaChcbiAgICAgICAgICB0aGF0LnByb3BzLmFkYXB0Lm9ic2VydmUuYWRkTGlzdGVuZXIoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiBjb25maWcubW9kZWxbY29uZmlnLm5hbWVdW2ldIHx8IGNvbmZpZy5pdGVtW2ldO1xuICAgICAgICAgIH0sIGVsZW1lbnQgKVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBsaXN0ZW5lcnM6IFtdLFxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oICkge1xuICAgIHRoaXMuc3RhdGUubGlzdGVuZXJzLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuICAgICAgZWxlbWVudCgpO1xuICAgIH0gKTtcbiAgfSxcbiAgdG9nZ2xlQ2hlY2tib3g6IGZ1bmN0aW9uKCBrZXkgKSB7XG4gICAgdmFyIG1vZGVsID0gdGhpcy5zdGF0ZS5tb2RlbDtcblxuICAgIHZhciBpbmRleCA9IG1vZGVsLmluZGV4T2Yoa2V5KTtcblxuICAgIGlmKCBpbmRleCA+IC0xICkge1xuICAgICAgbW9kZWwuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbW9kZWwucHVzaChrZXkpO1xuICAgIH1cblxuICAgIHRoaXMucHJvcHMuY29uZmlnLm1vZGVsWyB0aGlzLnByb3BzLmNvbmZpZy5uYW1lIF0udmFsdWUgPSBtb2RlbDtcbiAgICB0aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuZGlnZXN0KCk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG1vZGVsOiBtb2RlbCxcbiAgICAgIG5hOiAhbW9kZWwubGVuZ3RoXG4gICAgfSk7XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICB2YXIgbW9kZWwgPSBjb25maWcubW9kZWxbY29uZmlnLm5hbWVdO1xuXG4gICAgdmFyIGV4cHJlc3Npb25WYWx1ZTtcblxuICAgIGlmKCBjb25maWcub2JzZXJ2ZVtjb25maWcubmFtZVRyYWlsICsgY29uZmlnLm5hbWVdICkge1xuICAgICAgdGhpcy5zZXRPYnNlcnZlcnMoKTtcbiAgICB9XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oICkge1xuICAgIHZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxuICAgIHZhclxuICAgICAgbW9kZWwgPSB0aGlzLnN0YXRlLm1vZGVsLFxuICAgICAgdHlwZSA9IHRoaXMuc3RhdGUudHlwZSxcbiAgICAgIGl0ZW0gPSB0aGlzLnByb3BzLmNvbmZpZy5pdGVtO1xuXG4gICAgdmFyIG5hU2VsZWN0ZWQgPSB0aGlzLnN0YXRlLm5hIHx8ICFtb2RlbC5sZW5ndGg7XG5cbiAgICB2YXIgbGFiZWwgPSBhZGFwdC5jb21wb25lbnQoJ2xhYmVsJyk7XG5cbiAgICB2YXIgY2hlY2tib3hlcyA9IFtdO1xuICAgIHZhciBpdGVtcyA9IGl0ZW0ub3B0aW9ucztcblxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGQgZmllbGRfX2NoZWNrYm94XCJ9LCBcbiAgICAgICAgXG4gICAgICAgICAgdHlwZW9mIGl0ZW0ubGFiZWwgPT09ICd1bmRlZmluZWQnID8gJycgOlxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoYWRhcHQuY29tcG9uZW50cy5sYWJlbCwge2NvbmZpZzogIHsgaXRlbTogaXRlbX0sIGFkYXB0OiAgdGhpcy5wcm9wcy5hZGFwdH0pLCBcbiAgICAgICAgICBcblxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGRfX2NoZWNrYm94LS1jb250YWluZXJcIn0sIFxuXG4gICAgICAgICAgXG4gICAgICAgICAgICB0eXBlb2YgaXRlbS5kZXNjID09PSAndW5kZWZpbmVkJyA/ICcnIDpcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoYWRhcHQuY29tcG9uZW50cy5kZXNjcmlwdGlvbiwge2NvbmZpZzogIHsgaXRlbTogaXRlbX0sIGFkYXB0OiAgdGhpcy5wcm9wcy5hZGFwdH0pXG4gICAgICAgICAgICBcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn07XG5cbmFkYXB0LmNvbXBvbmVudCgnYnV0dG9uJywgQWRhcHRCdXR0b24pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYWRhcHQgPSByZXF1aXJlKCcuLi9hcGkvY29yZScpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vYXBpL3V0aWxzJyk7XG5cbnZhciBBZGFwdENoZWNrYm94ID0ge1xuICBzdGF0aWNzOiB7XG4gICAgZGVmYXVsdE1vZGVsVmFsdWU6IFtdXG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCl7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgLy8gdGhlIG1vZGVsIHZhbHVlIGlzIGFuIGFycmF5LCB3aGljaCBmb3Igc29tZSByZWFzb24sIGdldHMgYmluZGVkIGJ5IHJlZmVyZW5jZSAtIGxldCdzIHN0b3AgdGhhdCBieSByZXR1cm5pbmcgYSBjb3BpZWQgdmVyc2lvblxuICAgIHJldHVybiB7XG4gICAgICBtb2RlbDogdXRpbHMuY29weSggY29uZmlnLm1vZGVsW2NvbmZpZy5uYW1lXS52YWx1ZSApXG4gICAgfTtcbiAgfSxcbiAgZGlzcGxheU5hbWU6ICdBZGFwdENoZWNrYm94JyxcbiAgc2V0T2JzZXJ2ZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gbG9vcCB0aHJvdWdoIHRoZSBvYnNlcnZlcnMgYW5kIHNldCB0aGVtXG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICAvLyBncmFiIHRoZSBvYnNlcnZlcnMsIHVzaW5nIHRoZSBmdWxsIG5hbWUgb2YgdGhlIGNvbXBvbmVudFxuICAgIHZhciBvYnNlcnZlcnMgPSBjb25maWcub2JzZXJ2ZVtjb25maWcubmFtZVRyYWlsICsgY29uZmlnLm5hbWVdO1xuXG4gICAgZm9yKCB2YXIgaSBpbiBvYnNlcnZlcnMpIHtcbiAgICAgIG9ic2VydmVyc1tpXS5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbWVudCwgaW5kZXggKSB7XG4gICAgICAgIC8vIHB1c2ggdGhlIGxpc3RlbmVyIGludG8gYW4gYXJyYXksIHNvIHdlIGNhbiB1bmJpbmQgdGhlbSBhbGwgd2hlbiB0aGUgY29tcG9uZW50IHVubW91bnRzXG4gICAgICAgIF90aGlzLmxpc3RlbmVycy5wdXNoKFxuICAgICAgICAgIF90aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuYWRkTGlzdGVuZXIoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIC8vIHJldHVybiBlaXRoZXIgdGhlIHdhdGNoIHZhbHVlIGluIHRoZSBtb2RlbCwgb3IgdGhlIHdhdGNoIHZhbHVlIGluIHRoZSB2aWV3XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLm1vZGVsW2NvbmZpZy5uYW1lXVtpXSB8fCBjb25maWcuaXRlbVtpXTtcbiAgICAgICAgICB9LCBlbGVtZW50IClcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgbGlzdGVuZXJzOiBbXSxcbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCApIHtcbiAgICAvLyB1bnJlZ2lzdGVyIGFsbCB0aGUgZXZlbnRzXG4gICAgdGhpcy5zdGF0ZS5saXN0ZW5lcnMuZm9yRWFjaCggZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG4gICAgICBlbGVtZW50KCk7XG4gICAgfSApO1xuICB9LFxuICB0b2dnbGVDaGVja2JveDogZnVuY3Rpb24oIGtleSApIHtcbiAgICB2YXIgbW9kZWwgPSB0aGlzLnN0YXRlLm1vZGVsO1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIC8vIGdyYWIgdGhlIChwb3NzaWJsZSkgaW5kZXggb2YgdGhlIHZhbHVlIGluIHRoZSBtb2RlbFxuICAgIHZhciBpbmRleCA9IG1vZGVsLmluZGV4T2Yoa2V5KTtcblxuICAgIGlmKCBpbmRleCA+IC0xICkge1xuICAgICAgLy8gaXQncyBhbHJlYWR5IGluIHRoZSBtb2RlbCwgcmVtb3ZlIGl0XG4gICAgICBtb2RlbC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBhZGQgaXQgdG8gdGhlIG1vZGVsXG4gICAgICBtb2RlbC5wdXNoKGtleSk7XG4gICAgfVxuXG4gICAgLy8gcHVzaCBpdCBiYWNrIGludG8gdGhlIG1vZGVsIGFuZCBub3RpZnkgZXZlcnl0aGluZyBlbHNlXG4gICAgY29uZmlnLm1vZGVsWyBjb25maWcubmFtZSBdLnZhbHVlID0gbW9kZWw7XG4gICAgdGhpcy5wcm9wcy5hZGFwdC5vYnNlcnZlLmRpZ2VzdCgpO1xuXG4gICAgLy8ga2VlcCB0aGUgbW9kZWwgaW4gc3luY1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbW9kZWw6IG1vZGVsLFxuICAgICAgbmE6ICFtb2RlbC5sZW5ndGhcbiAgICB9KTtcbiAgfSxcbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgLy8gaWYgb2JzZXJ2ZXJzIGFyZSBzZXQsIHNldCB0aGVtXG4gICAgaWYoIGNvbmZpZy5vYnNlcnZlW2NvbmZpZy5uYW1lVHJhaWwgKyBjb25maWcubmFtZV0gKSB7XG4gICAgICB0aGlzLnNldE9ic2VydmVycygpO1xuICAgIH1cbiAgfSxcbiAgdG9nZ2xlTkE6IGZ1bmN0aW9uKCApIHtcbiAgICAvLyB0aGUgTkEgYnV0dG9uIGlzIHNlbGVjdGVkIHdoZW4gbm90aGluZyBpcyBzZWxlY3RlZCwgYWxzbyBjbGVhcnMgc2VsZWN0aW9uIHdoZW4gY2xpY2tlZFxuICAgIHZhciBtb2RlbCA9IHRoaXMuc3RhdGUubW9kZWw7XG4gICAgdmFyIG5hO1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIC8vIGNoZWNrIGlmIHRoZXJlIGFyZSBhbnkgaXRlbXMgaW4gdGhlIG1vZGVsXG4gICAgaWYoIG1vZGVsLmxlbmd0aCApIHtcbiAgICAgIHRoaXMub2xkVmFsdWVzID0gbW9kZWw7IC8vIHN0b3JlIHRoZW0sIHNvIGlmIHRoZSB1c2VyIGFjY2lkZW50YWxseSBjbGlja3Mgb24gTkEgdGhleSBjYW4gcmVzdG9yZSB0aGVtIGJ5IGNsaWNraW5nIG9uIGl0IGFnYWluXG5cbiAgICAgIG5hID0gdHJ1ZTsgLy8gc2V0IHRoZSBOQSBidXR0b24gdG8gYWN0aXZlXG4gICAgICBtb2RlbCA9IFtdOyAvLyBjbGVhciB0aGUgbW9kZWxcblxuICAgICAgLy8gdXBkYXRlIHRoZSBzdGF0ZVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIG5hOiB0cnVlLFxuICAgICAgICBtb2RlbDogW11cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiggdGhpcy5zdGF0ZS5uYSApIHtcbiAgICAgICAgLy8gaWYgdGhlcmUgYXJlIG5vIGl0ZW1zIHNlbGVjdGVkLCBhbmQgTkEgaXMgc2VsZWN0ZWQsIGNoYW5nZSB0aGUgaXRlbXMgYmFja1xuICAgICAgICBuYSA9IGZhbHNlO1xuICAgICAgICBtb2RlbCA9IHRoaXMub2xkVmFsdWVzIHx8IFtdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gdGhlcmUgYXJlIG5vIGl0ZW1zIHNlbGVjdGVkLCBzbyB3ZSBuZWVkIHRvIHNldCBOQSB0byBhY3RpdmVcbiAgICAgICAgbmEgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHB1c2ggaXQgYmFjayBpbnRvIHRoZSBtb2RlbFxuICAgIGNvbmZpZy5tb2RlbFsgY29uZmlnLm5hbWUgXS52YWx1ZSA9IG1vZGVsO1xuICAgIHRoaXMucHJvcHMuYWRhcHQub2JzZXJ2ZS5kaWdlc3QoKTtcblxuICAgIC8vIGtlZXAgdGhlIHZpZXcgaW4gc3luY1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbW9kZWw6IG1vZGVsLFxuICAgICAgbmE6IG5hXG4gICAgfSk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oICkge1xuICAgIHZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxuICAgIHZhciBtb2RlbCA9IHRoaXMuc3RhdGUubW9kZWw7XG4gICAgdmFyIHR5cGUgPSB0aGlzLnN0YXRlLnR5cGU7XG4gICAgdmFyIGl0ZW0gPSB0aGlzLnByb3BzLmNvbmZpZy5pdGVtO1xuXG4gICAgdmFyIG5hU2VsZWN0ZWQgPSB0aGlzLnN0YXRlLm5hIHx8ICFtb2RlbC5sZW5ndGg7XG5cbiAgICB2YXIgbGFiZWwgPSBhZGFwdC5jb21wb25lbnQoJ2xhYmVsJyk7XG5cbiAgICB2YXIgY2hlY2tib3hlcyA9IFtdO1xuICAgIHZhciBpdGVtcyA9IGl0ZW0ub3B0aW9ucztcblxuICAgIHZhciBjb250cm9sbGVyID0ge307XG4gICAgaWYoIHRoaXMucHJvcHMuY29uZmlnLmNvbnRyb2xsZXIgJiYgdGhpcy5wcm9wcy5jb25maWcuY29udHJvbGxlclsgdGhpcy5wcm9wcy5jb25maWcubmFtZSBdICkge1xuICAgICAgY29udHJvbGxlciA9IHRoaXMucHJvcHMuY29uZmlnLmNvbnRyb2xsZXJbIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgXTtcbiAgICB9XG5cbiAgICAvLyBkbyB3ZSBldmVuIHdhbnQgdGhhdCBOQSBidXR0b24/XG4gICAgaWYoIGl0ZW0uaW5jbHVkZU5BICkge1xuICAgICAgdmFyIGNsYXNzZXMgPSBjeCh7XG4gICAgICAgICdmaWVsZF9fY2hlY2tib3gtLWl0ZW0nOiB0cnVlLFxuICAgICAgICAnZmllbGRfX2NoZWNrYm94LS1hY3RpdmUnOiBuYVNlbGVjdGVkLFxuICAgICAgICAnZmllbGRfX2NoZWNrYm94LS1kaXNhYmxlZCc6IGNvbnRyb2xsZXIuZGlzYWJsZWRcbiAgICAgIH0pO1xuXG4gICAgICBjaGVja2JveGVzLnB1c2goXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgICAgIGNsYXNzTmFtZTogY2xhc3NlcywgXG4gICAgICAgICAga2V5OiBcIm5hXCIsIFxuICAgICAgICAgIG9uQ2xpY2s6ICAhY29udHJvbGxlci5kaXNhYmxlZCA/IHRoaXMudG9nZ2xlTkEgOiBmdW5jdGlvbigpe319LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLWZ3IGZhLWNoZWNrXCJ9KSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS1mdyBmYS10aW1lc1wifSksIFxuXG4gICAgICAgICAgXCJOL0FcIlxuICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gbG9vcCB0aHJvdWdoIGFsbCB0aGUgY2hlY2tib3hlcyBhbmQgcHVzaCB0aGVtIGludG8gYW4gYXJyYXlcbiAgICBmb3IoIHZhciBpIGluIGl0ZW1zICkge1xuICAgICAgdmFyIGNsYXNzZXMgPSBjeCh7XG4gICAgICAgICdmaWVsZF9fY2hlY2tib3gtLWl0ZW0nOiB0cnVlLFxuICAgICAgICAnZmllbGRfX2NoZWNrYm94LS1hY3RpdmUnOiBtb2RlbC5pbmRleE9mKGkpID4gLTEsXG4gICAgICAgICdmaWVsZF9fY2hlY2tib3gtLWRpc2FibGVkJzogY29udHJvbGxlci5kaXNhYmxlZFxuICAgICAgICB9KTtcblxuICAgICAgY2hlY2tib3hlcy5wdXNoKFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgICAgICAnZGF0YS1sb2NhdG9yJzogIHRoaXMucHJvcHMuY29uZmlnLm5hbWVUcmFpbCArIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgKyAnLWNoZWNrYm94LScgKyBpLCBcbiAgICAgICAgICBjbGFzc05hbWU6IGNsYXNzZXMsIFxuICAgICAgICAgIGtleTogIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgKyBpLCBcbiAgICAgICAgICBvbkNsaWNrOiAgIWNvbnRyb2xsZXIuZGlzYWJsZWQgPyB0aGlzLnRvZ2dsZUNoZWNrYm94LmJpbmQodGhpcywgaSkgOiBmdW5jdGlvbigpe319LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLWZ3IGZhLWNoZWNrXCJ9KSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS1mdyBmYS10aW1lc1wifSksIFxuICAgICAgICAgICBpdGVtc1tpXSBcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICB2YXIgbGFiZWwgPSBudWxsO1xuICAgIGlmKCBpdGVtLmxhYmVsICkge1xuICAgICAgdmFyIGxhYmVsQ29tcG9uZW50ID0gYWRhcHQuY29tcG9uZW50cy5sYWJlbDtcblxuICAgICAgbGFiZWwgPSBsYWJlbENvbXBvbmVudCgge1xuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICBpdGVtOiBpdGVtXG4gICAgICAgIH0sXG4gICAgICAgIGFkYXB0OiB0aGlzLnByb3BzLmFkYXB0XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgdmFyIGRlc2M7XG4gICAgaWYoIGl0ZW0uZGVjcyApIHtcbiAgICAgIHZhciBkZXNjQ29tcG9uZW50ID0gYWRhcHQuY29tcG9uZW50cy5kZXNjO1xuXG4gICAgICBkZWMgPSBkZXNjQ29tcG9uZW50KCB7XG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgfSxcbiAgICAgICAgYWRhcHQ6IHRoaXMucHJvcHMuYWRhcHRcbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImZpZWxkIGZpZWxkX19jaGVja2JveFwiLCAnZGF0YS1sb2NhdG9yJzogIHRoaXMucHJvcHMuY29uZmlnLm5hbWVUcmFpbCArIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgKyAnLWNvbnRhaW5lcid9LCBcbiAgICAgICAgbGFiZWwsIFxuICAgICAgICBjaGVja2JveGVzLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImZpZWxkX19jaGVja2JveC0tY29udGFpbmVyXCJ9LCBcbiAgICAgICAgICBkZXNjIFxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxufTtcblxuYWRhcHQuY29tcG9uZW50KCdjaGVja2JveCcsIEFkYXB0Q2hlY2tib3gpO1xuIiwidmFyIGFkYXB0ID0gcmVxdWlyZSgnLi4vYXBpL2NvcmUnKTtcblxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi4vYXBpL3V0aWxzJyk7XG5cbnZhciBBZGFwdENvbHVtbiA9IHtcbiAgZGlzcGxheU5hbWU6ICdBZGFwdENvbHVtbicsXG4gIHJlbmRlcjogZnVuY3Rpb24oICkge1xuICAgIHZhciBpdGVtID0gdGhpcy5wcm9wcy5jb25maWcuaXRlbTtcblxuICAgIHZhciB2aWV3ID0gaXRlbS5pdGVtcztcbiAgICB2YXIgd2lkdGggPSBpdGVtLnNwYW47XG5cbiAgICB2YXIgY29sdW1ucyA9IHt9O1xuXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgdmFyIHRvdGFsV2lkdGggPSAwO1xuXG4gICAgaWYoIFV0aWxzLmlzQXJyYXkod2lkdGgpICkge1xuICAgICAgd2lkdGguZm9yRWFjaCggZnVuY3Rpb24oIGVsZW1lbnQsIGluZGV4LCBhcnJheSApIHtcbiAgICAgICAgdG90YWxXaWR0aCArPSBlbGVtZW50O1xuICAgICAgfSApO1xuICAgIH1cblxudmFyIF90aGlzID0gdGhpcztcbiAgICB2YXIgdCA9IDA7XG4gICAgdmlldy5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbWVudCwgaW5kZXgsIGFycmF5ICkge1xuICAgICAgaWYoIHQgPj0gd2lkdGgubGVuZ3RoICkge1xuICAgICAgICB0ID0gMDtcbiAgICAgIH1cblxuICAgICAgdmFyIGl0ZW1zID0ge307XG5cbiAgICAgIHZhciBsb29wID0gYWRhcHQuY29tcG9uZW50cy5sb29wO1xuXG4gICAgICBpdGVtcyA9IGxvb3AoXG4gICAgICAgICAge1xuICAgICAgICAgICAgaXRlbXM6IGVsZW1lbnQsXG4gICAgICAgICAgICBjb250cm9sbGVyOiB0aGF0LnByb3BzLmNvbmZpZy5jb250cm9sbGVyLFxuICAgICAgICAgICAgdmFsdWVzOiB0aGF0LnByb3BzLmNvbmZpZy52YWx1ZXMsXG4gICAgICAgICAgICBvYnNlcnZlOiB0aGF0LnByb3BzLmNvbmZpZy5vYnNlcnZlLFxuICAgICAgICAgICAgbmFtZVRyYWlsOiB0aGF0LnByb3BzLmNvbmZpZy5uYW1lVHJhaWwsXG4gICAgICAgICAgICBtb2RlbDogdGhhdC5wcm9wcy5jb25maWcubW9kZWwsXG4gICAgICAgICAgICBhZGFwdDogX3RoaXMucHJvcHMuYWRhcHRcbiAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgIHZhciBjbGFzc05hbWUgPSAnY29sdW1uX19jb250YWluZXIgY29sdW1uX19jb250YWluZXItLScgKyB3aWR0aDtcbiAgICAgIHZhciBzdHlsZSA9IHt9O1xuXG4gICAgICBpZiggVXRpbHMuaXNBcnJheSggd2lkdGggKSApIHtcbiAgICAgICAgY2xhc3NOYW1lID0gJ2NvbHVtbl9fY29udGFpbmVyJztcbiAgICAgICAgc3R5bGUud2lkdGggPSAoICggd2lkdGhbdF0gLyB0b3RhbFdpZHRoICkgKiAoIDEwMCAtIHdpZHRoLmxlbmd0aCArIDEgKSApICsgJyUnO1xuXG4gICAgICAgIGlmKCB0ID09IHdpZHRoLmxlbmd0aCAtIDEgKSB7XG4gICAgICAgICAgc3R5bGUubWFyZ2luUmlnaHQgPSAnMHB4JztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb2x1bW5zWydjb2x1bW4tJyArIGluZGV4IF0gPSAoXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogY2xhc3NOYW1lLCBzdHlsZTogc3R5bGUgfSwgXG4gICAgICAgICAgaXRlbXNcbiAgICAgICAgKVxuICAgICAgICApO1xuXG4gICAgICB0Kys7XG4gICAgfSApO1xuXG5cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNvbHVtbiBjbGVhclwifSwgXG4gICAgICAgIGNvbHVtbnNcbiAgICAgIClcbiAgICApO1xuICB9XG59O1xuXG5hZGFwdC5jb21wb25lbnQoJ2NvbHVtbicsIEFkYXB0Q29sdW1uKTtcbiIsInZhciBhZGFwdCA9IHJlcXVpcmUoJy4uL2FwaS9jb3JlJyk7XG52YXIgVXRpbHMgPSByZXF1aXJlKCcuLi9hcGkvdXRpbHMnKTtcblxudmFyIEFkYXB0Q29sdW1uUm93cyA9IHtcbiAgZGlzcGxheU5hbWU6ICdBZGFwdENvbHVtblJvd3MnLFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGlzdGVuZXJzOiBbXVxuICAgIH1cbiAgfSxcbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLnN0YXRlLmxpc3RlbmVycy5wdXNoKFxuICAgICAgdGhpcy5wcm9wcy5hZGFwdC5vYnNlcnZlLmFkZExpc3RlbmVyKCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLnByb3BzLmNvbmZpZy5pdGVtLml0ZW1zO1xuICAgICAgfSwgZnVuY3Rpb24gKCBuZXdWYWwgKSB7XG4gICAgICAgIF90aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICB9IClcbiAgICApO1xuICB9LFxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc3RhdGUubGlzdGVuZXJzLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuICAgICAgZWxlbWVudCgpO1xuICAgIH0gKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiggKSB7XG4gICAgdmFyIGl0ZW0gPSB0aGlzLnByb3BzLmNvbmZpZy5pdGVtO1xuXG4gICAgdmFyIHZpZXcgPSBpdGVtLml0ZW1zO1xuICAgIHZhciB3aWR0aCA9IGl0ZW0uc3BhbjtcblxuICAgIHZhciBjb2x1bW5zID0ge307XG5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICB2YXIgdG90YWxXaWR0aCA9IDA7XG5cbiAgICBpZiggVXRpbHMuaXNBcnJheSh3aWR0aCkgKSB7XG4gICAgICB3aWR0aC5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbWVudCwgaW5kZXgsIGFycmF5ICkge1xuICAgICAgdG90YWxXaWR0aCArPSBlbGVtZW50O1xuICAgICAgfSApO1xuICAgIH1cblxuICAgIHZhciByID0gMDtcbiAgICB2YXIgdCA9IDA7XG4gICAgZm9yKCB2YXIgaSBpbiB2aWV3ICkge1xuICAgICAgaWYoIHQgPj0gd2lkdGgubGVuZ3RoICkge1xuICAgICAgICB0ID0gMDtcbiAgICAgIH1cbiAgICAgIHZhciBpdGVtcyA9IHt9O1xuXG4gICAgICB2YXIgY2xhc3NOYW1lID0gJ2NvbHVtbl9fY29udGFpbmVyIGNvbHVtbl9fY29udGFpbmVyLS0nICsgd2lkdGg7XG4gICAgICB2YXIgc3R5bGUgPSB7fTtcblxuICAgICAgaWYoIFV0aWxzLmlzQXJyYXkoIHdpZHRoICkgKSB7XG4gICAgICAgIGNsYXNzTmFtZSA9ICdjb2x1bW5fX2NvbnRhaW5lcic7XG4gICAgICAgIHN0eWxlLndpZHRoID0gKCAoIHdpZHRoW3RdIC8gdG90YWxXaWR0aCApICogKCAxMDAgLSB3aWR0aC5sZW5ndGggKyAxICkgKSArICclJztcblxuICAgICAgICBpZiggdCA9PSB3aWR0aC5sZW5ndGggLSAxICkge1xuICAgICAgICAgIHN0eWxlLm1hcmdpblJpZ2h0ID0gJzBweCc7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIGNvbmZpZyA9IHtcbiAgICAgICAgbW9kZWw6IHRoYXQucHJvcHMuY29uZmlnLm1vZGVsLFxuICAgICAgICBuYW1lOiBpLFxuICAgICAgICBpdGVtOiB2aWV3W2ldLFxuICAgICAgICB2YWx1ZXM6IHRoYXQucHJvcHMuY29uZmlnLnZhbHVlcyxcbiAgICAgICAgY29udHJvbGxlcjogdGhhdC5wcm9wcy5jb25maWcuY29udHJvbGxlcixcbiAgICAgICAgb2JzZXJ2ZTogdGhhdC5wcm9wcy5jb25maWcub2JzZXJ2ZSxcbiAgICAgICAgbmFtZVRyYWlsOiB0aGF0LnByb3BzLmNvbmZpZy5uYW1lVHJhaWxcbiAgICAgIH07XG5cbiAgICAgIHZhciBpdGVtID0gKHRoaXMudHJhbnNmZXJQcm9wc1RvKFJlYWN0LmNyZWF0ZUVsZW1lbnQoYWRhcHQuY29tcG9uZW50cy5pdGVtLCB7Y29uZmlnOiBjb25maWcgfSkpKTtcblxuICAgICAgY29sdW1uc1snY29sdW1uLScgKyByIF0gPSAoXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogY2xhc3NOYW1lLCBzdHlsZTogc3R5bGUgfSwgXG4gICAgICAgICAgaXRlbVxuICAgICAgICApXG4gICAgICAgICk7XG5cbiAgICAgIHIrKztcbiAgICAgIHQrKztcbiAgICB9XG5cblxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY29sdW1uIGNsZWFyXCJ9LCBcbiAgICAgICAgY29sdW1uc1xuICAgICAgKVxuICAgICk7XG4gIH1cbn07XG5cbmFkYXB0LmNvbXBvbmVudCgnY29sdW1uUm93cycsIEFkYXB0Q29sdW1uUm93cyk7XG4iLCJ2YXIgYWRhcHQgPSByZXF1aXJlKCcuLi9hcGkvY29yZScpO1xuXG52YXIgQWRhcHREZXNjcmlwdGlvbiA9IHtcbiAgZGlzcGxheU5hbWU6ICdBZGFwdERlc2NyaXB0aW9uJyxcbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHZhciBpdGVtID0gdGhpcy5wcm9wcy5jb25maWcuaXRlbTtcbiAgICB0aGlzLmxpc3RlbmVyID0gdGhpcy5wcm9wcy5hZGFwdC5vYnNlcnZlLmFkZExpc3RlbmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBpdGVtLmRlc2M7XG4gICAgfSwgZnVuY3Rpb24gKG5ld1ZhbCwgb2xkVmFsKSB7XG4gICAgICB0aGF0LnNldFN0YXRlKHt0ZXh0OiBuZXdWYWx9KTtcbiAgICB9KTtcbiAgfSxcbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmxpc3RlbmVyKCk7XG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICByZXR1cm4ge1xuICAgICAgdGV4dDogY29uZmlnLml0ZW0uZGVzY1xuICAgIH07XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFwicFwiLCB7Y2xhc3NOYW1lOiBcImZpZWxkX19kZXNjcmlwdGlvblwifSwgIHRoaXMucHJvcHMuY29uZmlnLml0ZW0uZGVzYyk7XG4gIH1cbn07XG5cbmFkYXB0LmNvbXBvbmVudCgnZGVzY3JpcHRpb24nLCBBZGFwdERlc2NyaXB0aW9uKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHZpZXcgID0gcmVxdWlyZSgnLi4vYXBpL3ZpZXcnKTtcbnZhciBtb2RlbCA9IHJlcXVpcmUoJy4uL2FwaS9tb2RlbCcpO1xudmFyIGFkYXB0ID0gcmVxdWlyZSgnLi4vYXBpL2NvcmUnKTtcblxudmFyIEFkYXB0Rm9ybSA9IHtcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFkYXB0SW5zdGFuY2UgPSB0aGlzLnByb3BzLmFkYXB0O1xuICAgIHZhciBtb2RlbCA9IGFkYXB0SW5zdGFuY2UubW9kZWw7XG4gICAgdmFyIHZpZXcgPSBhZGFwdEluc3RhbmNlLnZpZXcuaXRlbXM7XG4gICAgdmFyIGl0ZW1zID0gW107XG5cbiAgICB2YXIgZHluYW1pY0l0ZW0gPSBhZGFwdC5jb21wb25lbnQoJ2l0ZW0nKTtcblxuICAgIGZvciAodmFyIHByb3AgaW4gdmlldykge1xuICAgICAgdmFyIGl0ZW0gPSB2aWV3W3Byb3BdO1xuXG4gICAgICBpdGVtcy5wdXNoKFxuICAgICAgICB0aGlzLnRyYW5zZmVyUHJvcHNUbyhcbiAgICAgICAgICBkeW5hbWljSXRlbSgge1xuICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgIG1vZGVsOiBtb2RlbC5pdGVtcyxcbiAgICAgICAgICAgICAgdmFsdWVzOiBtb2RlbC52YWx1ZXMsXG4gICAgICAgICAgICAgIG9ic2VydmU6IG1vZGVsLm9ic2VydmUsXG4gICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGFkYXB0SW5zdGFuY2UuY29udHJvbGxlci5pdGVtcyxcbiAgICAgICAgICAgICAgbmFtZTogcHJvcCxcbiAgICAgICAgICAgICAgbmFtZVRyYWlsOiAnJyxcbiAgICAgICAgICAgICAgaXRlbTogdmlld1twcm9wXVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cblxuICAgIHZhciBjbGFzc2VzID0ge1xuICAgICAgJ2hlbGxvJzogMSA9PT0gMVxuICAgIH07XG5cblxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZm9ybVwiLCB7Y2xhc3NOYW1lOiBcImR5bmFtaWNfX2Zvcm1cIiwgYXV0b0NvbXBsZXRlOiBcIm9mZlwifSwgXG4gICAgICAgIGl0ZW1zIFxuICAgICAgKVxuICAgICk7XG4gIH1cbn07XG5cbmFkYXB0LmNvbXBvbmVudCgnZm9ybScsIEFkYXB0Rm9ybSk7XG4iLCJ2YXIgYWRhcHQgPSByZXF1aXJlKCcuLi9hcGkvY29yZScpO1xuXG52YXIgQWRhcHRIZWFkZXIgPSB7XG4gIGRpc3BsYXlOYW1lOiAnQWRhcHRIZWFkZXInLFxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCApIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIGl0ZW0gPSB0aGlzLnByb3BzLmNvbmZpZy5pdGVtO1xuICAgIHRoaXMubGlzdGVuZXIgPSB0aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuYWRkTGlzdGVuZXIoZnVuY3Rpb24oICkge1xuICAgICAgcmV0dXJuIGl0ZW0ubGFiZWw7XG4gICAgfSwgZnVuY3Rpb24oIG5ld1ZhbCwgb2xkVmFsICkge1xuICAgICAgdGhhdC5zZXRTdGF0ZSh7dGV4dDogbmV3VmFsfSk7XG4gICAgfSk7XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5saXN0ZW5lcigpO1xuICB9LFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdGV4dDogY29uZmlnLml0ZW0udGV4dCxcbiAgICAgIHNpemU6IGNvbmZpZy5pdGVtLnR5cGUuc3BsaXQoJzonKVsxXSB8fCAnaDEnXG4gICAgfTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6ICAnaGVhZGVyIGhlYWRlcl9fJyArIHRoaXMuc3RhdGUuc2l6ZX0sICB0aGlzLnByb3BzLmNvbmZpZy5pdGVtLnRleHQpO1xuICB9XG59O1xuXG5hZGFwdC5jb21wb25lbnQoJ2hlYWRlcicsIEFkYXB0SGVhZGVyKTtcbiIsInZhciBhZGFwdCA9IHJlcXVpcmUoJy4uL2FwaS9jb3JlJyk7XG5cbnZhciBBZGFwdEhyID0ge1xuICBkaXNwbGF5TmFtZTogJ0FkYXB0SHInLFxuICByZW5kZXI6IGZ1bmN0aW9uKCApIHtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImVsZW1lbnRfX2hyXCJ9KVxuICAgICk7XG4gIH1cbn07XG5cbmFkYXB0LmNvbXBvbmVudCgnaHInLCBBZGFwdEhyKTtcbiIsInZhciBhZGFwdCA9IHJlcXVpcmUoJy4uL2FwaS9jb3JlJyk7XG5cbnZhciBBZGFwdElucHV0ID0ge1xuICBleHRlbmQ6IFthZGFwdC5taXhpbnMuZmxhdF0sXG4gIGRpc3BsYXlOYW1lOiAnQWRhcHRJbnB1dCcsXG4gIHJlbmRlcjogZnVuY3Rpb24oICkge1xuICAgIHZhciBtb2RlbCA9ICcnO1xuICAgIGlmKCB0aGlzLnByb3BzLmNvbmZpZy5tb2RlbFt0aGlzLnByb3BzLmNvbmZpZy5uYW1lXSApIHtcbiAgICAgIG1vZGVsID0gdGhpcy5wcm9wcy5jb25maWcubW9kZWxbdGhpcy5wcm9wcy5jb25maWcubmFtZV0udmFsdWU7XG4gICAgfVxuICAgIHZhciBtb2RlbENsYXNzID0gJyc7XG4gICAgaWYoIHRoaXMucHJvcHMuY29uZmlnLm1vZGVsW3RoaXMucHJvcHMuY29uZmlnLm5hbWVdICkge1xuICAgICAgbW9kZWxDbGFzcyA9IHRoaXMucHJvcHMuY29uZmlnLm1vZGVsW3RoaXMucHJvcHMuY29uZmlnLm5hbWVdLm1vZGVsO1xuICAgIH1cbiAgICB2YXIgdHlwZSA9IHRoaXMuc3RhdGUudHlwZTtcbiAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuY29uZmlnLml0ZW07XG5cbiAgICB2YXIgY29udHJvbGxlciA9IHt9O1xuICAgIGlmKCB0aGlzLnByb3BzLmNvbmZpZy5jb250cm9sbGVyICYmIHRoaXMucHJvcHMuY29uZmlnLmNvbnRyb2xsZXJbIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgXSApIHtcbiAgICAgIGNvbnRyb2xsZXIgPSB0aGlzLnByb3BzLmNvbmZpZy5jb250cm9sbGVyWyB0aGlzLnByb3BzLmNvbmZpZy5uYW1lIF07XG4gICAgfVxuXG4gICAgdmFyIGxhYmVsID0gYWRhcHQuY29tcG9uZW50KCdsYWJlbCcpO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogIG1vZGVsQ2xhc3MgKyAnIGZpZWxkIGZpZWxkX19pbnB1dCcgKyAoIHR5cGVvZiBpdGVtLmRlc2MgPT09ICd1bmRlZmluZWQnID8gJycgOiAnIGhhcy1kZXNjJyksICdkYXRhLWxvY2F0b3InOiAgdGhpcy5wcm9wcy5jb25maWcubmFtZVRyYWlsICsgdGhpcy5wcm9wcy5jb25maWcubmFtZSArICctY29udGFpbmVyJ30sIFxuICAgICAgICBcbiAgICAgICAgICB0eXBlb2YgaXRlbS5sYWJlbCA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6XG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChhZGFwdC5jb21wb25lbnRzLmxhYmVsLCB7Y29uZmlnOiAgeyBpdGVtOiBpdGVtfSwgYWRhcHQ6ICB0aGlzLnByb3BzLmFkYXB0fSksIFxuICAgICAgICAgIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGRfX2lucHV0LS1jb250YWluZXJcIn0sIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7dmFsdWU6IG1vZGVsLCBhdXRvQ29tcGxldGU6IFwib2ZmXCIsIHR5cGU6IFwidGV4dFwiLCBvbkNoYW5nZTogIHRoaXMuaGFuZGxlQ2hhbmdlLCBwbGFjZWhvbGRlcjogIGl0ZW0ucGxhY2Vob2xkZXIsIGRpc2FibGVkOiAgY29udHJvbGxlci5kaXNhYmxlZCwgJ2RhdGEtbG9jYXRvcic6ICB0aGlzLnByb3BzLmNvbmZpZy5uYW1lVHJhaWwgKyB0aGlzLnByb3BzLmNvbmZpZy5uYW1lfSksIFxuICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZW9mIGl0ZW0uZGVzYyA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6XG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KGFkYXB0LmNvbXBvbmVudHMuZGVzY3JpcHRpb24sIHtjb25maWc6ICB7IGl0ZW06IGl0ZW19LCBhZGFwdDogIHRoaXMucHJvcHMuYWRhcHR9KVxuICAgICAgICAgICAgXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG59O1xuXG5hZGFwdC5jb21wb25lbnQoJ2lucHV0JywgQWRhcHRJbnB1dCk7XG4iLCJ2YXIgVXRpbHMgPSByZXF1aXJlKCcuLi9hcGkvdXRpbHMnKTtcbnZhciBhZGFwdCA9IHJlcXVpcmUoJy4uL2FwaS9jb3JlJyk7XG5cbnZhciBBZGFwdElucHV0RGF0ZSA9IHtcbiAgZXh0ZW5kOiBbYWRhcHQubWl4aW5zLmZsYXRdLFxuICBkaXNwbGF5TmFtZTogJ0FkYXB0SW5wdXREYXRlJyxcbiAgc2V0U3RhdHVzOiBmdW5jdGlvbiggdmFsdWUgKSB7XG4gICAgdmFyIGNvbnRyb2xsZXIgPSB7fTtcbiAgICBpZiggdGhpcy5wcm9wcy5jb25maWcuY29udHJvbGxlciAmJiB0aGlzLnByb3BzLmNvbmZpZy5jb250cm9sbGVyWyB0aGlzLnByb3BzLmNvbmZpZy5uYW1lIF0gKSB7XG4gICAgICBjb250cm9sbGVyID0gdGhpcy5wcm9wcy5jb25maWcuY29udHJvbGxlclsgdGhpcy5wcm9wcy5jb25maWcubmFtZSBdO1xuICAgIH1cblxuICAgIGlmKCBjb250cm9sbGVyLmRpc2FibGVkICkge1xuICAgICAgdmFsdWUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtvcGVuOiB2YWx1ZX0pO1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGF5czogWydTdW4nLCAnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaScsICdTYXQnXVxuICAgIH07XG4gIH0sXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiggKSB7XG4gICAgdGhpcy5pZCA9IE1hdGgucmFuZG9tKCkgKiAxMDA7XG5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICBpZiggIVV0aWxzLmZpbmRDbG9zZXN0UGFyZW50KGUudGFyZ2V0LCAnZmllbGRfX2lucHV0ZGF0ZS0tJyArIHRoYXQuc3RhdGUubmFtZSArIHRoYXQuaWQpICkge1xuICAgICAgICBpZiggdGhhdC5zdGF0ZS5vcGVuICkge1xuICAgICAgICAgIHRoYXQuc2V0U3RhdHVzKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBoYW5kbGVDaGFuZ2U6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIERBVEVfUkVHRVhQID0gL14oWzAtOV17Mn0pXFwvKFswLTldezJ9KVxcLyhbMC05XXs0fSkkLztcblxuICAgIHZhciB2YWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcblxuICAgIGlmKCBEQVRFX1JFR0VYUC50ZXN0KHZhbHVlICkgKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlLnNwbGl0KCcvJyk7XG4gICAgICB2YXIgZGF5ID0gdmFsdWVbMF07XG4gICAgICB2YXIgbW9udGggPSB2YWx1ZVsxXTtcbiAgICAgIHZhciB5ZWFyID0gdmFsdWVbMl07XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBtb2RlbDogbmV3IERhdGUoeWVhciwgbW9udGggLSAxLCBkYXkpLmdldFRpbWUoKSxcbiAgICAgICAgdGVtcFZhbHVlOiB0aGlzLmZvcm1hdFRpbWUobmV3IERhdGUoeWVhciwgbW9udGggLSAxLCBkYXkpLmdldFRpbWUoKSksXG4gICAgICAgIGN1cnJlbnREYXRlOiBuZXcgRGF0ZSh5ZWFyLCBtb250aCAtIDEsIDEpXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5wcm9wcy5jb25maWcubW9kZWxbIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgXS52YWx1ZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoIC0gMSwgZGF5KS5nZXRUaW1lKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBtb2RlbDogJycsXG4gICAgICAgIHRlbXBWYWx1ZTogdmFsdWVcbiAgICAgIH0pO1xuICAgICAgdGhpcy5wcm9wcy5jb25maWcubW9kZWxbIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgXS52YWx1ZSA9ICcnO1xuICAgIH1cblxuICAgIHRoaXMucHJvcHMuYWRhcHQub2JzZXJ2ZS5kaWdlc3QoKTtcbiAgfSxcbiAgcGFyc2VNb250aDogZnVuY3Rpb24obW9udGgsIHllYXIpIHtcbiAgICB2YXIgZGF5c0luTW9udGggPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCArIDEsIDApLmdldERhdGUoKTtcbiAgICB2YXIgZmlyc3REYXkgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSkuZ2V0RGF5KCk7XG4gICAgdmFyIGxhc3RNb250aCA9IG5ldyBEYXRlKHllYXIgLSAobW9udGggPT09IDAgPyAxIDogMCksIChtb250aCA9PT0gMCA/IDExIDogbW9udGggLSAxKSArIDEsIDApO1xuICAgIHZhciBuZXh0TW9udGggPSBuZXcgRGF0ZSh5ZWFyICsgKG1vbnRoID09PSAxMSA/IDEgOiAwKSwgKG1vbnRoID09PSAxMSA/IDAgOiBtb250aCArIDEpLCAxKTtcbiAgICB2YXIgbGFzdCA9IGZpcnN0RGF5O1xuICAgIHZhciBuZXh0TW9udGhEYXlzO1xuICAgIHZhciBkYXlzID0ge307XG5cbiAgICB0aGlzLnN0YXRlLmRhdGUubmV4dE1vbnRoID0ge1xuICAgICAgbW9udGg6IG5leHRNb250aC5nZXRNb250aCgpLFxuICAgICAgeWVhcjogbmV4dE1vbnRoLmdldEZ1bGxZZWFyKClcbiAgICB9O1xuICAgIHRoaXMuc3RhdGUuZGF0ZS5sYXN0TW9udGggPSB7XG4gICAgICBtb250aDogbGFzdE1vbnRoLmdldE1vbnRoKCksXG4gICAgICB5ZWFyOiBsYXN0TW9udGguZ2V0RnVsbFllYXIoKVxuICAgIH07XG5cbiAgICB2YXIgbW9udGggPSB0aGlzLnN0YXRlLmN1cnJlbnREYXRlID8gdGhpcy5zdGF0ZS5jdXJyZW50RGF0ZS5nZXRNb250aCgpIDogbmV3IERhdGUodGhpcy5zdGF0ZS50b2RheSkuZ2V0TW9udGgoKTtcblxuICAgIHRoaXMuc3RhdGUuZGF0ZS5kaXNwbGF5TW9udGggPSB0aGlzLm1vbnRoc1ttb250aF07XG4gICAgdGhpcy5zdGF0ZS5kYXRlLmRpc3BsYXlZZWFyID0geWVhcjtcblxuICAgIGZvciAodmFyIGogPSBsYXN0OyBqLS07KSB7XG4gICAgICB2YXIgZGF5ID0ge1xuICAgICAgICBkYXk6IGxhc3RNb250aC5nZXREYXRlKCkgLSBqLFxuICAgICAgICB5ZWFyOiBsYXN0TW9udGguZ2V0RnVsbFllYXIoKSxcbiAgICAgICAgbW9udGg6IGxhc3RNb250aC5nZXRNb250aCgpLFxuICAgICAgfTtcblxuICAgICAgZGF5c1snZGF5LScgKyBkYXkuZGF5ICsgJy0nICsgZGF5Lm1vbnRoXSA9IChcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImxpXCIsIHtvbkNsaWNrOiAgdGhpcy5jaGFuZ2VEYXRlLmJpbmQodGhpcywgZGF5KSB9LCBcbiAgICAgICAgICAgbGFzdE1vbnRoLmdldERhdGUoKSAtIGpcbiAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF5c0luTW9udGg7IGkrKykge1xuICAgICAgdmFyIHRpbWVzdGFtcCA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCBpICsgMSkuZ2V0VGltZSgpO1xuXG4gICAgICB2YXIgZGF5ID0ge1xuICAgICAgICBkYXk6IGkgKyAxLFxuICAgICAgICB0b2RheTogdGltZXN0YW1wID09PSB0aGlzLnN0YXRlLnRvZGF5LFxuICAgICAgICB5ZWFyOiB5ZWFyLFxuICAgICAgICBtb250aDogbW9udGgsXG4gICAgICAgIHRpbWVzdGFtcDogdGltZXN0YW1wLFxuICAgICAgICBjdXJyZW50TW9udGg6IHRydWVcbiAgICAgIH07XG5cbiAgICAgIGRheXNbJ2RheS0nICsgZGF5LmRheSArICctJyArIGRheS5tb250aF0gPSAoXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsaVwiLCB7XG4gICAgICAgICAgb25DbGljazogIHRoaXMuY2hhbmdlRGF0ZS5iaW5kKHRoaXMsIGRheSksIFxuICAgICAgICAgIGNsYXNzTmFtZTogICggZGF5LnRvZGF5ID8gJ3RvZGF5ICcgOiAnJyApICsgJ21vbnRoJyArICggdGltZXN0YW1wID09IHRoaXMuc3RhdGUubW9kZWwgPyAnIHNlbGVjdGVkJyA6ICcnKSB9LCBcbiAgICAgICAgICAgZGF5LmRheVxuICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgdmFyIGxlbmd0aCA9IE9iamVjdC5rZXlzKGRheXMpLmxlbmd0aDtcblxuICAgIG5leHRNb250aERheXMgPSAoTWF0aC5jZWlsKGxlbmd0aCAvIDcpICogNykgLSBsZW5ndGg7XG5cbiAgICBmb3IgKHZhciB6ID0gMDsgeiA8IG5leHRNb250aERheXM7IHorKykge1xuXG4gICAgICB2YXIgZGF5ID0ge1xuICAgICAgICBkYXk6IHogKyAxLFxuICAgICAgICB5ZWFyOiBuZXh0TW9udGguZ2V0RnVsbFllYXIoKSxcbiAgICAgICAgbW9udGg6IG5leHRNb250aC5nZXRNb250aCgpXG4gICAgICB9O1xuXG4gICAgICBkYXlzWydkYXktJyArIGRheS5kYXkgKyAnLScgKyBkYXkubW9udGhdID0gKFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwibGlcIiwge29uQ2xpY2s6ICB0aGlzLmNoYW5nZURhdGUuYmluZCh0aGlzLCBkYXkpIH0sIFxuICAgICAgICAgICB6ICsgMVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBkYXlzO1xuXG4gIH0sXG4gIGNoYW5nZU1vbnRoOiBmdW5jdGlvbiggbW9udGgsIHllYXIgKSB7XG4gICAgdGhpcy5wYXJzZU1vbnRoKG1vbnRoLCB5ZWFyKTtcbiAgICB0aGlzLnNldFN0YXRlKHtjdXJyZW50RGF0ZTogbmV3IERhdGUoeWVhciwgbW9udGgsIDEpfSk7XG4gIH0sXG4gIGNoYW5nZURhdGU6IGZ1bmN0aW9uKCBkYXkgKSB7XG4gICAgaWYoIGRheSAmJiBkYXkuZGF5ICkge1xuICAgICAgdGhpcy5zdGF0ZS5tb2RlbCA9IG5ldyBEYXRlKGRheS55ZWFyLCBkYXkubW9udGgsIGRheS5kYXkpLmdldFRpbWUoKTtcbiAgICAgIHRoaXMuc3RhdGUub3BlbiA9IGZhbHNlO1xuICAgICAgdGhpcy5zdGF0ZS50ZW1wVmFsdWUgPSB0aGlzLmZvcm1hdFRpbWUodGhpcy5zdGF0ZS5tb2RlbCk7XG5cbiAgICAgIHRoaXMucHJvcHMuY29uZmlnLm1vZGVsWyB0aGlzLnByb3BzLmNvbmZpZy5uYW1lIF0udmFsdWUgPSB0aGlzLnN0YXRlLm1vZGVsO1xuICAgICAgdGhpcy5wcm9wcy5hZGFwdC5vYnNlcnZlLmRpZ2VzdCgpO1xuICAgIH1cbiAgICB0aGlzLmNoYW5nZU1vbnRoKGRheS5tb250aCwgZGF5LnllYXIpO1xuICB9LFxuICBmb3JtYXRUaW1lOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhbHVlID0gbmV3IERhdGUodmFsdWUpO1xuICAgIHJldHVybiAoJzAnICsgdmFsdWUuZ2V0RGF0ZSgpKS5zbGljZSgtMikgKyAnLycgKyAoJzAnICsgKHZhbHVlLmdldE1vbnRoKCkrMSkpLnNsaWNlKC0yKSArICcvJyArIHZhbHVlLmdldEZ1bGxZZWFyKCk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oICkge1xuICAgIHZhclxuICAgICAgdmFsdWUgPSB0aGlzLnN0YXRlLm1vZGVsLFxuICAgICAgdHlwZSA9IHRoaXMuc3RhdGUudHlwZSxcbiAgICAgIGl0ZW0gPSB0aGlzLnN0YXRlLml0ZW07XG5cbiAgICBpZiggdmFsdWUgJiYgIXRoaXMuc3RhdGUudGVtcFZhbHVlICkge1xuICAgICAgdGhpcy5zdGF0ZS50ZW1wVmFsdWUgPSB0aGlzLmZvcm1hdFRpbWUodmFsdWUpO1xuICAgIH1cblxuICAgIHZhciBjb250cm9sbGVyID0ge307XG4gICAgaWYoIHRoaXMucHJvcHMuY29uZmlnLmNvbnRyb2xsZXIgJiYgdGhpcy5wcm9wcy5jb25maWcuY29udHJvbGxlclsgdGhpcy5wcm9wcy5jb25maWcubmFtZSBdICkge1xuICAgICAgY29udHJvbGxlciA9IHRoaXMucHJvcHMuY29uZmlnLmNvbnRyb2xsZXJbIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgXTtcbiAgICB9XG5cbiAgICB0aGlzLnN0YXRlLm9wZW4gPSB0aGlzLnN0YXRlLm9wZW4gfHwgZmFsc2U7XG5cbiAgICB0aGlzLnN0YXRlLmRhdGUgPSB7fTtcblxuICAgIHRoaXMubW9udGhzID0gW1xuICAgICAnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsXG4gICAgICdKdWx5JywnQXVndXN0JywnU2VwdGVtYmVyJywnT2N0b2JlcicsJ05vdmVtYmVyJywnRGVjZW1iZXInXG4gICAgXTtcblxuICAgIHRoaXMuc3RhdGUudG9kYXkgPSBuZXcgRGF0ZSgpO1xuXG4gICAgdGhpcy5zdGF0ZS50b2RheSA9IG5ldyBEYXRlKHRoaXMuc3RhdGUudG9kYXkuZ2V0RnVsbFllYXIoKSwgdGhpcy5zdGF0ZS50b2RheS5nZXRNb250aCgpLCB0aGlzLnN0YXRlLnRvZGF5LmdldERhdGUoKSkuZ2V0VGltZSgpO1xuXG4gICAgaWYoIHZhbHVlICkge1xuICAgICAgdmFyIGEgPSBuZXcgRGF0ZSh2YWx1ZSk7XG4gICAgICB0aGlzLnN0YXRlLm1vZGVsID0gbmV3IERhdGUoYS5nZXRGdWxsWWVhcigpLCBhLmdldE1vbnRoKCksIGEuZ2V0RGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0ZS5jdXJyZW50RGF0ZSA9IHZhbHVlIHx8IHRoaXMuc3RhdGUuY3VycmVudERhdGUgPyAoIHRoaXMuc3RhdGUuY3VycmVudERhdGUgfHwgbmV3IERhdGUodmFsdWUpICkgOiBmYWxzZTtcblxuICAgIHZhciBtb250aCA9IHRoaXMuc3RhdGUuY3VycmVudERhdGUgPyB0aGlzLnN0YXRlLmN1cnJlbnREYXRlLmdldE1vbnRoKCkgOiBuZXcgRGF0ZSh0aGlzLnN0YXRlLnRvZGF5KS5nZXRNb250aCgpO1xuICAgIHZhciB5ZWFyID0gdGhpcy5zdGF0ZS5jdXJyZW50RGF0ZSA/IHRoaXMuc3RhdGUuY3VycmVudERhdGUuZ2V0RnVsbFllYXIoKSA6IG5ldyBEYXRlKHRoaXMuc3RhdGUudG9kYXkpLmdldEZ1bGxZZWFyKCk7XG5cbiAgICB0aGlzLnN0YXRlLmRhdGUubGFzdE1vbnRoID0ge307XG4gICAgdGhpcy5zdGF0ZS5kYXRlLm5leHRNb250aCA9IHt9O1xuICAgIHRoaXMuc3RhdGUuZGF0ZS5kYXlzID0gdGhpcy5wYXJzZU1vbnRoKG1vbnRoLCB5ZWFyKTtcbiAgICB0aGlzLnN0YXRlLmRhdGUuZGlzcGxheU1vbnRoID0gdGhpcy5tb250aHNbbW9udGhdO1xuICAgIHRoaXMuc3RhdGUuZGF0ZS5kaXNwbGF5WWVhciA9IHllYXI7XG5cbiAgICBmdW5jdGlvbiBkYXlzICh2YWx1ZSwgaW5kZXgpIHtcbiAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFwibGlcIiwge2tleTogaW5kZXggfSwgdmFsdWUgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiAnZmllbGQgZmllbGRfX2lucHV0ZGF0ZSBmaWVsZF9faW5wdXQgZmllbGRfX2lucHV0ZGF0ZS0tJyArIHRoaXMuc3RhdGUubmFtZSArIHRoaXMuaWQsICdkYXRhLWxvY2F0b3InOiAgdGhpcy5wcm9wcy5jb25maWcubmFtZVRyYWlsICsgdGhpcy5wcm9wcy5jb25maWcubmFtZSArICctY29udGFpbmVyJ30sIFxuICAgICAgICBcbiAgICAgICAgICB0eXBlb2YgaXRlbS5sYWJlbCA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6XG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChhZGFwdC5jb21wb25lbnRzLmxhYmVsLCB7Y29uZmlnOiAgeyBpdGVtOiBpdGVtfSwgYWRhcHQ6ICB0aGlzLnByb3BzLmFkYXB0fSksIFxuICAgICAgICAgIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6ICAoIHRoaXMuc3RhdGUub3BlbiA/ICdvcGVuICcgOiAnJyApICsgJ2ZpZWxkX19pbnB1dGRhdGUtLWNvbnRhaW5lcid9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwgeydkYXRhLWxvY2F0b3InOiAgdGhpcy5wcm9wcy5jb25maWcubmFtZVRyYWlsICsgdGhpcy5wcm9wcy5jb25maWcubmFtZSwgb25Gb2N1czogIHRoaXMuc2V0U3RhdHVzLmJpbmQodGhpcywgdHJ1ZSksIHZhbHVlOiAgdGhpcy5zdGF0ZS50ZW1wVmFsdWUsIHR5cGU6IFwidGV4dFwiLCBvbkNoYW5nZTogIHRoaXMuaGFuZGxlQ2hhbmdlLCBwbGFjZWhvbGRlcjogXCJkZC9tbS95eXl5XCIsIG9uQ2xpY2s6ICB0aGlzLnNldFN0YXR1cy5iaW5kKHRoaXMsIHRydWUpLCBkaXNhYmxlZDogIGNvbnRyb2xsZXIuZGlzYWJsZWR9KSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS1jYWxlbmRhciBuby1zZWxlY3RcIiwgb25DbGljazogIHRoaXMuc2V0U3RhdHVzLmJpbmQodGhpcywgIXRoaXMuc3RhdGUub3BlbikgfSksIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJpbnB1dGRhdGVfX2Ryb3Bkb3duIG5vLXNlbGVjdFwifSwgXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiaW5wdXRkYXRlX19kcm9wZG93bi0taGVhZGVyXCJ9LCBcbiAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS1jaGV2cm9uLWxlZnRcIiwgb25DbGljazogIHRoaXMuY2hhbmdlRGF0ZS5iaW5kKHRoaXMsIHRoaXMuc3RhdGUuZGF0ZS5sYXN0TW9udGgpIH0pLCBcbiAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS1jaGV2cm9uLXJpZ2h0XCIsIG9uQ2xpY2s6ICB0aGlzLmNoYW5nZURhdGUuYmluZCh0aGlzLCB0aGlzLnN0YXRlLmRhdGUubmV4dE1vbnRoKSB9KSwgXG4gICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXG4gICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuZGF0ZS5kaXNwbGF5TW9udGggKyAnICcgKyB0aGlzLnN0YXRlLmRhdGUuZGlzcGxheVllYXJcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwidWxcIiwge2NsYXNzTmFtZTogXCJpbnB1dGRhdGVfX2RheXNcIn0sIFxuICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5kYXlzLm1hcChkYXlzKSBcbiAgICAgICAgICAgICksIFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInVsXCIsIHtjbGFzc05hbWU6IFwiaW5wdXRkYXRlX19saXN0XCJ9LCBcbiAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuZGF0ZS5kYXlzXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgXG4gICAgICAgICAgICB0eXBlb2YgaXRlbS5kZXNjID09PSAndW5kZWZpbmVkJyA/ICcnIDpcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoYWRhcHQuY29tcG9uZW50cy5kZXNjcmlwdGlvbiwge2NvbmZpZzogIHsgaXRlbTogaXRlbX0sIGFkYXB0OiAgdGhpcy5wcm9wcy5hZGFwdH0pXG4gICAgICAgICAgXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG59O1xuXG5hZGFwdC5jb21wb25lbnQoJ2lucHV0RGF0ZScsIEFkYXB0SW5wdXREYXRlKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vYXBpL3V0aWxzJyk7XG52YXIgYWRhcHQgPSByZXF1aXJlKCcuLi9hcGkvY29yZScpO1xuXG52YXIgQWRhcHRJdGVtID0ge1xuICBkaXNwbGF5TmFtZTogJ0FkYXB0SXRlbScsXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBpdGVtID0gdGhpcy5wcm9wcy5jb25maWcuaXRlbTtcblxuICAgIHZhciBkeW5hbWljSXRlbSA9IGFkYXB0LmNvbXBvbmVudChpdGVtLnR5cGUuc3BsaXQoJzonKVswXSk7XG5cbiAgICB2YXIgcG9zc2libGVJdGVtID0gdXRpbHMuY29udmVydFRvQ2FtZWxDYXNlKGl0ZW0udHlwZSk7XG5cbiAgICBpZiggYWRhcHQuY29tcG9uZW50c1twb3NzaWJsZUl0ZW1dICkge1xuICAgICAgZHluYW1pY0l0ZW0gPSBhZGFwdC5jb21wb25lbnQocG9zc2libGVJdGVtKTtcbiAgICB9XG5cbiAgICB0aGlzLnByb3BzLmNvbmZpZy5pdGVtLmZ1bGxOYW1lID0gdGhpcy5wcm9wcy5jb25maWcubmFtZVRyYWlsICsgdGhpcy5wcm9wcy5jb25maWcubmFtZTtcblxuICAgIHJldHVybiB0aGlzLnRyYW5zZmVyUHJvcHNUbyggZHluYW1pY0l0ZW0oKSApO1xuICB9XG59O1xuXG5hZGFwdC5jb21wb25lbnQoJ2l0ZW0nLCBBZGFwdEl0ZW0pO1xuIiwidmFyIGFkYXB0ID0gcmVxdWlyZSgnLi4vYXBpL2NvcmUnKTtcblxudmFyIEFkYXB0TGFiZWwgPSB7XG4gIGRpc3BsYXlOYW1lOiAnQWRhcHRMYWJlbCcsXG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oICkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuY29uZmlnLml0ZW07XG4gICAgdGhpcy5saXN0ZW5lciA9IHRoaXMucHJvcHMuYWRhcHQub2JzZXJ2ZS5hZGRMaXN0ZW5lcihmdW5jdGlvbiggKSB7XG4gICAgICByZXR1cm4gaXRlbS5sYWJlbDtcbiAgICB9LCBmdW5jdGlvbiggbmV3VmFsLCBvbGRWYWwgKSB7XG4gICAgICB0aGF0LnNldFN0YXRlKHt0ZXh0OiBuZXdWYWx9KTtcbiAgICB9KTtcbiAgfSxcbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmxpc3RlbmVyKCk7XG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICByZXR1cm4ge1xuICAgICAgdGV4dDogY29uZmlnLml0ZW0ubGFiZWxcbiAgICB9O1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcImg0XCIsIHtjbGFzc05hbWU6IFwibGFiZWxcIn0sICB0aGlzLnByb3BzLmNvbmZpZy5pdGVtLmxhYmVsKTtcbiAgfVxufTtcblxuYWRhcHQuY29tcG9uZW50KCdsYWJlbCcsIEFkYXB0TGFiZWwpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdmlldyAgPSByZXF1aXJlKCcuLi9hcGkvdmlldycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vYXBpL3V0aWxzJyk7XG52YXIgYWRhcHQgPSByZXF1aXJlKCcuLi9hcGkvY29yZScpO1xuXG52YXIgQWRhcHRMb29wID0ge1xuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGlzdGVuZXJzOiBbXSxcbiAgICAgIGN1cnJlbnRTdGF0ZTogdGhpcy5wcm9wcy5hZGFwdC5zdGF0ZVxuICAgIH07XG4gIH0sXG4gIGRpc3BsYXlOYW1lOiAnQWRhcHRMb29wJyxcbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLnN0YXRlLmxpc3RlbmVycy5wdXNoKFxuICAgICAgdGhpcy5wcm9wcy5hZGFwdC5vYnNlcnZlLmFkZExpc3RlbmVyKCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLnByb3BzLmFkYXB0LnN0YXRlO1xuICAgICAgfSwgZnVuY3Rpb24gKCBuZXdWYWwgKSB7XG4gICAgICAgIF90aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBjdXJyZW50U3RhdGU6IG5ld1ZhbFxuICAgICAgICB9KTtcbiAgICAgIH0gKVxuICAgICk7XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zdGF0ZS5saXN0ZW5lcnMuZm9yRWFjaCggZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG4gICAgICBlbGVtZW50KCk7XG4gICAgfSApO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaXRlbXMgPSB0aGlzLnByb3BzLml0ZW1zO1xuICAgIHZhciBjb250cm9sbGVyID0gdGhpcy5wcm9wcy5jb250cm9sbGVyO1xuICAgIHZhciB2YWx1ZXMgPSB0aGlzLnByb3BzLnZhbHVlcztcbiAgICB2YXIgbmFtZVRyYWlsID0gdGhpcy5wcm9wcy5uYW1lVHJhaWw7XG4gICAgdmFyIG9ic2VydmUgPSB0aGlzLnByb3BzLm9ic2VydmU7XG4gICAgdmFyIG1vZGVsID0gdGhpcy5wcm9wcy5tb2RlbDtcblxuICAgIHZhciByZW5kZXIgPSBbXTtcblxuICAgIHZhciBkeW5hbWljSXRlbSA9IGFkYXB0LmNvbXBvbmVudHMuaXRlbTtcbiAgICB2YXIgY3VycmVudFN0YXRlID0gdGhpcy5zdGF0ZS5jdXJyZW50U3RhdGU7XG5cbiAgICBmb3IoIHZhciBpIGluIGl0ZW1zICkge1xuICAgICAgdmFyIHNob3cgPSB0cnVlO1xuICAgICAgdmFyIGl0ZW0gPSBpdGVtc1tpXTtcblxuICAgICAgaWYoIHV0aWxzLmNoZWNrU3RhdGUoIGl0ZW0uc3RhdGUsIGN1cnJlbnRTdGF0ZSApICkge1xuICAgICAgICByZW5kZXIucHVzaChcbiAgICAgICAgICB0aGlzLnRyYW5zZmVyUHJvcHNUbyhcbiAgICAgICAgICAgIGR5bmFtaWNJdGVtKCB7XG4gICAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIG1vZGVsOiBtb2RlbCxcbiAgICAgICAgICAgICAgICBuYW1lOiBpLFxuICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlcixcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICBvYnNlcnZlOiBvYnNlcnZlLFxuICAgICAgICAgICAgICAgIG5hbWVUcmFpbDogbmFtZVRyYWlsXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCByZW5kZXIgKTtcbiAgfVxufTtcblxuYWRhcHQuY29tcG9uZW50KCdsb29wJywgQWRhcHRMb29wKTtcbiIsInZhciBhZGFwdCA9IHJlcXVpcmUoJy4uL2FwaS9jb3JlJyk7XG52YXIgVXRpbHMgPSByZXF1aXJlKCcuLi9hcGkvdXRpbHMnKTtcblxudmFyIEFkYXB0UmFkaW8gPSB7XG4gIGV4dGVuZDogW2FkYXB0Lm1peGlucy5mbGF0XSxcbiAgZGlzcGxheU5hbWU6ICdBZGFwdFJhZGlvJyxcbiAgcmVuZGVyOiBmdW5jdGlvbiggKSB7XG4gICAgdmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG4gICAgdmFyXG4gICAgICBtb2RlbCA9IHRoaXMuc3RhdGUubW9kZWwsXG4gICAgICB0eXBlID0gdGhpcy5zdGF0ZS50eXBlLFxuICAgICAgaXRlbSA9IHRoaXMucHJvcHMuY29uZmlnLml0ZW07XG5cbiAgICB2YXIgbmFTZWxlY3RlZCA9IHRoaXMuc3RhdGUubmEgfHwgIW1vZGVsLmxlbmd0aDtcblxuICAgIHZhciBjb250cm9sbGVyID0ge307XG4gICAgaWYoIHRoaXMucHJvcHMuY29uZmlnLmNvbnRyb2xsZXIgJiYgdGhpcy5wcm9wcy5jb25maWcuY29udHJvbGxlclsgdGhpcy5wcm9wcy5jb25maWcubmFtZSBdICkge1xuICAgICAgY29udHJvbGxlciA9IHRoaXMucHJvcHMuY29uZmlnLmNvbnRyb2xsZXJbIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgXTtcbiAgICB9XG5cbiAgICB2YXIgbGFiZWwgPSBhZGFwdC5jb21wb25lbnQoJ2xhYmVsJyk7XG5cbiAgICB2YXIgY2hlY2tib3hlcyA9IFtdO1xuICAgIHZhciBpdGVtcyA9IGl0ZW0ub3B0aW9ucztcblxuICAgIGlmKCBpdGVtLmluY2x1ZGVOQSApIHtcbiAgICAgIHZhciBjbGFzc2VzID0gY3goe1xuICAgICAgICAnZmllbGRfX3JhZGlvLS1pdGVtJzogdHJ1ZSxcbiAgICAgICAgJ2ZpZWxkX19yYWRpby0tYWN0aXZlJzogbmFTZWxlY3RlZFxuICAgICAgICB9KTtcblxuICAgICAgY2hlY2tib3hlcy5wdXNoKFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IGNsYXNzZXMsIGtleTogXCJuYVwiLCBvbkNsaWNrOiAgdGhpcy50b2dnbGVOQX0sIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IFwiZmEgZmEtZncgZmEtY2lyY2xlXCJ9KSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS1mdyBmYS1jaXJjbGUtb1wifSksIFxuXG4gICAgICAgICAgXCJOL0FcIlxuICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZm9yKCB2YXIgaSBpbiBpdGVtcyApIHtcbiAgICAgIHZhciBjbGFzc2VzID0gY3goe1xuICAgICAgICAnZmllbGRfX3JhZGlvLS1pdGVtJzogdHJ1ZSxcbiAgICAgICAgJ2ZpZWxkX19yYWRpby0tYWN0aXZlJzogbW9kZWwgPT09IGksXG4gICAgICAgICdmaWVsZF9fcmFkaW8tLWRpc2FibGVkJzogY29udHJvbGxlci5kaXNhYmxlZFxuICAgICAgICB9KTtcblxuXG4gICAgICBjaGVja2JveGVzLnB1c2goXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgeydkYXRhLWxvY2F0b3InOiAgdGhpcy5wcm9wcy5jb25maWcubmFtZVRyYWlsICsgdGhpcy5wcm9wcy5jb25maWcubmFtZSArICctcmFkaW8tJyArIGksIGNsYXNzTmFtZTogY2xhc3Nlcywga2V5OiAgdGhpcy5wcm9wcy5jb25maWcubmFtZSArIGksIG9uQ2xpY2s6ICAhY29udHJvbGxlci5kaXNhYmxlZCA/IHRoaXMuaGFuZGxlQ2hhbmdlLmJpbmQodGhpcywgeyB0YXJnZXQ6IHsgdmFsdWU6IGkgfSB9ICkgOiBmdW5jdGlvbigpe319LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLWZ3IGZhLWNpcmNsZS1vXCJ9KSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS1mdyBmYS1jaGVjay1jaXJjbGVcIn0pLCBcbiAgICAgICAgICAgaXRlbXNbaV0gXG4gICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImZpZWxkIGZpZWxkX19yYWRpb1wiLCAnZGF0YS1sb2NhdG9yJzogIHRoaXMucHJvcHMuY29uZmlnLm5hbWVUcmFpbCArIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgKyAnLWNvbnRhaW5lcid9LCBcbiAgICAgICAgXG4gICAgICAgICAgdHlwZW9mIGl0ZW0ubGFiZWwgPT09ICd1bmRlZmluZWQnID8gJycgOlxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoYWRhcHQuY29tcG9uZW50cy5sYWJlbCwge2NvbmZpZzogIHsgaXRlbTogaXRlbX0sIGFkYXB0OiAgdGhpcy5wcm9wcy5hZGFwdH0pLCBcbiAgICAgICAgICBcbiAgICAgICAgY2hlY2tib3hlcywgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJmaWVsZF9fcmFkaW8tLWNvbnRhaW5lclwifSwgXG5cbiAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGVvZiBpdGVtLmRlc2MgPT09ICd1bmRlZmluZWQnID8gJycgOlxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChhZGFwdC5jb21wb25lbnRzLmRlc2NyaXB0aW9uLCB7Y29uZmlnOiAgeyBpdGVtOiBpdGVtfSwgYWRhcHQ6ICB0aGlzLnByb3BzLmFkYXB0fSlcbiAgICAgICAgICAgIFxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxufTtcblxuYWRhcHQuY29tcG9uZW50KCdyYWRpbycsIEFkYXB0UmFkaW8pO1xuIiwidmFyIFV0aWxzID0gcmVxdWlyZSgnLi4vYXBpL3V0aWxzJyk7XG52YXIgYWRhcHQgPSByZXF1aXJlKCcuLi9hcGkvY29yZScpO1xuXG52YXIgQWRhcHRTZWxlY3QgPSB7XG4gIGRpc3BsYXlOYW1lOiAnQWRhcHRTZWxlY3QnLFxuICBleHRlbmQ6IFthZGFwdC5taXhpbnMuZmxhdF0sXG4gIGhhbmRsZUNsaWNrOiBmdW5jdGlvbihpKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7bW9kZWw6IHRoaXMuc3RhdGUuaXRlbS5vcHRpb25zW2ldLnZhbHVlLCBvcGVuOiBmYWxzZX0pO1xuXG4gICAgdGhpcy5wcm9wcy5jb25maWcubW9kZWxbIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgXS52YWx1ZSA9IHRoaXMuc3RhdGUuaXRlbS5vcHRpb25zW2ldLnZhbHVlO1xuICAgIHRoaXMucHJvcHMuYWRhcHQub2JzZXJ2ZS5kaWdlc3QoKTtcbiAgfSxcbiAgc2V0U3RhdHVzOiBmdW5jdGlvbiggdmFsdWUgKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7b3BlbjogdmFsdWV9KTtcbiAgfSxcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCApIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgICAgIGlmKCAhVXRpbHMuZmluZENsb3Nlc3RQYXJlbnQoZS50YXJnZXQsICdmaWVsZF9fc2VsZWN0LS0nICsgdGhhdC5zdGF0ZS5uYW1lKSApIHtcbiAgICAgICAgaWYoIHRoYXQuc3RhdGUub3BlbiApIHtcbiAgICAgICAgICB0aGF0LnNldFN0YXR1cyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiggKSB7XG4gICAgdmFyXG4gICAgICB2YWx1ZSA9IHRoaXMuc3RhdGUubW9kZWwsXG4gICAgICB0eXBlID0gdGhpcy5zdGF0ZS50eXBlLFxuICAgICAgaXRlbSA9IHRoaXMucHJvcHMuY29uZmlnLml0ZW07XG5cbiAgICB0aGlzLnN0YXRlLm9wZW4gPSB0aGlzLnN0YXRlLm9wZW4gfHwgZmFsc2U7XG5cbiAgICB2YXIgaXRlbXMgPSB7fTtcblxuICAgIHZhciBjb250cm9sbGVyID0ge307XG4gICAgaWYoIHRoaXMucHJvcHMuY29uZmlnLmNvbnRyb2xsZXIgJiYgdGhpcy5wcm9wcy5jb25maWcuY29udHJvbGxlclsgdGhpcy5wcm9wcy5jb25maWcubmFtZSBdICkge1xuICAgICAgY29udHJvbGxlciA9IHRoaXMucHJvcHMuY29uZmlnLmNvbnRyb2xsZXJbIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgXTtcbiAgICB9XG5cbiAgICBpZiggaXRlbS5vcHRpb25zICkge1xuICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBpdGVtLm9wdGlvbnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGl0ZW1zWydpdGVtLScgKyBpXSA9IChcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwibGlcIiwgeydkYXRhLWxvY2F0b3InOiAgdGhpcy5wcm9wcy5jb25maWcubmFtZVRyYWlsICsgdGhpcy5wcm9wcy5jb25maWcubmFtZSArICctb3B0aW9uLScgKyBpdGVtLm9wdGlvbnNbaV0udmFsdWUsIG9uQ2xpY2s6ICAhY29udHJvbGxlci5kaXNhYmxlZCA/IHRoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzLCBpKSA6IGZ1bmN0aW9uKCl7fSwgY2xhc3NOYW1lOiAgdmFsdWUgPT0gaXRlbS5vcHRpb25zW2ldLnZhbHVlID8gJ2FjdGl2ZScgOiAnJ30sIFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS1jaGVja1wifSksIFxuICAgICAgICAgICAgIGl0ZW0ub3B0aW9uc1tpXS5sYWJlbFxuICAgICAgICAgIClcbiAgICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tzZWxlY3RdOiBObyBvcHRpb25zIHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgdmFyIGRpc3BsYXlWYWx1ZTtcbiAgICBpZiggdmFsdWUgKSB7XG4gICAgICB2YXIgaW5kZXggPSB0aGlzLnN0YXRlLml0ZW0ub3B0aW9ucy5maWx0ZXIoZnVuY3Rpb24ob2JqKXtcbiAgICAgICAgcmV0dXJuIG9iai52YWx1ZSA9PSB2YWx1ZTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiggaW5kZXgubGVuZ3RoICkge1xuICAgICAgICBkaXNwbGF5VmFsdWUgPSBpbmRleFswXS5sYWJlbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiAnZmllbGQgZmllbGRfX3NlbGVjdCBmaWVsZF9fc2VsZWN0LS0nICsgdGhpcy5zdGF0ZS5uYW1lICsgKCBjb250cm9sbGVyLmRpc2FibGVkID8gJyBmaWVsZF9fc2VsZWN0LS1kaXNhYmxlZCcgOiAnJyksICdkYXRhLWxvY2F0b3InOiAgdGhpcy5wcm9wcy5jb25maWcubmFtZVRyYWlsICsgdGhpcy5wcm9wcy5jb25maWcubmFtZSArICctY29udGFpbmVyJ30sIFxuICAgICAgICBcbiAgICAgICAgICB0eXBlb2YgaXRlbS5sYWJlbCA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6XG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChhZGFwdC5jb21wb25lbnRzLmxhYmVsLCB7Y29uZmlnOiAgeyBpdGVtOiBpdGVtfSwgYWRhcHQ6ICB0aGlzLnByb3BzLmFkYXB0fSksIFxuICAgICAgICAgIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGRfX3NlbGVjdC0tY29udGFpbmVyXCIsICdkYXRhLWxvY2F0b3InOiAgdGhpcy5wcm9wcy5jb25maWcubmFtZVRyYWlsICsgdGhpcy5wcm9wcy5jb25maWcubmFtZX0sIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogICggdGhpcy5zdGF0ZS5vcGVuID8gJ29wZW4gJyA6ICcnICkgKyAnZmllbGRfX3NlbGVjdC0tY3VycmVudCBuby1zZWxlY3QnLCBvbkNsaWNrOiAgIWNvbnRyb2xsZXIuZGlzYWJsZWQgPyB0aGlzLnNldFN0YXR1cy5iaW5kKHRoaXMsICF0aGlzLnN0YXRlLm9wZW4pIDogZnVuY3Rpb24oKXt9fSwgXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLXNvcnRcIn0pLCBcbiAgICAgICAgICAgICBkaXNwbGF5VmFsdWUgfHwgJ1BsZWFzZSBzZWxlY3QuLidcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwidWxcIiwge2NsYXNzTmFtZTogICggdGhpcy5zdGF0ZS5vcGVuID8gJ29wZW4gJyA6ICcnICkgKyAnZmllbGRfX3NlbGVjdC0tZHJvcGRvd24nfSwgXG4gICAgICAgICAgICBpdGVtcyBcbiAgICAgICAgICApLCBcbiAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGVvZiBpdGVtLmRlc2MgPT09ICd1bmRlZmluZWQnID8gJycgOlxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChhZGFwdC5jb21wb25lbnRzLmRlc2NyaXB0aW9uLCB7Y29uZmlnOiAgeyBpdGVtOiBpdGVtfSwgYWRhcHQ6ICB0aGlzLnByb3BzLmFkYXB0fSlcbiAgICAgICAgICAgIFxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxufTtcblxuYWRhcHQuY29tcG9uZW50KCdzZWxlY3QnLCBBZGFwdFNlbGVjdCk7XG4iLCJ2YXIgYWRhcHQgPSByZXF1aXJlKCcuLi9hcGkvY29yZScpO1xudmFyIFV0aWxzID0gcmVxdWlyZSgnLi4vYXBpL3V0aWxzJyk7XG5cbnZhciBBZGFwdFNlbGVjdE11bHRpcGxlID0ge1xuICBkaXNwbGF5TmFtZTogJ0FkYXB0U2VsZWN0TXVsdGlwbGUnLFxuICBzdGF0aWNzOiB7XG4gICAgZGVmYXVsdE1vZGVsVmFsdWU6IFtdXG4gIH0sXG4gIGV4dGVuZDogW2FkYXB0Lm1peGlucy5hcnJheV0sXG4gIHJlbmRlcjogZnVuY3Rpb24oICkge1xuICAgIHZhclxuICAgICAgdmFsdWUgPSB0aGlzLnN0YXRlLm1vZGVsLFxuICAgICAgdHlwZSA9IHRoaXMuc3RhdGUudHlwZSxcbiAgICAgIGl0ZW0gPSB0aGlzLnByb3BzLmNvbmZpZy5pdGVtLFxuICAgICAgb3B0aW9ucyA9IHRoaXMucHJvcHMuY29uZmlnLml0ZW0ub3B0aW9ucztcblxuICAgIHZhciBvcHRpb25MaXN0ID0ge307XG5cbiAgICBpZiggb3B0aW9ucyApIHtcbiAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgb3B0aW9ucy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgb3B0aW9uTGlzdFsnb3B0aW9uLScgKyBpXSA9IChcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsaVwiLCB7J2RhdGEtbG9jYXRvcic6ICB0aGlzLnByb3BzLmNvbmZpZy5uYW1lVHJhaWwgKyB0aGlzLnByb3BzLmNvbmZpZy5uYW1lICsgJy1pdGVtLScgKyBvcHRpb25zW2ldLnZhbHVlLCBjbGFzc05hbWU6ICh2YWx1ZS5pbmRleE9mKG9wdGlvbnNbaV0udmFsdWUpID4gLTEgPyAnYWN0aXZlJzogJycpICsgJyBmaWVsZF9fc2VsZWN0bXVsdGlwbGUtLWl0ZW0gbm8tc2VsZWN0JywgcmVmOiAgJ29wdGlvbicgKyBpLCBvbkNsaWNrOiAgdGhpcy5oYW5kbGVDaGFuZ2UuYmluZCh0aGlzLCBpKSB9LCBcbiAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS1jaGVjayBmYS1md1wifSksIFxuXG4gICAgICAgICAgICAgICBvcHRpb25zW2ldLmxhYmVsXG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKCdbc2VsZWN0TXVsdGlwbGVdOiBObyBvcHRpb25zIHByb3ZpZGVkJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJmaWVsZCBmaWVsZF9fc2VsZWN0XCIsICdkYXRhLWxvY2F0b3InOiAgdGhpcy5wcm9wcy5jb25maWcubmFtZVRyYWlsICsgdGhpcy5wcm9wcy5jb25maWcubmFtZSArICctY29udGFpbmVyJ30sIFxuICAgICAgICBcbiAgICAgICAgICB0eXBlb2YgaXRlbS5sYWJlbCA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6XG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChhZGFwdC5jb21wb25lbnRzLmxhYmVsLCB7Y29uZmlnOiAgeyBpdGVtOiBpdGVtfSwgYWRhcHQ6ICB0aGlzLnByb3BzLmFkYXB0fSksIFxuICAgICAgICAgIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGRfX3NlbGVjdC0tY29udGFpbmVyXCJ9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwidWxcIiwge2NsYXNzTmFtZTogXCJmaWVsZF9fc2VsZWN0bXVsdGlwbGVcIn0sIFxuICAgICAgICAgICAgb3B0aW9uTGlzdCBcbiAgICAgICAgICApLCBcbiAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGVvZiBpdGVtLmRlc2MgPT09ICd1bmRlZmluZWQnID8gJycgOlxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChhZGFwdC5jb21wb25lbnRzLmRlc2NyaXB0aW9uLCB7Y29uZmlnOiAgeyBpdGVtOiBpdGVtfSwgYWRhcHQ6ICB0aGlzLnByb3BzLmFkYXB0fSlcbiAgICAgICAgICAgIFxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxufTtcblxuYWRhcHQuY29tcG9uZW50KCdzZWxlY3RNdWx0aXBsZScsIEFkYXB0U2VsZWN0TXVsdGlwbGUpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYWRhcHQgPSByZXF1aXJlKCcuLi9hcGkvY29yZScpO1xudmFyIFV0aWxzID0gcmVxdWlyZSgnLi4vYXBpL3V0aWxzJyk7XG5cbnZhciBBZGFwdFRhYmNvcmRpb24gPSB7XG4gIGRpc3BsYXlOYW1lOiAnQWRhcHRUYWJjb3JkaW9uJyxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiggKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGl0ZW06IGNvbmZpZy5pdGVtLFxuICAgICAgbW9kZWw6IGNvbmZpZy5tb2RlbCxcbiAgICAgIG9wZW5UYWI6IDAsXG4gICAgICBvcGVuQWNjb3JkaW9uOiAxLFxuICAgICAgYWNjb3JkaW9uczoge30sXG4gICAgICBvcGVuRHJvcGRvd246IC0xXG4gICAgfTtcbiAgfSxcbiAgb3BlbjogZnVuY3Rpb24oIHRhYklkLCBhY2NvcmRpb25JZCApIHtcbiAgICB0aGlzLnNldFN0YXRlKCB7XG4gICAgICBvcGVuVGFiOiB0YWJJZCxcbiAgICAgIG9wZW5BY2NvcmRpb246IGFjY29yZGlvbklkID4gLTEgPyBhY2NvcmRpb25JZCA6IC0xXG4gICAgfSApO1xuICB9LFxuICBhZGRBY2NvcmRpb246IGZ1bmN0aW9uKCBhY2NvcmRpb25OYW1lICkge1xuXG4gICAgdmFyIG5ld01vZGVsID0ge307XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgdGhpcy5wcm9wcy5hZGFwdC5tb2RlbC5jcmVhdGVNb2RlbChjb25maWcuaXRlbS5pdGVtc1thY2NvcmRpb25OYW1lXS5tb2RlbCwgbmV3TW9kZWwpO1xuXG4gICAgY29uZmlnLm1vZGVsW2FjY29yZGlvbk5hbWVdLnZhbHVlLnB1c2gobmV3TW9kZWwpO1xuXG4gICAgdGhpcy5wcm9wcy5hZGFwdC5vYnNlcnZlLmRpZ2VzdCgpO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBvcGVuQWNjb3JkaW9uOiBjb25maWcubW9kZWxbYWNjb3JkaW9uTmFtZV0udmFsdWUubGVuZ3RoIC0gMVxuICAgIH0pO1xuXG4gIH0sXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiggKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuICAgICAgaWYoICFVdGlscy5maW5kQ2xvc2VzdFBhcmVudChlLnRhcmdldCwgJ3RhYmNvcmRpb25fX2FjY29yZGlvbi0taXRlbScpICkge1xuICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgb3BlbkRyb3Bkb3duOiAtMVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgY29weUFjY29yZGlvbjogZnVuY3Rpb24oIGFjY29yZGlvbk5hbWUsIGFjY29yZGlvbklkKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgdmFyIG5ld01vZGVsID0ge307XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgdGhpcy5wcm9wcy5jb25maWcubW9kZWxbYWNjb3JkaW9uTmFtZV0udmFsdWUucHVzaChcbiAgICAgIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoKGNvbmZpZy5tb2RlbFthY2NvcmRpb25OYW1lXS52YWx1ZVthY2NvcmRpb25JZF0pKSlcbiAgICAgICk7XG5cbiAgICB0aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuZGlnZXN0KCk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG9wZW5BY2NvcmRpb246IGNvbmZpZy5tb2RlbFthY2NvcmRpb25OYW1lXS52YWx1ZS5sZW5ndGggLSAxLFxuICAgICAgb3BlbkRyb3Bkb3duOiAtMVxuICAgIH0pXG4gIH0sXG4gIGxpc3RlbmVyczogW10sXG4gIHJlbW92ZUFjY29yZGlvbjogZnVuY3Rpb24oIGFjY29yZGlvbk5hbWUsIGFjY29yZGlvbklkICkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHZhciBjdXJyZW50bHlPcGVuZWQgPSB0aGlzLnN0YXRlLmFjY29yZGlvbnNbYWNjb3JkaW9uTmFtZV1bdGhpcy5zdGF0ZS5vcGVuQWNjb3JkaW9uXTtcblxuICAgIHZhciBhcnIgPSBjb25maWcubW9kZWxbIGFjY29yZGlvbk5hbWUgXS52YWx1ZTtcbiAgICBhcnIuc3BsaWNlKGFjY29yZGlvbklkLCAxKTtcblxuICAgIHRoaXMucHJvcHMuY29uZmlnLm1vZGVsWyBhY2NvcmRpb25OYW1lIF0udmFsdWUgPSBhcnI7XG5cbiAgICB0aGlzLnN0YXRlLmFjY29yZGlvbnNbYWNjb3JkaW9uTmFtZV0uc3BsaWNlKGFjY29yZGlvbklkLCAxKTtcblxuICAgIHRoaXMucHJvcHMuYWRhcHQub2JzZXJ2ZS5kaWdlc3QoKTtcblxuICAgIHZhciB0b09wZW47XG4gICAgaWYoIGFjY29yZGlvbklkID09PSB0aGlzLnN0YXRlLm9wZW5BY2NvcmRpb24gKSB7XG4gICAgICBpZiggdGhpcy5wcm9wcy5jb25maWcubW9kZWxbYWNjb3JkaW9uTmFtZSBdLnZhbHVlLmxlbmd0aCApIHtcbiAgICAgICAgaWYoIGFjY29yZGlvbklkID4gMCApIHtcbiAgICAgICAgICB0b09wZW4gPSBhY2NvcmRpb25JZCAtIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9PcGVuID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9PcGVuID0gLTE7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRvT3BlbiA9IHRoaXMuc3RhdGUuYWNjb3JkaW9uc1thY2NvcmRpb25OYW1lXS5pbmRleE9mKGN1cnJlbnRseU9wZW5lZCk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBvcGVuQWNjb3JkaW9uOiB0b09wZW4sXG4gICAgICBvcGVuRHJvcGRvd246IC0xXG4gICAgfSlcbiAgfSxcbiAgb3BlbkRyb3Bkb3duOiBmdW5jdGlvbihpZCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgb3BlbkRyb3Bkb3duOiBpZCA9PT0gdGhpcy5zdGF0ZS5vcGVuRHJvcGRvd24gPyAtMSA6IGlkXG4gICAgfSk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oICkge1xuICAgIHZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxuICAgIHZhciBpdGVtID0gdGhpcy5wcm9wcy5jb25maWcuaXRlbTtcbiAgICB2YXIgbW9kZWwgPSB0aGlzLnN0YXRlLm1vZGVsO1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHZhciBoZWFkZXIgPSBbXTtcbiAgICB2YXIgY29udGVudCA9IFtdO1xuXG4gICAgdmFyIGl0ZW1zID0gaXRlbS5pdGVtcztcblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB2YXIgb3BlblRhYiA9IHRoaXMuc3RhdGUub3BlblRhYjtcbiAgICB2YXIgb3BlbkFjY29yZGlvbiA9IHRoaXMuc3RhdGUub3BlbkFjY29yZGlvbjtcblxuICAgIHZhciByID0gMDtcbiAgICBmb3IoIHZhciBpIGluIGl0ZW1zICkge1xuICAgIFx0dmFyIGhhbmRsZVR5cGUgPSB7XG4gICAgXHRcdHRhYjogZnVuY3Rpb24ocikge1xuICAgICAgICAgIHZhciBjbGFzc2VzID0gY3goe1xuICAgICAgICAgICAgJ3RhYmNvcmRpb25fX25hdi0taXRlbSc6IHRydWUsXG4gICAgICAgICAgICAndGFiY29yZGlvbl9fbmF2LS1hY3RpdmUnOiBvcGVuVGFiID09PSByXG4gICAgICAgICAgICB9KTtcblxuICAgIFx0XHRcdGhlYWRlci5wdXNoKFxuICAgIFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImxpXCIsIHtrZXk6IGksIGNsYXNzTmFtZTogY2xhc3Nlcywgb25DbGljazogIHRoaXMub3Blbi5iaW5kKHRoaXMsIHIpIH0sIFxuICAgIFx0XHRcdFx0XHQgaXRlbXNbaV0udGl0bGVcbiAgICBcdFx0XHRcdClcbiAgICBcdFx0XHRcdCk7XG5cbiAgICAgICAgICB2YXIgZWxlbWVudCA9IGl0ZW1zW2ldO1xuXG4gICAgICAgICAgdmFyIGNoaWxkcmVuID0gW107XG5cbiAgICAgICAgICB2YXIgbG9vcCA9IGFkYXB0LmNvbXBvbmVudHMubG9vcDtcblxuICAgICAgICAgIGNoaWxkcmVuID0gbG9vcChcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGl0ZW1zOiBlbGVtZW50Lml0ZW1zLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbmZpZy5jb250cm9sbGVyLFxuICAgICAgICAgICAgICAgIHZhbHVlczogY29uZmlnLnZhbHVlcyxcbiAgICAgICAgICAgICAgICBvYnNlcnZlOiBjb25maWcub2JzZXJ2ZSxcbiAgICAgICAgICAgICAgICBuYW1lVHJhaWw6IGNvbmZpZy5uYW1lVHJhaWwsXG4gICAgICAgICAgICAgICAgbW9kZWw6IG1vZGVsLFxuICAgICAgICAgICAgICAgIGFkYXB0OiBfdGhpcy5wcm9wcy5hZGFwdFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgdmFyIGNsYXNzZXMgPSBjeCh7XG4gICAgICAgICAgICAgICd0YWJjb3JkaW9uX19jb250ZW50LS1pdGVtJzogdHJ1ZSxcbiAgICAgICAgICAgICAgJ2NsZWFyJzogdHJ1ZSxcbiAgICAgICAgICAgICAgJ3RhYmNvcmRpb25fX2NvbnRlbnQtLWFjdGl2ZSc6IG9wZW5UYWIgPT09IHJcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgY29udGVudC5wdXNoKFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBjbGFzc2VzLCBrZXk6IGkgfSwgXG4gICAgICAgICAgICAgIGNoaWxkcmVuIFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICBcdFx0fSxcbiAgICBcdFx0YWNjb3JkaW9uOiBmdW5jdGlvbihyKSB7XG5cbiAgICBcdFx0XHR2YXIgbmF2Q2hpbGRyZW4gPSBbXTtcblxuICAgICAgICAgIG1vZGVsW2ldLnZhbHVlLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50LCBpbmRleCApIHtcbiAgICAgICAgICAgIHZhciB0aXRsZSA9IGl0ZW1zW2ldLmFjY29yZGlvblRpdGxlO1xuICAgICAgICAgICAgdmFyIHN1YnRpdGxlID0gaXRlbXNbaV0uYWNjb3JkaW9uU3VidGl0bGU7XG5cbiAgICAgICAgICAgIHZhciBjb250ZW50Q2hpbGRyZW4gPSBbXTtcblxuICAgICAgICAgICAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKC97KFtefV0rKX0vZywgZnVuY3Rpb24oIG1hdGNoICkge1xuICAgICAgICAgICAgICB2YXIgcmVwbGFjZSA9IHtcbiAgICAgICAgICAgICAgICAne2luZGV4fSc6IGZ1bmN0aW9uKCApIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpbmRleCArIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIHJldHVybiAocmVwbGFjZVttYXRjaF0gfHwgcmVwbGFjZVsnZGVmYXVsdCddKSgpO1xuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICBpZiggc3VidGl0bGUgKSB7XG4gICAgICAgICAgICAgIHN1YnRpdGxlID0gc3VidGl0bGUucmVwbGFjZSgveyhbXn1dKyl9L2csIGZ1bmN0aW9uKCBtYXRjaCApIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVwbGFjZSA9IHtcbiAgICAgICAgICAgICAgICAgICd7aW5kZXh9JzogZnVuY3Rpb24oICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5kZXggKyAxO1xuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICdkZWZhdWx0JzogZnVuY3Rpb24oICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbW9kZWxOYW1lID0gbWF0Y2gucmVwbGFjZSgneycsICcnKS5yZXBsYWNlKCd9JywgJycpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKCAgbW9kZWxbaV0udmFsdWVbaW5kZXhdW21vZGVsTmFtZV0gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsW2ldLnZhbHVlW2luZGV4XVttb2RlbE5hbWVdLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gKHJlcGxhY2VbbWF0Y2hdIHx8IHJlcGxhY2VbJ2RlZmF1bHQnXSkoKTtcbiAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgY2xhc3NlcyA9IGN4KHtcbiAgICAgICAgICAgICAgJ3RhYmNvcmRpb25fX2FjY29yZGlvbi0taXRlbSc6IHRydWUsXG4gICAgICAgICAgICAgICd0YWJjb3JkaW9uX19hY2NvcmRpb24tLWFjdGl2ZSc6IG9wZW5BY2NvcmRpb24gPT09IGluZGV4ICYmIG9wZW5UYWIgPT09IHJcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgZHJvcERvd25DbGFzc2VzID0gY3goe1xuICAgICAgICAgICAgICAndGFiY29yZGlvbl9fYWNjb3JkaW9uLS1kcm9wZG93bic6IHRydWUsXG4gICAgICAgICAgICAgICd0YWJjb3JkaW9uX19hY2NvcmRpb24tLWRyb3Bkb3duLS1hY3RpdmUnOiB0aGlzLnN0YXRlLm9wZW5Ecm9wZG93biA9PT0gaW5kZXhcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgYXJyb3dDbGFzc2VzID0gY3goe1xuICAgICAgICAgICAgICAnZmEgZmEtZncnOiB0cnVlLFxuICAgICAgICAgICAgICAnZmEtY2FyZXQtZG93bic6ICEodGhpcy5zdGF0ZS5vcGVuRHJvcGRvd24gPT09IGluZGV4KSxcbiAgICAgICAgICAgICAgJ2ZhLWNhcmV0LXVwJzogdGhpcy5zdGF0ZS5vcGVuRHJvcGRvd24gPT09IGluZGV4XG4gICAgICAgICAgICB9KTtcblxuICAgICAgXHRcdFx0bmF2Q2hpbGRyZW4ucHVzaChcbiAgICAgIFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImxpXCIsIHtrZXk6IGluZGV4LCBjbGFzc05hbWU6IGNsYXNzZXMgfSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJ0YWJjb3JkaW9uX19hY2NvcmRpb24tLWhvbGRlclwiLCBvbkNsaWNrOiAgdGhpcy5vcGVuLmJpbmQodGhpcywgciwgaW5kZXgpIH0sIFxuICAgIFx0XHRcdFx0XHQgICBcdHRpdGxlLCBcblxuICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJ0YWJjb3JkaW9uX19hY2NvcmRpb24tLXRpdGxlXCIsIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MOiB7X19odG1sOiBzdWJ0aXRsZSB8fCAnJm5ic3A7J319XG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKSwgXG5cbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBhcnJvd0NsYXNzZXMsIG9uQ2xpY2s6ICB0aGlzLm9wZW5Ecm9wZG93bi5iaW5kKHRoaXMsIGluZGV4KSB9KSwgXG5cbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IGRyb3BEb3duQ2xhc3NlcyB9LCBcbiAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtvbkNsaWNrOiAgdGhpcy5jb3B5QWNjb3JkaW9uLmJpbmQodGhpcywgaSwgaW5kZXgpIH0sIFxuICAgICAgICAgICAgICAgICAgICBcIkR1cGxpY2F0ZVwiXG4gICAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwicmVtb3ZlXCIsIG9uQ2xpY2s6ICB0aGlzLnJlbW92ZUFjY29yZGlvbi5iaW5kKHRoaXMsIGksIGluZGV4KSB9LCBcbiAgICAgICAgICAgICAgICAgICAgXCJSZW1vdmVcIlxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgXHRcdFx0XHRcdCApXG4gICAgICBcdFx0XHQpO1xuXG4gICAgICAgICAgICB2YXIgbG9vcCA9IGFkYXB0LmNvbXBvbmVudHMubG9vcDtcblxuICAgICAgICAgICAgY29udGVudENoaWxkcmVuID0gbG9vcChcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1tpXS5tb2RlbCxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBjb25maWcuY29udHJvbGxlcltpXSxcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbmZpZy52YWx1ZXMsXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZTogY29uZmlnLm9ic2VydmUsXG4gICAgICAgICAgICAgICAgbmFtZVRyYWlsOiBjb25maWcubmFtZVRyYWlsICsgaSArICcuJyxcbiAgICAgICAgICAgICAgICBtb2RlbDogbW9kZWxbaV0udmFsdWVbaW5kZXhdLFxuICAgICAgICAgICAgICAgIGFkYXB0OiBfdGhpcy5wcm9wcy5hZGFwdFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB2YXIgY2xhc3NlcyA9IGN4KHtcbiAgICAgICAgICAgICAgJ3RhYmNvcmRpb25fX2NvbnRlbnQtLWl0ZW0nOiB0cnVlLFxuICAgICAgICAgICAgICAnY2xlYXInOiB0cnVlLFxuICAgICAgICAgICAgICAndGFiY29yZGlvbl9fY29udGVudC0tYWN0aXZlJzogb3BlbkFjY29yZGlvbiA9PT0gaW5kZXggJiYgb3BlblRhYiA9PT0gclxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmKCAhdGhpcy5zdGF0ZS5hY2NvcmRpb25zW2ldICkge1xuICAgICAgICAgICAgICB0aGlzLnN0YXRlLmFjY29yZGlvbnNbaV0gPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoICF0aGlzLnN0YXRlLmFjY29yZGlvbnNbaV1baW5kZXhdICkge1xuICAgICAgICAgICAgICB0aGlzLnN0YXRlLmFjY29yZGlvbnNbaV1baW5kZXhdID0gK25ldyBEYXRlKCkgKyBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIga2V5ID0gdGhpcy5zdGF0ZS5hY2NvcmRpb25zW2ldW2luZGV4XTtcblxuICAgICAgICAgICAgY29udGVudC5wdXNoKFxuICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IGNsYXNzZXMsIGtleToga2V5IH0sIFxuICAgICAgICAgICAgICAgIGNvbnRlbnRDaGlsZHJlbiBcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgIH0sIHRoaXMgKTtcblxuICAgICAgICAgIHZhciBjbGFzc2VzID0gY3goe1xuICAgICAgICAgICAgJ3RhYmNvcmRpb25fX25hdi0taXRlbSc6IHRydWUsXG4gICAgICAgICAgICAndGFiY29yZGlvbl9fbmF2LS1hY3RpdmUnOiBvcGVuVGFiID09PSByXG4gICAgICAgICAgfSk7XG5cbiAgICBcdFx0XHRoZWFkZXIucHVzaChcbiAgICBcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsaVwiLCB7Y2xhc3NOYW1lOiBjbGFzc2VzIH0sIFxuICAgICAgICBcdFx0XHRcdCBpdGVtc1tpXS50aXRsZSwgXG5cbiAgICAgICAgXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwidWxcIiwge2NsYXNzTmFtZTogXCJ0YWJjb3JkaW9uX19hY2NvcmRpb25cIn0sIFxuICAgICAgICBcdFx0XHRcdFx0bmF2Q2hpbGRyZW4sIFxuICAgICAgICBcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImxpXCIsIHtjbGFzc05hbWU6IFwidGFiY29yZGlvbl9fYWNjb3JkaW9uLS1pdGVtIHRhYmNvcmRpb25fX2FjY29yZGlvbi0tYWRkXCIsIG9uQ2xpY2s6ICB0aGlzLmFkZEFjY29yZGlvbi5iaW5kKCB0aGlzLCBpKSB9LCBcbiAgICAgICAgXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS1wbHVzIGZhLWZ3XCJ9KSwgXG4gICAgICAgIFx0XHRcdFx0XHRcdCBpdGVtc1tpXS5hZGRUZXh0IHx8ICdBZGQgSXRlbSdcbiAgICAgICAgXHRcdFx0XHRcdClcbiAgICAgICAgXHRcdFx0XHQpXG4gICAgICAgIFx0XHRcdClcbiAgICBcdFx0XHRcdCk7XG4gICAgXHRcdH1cbiAgICBcdH1cblxuICAgICAgaGFuZGxlVHlwZVtpdGVtc1tpXS50YWJUeXBlXS5jYWxsKHRoaXMsIHIpO1xuXG4gICAgICArK3I7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJ0YWJjb3JkaW9uIG5vLXNlbGVjdCBjbGVhclwifSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJ0YWJjb3JkaW9uX19uYXZcIn0sIFxuICAgICAgICBcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJ1bFwiLCB7Y2xhc3NOYW1lOiBcInRhYmNvcmRpb25fX25hdi0tbGlzdFwifSwgXG4gICAgICAgIFx0XHRoZWFkZXIgXG4gICAgICAgIFx0KSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJ0YWJjb3JkaW9uX19kaXZpZGVyXCJ9KVxuICAgICAgICApLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInRhYmNvcmRpb25fX2NvbnRlbnRcIn0sIFxuICAgICAgICAgIGNvbnRlbnQgXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG59O1xuXG5hZGFwdC5jb21wb25lbnQoJ3RhYmNvcmRpb24nLCBBZGFwdFRhYmNvcmRpb24pO1xuIiwidmFyIGFkYXB0ID0gcmVxdWlyZSgnLi4vYXBpL2NvcmUnKTtcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4uL2FwaS91dGlscycpO1xuXG52YXIgQWRhcHRUYWJsZSA9IHtcbiAgZGlzcGxheU5hbWU6ICdBZGFwdFRhYmxlJyxcbiAgZXh0ZW5kOiBbYWRhcHQubWl4aW5zLmFycmF5T2JqZWN0XSxcbiAgcmVuZGVyOiBmdW5jdGlvbiggKSB7XG4gICAgdmFyIGl0ZW0gPSB0aGlzLnByb3BzLmNvbmZpZy5pdGVtO1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgb3BlbklEID0gdGhpcy5zdGF0ZS5vcGVuIHx8IC0xO1xuICAgIHZhciBpdGVtcyA9IFtdO1xuICAgIHZhciBtb2RlbCA9IHRoaXMuc3RhdGUubW9kZWw7XG5cbiAgICB2YXIgc2ltcGxlID0gISFjb25maWcuaXRlbS50eXBlLnNwbGl0KCc6JylbMV07XG5cbiAgICB2YXIgaGVhZGVyID0gW107XG5cbiAgICBjb25zb2xlLmxvZyhpdGVtLm1vZGVsKTtcblxuICAgIGZvciggdmFyIGkgaW4gaXRlbS5tb2RlbCApIHtcbiAgICAgIGhlYWRlci5wdXNoKFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwidGhcIiwge2tleTogaSB9LCBcbiAgICAgICAgICAgaXRlbS5tb2RlbFtpXS5sYWJlbFxuICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgdmFyIHQgPSAwO1xuXG4gICAgaWYgKG1vZGVsKSB7XG4gICAgICBmb3IoIHZhciBpID0gMDsgaSA8IG1vZGVsLmxlbmd0aDsgaSsrICkge1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSBbXTtcblxuICAgICAgICBpZighc2ltcGxlKSB7XG4gICAgICAgICAgY2hpbGRyZW4ucHVzaCggUmVhY3QuY3JlYXRlRWxlbWVudChcInRkXCIsIHtjbGFzc05hbWU6IFwiaWRcIn0sICBpICsgMSkgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgICAgICBmb3IoIHZhciByIGluIGl0ZW0ubW9kZWwgKSB7XG4gICAgICAgICAgdmFyIG5ld0l0ZW0gPSBVdGlscy5jb3B5KGl0ZW0ubW9kZWxbcl0pO1xuICAgICAgICAgIGRlbGV0ZSBuZXdJdGVtLmRlc2M7XG4gICAgICAgICAgZGVsZXRlIG5ld0l0ZW0ubGFiZWw7XG5cbiAgICAgICAgICB2YXIgaXRlbUNvbmZpZyA9IHtcbiAgICAgICAgICAgIG1vZGVsOiBjb25maWcubW9kZWxbY29uZmlnLm5hbWVdLnZhbHVlW2ldLFxuICAgICAgICAgICAgY29udHJvbGxlcjogY29uZmlnLmNvbnRyb2xsZXJbY29uZmlnLm5hbWVdLFxuICAgICAgICAgICAgbmFtZTogcixcbiAgICAgICAgICAgIGl0ZW06IG5ld0l0ZW0sXG4gICAgICAgICAgICB2YWx1ZXM6IGNvbmZpZy52YWx1ZXMsXG4gICAgICAgICAgICBvYnNlcnZlOiBjb25maWcub2JzZXJ2ZSxcbiAgICAgICAgICAgIG5hbWVUcmFpbDogY29uZmlnLm5hbWVUcmFpbCArIGNvbmZpZy5uYW1lICsgJy4nXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHZhciBjb250ZW50cyA9IHRoaXMudHJhbnNmZXJQcm9wc1RvKFJlYWN0LmNyZWF0ZUVsZW1lbnQoYWRhcHQuY29tcG9uZW50cy5pdGVtLCB7Y29uZmlnOiBpdGVtQ29uZmlnIH0pKTtcblxuICAgICAgICAgIGNoaWxkcmVuLnB1c2goXG4gICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiLCB7a2V5OiAgdCArIHJ9LCBcbiAgICAgICAgICAgICAgICBjb250ZW50cyBcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICB0Kys7XG4gICAgICAgIH1cblxuICAgICAgICBjaGlsZHJlbi5wdXNoKFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiLCB7Y2xhc3NOYW1lOiBcInRoX19vcHRpb25zXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtvbkNsaWNrOiAgdGhpcy5yZW1vdmUuYmluZCh0aGlzLCBpKSB9LCBcbiAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS10aW1lcyBmYS1md1wifSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgICAgKTtcblxuICAgICAgICB2YXIgUkVHRVhfQ1VSTFkgPSAveyhbXn1dKyl9L2c7XG5cbiAgICAgICAgaXRlbXMucHVzaChcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwidHJcIiwge2tleTogaSwgJ2RhdGEtbG9jYXRvcic6ICB0aGlzLnByb3BzLmNvbmZpZy5uYW1lVHJhaWwgKyB0aGlzLnByb3BzLmNvbmZpZy5uYW1lICsgJy1yb3ctJyArIGl9LCBcbiAgICAgICAgICAgIGNoaWxkcmVuXG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiAgJ2VsZW1lbnRfX3RhYmxlIGNsZWFyIG5vLXNlbGVjdCAnICsgKCBzaW1wbGUgPyAnZWxlbWVudF9fdGFibGUtLXNpbXBsZScgOiAnJyksICdkYXRhLWxvY2F0b3InOiAgdGhpcy5wcm9wcy5jb25maWcubmFtZVRyYWlsICsgdGhpcy5wcm9wcy5jb25maWcubmFtZSArICctY29udGFpbmVyJ30sIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwidGFibGVcIiwge2NlbGxQYWRkaW5nOiBcIjBcIiwgY2VsbFNwYWNpbmc6IFwiMFwifSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInRoZWFkXCIsIHtjbGFzc05hbWU6ICBpdGVtcy5sZW5ndGggPyAnJyA6ICdlbXB0eSd9LCBcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJ0clwiLCBudWxsLCBcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc2ltcGxlID8gJycgOlxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJ0aFwiLCB7Y2xhc3NOYW1lOiBcImlkXCJ9LCBcIiNcIiksIFxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgaGVhZGVyLCBcbiAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInRoXCIsIHtjbGFzc05hbWU6IFwidGhfX29wdGlvbnNcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtvbkNsaWNrOiAgdGhpcy5hZGR9LCBcbiAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IFwiZmEgZmEtcGx1cyBmYS1md1wifSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwidGJvZHlcIiwgbnVsbCwgXG4gICAgICAgICAgICBpdGVtc1xuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn07XG5cbmFkYXB0LmNvbXBvbmVudCgndGFibGUnLCBBZGFwdFRhYmxlKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGFkYXB0ID0gcmVxdWlyZSgnLi4vYXBpL2NvcmUnKTtcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4uL2FwaS91dGlscycpO1xuXG52YXIgQWRhcHRUYWJzID0ge1xuICBkaXNwbGF5TmFtZTogJ0FkYXB0VGFicycsXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oICkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHZhciBzdHlsZSA9ICdkZWZhdWx0JztcbiAgICB2YXIgc3BsaXQgPSBjb25maWcuaXRlbS50eXBlLnNwbGl0KCc6Jyk7XG4gICAgaWYoIHNwbGl0Lmxlbmd0aCA+IDEgKSB7XG4gICAgICBzdHlsZSA9IHNwbGl0WzFdO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgaXRlbTogY29uZmlnLml0ZW0sXG4gICAgICBtb2RlbDogY29uZmlnLm1vZGVsLFxuICAgICAgb3BlbjogMCxcbiAgICAgIHN0eWxlOiAndGFicycgKyBzdHlsZVxuICAgIH07XG4gIH0sXG4gIG9wZW46IGZ1bmN0aW9uKGlkKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7b3BlbjogaWR9KTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiggKSB7XG5cbiAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuY29uZmlnLml0ZW07XG4gICAgdmFyIG1vZGVsID0gdGhpcy5zdGF0ZS5tb2RlbDtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cblxuICAgIHZhciBoZWFkZXIgPSBbXTtcbiAgICB2YXIgY29udGVudCA9IFtdO1xuXG4gICAgdmFyIGl0ZW1zID0gaXRlbS5pdGVtcztcblxuICAgIHZhciB0ID0gMDtcbiAgICBmb3IoIHZhciBpIGluIGl0ZW1zICkge1xuICAgICAgaWYoIFV0aWxzLmNoZWNrU3RhdGUoIGl0ZW1zW2ldLnN0YXRlLCB0aGlzLnByb3BzLmFkYXB0LnN0YXRlICkgKSB7XG4gICAgICAgIGhlYWRlci5wdXNoKFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsaVwiLCB7J2RhdGEtbG9jYXRvcic6ICB0aGlzLnByb3BzLmNvbmZpZy5uYW1lVHJhaWwgKyB0aGlzLnByb3BzLmNvbmZpZy5uYW1lICsgJy10YWItJyArIGksIGtleTogaSwgb25DbGljazogIHRoaXMub3Blbi5iaW5kKHRoaXMsIHQpLCBjbGFzc05hbWU6ICB0aGlzLnN0YXRlLnN0eWxlICsgJ19faGVhZGVyLS1pdGVtICcgKyAoIHRoaXMuc3RhdGUub3BlbiA9PSB0ID8gdGhpcy5zdGF0ZS5zdHlsZSArICdfX2hlYWRlci0tb3BlbicgOiAnJyApICsgKCB0aGlzLnN0YXRlLm9wZW4gLSAxID09IHQgPyB0aGlzLnN0YXRlLnN0eWxlICsgJ19faGVhZGVyLS1iZWZvcmVvcGVuJyA6ICcnKSB9LCBcbiAgICAgICAgICAgICBpdGVtc1tpXS50aXRsZVxuICAgICAgICAgIClcbiAgICAgICAgICApO1xuXG4gICAgICAgIHZhciBjaGlsZHJlbiA9IFtdO1xuXG4gICAgICAgIHZhciBsb29wID0gYWRhcHQuY29tcG9uZW50cy5sb29wO1xuXG4gICAgICAgIGNoaWxkcmVuID0gbG9vcChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaXRlbXM6IGl0ZW1zW2ldLml0ZW1zLFxuICAgICAgICAgICAgICBjb250cm9sbGVyOiBjb25maWcuY29udHJvbGxlcixcbiAgICAgICAgICAgICAgdmFsdWVzOiBjb25maWcudmFsdWVzLFxuICAgICAgICAgICAgICBvYnNlcnZlOiBjb25maWcub2JzZXJ2ZSxcbiAgICAgICAgICAgICAgbmFtZVRyYWlsOiBjb25maWcubmFtZVRyYWlsLFxuICAgICAgICAgICAgICBtb2RlbDogY29uZmlnLm1vZGVsLFxuICAgICAgICAgICAgICBhZGFwdDogdGhpcy5wcm9wcy5hZGFwdFxuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG5cbiAgICAgICAgdmFyIHN0eWxlID0ge307XG4gICAgICAgIGlmKCBpdGVtc1tpXS5wYWRkaW5nICkge1xuICAgICAgICAgIHN0eWxlLnBhZGRpbmcgPSBpdGVtc1tpXS5wYWRkaW5nO1xuICAgICAgICB9XG5cblxuICAgICAgICBjb250ZW50LnB1c2goXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7J2RhdGEtbG9jYXRvcic6ICB0aGlzLnByb3BzLmNvbmZpZy5uYW1lVHJhaWwgKyB0aGlzLnByb3BzLmNvbmZpZy5uYW1lICsgJy1jb250ZW50LScgKyBpLCBzdHlsZTogc3R5bGUsIGNsYXNzTmFtZTogIHRoaXMuc3RhdGUuc3R5bGUgKyAnX19jb250ZW50LS1pdGVtICcgKyAoIHRoaXMuc3RhdGUub3BlbiA9PSB0ID8gdGhpcy5zdGF0ZS5zdHlsZSArICdfX2NvbnRlbnQtLW9wZW4nIDogJycpIH0sIFxuICAgICAgICAgICAgY2hpbGRyZW4gXG4gICAgICAgICAgKVxuICAgICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHQrKztcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiAgdGhpcy5zdGF0ZS5zdHlsZSArICcgbm8tc2VsZWN0JywgJ2RhdGEtbG9jYXRvcic6ICB0aGlzLnByb3BzLmNvbmZpZy5uYW1lVHJhaWwgKyB0aGlzLnByb3BzLmNvbmZpZy5uYW1lICsgJy1jb250YWluZXInfSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJ1bFwiLCB7Y2xhc3NOYW1lOiAgdGhpcy5zdGF0ZS5zdHlsZSArICdfX2hlYWRlciBjbGVhcid9LCBcbiAgICAgICAgICBoZWFkZXIgXG4gICAgICAgICksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6ICB0aGlzLnN0YXRlLnN0eWxlICsgJ19fY29udGVudCd9LCBcbiAgICAgICAgICBjb250ZW50IFxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxufTtcblxuYWRhcHQuY29tcG9uZW50KCd0YWJzJywgQWRhcHRUYWJzKTtcbiIsInZhciBhZGFwdCA9IHJlcXVpcmUoJy4uL2FwaS9jb3JlJyk7XG5cbnZhciBBZGFwdFRleHRhcmVhID0ge1xuICBleHRlbmQ6IFthZGFwdC5taXhpbnMuZmxhdF0sXG4gIGRpc3BsYXlOYW1lOiAnQWRhcHRUZXh0YXJlYScsXG4gIHJlbmRlcjogZnVuY3Rpb24oICkge1xuICAgIHZhclxuICAgICAgbW9kZWwgPSB0aGlzLnN0YXRlLm1vZGVsLFxuICAgICAgdHlwZSA9IHRoaXMuc3RhdGUudHlwZSxcbiAgICAgIGl0ZW0gPSB0aGlzLnN0YXRlLml0ZW07XG5cbiAgICAgIHZhciBsYWJlbCA9IGFkYXB0LmNvbXBvbmVudCgnbGFiZWwnKTtcblxuICAgIHZhciBjb250cm9sbGVyID0ge307XG4gICAgaWYoIHRoaXMucHJvcHMuY29uZmlnLmNvbnRyb2xsZXIgJiYgdGhpcy5wcm9wcy5jb25maWcuY29udHJvbGxlclsgdGhpcy5wcm9wcy5jb25maWcubmFtZSBdICkge1xuICAgICAgY29udHJvbGxlciA9IHRoaXMucHJvcHMuY29uZmlnLmNvbnRyb2xsZXJbIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgXTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImZpZWxkIGZpZWxkX190ZXh0YXJlYVwiLCAnZGF0YS1sb2NhdG9yJzogIHRoaXMucHJvcHMuY29uZmlnLm5hbWVUcmFpbCArIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgKyAnLWNvbnRhaW5lcid9LCBcbiAgICAgICAgXG4gICAgICAgICAgdHlwZW9mIGl0ZW0ubGFiZWwgPT09ICd1bmRlZmluZWQnID8gJycgOlxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoYWRhcHQuY29tcG9uZW50cy5sYWJlbCwge2NvbmZpZzogIHsgaXRlbTogaXRlbX0sIGFkYXB0OiAgdGhpcy5wcm9wcy5hZGFwdH0pLCBcbiAgICAgICAgICBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImZpZWxkX190ZXh0YXJlYS0tY29udGFpbmVyXCJ9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwidGV4dGFyZWFcIiwgeydkYXRhLWxvY2F0b3InOiAgdGhpcy5wcm9wcy5jb25maWcubmFtZVRyYWlsICsgdGhpcy5wcm9wcy5jb25maWcubmFtZSwgb25DaGFuZ2U6ICB0aGlzLmhhbmRsZUNoYW5nZSwgcGxhY2Vob2xkZXI6ICBpdGVtLnBsYWNlaG9sZGVyLCB2YWx1ZTogbW9kZWwsIGRpc2FibGVkOiAgY29udHJvbGxlci5kaXNhYmxlZH0pLCBcbiAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGVvZiBpdGVtLmRlc2MgPT09ICd1bmRlZmluZWQnID8gJycgOlxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChhZGFwdC5jb21wb25lbnRzLmRlc2NyaXB0aW9uLCB7Y29uZmlnOiAgeyBpdGVtOiBpdGVtfSwgYWRhcHQ6ICB0aGlzLnByb3BzLmFkYXB0fSlcbiAgICAgICAgICAgIFxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxufTtcblxuYWRhcHQuY29tcG9uZW50KCd0ZXh0YXJlYScsIEFkYXB0VGV4dGFyZWEpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYWRhcHQgPSByZXF1aXJlKCcuLi9hcGkvY29yZScpO1xuXG52YXIgYXJyYXkgPSB7XG4gIHN0YXRpY3M6IHtcbiAgICBkZWZhdWx0TW9kZWxWYWx1ZTogW11cbiAgfSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiggKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1vZGVsOiBjb25maWcubW9kZWxbY29uZmlnLm5hbWVdLnZhbHVlLFxuICAgICAgaXRlbTogY29uZmlnLml0ZW0sXG4gICAgICBuYW1lOiBjb25maWcubmFtZSxcbiAgICB9O1xuICB9LFxuICBoYW5kbGVDaGFuZ2U6IGZ1bmN0aW9uKGkpIHtcbiAgICB2YXJcbiAgICAgIG1vZGVsID0gdGhpcy5zdGF0ZS5tb2RlbCxcbiAgICAgIG9wdGlvbnMgPSB0aGlzLnByb3BzLmNvbmZpZy5pdGVtLm9wdGlvbnM7XG5cbiAgICAvLyBmaW5kIHRoZSBsb2NhdGlvbiBvZiB0aGUgaXRlbVxuICAgIHZhciBpbmRleCA9IG1vZGVsLmluZGV4T2Yob3B0aW9uc1tpXS52YWx1ZSk7XG4gICAgaWYoIGluZGV4ID4gLTEgKSB7XG4gICAgICAvLyByZW1vdmUgaXRcbiAgICAgIG1vZGVsLnNwbGljZShpbmRleCwgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGFkZCBpdFxuICAgICAgbW9kZWwucHVzaChvcHRpb25zW2ldLnZhbHVlKTtcbiAgICB9XG5cbiAgICAvLyB1cGRhdGUgdGhlIG1vZGVsXG4gICAgdGhpcy5wcm9wcy5jb25maWcubW9kZWxbIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgXS52YWx1ZSA9IG1vZGVsO1xuXG4gICAgLy8gbGV0IGV2ZXJ5b25lIGtub3dcbiAgICB0aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuZGlnZXN0KCk7XG5cbiAgICAvLyBrZWVwIHRoZSB2aWV3IGluIHN5bmNcbiAgICB0aGlzLnNldFN0YXRlKHttb2RlbDogbW9kZWx9KTtcbiAgfSxcbn07XG5cbmFkYXB0Lm1peGluKCdhcnJheScsIGFycmF5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGFkYXB0ID0gcmVxdWlyZSgnLi4vYXBpL2NvcmUnKTtcblxudmFyIGFycmF5T2JqZWN0ID0ge1xuICBzdGF0aWNzOiB7XG4gICAgZGVmYXVsdE1vZGVsVmFsdWU6IFtdXG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oICkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHJldHVybiB7XG4gICAgICBtb2RlbDogY29uZmlnLm1vZGVsW2NvbmZpZy5uYW1lXS52YWx1ZVxuICAgIH07XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24oaWQpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICB2YXIgYXJyID0gY29uZmlnLm1vZGVsW2NvbmZpZy5uYW1lXS52YWx1ZTtcbiAgICBhcnIuc3BsaWNlKGlkLCAxKTtcblxuICAgIHRoaXMucHJvcHMuY29uZmlnLm1vZGVsWyB0aGlzLnByb3BzLmNvbmZpZy5uYW1lIF0udmFsdWUgPSBhcnI7XG5cbiAgICB0aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuZGlnZXN0KCk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHttb2RlbDogYXJyfSk7XG5cbiAgICBpZiggIWFyci5sZW5ndGggKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKCB7IG9wZW46IC0xIH0gKTtcbiAgICB9XG4gIH0sXG4gIGFkZDogZnVuY3Rpb24oICkge1xuICAgIHZhciBuZXdNb2RlbCA9IHt9O1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHRoaXMucHJvcHMuYWRhcHQubW9kZWwuY3JlYXRlTW9kZWwoY29uZmlnLml0ZW0ubW9kZWwsIG5ld01vZGVsKTtcblxuICAgIGNvbmZpZy5tb2RlbFtjb25maWcubmFtZV0udmFsdWUucHVzaChuZXdNb2RlbCk7XG5cbiAgICB0aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuZGlnZXN0KCk7XG5cbiAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gIH0sXG59O1xuXG5hZGFwdC5taXhpbignYXJyYXlPYmplY3QnLCBhcnJheU9iamVjdCk7XG4iLCJ2YXIgYWRhcHQgPSByZXF1aXJlKCcuLi9hcGkvY29yZScpO1xuXG52YXIgZmxhdCA9IHtcbiAgc3RhdGljczoge1xuICAgIGRlZmF1bHRNb2RlbFZhbHVlOiAnJ1xuICB9LFxuICBleHByZXNzaW9uVmFsdWU6IGZ1bmN0aW9uICgpIHt9LFxuICBzZXRFeHByZXNzaW9uVmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgaWYoIGNvbmZpZy52YWx1ZXNbY29uZmlnLm5hbWVUcmFpbCArIGNvbmZpZy5uYW1lXSApIHtcbiAgICAgIHRoaXMuZXhwcmVzc2lvblZhbHVlKCk7XG5cblxuICAgICAgdGhpcy5leHByZXNzaW9uVmFsdWUgPSB0aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gY29uZmlnLnZhbHVlc1tjb25maWcubmFtZVRyYWlsICsgY29uZmlnLm5hbWVdLmNhbGwoY29uZmlnLm1vZGVsKTtcbiAgICAgIH0sIGZ1bmN0aW9uKG5ld1ZhbCkge1xuICAgICAgICB0aGF0LnByb3BzLmNvbmZpZy5tb2RlbFt0aGF0LnByb3BzLmNvbmZpZy5uYW1lXS52YWx1ZSA9IG5ld1ZhbDtcblxuICAgICAgICB0aGF0LnNldFN0YXRlKHtcbiAgICAgICAgICBtb2RlbDogbmV3VmFsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBtb2RlbDogY29uZmlnLnZhbHVlc1tjb25maWcubmFtZVRyYWlsICsgY29uZmlnLm5hbWVdLmNhbGwoY29uZmlnLm1vZGVsKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgc2V0T2JzZXJ2ZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHZhciBvYnNlcnZlcnMgPSBjb25maWcub2JzZXJ2ZVtjb25maWcubmFtZVRyYWlsICsgY29uZmlnLm5hbWVdO1xuXG4gICAgZm9yKCB2YXIgaSBpbiBvYnNlcnZlcnMpIHtcbiAgICAgIG9ic2VydmVyc1tpXS5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbWVudCwgaW5kZXggKSB7XG4gICAgICAgIHRoYXQubGlzdGVuZXJzLnB1c2goXG4gICAgICAgICAgdGhhdC5wcm9wcy5hZGFwdC5vYnNlcnZlLmFkZExpc3RlbmVyKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLm1vZGVsW2NvbmZpZy5uYW1lXVtpXTtcbiAgICAgICAgICB9LCBmdW5jdGlvbiAobmV3VmFsLCBvbGRWYWwsIGRpZmYpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmNhbGwoY29uZmlnLm1vZGVsLCBuZXdWYWwsIG9sZFZhbCwgZGlmZiwgY29uZmlnLm5hbWUpO1xuICAgICAgICAgIH0gKVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBsaXN0ZW5lcnM6IFtdLFxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgdmFyIG1vZGVsID0gY29uZmlnLm1vZGVsW2NvbmZpZy5uYW1lXTtcblxuICAgIHZhciBleHByZXNzaW9uVmFsdWU7XG5cbiAgICBpZiggY29uZmlnLnZhbHVlc1tjb25maWcubmFtZVRyYWlsICsgY29uZmlnLm5hbWVdICkge1xuICAgICAgdGhpcy5zZXRFeHByZXNzaW9uVmFsdWUoKTtcbiAgICB9XG5cbiAgICBpZiggY29uZmlnLm9ic2VydmVbY29uZmlnLm5hbWVUcmFpbCArIGNvbmZpZy5uYW1lXSApIHtcbiAgICAgIHRoaXMuc2V0T2JzZXJ2ZXJzKCk7XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0ZS5saXN0ZW5lcnMucHVzaChcbiAgICAgIHRoaXMucHJvcHMuYWRhcHQub2JzZXJ2ZS5hZGRMaXN0ZW5lcihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBjb25maWcudmFsdWVzW2NvbmZpZy5uYW1lVHJhaWwgKyBjb25maWcubmFtZV07XG4gICAgICB9LCBmdW5jdGlvbiggbmV3VmFsICkge1xuICAgICAgICB0aGF0LnNldEV4cHJlc3Npb25WYWx1ZSgpO1xuICAgICAgfSApXG4gICAgKTtcblxuICAgIHRoaXMuc3RhdGUubGlzdGVuZXJzLnB1c2goXG4gICAgICB0aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gY29uZmlnLm9ic2VydmVbY29uZmlnLm5hbWVUcmFpbCArIGNvbmZpZy5uYW1lXTtcbiAgICAgIH0sIGZ1bmN0aW9uKCBuZXdWYWwgKSB7XG4gICAgICAgIHRoYXQuc2V0T2JzZXJ2ZXJzKCk7XG4gICAgICB9IClcbiAgICApO1xuXG4gICAgdGhpcy5zdGF0ZS5saXN0ZW5lcnMucHVzaChcbiAgICAgIHRoaXMucHJvcHMuYWRhcHQub2JzZXJ2ZS5hZGRMaXN0ZW5lcihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIGNvbmZpZy5tb2RlbFtjb25maWcubmFtZV0ubW9kZWw7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0sIGZ1bmN0aW9uKCBuZXdWYWwsIG9sZFZhbCApIHtcbiAgICAgICAgaWYoIG5ld1ZhbCAhPT0gbnVsbCApIHtcbiAgICAgICAgICB0aGF0LnNldFN0YXRlKHttb2RlbENsYXNzOiBuZXdWYWx9KTtcbiAgICAgICAgfVxuICAgICAgfSApXG4gICAgKTtcblxuICAgIHRoaXMuc3RhdGUubGlzdGVuZXJzLnB1c2goXG4gICAgICAgIHRoaXMucHJvcHMuYWRhcHQub2JzZXJ2ZS5hZGRMaXN0ZW5lcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBjb25maWcubW9kZWxbY29uZmlnLm5hbWVdLnZhbHVlO1xuICAgICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICB9LCBmdW5jdGlvbiggbmV3VmFsLCBvbGRWYWwgKSB7XG4gICAgICAgICAgaWYoIG5ld1ZhbCAhPT0gbnVsbCApIHtcbiAgICAgICAgICAgIHRoYXQuc2V0U3RhdGUoe21vZGVsOiBuZXdWYWx9KTtcbiAgICAgICAgICB9XG4gICAgICB9IClcbiAgICApO1xuICB9LFxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oICkge1xuICAgIHRoaXMuZXhwcmVzc2lvblZhbHVlKCk7XG5cbiAgICB0aGlzLnN0YXRlLmxpc3RlbmVycy5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbWVudCApIHtcbiAgICAgIGVsZW1lbnQoKTtcbiAgICB9ICk7XG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oICkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHJldHVybiB7XG4gICAgICBtb2RlbDogY29uZmlnLm1vZGVsW2NvbmZpZy5uYW1lXS52YWx1ZSxcbiAgICAgIG1vZGVsQ2xhc3M6ICcnLFxuICAgICAgaXRlbTogY29uZmlnLml0ZW0sXG4gICAgICBuYW1lOiBjb25maWcubmFtZSxcbiAgICAgIGxpc3RlbmVyczogW11cbiAgICB9O1xuICB9LFxuICBoYW5kbGVDaGFuZ2U6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdGhpcy5wcm9wcy5jb25maWcubW9kZWxbIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgXS52YWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICB0aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuZGlnZXN0KCk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHttb2RlbDogZXZlbnQudGFyZ2V0LnZhbHVlfSk7XG4gIH1cbn07XG5cbmFkYXB0Lm1peGluKCdmbGF0JywgZmxhdCk7XG4iLCJ2YXIgYWRhcHQgPSByZXF1aXJlKCcuLi9hcGkvY29yZScpO1xuXG52YXIgb2JqZWN0ID0ge307XG5cbmFkYXB0Lm1peGluKCdvYmplY3QnLCBvYmplY3QpO1xuIl19
