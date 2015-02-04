require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],2:[function(require,module,exports){
(function (process,global){
(function(global) {
  'use strict';
  if (global.$traceurRuntime) {
    return;
  }
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $Object.defineProperties;
  var $defineProperty = $Object.defineProperty;
  var $freeze = $Object.freeze;
  var $getOwnPropertyDescriptor = $Object.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $Object.getOwnPropertyNames;
  var $keys = $Object.keys;
  var $hasOwnProperty = $Object.prototype.hasOwnProperty;
  var $toString = $Object.prototype.toString;
  var $preventExtensions = Object.preventExtensions;
  var $seal = Object.seal;
  var $isExtensible = Object.isExtensible;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var types = {
    void: function voidType() {},
    any: function any() {},
    string: function string() {},
    number: function number() {},
    boolean: function boolean() {}
  };
  var method = nonEnum;
  var counter = 0;
  function newUniqueString() {
    return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++counter + '$__';
  }
  var symbolInternalProperty = newUniqueString();
  var symbolDescriptionProperty = newUniqueString();
  var symbolDataProperty = newUniqueString();
  var symbolValues = $create(null);
  var privateNames = $create(null);
  function isPrivateName(s) {
    return privateNames[s];
  }
  function createPrivateName() {
    var s = newUniqueString();
    privateNames[s] = true;
    return s;
  }
  function isShimSymbol(symbol) {
    return typeof symbol === 'object' && symbol instanceof SymbolValue;
  }
  function typeOf(v) {
    if (isShimSymbol(v))
      return 'symbol';
    return typeof v;
  }
  function Symbol(description) {
    var value = new SymbolValue(description);
    if (!(this instanceof Symbol))
      return value;
    throw new TypeError('Symbol cannot be new\'ed');
  }
  $defineProperty(Symbol.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(Symbol.prototype, 'toString', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!getOption('symbols'))
      return symbolValue[symbolInternalProperty];
    if (!symbolValue)
      throw TypeError('Conversion from symbol to string');
    var desc = symbolValue[symbolDescriptionProperty];
    if (desc === undefined)
      desc = '';
    return 'Symbol(' + desc + ')';
  }));
  $defineProperty(Symbol.prototype, 'valueOf', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!symbolValue)
      throw TypeError('Conversion from symbol to string');
    if (!getOption('symbols'))
      return symbolValue[symbolInternalProperty];
    return symbolValue;
  }));
  function SymbolValue(description) {
    var key = newUniqueString();
    $defineProperty(this, symbolDataProperty, {value: this});
    $defineProperty(this, symbolInternalProperty, {value: key});
    $defineProperty(this, symbolDescriptionProperty, {value: description});
    freeze(this);
    symbolValues[key] = this;
  }
  $defineProperty(SymbolValue.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(SymbolValue.prototype, 'toString', {
    value: Symbol.prototype.toString,
    enumerable: false
  });
  $defineProperty(SymbolValue.prototype, 'valueOf', {
    value: Symbol.prototype.valueOf,
    enumerable: false
  });
  var hashProperty = createPrivateName();
  var hashPropertyDescriptor = {value: undefined};
  var hashObjectProperties = {
    hash: {value: undefined},
    self: {value: undefined}
  };
  var hashCounter = 0;
  function getOwnHashObject(object) {
    var hashObject = object[hashProperty];
    if (hashObject && hashObject.self === object)
      return hashObject;
    if ($isExtensible(object)) {
      hashObjectProperties.hash.value = hashCounter++;
      hashObjectProperties.self.value = object;
      hashPropertyDescriptor.value = $create(null, hashObjectProperties);
      $defineProperty(object, hashProperty, hashPropertyDescriptor);
      return hashPropertyDescriptor.value;
    }
    return undefined;
  }
  function freeze(object) {
    getOwnHashObject(object);
    return $freeze.apply(this, arguments);
  }
  function preventExtensions(object) {
    getOwnHashObject(object);
    return $preventExtensions.apply(this, arguments);
  }
  function seal(object) {
    getOwnHashObject(object);
    return $seal.apply(this, arguments);
  }
  freeze(SymbolValue.prototype);
  function isSymbolString(s) {
    return symbolValues[s] || privateNames[s];
  }
  function toProperty(name) {
    if (isShimSymbol(name))
      return name[symbolInternalProperty];
    return name;
  }
  function removeSymbolKeys(array) {
    var rv = [];
    for (var i = 0; i < array.length; i++) {
      if (!isSymbolString(array[i])) {
        rv.push(array[i]);
      }
    }
    return rv;
  }
  function getOwnPropertyNames(object) {
    return removeSymbolKeys($getOwnPropertyNames(object));
  }
  function keys(object) {
    return removeSymbolKeys($keys(object));
  }
  function getOwnPropertySymbols(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var symbol = symbolValues[names[i]];
      if (symbol) {
        rv.push(symbol);
      }
    }
    return rv;
  }
  function getOwnPropertyDescriptor(object, name) {
    return $getOwnPropertyDescriptor(object, toProperty(name));
  }
  function hasOwnProperty(name) {
    return $hasOwnProperty.call(this, toProperty(name));
  }
  function getOption(name) {
    return global.traceur && global.traceur.options[name];
  }
  function defineProperty(object, name, descriptor) {
    if (isShimSymbol(name)) {
      name = name[symbolInternalProperty];
    }
    $defineProperty(object, name, descriptor);
    return object;
  }
  function polyfillObject(Object) {
    $defineProperty(Object, 'defineProperty', {value: defineProperty});
    $defineProperty(Object, 'getOwnPropertyNames', {value: getOwnPropertyNames});
    $defineProperty(Object, 'getOwnPropertyDescriptor', {value: getOwnPropertyDescriptor});
    $defineProperty(Object.prototype, 'hasOwnProperty', {value: hasOwnProperty});
    $defineProperty(Object, 'freeze', {value: freeze});
    $defineProperty(Object, 'preventExtensions', {value: preventExtensions});
    $defineProperty(Object, 'seal', {value: seal});
    $defineProperty(Object, 'keys', {value: keys});
  }
  function exportStar(object) {
    for (var i = 1; i < arguments.length; i++) {
      var names = $getOwnPropertyNames(arguments[i]);
      for (var j = 0; j < names.length; j++) {
        var name = names[j];
        if (isSymbolString(name))
          continue;
        (function(mod, name) {
          $defineProperty(object, name, {
            get: function() {
              return mod[name];
            },
            enumerable: true
          });
        })(arguments[i], names[j]);
      }
    }
    return object;
  }
  function isObject(x) {
    return x != null && (typeof x === 'object' || typeof x === 'function');
  }
  function toObject(x) {
    if (x == null)
      throw $TypeError();
    return $Object(x);
  }
  function checkObjectCoercible(argument) {
    if (argument == null) {
      throw new TypeError('Value cannot be converted to an Object');
    }
    return argument;
  }
  function polyfillSymbol(global, Symbol) {
    if (!global.Symbol) {
      global.Symbol = Symbol;
      Object.getOwnPropertySymbols = getOwnPropertySymbols;
    }
    if (!global.Symbol.iterator) {
      global.Symbol.iterator = Symbol('Symbol.iterator');
    }
  }
  function setupGlobals(global) {
    polyfillSymbol(global, Symbol);
    global.Reflect = global.Reflect || {};
    global.Reflect.global = global.Reflect.global || global;
    polyfillObject(global.Object);
  }
  setupGlobals(global);
  global.$traceurRuntime = {
    checkObjectCoercible: checkObjectCoercible,
    createPrivateName: createPrivateName,
    defineProperties: $defineProperties,
    defineProperty: $defineProperty,
    exportStar: exportStar,
    getOwnHashObject: getOwnHashObject,
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
    getOwnPropertyNames: $getOwnPropertyNames,
    isObject: isObject,
    isPrivateName: isPrivateName,
    isSymbolString: isSymbolString,
    keys: $keys,
    setupGlobals: setupGlobals,
    toObject: toObject,
    toProperty: toProperty,
    type: types,
    typeof: typeOf
  };
})(typeof global !== 'undefined' ? global : this);
(function() {
  'use strict';
  function spread() {
    var rv = [],
        j = 0,
        iterResult;
    for (var i = 0; i < arguments.length; i++) {
      var valueToSpread = $traceurRuntime.checkObjectCoercible(arguments[i]);
      if (typeof valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)] !== 'function') {
        throw new TypeError('Cannot spread non-iterable object.');
      }
      var iter = valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)]();
      while (!(iterResult = iter.next()).done) {
        rv[j++] = iterResult.value;
      }
    }
    return rv;
  }
  $traceurRuntime.spread = spread;
})();
(function() {
  'use strict';
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $getOwnPropertyDescriptor = $traceurRuntime.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $traceurRuntime.getOwnPropertyNames;
  var $getPrototypeOf = Object.getPrototypeOf;
  var $__0 = Object,
      getOwnPropertyNames = $__0.getOwnPropertyNames,
      getOwnPropertySymbols = $__0.getOwnPropertySymbols;
  function superDescriptor(homeObject, name) {
    var proto = $getPrototypeOf(homeObject);
    do {
      var result = $getOwnPropertyDescriptor(proto, name);
      if (result)
        return result;
      proto = $getPrototypeOf(proto);
    } while (proto);
    return undefined;
  }
  function superCall(self, homeObject, name, args) {
    return superGet(self, homeObject, name).apply(self, args);
  }
  function superGet(self, homeObject, name) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor) {
      if (!descriptor.get)
        return descriptor.value;
      return descriptor.get.call(self);
    }
    return undefined;
  }
  function superSet(self, homeObject, name, value) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor && descriptor.set) {
      descriptor.set.call(self, value);
      return value;
    }
    throw $TypeError(("super has no setter '" + name + "'."));
  }
  function getDescriptors(object) {
    var descriptors = {};
    var names = getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      descriptors[name] = $getOwnPropertyDescriptor(object, name);
    }
    var symbols = getOwnPropertySymbols(object);
    for (var i = 0; i < symbols.length; i++) {
      var symbol = symbols[i];
      descriptors[$traceurRuntime.toProperty(symbol)] = $getOwnPropertyDescriptor(object, $traceurRuntime.toProperty(symbol));
    }
    return descriptors;
  }
  function createClass(ctor, object, staticObject, superClass) {
    $defineProperty(object, 'constructor', {
      value: ctor,
      configurable: true,
      enumerable: false,
      writable: true
    });
    if (arguments.length > 3) {
      if (typeof superClass === 'function')
        ctor.__proto__ = superClass;
      ctor.prototype = $create(getProtoParent(superClass), getDescriptors(object));
    } else {
      ctor.prototype = object;
    }
    $defineProperty(ctor, 'prototype', {
      configurable: false,
      writable: false
    });
    return $defineProperties(ctor, getDescriptors(staticObject));
  }
  function getProtoParent(superClass) {
    if (typeof superClass === 'function') {
      var prototype = superClass.prototype;
      if ($Object(prototype) === prototype || prototype === null)
        return superClass.prototype;
      throw new $TypeError('super prototype must be an Object or null');
    }
    if (superClass === null)
      return null;
    throw new $TypeError(("Super expression must either be null or a function, not " + typeof superClass + "."));
  }
  function defaultSuperCall(self, homeObject, args) {
    if ($getPrototypeOf(homeObject) !== null)
      superCall(self, homeObject, 'constructor', args);
  }
  $traceurRuntime.createClass = createClass;
  $traceurRuntime.defaultSuperCall = defaultSuperCall;
  $traceurRuntime.superCall = superCall;
  $traceurRuntime.superGet = superGet;
  $traceurRuntime.superSet = superSet;
})();
(function() {
  'use strict';
  var createPrivateName = $traceurRuntime.createPrivateName;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $create = Object.create;
  var $TypeError = TypeError;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var ST_NEWBORN = 0;
  var ST_EXECUTING = 1;
  var ST_SUSPENDED = 2;
  var ST_CLOSED = 3;
  var END_STATE = -2;
  var RETHROW_STATE = -3;
  function getInternalError(state) {
    return new Error('Traceur compiler bug: invalid state in state machine: ' + state);
  }
  function GeneratorContext() {
    this.state = 0;
    this.GState = ST_NEWBORN;
    this.storedException = undefined;
    this.finallyFallThrough = undefined;
    this.sent_ = undefined;
    this.returnValue = undefined;
    this.tryStack_ = [];
  }
  GeneratorContext.prototype = {
    pushTry: function(catchState, finallyState) {
      if (finallyState !== null) {
        var finallyFallThrough = null;
        for (var i = this.tryStack_.length - 1; i >= 0; i--) {
          if (this.tryStack_[i].catch !== undefined) {
            finallyFallThrough = this.tryStack_[i].catch;
            break;
          }
        }
        if (finallyFallThrough === null)
          finallyFallThrough = RETHROW_STATE;
        this.tryStack_.push({
          finally: finallyState,
          finallyFallThrough: finallyFallThrough
        });
      }
      if (catchState !== null) {
        this.tryStack_.push({catch: catchState});
      }
    },
    popTry: function() {
      this.tryStack_.pop();
    },
    get sent() {
      this.maybeThrow();
      return this.sent_;
    },
    set sent(v) {
      this.sent_ = v;
    },
    get sentIgnoreThrow() {
      return this.sent_;
    },
    maybeThrow: function() {
      if (this.action === 'throw') {
        this.action = 'next';
        throw this.sent_;
      }
    },
    end: function() {
      switch (this.state) {
        case END_STATE:
          return this;
        case RETHROW_STATE:
          throw this.storedException;
        default:
          throw getInternalError(this.state);
      }
    },
    handleException: function(ex) {
      this.GState = ST_CLOSED;
      this.state = END_STATE;
      throw ex;
    }
  };
  function nextOrThrow(ctx, moveNext, action, x) {
    switch (ctx.GState) {
      case ST_EXECUTING:
        throw new Error(("\"" + action + "\" on executing generator"));
      case ST_CLOSED:
        if (action == 'next') {
          return {
            value: undefined,
            done: true
          };
        }
        throw x;
      case ST_NEWBORN:
        if (action === 'throw') {
          ctx.GState = ST_CLOSED;
          throw x;
        }
        if (x !== undefined)
          throw $TypeError('Sent value to newborn generator');
      case ST_SUSPENDED:
        ctx.GState = ST_EXECUTING;
        ctx.action = action;
        ctx.sent = x;
        var value = moveNext(ctx);
        var done = value === ctx;
        if (done)
          value = ctx.returnValue;
        ctx.GState = done ? ST_CLOSED : ST_SUSPENDED;
        return {
          value: value,
          done: done
        };
    }
  }
  var ctxName = createPrivateName();
  var moveNextName = createPrivateName();
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  $defineProperty(GeneratorFunctionPrototype, 'constructor', nonEnum(GeneratorFunction));
  GeneratorFunctionPrototype.prototype = {
    constructor: GeneratorFunctionPrototype,
    next: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'next', v);
    },
    throw: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'throw', v);
    }
  };
  $defineProperties(GeneratorFunctionPrototype.prototype, {
    constructor: {enumerable: false},
    next: {enumerable: false},
    throw: {enumerable: false}
  });
  Object.defineProperty(GeneratorFunctionPrototype.prototype, Symbol.iterator, nonEnum(function() {
    return this;
  }));
  function createGeneratorInstance(innerFunction, functionObject, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new GeneratorContext();
    var object = $create(functionObject.prototype);
    object[ctxName] = ctx;
    object[moveNextName] = moveNext;
    return object;
  }
  function initGeneratorFunction(functionObject) {
    functionObject.prototype = $create(GeneratorFunctionPrototype.prototype);
    functionObject.__proto__ = GeneratorFunctionPrototype;
    return functionObject;
  }
  function AsyncFunctionContext() {
    GeneratorContext.call(this);
    this.err = undefined;
    var ctx = this;
    ctx.result = new Promise(function(resolve, reject) {
      ctx.resolve = resolve;
      ctx.reject = reject;
    });
  }
  AsyncFunctionContext.prototype = $create(GeneratorContext.prototype);
  AsyncFunctionContext.prototype.end = function() {
    switch (this.state) {
      case END_STATE:
        this.resolve(this.returnValue);
        break;
      case RETHROW_STATE:
        this.reject(this.storedException);
        break;
      default:
        this.reject(getInternalError(this.state));
    }
  };
  AsyncFunctionContext.prototype.handleException = function() {
    this.state = RETHROW_STATE;
  };
  function asyncWrap(innerFunction, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new AsyncFunctionContext();
    ctx.createCallback = function(newState) {
      return function(value) {
        ctx.state = newState;
        ctx.value = value;
        moveNext(ctx);
      };
    };
    ctx.errback = function(err) {
      handleCatch(ctx, err);
      moveNext(ctx);
    };
    moveNext(ctx);
    return ctx.result;
  }
  function getMoveNext(innerFunction, self) {
    return function(ctx) {
      while (true) {
        try {
          return innerFunction.call(self, ctx);
        } catch (ex) {
          handleCatch(ctx, ex);
        }
      }
    };
  }
  function handleCatch(ctx, ex) {
    ctx.storedException = ex;
    var last = ctx.tryStack_[ctx.tryStack_.length - 1];
    if (!last) {
      ctx.handleException(ex);
      return;
    }
    ctx.state = last.catch !== undefined ? last.catch : last.finally;
    if (last.finallyFallThrough !== undefined)
      ctx.finallyFallThrough = last.finallyFallThrough;
  }
  $traceurRuntime.asyncWrap = asyncWrap;
  $traceurRuntime.initGeneratorFunction = initGeneratorFunction;
  $traceurRuntime.createGeneratorInstance = createGeneratorInstance;
})();
(function() {
  function buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
    var out = [];
    if (opt_scheme) {
      out.push(opt_scheme, ':');
    }
    if (opt_domain) {
      out.push('//');
      if (opt_userInfo) {
        out.push(opt_userInfo, '@');
      }
      out.push(opt_domain);
      if (opt_port) {
        out.push(':', opt_port);
      }
    }
    if (opt_path) {
      out.push(opt_path);
    }
    if (opt_queryData) {
      out.push('?', opt_queryData);
    }
    if (opt_fragment) {
      out.push('#', opt_fragment);
    }
    return out.join('');
  }
  ;
  var splitRe = new RegExp('^' + '(?:' + '([^:/?#.]+)' + ':)?' + '(?://' + '(?:([^/?#]*)@)?' + '([\\w\\d\\-\\u0100-\\uffff.%]*)' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$');
  var ComponentIndex = {
    SCHEME: 1,
    USER_INFO: 2,
    DOMAIN: 3,
    PORT: 4,
    PATH: 5,
    QUERY_DATA: 6,
    FRAGMENT: 7
  };
  function split(uri) {
    return (uri.match(splitRe));
  }
  function removeDotSegments(path) {
    if (path === '/')
      return '/';
    var leadingSlash = path[0] === '/' ? '/' : '';
    var trailingSlash = path.slice(-1) === '/' ? '/' : '';
    var segments = path.split('/');
    var out = [];
    var up = 0;
    for (var pos = 0; pos < segments.length; pos++) {
      var segment = segments[pos];
      switch (segment) {
        case '':
        case '.':
          break;
        case '..':
          if (out.length)
            out.pop();
          else
            up++;
          break;
        default:
          out.push(segment);
      }
    }
    if (!leadingSlash) {
      while (up-- > 0) {
        out.unshift('..');
      }
      if (out.length === 0)
        out.push('.');
    }
    return leadingSlash + out.join('/') + trailingSlash;
  }
  function joinAndCanonicalizePath(parts) {
    var path = parts[ComponentIndex.PATH] || '';
    path = removeDotSegments(path);
    parts[ComponentIndex.PATH] = path;
    return buildFromEncodedParts(parts[ComponentIndex.SCHEME], parts[ComponentIndex.USER_INFO], parts[ComponentIndex.DOMAIN], parts[ComponentIndex.PORT], parts[ComponentIndex.PATH], parts[ComponentIndex.QUERY_DATA], parts[ComponentIndex.FRAGMENT]);
  }
  function canonicalizeUrl(url) {
    var parts = split(url);
    return joinAndCanonicalizePath(parts);
  }
  function resolveUrl(base, url) {
    var parts = split(url);
    var baseParts = split(base);
    if (parts[ComponentIndex.SCHEME]) {
      return joinAndCanonicalizePath(parts);
    } else {
      parts[ComponentIndex.SCHEME] = baseParts[ComponentIndex.SCHEME];
    }
    for (var i = ComponentIndex.SCHEME; i <= ComponentIndex.PORT; i++) {
      if (!parts[i]) {
        parts[i] = baseParts[i];
      }
    }
    if (parts[ComponentIndex.PATH][0] == '/') {
      return joinAndCanonicalizePath(parts);
    }
    var path = baseParts[ComponentIndex.PATH];
    var index = path.lastIndexOf('/');
    path = path.slice(0, index + 1) + parts[ComponentIndex.PATH];
    parts[ComponentIndex.PATH] = path;
    return joinAndCanonicalizePath(parts);
  }
  function isAbsolute(name) {
    if (!name)
      return false;
    if (name[0] === '/')
      return true;
    var parts = split(name);
    if (parts[ComponentIndex.SCHEME])
      return true;
    return false;
  }
  $traceurRuntime.canonicalizeUrl = canonicalizeUrl;
  $traceurRuntime.isAbsolute = isAbsolute;
  $traceurRuntime.removeDotSegments = removeDotSegments;
  $traceurRuntime.resolveUrl = resolveUrl;
})();
(function(global) {
  'use strict';
  var $__2 = $traceurRuntime,
      canonicalizeUrl = $__2.canonicalizeUrl,
      resolveUrl = $__2.resolveUrl,
      isAbsolute = $__2.isAbsolute;
  var moduleInstantiators = Object.create(null);
  var baseURL;
  if (global.location && global.location.href)
    baseURL = resolveUrl(global.location.href, './');
  else
    baseURL = '';
  var UncoatedModuleEntry = function UncoatedModuleEntry(url, uncoatedModule) {
    this.url = url;
    this.value_ = uncoatedModule;
  };
  ($traceurRuntime.createClass)(UncoatedModuleEntry, {}, {});
  var ModuleEvaluationError = function ModuleEvaluationError(erroneousModuleName, cause) {
    this.message = this.constructor.name + ': ' + this.stripCause(cause) + ' in ' + erroneousModuleName;
    if (!(cause instanceof $ModuleEvaluationError) && cause.stack)
      this.stack = this.stripStack(cause.stack);
    else
      this.stack = '';
  };
  var $ModuleEvaluationError = ModuleEvaluationError;
  ($traceurRuntime.createClass)(ModuleEvaluationError, {
    stripError: function(message) {
      return message.replace(/.*Error:/, this.constructor.name + ':');
    },
    stripCause: function(cause) {
      if (!cause)
        return '';
      if (!cause.message)
        return cause + '';
      return this.stripError(cause.message);
    },
    loadedBy: function(moduleName) {
      this.stack += '\n loaded by ' + moduleName;
    },
    stripStack: function(causeStack) {
      var stack = [];
      causeStack.split('\n').some((function(frame) {
        if (/UncoatedModuleInstantiator/.test(frame))
          return true;
        stack.push(frame);
      }));
      stack[0] = this.stripError(stack[0]);
      return stack.join('\n');
    }
  }, {}, Error);
  var UncoatedModuleInstantiator = function UncoatedModuleInstantiator(url, func) {
    $traceurRuntime.superCall(this, $UncoatedModuleInstantiator.prototype, "constructor", [url, null]);
    this.func = func;
  };
  var $UncoatedModuleInstantiator = UncoatedModuleInstantiator;
  ($traceurRuntime.createClass)(UncoatedModuleInstantiator, {getUncoatedModule: function() {
      if (this.value_)
        return this.value_;
      try {
        return this.value_ = this.func.call(global);
      } catch (ex) {
        if (ex instanceof ModuleEvaluationError) {
          ex.loadedBy(this.url);
          throw ex;
        }
        throw new ModuleEvaluationError(this.url, ex);
      }
    }}, {}, UncoatedModuleEntry);
  function getUncoatedModuleInstantiator(name) {
    if (!name)
      return;
    var url = ModuleStore.normalize(name);
    return moduleInstantiators[url];
  }
  ;
  var moduleInstances = Object.create(null);
  var liveModuleSentinel = {};
  function Module(uncoatedModule) {
    var isLive = arguments[1];
    var coatedModule = Object.create(null);
    Object.getOwnPropertyNames(uncoatedModule).forEach((function(name) {
      var getter,
          value;
      if (isLive === liveModuleSentinel) {
        var descr = Object.getOwnPropertyDescriptor(uncoatedModule, name);
        if (descr.get)
          getter = descr.get;
      }
      if (!getter) {
        value = uncoatedModule[name];
        getter = function() {
          return value;
        };
      }
      Object.defineProperty(coatedModule, name, {
        get: getter,
        enumerable: true
      });
    }));
    Object.preventExtensions(coatedModule);
    return coatedModule;
  }
  var ModuleStore = {
    normalize: function(name, refererName, refererAddress) {
      if (typeof name !== "string")
        throw new TypeError("module name must be a string, not " + typeof name);
      if (isAbsolute(name))
        return canonicalizeUrl(name);
      if (/[^\.]\/\.\.\//.test(name)) {
        throw new Error('module name embeds /../: ' + name);
      }
      if (name[0] === '.' && refererName)
        return resolveUrl(refererName, name);
      return canonicalizeUrl(name);
    },
    get: function(normalizedName) {
      var m = getUncoatedModuleInstantiator(normalizedName);
      if (!m)
        return undefined;
      var moduleInstance = moduleInstances[m.url];
      if (moduleInstance)
        return moduleInstance;
      moduleInstance = Module(m.getUncoatedModule(), liveModuleSentinel);
      return moduleInstances[m.url] = moduleInstance;
    },
    set: function(normalizedName, module) {
      normalizedName = String(normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, (function() {
        return module;
      }));
      moduleInstances[normalizedName] = module;
    },
    get baseURL() {
      return baseURL;
    },
    set baseURL(v) {
      baseURL = String(v);
    },
    registerModule: function(name, func) {
      var normalizedName = ModuleStore.normalize(name);
      if (moduleInstantiators[normalizedName])
        throw new Error('duplicate module named ' + normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, func);
    },
    bundleStore: Object.create(null),
    register: function(name, deps, func) {
      if (!deps || !deps.length && !func.length) {
        this.registerModule(name, func);
      } else {
        this.bundleStore[name] = {
          deps: deps,
          execute: function() {
            var $__0 = arguments;
            var depMap = {};
            deps.forEach((function(dep, index) {
              return depMap[dep] = $__0[index];
            }));
            var registryEntry = func.call(this, depMap);
            registryEntry.execute.call(this);
            return registryEntry.exports;
          }
        };
      }
    },
    getAnonymousModule: function(func) {
      return new Module(func.call(global), liveModuleSentinel);
    },
    getForTesting: function(name) {
      var $__0 = this;
      if (!this.testingPrefix_) {
        Object.keys(moduleInstances).some((function(key) {
          var m = /(traceur@[^\/]*\/)/.exec(key);
          if (m) {
            $__0.testingPrefix_ = m[1];
            return true;
          }
        }));
      }
      return this.get(this.testingPrefix_ + name);
    }
  };
  ModuleStore.set('@traceur/src/runtime/ModuleStore', new Module({ModuleStore: ModuleStore}));
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
  };
  $traceurRuntime.ModuleStore = ModuleStore;
  global.System = {
    register: ModuleStore.register.bind(ModuleStore),
    get: ModuleStore.get,
    set: ModuleStore.set,
    normalize: ModuleStore.normalize
  };
  $traceurRuntime.getModuleImpl = function(name) {
    var instantiator = getUncoatedModuleInstantiator(name);
    return instantiator && instantiator.getUncoatedModule();
  };
})(typeof global !== 'undefined' ? global : this);
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/utils", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/utils";
  var $ceil = Math.ceil;
  var $floor = Math.floor;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var $pow = Math.pow;
  var $min = Math.min;
  var toObject = $traceurRuntime.toObject;
  function toUint32(x) {
    return x >>> 0;
  }
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function isCallable(x) {
    return typeof x === 'function';
  }
  function isNumber(x) {
    return typeof x === 'number';
  }
  function toInteger(x) {
    x = +x;
    if ($isNaN(x))
      return 0;
    if (x === 0 || !$isFinite(x))
      return x;
    return x > 0 ? $floor(x) : $ceil(x);
  }
  var MAX_SAFE_LENGTH = $pow(2, 53) - 1;
  function toLength(x) {
    var len = toInteger(x);
    return len < 0 ? 0 : $min(len, MAX_SAFE_LENGTH);
  }
  function checkIterable(x) {
    return !isObject(x) ? undefined : x[Symbol.iterator];
  }
  function isConstructor(x) {
    return isCallable(x);
  }
  function createIteratorResultObject(value, done) {
    return {
      value: value,
      done: done
    };
  }
  function maybeDefine(object, name, descr) {
    if (!(name in object)) {
      Object.defineProperty(object, name, descr);
    }
  }
  function maybeDefineMethod(object, name, value) {
    maybeDefine(object, name, {
      value: value,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  function maybeDefineConst(object, name, value) {
    maybeDefine(object, name, {
      value: value,
      configurable: false,
      enumerable: false,
      writable: false
    });
  }
  function maybeAddFunctions(object, functions) {
    for (var i = 0; i < functions.length; i += 2) {
      var name = functions[i];
      var value = functions[i + 1];
      maybeDefineMethod(object, name, value);
    }
  }
  function maybeAddConsts(object, consts) {
    for (var i = 0; i < consts.length; i += 2) {
      var name = consts[i];
      var value = consts[i + 1];
      maybeDefineConst(object, name, value);
    }
  }
  function maybeAddIterator(object, func, Symbol) {
    if (!Symbol || !Symbol.iterator || object[Symbol.iterator])
      return;
    if (object['@@iterator'])
      func = object['@@iterator'];
    Object.defineProperty(object, Symbol.iterator, {
      value: func,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  var polyfills = [];
  function registerPolyfill(func) {
    polyfills.push(func);
  }
  function polyfillAll(global) {
    polyfills.forEach((function(f) {
      return f(global);
    }));
  }
  return {
    get toObject() {
      return toObject;
    },
    get toUint32() {
      return toUint32;
    },
    get isObject() {
      return isObject;
    },
    get isCallable() {
      return isCallable;
    },
    get isNumber() {
      return isNumber;
    },
    get toInteger() {
      return toInteger;
    },
    get toLength() {
      return toLength;
    },
    get checkIterable() {
      return checkIterable;
    },
    get isConstructor() {
      return isConstructor;
    },
    get createIteratorResultObject() {
      return createIteratorResultObject;
    },
    get maybeDefine() {
      return maybeDefine;
    },
    get maybeDefineMethod() {
      return maybeDefineMethod;
    },
    get maybeDefineConst() {
      return maybeDefineConst;
    },
    get maybeAddFunctions() {
      return maybeAddFunctions;
    },
    get maybeAddConsts() {
      return maybeAddConsts;
    },
    get maybeAddIterator() {
      return maybeAddIterator;
    },
    get registerPolyfill() {
      return registerPolyfill;
    },
    get polyfillAll() {
      return polyfillAll;
    }
  };
});
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/Map", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/Map";
  var $__0 = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils"),
      isObject = $__0.isObject,
      maybeAddIterator = $__0.maybeAddIterator,
      registerPolyfill = $__0.registerPolyfill;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  var deletedSentinel = {};
  function lookupIndex(map, key) {
    if (isObject(key)) {
      var hashObject = getOwnHashObject(key);
      return hashObject && map.objectIndex_[hashObject.hash];
    }
    if (typeof key === 'string')
      return map.stringIndex_[key];
    return map.primitiveIndex_[key];
  }
  function initMap(map) {
    map.entries_ = [];
    map.objectIndex_ = Object.create(null);
    map.stringIndex_ = Object.create(null);
    map.primitiveIndex_ = Object.create(null);
    map.deletedCount_ = 0;
  }
  var Map = function Map() {
    var iterable = arguments[0];
    if (!isObject(this))
      throw new TypeError('Map called on incompatible type');
    if ($hasOwnProperty.call(this, 'entries_')) {
      throw new TypeError('Map can not be reentrantly initialised');
    }
    initMap(this);
    if (iterable !== null && iterable !== undefined) {
      for (var $__2 = iterable[Symbol.iterator](),
          $__3; !($__3 = $__2.next()).done; ) {
        var $__4 = $__3.value,
            key = $__4[0],
            value = $__4[1];
        {
          this.set(key, value);
        }
      }
    }
  };
  ($traceurRuntime.createClass)(Map, {
    get size() {
      return this.entries_.length / 2 - this.deletedCount_;
    },
    get: function(key) {
      var index = lookupIndex(this, key);
      if (index !== undefined)
        return this.entries_[index + 1];
    },
    set: function(key, value) {
      var objectMode = isObject(key);
      var stringMode = typeof key === 'string';
      var index = lookupIndex(this, key);
      if (index !== undefined) {
        this.entries_[index + 1] = value;
      } else {
        index = this.entries_.length;
        this.entries_[index] = key;
        this.entries_[index + 1] = value;
        if (objectMode) {
          var hashObject = getOwnHashObject(key);
          var hash = hashObject.hash;
          this.objectIndex_[hash] = index;
        } else if (stringMode) {
          this.stringIndex_[key] = index;
        } else {
          this.primitiveIndex_[key] = index;
        }
      }
      return this;
    },
    has: function(key) {
      return lookupIndex(this, key) !== undefined;
    },
    delete: function(key) {
      var objectMode = isObject(key);
      var stringMode = typeof key === 'string';
      var index;
      var hash;
      if (objectMode) {
        var hashObject = getOwnHashObject(key);
        if (hashObject) {
          index = this.objectIndex_[hash = hashObject.hash];
          delete this.objectIndex_[hash];
        }
      } else if (stringMode) {
        index = this.stringIndex_[key];
        delete this.stringIndex_[key];
      } else {
        index = this.primitiveIndex_[key];
        delete this.primitiveIndex_[key];
      }
      if (index !== undefined) {
        this.entries_[index] = deletedSentinel;
        this.entries_[index + 1] = undefined;
        this.deletedCount_++;
        return true;
      }
      return false;
    },
    clear: function() {
      initMap(this);
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      for (var i = 0; i < this.entries_.length; i += 2) {
        var key = this.entries_[i];
        var value = this.entries_[i + 1];
        if (key === deletedSentinel)
          continue;
        callbackFn.call(thisArg, value, key, this);
      }
    },
    entries: $traceurRuntime.initGeneratorFunction(function $__5() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return [key, value];
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__5, this);
    }),
    keys: $traceurRuntime.initGeneratorFunction(function $__6() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return key;
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__6, this);
    }),
    values: $traceurRuntime.initGeneratorFunction(function $__7() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return value;
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__7, this);
    })
  }, {});
  Object.defineProperty(Map.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Map.prototype.entries
  });
  function polyfillMap(global) {
    var $__4 = global,
        Object = $__4.Object,
        Symbol = $__4.Symbol;
    if (!global.Map)
      global.Map = Map;
    var mapPrototype = global.Map.prototype;
    if (mapPrototype.entries === undefined)
      global.Map = Map;
    if (mapPrototype.entries) {
      maybeAddIterator(mapPrototype, mapPrototype.entries, Symbol);
      maybeAddIterator(Object.getPrototypeOf(new global.Map().entries()), function() {
        return this;
      }, Symbol);
    }
  }
  registerPolyfill(polyfillMap);
  return {
    get Map() {
      return Map;
    },
    get polyfillMap() {
      return polyfillMap;
    }
  };
});
System.get("traceur-runtime@0.0.72/src/runtime/polyfills/Map" + '');
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/Set", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/Set";
  var $__0 = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils"),
      isObject = $__0.isObject,
      maybeAddIterator = $__0.maybeAddIterator,
      registerPolyfill = $__0.registerPolyfill;
  var Map = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/Map").Map;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  function initSet(set) {
    set.map_ = new Map();
  }
  var Set = function Set() {
    var iterable = arguments[0];
    if (!isObject(this))
      throw new TypeError('Set called on incompatible type');
    if ($hasOwnProperty.call(this, 'map_')) {
      throw new TypeError('Set can not be reentrantly initialised');
    }
    initSet(this);
    if (iterable !== null && iterable !== undefined) {
      for (var $__4 = iterable[Symbol.iterator](),
          $__5; !($__5 = $__4.next()).done; ) {
        var item = $__5.value;
        {
          this.add(item);
        }
      }
    }
  };
  ($traceurRuntime.createClass)(Set, {
    get size() {
      return this.map_.size;
    },
    has: function(key) {
      return this.map_.has(key);
    },
    add: function(key) {
      this.map_.set(key, key);
      return this;
    },
    delete: function(key) {
      return this.map_.delete(key);
    },
    clear: function() {
      return this.map_.clear();
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      var $__2 = this;
      return this.map_.forEach((function(value, key) {
        callbackFn.call(thisArg, key, key, $__2);
      }));
    },
    values: $traceurRuntime.initGeneratorFunction(function $__7() {
      var $__8,
          $__9;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__8 = this.map_.keys()[Symbol.iterator]();
              $ctx.sent = void 0;
              $ctx.action = 'next';
              $ctx.state = 12;
              break;
            case 12:
              $__9 = $__8[$ctx.action]($ctx.sentIgnoreThrow);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = ($__9.done) ? 3 : 2;
              break;
            case 3:
              $ctx.sent = $__9.value;
              $ctx.state = -2;
              break;
            case 2:
              $ctx.state = 12;
              return $__9.value;
            default:
              return $ctx.end();
          }
      }, $__7, this);
    }),
    entries: $traceurRuntime.initGeneratorFunction(function $__10() {
      var $__11,
          $__12;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__11 = this.map_.entries()[Symbol.iterator]();
              $ctx.sent = void 0;
              $ctx.action = 'next';
              $ctx.state = 12;
              break;
            case 12:
              $__12 = $__11[$ctx.action]($ctx.sentIgnoreThrow);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = ($__12.done) ? 3 : 2;
              break;
            case 3:
              $ctx.sent = $__12.value;
              $ctx.state = -2;
              break;
            case 2:
              $ctx.state = 12;
              return $__12.value;
            default:
              return $ctx.end();
          }
      }, $__10, this);
    })
  }, {});
  Object.defineProperty(Set.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Set.prototype.values
  });
  Object.defineProperty(Set.prototype, 'keys', {
    configurable: true,
    writable: true,
    value: Set.prototype.values
  });
  function polyfillSet(global) {
    var $__6 = global,
        Object = $__6.Object,
        Symbol = $__6.Symbol;
    if (!global.Set)
      global.Set = Set;
    var setPrototype = global.Set.prototype;
    if (setPrototype.values) {
      maybeAddIterator(setPrototype, setPrototype.values, Symbol);
      maybeAddIterator(Object.getPrototypeOf(new global.Set().values()), function() {
        return this;
      }, Symbol);
    }
  }
  registerPolyfill(polyfillSet);
  return {
    get Set() {
      return Set;
    },
    get polyfillSet() {
      return polyfillSet;
    }
  };
});
System.get("traceur-runtime@0.0.72/src/runtime/polyfills/Set" + '');
System.register("traceur-runtime@0.0.72/node_modules/rsvp/lib/rsvp/asap", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/node_modules/rsvp/lib/rsvp/asap";
  var len = 0;
  function asap(callback, arg) {
    queue[len] = callback;
    queue[len + 1] = arg;
    len += 2;
    if (len === 2) {
      scheduleFlush();
    }
  }
  var $__default = asap;
  var browserGlobal = (typeof window !== 'undefined') ? window : {};
  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
  function useNextTick() {
    return function() {
      process.nextTick(flush);
    };
  }
  function useMutationObserver() {
    var iterations = 0;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, {characterData: true});
    return function() {
      node.data = (iterations = ++iterations % 2);
    };
  }
  function useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    return function() {
      channel.port2.postMessage(0);
    };
  }
  function useSetTimeout() {
    return function() {
      setTimeout(flush, 1);
    };
  }
  var queue = new Array(1000);
  function flush() {
    for (var i = 0; i < len; i += 2) {
      var callback = queue[i];
      var arg = queue[i + 1];
      callback(arg);
      queue[i] = undefined;
      queue[i + 1] = undefined;
    }
    len = 0;
  }
  var scheduleFlush;
  if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
    scheduleFlush = useNextTick();
  } else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
  } else if (isWorker) {
    scheduleFlush = useMessageChannel();
  } else {
    scheduleFlush = useSetTimeout();
  }
  return {get default() {
      return $__default;
    }};
});
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/Promise", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/Promise";
  var async = System.get("traceur-runtime@0.0.72/node_modules/rsvp/lib/rsvp/asap").default;
  var registerPolyfill = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils").registerPolyfill;
  var promiseRaw = {};
  function isPromise(x) {
    return x && typeof x === 'object' && x.status_ !== undefined;
  }
  function idResolveHandler(x) {
    return x;
  }
  function idRejectHandler(x) {
    throw x;
  }
  function chain(promise) {
    var onResolve = arguments[1] !== (void 0) ? arguments[1] : idResolveHandler;
    var onReject = arguments[2] !== (void 0) ? arguments[2] : idRejectHandler;
    var deferred = getDeferred(promise.constructor);
    switch (promise.status_) {
      case undefined:
        throw TypeError;
      case 0:
        promise.onResolve_.push(onResolve, deferred);
        promise.onReject_.push(onReject, deferred);
        break;
      case +1:
        promiseEnqueue(promise.value_, [onResolve, deferred]);
        break;
      case -1:
        promiseEnqueue(promise.value_, [onReject, deferred]);
        break;
    }
    return deferred.promise;
  }
  function getDeferred(C) {
    if (this === $Promise) {
      var promise = promiseInit(new $Promise(promiseRaw));
      return {
        promise: promise,
        resolve: (function(x) {
          promiseResolve(promise, x);
        }),
        reject: (function(r) {
          promiseReject(promise, r);
        })
      };
    } else {
      var result = {};
      result.promise = new C((function(resolve, reject) {
        result.resolve = resolve;
        result.reject = reject;
      }));
      return result;
    }
  }
  function promiseSet(promise, status, value, onResolve, onReject) {
    promise.status_ = status;
    promise.value_ = value;
    promise.onResolve_ = onResolve;
    promise.onReject_ = onReject;
    return promise;
  }
  function promiseInit(promise) {
    return promiseSet(promise, 0, undefined, [], []);
  }
  var Promise = function Promise(resolver) {
    if (resolver === promiseRaw)
      return;
    if (typeof resolver !== 'function')
      throw new TypeError;
    var promise = promiseInit(this);
    try {
      resolver((function(x) {
        promiseResolve(promise, x);
      }), (function(r) {
        promiseReject(promise, r);
      }));
    } catch (e) {
      promiseReject(promise, e);
    }
  };
  ($traceurRuntime.createClass)(Promise, {
    catch: function(onReject) {
      return this.then(undefined, onReject);
    },
    then: function(onResolve, onReject) {
      if (typeof onResolve !== 'function')
        onResolve = idResolveHandler;
      if (typeof onReject !== 'function')
        onReject = idRejectHandler;
      var that = this;
      var constructor = this.constructor;
      return chain(this, function(x) {
        x = promiseCoerce(constructor, x);
        return x === that ? onReject(new TypeError) : isPromise(x) ? x.then(onResolve, onReject) : onResolve(x);
      }, onReject);
    }
  }, {
    resolve: function(x) {
      if (this === $Promise) {
        if (isPromise(x)) {
          return x;
        }
        return promiseSet(new $Promise(promiseRaw), +1, x);
      } else {
        return new this(function(resolve, reject) {
          resolve(x);
        });
      }
    },
    reject: function(r) {
      if (this === $Promise) {
        return promiseSet(new $Promise(promiseRaw), -1, r);
      } else {
        return new this((function(resolve, reject) {
          reject(r);
        }));
      }
    },
    all: function(values) {
      var deferred = getDeferred(this);
      var resolutions = [];
      try {
        var count = values.length;
        if (count === 0) {
          deferred.resolve(resolutions);
        } else {
          for (var i = 0; i < values.length; i++) {
            this.resolve(values[i]).then(function(i, x) {
              resolutions[i] = x;
              if (--count === 0)
                deferred.resolve(resolutions);
            }.bind(undefined, i), (function(r) {
              deferred.reject(r);
            }));
          }
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    },
    race: function(values) {
      var deferred = getDeferred(this);
      try {
        for (var i = 0; i < values.length; i++) {
          this.resolve(values[i]).then((function(x) {
            deferred.resolve(x);
          }), (function(r) {
            deferred.reject(r);
          }));
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    }
  });
  var $Promise = Promise;
  var $PromiseReject = $Promise.reject;
  function promiseResolve(promise, x) {
    promiseDone(promise, +1, x, promise.onResolve_);
  }
  function promiseReject(promise, r) {
    promiseDone(promise, -1, r, promise.onReject_);
  }
  function promiseDone(promise, status, value, reactions) {
    if (promise.status_ !== 0)
      return;
    promiseEnqueue(value, reactions);
    promiseSet(promise, status, value);
  }
  function promiseEnqueue(value, tasks) {
    async((function() {
      for (var i = 0; i < tasks.length; i += 2) {
        promiseHandle(value, tasks[i], tasks[i + 1]);
      }
    }));
  }
  function promiseHandle(value, handler, deferred) {
    try {
      var result = handler(value);
      if (result === deferred.promise)
        throw new TypeError;
      else if (isPromise(result))
        chain(result, deferred.resolve, deferred.reject);
      else
        deferred.resolve(result);
    } catch (e) {
      try {
        deferred.reject(e);
      } catch (e) {}
    }
  }
  var thenableSymbol = '@@thenable';
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function promiseCoerce(constructor, x) {
    if (!isPromise(x) && isObject(x)) {
      var then;
      try {
        then = x.then;
      } catch (r) {
        var promise = $PromiseReject.call(constructor, r);
        x[thenableSymbol] = promise;
        return promise;
      }
      if (typeof then === 'function') {
        var p = x[thenableSymbol];
        if (p) {
          return p;
        } else {
          var deferred = getDeferred(constructor);
          x[thenableSymbol] = deferred.promise;
          try {
            then.call(x, deferred.resolve, deferred.reject);
          } catch (r) {
            deferred.reject(r);
          }
          return deferred.promise;
        }
      }
    }
    return x;
  }
  function polyfillPromise(global) {
    if (!global.Promise)
      global.Promise = Promise;
  }
  registerPolyfill(polyfillPromise);
  return {
    get Promise() {
      return Promise;
    },
    get polyfillPromise() {
      return polyfillPromise;
    }
  };
});
System.get("traceur-runtime@0.0.72/src/runtime/polyfills/Promise" + '');
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/StringIterator", [], function() {
  "use strict";
  var $__2;
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/StringIterator";
  var $__0 = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils"),
      createIteratorResultObject = $__0.createIteratorResultObject,
      isObject = $__0.isObject;
  var toProperty = $traceurRuntime.toProperty;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var iteratedString = Symbol('iteratedString');
  var stringIteratorNextIndex = Symbol('stringIteratorNextIndex');
  var StringIterator = function StringIterator() {};
  ($traceurRuntime.createClass)(StringIterator, ($__2 = {}, Object.defineProperty($__2, "next", {
    value: function() {
      var o = this;
      if (!isObject(o) || !hasOwnProperty.call(o, iteratedString)) {
        throw new TypeError('this must be a StringIterator object');
      }
      var s = o[toProperty(iteratedString)];
      if (s === undefined) {
        return createIteratorResultObject(undefined, true);
      }
      var position = o[toProperty(stringIteratorNextIndex)];
      var len = s.length;
      if (position >= len) {
        o[toProperty(iteratedString)] = undefined;
        return createIteratorResultObject(undefined, true);
      }
      var first = s.charCodeAt(position);
      var resultString;
      if (first < 0xD800 || first > 0xDBFF || position + 1 === len) {
        resultString = String.fromCharCode(first);
      } else {
        var second = s.charCodeAt(position + 1);
        if (second < 0xDC00 || second > 0xDFFF) {
          resultString = String.fromCharCode(first);
        } else {
          resultString = String.fromCharCode(first) + String.fromCharCode(second);
        }
      }
      o[toProperty(stringIteratorNextIndex)] = position + resultString.length;
      return createIteratorResultObject(resultString, false);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__2), {});
  function createStringIterator(string) {
    var s = String(string);
    var iterator = Object.create(StringIterator.prototype);
    iterator[toProperty(iteratedString)] = s;
    iterator[toProperty(stringIteratorNextIndex)] = 0;
    return iterator;
  }
  return {get createStringIterator() {
      return createStringIterator;
    }};
});
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/String", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/String";
  var createStringIterator = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/StringIterator").createStringIterator;
  var $__1 = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils"),
      maybeAddFunctions = $__1.maybeAddFunctions,
      maybeAddIterator = $__1.maybeAddIterator,
      registerPolyfill = $__1.registerPolyfill;
  var $toString = Object.prototype.toString;
  var $indexOf = String.prototype.indexOf;
  var $lastIndexOf = String.prototype.lastIndexOf;
  function startsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) == start;
  }
  function endsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var pos = stringLength;
    if (arguments.length > 1) {
      var position = arguments[1];
      if (position !== undefined) {
        pos = position ? Number(position) : 0;
        if (isNaN(pos)) {
          pos = 0;
        }
      }
    }
    var end = Math.min(Math.max(pos, 0), stringLength);
    var start = end - searchLength;
    if (start < 0) {
      return false;
    }
    return $lastIndexOf.call(string, searchString, start) == start;
  }
  function contains(search) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) != -1;
  }
  function repeat(count) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var n = count ? Number(count) : 0;
    if (isNaN(n)) {
      n = 0;
    }
    if (n < 0 || n == Infinity) {
      throw RangeError();
    }
    if (n == 0) {
      return '';
    }
    var result = '';
    while (n--) {
      result += string;
    }
    return result;
  }
  function codePointAt(position) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var size = string.length;
    var index = position ? Number(position) : 0;
    if (isNaN(index)) {
      index = 0;
    }
    if (index < 0 || index >= size) {
      return undefined;
    }
    var first = string.charCodeAt(index);
    var second;
    if (first >= 0xD800 && first <= 0xDBFF && size > index + 1) {
      second = string.charCodeAt(index + 1);
      if (second >= 0xDC00 && second <= 0xDFFF) {
        return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
      }
    }
    return first;
  }
  function raw(callsite) {
    var raw = callsite.raw;
    var len = raw.length >>> 0;
    if (len === 0)
      return '';
    var s = '';
    var i = 0;
    while (true) {
      s += raw[i];
      if (i + 1 === len)
        return s;
      s += arguments[++i];
    }
  }
  function fromCodePoint() {
    var codeUnits = [];
    var floor = Math.floor;
    var highSurrogate;
    var lowSurrogate;
    var index = -1;
    var length = arguments.length;
    if (!length) {
      return '';
    }
    while (++index < length) {
      var codePoint = Number(arguments[index]);
      if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) != codePoint) {
        throw RangeError('Invalid code point: ' + codePoint);
      }
      if (codePoint <= 0xFFFF) {
        codeUnits.push(codePoint);
      } else {
        codePoint -= 0x10000;
        highSurrogate = (codePoint >> 10) + 0xD800;
        lowSurrogate = (codePoint % 0x400) + 0xDC00;
        codeUnits.push(highSurrogate, lowSurrogate);
      }
    }
    return String.fromCharCode.apply(null, codeUnits);
  }
  function stringPrototypeIterator() {
    var o = $traceurRuntime.checkObjectCoercible(this);
    var s = String(o);
    return createStringIterator(s);
  }
  function polyfillString(global) {
    var String = global.String;
    maybeAddFunctions(String.prototype, ['codePointAt', codePointAt, 'contains', contains, 'endsWith', endsWith, 'startsWith', startsWith, 'repeat', repeat]);
    maybeAddFunctions(String, ['fromCodePoint', fromCodePoint, 'raw', raw]);
    maybeAddIterator(String.prototype, stringPrototypeIterator, Symbol);
  }
  registerPolyfill(polyfillString);
  return {
    get startsWith() {
      return startsWith;
    },
    get endsWith() {
      return endsWith;
    },
    get contains() {
      return contains;
    },
    get repeat() {
      return repeat;
    },
    get codePointAt() {
      return codePointAt;
    },
    get raw() {
      return raw;
    },
    get fromCodePoint() {
      return fromCodePoint;
    },
    get stringPrototypeIterator() {
      return stringPrototypeIterator;
    },
    get polyfillString() {
      return polyfillString;
    }
  };
});
System.get("traceur-runtime@0.0.72/src/runtime/polyfills/String" + '');
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/ArrayIterator", [], function() {
  "use strict";
  var $__2;
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/ArrayIterator";
  var $__0 = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils"),
      toObject = $__0.toObject,
      toUint32 = $__0.toUint32,
      createIteratorResultObject = $__0.createIteratorResultObject;
  var ARRAY_ITERATOR_KIND_KEYS = 1;
  var ARRAY_ITERATOR_KIND_VALUES = 2;
  var ARRAY_ITERATOR_KIND_ENTRIES = 3;
  var ArrayIterator = function ArrayIterator() {};
  ($traceurRuntime.createClass)(ArrayIterator, ($__2 = {}, Object.defineProperty($__2, "next", {
    value: function() {
      var iterator = toObject(this);
      var array = iterator.iteratorObject_;
      if (!array) {
        throw new TypeError('Object is not an ArrayIterator');
      }
      var index = iterator.arrayIteratorNextIndex_;
      var itemKind = iterator.arrayIterationKind_;
      var length = toUint32(array.length);
      if (index >= length) {
        iterator.arrayIteratorNextIndex_ = Infinity;
        return createIteratorResultObject(undefined, true);
      }
      iterator.arrayIteratorNextIndex_ = index + 1;
      if (itemKind == ARRAY_ITERATOR_KIND_VALUES)
        return createIteratorResultObject(array[index], false);
      if (itemKind == ARRAY_ITERATOR_KIND_ENTRIES)
        return createIteratorResultObject([index, array[index]], false);
      return createIteratorResultObject(index, false);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__2), {});
  function createArrayIterator(array, kind) {
    var object = toObject(array);
    var iterator = new ArrayIterator;
    iterator.iteratorObject_ = object;
    iterator.arrayIteratorNextIndex_ = 0;
    iterator.arrayIterationKind_ = kind;
    return iterator;
  }
  function entries() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_ENTRIES);
  }
  function keys() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_KEYS);
  }
  function values() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_VALUES);
  }
  return {
    get entries() {
      return entries;
    },
    get keys() {
      return keys;
    },
    get values() {
      return values;
    }
  };
});
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/Array", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/Array";
  var $__0 = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/ArrayIterator"),
      entries = $__0.entries,
      keys = $__0.keys,
      values = $__0.values;
  var $__1 = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils"),
      checkIterable = $__1.checkIterable,
      isCallable = $__1.isCallable,
      isConstructor = $__1.isConstructor,
      maybeAddFunctions = $__1.maybeAddFunctions,
      maybeAddIterator = $__1.maybeAddIterator,
      registerPolyfill = $__1.registerPolyfill,
      toInteger = $__1.toInteger,
      toLength = $__1.toLength,
      toObject = $__1.toObject;
  function from(arrLike) {
    var mapFn = arguments[1];
    var thisArg = arguments[2];
    var C = this;
    var items = toObject(arrLike);
    var mapping = mapFn !== undefined;
    var k = 0;
    var arr,
        len;
    if (mapping && !isCallable(mapFn)) {
      throw TypeError();
    }
    if (checkIterable(items)) {
      arr = isConstructor(C) ? new C() : [];
      for (var $__2 = items[Symbol.iterator](),
          $__3; !($__3 = $__2.next()).done; ) {
        var item = $__3.value;
        {
          if (mapping) {
            arr[k] = mapFn.call(thisArg, item, k);
          } else {
            arr[k] = item;
          }
          k++;
        }
      }
      arr.length = k;
      return arr;
    }
    len = toLength(items.length);
    arr = isConstructor(C) ? new C(len) : new Array(len);
    for (; k < len; k++) {
      if (mapping) {
        arr[k] = typeof thisArg === 'undefined' ? mapFn(items[k], k) : mapFn.call(thisArg, items[k], k);
      } else {
        arr[k] = items[k];
      }
    }
    arr.length = len;
    return arr;
  }
  function of() {
    for (var items = [],
        $__4 = 0; $__4 < arguments.length; $__4++)
      items[$__4] = arguments[$__4];
    var C = this;
    var len = items.length;
    var arr = isConstructor(C) ? new C(len) : new Array(len);
    for (var k = 0; k < len; k++) {
      arr[k] = items[k];
    }
    arr.length = len;
    return arr;
  }
  function fill(value) {
    var start = arguments[1] !== (void 0) ? arguments[1] : 0;
    var end = arguments[2];
    var object = toObject(this);
    var len = toLength(object.length);
    var fillStart = toInteger(start);
    var fillEnd = end !== undefined ? toInteger(end) : len;
    fillStart = fillStart < 0 ? Math.max(len + fillStart, 0) : Math.min(fillStart, len);
    fillEnd = fillEnd < 0 ? Math.max(len + fillEnd, 0) : Math.min(fillEnd, len);
    while (fillStart < fillEnd) {
      object[fillStart] = value;
      fillStart++;
    }
    return object;
  }
  function find(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg);
  }
  function findIndex(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg, true);
  }
  function findHelper(self, predicate) {
    var thisArg = arguments[2];
    var returnIndex = arguments[3] !== (void 0) ? arguments[3] : false;
    var object = toObject(self);
    var len = toLength(object.length);
    if (!isCallable(predicate)) {
      throw TypeError();
    }
    for (var i = 0; i < len; i++) {
      var value = object[i];
      if (predicate.call(thisArg, value, i, object)) {
        return returnIndex ? i : value;
      }
    }
    return returnIndex ? -1 : undefined;
  }
  function polyfillArray(global) {
    var $__5 = global,
        Array = $__5.Array,
        Object = $__5.Object,
        Symbol = $__5.Symbol;
    maybeAddFunctions(Array.prototype, ['entries', entries, 'keys', keys, 'values', values, 'fill', fill, 'find', find, 'findIndex', findIndex]);
    maybeAddFunctions(Array, ['from', from, 'of', of]);
    maybeAddIterator(Array.prototype, values, Symbol);
    maybeAddIterator(Object.getPrototypeOf([].values()), function() {
      return this;
    }, Symbol);
  }
  registerPolyfill(polyfillArray);
  return {
    get from() {
      return from;
    },
    get of() {
      return of;
    },
    get fill() {
      return fill;
    },
    get find() {
      return find;
    },
    get findIndex() {
      return findIndex;
    },
    get polyfillArray() {
      return polyfillArray;
    }
  };
});
System.get("traceur-runtime@0.0.72/src/runtime/polyfills/Array" + '');
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/Object", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/Object";
  var $__0 = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils"),
      maybeAddFunctions = $__0.maybeAddFunctions,
      registerPolyfill = $__0.registerPolyfill;
  var $__1 = $traceurRuntime,
      defineProperty = $__1.defineProperty,
      getOwnPropertyDescriptor = $__1.getOwnPropertyDescriptor,
      getOwnPropertyNames = $__1.getOwnPropertyNames,
      isPrivateName = $__1.isPrivateName,
      keys = $__1.keys;
  function is(left, right) {
    if (left === right)
      return left !== 0 || 1 / left === 1 / right;
    return left !== left && right !== right;
  }
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      var props = keys(source);
      var p,
          length = props.length;
      for (p = 0; p < length; p++) {
        var name = props[p];
        if (isPrivateName(name))
          continue;
        target[name] = source[name];
      }
    }
    return target;
  }
  function mixin(target, source) {
    var props = getOwnPropertyNames(source);
    var p,
        descriptor,
        length = props.length;
    for (p = 0; p < length; p++) {
      var name = props[p];
      if (isPrivateName(name))
        continue;
      descriptor = getOwnPropertyDescriptor(source, props[p]);
      defineProperty(target, props[p], descriptor);
    }
    return target;
  }
  function polyfillObject(global) {
    var Object = global.Object;
    maybeAddFunctions(Object, ['assign', assign, 'is', is, 'mixin', mixin]);
  }
  registerPolyfill(polyfillObject);
  return {
    get is() {
      return is;
    },
    get assign() {
      return assign;
    },
    get mixin() {
      return mixin;
    },
    get polyfillObject() {
      return polyfillObject;
    }
  };
});
System.get("traceur-runtime@0.0.72/src/runtime/polyfills/Object" + '');
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/Number", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/Number";
  var $__0 = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils"),
      isNumber = $__0.isNumber,
      maybeAddConsts = $__0.maybeAddConsts,
      maybeAddFunctions = $__0.maybeAddFunctions,
      registerPolyfill = $__0.registerPolyfill,
      toInteger = $__0.toInteger;
  var $abs = Math.abs;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
  var MIN_SAFE_INTEGER = -Math.pow(2, 53) + 1;
  var EPSILON = Math.pow(2, -52);
  function NumberIsFinite(number) {
    return isNumber(number) && $isFinite(number);
  }
  ;
  function isInteger(number) {
    return NumberIsFinite(number) && toInteger(number) === number;
  }
  function NumberIsNaN(number) {
    return isNumber(number) && $isNaN(number);
  }
  ;
  function isSafeInteger(number) {
    if (NumberIsFinite(number)) {
      var integral = toInteger(number);
      if (integral === number)
        return $abs(integral) <= MAX_SAFE_INTEGER;
    }
    return false;
  }
  function polyfillNumber(global) {
    var Number = global.Number;
    maybeAddConsts(Number, ['MAX_SAFE_INTEGER', MAX_SAFE_INTEGER, 'MIN_SAFE_INTEGER', MIN_SAFE_INTEGER, 'EPSILON', EPSILON]);
    maybeAddFunctions(Number, ['isFinite', NumberIsFinite, 'isInteger', isInteger, 'isNaN', NumberIsNaN, 'isSafeInteger', isSafeInteger]);
  }
  registerPolyfill(polyfillNumber);
  return {
    get MAX_SAFE_INTEGER() {
      return MAX_SAFE_INTEGER;
    },
    get MIN_SAFE_INTEGER() {
      return MIN_SAFE_INTEGER;
    },
    get EPSILON() {
      return EPSILON;
    },
    get isFinite() {
      return NumberIsFinite;
    },
    get isInteger() {
      return isInteger;
    },
    get isNaN() {
      return NumberIsNaN;
    },
    get isSafeInteger() {
      return isSafeInteger;
    },
    get polyfillNumber() {
      return polyfillNumber;
    }
  };
});
System.get("traceur-runtime@0.0.72/src/runtime/polyfills/Number" + '');
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/polyfills", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/polyfills";
  var polyfillAll = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils").polyfillAll;
  polyfillAll(this);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
    polyfillAll(global);
  };
  return {};
});
System.get("traceur-runtime@0.0.72/src/runtime/polyfills/polyfills" + '');

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":1}],3:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_stores_47_alert__;
var store = ($___46__46__47_stores_47_alert__ = require("../stores/alert"), $___46__46__47_stores_47_alert__ && $___46__46__47_stores_47_alert__.__esModule && $___46__46__47_stores_47_alert__ || {default: $___46__46__47_stores_47_alert__}).default;
var actions = {
  open: function(config) {
    this.dispatcher.dispatch({
      action: 'openAlert',
      data: config
    });
  },
  close: function() {
    this.dispatcher.dispatch({action: 'closeAlert'});
  }
};
var actions = store.createActions(actions);
var $__default = actions;

//# sourceMappingURL=<compileOutput>


},{"../stores/alert":98}],4:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_stores_47_app__;
var store = ($___46__46__47_stores_47_app__ = require("../stores/app"), $___46__46__47_stores_47_app__ && $___46__46__47_stores_47_app__.__esModule && $___46__46__47_stores_47_app__ || {default: $___46__46__47_stores_47_app__}).default;
var actions = {
  freeze: function() {
    this.dispatcher.dispatch({action: 'freeze'});
  },
  unfreeze: function() {
    this.dispatcher.dispatch({action: 'unfreeze'});
  }
};
var actions = store.createActions(actions);
var $__default = actions;

//# sourceMappingURL=<compileOutput>


},{"../stores/app":99}],5:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_stores_47_blocks__;
var store = ($___46__46__47_stores_47_blocks__ = require("../stores/blocks"), $___46__46__47_stores_47_blocks__ && $___46__46__47_stores_47_blocks__.__esModule && $___46__46__47_stores_47_blocks__ || {default: $___46__46__47_stores_47_blocks__}).default;
var actions = {
  toggle: function(block) {
    var blocks = store.getOpen();
    var index = blocks.indexOf(block);
    if (index > -1) {
      blocks.splice(index, 1);
    } else {
      blocks.push(block);
    }
    this.dispatcher.dispatch({
      action: 'toggleBlock',
      data: blocks
    });
  },
  setOpen: function(payload) {
    this.dispatcher.dispatch({
      action: 'toggleBlock',
      data: payload
    });
  },
  setVisible: function(payload) {
    this.dispatcher.dispatch({
      action: 'setVisible',
      data: payload
    });
  }
};
var actions = store.createActions(actions);
var $__default = actions;

//# sourceMappingURL=<compileOutput>


},{"../stores/blocks":100}],6:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_stores_47_buttons__;
var store = ($___46__46__47_stores_47_buttons__ = require("../stores/buttons"), $___46__46__47_stores_47_buttons__ && $___46__46__47_stores_47_buttons__.__esModule && $___46__46__47_stores_47_buttons__ || {default: $___46__46__47_stores_47_buttons__}).default;
var actions = {click: function(name) {
    this.dispatcher.dispatch({
      action: 'buttonClick',
      data: name
    });
  }};
var actions = store.createActions(actions);
var $__default = actions;

//# sourceMappingURL=<compileOutput>


},{"../stores/buttons":101}],7:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_stores_47_current__;
var store = ($___46__46__47_stores_47_current__ = require("../stores/current"), $___46__46__47_stores_47_current__ && $___46__46__47_stores_47_current__.__esModule && $___46__46__47_stores_47_current__ || {default: $___46__46__47_stores_47_current__}).default;
var actions = {
  setSelected: function(payload) {
    this.dispatcher.dispatch({
      action: 'setSelected',
      data: payload
    });
  },
  clearSelected: function() {
    this.dispatcher.dispatch({
      action: 'setSelected',
      data: []
    });
  }
};
var actions = store.createActions(actions);
var $__default = actions;

//# sourceMappingURL=<compileOutput>


},{"../stores/current":102}],8:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_stores_47_save__;
var store = ($___46__46__47_stores_47_save__ = require("../stores/save"), $___46__46__47_stores_47_save__ && $___46__46__47_stores_47_save__.__esModule && $___46__46__47_stores_47_save__ || {default: $___46__46__47_stores_47_save__}).default;
var actions = {
  start: function() {
    this.dispatcher.dispatch({action: 'saveStart'});
  },
  save: function() {
    this.dispatcher.dispatch({action: 'saveSaving'});
  },
  stop: function() {
    this.dispatcher.dispatch({action: 'saveStop'});
  }
};
var actions = store.createActions(actions);
var $__default = actions;

//# sourceMappingURL=<compileOutput>


},{"../stores/save":103}],9:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_stores_47_user__;
var store = ($___46__46__47_stores_47_user__ = require("../stores/user"), $___46__46__47_stores_47_user__ && $___46__46__47_stores_47_user__.__esModule && $___46__46__47_stores_47_user__ || {default: $___46__46__47_stores_47_user__}).default;
var actions = {setUser: function(payload) {
    this.dispatcher.dispatch({
      action: 'setUser',
      data: payload
    });
  }};
var actions = store.createActions(actions);
var $__default = actions;

//# sourceMappingURL=<compileOutput>


},{"../stores/user":104}],10:[function(require,module,exports){
"use strict";
'use strict';
var Core = require('./api/core');
require('./api/items');
var Observe = require('./api/observe');
var View = require('./api/view');
var Model = require('./api/model');
var Controller = require('./api/controller');
var Utils = require('./api/utils');
var emitter = require('./api/emitter');
var validation = require('./api/validation');
function Adapt(config) {
  this.config = config;
  this.observe = new Observe(this);
  this.view = new View(this);
  this.model = new Model(this);
  this.controller = new Controller(this);
  this.invalidFields = [];
  this.validation = new validation();
  this.emitter = new emitter();
  var state = config.state;
  if (state) {
    if (Utils.isArray(state)) {
      this.state = state;
    } else {
      this.state = [state || 'default'];
    }
  } else {
    this.state = ['default'];
  }
}
Adapt.prototype.render = function(element) {
  var Perf = React.addons.Perf;
  var form = Core.components.form;
  console.dir(Core.components.select);
  Perf.start();
  React.renderComponent(form({adapt: this}), element);
  Perf.stop();
  console.table(Perf.printWasted());
  this.observe.digest();
};
Adapt.prototype.setState = function(state) {
  if (Utils.isArray(state)) {
    this.state = state;
  } else {
    this.state = [state];
  }
  this.observe.digest();
};
Adapt.prototype.addState = function(state) {
  this.state.push(state);
  this.observe.digest();
};
Adapt.prototype.removeState = function(state) {
  var index = this.state.indexOf(state);
  if (index > -1) {
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

//# sourceMappingURL=<compileOutput>


},{"./api/controller":11,"./api/core":12,"./api/emitter":13,"./api/items":15,"./api/model":16,"./api/observe":17,"./api/utils":18,"./api/validation":19,"./api/view":20}],11:[function(require,module,exports){
"use strict";
'use strict';
var Utils = require('./utils');
var adapt = require('./core');
function Controller() {}
function ControllerService(adapt) {
  this.$adapt = adapt;
  this.items = {};
  this.extendController(this.$adapt.config.controller, this.items);
  this.createController(this.$adapt.config.view, this.items);
}
ControllerService.prototype.createController = function(obj, target) {
  try {
    for (var i in obj) {
      var val;
      if (obj[i].tabType) {
        val = {
          tab: null,
          accordion: []
        }[obj[i].tabType];
      } else if (obj[i].type) {
        var item = adapt.component(obj[i].type.split(':')[0]);
        var possibleItem = Utils.convertToCamelCase(obj[i].type);
        if (adapt.components[possibleItem]) {
          item = adapt.components[possibleItem];
        }
        val = item.defaultModelValue !== undefined ? item.defaultModelValue : '';
      } else {
        val = null;
      }
      if (obj[i].items) {
        if (Utils.isArray(obj[i].items)) {
          var _this = this;
          obj[i].items.forEach(function(element, index, array) {
            _this.createController(element, target);
          });
        } else if (Utils.isObject(obj[i].items)) {
          this.createController(obj[i].items, target);
        }
      } else if (obj[i].model) {
        if (Utils.isObject(obj[i].model)) {
          if (target[i]) {
            for (var r = 0; r < target[i].value.length; r++) {
              this.createController(obj[i].model, target[i]);
            }
          } else {
            target[i] = {};
            this.createController(obj[i].model, target[i]);
          }
        } else {
          target[i] = {};
          for (var r = 0; r < obj[i].model.length; r++) {
            this.createController(obj[i].model[r].items, target[i]);
          }
        }
      } else if (obj[i].tabs) {
        for (var r = 0; r < obj[i].tabs.length; r++) {
          this.createController(obj[i].tabs[r].items, target);
        }
      } else {
        if (!target[i] && val !== null) {
          target[i] = {};
        }
      }
    }
  } catch (e) {
    console.warn(e.message);
  }
};
ControllerService.prototype.extendController = function(obj, target) {
  for (var i in obj) {
    if (!target[i]) {
      target[i] = [];
    }
    if (Utils.isArray(obj[i])) {
      var _this = this;
      console.log(obj[i]);
      obj[i].forEach(function(element, index) {
        target[i].push(element);
      });
    } else {
      target[i] = obj[i];
    }
  }
};
module.exports = ControllerService;

//# sourceMappingURL=<compileOutput>


},{"./core":12,"./utils":18}],12:[function(require,module,exports){
"use strict";
'use strict';
var Utils = require('./utils');
var Adapt = {};
Adapt.components = {};
Adapt.component = function component(name, config) {
  if (config) {
    if (config.extend) {
      config.extend.forEach(function(element, index) {
        config = Utils.extend(Utils.copy(config), Utils.copy(element));
      });
    }
    this.components[name] = React.createClass(config);
  }
  if (!this.components[name]) {
    throw new Error('[' + name + '] is not a component');
  }
  return this.components[name];
};
Adapt.mixins = {};
Adapt.mixin = function mixin(name, config) {
  if (config) {
    this.mixins[name] = config;
  }
  if (!this.mixins[name]) {
    throw new Error('[' + name + '] is not a mixin');
  }
  return this.mixins[name];
};
module.exports = Adapt;

//# sourceMappingURL=<compileOutput>


},{"./utils":18}],13:[function(require,module,exports){
"use strict";
var emitter = function emitter() {
  this.callbacks = {};
};
($traceurRuntime.createClass)(emitter, {
  on: function(name, callback) {
    if (!this.callbacks[name]) {
      this.callbacks[name] = [];
    }
    this.callbacks[name].push(callback);
  },
  off: function(name, callback) {
    var index = this.callbacks[name].indexOf(callback);
    if (index > -1) {
      this.callbacks[name].splice(index, 1);
    }
  },
  removeAll: function(name) {
    if (!this.callbacks[name])
      return;
    this.callbacks[name] = [];
  },
  emit: function(name) {
    if (!this.callbacks[name])
      return;
    this.callbacks[name].forEach(function(callback) {
      callback();
    });
  }
}, {});
module.exports = emitter;

//# sourceMappingURL=<compileOutput>


},{}],14:[function(require,module,exports){
"use strict";
'use strict';
var Utils = require('./utils');
function Find() {
  return function findItem(toFind) {
    var Service = this;
    function lookup(string, model) {
      var split = string.split('.');
      var tempModel = model;
      for (var i = 0; i < split.length; i++) {
        if (Utils.isArray(tempModel)) {
          if (tempModel.value) {
            tempModel = tempModel.value;
          }
          if (tempModel.items) {
            tempModel = tempModel.items;
          }
          var tm = [];
          for (var r = 0; r < tempModel.length; r++) {
            if (tempModel[r].value) {
              tempModel = tempModel[r].value;
            }
            if (tempModel[r].items) {
              tempModel = tempModel[r].items;
            }
            if (Utils.isArray(tempModel)) {
              tm.push(tempModel[r][split[i]]);
            } else {
              tm.push(tempModel[split[i]]);
            }
          }
          tempModel = tm;
        } else {
          tempModel = [tempModel[split[i]]];
        }
      }
      return tempModel;
    }
    var found;
    try {
      found = lookup(toFind, this.items);
    } catch (e) {
      found = {};
    }
    found.observe = function(callback, item) {
      if (!Service.observe[toFind]) {
        Service.observe[toFind] = {};
      }
      var val = item || 'value';
      if (!Service.observe[toFind][val]) {
        Service.observe[toFind][val] = [];
      }
      Service.observe[toFind][val].push(callback);
      Service.$adapt.observe.digest();
    };
    var addItem = function(index, parent, name, obj) {
      var originalOrder = Object.keys(parent.items);
      originalOrder.splice(index, 0, name);
      var oldParent = Utils.copy(parent.items);
      oldParent[name] = obj;
      var newParent = {};
      originalOrder.forEach(function(element, index) {
        newParent[element] = oldParent[element];
      });
      parent.items = newParent;
    };
    found.append = function(name, obj, defaultModelValue, defaultControllerValue) {
      var foundItem = found[0];
      var models = {};
      models[name] = obj;
      var newModel = {};
      var newController = {};
      if (defaultModelValue && !Utils.isString(defaultModelValue)) {
        var modelConfig = {};
        modelConfig[name] = defaultModelValue;
        newModel = Utils.copy(obj);
        Service.$adapt.model.extendModel(modelConfig, newModel);
      }
      if (!defaultControllerValue) {
        var controllerConfig = {};
        controllerConfig[name] = Utils.copy(obj);
        Service.$adapt.controller.createController(controllerConfig, newController);
      }
      Service.$adapt.model.createModel(models, newModel);
      var modelObj = Service.$adapt.model.items;
      modelObj[name] = {value: ''};
      var controllerObj = Service.$adapt.controller.items;
      controllerObj[name] = newController[name] || defaultControllerValue;
      if (defaultModelValue && Utils.isString(defaultModelValue)) {
        modelObj[name].value = defaultModelValue;
      } else {
        modelObj[name].value = newModel[name].value;
      }
      var index = Object.keys(foundItem.items).length;
      addItem(index, foundItem, name, obj);
      Service.$adapt.observe.digest();
    };
    found.destroy = function(name) {
      var foundItem = found[0];
      var originalOrder = Object.keys(foundItem.items);
      var index = originalOrder.indexOf(name);
      if (index > -1) {
        originalOrder.splice(index, 1);
        var oldParent = Utils.copy(foundItem.items);
        var newParent = {};
        var model = Service.$adapt.model.items;
        var controller = Service.$adapt.controller.items;
        originalOrder.forEach(function(element, index) {
          newParent[element] = oldParent[element];
        });
        delete model[name];
        delete controller[name];
        foundItem.items = newParent;
        Service.$adapt.observe.digest();
      }
    };
    found.setValue = function(expression) {
      Service.values[toFind] = expression;
      Service.$adapt.observe.digest();
    };
    return found;
  };
}
module.exports = Find;

//# sourceMappingURL=<compileOutput>


},{"./utils":18}],15:[function(require,module,exports){
"use strict";
require('../components/form');
require('../components/loop');
require('../mixins/flat');
require('../mixins/object');
require('../mixins/arrayObject');
require('../mixins/array');
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
require('../components/item');
require('../components/textarea');
require('../components/input');
require('../components/inputDate');
require('../components/select');
require('../components/selectMultiple');
require('../components/checkbox');
require('../components/radio');
require('../components/button');

//# sourceMappingURL=<compileOutput>


},{"../components/accordion":21,"../components/button":22,"../components/checkbox":23,"../components/column":24,"../components/columnRows":25,"../components/description":26,"../components/form":27,"../components/header":28,"../components/hr":29,"../components/input":30,"../components/inputDate":31,"../components/item":32,"../components/label":33,"../components/loop":34,"../components/radio":35,"../components/select":36,"../components/selectMultiple":37,"../components/tabcordion":38,"../components/table":39,"../components/tabs":40,"../components/textarea":41,"../mixins/array":42,"../mixins/arrayObject":43,"../mixins/flat":44,"../mixins/object":45}],16:[function(require,module,exports){
"use strict";
'use strict';
var Find = require('./find');
var Utils = require('./utils');
var adapt = require('./core');
function Model() {}
function ModelService(adapt) {
  this.$adapt = adapt;
  this.items = new Model();
  this.extendModel(this.$adapt.config.model, this.items);
  this.createModel(this.$adapt.config.view, this.items);
  this.find = new Find();
  this.values = {};
  this.observe = {};
}
ModelService.prototype.createModel = function(obj, target) {
  try {
    for (var i in obj) {
      if (!obj[i].type && !obj[i].tabType) {
        console.warn('[model]: No type selected, assuming model data doesn\'t exist');
      }
      var val;
      if (obj[i].tabType) {
        val = {
          tab: null,
          accordion: []
        }[obj[i].tabType];
      } else if (obj[i].type) {
        var item = adapt.component(obj[i].type.split(':')[0]);
        var possibleItem = Utils.convertToCamelCase(obj[i].type);
        if (adapt.components[possibleItem]) {
          item = adapt.components[possibleItem];
        }
        val = item.defaultModelValue !== undefined ? item.defaultModelValue : '';
      } else {
        val = null;
      }
      if (obj[i].items) {
        if (Utils.isArray(obj[i].items)) {
          var _this = this;
          obj[i].items.forEach(function(element, index, array) {
            _this.createModel(element, target);
          });
        } else if (Utils.isObject(obj[i].items)) {
          this.createModel(obj[i].items, target);
        }
      } else if (obj[i].model) {
        if (Utils.isObject(obj[i].model)) {
          if (target[i]) {
            for (var r = 0; r < target[i].value.length; r++) {
              this.createModel(obj[i].model, target[i].value[r]);
            }
          } else {
            target[i] = {value: []};
          }
        } else {
          target[i] = {value: []};
          for (var r = 0; r < obj[i].model.length; r++) {
            target[i].value.push({});
            this.createModel(obj[i].model[r].items, target[i].value[r]);
          }
        }
      } else if (obj[i].tabs) {
        for (var r = 0; r < obj[i].tabs.length; r++) {
          this.createModel(obj[i].tabs[r].items, target);
        }
      } else {
        if (!target[i] && val !== null) {
          target[i] = {value: val};
        }
      }
    }
  } catch (e) {
    console.warn(e.message);
  }
};
ModelService.prototype.extendModel = function(obj, target) {
  for (var i in obj) {
    if (!target[i]) {
      target[i] = {};
    }
    if (Utils.isArray(obj[i])) {
      target[i].value = [];
      var _this = this;
      obj[i].forEach(function(element, index) {
        if (Utils.isObject(element)) {
          target[i].value.push({});
          _this.extendModel(element, target[i].value[index]);
        } else {
          target[i].value = obj[i];
        }
      });
    } else if (Utils.isObject(obj[i])) {} else {
      target[i].value = obj[i];
    }
  }
};
module.exports = ModelService;

//# sourceMappingURL=<compileOutput>


},{"./core":12,"./find":14,"./utils":18}],17:[function(require,module,exports){
"use strict";
'use strict';
var Utils = require('./utils');
function Observe(adapt) {
  this.adapt = adapt;
  this.records = [];
  this.children = {};
}
Observe.prototype.addListener = function addListener(watchExp, listener) {
  var records = this.records;
  var listenerObj = {
    watchExp: watchExp,
    listener: listener,
    lastValue: ''
  };
  records.push(listenerObj);
  return function() {
    records.splice(records.indexOf(listenerObj), 1);
  };
};
Observe.prototype.digest = function digest() {
  var dirty;
  var ttl = 10;
  do {
    var length = this.records.length;
    dirty = false;
    while (length--) {
      var item = this.records[length];
      if (item) {
        var newVal = item.watchExp(),
            oldVal = item.lastValue;
        if (!Utils.equals(newVal, oldVal)) {
          if (!(Utils.isArray(newVal) || Utils.isObject(newVal))) {
            item.lastValue = newVal;
          } else {
            item.lastValue = Utils.copy(newVal);
          }
          var params = [newVal, oldVal];
          if (Utils.isArray(newVal) && Utils.isArray(oldVal)) {
            params.push(Utils.arrayDiff(newVal, oldVal));
          }
          this.adapt.emitter.emit('fieldUpdated');
          item.listener.apply(this, params);
          dirty = true;
        } else {
          dirty = false;
        }
      }
    }
    if (dirty && !(ttl--)) {
      throw 'Maximum digest iterations reached';
    }
  } while (dirty);
  for (var i in this.children) {
    this.children[i].digest();
  }
};
module.exports = Observe;

//# sourceMappingURL=<compileOutput>


},{"./utils":18}],18:[function(require,module,exports){
"use strict";
'use strict';
var Utils = {
  isValid: function(children, toReturn) {
    toReturn = typeof toReturn === 'undefined' ? true : toReturn;
    for (var i in children) {
      if (typeof children[i].valid !== 'undefined') {
        if (children[i].valid === false) {
          toReturn = false;
        }
      }
      if (children[i].items) {
        toReturn = this.isValid(children[i].items, toReturn);
      }
      if (children[i].model) {
        toReturn = this.isValid(children[i].model, toReturn);
      }
    }
    return toReturn;
  },
  copy: function(source, destination) {
    if (!destination) {
      if (this.isArray(source)) {
        destination = [];
      } else if (this.isObject(source)) {
        destination = {};
      } else {
        throw new Error(typeof source + ' is not supported by Utils.copy');
      }
    }
    for (var i in source) {
      destination[i] = source[i];
    }
    return destination;
  },
  arrayDiff: function(a1, a2) {
    var differences = [];
    for (var i = 0; i < a1.length; i++) {
      if (a2.indexOf(a1[i]) === -1) {
        differences.push({
          action: 'added',
          value: a1[i]
        });
      }
    }
    for (var i = 0; i < a2.length; i++) {
      if (a1.indexOf(a2[i]) === -1) {
        differences.push({
          action: 'removed',
          value: a2[i]
        });
      }
    }
    return differences;
  },
  equals: function(o1, o2) {
    if (o1 === o2)
      return true;
    if (o1 === null || o2 === null)
      return false;
    if (o1 !== o1 && o2 !== o2)
      return true;
    var t1 = typeof o1,
        t2 = typeof o2,
        length,
        key,
        keySet;
    if (t1 == t2) {
      if (t1 == 'object') {
        if (this.isArray(o1)) {
          if (!this.isArray(o2))
            return false;
          if ((length = o1.length) == o2.length) {
            for (key = 0; key < length; key++) {
              if (!this.equals(o1[key], o2[key]))
                return false;
            }
            return true;
          }
        } else if (this.isDate(o1)) {
          if (!this.isDate(o2))
            return false;
          return this.equals(o1.getTime(), o2.getTime());
        } else if (this.isRegExp(o1) && this.isRegExp(o2)) {
          return o1.toString() == o2.toString();
        } else {
          keySet = {};
          for (key in o1) {
            if (key.charAt(0) === '$' || this.isFunction(o1[key]))
              continue;
            if (!this.equals(o1[key], o2[key]))
              return false;
            keySet[key] = true;
          }
          for (key in o2) {
            if (!keySet.hasOwnProperty(key) && key.charAt(0) !== '$' && o2[key] !== undefined && !this.isFunction(o2[key]))
              return false;
          }
          return true;
        }
      }
    }
    return false;
  },
  convertToCamelCase: function(string) {
    return string.replace(/:([a-z])/g, function(g) {
      return g[1].toUpperCase();
    });
  },
  extend: function(source, destination) {
    for (var i in source) {
      destination[i] = source[i];
    }
    return destination;
  },
  findClosestParent: function(event, className) {
    var parent = event.parentNode;
    while (parent != document.body && parent != null) {
      if ((parent) && parent.className && parent.className.indexOf(className) != -1) {
        return parent;
      } else {
        parent = parent ? parent.parentNode : null;
      }
    }
    return null;
  },
  checkState: function(state, currentState) {
    var _this = this;
    function compareState(stateName, currentState) {
      var show = false;
      if (stateName) {
        if (_this.isString(stateName)) {
          show = stateName === currentState;
        } else if (_this.isArray(stateName)) {
          var index = stateName.indexOf(currentState);
          show = index > -1;
        }
      }
      return show;
    }
    if (state) {
      var show = false;
      if (this.isArray(currentState)) {
        currentState.forEach(function(element) {
          var result = compareState(state, element);
          if (!!result) {
            show = true;
          }
        }, this);
      } else {
        show = compareState(state, currentState);
      }
      return show;
    }
    return true;
  }
};
var objTypes = ['Array', 'Object', 'String', 'Date', 'RegExp', 'Function', 'Boolean', 'Number', 'Null', 'Undefined'];
for (var i = objTypes.length; i--; ) {
  Utils['is' + objTypes[i]] = (function(objectType) {
    return function(elem) {
      return toString.call(elem).slice(8, -1) === objectType;
    };
  })(objTypes[i]);
}
module.exports = Utils;

//# sourceMappingURL=<compileOutput>


},{}],19:[function(require,module,exports){
"use strict";
var validation = function validation(adapt, invalidFields, toNotify) {
  this.children = [];
  this.callbacks = {};
  this.adapt = adapt;
  this.invalidFields = invalidFields;
  this.toNotify = toNotify;
};
($traceurRuntime.createClass)(validation, {
  on: function(name, callback) {
    if (!this.callbacks[name]) {
      this.callbacks[name] = [];
    }
    this.callbacks[name].push(callback);
  },
  off: function(name, callback) {
    var index = this.callbacks[name].indexOf(callback);
    this.callbacks[name].splice(index, 1);
  },
  emit: function(name) {
    if (!this.callbacks[name])
      return;
    this.callbacks[name].forEach(function(callback) {
      callback();
    });
    this.children.forEach((function(child) {
      return child.emit(name);
    }));
  },
  custom: function(string, callback, thisArg) {
    var results;
    if (!!string && (results = callback.call(thisArg, string))) {
      return results;
    }
  },
  required: function(string, isRequired) {
    if (isRequired && (!string || String(string).trim().length === 0)) {
      return {
        passed: false,
        message: 'Field is required'
      };
    }
  },
  validate: function(string, rules, name, thisArg) {
    var $__0 = this;
    var errors = [];
    var passed = true;
    for (var i in rules) {
      var result;
      if (this[i] && (result = this[i](string, rules[i], thisArg))) {
        if (!result.passed) {
          errors.push(result.message);
          this.passed = passed = false;
        }
      }
    }
    name = (this.id || '') + name;
    var index = this.invalidFields.indexOf(name);
    var previousLength = this.invalidFields.length;
    if (!passed && index === -1) {
      this.invalidFields.push(name);
      this.adapt.invalidFields.push(name);
    } else if (passed && index > -1) {
      this.invalidFields.splice(index, 1);
      this.adapt.invalidFields.splice(index, 1);
    }
    var newLength = this.invalidFields.length;
    if (previousLength === 0 && newLength > 0 || newLength === 0 && previousLength > 0) {
      setTimeout((function() {
        ($__0.toNotify || $__0.parent).emit('updatedValidation');
        $__0.adapt.validation.emit('updatedValidation');
      }), 0);
    }
    setTimeout((function() {
      $__0.emit('reValidate');
    }), 0);
    return errors;
  },
  maxNumber: function(number, max) {
    if (!!number && number > max) {
      return {
        passed: false,
        message: ("The maximum value allowed is " + max)
      };
    }
  },
  minNumber: function(number, min) {
    if (!!number && number < min) {
      return {
        passed: false,
        message: ("The minimum value allowed is " + min)
      };
    }
  },
  length: function(string, length) {
    if (!!string && string.length !== length) {
      return {
        passed: false,
        message: ("Must be " + length + " characters")
      };
    }
  },
  maxLength: function(string, max) {
    if (!!string && string.length > max) {
      return {
        passed: false,
        message: ("The maximum length allowed is " + max + " characters")
      };
    }
  },
  pattern: function(string, pattern) {
    var exp = new RegExp(pattern.pattern, pattern.flag);
    if (!!string && !exp.test(string)) {
      return {
        passed: false,
        message: pattern.message
      };
    }
  },
  minLength: function(string, min) {
    if (!!string && string.length < min) {
      return {
        passed: false,
        message: ("The minimum length allowed is " + min + " characters")
      };
    }
  },
  validateAll: function() {
    this.passed = true;
    this.emit('validate');
    this.emit('reValidate');
    return this.passed;
  }
}, {});
module.exports = validation;

//# sourceMappingURL=<compileOutput>


},{}],20:[function(require,module,exports){
"use strict";
'use strict';
var Find = require('./find');
function View(items) {
  for (var i in items) {
    this[i] = items[i];
  }
}
function ViewService(adapt) {
  this.$adapt = adapt;
  this.items = {};
  this.createView(this.$adapt.config.view, this.items);
  this.find = new Find();
}
ViewService.prototype.createView = function createView(obj, target) {
  for (var i in obj) {
    target[i] = new View(obj[i]);
    if (obj[i].items) {
      this.createView(obj[i].items, target[i].items);
    }
  }
};
module.exports = ViewService;

//# sourceMappingURL=<compileOutput>


},{"./find":14}],21:[function(require,module,exports){
"use strict";
'use strict';
var adapt = require('../api/core');
var Utils = require('../api/utils');
var AdaptAccordion = {
  displayName: 'AdaptAccordion',
  extend: [adapt.mixins.arrayObject],
  getInitialState: function() {
    return {open: -1};
  },
  openAccordion: function(id) {
    this.setState({open: id == this.state.open ? -1 : id});
  },
  render: function() {
    var cx = React.addons.classSet;
    var item = this.props.config.item;
    var config = this.props.config;
    var openID = this.state.open;
    var items = [];
    var model = config.model[config.name].value;
    var loop = adapt.components.loop;
    var _this = this;
    if (model) {
      var childController = config.controller[config.name];
      var childModel = config.model[config.name].value;
      var dynamicItem = adapt.components.item;
      for (var i = 0; i < model.length; i++) {
        var children = [];
        var finalModel = childModel[i];
        children = loop({
          items: item.model,
          controller: childController,
          values: config.values,
          observe: config.observe,
          nameTrail: config.nameTrail + config.name + '.',
          model: finalModel,
          adapt: _this.props.adapt
        });
        var title = 'Item';
        if (item.title) {
          var REGEX_CURLY = /{([^}]+)}/g;
          title = item.title;
          title = title.replace(REGEX_CURLY, function(match) {
            if (match === '{index}') {
              return i + 1;
            }
            var possibleVariable = match.replace('{', '').replace('}', '');
            if (finalModel[possibleVariable]) {
              return finalModel[possibleVariable];
            }
            return false;
          });
        }
        var titleClasses = cx({
          'element__accordion--title': true,
          'open': i === openID
        });
        var contentClasses = cx({
          'element__accordion--content': true,
          'open': i === openID
        });
        items.push(React.createElement("div", {className: "element__accordion--child"}, React.createElement("div", {
          className: titleClasses,
          onClick: this.openAccordion.bind(this, i)
        }, React.createElement("h3", null, title), React.createElement("i", {className: "fa fa-chevron-down"}), React.createElement("i", {className: "fa fa-chevron-up"})), React.createElement("a", {
          className: "element__accordion--remove no-select",
          onClick: this.remove.bind(this, i)
        }, React.createElement("i", {className: "fa fa-times"})), React.createElement("div", {className: contentClasses}, children)));
      }
      ;
    }
    var title;
    if (item.title) {
      var header = adapt.components.header;
      title = header({
        config: {item: {
            title: item.title,
            type: 'header:h2'
          }},
        adapt: this.props.adapt
      });
    }
    return (React.createElement("div", {className: "element__accordion clear"}, React.createElement("header", {className: "element__accordion--header"}, title, React.createElement("div", {
      className: "element__button element__button--add no-select",
      onClick: this.add
    }, React.createElement("i", {className: "fa fa-plus"}), " Add Item")), items));
  }
};
adapt.component('accordion', AdaptAccordion);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12,"../api/utils":18}],22:[function(require,module,exports){
"use strict";
var adapt = require('../api/core');
var Utils = require('../api/utils');
var AdaptButton = {
  statics: {defaultModelValue: []},
  getInitialState: function() {
    var config = this.props.config;
    return {model: Utils.copy(config.model[config.name].value)};
  },
  displayName: 'AdaptButton',
  setObservers: function() {
    var that = this;
    var config = this.props.config;
    var observers = config.observe[config.nameTrail + config.name];
    for (var i in observers) {
      observers[i].forEach(function(element, index) {
        that.listeners.push(that.props.adapt.observe.addListener(function() {
          return config.model[config.name][i] || config.item[i];
        }, element));
      });
    }
  },
  listeners: [],
  componentWillUnmount: function() {
    this.state.listeners.forEach(function(element) {
      element();
    });
  },
  toggleCheckbox: function(key) {
    var model = this.state.model;
    var index = model.indexOf(key);
    if (index > -1) {
      model.splice(index, 1);
    } else {
      model.push(key);
    }
    this.props.config.model[this.props.config.name].value = model;
    this.props.adapt.observe.digest();
    this.setState({
      model: model,
      na: !model.length
    });
  },
  componentWillMount: function() {
    var that = this;
    var config = this.props.config;
    var model = config.model[config.name];
    var expressionValue;
    if (config.observe[config.nameTrail + config.name]) {
      this.setObservers();
    }
  },
  render: function() {
    var cx = React.addons.classSet;
    var model = this.state.model,
        type = this.state.type,
        item = this.props.config.item;
    var naSelected = this.state.na || !model.length;
    var label = adapt.component('label');
    var checkboxes = [];
    var items = item.options;
    return (React.createElement("div", {className: "field field__checkbox"}, typeof item.label === 'undefined' ? '' : React.createElement(adapt.components.label, {
      config: {item: item},
      adapt: this.props.adapt
    }), React.createElement("div", {className: "field__checkbox--container"}, typeof item.desc === 'undefined' ? '' : React.createElement(adapt.components.description, {
      config: {item: item},
      adapt: this.props.adapt
    }))));
  }
};
adapt.component('button', AdaptButton);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12,"../api/utils":18}],23:[function(require,module,exports){
"use strict";
'use strict';
var adapt = require('../api/core');
var utils = require('../api/utils');
var AdaptCheckbox = {
  statics: {defaultModelValue: []},
  validateModel: function(value) {
    var name = this.props.config.name;
    var model = this.props.model;
    var view = this.props.config.item;
    var rules = {};
    var errors = {};
    var controller = {};
    if (this.props.config.controller && this.props.config.controller[this.props.config.name]) {
      controller = this.props.config.controller[this.props.config.name];
    }
    var validate = controller.validation;
    if (validate) {
      if (validate.onType && typeof value !== 'undefined') {
        rules = utils.isBoolean(validate.onType) ? validate : validate.onType;
        if (errors = this.props.validation.validate(value, rules, this.props.config.nameTrail + this.props.config.name, this.props.config.model)) {
          this.setState({errors: errors});
          view.valid = !errors.length;
        }
      } else if (typeof value === 'undefined') {
        value = model[name].value;
        if (errors = this.props.validation.validate(value, validate, this.props.config.nameTrail + this.props.config.name, this.props.config.model)) {
          this.setState({errors: errors});
          view.valid = !errors.length;
        }
      }
    }
  },
  getInitialState: function() {
    var config = this.props.config;
    return {model: utils.copy(config.model[config.name].value)};
  },
  displayName: 'AdaptCheckbox',
  setObservers: function() {
    var _this = this;
    var config = this.props.config;
    var observers = config.observe[config.nameTrail + config.name];
    for (var i in observers) {
      observers[i].forEach(function(element, index) {
        _this.listeners.push(_this.props.adapt.observe.addListener(function() {
          return config.model[config.name][i] || config.item[i];
        }, element));
      });
    }
  },
  listeners: [],
  componentWillUnmount: function() {
    this.props.validation.off('validate', this.validateModel);
    this.state.listeners.forEach(function(element) {
      element();
    });
  },
  toggleCheckbox: function(key) {
    var model = this.state.model;
    var config = this.props.config;
    var index = model.indexOf(key);
    if (index > -1) {
      model.splice(index, 1);
    } else {
      model.push(key);
    }
    this.validateModel(model);
    config.model[config.name].value = model;
    this.props.adapt.observe.digest();
    this.setState({
      model: model,
      na: !model.length
    });
  },
  componentWillMount: function() {
    var config = this.props.config;
    this.validateModel(config.model[config.name].value);
    this.props.validation.on('validate', this.validateModel);
    if (config.observe[config.nameTrail + config.name]) {
      this.setObservers();
    }
  },
  toggleNA: function() {
    var model = this.state.model;
    var na;
    var config = this.props.config;
    if (model.length) {
      this.oldValues = model;
      na = true;
      model = [];
      this.setState({
        na: true,
        model: []
      });
    } else {
      if (this.state.na) {
        na = false;
        model = this.oldValues || [];
      } else {
        na = true;
      }
    }
    config.model[config.name].value = model;
    this.props.adapt.observe.digest();
    this.setState({
      model: model,
      na: na
    });
  },
  render: function() {
    var cx = React.addons.classSet;
    var model = this.state.model;
    var type = this.state.type;
    var item = this.props.config.item;
    var naSelected = this.state.na || !model.length;
    var label = adapt.component('label');
    var checkboxes = [];
    var items = item.options;
    var controller = {};
    if (this.props.config.controller && this.props.config.controller[this.props.config.name]) {
      controller = this.props.config.controller[this.props.config.name];
    }
    if (item.includeNA) {
      var classes = cx({
        'field__checkbox--item': true,
        'field__checkbox--active': naSelected,
        'field__checkbox--disabled': controller.disabled
      });
      checkboxes.push(React.createElement("div", {
        className: classes,
        key: "na",
        onClick: !controller.disabled ? this.toggleNA : function() {}
      }, React.createElement("i", {className: "fa fa-fw fa-check"}), React.createElement("i", {className: "fa fa-fw fa-times"}), "N/A"));
    }
    for (var i in items) {
      var classes = cx({
        'field__checkbox--item': true,
        'field__checkbox--active': model.indexOf(i) > -1,
        'field__checkbox--disabled': controller.disabled
      });
      checkboxes.push(React.createElement("div", {
        'data-locator': this.props.config.nameTrail + this.props.config.name + '-checkbox-' + i,
        className: classes,
        key: this.props.config.name + i,
        onClick: !controller.disabled ? this.toggleCheckbox.bind(this, i) : function() {}
      }, React.createElement("i", {className: "fa fa-fw fa-check"}), React.createElement("i", {className: "fa fa-fw fa-times"}), items[i]));
    }
    var label = null;
    if (item.label) {
      var labelComponent = adapt.components.label;
      label = labelComponent({
        config: {
          item: item,
          errors: this.state.errors,
          warning: this.state.warning
        },
        adapt: this.props.adapt
      });
    }
    var desc;
    if (item.desc) {
      var descComponent = adapt.components.description;
      desc = descComponent({
        config: {item: item},
        adapt: this.props.adapt
      });
    }
    return (React.createElement("div", {
      className: "field field__checkbox",
      'data-locator': this.props.config.nameTrail + this.props.config.name + '-container'
    }, label, checkboxes, React.createElement("div", {className: "field__checkbox--container"}, desc)));
  }
};
adapt.component('checkbox', AdaptCheckbox);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12,"../api/utils":18}],24:[function(require,module,exports){
"use strict";
var adapt = require('../api/core');
var Utils = require('../api/utils');
var AdaptColumn = {
  displayName: 'AdaptColumn',
  render: function() {
    var item = this.props.config.item;
    var view = item.items;
    var width = item.span;
    var columns = {};
    var that = this;
    var totalWidth = 0;
    if (Utils.isArray(width)) {
      width.forEach(function(element, index, array) {
        totalWidth += element;
      });
    }
    var _this = this;
    var t = 0;
    view.forEach(function(element, index, array) {
      if (t >= width.length) {
        t = 0;
      }
      var items = [];
      for (var i in element) {
        var item$__0 = element[i];
        var component = adapt.components[item$__0.type];
        var config = _this.props.config;
        items.push(component({
          scope: _this.props.scope,
          validation: _this.props.validation,
          adapt: _this.props.adapt,
          config: {
            model: config.model,
            name: i,
            item: item$__0,
            controller: config.controller,
            values: config.alues,
            observe: config.observe,
            nameTrail: config.nameTrail
          }
        }));
      }
      var className = 'column__container column__container--' + width;
      var style = {};
      if (Utils.isArray(width)) {
        className = 'column__container';
        style.width = ((width[t] / totalWidth) * (100 - width.length + 1)) + '%';
        if (t == width.length - 1) {
          style.marginRight = '0px';
        }
      }
      columns['column-' + index] = (React.createElement("div", {
        className: className,
        style: style
      }, items));
      t++;
    });
    return (React.createElement("div", {className: "column clear"}, columns));
  }
};
adapt.component('column', AdaptColumn);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12,"../api/utils":18}],25:[function(require,module,exports){
"use strict";
var adapt = require('../api/core');
var Utils = require('../api/utils');
var AdaptColumnRows = {
  displayName: 'AdaptColumnRows',
  getInitialState: function() {
    return {listeners: []};
  },
  componentWillMount: function() {
    var _this = this;
    this.state.listeners.push(this.props.adapt.observe.addListener(function() {
      return _this.props.config.item.items;
    }, function(newVal) {
      _this.forceUpdate();
    }));
  },
  componentWillUnmount: function() {
    this.state.listeners.forEach(function(element) {
      element();
    });
  },
  render: function() {
    var item = this.props.config.item;
    var view = item.items;
    var width = item.span;
    var columns = {};
    var that = this;
    var totalWidth = 0;
    if (Utils.isArray(width)) {
      width.forEach(function(element, index, array) {
        totalWidth += element;
      });
    }
    var r = 0;
    var t = 0;
    for (var i in view) {
      if (t >= width.length) {
        t = 0;
      }
      var items = {};
      var className = 'column__container column__container--' + width;
      var style = {};
      if (Utils.isArray(width)) {
        className = 'column__container';
        style.width = ((width[t] / totalWidth) * (100 - width.length + 1)) + '%';
        if (t == width.length - 1) {
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
        nameTrail: that.props.config.nameTrail,
        validation: that.props.validation,
        scope: that.props.scope
      };
      var item = (this.transferPropsTo(React.createElement(adapt.components.item, {config: config})));
      columns['column-' + r] = (React.createElement("div", {
        className: className,
        style: style
      }, item));
      r++;
      t++;
    }
    return (React.createElement("div", {className: "column clear"}, columns));
  }
};
adapt.component('columnRows', AdaptColumnRows);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12,"../api/utils":18}],26:[function(require,module,exports){
"use strict";
var adapt = require('../api/core');
var AdaptDescription = {
  displayName: 'AdaptDescription',
  componentWillMount: function() {
    var that = this;
    var item = this.props.config.item;
    this.listener = this.props.adapt.observe.addListener(function() {
      return item.desc;
    }, function(newVal, oldVal) {
      that.setState({text: newVal});
    });
  },
  componentWillUnmount: function() {
    this.listener();
  },
  getInitialState: function() {
    var config = this.props.config;
    return {text: config.item.desc};
  },
  render: function() {
    return React.createElement("p", {className: "field__description"}, this.props.config.item.desc);
  }
};
adapt.component('description', AdaptDescription);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12}],27:[function(require,module,exports){
"use strict";
'use strict';
var view = require('../api/view');
var model = require('../api/model');
var adapt = require('../api/core');
var observe = require('../api/observe');
var validation = require('../api/validation');
var AdaptForm = {
  displayName: 'AdaptForm',
  render: function() {
    var adaptInstance = this.props.adapt;
    var model = adaptInstance.model;
    var view = adaptInstance.view.items;
    var items = [];
    var dynamicItem = adapt.component('item');
    for (var prop in view) {
      var item = view[prop];
      if (!adaptInstance.observe.children[prop]) {
        adaptInstance.observe.children[prop] = new observe(adaptInstance);
        adaptInstance.observe.children[prop].parent = adaptInstance.observe;
      }
      if (!adaptInstance.validation.children[prop]) {
        adaptInstance.validation.children[prop] = new validation(adaptInstance, []);
        adaptInstance.validation.children[prop].parent = adaptInstance.validation;
      }
      var component = adapt.components[view[prop].type];
      items.push(component({
        scope: adaptInstance.observe.children[prop],
        validation: adaptInstance.validation.children[prop],
        adapt: adaptInstance,
        config: {
          model: model.items,
          values: model.values,
          observe: model.observe,
          controller: adaptInstance.controller.items,
          name: prop,
          nameTrail: '',
          item: view[prop]
        }
      }));
    }
    console.log('RENDER MAIN FORM');
    return (React.createElement("form", {
      className: "dynamic__form",
      autoComplete: "off"
    }, items));
  }
};
adapt.component('form', AdaptForm);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12,"../api/model":16,"../api/observe":17,"../api/validation":19,"../api/view":20}],28:[function(require,module,exports){
"use strict";
var adapt = require('../api/core');
var AdaptHeader = {
  displayName: 'AdaptHeader',
  componentWillMount: function() {
    var that = this;
    var item = this.props.config.item;
    this.listener = this.props.adapt.observe.addListener(function() {
      return item.label;
    }, function(newVal, oldVal) {
      that.setState({text: newVal});
    });
  },
  componentWillUnmount: function() {
    this.listener();
  },
  getInitialState: function() {
    var config = this.props.config;
    return {
      text: config.item.text,
      size: config.item.type.split(':')[1] || 'h1'
    };
  },
  render: function() {
    return React.createElement("span", {className: 'header header__' + this.state.size}, this.props.config.item.text);
  }
};
adapt.component('header', AdaptHeader);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12}],29:[function(require,module,exports){
"use strict";
var adapt = require('../api/core');
var AdaptHr = {
  displayName: 'AdaptHr',
  render: function() {
    return (React.createElement("div", {className: "element__hr"}));
  }
};
adapt.component('hr', AdaptHr);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12}],30:[function(require,module,exports){
"use strict";
var adapt = require('../api/core');
var AdaptInput = {
  extend: [adapt.mixins.flat],
  displayName: 'AdaptInput',
  handleType: function(e) {
    if (this.props.config.item.type === 'input:number' && (isNaN(e.target.value) || e.target.value < 0))
      return;
    this.handleChange(e.target.value);
  },
  render: function() {
    var model = '';
    if (this.props.config.model[this.props.config.name]) {
      model = this.props.config.model[this.props.config.name].value;
    }
    var modelClass = '';
    if (this.props.config.model[this.props.config.name]) {
      modelClass = this.props.config.model[this.props.config.name].model;
    }
    var type = this.state.type;
    var item = this.props.config.item;
    var controller = {};
    if (this.props.config.controller && this.props.config.controller[this.props.config.name]) {
      controller = this.props.config.controller[this.props.config.name];
    }
    if (this.state.errors.length) {
      modelClass += ' field-error';
    }
    if (this.state.warning) {
      modelClass += ' field-warning';
    }
    var label = adapt.component('label');
    var errors;
    if (this.props.config.nameTrail.length && this.props.config.name !== 'totalPercentageAllocation' && this.state.errors.length) {
      errors = (React.createElement("div", {className: "errors"}, React.createElement("i", {className: "fa fa-exclamation-circle"}), React.createElement("div", {className: "errors__hover"}, this.state.errors[0])));
    }
    return (React.createElement("div", {
      className: modelClass + ' field field__input' + (typeof item.desc === 'undefined' ? '' : ' has-desc'),
      'data-locator': this.props.config.nameTrail + this.props.config.name + '-container'
    }, typeof item.label === 'undefined' ? '' : React.createElement(adapt.components.label, {
      config: {
        item: item,
        errors: this.state.errors,
        warning: this.state.warning
      },
      adapt: this.props.adapt
    }), errors, React.createElement("div", {className: "field__input--container"}, React.createElement("input", {
      value: model,
      autoComplete: "off",
      type: "text",
      onChange: this.handleType,
      placeholder: item.placeholder,
      disabled: controller.disabled,
      'data-locator': this.props.config.nameTrail + this.props.config.name
    }), typeof item.desc === 'undefined' ? '' : React.createElement(adapt.components.description, {
      config: {item: item},
      adapt: this.props.adapt
    }))));
  }
};
adapt.component('input', AdaptInput);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12}],31:[function(require,module,exports){
"use strict";
var Utils = require('../api/utils');
var adapt = require('../api/core');
var AdaptInputDate = {
  extend: [adapt.mixins.flat],
  displayName: 'AdaptInputDate',
  setStatus: function(value) {
    var controller = {};
    if (this.props.config.controller && this.props.config.controller[this.props.config.name]) {
      controller = this.props.config.controller[this.props.config.name];
    }
    if (controller.disabled) {
      value = false;
    }
    this.setState({open: value});
  },
  getDefaultProps: function() {
    return {days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']};
  },
  componentDidMount: function() {
    this.id = Math.random() * 100;
    var that = this;
    document.addEventListener('mousedown', function(e) {
      if (!Utils.findClosestParent(e.target, 'field__inputdate--' + that.state.name + that.id)) {
        if (that.state.open) {
          that.setStatus(false);
        }
      }
    });
  },
  handleDate: function(event) {
    var DATE_REGEXP = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/;
    var value = event.target.value;
    if (DATE_REGEXP.test(value)) {
      value = value.split('/');
      var day = value[0];
      var month = value[1];
      var year = value[2];
      this.setState({
        model: new Date(year, month - 1, day).getTime(),
        tempValue: this.formatTime(new Date(year, month - 1, day).getTime()),
        currentDate: new Date(year, month - 1, 1)
      });
      this.handleChange(new Date(year, month - 1, day).getTime());
    } else {
      this.setState({
        model: '',
        tempValue: value
      });
      this.handleChange('');
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
    for (var j = last; j--; ) {
      var day = {
        day: lastMonth.getDate() - j,
        year: lastMonth.getFullYear(),
        month: lastMonth.getMonth()
      };
      days['day-' + day.day + '-' + day.month] = (React.createElement("li", {onClick: this.changeDate.bind(this, day)}, lastMonth.getDate() - j));
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
      days['day-' + day.day + '-' + day.month] = (React.createElement("li", {
        onClick: this.changeDate.bind(this, day),
        className: (day.today ? 'today ' : '') + 'month' + (timestamp == this.state.model ? ' selected' : '')
      }, day.day));
    }
    var length = Object.keys(days).length;
    nextMonthDays = (Math.ceil(length / 7) * 7) - length;
    for (var z = 0; z < nextMonthDays; z++) {
      var day = {
        day: z + 1,
        year: nextMonth.getFullYear(),
        month: nextMonth.getMonth()
      };
      days['day-' + day.day + '-' + day.month] = (React.createElement("li", {onClick: this.changeDate.bind(this, day)}, z + 1));
    }
    return days;
  },
  changeMonth: function(month, year) {
    this.parseMonth(month, year);
    this.setState({currentDate: new Date(year, month, 1)});
  },
  changeDate: function(day) {
    if (day && day.day) {
      this.state.model = new Date(day.year, day.month, day.day).getTime();
      this.state.open = false;
      this.state.tempValue = this.formatTime(this.state.model);
      this.handleChange(this.state.model);
    }
    this.changeMonth(day.month, day.year);
  },
  formatTime: function(value) {
    value = new Date(value);
    return ('0' + value.getDate()).slice(-2) + '/' + ('0' + (value.getMonth() + 1)).slice(-2) + '/' + value.getFullYear();
  },
  render: function() {
    var value = this.state.model * 1,
        type = this.state.type,
        item = this.state.item;
    if (value && !this.state.tempValue) {
      this.state.tempValue = this.formatTime(value);
    }
    var controller = {};
    if (this.props.config.controller && this.props.config.controller[this.props.config.name]) {
      controller = this.props.config.controller[this.props.config.name];
    }
    this.state.open = this.state.open || false;
    this.state.date = {};
    this.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.state.today = new Date();
    this.state.today = new Date(this.state.today.getFullYear(), this.state.today.getMonth(), this.state.today.getDate()).getTime();
    if (value) {
      var a = new Date(value);
      this.state.model = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
    }
    this.state.currentDate = value || this.state.currentDate ? (this.state.currentDate || new Date(value)) : false;
    var month = this.state.currentDate ? this.state.currentDate.getMonth() : new Date(this.state.today).getMonth();
    var year = this.state.currentDate ? this.state.currentDate.getFullYear() : new Date(this.state.today).getFullYear();
    this.state.date.lastMonth = {};
    this.state.date.nextMonth = {};
    this.state.date.days = this.parseMonth(month, year);
    this.state.date.displayMonth = this.months[month];
    this.state.date.displayYear = year;
    function days(value, index) {
      return React.createElement("li", {key: index}, value);
    }
    return (React.createElement("div", {
      className: 'field field__inputdate field__input field__inputdate--' + this.state.name + this.id,
      'data-locator': this.props.config.nameTrail + this.props.config.name + '-container'
    }, typeof item.label === 'undefined' ? '' : React.createElement(adapt.components.label, {
      config: {
        item: item,
        errors: this.state.errors,
        warning: this.state.warning
      },
      adapt: this.props.adapt
    }), React.createElement("div", {className: (this.state.open ? 'open ' : '') + 'field__inputdate--container'}, React.createElement("input", {
      'data-locator': this.props.config.nameTrail + this.props.config.name,
      onFocus: this.setStatus.bind(this, true),
      value: this.state.tempValue,
      type: "text",
      onChange: this.handleDate,
      placeholder: "dd/mm/yyyy",
      onClick: this.setStatus.bind(this, true),
      disabled: controller.disabled
    }), React.createElement("i", {
      className: "fa fa-calendar no-select",
      onClick: this.setStatus.bind(this, !this.state.open)
    }), React.createElement("div", {className: "inputdate__dropdown no-select"}, React.createElement("div", {className: "inputdate__dropdown--header"}, React.createElement("i", {
      className: "fa fa-chevron-left",
      onClick: this.changeDate.bind(this, this.state.date.lastMonth)
    }), React.createElement("i", {
      className: "fa fa-chevron-right",
      onClick: this.changeDate.bind(this, this.state.date.nextMonth)
    }), React.createElement("div", null, this.state.date.displayMonth + ' ' + this.state.date.displayYear)), React.createElement("ul", {className: "inputdate__days"}, this.props.days.map(days)), React.createElement("ul", {className: "inputdate__list"}, this.state.date.days)), typeof item.desc === 'undefined' ? '' : React.createElement(adapt.components.description, {
      config: {item: item},
      adapt: this.props.adapt
    }))));
  }
};
adapt.component('inputDate', AdaptInputDate);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12,"../api/utils":18}],32:[function(require,module,exports){
"use strict";
'use strict';
var utils = require('../api/utils');
var adapt = require('../api/core');
var AdaptItem = {
  displayName: 'AdaptItem',
  render: function() {
    var item = this.props.config.item;
    var dynamicItem = adapt.component(item.type.split(':')[0]);
    var possibleItem = utils.convertToCamelCase(item.type);
    if (adapt.components[possibleItem]) {
      dynamicItem = adapt.component(possibleItem);
    }
    this.props.config.item.fullName = this.props.config.nameTrail + this.props.config.name;
    return this.transferPropsTo(dynamicItem());
  }
};
adapt.component('item', AdaptItem);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12,"../api/utils":18}],33:[function(require,module,exports){
"use strict";
var adapt = require('../api/core');
var AdaptLabel = {
  displayName: 'AdaptLabel',
  componentWillMount: function() {
    var that = this;
    var item = this.props.config.item;
    this.listener = this.props.adapt.observe.addListener(function() {
      return item.label;
    }, function(newVal, oldVal) {
      that.setState({text: newVal});
    });
  },
  componentWillUnmount: function() {
    this.listener();
  },
  getInitialState: function() {
    var config = this.props.config;
    return {text: config.item.label};
  },
  render: function() {
    var errors = this.props.config.errors || [];
    var text;
    if (this.props.config.warning) {
      text = (React.createElement("span", {className: "warning"}, this.props.config.warning));
    } else {
      text = (React.createElement("span", {className: "errors"}, errors[0] || ''));
    }
    return React.createElement("h4", {className: "label"}, this.props.config.item.label, " ", text);
  }
};
adapt.component('label', AdaptLabel);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12}],34:[function(require,module,exports){
"use strict";
'use strict';
var view = require('../api/view');
var utils = require('../api/utils');
var adapt = require('../api/core');
var AdaptLoop = {
  getInitialState: function() {
    return {listeners: []};
  },
  displayName: 'AdaptLoop',
  render: function() {
    var items = this.props.items;
    var controller = this.props.controller;
    var values = this.props.values;
    var nameTrail = this.props.nameTrail;
    var observe = this.props.observe;
    var model = this.props.model;
    var render = [];
    var dynamicItem = adapt.components.item;
    var currentState = this.state.currentState;
    for (var i in items) {
      var item = items[i];
      render.push(this.transferPropsTo(dynamicItem({
        scope: this.props.scope,
        validation: this.props.validation,
        config: {
          model: model,
          name: i,
          item: item,
          controller: controller,
          values: values,
          observe: observe,
          nameTrail: nameTrail
        }
      })));
    }
    return React.createElement("div", null, render);
  }
};
adapt.component('loop', AdaptLoop);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12,"../api/utils":18,"../api/view":20}],35:[function(require,module,exports){
"use strict";
var adapt = require('../api/core');
var Utils = require('../api/utils');
var AdaptRadio = {
  extend: [adapt.mixins.flat],
  displayName: 'AdaptRadio',
  handleClick: function(e) {
    this.handleChange(e.target.value);
  },
  render: function() {
    var cx = React.addons.classSet;
    var model = this.state.model,
        type = this.state.type,
        item = this.props.config.item;
    var naSelected = this.state.na || !model.length;
    var controller = {};
    if (this.props.config.controller && this.props.config.controller[this.props.config.name]) {
      controller = this.props.config.controller[this.props.config.name];
    }
    var label = adapt.component('label');
    var checkboxes = [];
    var items = item.options;
    if (item.includeNA) {
      var classes = cx({
        'field__radio--item': true,
        'field__radio--active': naSelected
      });
      checkboxes.push(React.createElement("div", {
        className: classes,
        key: "na",
        onClick: this.toggleNA
      }, React.createElement("i", {className: "fa fa-fw fa-circle"}), React.createElement("i", {className: "fa fa-fw fa-circle-o"}), "N/A"));
    }
    for (var i in items) {
      var classes = cx({
        'field__radio--item': true,
        'field__radio--active': model === i,
        'field__radio--disabled': controller.disabled
      });
      checkboxes.push(React.createElement("div", {
        'data-locator': this.props.config.nameTrail + this.props.config.name + '-radio-' + i,
        className: classes,
        key: this.props.config.name + i,
        onClick: !controller.disabled ? this.handleClick.bind(this, {target: {value: i}}) : function() {}
      }, React.createElement("i", {className: "fa fa-fw fa-circle-o"}), React.createElement("i", {className: "fa fa-fw fa-check-circle"}), items[i]));
    }
    return (React.createElement("div", {
      className: "field field__radio",
      'data-locator': this.props.config.nameTrail + this.props.config.name + '-container'
    }, typeof item.label === 'undefined' ? '' : React.createElement(adapt.components.label, {
      config: {item: item},
      adapt: this.props.adapt
    }), checkboxes, React.createElement("div", {className: "field__radio--container"}, typeof item.desc === 'undefined' ? '' : React.createElement(adapt.components.description, {
      config: {item: item},
      adapt: this.props.adapt
    }))));
  }
};
adapt.component('radio', AdaptRadio);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12,"../api/utils":18}],36:[function(require,module,exports){
"use strict";
var Utils = require('../api/utils');
var adapt = require('../api/core');
var AdaptSelect = {
  displayName: 'AdaptSelect',
  extend: [adapt.mixins.flat],
  handleClick: function(i) {
    this.handleChange(this.state.item.options[i].value);
    this.setState({open: false});
  },
  setStatus: function(value) {
    this.setState({open: value});
  },
  componentDidMount: function() {
    var that = this;
    document.addEventListener('click', function(e) {
      if (!Utils.findClosestParent(e.target, 'field__select--' + that.state.name)) {
        if (that.state.open) {
          that.setStatus(false);
        }
      }
    });
  },
  render: function() {
    var value = this.state.model,
        type = this.state.type,
        item = this.props.config.item;
    this.state.open = this.state.open || false;
    var items = {};
    var controller = {};
    if (this.props.config.controller && this.props.config.controller[this.props.config.name]) {
      controller = this.props.config.controller[this.props.config.name];
    }
    if (item.options) {
      for (var i = 0; i < item.options.length; i++) {
        items['item-' + i] = (React.createElement("li", {
          'data-locator': this.props.config.nameTrail + this.props.config.name + '-option-' + item.options[i].value,
          onClick: !controller.disabled ? this.handleClick.bind(this, i) : function() {},
          className: value == item.options[i].value ? 'active' : ''
        }, React.createElement("i", {className: "fa fa-check"}), item.options[i].label));
      }
    } else {
      console.warn('[select]: No options provided');
    }
    var displayValue;
    if (value) {
      var index = this.state.item.options.filter(function(obj) {
        return obj.value == value;
      });
      if (index.length) {
        displayValue = index[0].label;
      }
    }
    return (React.createElement("div", {
      className: 'field field__select field__select--' + this.state.name + (controller.disabled ? ' field__select--disabled' : ''),
      'data-locator': this.props.config.nameTrail + this.props.config.name + '-container'
    }, typeof item.label === 'undefined' ? '' : React.createElement(adapt.components.label, {
      config: {
        item: item,
        errors: this.state.errors,
        warning: this.state.warning
      },
      adapt: this.props.adapt
    }), React.createElement("div", {
      className: "field__select--container",
      'data-locator': this.props.config.nameTrail + this.props.config.name
    }, React.createElement("div", {
      className: (this.state.open ? 'open ' : '') + 'field__select--current no-select',
      onClick: !controller.disabled ? this.setStatus.bind(this, !this.state.open) : function() {}
    }, React.createElement("i", {className: "fa fa-sort"}), displayValue || 'Please select..'), React.createElement("ul", {className: (this.state.open ? 'open ' : '') + 'field__select--dropdown'}, items), typeof item.desc === 'undefined' ? '' : React.createElement(adapt.components.description, {
      config: {item: item},
      adapt: this.props.adapt
    }))));
  }
};
adapt.component('select', AdaptSelect);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12,"../api/utils":18}],37:[function(require,module,exports){
"use strict";
var adapt = require('../api/core');
var Utils = require('../api/utils');
var AdaptSelectMultiple = {
  displayName: 'AdaptSelectMultiple',
  statics: {defaultModelValue: []},
  extend: [adapt.mixins.array],
  render: function() {
    var value = this.state.model,
        type = this.state.type,
        item = this.props.config.item,
        options = this.props.config.item.options;
    var optionList = {};
    if (options) {
      for (var i = 0; i < options.length; i++) {
        optionList['option-' + i] = (React.createElement("li", {
          'data-locator': this.props.config.nameTrail + this.props.config.name + '-item-' + options[i].value,
          className: (value.indexOf(options[i].value) > -1 ? 'active' : '') + ' field__selectmultiple--item no-select',
          ref: 'option' + i,
          onClick: this.handleChange.bind(this, i)
        }, React.createElement("i", {className: "fa fa-check fa-fw"}), options[i].label));
      }
    } else {
      console.warn('[selectMultiple]: No options provided');
    }
    return (React.createElement("div", {
      className: "field field__select",
      'data-locator': this.props.config.nameTrail + this.props.config.name + '-container'
    }, typeof item.label === 'undefined' ? '' : React.createElement(adapt.components.label, {
      config: {item: item},
      adapt: this.props.adapt
    }), React.createElement("div", {className: "field__select--container"}, React.createElement("ul", {className: "field__selectmultiple"}, optionList), typeof item.desc === 'undefined' ? '' : React.createElement(adapt.components.description, {
      config: {item: item},
      adapt: this.props.adapt
    }))));
  }
};
adapt.component('selectMultiple', AdaptSelectMultiple);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12,"../api/utils":18}],38:[function(require,module,exports){
"use strict";
'use strict';
var adapt = require('../api/core');
var Utils = require('../api/utils');
var AdaptTabcordion = {
  displayName: 'AdaptTabcordion',
  getInitialState: function() {
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
  open: function(tabId, accordionId) {
    this.setState({
      openTab: tabId,
      openAccordion: accordionId > -1 ? accordionId : -1
    });
  },
  addAccordion: function(accordionName) {
    var newModel = {};
    var config = this.props.config;
    this.props.adapt.model.createModel(config.item.items[accordionName].model, newModel);
    config.model[accordionName].value.push(newModel);
    this.props.adapt.observe.digest();
    this.setState({openAccordion: config.model[accordionName].value.length - 1});
  },
  componentDidMount: function() {
    var _this = this;
    document.addEventListener('click', function(e) {
      if (!Utils.findClosestParent(e.target, 'tabcordion__accordion--item')) {
        _this.setState({openDropdown: -1});
      }
    });
  },
  copyAccordion: function(accordionName, accordionId) {
    var config = this.props.config;
    var newModel = {};
    var config = this.props.config;
    this.props.config.model[accordionName].value.push(JSON.parse(JSON.stringify((config.model[accordionName].value[accordionId]))));
    this.props.adapt.observe.digest();
    this.setState({
      openAccordion: config.model[accordionName].value.length - 1,
      openDropdown: -1
    });
  },
  listeners: [],
  removeAccordion: function(accordionName, accordionId) {
    var config = this.props.config;
    var currentlyOpened = this.state.accordions[accordionName][this.state.openAccordion];
    var arr = config.model[accordionName].value;
    arr.splice(accordionId, 1);
    this.props.config.model[accordionName].value = arr;
    this.state.accordions[accordionName].splice(accordionId, 1);
    this.props.adapt.observe.digest();
    var toOpen;
    if (accordionId === this.state.openAccordion) {
      if (this.props.config.model[accordionName].value.length) {
        if (accordionId > 0) {
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
    });
  },
  openDropdown: function(id) {
    this.setState({openDropdown: id === this.state.openDropdown ? -1 : id});
  },
  render: function() {
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
    for (var i in items) {
      var handleType = {
        tab: function(r) {
          var classes = cx({
            'tabcordion__nav--item': true,
            'tabcordion__nav--active': openTab === r
          });
          header.push(React.createElement("li", {
            key: i,
            className: classes,
            onClick: this.open.bind(this, r)
          }, items[i].title));
          var element = items[i];
          var children = [];
          var loop = adapt.components.loop;
          children = loop({
            items: element.items,
            controller: config.controller,
            values: config.values,
            observe: config.observe,
            nameTrail: config.nameTrail,
            model: model,
            adapt: _this.props.adapt
          });
          var classes = cx({
            'tabcordion__content--item': true,
            'clear': true,
            'tabcordion__content--active': openTab === r
          });
          content.push(React.createElement("div", {
            className: classes,
            key: i
          }, children));
        },
        accordion: function(r) {
          var navChildren = [];
          model[i].value.forEach(function(element, index) {
            var title = items[i].accordionTitle;
            var subtitle = items[i].accordionSubtitle;
            var contentChildren = [];
            title = title.replace(/{([^}]+)}/g, function(match) {
              var replace = {'{index}': function() {
                  return index + 1;
                }};
              return (replace[match] || replace['default'])();
            });
            if (subtitle) {
              subtitle = subtitle.replace(/{([^}]+)}/g, function(match) {
                var replace = {
                  '{index}': function() {
                    return index + 1;
                  },
                  'default': function() {
                    var modelName = match.replace('{', '').replace('}', '');
                    if (model[i].value[index][modelName]) {
                      return model[i].value[index][modelName].value;
                    } else {
                      return '';
                    }
                  }
                };
                return (replace[match] || replace['default'])();
              });
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
            navChildren.push(React.createElement("li", {
              key: index,
              className: classes
            }, React.createElement("span", {
              className: "tabcordion__accordion--holder",
              onClick: this.open.bind(this, r, index)
            }, title, React.createElement("span", {
              className: "tabcordion__accordion--title",
              dangerouslySetInnerHTML: {__html: subtitle || '&nbsp;'}
            })), React.createElement("i", {
              className: arrowClasses,
              onClick: this.openDropdown.bind(this, index)
            }), React.createElement("div", {className: dropDownClasses}, React.createElement("span", {onClick: this.copyAccordion.bind(this, i, index)}, "Duplicate"), React.createElement("span", {
              className: "remove",
              onClick: this.removeAccordion.bind(this, i, index)
            }, "Remove"))));
            var loop = adapt.components.loop;
            contentChildren = loop({
              items: items[i].model,
              controller: config.controller[i],
              values: config.values,
              observe: config.observe,
              nameTrail: config.nameTrail + i + '.',
              model: model[i].value[index],
              adapt: _this.props.adapt
            });
            var classes = cx({
              'tabcordion__content--item': true,
              'clear': true,
              'tabcordion__content--active': openAccordion === index && openTab === r
            });
            if (!this.state.accordions[i]) {
              this.state.accordions[i] = [];
            }
            if (!this.state.accordions[i][index]) {
              this.state.accordions[i][index] = +new Date() + Math.random();
            }
            var key = this.state.accordions[i][index];
            content.push(React.createElement("div", {
              className: classes,
              key: key
            }, contentChildren));
          }, this);
          var classes = cx({
            'tabcordion__nav--item': true,
            'tabcordion__nav--active': openTab === r
          });
          header.push(React.createElement("li", {className: classes}, items[i].title, React.createElement("ul", {className: "tabcordion__accordion"}, navChildren, React.createElement("li", {
            className: "tabcordion__accordion--item tabcordion__accordion--add",
            onClick: this.addAccordion.bind(this, i)
          }, React.createElement("i", {className: "fa fa-plus fa-fw"}), items[i].addText || 'Add Item'))));
        }
      };
      handleType[items[i].tabType].call(this, r);
      ++r;
    }
    return (React.createElement("div", {className: "tabcordion no-select clear"}, React.createElement("div", {className: "tabcordion__nav"}, React.createElement("ul", {className: "tabcordion__nav--list"}, header), React.createElement("span", {className: "tabcordion__divider"})), React.createElement("div", {className: "tabcordion__content"}, content)));
  }
};
adapt.component('tabcordion', AdaptTabcordion);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12,"../api/utils":18}],39:[function(require,module,exports){
"use strict";
var adapt = require('../api/core');
var Utils = require('../api/utils');
var AdaptTable = {
  displayName: 'AdaptTable',
  extend: [adapt.mixins.arrayObject],
  render: function() {
    var item = this.props.config.item;
    var config = this.props.config;
    var openID = this.state.open || -1;
    var items = [];
    var model = this.state.model;
    var simple = !!config.item.type.split(':')[1];
    var header = [];
    console.log(item.model);
    for (var i in item.model) {
      header.push(React.createElement("th", {key: i}, item.model[i].label));
    }
    var t = 0;
    if (model) {
      for (var i = 0; i < model.length; i++) {
        var children = [];
        if (!simple) {
          children.push(React.createElement("td", {className: "id"}, i + 1));
        }
        var config = this.props.config;
        for (var r in item.model) {
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
          var contents = this.transferPropsTo(React.createElement(adapt.components.item, {config: itemConfig}));
          children.push(React.createElement("td", {key: t + r}, contents));
          t++;
        }
        children.push(React.createElement("td", {className: "th__options"}, React.createElement("span", {onClick: this.remove.bind(this, i)}, React.createElement("i", {className: "fa fa-times fa-fw"}))));
        var REGEX_CURLY = /{([^}]+)}/g;
        items.push(React.createElement("tr", {
          key: i,
          'data-locator': this.props.config.nameTrail + this.props.config.name + '-row-' + i
        }, children));
      }
      ;
    }
    return (React.createElement("div", {
      className: 'element__table clear no-select ' + (simple ? 'element__table--simple' : ''),
      'data-locator': this.props.config.nameTrail + this.props.config.name + '-container'
    }, React.createElement("table", {
      cellPadding: "0",
      cellSpacing: "0"
    }, React.createElement("thead", {className: items.length ? '' : 'empty'}, React.createElement("tr", null, simple ? '' : React.createElement("th", {className: "id"}, "#"), header, React.createElement("th", {className: "th__options"}, React.createElement("span", {onClick: this.add}, React.createElement("i", {className: "fa fa-plus fa-fw"}))))), React.createElement("tbody", null, items))));
  }
};
adapt.component('table', AdaptTable);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12,"../api/utils":18}],40:[function(require,module,exports){
"use strict";
'use strict';
var adapt = require('../api/core');
var Utils = require('../api/utils');
var observe = require('../api/observe');
var validation = require('../api/validation');
var AdaptTabs = {
  displayName: 'AdaptTabs',
  componentWillMount: function() {
    this.props.validation.on('updatedValidation', this.reValidate);
  },
  componentWillUnMount: function() {
    this.props.validation.off('updatedValidation', this.reValidate);
  },
  reValidate: function() {
    this.forceUpdate();
  },
  getInitialState: function() {
    var config = this.props.config;
    var style = 'default';
    var split = config.item.type.split(':');
    if (split.length > 1) {
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
    if (this.open !== id) {
      window.scrollTo(0, 0);
      this.setState({open: id});
    }
  },
  tabValidation: {},
  render: function() {
    console.log('RENDER TABS');
    var cx = React.addons.classSet;
    var item = this.props.config.item;
    var model = this.state.model;
    var config = this.props.config;
    var header = [];
    var content = [];
    var items = item.items;
    var t = 0;
    for (var i in items) {
      if (!this.tabValidation[i])
        this.tabValidation[i] = [];
      var isValid = !this.tabValidation[i].length;
      var status = cx({
        'status': true,
        'status--valid': isValid
      });
      var statusIcon = cx({
        'fa': true,
        'fa-fw': true,
        'fa-check': isValid,
        'fa-times': !isValid
      });
      header.push(React.createElement("li", {
        'data-locator': this.props.config.nameTrail + this.props.config.name + '-tab-' + i,
        key: i,
        onClick: this.open.bind(this, t),
        className: this.state.style + '__header--item ' + (this.state.open == t ? this.state.style + '__header--open' : '') + (this.state.open - 1 == t ? this.state.style + '__header--beforeopen' : '') + (isValid ? ' valid' : ' invalid')
      }, items[i].title, React.createElement("div", {className: status}, React.createElement("i", {className: statusIcon}))));
      var children = [];
      var loop = adapt.components.loop;
      if (!this.props.scope.children[i]) {
        this.props.scope.children[i] = new observe(this.props.adapt);
        this.props.scope.children[i].parent = this.props.scope;
      }
      if (!this.props.validation.children[i]) {
        this.props.validation.children[i] = new validation(this.props.adapt, this.tabValidation[i]);
        this.props.validation.children[i].parent = this.props.validation;
      }
      for (var index in items[i].items) {
        var item$__0 = items[i].items[index];
        var dynamicItem = adapt.components[item$__0.type.split(':')[0]];
        var possibleItem = Utils.convertToCamelCase(item$__0.type);
        if (adapt.components[possibleItem]) {
          dynamicItem = adapt.components[possibleItem];
        }
        children.push(dynamicItem({
          scope: this.props.scope.children[i],
          validation: this.props.validation.children[i],
          adapt: this.props.adapt,
          config: {
            model: config.model,
            name: index,
            item: item$__0,
            controller: config.controller,
            values: config.values,
            observe: config.observe,
            nameTrail: config.nameTrail
          }
        }));
      }
      var style = {};
      if (items[i].padding) {
        style.padding = items[i].padding;
      }
      content.push(React.createElement("div", {
        'data-locator': this.props.config.nameTrail + this.props.config.name + '-content-' + i,
        style: style,
        className: this.state.style + '__content--item ' + (this.state.open == t ? this.state.style + '__content--open' : '')
      }, children));
      t++;
    }
    return (React.createElement("div", {
      className: this.state.style + ' no-select',
      'data-locator': this.props.config.nameTrail + this.props.config.name + '-container'
    }, React.createElement("ul", {className: this.state.style + '__header clear'}, header), React.createElement("div", {className: this.state.style + '__content'}, content)));
  }
};
adapt.component('tabs', AdaptTabs);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12,"../api/observe":17,"../api/utils":18,"../api/validation":19}],41:[function(require,module,exports){
"use strict";
var adapt = require('../api/core');
var AdaptTextarea = {
  extend: [adapt.mixins.flat],
  displayName: 'AdaptTextarea',
  handleText: function(e) {
    this.handleChange(e.target.value);
  },
  render: function() {
    var model = this.state.model,
        type = this.state.type,
        item = this.state.item;
    var label = adapt.component('label');
    var controller = {};
    if (this.props.config.controller && this.props.config.controller[this.props.config.name]) {
      controller = this.props.config.controller[this.props.config.name];
    }
    return (React.createElement("div", {
      className: "field field__textarea",
      'data-locator': this.props.config.nameTrail + this.props.config.name + '-container'
    }, typeof item.label === 'undefined' ? '' : React.createElement(adapt.components.label, {
      config: {item: item},
      adapt: this.props.adapt
    }), React.createElement("div", {className: "field__textarea--container"}, React.createElement("textarea", {
      'data-locator': this.props.config.nameTrail + this.props.config.name,
      onChange: this.handleText,
      placeholder: item.placeholder,
      value: model,
      disabled: controller.disabled
    }), typeof item.desc === 'undefined' ? '' : React.createElement(adapt.components.description, {
      config: {item: item},
      adapt: this.props.adapt
    }))));
  }
};
adapt.component('textarea', AdaptTextarea);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12}],42:[function(require,module,exports){
"use strict";
'use strict';
var adapt = require('../api/core');
var array = {
  statics: {defaultModelValue: []},
  getInitialState: function() {
    var config = this.props.config;
    return {
      model: config.model[config.name].value,
      item: config.item,
      name: config.name
    };
  },
  validateModel: function(value) {
    var name = this.props.config.name;
    var model = this.props.model;
    var view = this.props.config.item;
    var rules = {};
    var errors = {};
    var controller = {};
    if (this.props.config.controller && this.props.config.controller[this.props.config.name]) {
      controller = this.props.config.controller[this.props.config.name];
    }
    var validate = controller.validation;
    if (validate) {
      if (validate.onType && typeof value !== 'undefined') {
        rules = utils.isBoolean(validate.onType) ? validate : validate.onType;
        if (errors = this.props.validation.validate(value, rules, this.props.config.nameTrail + this.props.config.name, this.props.config.model)) {
          this.setState({errors: errors});
          view.valid = !errors.length;
        }
      } else if (typeof value === 'undefined') {
        value = model[name].value;
        if (errors = this.props.validation.validate(value, validate, this.props.config.nameTrail + this.props.config.name, this.props.config.model)) {
          this.setState({errors: errors});
          view.valid = !errors.length;
        }
      }
    }
  },
  handleChange: function(i) {
    var model = this.state.model,
        options = this.props.config.item.options;
    var index = model.indexOf(options[i].value);
    if (index > -1) {
      model.splice(index, 1);
    } else {
      model.push(options[i].value);
    }
    this.validateModel(model);
    this.props.config.model[this.props.config.name].value = model;
    this.props.adapt.observe.digest();
    this.setState({model: model});
  }
};
adapt.mixin('array', array);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12}],43:[function(require,module,exports){
"use strict";
'use strict';
var adapt = require('../api/core');
var validation = require('../api/validation');
var utils = require('../api/utils');
var arrayObject = {
  statics: {defaultModelValue: []},
  getInitialState: function() {
    var config = this.props.config;
    this.validateModel(config.model[config.name].value);
    return {model: config.model[config.name].value};
  },
  validateModel: function(value) {
    var name = this.props.config.name;
    var model = this.props.model;
    var view = this.props.config.item;
    var rules = {};
    var errors = {};
    var controller = {};
    if (this.props.config.controller && this.props.config.controller[this.props.config.name]) {
      controller = this.props.config.controller[this.props.config.name];
    }
    var validate = controller.validation;
    if (validate) {
      if (validate.onType && typeof value !== 'undefined') {
        rules = utils.isBoolean(validate.onType) ? validate : validate.onType;
        if (errors = this.props.validation.validate(value, rules, this.props.config.nameTrail + this.props.config.name, this.props.config.model)) {
          this.setState({errors: errors});
          view.valid = !errors.length;
        }
      } else if (typeof value === 'undefined') {
        value = model[name].value;
        if (errors = this.props.validation.validate(value, validate, this.props.config.nameTrail + this.props.config.name, this.props.config.model)) {
          this.setState({errors: errors});
          view.valid = !errors.length;
        }
      }
    }
  },
  remove: function(id) {
    var config = this.props.config;
    var arr = config.model[config.name].value;
    if (this.originalAccordions) {
      var index = this.originalAccordions.indexOf(arr[id].randomID);
      if (index > -1) {
        this.originalAccordions.splice(index, 1);
      }
    }
    arr.splice(id, 1);
    this.props.config.model[this.props.config.name].value = arr;
    this.props.adapt.observe.digest();
    this.validateModel(config.model[config.name].value);
    this.setState({model: arr});
    if (!arr.length) {
      this.setState({open: -1});
    }
  },
  add: function() {
    var newModel = {};
    var config = this.props.config;
    this.props.adapt.model.createModel(config.item.model, newModel);
    config.model[config.name].value.push(newModel);
    this.props.adapt.observe.digest();
    this.validateModel(config.model[config.name].value);
    this.forceUpdate();
  }
};
adapt.mixin('arrayObject', arrayObject);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12,"../api/utils":18,"../api/validation":19}],44:[function(require,module,exports){
"use strict";
var adapt = require('../api/core');
var validation = require('../api/validation');
var utils = require('../api/utils');
var flat = {
  statics: {defaultModelValue: ''},
  expressionValue: function() {},
  setExpressionValue: function() {
    var that = this;
    var config = this.props.config;
    var observe = this.props.scope || this.props.adapt.observe;
    if (config.values[config.nameTrail + config.name]) {
      this.expressionValue();
      this.expressionValue = observe.addListener(function() {
        return config.values[config.nameTrail + config.name].call(config.model);
      }, function(newVal) {
        that.validateModel(newVal);
        that.props.config.model[that.props.config.name].value = newVal;
        that.setState({model: newVal});
      });
      this.setState({model: config.values[config.nameTrail + config.name].call(config.model)});
    }
  },
  validateModel: function(value) {
    var name = this.props.config.name;
    var model = this.props.model;
    var view = this.props.config.item;
    var rules = {};
    var errors = {};
    var controller = {};
    if (this.props.config.controller && this.props.config.controller[this.props.config.name]) {
      controller = this.props.config.controller[this.props.config.name];
    }
    var validate = controller.validation;
    if (validate) {
      if (validate.onType && typeof value !== 'undefined') {
        rules = utils.isBoolean(validate.onType) ? validate : validate.onType;
        if (errors = this.props.validation.validate(value, rules, this.props.config.nameTrail + this.props.config.name, this.props.config.model)) {
          this.setState({errors: errors});
          view.valid = !errors.length;
        }
      } else if (typeof value === 'undefined') {
        value = model[name].value;
        if (errors = this.props.validation.validate(value, validate, this.props.config.nameTrail + this.props.config.name, this.props.config.model)) {
          this.setState({errors: errors});
          view.valid = !errors.length;
        }
      }
    }
  },
  setObservers: function() {
    var that = this;
    var config = this.props.config;
    var observers = config.observe[config.nameTrail + config.name];
    var observe = this.props.scope || this.props.adapt.observe;
    for (var i in observers) {
      observers[i].forEach(function(element, index) {
        that.listeners.push(that.props.scope.addListener(function() {
          return config.model[config.name][i];
        }, function(newVal, oldVal, diff) {
          return element.call(config.model, newVal, oldVal, diff, config.name);
        }));
      });
    }
  },
  listeners: [],
  componentWillMount: function() {
    var $__0 = this;
    var that = this;
    var config = this.props.config;
    var model = config.model[config.name];
    var expressionValue;
    var observe = this.props.scope || this.props.adapt.observe;
    var controller = {};
    if (this.props.config.controller && this.props.config.controller[this.props.config.name]) {
      controller = this.props.config.controller[this.props.config.name];
    }
    var custom;
    if (controller.validation && (custom = controller.validation.custom)) {
      this.state.listeners.push(observe.addListener((function() {
        var value;
        return (value = custom.call($__0.props.config.model, model.value)) ? value.passed : true;
      }), (function() {
        $__0.validateModel(model.value);
      })));
    }
    this.validateModel(model.value);
    this.props.validation.on('validate', this.validateModel);
    if (config.values[config.nameTrail + config.name]) {
      this.setExpressionValue();
    }
    if (config.observe[config.nameTrail + config.name]) {
      this.setObservers();
    }
    this.state.listeners.push(observe.addListener(function() {
      return config.values[config.nameTrail + config.name];
    }, function(newVal) {
      that.setExpressionValue();
    }));
    this.state.listeners.push(observe.addListener(function() {
      return config.observe[config.nameTrail + config.name];
    }, function(newVal) {
      that.setObservers();
    }));
    this.state.listeners.push(observe.addListener(function() {
      try {
        return config.model[config.name].model;
      } catch (e) {
        return null;
      }
    }, function(newVal, oldVal) {
      if (newVal !== null) {
        that.setState({modelClass: newVal});
      }
    }));
    this.state.listeners.push(observe.addListener(function() {
      try {
        return config.model[config.name].value;
      } catch (e) {
        return null;
      }
    }, function(newVal, oldVal) {
      if (newVal !== null) {
        that.setState({model: newVal});
      }
    }));
  },
  componentWillUnmount: function() {
    this.props.validation.off('validate', this.validateModel);
    this.expressionValue();
    var index = this.props.validation.invalidFields.indexOf(this.props.config.nameTrail + this.props.config.name);
    if (index > -1) {
      this.props.validation.invalidFields.splice(index, 1);
      this.props.validation.parent.emit('updatedValidation');
    }
    var globalIndex = this.props.adapt.invalidFields.indexOf(this.props.config.nameTrail + this.props.config.name);
    if (globalIndex > -1) {
      this.props.adapt.invalidFields.splice(globalIndex, 1);
      this.props.adapt.validation.emit('updatedValidation');
    }
    this.state.listeners.forEach(function(element) {
      element();
    });
  },
  getInitialState: function() {
    var config = this.props.config;
    return {
      model: config.model[config.name].value,
      modelClass: '',
      item: config.item,
      name: config.name,
      listeners: [],
      errors: [],
      warning: false
    };
  },
  handleChange: function(value) {
    var controller = {};
    if (this.props.config.controller && this.props.config.controller[this.props.config.name]) {
      controller = this.props.config.controller[this.props.config.name];
    }
    if (controller.preprocess) {
      value = controller.preprocess(value);
    }
    setTimeout(this.validateModel.bind(this, value), 0);
    var warning;
    controller.warning && (warning = controller.warning(value));
    this.props.config.model[this.props.config.name].value = value;
    this.props.scope.digest();
    this.setState({
      model: value,
      warning: warning
    });
  }
};
adapt.mixin('flat', flat);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12,"../api/utils":18,"../api/validation":19}],45:[function(require,module,exports){
"use strict";
var adapt = require('../api/core');
var object = {};
adapt.mixin('object', object);

//# sourceMappingURL=<compileOutput>


},{"../api/core":12}],46:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_stores_47_alert__,
    $___46__46__47_actions_47_alert__;
var store = ($___46__46__47_stores_47_alert__ = require("../stores/alert"), $___46__46__47_stores_47_alert__ && $___46__46__47_stores_47_alert__.__esModule && $___46__46__47_stores_47_alert__ || {default: $___46__46__47_stores_47_alert__}).default;
var actions = ($___46__46__47_actions_47_alert__ = require("../actions/alert"), $___46__46__47_actions_47_alert__ && $___46__46__47_actions_47_alert__.__esModule && $___46__46__47_actions_47_alert__ || {default: $___46__46__47_actions_47_alert__}).default;
var alert = React.createClass({
  displayName: 'alert',
  componentWillMount: function() {
    store.on('toggleAlert', this.toggle);
  },
  componentWillUnmount: function() {
    store.off('toggleAlert', this.toggle);
  },
  toggle: function() {
    this.setState({
      open: store.open,
      config: store.config
    });
  },
  getInitialState: function() {
    return {
      open: false,
      config: {}
    };
  },
  close: function(callback) {
    actions.close();
    typeof callback === 'function' && callback();
  },
  render: function() {
    var cx = React.addons.classSet;
    var classes = cx({
      'sweet-alert': true,
      'showSweetAlert': this.state.open
    });
    var styles = {
      opacity: this.state.open ? 1 : 0,
      display: this.state.open ? 'block' : 'none'
    };
    var errorIcon = cx({
      icon: true,
      error: true,
      animateErrorIcon: this.state.config.error
    });
    var errorStyles = {display: this.state.config.error ? 'block' : 'none'};
    var warningIcon = cx({
      icon: true,
      warning: true,
      pulseWarning: this.state.config.warning
    });
    var warningBody = cx({
      body: true,
      pulseWarningIns: this.state.config.warning
    });
    var warningDot = cx({
      dot: true,
      pulseWarningIns: this.state.config.warning
    });
    var warningStyles = {display: this.state.config.warning ? 'block' : 'none'};
    var waitingIcon = cx({
      icon: true,
      waiting: true,
      animate: this.state.config.waiting
    });
    var waitingStyles = {display: this.state.config.waiting ? 'block' : 'none'};
    var waitingTipIcon = cx({
      line: true,
      tip: true,
      animateWaitingTip: this.state.config.waiting
    });
    var waitingLongIcon = cx({
      line: true,
      long: true,
      animateWaitingLong: this.state.config.waiting
    });
    var successIcon = cx({
      icon: true,
      success: true,
      animate: this.state.config.success
    });
    var successTipIcon = cx({
      line: true,
      tip: true,
      animateSuccessTip: this.state.config.success
    });
    var successLongIcon = cx({
      line: true,
      long: true,
      animateSuccessLong: this.state.config.success
    });
    var successStyles = {display: this.state.config.success ? 'block' : 'none'};
    var _this = this;
    var buttons = this.state.config.buttons && (this.state.config.buttons.map(function(obj) {
      var types = {
        cancel: function() {
          return (React.createElement("a", {
            'data-locator': "alert-cancel",
            key: "cancel",
            className: "button cancel",
            onClick: _this.close
          }, obj.text));
        },
        button: function() {
          return (React.createElement("a", {
            'data-locator': "alert-button",
            key: "button",
            className: "button",
            onClick: _this.close.bind(_this, obj.callback)
          }, obj.text));
        },
        link: function() {
          return (React.createElement("a", {
            'data-locator': "alert-link",
            key: "link",
            className: "button",
            onClick: _this.close,
            href: obj.link
          }, obj.text));
        }
      };
      return (types[obj.type] || types.button)();
    }));
    return (React.createElement("div", {'data-locator': "alert"}, React.createElement("div", {
      className: "sweet-overlay",
      style: styles
    }), React.createElement("div", {
      className: classes,
      style: styles
    }, React.createElement("div", {
      className: errorIcon,
      style: errorStyles
    }, React.createElement("span", {className: "x-mark"}, React.createElement("span", {className: "line left"}), React.createElement("span", {className: "line right"}))), React.createElement("div", {
      className: warningIcon,
      style: warningStyles
    }, React.createElement("span", {className: warningBody}), React.createElement("span", {className: warningDot})), React.createElement("div", {
      className: successIcon,
      style: successStyles
    }, React.createElement("span", {className: successTipIcon}), React.createElement("span", {className: successLongIcon}), React.createElement("div", {className: "placeholder"}), React.createElement("div", {className: "fix"})), React.createElement("div", {
      className: waitingIcon,
      style: waitingStyles
    }, React.createElement("div", {className: "placeholder"})), React.createElement("h2", null, this.state.config.header), React.createElement("p", null, this.state.config.message), buttons)));
  }
});
var $__default = alert;

//# sourceMappingURL=<compileOutput>


},{"../actions/alert":3,"../stores/alert":98}],47:[function(require,module,exports){
"use strict";
var $___46__46__47_stores_47_save__;
var store = ($___46__46__47_stores_47_save__ = require("../stores/save"), $___46__46__47_stores_47_save__ && $___46__46__47_stores_47_save__.__esModule && $___46__46__47_stores_47_save__ || {default: $___46__46__47_stores_47_save__}).default;
var adapt = require('../adapt/adapt');
var autoSave = {
  displayName: 'autoSave',
  componentWillMount: function() {
    store.on('saveStarted', this.handleSaving);
    store.on('saveStopped', this.handleStopped);
  },
  componentWillUnmount: function() {
    store.off('saveStarted', this.handleSaving);
    store.off('saveStopped', this.handleStopped);
  },
  handleSaving: function() {
    this.setState({
      started: true,
      saving: true
    });
  },
  handleStopped: function() {
    this.setState({
      started: true,
      saving: false
    });
  },
  getInitialState: function() {
    return {
      started: false,
      saving: false
    };
  },
  render: function() {
    var state = this.state;
    var text;
    if (state.saving) {
      text = 'Saving..';
    } else if (state.started) {
      var date = new Date();
      text = 'Saved at ' + date.getHours() + ':' + ('0' + date.getMinutes()).slice(-2);
    }
    return (React.createElement("div", {className: "autosave"}, text));
  }
};
adapt.component('autoSave', autoSave);

//# sourceMappingURL=<compileOutput>


},{"../adapt/adapt":10,"../stores/save":103}],48:[function(require,module,exports){
"use strict";
var $___46__46__47_stores_47_blocks__,
    $___46__46__47_actions_47_blocks__;
var store = ($___46__46__47_stores_47_blocks__ = require("../stores/blocks"), $___46__46__47_stores_47_blocks__ && $___46__46__47_stores_47_blocks__.__esModule && $___46__46__47_stores_47_blocks__ || {default: $___46__46__47_stores_47_blocks__}).default;
var actions = ($___46__46__47_actions_47_blocks__ = require("../actions/blocks"), $___46__46__47_actions_47_blocks__ && $___46__46__47_actions_47_blocks__.__esModule && $___46__46__47_actions_47_blocks__ || {default: $___46__46__47_actions_47_blocks__}).default;
var utils = require('../adapt/api/utils');
var adapt = require('../adapt/adapt');
var block = {
  displayName: 'block',
  componentWillMount: function() {
    store.on('blockToggled', this.toggleBlock);
    store.on('blockVisibility', this.toggleVisibility);
  },
  componentWillUnmount: function() {
    store.off('blockVisibility', this.toggleVisibility);
    store.off('blockToggled', this.toggleBlock);
  },
  toggleBlock: function() {
    var blocks = store.getOpen();
    this.setState({open: blocks.indexOf(this.props.config.name) > -1});
  },
  toggleVisibility: function() {
    var visible = store.getVisible();
    this.setState({visible: visible.indexOf(this.props.config.name) > -1});
  },
  getInitialState: function() {
    var blocks = store.getOpen();
    var visible = store.getVisible();
    return {
      open: blocks.indexOf(this.props.config.name) > -1,
      visible: visible.indexOf(this.props.config.name) > -1
    };
  },
  render: function() {
    var cx = React.addons.classSet;
    var item = this.props.config.item;
    var config = this.props.config;
    var children = [];
    var loop = adapt.components.loop;
    var _this = this;
    var dynamicItem = adapt.components.item;
    var items = item.items;
    for (var i in items) {
      var item$__2 = items[i];
      var dynamicItem = adapt.components[item$__2.type.split(':')[0]];
      var possibleItem = utils.convertToCamelCase(item$__2.type);
      if (adapt.components[possibleItem]) {
        dynamicItem = adapt.components[possibleItem];
      }
      children.push(dynamicItem({
        scope: _this.props.scope,
        validation: _this.props.validation,
        adapt: _this.props.adapt,
        config: {
          model: config.model,
          name: i,
          item: items[i],
          controller: config.controller,
          values: config.values,
          observe: config.observe,
          nameTrail: config.nameTrail
        }
      }));
    }
    if (!this.state.visible) {
      return null;
    }
    var classes = cx({
      block: true,
      'block--open': this.state.open
    });
    return (React.createElement("div", {className: classes}, children));
  }
};
adapt.component('block', block);

//# sourceMappingURL=<compileOutput>


},{"../actions/blocks":5,"../adapt/adapt":10,"../adapt/api/utils":18,"../stores/blocks":100}],49:[function(require,module,exports){
"use strict";
var $___46__46__47_utils__;
var utils = ($___46__46__47_utils__ = require("../utils"), $___46__46__47_utils__ && $___46__46__47_utils__.__esModule && $___46__46__47_utils__ || {default: $___46__46__47_utils__}).default;
var adapt = require('../adapt/adapt');
var bottlenecks = {render: function() {
    var cx = React.addons.classSet;
    var $__1 = this.props,
        adapt = $__1.adapt,
        config = $__1.config;
    var $__2 = config,
        model = $__2.model,
        item = $__2.item,
        name = $__2.name;
    var processes = [];
    var phase = model.phase.value;
    var emptyContent;
    var bottleneck1content;
    var bottleneck2content;
    if (phase !== 'capacityPlanning') {
      model.processes.value.forEach((function(process) {
        var percentage = process[phase + 'percentageJLRDemand'].value;
        if (String(percentage).length === 0)
          return;
        if (!isNaN(+percentage)) {
          processes.push(process);
        }
      }));
      processes.sort((function(a, b) {
        return a[phase + 'percentageJLRDemand'].value - b[phase + 'percentageJLRDemand'].value;
      }));
      var bottleneck1 = processes[0] || {};
      var bottleneck2 = processes[1] || {};
      if (bottleneck1[phase + 'percentageJLRDemand']) {
        var bottleneck1Classes = cx({
          positive: bottleneck1[phase + 'percentageJLRDemand'].value > 0,
          negative: bottleneck1[phase + 'percentageJLRDemand'].value < 0
        });
        bottleneck1content = (React.createElement("tr", {className: bottleneck1Classes}, React.createElement("td", null, bottleneck1.desc.value), React.createElement("td", null, bottleneck1[phase + 'jlrDemand'].value), React.createElement("td", null, bottleneck1.plannedProductionPerWeek.value), React.createElement("td", null, bottleneck1[phase + 'processSpecificWeek'].value), React.createElement("td", null, bottleneck1[phase + 'processSpecificHour'].value), React.createElement("td", null, bottleneck1[phase + 'processSpecificDay'].value), React.createElement("td", null, bottleneck1[phase + 'percentageJLRDemand'].value)));
      }
      if (bottleneck2[phase + 'percentageJLRDemand']) {
        var bottleneck2Classes = cx({
          positive: bottleneck2[phase + 'percentageJLRDemand'].value > 0,
          negative: bottleneck2[phase + 'percentageJLRDemand'].value < 0
        });
        bottleneck2content = (React.createElement("tr", {className: bottleneck2Classes}, React.createElement("td", null, bottleneck2.desc.value), React.createElement("td", null, bottleneck2[phase + 'jlrDemand'].value), React.createElement("td", null, bottleneck2.plannedProductionPerWeek.value), React.createElement("td", null, bottleneck2[phase + 'processSpecificWeek'].value), React.createElement("td", null, bottleneck2[phase + 'processSpecificHour'].value), React.createElement("td", null, bottleneck2[phase + 'processSpecificDay'].value), React.createElement("td", null, bottleneck2[phase + 'percentageJLRDemand'].value)));
      }
      if (!bottleneck1content && !bottleneck2content) {
        emptyContent = (React.createElement("tr", {className: "bottlenecks__empty"}, React.createElement("td", {colSpan: "7"}, "No bottlenecks")));
      }
    } else {
      emptyContent = (React.createElement("tr", {className: "bottlenecks__empty"}, React.createElement("td", {colSpan: "7"}, "No bottlenecks")));
    }
    return (React.createElement("div", {className: "bottlenecks"}, React.createElement("span", {className: "header header__h4"}, "Bottlenecks"), React.createElement("div", {className: "element__table clear no-select"}, React.createElement("table", {
      cellPadding: "0",
      cellSpacing: "0"
    }, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null, "Process Name"), React.createElement("th", null, "JLR Demand / Week"), React.createElement("th", null, "Planned Production Per Week"), React.createElement("th", null, "Process Specific Weekly Part Estimate"), React.createElement("th", null, "Process Specific Estimate Per Day"), React.createElement("th", null, "Process Specific Estimate Per Hour"), React.createElement("th", null, "Percentage Above/Below JLR Demand"))), React.createElement("tbody", null, bottleneck1content, bottleneck2content, emptyContent)))));
  }};
adapt.component('bottlenecks', bottlenecks);

//# sourceMappingURL=<compileOutput>


},{"../adapt/adapt":10,"../utils":105}],50:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return button;
    }},
  __esModule: {value: true}
});
var $___46__46__47_actions_47_button__;
var actions = ($___46__46__47_actions_47_button__ = require("../actions/button"), $___46__46__47_actions_47_button__ && $___46__46__47_actions_47_button__.__esModule && $___46__46__47_actions_47_button__ || {default: $___46__46__47_actions_47_button__}).default;
var adapt = require('../adapt/adapt');
var button = adapt.component('button', {
  displayName: 'button',
  statics: {defaultModelValue: false},
  handleClick: function(e) {
    if (this.props.config.item.className !== 'disabled') {
      actions.click(this.props.config.name);
      e.preventDefault();
      e.stopPropagation();
    }
  },
  setObservers: function() {
    var that = this;
    var config = this.props.config;
    var observers = config.observe[config.nameTrail + config.name];
    for (var i in observers) {
      observers[i].forEach(function(element, index) {
        that.state.listeners.push(that.props.adapt.observe.addListener(function() {
          return config.model[config.name][i] || config.item[i];
        }, element));
      });
    }
  },
  getInitialState: function() {
    var config = this.props.config;
    return {
      model: config.model[config.name].value,
      item: config.item,
      name: config.name,
      listeners: []
    };
  },
  componentWillMount: function() {
    var that = this;
    var config = this.props.config;
    var model = config.model[config.name];
    var expressionValue;
    if (config.observe[config.nameTrail + config.name]) {
      this.setObservers();
    }
    this.state.listeners.push(this.props.adapt.observe.addListener(function() {
      return config.observe[config.nameTrail + config.name];
    }, function(newVal) {
      that.setObservers();
    }));
    this.state.listeners.push(this.props.adapt.observe.addListener(function() {
      return config.item.className;
    }, function(newVal) {
      that.forceUpdate();
    }));
    this.state.listeners.push(this.props.adapt.observe.addListener(function() {
      return config.item.text;
    }, function(newVal) {
      that.forceUpdate();
    }));
  },
  componentWillUnmount: function() {
    this.state.listeners.forEach(function(listener) {
      listener();
    });
  },
  render: function() {
    var model = this.props.config.model[this.props.config.name].value,
        item = this.props.config.item,
        controller = this.props.config.controller[this.props.config.name];
    var label = adapt.component('label');
    return (React.createElement("div", {
      'data-locator': this.props.config.name + '-container',
      className: 'field field__button ' + (this.props.config.item.className || '')
    }, typeof item.label === 'undefined' ? '' : React.createElement(adapt.components.label, {
      config: {item: item},
      adapt: this.props.adapt
    }), React.createElement("div", {className: "field__button--container"}, React.createElement("button", {
      onClick: this.handleClick,
      'data-locator': this.props.config.name
    }, item.text), typeof item.desc === 'undefined' ? '' : React.createElement(adapt.components.description, {
      config: {item: item},
      adapt: this.props.adapt
    }))));
  }
});
;

//# sourceMappingURL=<compileOutput>


},{"../actions/button":6,"../adapt/adapt":10}],51:[function(require,module,exports){
"use strict";
var adapt = require('../adapt/adapt');
var buttonContainer = {
  displayName: 'buttonContainer',
  render: function() {
    var cx = React.addons.classSet;
    var item = this.props.config.item;
    var config = this.props.config;
    var children = [];
    var loop = adapt.components.loop;
    var _this = this;
    var dynamicItem = adapt.components.item;
    var items = item.items;
    children = loop({
      items: items,
      controller: config.controller,
      values: config.values,
      observe: config.observe,
      nameTrail: config.nameTrail,
      model: config.model,
      adapt: _this.props.adapt
    });
    return (React.createElement("div", {className: "button-container"}, children));
  }
};
adapt.component('buttonContainer', buttonContainer);

//# sourceMappingURL=<compileOutput>


},{"../adapt/adapt":10}],52:[function(require,module,exports){
"use strict";
var adapt = require('../adapt/adapt');
var chart = {
  drawChart: function() {
    if (this.props.config.model.processes.value.length && this.props.config.model.phase.value !== 'capacityPlanning') {
      var chartElement = document.querySelectorAll('.chart__render')[0];
      if (chartElement) {
        var config = this.props.config;
        var processes = config.model.processes.value;
        var data = [['Process Name', 'Parts Avail Shipment', 'Planned Prod/Week', 'JLR Demand']];
        var phase = config.model.phase.value;
        processes.forEach((function(process) {
          data.push([process.desc.value, process[phase + 'partsAvailableForShipment'].value * 1, process.plannedProductionPerWeek.value * 1, process[phase + 'jlrDemand'].value * 1]);
        }));
        var options = {
          seriesType: "bars",
          series: {
            0: {type: "line"},
            2: {type: "steppedArea"}
          },
          bar: {groupWidth: "20%"},
          width: chartElement.clientWidth,
          colors: ['#F29100', '#3A5BCB', '#CA2800'],
          enableInteractivity: false
        };
        var chart = new google.visualization.ComboChart(chartElement);
        chart.draw(google.visualization.arrayToDataTable(data), options);
      }
    }
  },
  componentDidMount: function() {
    window.addEventListener('resize', this.drawChart);
  },
  componentWillUnmount: function() {
    window.removeEventListener('resize', this.drawChart);
  },
  getInitialState: function() {
    return {rendered: false};
  },
  render: function() {
    var hrContent;
    var graphContent;
    if (this.props.config.model.phase.value !== 'capacityPlanning') {
      graphContent = (React.createElement("div", {
        className: "chart__render",
        style: {width: '100%'},
        ref: "chart"
      }));
      if (this.state.rendered && this.props.config.model.processes.value.length) {
        hrContent = (React.createElement("div", {className: "element__hr"}));
        this.drawChart();
      }
    }
    this.state.rendered = true;
    return (React.createElement("div", {className: "chart"}, graphContent, hrContent));
  }
};
adapt.component('chart', chart);
var inject = ['$scope'];

//# sourceMappingURL=<compileOutput>


},{"../adapt/adapt":10}],53:[function(require,module,exports){
"use strict";
var adapt = require('../adapt/adapt');
var blockheader = {
  displayName: 'blockheader',
  shouldComponentUpdate: function() {
    return false;
  },
  render: function() {
    return (React.createElement("div", {className: 'blockheader ' + (this.props.config.item.className || '')}));
  }
};
adapt.component('blockheader', blockheader);

//# sourceMappingURL=<compileOutput>


},{"../adapt/adapt":10}],54:[function(require,module,exports){
"use strict";
var appActions = require('../actions/app');
var adapt = require('../adapt/adapt');
var utils = require('../adapt/api/utils');
function findClosestParent(event, className) {
  var parent = event.parentNode;
  while (parent != document.body && parent != null) {
    if ((parent) && parent.className && parent.className.indexOf(className) != -1) {
      return parent;
    } else {
      parent = parent ? parent.parentNode : null;
    }
  }
  return null;
}
var overlay = {
  displayName: 'overlay',
  getInitialState: function() {
    return {open: false};
  },
  open: function() {
    this.setState({open: true});
  },
  close: function() {
    this.setState({open: false});
  },
  componentDidMount: function() {
    var node = this.refs.overlay.getDOMNode();
    node.addEventListener('scroll', function(e) {
      e.stopPropagation();
    });
  },
  render: function() {
    var cx = React.addons.classSet;
    var overlayClasses = cx({
      'overlay__background': true,
      'overlay__background--open': this.state.open
    });
    var loop = adapt.components.loop;
    var config = this.props.config;
    var item = config.item;
    var children = loop({
      items: item.items,
      controller: config.controller,
      values: config.values,
      observe: config.observe,
      nameTrail: config.nameTrail,
      model: config.model,
      adapt: this.props.adapt,
      validation: this.props.validation,
      scope: this.props.scope
    });
    var controller = {};
    if (this.props.config.controller && this.props.config.controller[this.props.config.name]) {
      controller = this.props.config.controller[this.props.config.name];
    }
    var classes = cx({
      field: true,
      overlay: true,
      'overlay--disabled': controller.disabled
    });
    var text = controller.disabled ? 'View Shared Loading Plan' : 'Submit Shared Loading Plan';
    var callback = this.open;
    var isValid;
    if (this.props.config.model.allocationPercentage.value >= 100) {
      text = '-';
      callback = function() {};
      isValid = true;
    } else {
      isValid = utils.isValid(item.items);
    }
    var textClasses = cx({
      'overlay__open': true,
      'overlay__open--error': !isValid
    });
    return (React.createElement("div", {className: classes}, React.createElement("div", {
      className: textClasses,
      onClick: callback
    }, text), React.createElement("div", {className: overlayClasses}, React.createElement("div", {className: "overlay__container"}, React.createElement("div", {
      className: "overlay__children",
      ref: "overlay"
    }, children), React.createElement("div", {className: "overlay__buttons"}, React.createElement("div", {
      className: "button",
      onClick: this.close
    }, "Done"))))));
  }
};
adapt.component('overlay', overlay);

//# sourceMappingURL=<compileOutput>


},{"../actions/app":4,"../adapt/adapt":10,"../adapt/api/utils":18}],55:[function(require,module,exports){
"use strict";
var $___46__46__47_utils__;
var utils = ($___46__46__47_utils__ = require("../utils"), $___46__46__47_utils__ && $___46__46__47_utils__.__esModule && $___46__46__47_utils__ || {default: $___46__46__47_utils__}).default;
var adapt = require('../adapt/adapt');
var validation = require('../adapt/api/validation');
var AdaptTable = {
  displayName: 'AdaptTable',
  statics: {defaultModelValue: []},
  getInitialState: function() {
    var config = this.props.config;
    return {model: config.model[config.name].value};
  },
  remove: function(id) {
    var config = this.props.config;
    var arr = config.model[config.name].value;
    arr.splice(id, 1);
    this.props.config.model[this.props.config.name].value = arr;
    this.props.adapt.observe.digest();
    this.setState({model: arr});
    if (!arr.length) {
      this.setState({open: -1});
    }
  },
  add: function() {
    var newModel = {};
    var config = this.props.config;
    this.props.adapt.model.createModel(config.item.model, newModel);
    config.model[config.name].value.push(newModel);
    this.props.adapt.observe.digest();
    this.forceUpdate();
  },
  render: function() {
    var item = this.props.config.item;
    var config = this.props.config;
    var openID = this.state.open || -1;
    var items = [];
    var model = this.state.model;
    var controller = {};
    if (this.props.config.controller && this.props.config.controller[this.props.config.name]) {
      controller = this.props.config.controller[this.props.config.name];
    }
    var simple = !!config.item.type.split(':')[1];
    var header = [];
    var partName = '';
    var configItems = this.props.adapt.model.items;
    var study = {
      multi: function() {
        var suffixes = [];
        if (configItems.suffix && utils.isArray(configItems.suffix)) {
          configItems.suffix.value.forEach(function(value) {
            suffixes.push(value.suffix.value);
          });
          partName = [configItems.prefix.value, configItems.base.value, suffixes.join('')].join(' ');
        }
        partName = [configItems.prefix.value, configItems.base.value, suffixes.join('')].join(' ');
        return partName;
      },
      complex: function() {
        return configItems.partName.value;
      },
      single: function() {
        if (configItems.suffix) {
          return [configItems.prefix.value, configItems.base.value, configItems.suffix.value].join(' ');
        }
        return '';
      },
      multiAll: function() {
        return [configItems.prefix.value, configItems.base.value, '(All)'].join(' ');
      }
    };
    partName = (study[configItems.studySupplierFor.value] || study['single'])();
    for (var i in item.model) {
      header.push(React.createElement("th", {key: i}, item.model[i].label));
    }
    var t = 0;
    for (var i = 0; i < model.length; i++) {
      var children = [];
      if (!simple) {
        children.push(React.createElement("td", {className: "id"}, i + 2));
      }
      var config = this.props.config;
      for (var r in item.model) {
        var newItem = utils.copy(item.model[r]);
        delete newItem.desc;
        delete newItem.label;
        if (!this.props.validation.children[r]) {
          this.props.validation.children[r] = new validation(this.props.adapt);
          this.props.validation.children[r].parent = this.props.validation;
        }
        var itemConfig = {
          model: config.model[config.name].value[i],
          controller: config.controller[config.name],
          name: r,
          item: newItem,
          values: config.values,
          observe: config.observe,
          nameTrail: config.nameTrail + config.name + '.',
          validation: this.props.validation.children[r]
        };
        var contents = this.transferPropsTo(React.createElement(adapt.components.item, {config: itemConfig}));
        children.push(React.createElement("td", {key: t + r}, contents));
        t++;
      }
      if (controller.disabled) {
        React.createElement("td", {className: "th__options"});
      } else {
        children.push(React.createElement("td", {className: "th__options"}, React.createElement("span", {onClick: this.remove.bind(this, i)}, React.createElement("i", {className: "fa fa-times fa-fw"}))));
      }
      var REGEX_CURLY = /{([^}]+)}/g;
      items.push(React.createElement("tr", {key: i}, children));
    }
    ;
    var addContent;
    if (!controller.disabled) {
      addContent = (React.createElement("span", {onClick: this.add}, React.createElement("i", {className: "fa fa-plus fa-fw"})));
    }
    return (React.createElement("div", {className: 'element__table clear no-select ' + (simple ? 'element__table--simple' : '')}, React.createElement("table", {
      cellPadding: "0",
      cellSpacing: "0"
    }, React.createElement("thead", null, React.createElement("tr", null, simple ? '' : React.createElement("th", {className: "id"}, '#'), header, React.createElement("th", {className: "th__options"}, addContent))), React.createElement("tbody", null, React.createElement("tr", null, React.createElement("td", {className: "id"}, "1"), React.createElement("td", null, React.createElement("div", {className: "field field__input"}, React.createElement("div", {className: "field__input--container"}, React.createElement("input", {
      value: partName,
      disabled: "disabled"
    })))), React.createElement("td", null, React.createElement("div", {className: "field field__input"}, React.createElement("div", {className: "field__input--container"}, React.createElement("input", {
      value: this.props.adapt.model.items.totalRequiredDemand.value,
      disabled: "disabled"
    })))), React.createElement("td", null, React.createElement("div", {className: "field field__input"}, React.createElement("div", {className: "field__input--container"}, React.createElement("input", {
      value: this.props.config.model.netAvailableTime.value,
      disabled: "disabled"
    })))), React.createElement("td", null, React.createElement("div", {className: "field field__input"}, React.createElement("div", {className: "field__input--container"}, React.createElement("input", {
      value: this.props.config.model.allocationPercentage.value,
      disabled: "disabled"
    }))))), items))));
  }
};
adapt.component('sharedLoadingPlan', AdaptTable);

//# sourceMappingURL=<compileOutput>


},{"../adapt/adapt":10,"../adapt/api/validation":19,"../utils":105}],56:[function(require,module,exports){
"use strict";
var adapt = require('../adapt/adapt');
var sign = {
  componentDidMount: function() {
    var controller = {};
    if (this.props.config.controller && this.props.config.controller[this.props.config.name]) {
      controller = this.props.config.controller[this.props.config.name];
    }
    if (!controller.disabled) {
      var canvas = this.refs.canvas.getDOMNode();
      this.signaturePad = new SignaturePad(canvas, {});
      window.addEventListener('resize', this.resizeCanvas, false);
      this.resizeCanvas();
      var config = this.props.config;
      var _this = this;
      canvas.addEventListener('mousedown', function(e) {
        e.preventDefault();
      });
      canvas.addEventListener('mousemove', function(e) {
        config.model[config.name].value = _this.signaturePad.toDataURL();
      });
    }
  },
  setObservers: function() {
    var that = this;
    var config = this.props.config;
    var observers = config.observe[config.nameTrail + config.name];
    for (var i in observers) {
      observers[i].forEach(function(element, index) {
        that.state.listeners.push(that.props.adapt.observe.addListener(function() {
          return config.model[config.name][i] || config.item[i];
        }, element));
      });
    }
  },
  componentWillMount: function() {
    var that = this;
    var config = this.props.config;
    var model = config.model[config.name];
    if (config.observe[config.nameTrail + config.name]) {
      this.setObservers();
    }
    this.state.listeners.push(this.props.adapt.observe.addListener(function() {
      return config.observe[config.nameTrail + config.name];
    }, function(newVal) {
      that.setObservers();
    }));
  },
  getInitialState: function() {
    var config = this.props.config;
    return {
      model: config.model[config.name].value,
      item: config.item,
      name: config.name,
      listeners: []
    };
  },
  clearCanvas: function() {
    this.signaturePad.clear();
  },
  componentWillUnmount: function() {
    window.removeEventListener('resize', this.resizeCanvas, false);
  },
  resizeCanvas: function() {
    var canvas = this.refs.canvas.getDOMNode();
    var oldData = this.signaturePad.toDataURL();
    canvas.width = window.outerWidth - 48;
    this.signaturePad.fromDataURL(oldData);
  },
  render: function() {
    var item = this.props.config.item;
    var controller = {};
    if (this.props.config.controller && this.props.config.controller[this.props.config.name]) {
      controller = this.props.config.controller[this.props.config.name];
    }
    var canvas,
        clearButton;
    if (!controller.disabled) {
      canvas = (React.createElement("canvas", {
        ref: "canvas",
        height: "200"
      }));
      clearButton = (React.createElement("div", {
        className: "sign__clear",
        onClick: this.clearCanvas
      }, "Clear Signature", React.createElement("i", {className: "fa fa-times"})));
    } else {
      canvas = (React.createElement("div", {className: "sign__dud"}));
    }
    return (React.createElement("div", {
      className: 'field sign ' + (controller.disabled ? 'sign--disabled' : ''),
      ref: "container"
    }, typeof item.label === 'undefined' ? '' : React.createElement(adapt.components.label, {
      config: {item: item},
      adapt: this.props.adapt
    }), React.createElement("div", {className: "sign__tip"}, "Enter signature below"), clearButton, canvas, typeof item.desc === 'undefined' ? '' : React.createElement(adapt.components.description, {
      config: {item: item},
      adapt: this.props.adapt
    })));
  }
};
adapt.component('sign', sign);

//# sourceMappingURL=<compileOutput>


},{"../adapt/adapt":10}],57:[function(require,module,exports){
"use strict";
var $___46__46__47_stores_47_blocks__,
    $___46__46__47_actions_47_blocks__;
var store = ($___46__46__47_stores_47_blocks__ = require("../stores/blocks"), $___46__46__47_stores_47_blocks__ && $___46__46__47_stores_47_blocks__.__esModule && $___46__46__47_stores_47_blocks__ || {default: $___46__46__47_stores_47_blocks__}).default;
var actions = ($___46__46__47_actions_47_blocks__ = require("../actions/blocks"), $___46__46__47_actions_47_blocks__ && $___46__46__47_actions_47_blocks__.__esModule && $___46__46__47_actions_47_blocks__ || {default: $___46__46__47_actions_47_blocks__}).default;
var adapt = require('../adapt/adapt');
var observe = require('../adapt/api/observe');
var validation = require('../adapt/api/validation');
function findClosestParent(event, className) {
  var parent = event.parentNode;
  while (parent != document.body && parent != null) {
    if ((parent) && parent.className && parent.className.indexOf(className) != -1) {
      return parent;
    } else {
      parent = parent ? parent.parentNode : null;
    }
  }
  return null;
}
var spreadsheet = {
  displayName: 'spreadsheet',
  extend: [adapt.mixins.arrayObject],
  getInitialState: function() {
    return {
      open: -1,
      subtitleListeners: [],
      openBlocks: store.getOpen(),
      openDropdown: -1,
      visibleBlocks: store.getVisible()
    };
  },
  componentWillMount: function() {
    var $__2 = this;
    var config = this.props.config;
    var model = config.model[config.name].value;
    this.originalAccordions = [];
    if (model.length) {
      model.forEach((function(item, index) {
        item.randomID = Math.random() * Math.random() * 100;
        $__2.originalAccordions.push(item.randomID);
      }));
    }
    store.on('blockToggled', this.toggleBlockCallback);
    store.on('blockVisibility', this.toggleBlockVisibility);
    document.addEventListener('click', this.handleBodyClick);
    this.validateModel(config.model[config.name].value);
  },
  componentWillUnmount: function() {
    store.off('blockVisibility', this.toggleBlockVisibility);
    store.off('blockToggled', this.toggleBlockCallback);
    document.removeEventListener('click', this.handleBodyClick);
  },
  handleBodyClick: function(e) {
    if (!findClosestParent(e.target, 'spreadsheet__item--remove')) {
      this.setState({openDropdown: -1});
    }
  },
  duplicate: function(accordionId) {
    var config = this.props.config;
    var newModel = {};
    var config = this.props.config;
    var copyOfItem = JSON.parse(JSON.stringify((config.model[config.name].value[accordionId])));
    copyOfItem.desc.value = 'Copy of ' + config.model[config.name].value[accordionId].desc.value;
    config.model[config.name].value.splice(accordionId + 1, 0, copyOfItem);
    this.props.adapt.observe.digest();
    this.setState({openDropdown: -1});
  },
  addAtIndex: function(index) {
    var newModel = {};
    var config = this.props.config;
    this.props.adapt.model.createModel(config.item.model, newModel);
    config.model[config.name].value.splice(index, 0, newModel);
    this.props.adapt.observe.digest();
    this.forceUpdate();
  },
  toggleBlockCallback: function() {
    this.setState({openBlocks: store.getOpen()});
  },
  toggleBlockVisibility: function() {
    this.setState({visibleBlocks: store.getVisible()});
  },
  openDropdown: function(id) {
    this.setState({openDropdown: id == this.state.openDropdown ? -1 : id});
  },
  openAccordion: function(id) {
    this.setState({open: id == this.state.open ? -1 : id});
  },
  toggleBlock: function(id) {
    actions.toggle(id);
  },
  componentDidMount: function() {
    var node = this.getDOMNode();
  },
  render: function() {
    var cx = React.addons.classSet;
    var item = this.props.config.item;
    var config = this.props.config;
    var openID = this.state.open;
    var items = [];
    var model = config.model[config.name].value;
    var loop = adapt.components.loop;
    var _this = this;
    var controller = {};
    if (this.props.config.controller && this.props.config.controller[this.props.config.name]) {
      controller = this.props.config.controller[this.props.config.name];
    }
    if (model) {
      var childController = config.controller[config.name];
      var childModel = config.model[config.name].value;
      var dynamicItem = adapt.components.item;
      _this.state.subtitleListeners.map(function(listener) {
        listener();
      });
      _this.state.subtitleListeners = [];
      for (var i = 0; i < model.length; i++) {
        var children = [];
        var finalModel = childModel[i];
        var control;
        var values;
        if (childController.original && childController.new) {
          if (this.originalAccordions.indexOf(finalModel.randomID) > -1) {
            control = childController.original;
          } else {
            control = childController.new;
          }
        } else {
          control = childController;
        }
        if (!_this.props.scope.children[i]) {
          _this.props.scope.children[i] = new observe(_this.props.adapt);
          _this.props.scope.children[i].parent = this.props.scope;
        }
        if (!_this.props.validation.children[i]) {
          _this.props.validation.children[i] = new validation(_this.props.adapt, _this.props.validation.invalidFields, _this.props.validation.parent);
          _this.props.validation.children[i].id = i;
          _this.props.validation.children[i].parent = this.props.validation;
        }
        var modelItems = item.model;
        for (var index in modelItems) {
          var Component = adapt.components[modelItems[index].type];
          children.push(Component({
            scope: _this.props.scope.children[i],
            validation: _this.props.validation.children[i],
            adapt: _this.props.adapt,
            config: {
              model: finalModel,
              name: index,
              item: modelItems[index],
              controller: control,
              values: config.values,
              observe: config.observe,
              nameTrail: config.nameTrail + config.name + '.'
            }
          }));
        }
        var title = 'Item';
        if (item.title) {
          title = item.title + ' ' + (i + 1);
        }
        var titleClasses = cx({
          'element__accordion--title': true,
          'open': i === openID
        });
        var contentClasses = cx({
          'element__accordion--content': true,
          'open': i === openID
        });
        var dropdownClasses = cx({
          'spreadsheet__dropdown': true,
          'spreadsheet__dropdown--open': this.state.openDropdown === i
        });
        var dropdownButton;
        if (!controller.disabled) {
          dropdownButton = (React.createElement("a", {
            'data-locator': this.props.config.nameTrail + this.props.config.name + '-column-' + i + '-options',
            className: "spreadsheet__item--remove no-select",
            onClick: this.openDropdown.bind(this, i)
          }, React.createElement("i", {className: "fa fa-chevron-down"})));
        }
        items.push(React.createElement("div", {
          className: "spreadsheet__item",
          'data-locator': this.props.config.nameTrail + this.props.config.name + '-column-' + i
        }, React.createElement("div", {
          className: "spreadsheet__header",
          onClick: this.openAccordion.bind(this, i)
        }, React.createElement("h3", null, title)), React.createElement("ul", {
          className: dropdownClasses,
          'data-locator': this.props.config.nameTrail + this.props.config.name + '-column-' + i + '-dropdown'
        }, React.createElement("li", {
          'data-locator': this.props.config.nameTrail + this.props.config.name + '-column-' + i + '-duplicate',
          className: "spreadsheet__dropdown__item",
          onClick: this.duplicate.bind(this, i)
        }, React.createElement("i", {className: "fa fa-copy fa-fw spreadsheet__dropdown__icon"}), "Duplicate"), React.createElement("li", {
          'data-locator': this.props.config.nameTrail + this.props.config.name + '-column-' + i + '-addLeft',
          className: "spreadsheet__dropdown__item",
          onClick: this.addAtIndex.bind(this, i)
        }, React.createElement("i", {className: "fa fa-chevron-left fa-fw spreadsheet__dropdown__icon"}), "Add process to left"), React.createElement("li", {
          'data-locator': this.props.config.nameTrail + this.props.config.name + '-column-' + i + '-addRight',
          className: "spreadsheet__dropdown__item",
          onClick: this.addAtIndex.bind(this, i + 1)
        }, React.createElement("i", {className: "fa fa-chevron-right fa-fw spreadsheet__dropdown__icon"}), "Add process to right"), React.createElement("li", {
          'data-locator': this.props.config.nameTrail + this.props.config.name + '-column-' + i + '-delete',
          className: "spreadsheet__dropdown__item spreadsheet__dropdown__item--delete",
          onClick: this.remove.bind(this, i)
        }, React.createElement("i", {className: "fa fa-times fa-fw spreadsheet__dropdown__icon"}), "Delete")), dropdownButton, React.createElement("div", {className: "spreadsheet__content"}, children)));
      }
      ;
    }
    var title;
    if (item.title) {
      var header = adapt.components.header;
      title = header({
        config: {item: {
            title: item.title,
            type: 'header:h2'
          }},
        adapt: this.props.adapt
      });
    }
    var labels = [];
    var blocks = {};
    for (var i in item.model) {
      if (item.model[i].type === 'block') {
        if (!blocks[i])
          blocks[i] = {children: []};
        var childItem = item.model[i].items;
        for (var t in childItem) {
          if (childItem[t].type === 'blockheader') {
            var classes = {'spreadsheet__blockheader': true};
            var className = childItem[t].className;
            var iconClasses;
            var onClickEvent = function() {};
            if (className) {
              classes[className] = true;
              iconClasses = '';
              blocks[i].children.push(React.createElement("div", {
                className: cx(classes),
                onClick: onClickEvent
              }, React.createElement("i", {className: iconClasses}), childItem[t].label));
            } else {
              onClickEvent = this.toggleBlock.bind(this, i);
              iconClasses = cx({
                'fa': true,
                'fa-chevron-down': this.state.openBlocks.indexOf(i) > -1,
                'fa-chevron-right': this.state.openBlocks.indexOf(i) === -1
              });
              blocks[i].header = (React.createElement("div", {
                className: cx(classes),
                onClick: onClickEvent
              }, React.createElement("i", {className: iconClasses}), childItem[t].label));
            }
          } else {
            blocks[i].children.push(React.createElement("div", {className: "spreadsheet__field"}, childItem[t].label, React.createElement("div", {className: "spreadsheet__field--desc"}, childItem[t].desc)));
          }
        }
      } else {
        labels.push(React.createElement("div", {className: "spreadsheet__field"}, item.model[i].label, React.createElement("div", {className: "spreadsheet__field--desc"}, item.model[i].desc)));
      }
    }
    for (var i in blocks) {
      if (this.state.visibleBlocks.indexOf(i) > -1) {
        var classes$__3 = cx({
          'block__children': true,
          'block__children--hidden': this.state.openBlocks.indexOf(i) === -1
        });
        labels.push(React.createElement("div", {className: "block"}, blocks[i].header, React.createElement("div", {className: classes$__3}, blocks[i].children)));
      }
    }
    var data;
    if (model.length) {
      data = (React.createElement("div", {
        className: "spreadsheet__data",
        ref: "data"
      }, items));
    } else if (!controller.disabled) {
      data = (React.createElement("div", {className: "spreadsheet__empty"}, React.createElement("i", {
        className: "fa fa-exclamation-circle",
        style: {marginRight: '10px'}
      }), "You must have at least one manufacturing process"));
    } else {
      data = (React.createElement("div", {className: "spreadsheet__empty"}, "No Processes"));
    }
    var addButton;
    if (!controller.disabled) {
      addButton = (React.createElement("div", {
        className: "spreadsheet__add--button",
        onClick: this.add
      }, React.createElement("i", {className: "fa fa-plus"}), React.createElement("h3", null, "Add New Process")));
    }
    return (React.createElement("div", {
      className: "spreadsheet clear",
      'data-locator': this.props.config.nameTrail + this.props.config.name + '-container'
    }, React.createElement("div", {
      className: "spreadsheet__titles",
      ref: "titles"
    }, React.createElement("div", {
      className: "spreadsheet__add no-select",
      'data-locator': this.props.config.nameTrail + this.props.config.name + '-add'
    }, addButton), labels, React.createElement("div", {className: "spreadsheet__divider"})), data));
  }
};
adapt.component('spreadsheet', spreadsheet);

//# sourceMappingURL=<compileOutput>


},{"../actions/blocks":5,"../adapt/adapt":10,"../adapt/api/observe":17,"../adapt/api/validation":19,"../stores/blocks":100}],58:[function(require,module,exports){
"use strict";
var adapt = require('../adapt/adapt');
var summary = {render: function() {
    var cx = React.addons.classSet;
    var items = this.props.adapt.model.items;
    var processes = items.processes.value;
    var phase = items.phase.value;
    var hrContent;
    if (processes.length) {
      hrContent = (React.createElement("div", {className: "element__hr"}));
    }
    var children = processes.map(function(process, i) {
      var percentage = 0;
      if (process[phase + 'percentageJLRDemand']) {
        percentage = process[phase + 'percentageJLRDemand'].value;
      }
      var classes = cx({
        'summary__process': true,
        'summary__process--negative': percentage < 0,
        'summary__process--positive': percentage > 0
      });
      var jlrDemand;
      var partsAvailableForShipment;
      var percentageJLRDemand;
      if (process[phase + 'jlrDemand']) {
        jlrDemand = process[phase + 'jlrDemand'].value;
      }
      if (process[phase + 'partsAvailableForShipment']) {
        partsAvailableForShipment = process[phase + 'partsAvailableForShipment'].value;
      }
      if (process[phase + 'jlrDemand']) {
        percentageJLRDemand = process[phase + 'percentageJLRDemand'].value;
      }
      return (React.createElement("div", {className: classes}, React.createElement("h4", {className: "summary__desc"}, "Process ", i + 1, ": ", process.desc), React.createElement("ul", {className: "summary__list"}, React.createElement("li", {className: "summary__item"}, React.createElement("div", {className: "summary__item--header"}, "JLR Demand"), React.createElement("div", {className: "summary__item--value"}, jlrDemand)), React.createElement("li", {className: "summary__item"}, React.createElement("div", {className: "summary__item--header"}, "Weekly Parts Available for Shipment"), React.createElement("div", {className: "summary__item--value"}, partsAvailableForShipment)), React.createElement("li", {className: "summary__item"}, React.createElement("div", {className: "summary__item--header"}, "Percentage Above/Below JLR Demand"), React.createElement("div", {className: "summary__item--value"}, percentageJLRDemand)))));
    });
    return (React.createElement("div", {className: "summary"}, React.createElement("div", {className: "clear"}, children), hrContent));
  }};
adapt.component('summaryTab', summary);

//# sourceMappingURL=<compileOutput>


},{"../adapt/adapt":10}],59:[function(require,module,exports){
"use strict";
var dispatcher = require('../flux/dispatcher');
module.exports = new dispatcher();

//# sourceMappingURL=<compileOutput>


},{"../flux/dispatcher":61}],60:[function(require,module,exports){
"use strict";
var $__router__,
    $__components_47_header_46_jsx__,
    $__components_47_sign_46_jsx__,
    $__components_47_sharedLoadingPlan_46_jsx__,
    $__components_47_buttonContainer_46_jsx__,
    $__components_47_autoSave_46_jsx__,
    $__components_47_button_46_jsx__,
    $__components_47_block_46_jsx__,
    $__components_47_overlay_46_jsx__,
    $__components_47_spreadsheet_46_jsx__,
    $__components_47_summary_46_jsx__,
    $__components_47_bottlenecks__,
    $__components_47_chart_46_jsx__,
    $__pages_47_index_46_jsx__;
var router = ($__router__ = require("./router"), $__router__ && $__router__.__esModule && $__router__ || {default: $__router__}).default;
var header = ($__components_47_header_46_jsx__ = require("./components/header.jsx"), $__components_47_header_46_jsx__ && $__components_47_header_46_jsx__.__esModule && $__components_47_header_46_jsx__ || {default: $__components_47_header_46_jsx__}).default;
var sign = ($__components_47_sign_46_jsx__ = require("./components/sign.jsx"), $__components_47_sign_46_jsx__ && $__components_47_sign_46_jsx__.__esModule && $__components_47_sign_46_jsx__ || {default: $__components_47_sign_46_jsx__}).default;
var sLP = ($__components_47_sharedLoadingPlan_46_jsx__ = require("./components/sharedLoadingPlan.jsx"), $__components_47_sharedLoadingPlan_46_jsx__ && $__components_47_sharedLoadingPlan_46_jsx__.__esModule && $__components_47_sharedLoadingPlan_46_jsx__ || {default: $__components_47_sharedLoadingPlan_46_jsx__}).default;
var buttonContainer = ($__components_47_buttonContainer_46_jsx__ = require("./components/buttonContainer.jsx"), $__components_47_buttonContainer_46_jsx__ && $__components_47_buttonContainer_46_jsx__.__esModule && $__components_47_buttonContainer_46_jsx__ || {default: $__components_47_buttonContainer_46_jsx__}).default;
var autoSave = ($__components_47_autoSave_46_jsx__ = require("./components/autoSave.jsx"), $__components_47_autoSave_46_jsx__ && $__components_47_autoSave_46_jsx__.__esModule && $__components_47_autoSave_46_jsx__ || {default: $__components_47_autoSave_46_jsx__}).default;
var button = ($__components_47_button_46_jsx__ = require("./components/button.jsx"), $__components_47_button_46_jsx__ && $__components_47_button_46_jsx__.__esModule && $__components_47_button_46_jsx__ || {default: $__components_47_button_46_jsx__}).default;
var block = ($__components_47_block_46_jsx__ = require("./components/block.jsx"), $__components_47_block_46_jsx__ && $__components_47_block_46_jsx__.__esModule && $__components_47_block_46_jsx__ || {default: $__components_47_block_46_jsx__}).default;
var overlay = ($__components_47_overlay_46_jsx__ = require("./components/overlay.jsx"), $__components_47_overlay_46_jsx__ && $__components_47_overlay_46_jsx__.__esModule && $__components_47_overlay_46_jsx__ || {default: $__components_47_overlay_46_jsx__}).default;
var spreadsheet = ($__components_47_spreadsheet_46_jsx__ = require("./components/spreadsheet.jsx"), $__components_47_spreadsheet_46_jsx__ && $__components_47_spreadsheet_46_jsx__.__esModule && $__components_47_spreadsheet_46_jsx__ || {default: $__components_47_spreadsheet_46_jsx__}).default;
var summary = ($__components_47_summary_46_jsx__ = require("./components/summary.jsx"), $__components_47_summary_46_jsx__ && $__components_47_summary_46_jsx__.__esModule && $__components_47_summary_46_jsx__ || {default: $__components_47_summary_46_jsx__}).default;
var bottlenecks = ($__components_47_bottlenecks__ = require("./components/bottlenecks"), $__components_47_bottlenecks__ && $__components_47_bottlenecks__.__esModule && $__components_47_bottlenecks__ || {default: $__components_47_bottlenecks__}).default;
var chart = ($__components_47_chart_46_jsx__ = require("./components/chart.jsx"), $__components_47_chart_46_jsx__ && $__components_47_chart_46_jsx__.__esModule && $__components_47_chart_46_jsx__ || {default: $__components_47_chart_46_jsx__}).default;
var index = ($__pages_47_index_46_jsx__ = require("./pages/index.jsx"), $__pages_47_index_46_jsx__ && $__pages_47_index_46_jsx__.__esModule && $__pages_47_index_46_jsx__ || {default: $__pages_47_index_46_jsx__}).default;
React.render(index(null), document.body);

//# sourceMappingURL=<compileOutput>


},{"./components/autoSave.jsx":47,"./components/block.jsx":48,"./components/bottlenecks":49,"./components/button.jsx":50,"./components/buttonContainer.jsx":51,"./components/chart.jsx":52,"./components/header.jsx":53,"./components/overlay.jsx":54,"./components/sharedLoadingPlan.jsx":55,"./components/sign.jsx":56,"./components/spreadsheet.jsx":57,"./components/summary.jsx":58,"./pages/index.jsx":84,"./router":91}],61:[function(require,module,exports){
"use strict";
var utils = require('./utils');
function Dispatcher() {
  var self = this;
  var _callbacks = {};
  var _pending = {};
  var _handled = {};
  var _name = null;
  var _data = null;
  var _dispatching = false;
  function _call(id) {
    _pending[id] = true;
    _callbacks[id](_name, _data);
    _handled[id] = true;
  }
  function _preDispatch(name, data) {
    _dispatching = true;
    Object.keys(_callbacks).forEach(function(id) {
      _pending[id] = false;
      _handled[id] = false;
    });
    _name = name;
    _data = data;
  }
  function _dispatch() {
    Object.keys(_callbacks).forEach(function(id) {
      if (_pending[id]) {
        return;
      }
      try {
        _call(id);
      } catch (e) {
        console.dir(e.stack);
      }
    });
  }
  function _postDispatch() {
    _data = null;
    _name = null;
    _dispatching = false;
  }
  self.dispatch = function(name, data) {
    if (_dispatching) {
      throw new Error('Dispatcher.dispatch: called while dispatching');
    }
    _preDispatch(name, data);
    _dispatch();
    _postDispatch();
  };
  self.register = function(cb, id) {
    if (typeof cb !== 'function') {
      throw new Error('Dispatcher.register: callback is not a function');
    }
    id = id || utils.uid();
    _callbacks[id] = cb;
    return id;
  };
  self.unregister = function(id) {
    delete _callbacks[id];
  };
  self.wait = function(ids) {
    ids.forEach(function(id) {
      if (!_dispatching) {
        throw new Error('Dispatcher.wait: called while not dispatching');
      }
      if (!_callbacks[id]) {
        throw new Error('Dispatcher.wait: called with missing id');
      }
      if (_pending[id]) {
        if (!_handled[id]) {
          throw new Error('Dispatcher.wait: detected cycle');
        }
        return;
      }
      _call(id);
    });
  };
}
module.exports = Dispatcher;

//# sourceMappingURL=<compileOutput>


},{"./utils":64}],62:[function(require,module,exports){
"use strict";
function Emitter() {
  var self = this;
  var _listeners = {};
  self.addListener = function(name, callback) {
    if (typeof callback !== 'function' || self.hasListener(name, callback)) {
      return false;
    }
    _listeners[name] = _listeners[name] || [];
    _listeners[name].push(callback);
    return true;
  };
  self.emit = function(name, data) {
    if (!_listeners[name]) {
      return false;
    }
    _listeners[name].forEach(function(callback) {
      callback(data);
    });
    return true;
  };
  self.hasListener = function(name, callback) {
    var callbacks = _listeners[name];
    if (!callbacks || callbacks.indexOf(callback) === -1) {
      return false;
    }
    return true;
  };
  self.removeAll = function(name) {
    _listeners[name] = [];
  };
  self.removeListener = function(name, callback) {
    console.log('TRY TO REMOVE', name, callback, _listeners);
    if (!self.hasListener(name, callback)) {
      console.log('DOESNT HAVE', name);
      return false;
    }
    _listeners[name] = _listeners[name].filter(function(cb) {
      return cb !== callback;
    });
    if (!_listeners[name].length) {
      console.log('REMOVED LISTENER', name, callback, _listeners);
      delete _listeners[name];
    }
    return true;
  };
}
module.exports = Emitter;

//# sourceMappingURL=<compileOutput>


},{}],63:[function(require,module,exports){
"use strict";
var Emitter = require('./emitter');
var utils = require('./utils');
function Store(cfg) {
  var self = this;
  var _cfg,
      _data,
      _dispatcher,
      _emitter,
      _id,
      _handlers;
  _cfg = utils.config({data: null}, cfg, 'Store');
  _data = _cfg.data;
  _dispatcher = _cfg.dispatcher;
  _emitter = new Emitter();
  _id = utils.uid();
  _handlers = {_global: {}};
  self.off = function(name, callback) {
    return _emitter.removeListener(name, callback);
  };
  self.removeAll = function(name) {
    return _emitter.removeAll(name);
  };
  self.on = function(name, callback) {
    return _emitter.addListener(name, callback);
  };
  self.emit = function(name, data, opts) {
    opts = new Object(opts);
    if (opts.silent) {
      return false;
    }
    return _emitter.emit(name, data);
  };
  self.clear = function(opts) {
    _data = null;
    self.emit('change', _data, opts);
    return self;
  };
  self.set = function(data, opts) {
    _data = data;
    self.emit('change', _data, opts);
    return self;
  };
  self.registerHandlers = function(handlers, id) {
    if (id) {
      _handlers[id] = handlers;
    } else {
      _handlers._global = handlers;
    }
  };
  self.unregisterHandlers = function(id) {
    if (id) {
      delete _handlers[id];
    } else {
      _handlers._global = {};
    }
  };
  self.createActions = function(actions) {
    var boundActions = {};
    Object.keys(actions).forEach(function(key) {
      boundActions[key] = actions[key].bind(self);
    });
    return boundActions;
  };
  Object.defineProperties(self, {
    dispatcher: {
      enumerable: true,
      get: function() {
        return _dispatcher;
      }
    },
    id: {
      enumerable: true,
      get: function() {
        return _id;
      }
    },
    handlers: {
      enumerable: true,
      get: function() {
        return _handlers;
      }
    },
    data: {
      enumerable: true,
      get: function() {
        return _data;
      }
    }
  });
  _dispatcher.register(function(payload) {
    var cbs = payload.id ? _handlers[payload.id] : _handlers._global;
    var cb = cbs ? cbs[payload.action] : null;
    if (typeof cb === 'function') {
      cb.call(self, payload.data);
    }
  }, _id);
}
module.exports = Store;

//# sourceMappingURL=<compileOutput>


},{"./emitter":62,"./utils":64}],64:[function(require,module,exports){
"use strict";
var _uid = 1;
var utils;
utils = {
  config: function(defaults, config, name) {
    if (!config || !config.dispatcher) {
      throw new Error(name + ' requires a Dispatcher');
    }
    return utils.merge(defaults, config);
  },
  merge: function() {
    var objs = Array.prototype.slice.call(arguments);
    var result = {};
    objs.forEach(function(obj) {
      Object.keys(obj).forEach(function(key) {
        result[key] = obj[key];
      });
    });
    return result;
  },
  parse: function(req) {
    var result;
    try {
      result = JSON.parse(req.responseText);
    } catch (e) {
      result = null;
    }
    return result;
  },
  request: function(url, cb) {
    var req = new XMLHttpRequest();
    req.onload = function() {
      if (req.status >= 200 && req.status < 400) {
        cb(undefined, req);
      } else {
        cb(new Error('Store: There was a status error.'), req);
      }
    };
    req.onerror = function() {
      cb(new Error('Store: There was a network error.'), req);
    };
    req.open('GET', url, true);
    req.send();
  },
  uid: function() {
    return _uid++;
  },
  url: function(v, params) {
    var result = v + '?';
    Object.keys(params).forEach(function(key) {
      result += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&';
    });
    return result.slice(0, -1);
  }
};
module.exports = utils;

//# sourceMappingURL=<compileOutput>


},{}],65:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_utils__,
    $___46__46__47_actions_47_alert__,
    $___46__46__47_xhr__,
    $___46__46__47_actions_47_save__,
    $__language__;
var utils = ($___46__46__47_utils__ = require("../utils"), $___46__46__47_utils__ && $___46__46__47_utils__.__esModule && $___46__46__47_utils__ || {default: $___46__46__47_utils__}).default;
var alert = ($___46__46__47_actions_47_alert__ = require("../actions/alert"), $___46__46__47_actions_47_alert__ && $___46__46__47_actions_47_alert__.__esModule && $___46__46__47_actions_47_alert__ || {default: $___46__46__47_actions_47_alert__}).default;
var xhr = ($___46__46__47_xhr__ = require("../xhr"), $___46__46__47_xhr__ && $___46__46__47_xhr__.__esModule && $___46__46__47_xhr__ || {default: $___46__46__47_xhr__}).default;
var saveActions = ($___46__46__47_actions_47_save__ = require("../actions/save"), $___46__46__47_actions_47_save__ && $___46__46__47_actions_47_save__.__esModule && $___46__46__47_actions_47_save__ || {default: $___46__46__47_actions_47_save__}).default;
var language = ($__language__ = require("./language"), $__language__ && $__language__.__esModule && $__language__ || {default: $__language__}).default;
var requests = {
  submit: function(data) {
    var $__5 = data,
        newData = $__5.newData,
        response = $__5.response,
        workflowId = $__5.workflowId,
        nodeId = $__5.nodeId;
    alert.open(language.submit.wait);
    var headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    newData.review = 'submit';
    var endpoint = '/rest/workflow/';
    if (response.status === 'CREATED') {
      endpoint += 'start/' + workflowId;
    } else {
      endpoint += 'progress/' + nodeId;
    }
    xhr('PUT', endpoint, {}, JSON.stringify(newData), headers).then(function() {
      alert.open(language.submit.success);
    }, function() {
      alert.open(language.errors.generic);
    });
  },
  approve: function(data) {
    var $__5 = data,
        newData = $__5.newData,
        nodeId = $__5.nodeId;
    alert.open(language.approve.wait);
    var headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    newData.review = 'approved';
    xhr('PUT', '/rest/workflow/progress/' + nodeId, {}, JSON.stringify(newData), headers).then(function() {
      alert.open(language.approve.success);
    }, function() {
      alert.open(language.errors.generic);
    });
  },
  reject: function(data) {
    var $__5 = data,
        newData = $__5.newData,
        nodeId = $__5.nodeId;
    alert.open(language.reject.wait);
    var headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    newData.review = 'rejected';
    xhr('PUT', '/rest/workflow/progress/' + nodeId, {}, JSON.stringify(newData), headers).then(function() {
      alert.open(language.reject.success);
    }, function() {
      alert.open(language.errors.generic);
    });
  }
};
var handlers = {
  saveButton: function(data) {
    var $__5 = data,
        model = $__5.model,
        workflowId = $__5.workflowId;
    var newData = {};
    utils.convert(model.items, newData);
    var headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    alert.open(language.save.wait);
    xhr('PUT', '/rest/workflow/' + workflowId, {}, JSON.stringify(newData), headers).then(function() {
      alert.open(language.save.success);
      saveActions.stop();
      setTimeout(function() {
        alert.close();
      }, 2000);
    }, function() {
      alert.open(language.errors.generic);
    });
  },
  submitConfirmation: function(data) {
    var $__5 = data,
        newData = $__5.newData,
        workflowId = $__5.workflowId,
        nodeId = $__5.nodeId,
        response = $__5.response;
    var alertToOpen = language.submit.check;
    alertToOpen.buttons = [{
      type: 'cancel',
      text: 'Cancel'
    }, {
      type: 'button',
      text: 'Continue',
      callback: requests.submit.bind(this, {
        newData: newData,
        workflowId: workflowId,
        nodeId: nodeId,
        response: response
      })
    }];
    alert.open(alertToOpen);
  },
  submitButton: function(data) {
    var $__5 = data,
        model = $__5.model,
        workflowId = $__5.workflowId,
        nodeId = $__5.nodeId,
        response = $__5.response,
        contactDetailsPristine = $__5.contactDetailsPristine,
        contactDetailsChecked = $__5.contactDetailsChecked;
    var newData = {};
    utils.convert(model.items, newData);
    if (contactDetailsPristine && !contactDetailsChecked) {
      var alertToOpen = language.detailsCheck;
      alertToOpen.buttons = [{
        type: 'cancel',
        text: 'Cancel'
      }, {
        type: 'button',
        text: 'Continue',
        callback: handlers.submitConfirmation.bind(this, {
          newData: newData,
          workflowId: workflowId,
          nodeId: nodeId,
          response: response
        })
      }];
      alert.open(alertToOpen);
    } else {
      handlers.submitConfirmation({
        newData: newData,
        workflowId: workflowId,
        nodeId: nodeId,
        response: response
      });
    }
  },
  approveButton: function(data) {
    var $__5 = data,
        model = $__5.model,
        nodeId = $__5.nodeId;
    var newData = {};
    utils.convert(model.items, newData);
    var alertToOpen = language.approve.check;
    alertToOpen.buttons = [{
      type: 'cancel',
      text: 'Cancel'
    }, {
      type: 'button',
      text: 'Continue',
      callback: requests.approve.bind(this, {
        newData: newData,
        nodeId: nodeId
      })
    }];
    alert.open(alertToOpen);
  },
  rejectButton: function(data) {
    var $__5 = data,
        model = $__5.model,
        nodeId = $__5.nodeId;
    var newData = {};
    utils.convert(model.items, newData);
    var alertToOpen = language.reject.check;
    alertToOpen.buttons = [{
      type: 'cancel',
      text: 'Cancel'
    }, {
      type: 'button',
      text: 'Continue',
      callback: requests.reject.bind(this, {
        newData: newData,
        nodeId: nodeId
      })
    }];
    alert.open(alertToOpen);
  }
};
var $__default = handlers;

//# sourceMappingURL=<compileOutput>


},{"../actions/alert":3,"../actions/save":8,"../utils":105,"../xhr":106,"./language":75}],66:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_utils__;
var utils = ($___46__46__47_utils__ = require("../utils"), $___46__46__47_utils__ && $___46__46__47_utils__.__esModule && $___46__46__47_utils__ || {default: $___46__46__47_utils__}).default;
function getButtons(state) {
  if (state.readOnly)
    return {};
  var statuses = {
    draft: function() {
      if (state.currentUserCanEdit) {
        return {
          submitButton: {
            type: "button",
            className: "submit",
            text: "Submit"
          },
          saveButton: {
            type: "button",
            text: "Save",
            className: "save"
          }
        };
      }
    },
    awaitingApproval: function() {
      if (state.currentUserCanEdit) {
        return {
          rejectButton: {
            type: "button",
            text: "Reject",
            className: "reject"
          },
          approveButton: {
            type: "button",
            text: "Approve",
            className: "approve"
          },
          saveButton: {
            type: "button",
            text: "Save",
            className: "save"
          }
        };
      }
    }
  };
  return (statuses[state.status] || function() {})() || {};
}
var $__default = getButtons;

//# sourceMappingURL=<compileOutput>


},{"../utils":105}],67:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var constants = {
  phases: {
    capacityPlanning: {
      nextPhase: 'phase0',
      prettyName: 'Capacity Planning'
    },
    phase0: {
      nextPhase: 'phase3',
      prettyName: 'Phase 0'
    },
    phase3: {
      nextPhase: 'capacityConfirmation',
      prettyName: 'Phase 3'
    },
    capacityConfirmation: {prettyName: 'Capacity Confirmation'}
  },
  phaseKeys: ['capacityPlanning', 'phase0', 'phase3', 'capacityConfirmation'],
  phaseFields: ['sharedProcessAllocation', 'equipmentHeader', 'totalDurationOfProductionRun', 'equipTotalPlannedDowntime', 'equipNetAvailableTime', 'sharedEquipChangeover', 'totalUnplannedDowntime', 'actualProductionTime', 'equipmentAvailability', 'totalPartsRun', 'perfNetIdealCycleTime', 'performanceEfficiency', 'availabilityAndPELossesNotCaptured', 'numberOfPartsRejected', 'numberOfPartsReworked', 'rightFirstTime', 'firstTimeThrough', 'oee', 'processSpecificWeek', 'processSpecificHour', 'processSpecificDay', 'observedCycleTime', 'jlrDemand', 'partsAvailableForShipment', 'percentageJLRDemand'],
  capPlanFields: ['desc', 'daysPerWeek', 'shiftsPerDay', 'hoursPerShift', 'personalBreaks', 'plannedMaintenance', 'inspectionOfFacilities', 'plannedChangeoverFrequency', 'plannedMinutesPerChangeover', 'totalPlannedDowntime', 'allocationPercentage', 'netAvailableTime', 'requiredGoodPartsHeader', 'percentageOfPartsRejected', 'requiredGoodPartsPerWeek', 'percentOfPartsReworked', 'idealPlannedCycleTime', 'numberOfToolsParallel', 'identicalPartsPerCycle', 'netIdealCycleTime', 'plannedProductionPerWeek', 'requiredOEE', 'plannedProductionPerDay', 'plannedProductionPerHour', 'otherAssumptions', 'sharedLoadingPlan', 'percentageNetAvailTime', 'totalPercentageAllocation'],
  calculatedFields: ['equipNetAvailableTime', 'actualProductionTime', 'equipmentAvailability', 'performanceEfficiency', 'availabilityAndPELossesNotCaptured', 'rightFirstTime', 'firstTimeThrough', 'oee', 'processSpecificWeek', 'processSpecificHour', 'processSpecificDay', 'observedCycleTime', 'jlrDemand', 'partsAvailableForShipment', 'percentageJLRDemand', 'perfNetIdealCycleTime'],
  processFields: ['totalPlannedDowntime', 'netAvailableTime', 'requiredGoodPartsPerWeek', 'netIdealCycleTime', 'plannedProductionPerWeek', 'requiredOEE', 'plannedProductionPerHour', 'plannedProductionPerDay', 'totalPercentageAllocation']
};
var $__default = constants;

//# sourceMappingURL=<compileOutput>


},{}],68:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_utils__,
    $__controller_47_supplier__;
var utils = ($___46__46__47_utils__ = require("../utils"), $___46__46__47_utils__ && $___46__46__47_utils__.__esModule && $___46__46__47_utils__ || {default: $___46__46__47_utils__}).default;
var supplierController = ($__controller_47_supplier__ = require("./controller/supplier"), $__controller_47_supplier__ && $__controller_47_supplier__.__esModule && $__controller_47_supplier__ || {default: $__controller_47_supplier__}).default;
function disableController(controller) {
  for (var i in controller) {
    if (utils.isObject(controller[i])) {
      if (Object.keys(controller[i]).length) {
        disableController(controller[i]);
      }
      controller[i].disabled = true;
    }
  }
}
function getController(instance, state) {
  var controller = instance.controller.items;
  if (state.readOnly) {
    disableController(controller);
    console.log('READ ONLY', controller);
    return controller;
  }
  var statuses = {
    draft: function() {
      if (state.currentUserCanEdit && state.isSupplier) {
        return supplierController(controller, state, instance);
      }
      disableController(controller);
      return controller;
    },
    awaitingApproval: function() {
      if (state.currentUserCanEdit && state.isSta) {
        disableController(controller);
        controller.staComments.disabled = false;
        controller.staNameSign.disabled = false;
        controller.staDateSign.disabled = false;
        return controller;
      }
      disableController(controller);
      return controller;
    }
  };
  return (statuses[state.status] || function() {})() || {};
}
;
var $__default = getController;

//# sourceMappingURL=<compileOutput>


},{"../utils":105,"./controller/supplier":70}],69:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  defaultController: {get: function() {
      return defaultController;
    }},
  phaseController: {get: function() {
      return phaseController;
    }},
  __esModule: {value: true}
});
var $___46__46__47__46__46__47_adapt_47_adapt__,
    $___46__46__47_constants__;
var adapt = ($___46__46__47__46__46__47_adapt_47_adapt__ = require("../../adapt/adapt"), $___46__46__47__46__46__47_adapt_47_adapt__ && $___46__46__47__46__46__47_adapt_47_adapt__.__esModule && $___46__46__47__46__46__47_adapt_47_adapt__ || {default: $___46__46__47__46__46__47_adapt_47_adapt__}).default;
var constants = ($___46__46__47_constants__ = require("../constants"), $___46__46__47_constants__ && $___46__46__47_constants__.__esModule && $___46__46__47_constants__ || {default: $___46__46__47_constants__}).default;
var defaultController = (function(instance) {
  return {
    supplierName: {validation: {
        onType: true,
        maxLength: 100,
        required: true
      }},
    address: {validation: {
        onType: true,
        maxLength: 100,
        required: true
      }},
    city: {validation: {
        onType: true,
        maxLength: 100,
        required: true
      }},
    county: {validation: {
        onType: true,
        maxLength: 50,
        required: true
      }},
    country: {validation: {
        onType: true,
        maxLength: 50,
        pattern: {
          pattern: '^[a-zA-Z-\']*$',
          flag: 'i',
          message: 'Can only be text and \' or -'
        },
        required: true
      }},
    supplierRepresentativeName: {validation: {
        onType: true,
        maxLength: 50,
        pattern: {
          pattern: '^[ a-zA-Z-\']*$',
          flag: 'i',
          message: 'Can only be text and \' or -'
        },
        required: true
      }},
    supplierRepresentativeRole: {validation: {
        onType: true,
        maxLength: 50,
        pattern: {
          pattern: '^[ a-zA-Z-\']*$',
          flag: 'i',
          message: 'Can only be text and \' or -'
        },
        required: true
      }},
    supplierRepresentativeEmail: {validation: {
        onType: true,
        pattern: {
          pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$',
          flag: 'i',
          message: 'Must be a valid email address'
        },
        required: true
      }},
    jlrStaName: {validation: {
        onType: true,
        maxLength: 50,
        pattern: {
          pattern: '^[ a-zA-Z-\']*$',
          flag: 'i',
          message: 'Can only be text and \' or -'
        },
        required: true
      }},
    jlrStaEmail: {validation: {
        onType: true,
        pattern: {
          pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$',
          flag: 'i',
          message: 'Must be a valid email address'
        },
        required: true
      }},
    supplierRepresentativePhone: {
      preprocess: function(value) {
        value = value.replace(/ /g, '');
        value = value.replace(/\+/g, '');
        var spaces = [2, 4, 8];
        var number = '';
        for (var i = 0; i < value.length; i++) {
          if (spaces.indexOf(i) > -1) {
            number += ' ';
          }
          number += value[i];
        }
        return ("+" + number);
      },
      validation: {
        onType: true,
        pattern: {
          pattern: '^[0-9+ ]*$',
          flag: 'i',
          message: 'Must be a valid phone number'
        },
        maxLength: 16,
        required: true
      }
    },
    jlrStaPhone: {
      preprocess: function(value) {
        value = value.replace(/ /g, '');
        value = value.replace(/\+/g, '');
        var spaces = [2, 4, 8];
        var number = '';
        for (var i = 0; i < value.length; i++) {
          if (spaces.indexOf(i) > -1) {
            number += ' ';
          }
          number += value[i];
        }
        return ("+" + number);
      },
      validation: {
        onType: true,
        pattern: {
          pattern: '^[0-9+ ]*$',
          flag: 'i',
          message: 'Must be a valid phone number'
        },
        maxLength: 16,
        required: true
      }
    },
    manufacturingGSDB: {
      validation: {
        onType: true,
        length: 5,
        pattern: {
          pattern: '^[a-zA-Z0-9]*$',
          flag: 'i',
          message: 'Only alphanumeric characters'
        },
        required: true
      },
      preprocess: function(value) {
        return value.toUpperCase();
      }
    },
    qualityGSDB: {
      validation: {
        onType: true,
        length: 5,
        pattern: {
          pattern: '^[a-zA-Z0-9]*$',
          flag: 'i',
          message: 'Only alphanumeric characters'
        },
        required: true
      },
      preprocess: function(value) {
        return value.toUpperCase();
      }
    },
    partName: {validation: {
        onType: true,
        maxLength: 100,
        required: true
      }},
    directedName: {validation: {
        onType: true,
        maxLength: 100,
        required: true
      }},
    directedGSDB: {
      validation: {
        onType: true,
        length: 5,
        pattern: {
          pattern: '^[a-zA-Z0-9]*$',
          flag: 'i',
          message: 'Only alphanumeric characters'
        },
        required: true
      },
      preprocess: function(value) {
        return value.toUpperCase();
      }
    },
    prefix: {
      validation: {
        onType: true,
        pattern: {
          pattern: '^[a-zA-Z0-9]*$',
          flag: 'i',
          message: 'Only alphanumeric characters'
        },
        required: true
      },
      warning: function(value) {
        if (value.length !== 4) {
          return 'Is this the correct prefix?';
        }
      },
      preprocess: function(value) {
        return value.toUpperCase();
      }
    },
    base: {
      validation: {
        onType: true,
        pattern: {
          pattern: '^[a-zA-Z0-9]*$',
          flag: 'i',
          message: 'Only alphanumeric characters'
        },
        required: true
      },
      preprocess: function(value) {
        return value.toUpperCase();
      }
    },
    suffix: {
      validation: {
        onType: true,
        pattern: {
          pattern: '^[a-zA-Z0-9]*$',
          flag: 'i',
          message: 'Only alphanumeric characters'
        },
        required: true
      },
      warning: function(value) {
        console.log('check warning', value);
        if (value.length < 2 || value.length > 10) {
          return 'Is this the correct suffix?';
        }
      },
      preprocess: function(value) {
        return value.toUpperCase();
      }
    },
    ppapLevel: {validation: {
        onType: true,
        required: true
      }},
    declaration: {validation: {
        onType: true,
        required: true
      }},
    processes: {
      validation: {
        minLength: 1,
        onType: true
      },
      desc: {validation: {
          onType: true,
          maxLength: 50,
          pattern: {
            pattern: '^[ a-zA-Z-\']*$',
            flag: 'i',
            message: 'Can only be text and \' or -'
          },
          required: true
        }},
      daysPerWeek: {validation: {
          onType: true,
          required: true,
          custom: function(value) {
            if (value < 0 || value > 7) {
              return {
                passed: false,
                message: 'Must be between 1-7'
              };
            }
          }
        }},
      shiftsPerDay: {validation: {
          onType: true,
          required: true,
          custom: function(value) {
            if (value < 0 || value > 5) {
              return {
                passed: false,
                message: 'Must be between 1-5'
              };
            }
          }
        }},
      hoursPerShift: {validation: {
          onType: true,
          required: true,
          custom: function(value) {
            if (value > (24 / this.shiftsPerDay.value)) {
              return {
                passed: false,
                message: 'Hours/day more than 24'
              };
            }
          }
        }},
      personalBreaks: {validation: {
          onType: true,
          required: true,
          custom: function(value) {
            var maxValue = this.hoursPerShift.value * 60;
            if ((this.plannedMaintenance.value * 1) + (value * 1) > maxValue) {
              return {
                passed: false,
                message: 'Exceeds shift length'
              };
            }
            if (value > maxValue) {
              return {
                passed: false,
                message: 'Exceeds shift length'
              };
            }
          }
        }},
      plannedMaintenance: {validation: {
          onType: true,
          required: true,
          custom: function(value) {
            var maxValue = this.hoursPerShift.value * 60;
            if ((this.personalBreaks.value * 1) + (value * 1) > maxValue) {
              return {
                passed: false,
                message: 'Exceeds shift length'
              };
            }
            if (value > maxValue) {
              return {
                passed: false,
                message: 'Exceeds shift length'
              };
            }
          }
        }},
      inspectionOfFacilities: {validation: {
          onType: true,
          required: true,
          custom: function(value) {
            var JLRC = this.daysPerWeek.value * 1;
            var JLRD = this.shiftsPerDay.value * 1;
            var JLRE = this.hoursPerShift.value * 1;
            var maxValue = JLRC * JLRD * JLRE * 60;
            if (value > maxValue) {
              return {
                passed: false,
                message: 'Exceeds week length'
              };
            }
          }
        }},
      plannedChangeoverFrequency: {validation: {
          onType: true,
          required: true
        }},
      plannedMinutesPerChangeover: {validation: {
          onType: true,
          required: true,
          custom: function(value) {
            var JLRI = this.plannedChangeoverFrequency.value * 1;
            if (JLRI === 0 && (value * 1) !== 0) {
              return {
                passed: false,
                message: 'Must be 0'
              };
            }
          }
        }},
      allocationPercentage: {validation: {
          onType: true,
          required: true,
          custom: function(value) {
            if (value < 0 || value > 100) {
              return {
                passed: false,
                message: 'Must be between 0 and 100'
              };
            }
          }
        }},
      totalPercentageAllocation: {validation: {
          onType: true,
          custom: function(value) {
            if (value > 100 && this.allocationPercentage.value < 100) {
              return {
                passed: false,
                message: 'Must be less than 100%'
              };
            }
          }
        }},
      percentageOfPartsRejected: {validation: {
          onType: true,
          required: true,
          custom: function(value) {
            if (value > 100 || value < 0) {
              return {
                passed: false,
                message: 'Must be between 0 and 100'
              };
            }
          }
        }},
      percentOfPartsReworked: {validation: {
          onType: true,
          required: true,
          custom: function(value) {
            if (value > 100 || value < 0) {
              return {
                passed: false,
                message: 'Must be between 0 and 100'
              };
            }
          }
        }},
      idealPlannedCycleTime: {validation: {
          onType: true,
          required: true,
          custom: function(value) {
            if (value <= 0) {
              return {
                passed: false,
                message: 'Must be more than 0'
              };
            }
          }
        }},
      numberOfToolsParallel: {validation: {
          onType: true,
          required: true,
          custom: function(value) {
            if (value <= 0) {
              return {
                passed: false,
                message: 'Must be more than 0'
              };
            }
          }
        }},
      identicalPartsPerCycle: {validation: {
          onType: true,
          required: true,
          custom: function(value) {
            if (value <= 0) {
              return {
                passed: false,
                message: 'Must be more than 0'
              };
            }
          }
        }},
      otherAssumptions: {validation: {
          onType: true,
          maxLength: 400
        }}
    }
  };
});
var phaseController = (function(phase) {
  return {
    sharedProcessAllocation: {validation: {
        onType: true,
        required: true,
        custom: function(value) {
          if (value > 100 || value < 0) {
            return {
              passed: false,
              message: 'Must be between 0 and 100'
            };
          }
        }
      }},
    totalDurationOfProductionRun: {validation: {
        onType: true,
        required: true,
        custom: function(value) {
          if (value <= 0) {
            return {
              passed: false,
              message: 'Must be more than 0'
            };
          }
        }
      }},
    equipTotalPlannedDowntime: {validation: {
        onType: true,
        required: true,
        custom: function(value) {
          if (value < 0) {
            return {
              passed: false,
              message: 'Min value is 0'
            };
          }
        }
      }},
    sharedEquipChangeover: {validation: {
        onType: true,
        required: true,
        custom: function(value) {
          if (value < 0) {
            return {
              passed: false,
              message: 'Min value is 0'
            };
          }
        }
      }},
    totalUnplannedDowntime: {validation: {
        onType: true,
        required: true,
        custom: function(value) {
          if (value < 0) {
            return {
              passed: false,
              message: 'Min value is 0'
            };
          }
        }
      }},
    totalPartsRun: {validation: {
        onType: true,
        required: true,
        custom: function(value) {
          if (value <= 0) {
            return {
              passed: false,
              message: 'Must be more than 0'
            };
          }
        }
      }},
    numberOfPartsRejected: {validation: {
        onType: true,
        required: true,
        custom: function(value) {
          if (value > this[phase + 'totalPartsRun'].value) {
            return {
              passed: false,
              message: 'More than total parts run'
            };
          }
          if (value < 0) {
            return {
              passed: false,
              message: 'Min value is 0'
            };
          }
        }
      }},
    numberOfPartsReworked: {validation: {
        onType: true,
        required: true,
        custom: function(value) {
          if (value > this[phase + 'numberOfPartsRejected'].value) {
            return {
              passed: false,
              message: 'More than no. parts rejected'
            };
          }
          if (value < 0) {
            return {
              passed: false,
              message: 'Min value is 0'
            };
          }
        }
      }}
  };
});
;

//# sourceMappingURL=<compileOutput>


},{"../../adapt/adapt":10,"../constants":67}],70:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_constants__,
    $__default__;
var constants = ($___46__46__47_constants__ = require("../constants"), $___46__46__47_constants__ && $___46__46__47_constants__.__esModule && $___46__46__47_constants__ || {default: $___46__46__47_constants__}).default;
var $__1 = ($__default__ = require("./default"), $__default__ && $__default__.__esModule && $__default__ || {default: $__default__}),
    defaultControl = $__1.defaultController,
    phaseController = $__1.phaseController;
function getSupplierController(controller, state, instance) {
  var fields = ['volumeTotal', 'otherVolumeTotal', 'staComments', 'staNameSign', 'staDateSign'];
  var newController = {};
  var defaultController = defaultControl(instance);
  for (var i in defaultController) {
    newController[i] = defaultController[i];
  }
  newController.processes.original = {};
  newController.processes.new = newController.processes;
  constants.phaseKeys.forEach((function(phase) {
    if (phase !== 'capacityPlanning') {
      var phaseValidation = phaseController(phase);
      for (var i in phaseValidation) {
        newController.processes.new[phase + i] = phaseValidation[i];
        newController.processes.original[phase + i] = phaseValidation[i];
      }
      constants.calculatedFields.forEach((function(field) {
        if (!newController.processes.new[phase + field])
          newController.processes.new[phase + field] = {};
        newController.processes.new[phase + field].disabled = true;
        if (!newController.processes.original[phase + field])
          newController.processes.original[phase + field] = {};
        newController.processes.original[phase + field].disabled = true;
      }));
      constants.processFields.forEach((function(field) {
        if (!newController.processes.new[field])
          newController.processes.new[field] = {};
        newController.processes.new[field].disabled = true;
      }));
      fields.forEach((function(field) {
        if (!newController[field])
          newController[field] = {};
        newController[field].disabled = true;
      }));
    }
  }));
  if (state.supersedesAnotherWf) {
    var phaseIndex = constants.phaseKeys.indexOf(state.phase);
    var phasesToDisable = constants.phaseKeys.slice(0, phaseIndex);
    phasesToDisable.forEach((function(phase) {
      if (phase === 'capacityPlanning') {
        constants.capPlanFields.forEach((function(field) {
          if (!newController.processes.original[field])
            newController.processes.original[field] = {};
          newController.processes.original[field].disabled = true;
        }));
      } else {
        constants.phaseFields.forEach((function(field) {
          if (!newController.processes.original[phase + field])
            newController.processes.original[phase + field] = {};
          newController.processes.original[phase + field].disabled = true;
          newController.processes.original[phase + field].validation = {};
          if (phase !== instance.model.items.phase.value) {
            if (!newController.processes.new[phase + field])
              newController.processes.new[phase + field] = {};
            newController.processes.new[phase + field].disabled = true;
          }
        }));
      }
    }));
  }
  for (var i in newController) {
    controller[i] = newController[i];
  }
  console.log('CONTROLLER', controller);
  return controller;
}
var $__default = getSupplierController;

//# sourceMappingURL=<compileOutput>


},{"../constants":67,"./default":69}],71:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var defaultModel = {phase: 'capacityPlanning'};
var $__default = defaultModel;

//# sourceMappingURL=<compileOutput>


},{}],72:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__defaultModel__,
    $__view__,
    $__buttons__,
    $__controller__,
    $___46__46__47_stores_47_user__,
    $__constants__,
    $___46__46__47_utils__,
    $___46__46__47_actions_47_save__,
    $___46__46__47_stores_47_save__,
    $___46__46__47_stores_47_buttons__,
    $___46__46__47_form_47_buttonHandlers__,
    $___46__46__47_actions_47_alert__,
    $__language__,
    $___46__46__47_xhr__;
var defaultModel = ($__defaultModel__ = require("./defaultModel"), $__defaultModel__ && $__defaultModel__.__esModule && $__defaultModel__ || {default: $__defaultModel__}).default;
var defaultView = ($__view__ = require("./view"), $__view__ && $__view__.__esModule && $__view__ || {default: $__view__}).default;
var getButtons = ($__buttons__ = require("./buttons"), $__buttons__ && $__buttons__.__esModule && $__buttons__ || {default: $__buttons__}).default;
var controller = ($__controller__ = require("./controller"), $__controller__ && $__controller__.__esModule && $__controller__ || {default: $__controller__}).default;
var userStore = ($___46__46__47_stores_47_user__ = require("../stores/user"), $___46__46__47_stores_47_user__ && $___46__46__47_stores_47_user__.__esModule && $___46__46__47_stores_47_user__ || {default: $___46__46__47_stores_47_user__}).default;
var constants = ($__constants__ = require("./constants"), $__constants__ && $__constants__.__esModule && $__constants__ || {default: $__constants__}).default;
var utils = ($___46__46__47_utils__ = require("../utils"), $___46__46__47_utils__ && $___46__46__47_utils__.__esModule && $___46__46__47_utils__ || {default: $___46__46__47_utils__}).default;
var saveActions = ($___46__46__47_actions_47_save__ = require("../actions/save"), $___46__46__47_actions_47_save__ && $___46__46__47_actions_47_save__.__esModule && $___46__46__47_actions_47_save__ || {default: $___46__46__47_actions_47_save__}).default;
var saveStore = ($___46__46__47_stores_47_save__ = require("../stores/save"), $___46__46__47_stores_47_save__ && $___46__46__47_stores_47_save__.__esModule && $___46__46__47_stores_47_save__ || {default: $___46__46__47_stores_47_save__}).default;
var buttonStore = ($___46__46__47_stores_47_buttons__ = require("../stores/buttons"), $___46__46__47_stores_47_buttons__ && $___46__46__47_stores_47_buttons__.__esModule && $___46__46__47_stores_47_buttons__ || {default: $___46__46__47_stores_47_buttons__}).default;
var buttonHandlers = ($___46__46__47_form_47_buttonHandlers__ = require("../form/buttonHandlers"), $___46__46__47_form_47_buttonHandlers__ && $___46__46__47_form_47_buttonHandlers__.__esModule && $___46__46__47_form_47_buttonHandlers__ || {default: $___46__46__47_form_47_buttonHandlers__}).default;
var alert = ($___46__46__47_actions_47_alert__ = require("../actions/alert"), $___46__46__47_actions_47_alert__ && $___46__46__47_actions_47_alert__.__esModule && $___46__46__47_actions_47_alert__ || {default: $___46__46__47_actions_47_alert__}).default;
var language = ($__language__ = require("./language"), $__language__ && $__language__.__esModule && $__language__ || {default: $__language__}).default;
var xhr = ($___46__46__47_xhr__ = require("../xhr"), $___46__46__47_xhr__ && $___46__46__47_xhr__.__esModule && $___46__46__47_xhr__ || {default: $___46__46__47_xhr__}).default;
var form = function form(config) {
  this.config = config;
  var response = config.getForm;
  this.workflowId = response.workflowId;
  this.state = this.getState();
  this.state.supersedesAnotherWf = response.model && response.model.supersedesAnotherWf;
  this.state.isNotASupersede = (!response.model || (response.model && !response.model.supersedesAnotherWf));
  this.state.phase = response.model ? response.model.phase : '';
  var nodes;
  this.nodeId = (nodes = response.currentRenderedNodes) ? nodes[0].id : '';
};
($traceurRuntime.createClass)(form, {
  createModel: function() {
    var modelObjects = [];
    modelObjects.push(JSON.parse(JSON.stringify(defaultModel)));
    var retrievedForm;
    (retrievedForm = this.config.getForm.model) && modelObjects.push(retrievedForm);
    var details;
    (details = this.config.getDetails) && modelObjects.push(details);
    var builtModel = {};
    modelObjects.forEach((function(model) {
      for (var i in model) {
        builtModel[i] = model[i];
      }
    }));
    return builtModel;
  },
  createView: function() {
    var builtView = JSON.parse(JSON.stringify(defaultView));
    builtView.buttonContainer.items = getButtons(this.state);
    return builtView;
  },
  createController: function() {
    return controller(this.instance, this.state);
  },
  changePPAP: function() {
    if (this.state.supersedesAnotherWf) {
      var phaseContainer = this.instance.view.items.tabs.items.phase.items.col.items;
      var ppapLevel = phaseContainer.ppapLevel;
      ppapLevel.options = [{
        value: this.config.getForm.model.ppapLevel,
        label: this.config.getForm.model.ppapLevel.split('_')[1]
      }];
      this.instance.controller.items.ppapLevel.disabled = true;
    }
  },
  changePhase: function() {
    if (this.state.supersedesAnotherWf) {
      var phaseContainer = this.instance.view.items.tabs.items.phase.items.col.items;
      var phaseInfo = phaseContainer.phase;
      phaseInfo.options = [{
        value: this.config.getForm.model.phase,
        label: constants.phases[this.config.getForm.model.phase].prettyName
      }];
      this.instance.controller.items.phase.disabled = true;
    }
  },
  getState: function() {
    var formData = this.config.getForm;
    var createdByEmail = formData.createdByEmail;
    var staEmail = formData.model ? formData.model.jlrStaEmail : '';
    var currentUserEmail = userStore.user.emailAddress;
    var nodes = formData.currentRenderedNodes;
    var statuses = {
      CREATED: function() {
        var state = {status: 'draft'};
        if (currentUserEmail === createdByEmail) {
          state.currentUserCanEdit = true;
          state.isSupplier = true;
        }
        return state;
      },
      ACTIVE: function() {
        if (utils.hasNode('STAApproval', nodes)) {
          var state = {status: 'awaitingApproval'};
          if (currentUserEmail === staEmail) {
            state.currentUserCanEdit = true;
            state.isSta = true;
          }
          return state;
        }
        if (utils.hasNode('STARejectedSupplierReview', nodes)) {
          return {
            readOnly: true,
            status: 'staRejected'
          };
        }
        return {
          readOnly: true,
          status: ''
        };
      },
      COMPLETED: function() {
        return {
          readOnly: true,
          status: 'completed'
        };
      }
    };
    return statuses[formData.status]();
  },
  monitorContactDetails: function() {
    var $__14 = this;
    this.contactDetailsChecked = true;
    this.contactDetailsPristine = false;
    if (this.state.isSupplier && this.state.currentUserCanEdit) {
      this.contactDetailsPristine = true;
      this.contactDetailsChecked = false;
      this.contactFired = false;
      var fieldsToWatch = ['supplierName', 'county', 'qualityGSDB', 'address', 'country', 'city', 'manufacturingGSDB', 'supplierRepresentativeName', 'supplierRepresentativePhone', 'supplierRepresentativeRole', 'supplierRepresentativeEmail', 'jlrStaEmail', 'jlrStaName', 'jlrStaPhone'];
      var model = this.instance.model;
      var fields = [];
      fieldsToWatch.forEach((function(field) {
        fields.push(model.items[field].value);
      }));
      var originalValue = fields.join('');
      this.instance.emitter.on('fieldUpdated', (function() {
        if (!$__14.contactDetailsPristine)
          return;
        var fields = [];
        fieldsToWatch.forEach((function(field) {
          fields.push(model.items[field].value);
        }));
        if (fields.join('') !== originalValue) {
          $__14.contactDetailsPristine = false;
        }
      }));
      var nodes = document.querySelectorAll('.tabsdefault__header--item');
      Array.prototype.slice.call(nodes).forEach((function(element) {
        if (element.innerText !== 'Details') {
          element.addEventListener('click', (function(e) {
            if (!$__14.contactDetailsChecked && $__14.contactDetailsPristine) {
              var alertToOpen = language.detailsCheck;
              alertToOpen.buttons = [{
                type: 'cancel',
                text: 'Cancel'
              }, {
                type: 'button',
                text: 'Continue',
                callback: (function() {
                  $__14.contactDetailsChecked = true;
                  element.click();
                  window.scrollTo(0, 0);
                })
              }];
              alert.open(alertToOpen);
              e.preventDefault();
              e.stopPropagation();
            }
          }));
        }
      }));
    }
  },
  save: function() {
    var newData = {};
    utils.convert(this.instance.model.items, newData);
    var headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    xhr('PUT', '/rest/workflow/' + this.workflowId, {}, JSON.stringify(newData), headers).then(function() {
      saveActions.stop();
    });
  },
  monitorPPAP: function() {
    var $__14 = this;
    var openAlert = (function() {
      alert.open(language.ppapCheck);
    });
    var checked = false;
    this.instance.model.find('ppapLevel').observe((function(newVal, oldVal) {
      if ($__14.config.getForm.model) {
        if ((newVal !== $__14.config.getForm.model.ppapLevel && !checked) || checked) {
          openAlert();
        }
        checked = true;
      } else {
        openAlert();
      }
    }));
  },
  setupButtons: function() {
    var $__14 = this;
    buttonStore.on('buttonClick', (function(name) {
      setTimeout((function() {
        var valid = !$__14.instance.invalidFields.length;
        if (name !== 'submitButton' || valid) {
          buttonHandlers[name]({
            model: $__14.instance.model,
            workflowId: $__14.workflowId,
            nodeId: $__14.nodeId,
            response: $__14.config.getForm,
            contactDetailsPristine: $__14.contactDetailsPristine,
            contactDetailsChecked: $__14.contactDetailsChecked
          });
          if (name === 'submitButton') {
            $__14.contactDetailsChecked = true;
          }
        }
      }), 0);
    }));
    var instance = this.instance;
    var validation = instance.validation;
    var updateButtonClasses = (function() {
      var button = instance.view.items.buttonContainer.items.submitButton;
      if (button) {
        if ($__14.instance.invalidFields.length) {
          button.className = 'disabled';
        } else {
          button.className = 'submit';
        }
      }
      instance.observe.digest();
    });
    updateButtonClasses();
    validation.on('updatedValidation', updateButtonClasses);
  },
  startAutoSave: function() {
    this.autoSaveListener = function() {};
    if (this.state.currentUserCanEdit) {
      saveStore.on('saveSaving', this.save.bind(this));
      var timeout;
      this.instance.emitter.on('fieldUpdated', (function() {
        saveActions.start();
        clearTimeout(timeout);
        timeout = setTimeout(saveActions.save, 1000);
      }));
    }
  },
  stopAutoSave: function() {
    this.instance.emitter.removeAll('fieldUpdated');
    saveStore.removeAll('saveSaving');
  }
}, {});
var $__default = form;

//# sourceMappingURL=<compileOutput>


},{"../actions/alert":3,"../actions/save":8,"../form/buttonHandlers":65,"../stores/buttons":101,"../stores/save":103,"../stores/user":104,"../utils":105,"../xhr":106,"./buttons":66,"./constants":67,"./controller":68,"./defaultModel":71,"./language":75,"./view":78}],73:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var capacityPlanningFormulas = (function(model) {
  return {
    totalPlannedDowntime: function() {
      var JLRF = this.personalBreaks.value * 1;
      var JLRG = this.plannedMaintenance.value * 1;
      var JLRC = this.daysPerWeek.value * 1;
      var JLRD = this.shiftsPerDay.value * 1;
      var JLRI = this.plannedChangeoverFrequency.value * 1;
      var JLRJ = this.plannedMinutesPerChangeover.value * 1;
      var JLRH = this.inspectionOfFacilities.value * 1;
      var result = (JLRF + JLRG) * JLRC * JLRD + (JLRI * JLRJ) + JLRH;
      return isNaN(result) ? '' : result;
    },
    netAvailableTime: function() {
      var JLRC = this.daysPerWeek.value * 1;
      var JLRD = this.shiftsPerDay.value * 1;
      var JLRE = this.hoursPerShift.value * 1;
      var JLRK = this.totalPlannedDowntime.value * 1;
      var JLRL = this.allocationPercentage.value * 1;
      var result = ((((JLRC * JLRD * JLRE) - (JLRK / 60)) * JLRL) / 100).toFixed(2);
      return isNaN(result) ? '' : result;
    },
    requiredGoodPartsPerWeek: function() {
      var JLRA = model.find('totalRequiredDemand')[0].value;
      var JLRN = this.percentageOfPartsRejected.value * 1;
      var result = Math.ceil(JLRA * 100 / (100 - JLRN));
      return isNaN(result) ? '' : result;
    },
    netIdealCycleTime: function() {
      var JLRQ = this.idealPlannedCycleTime.value * 1;
      var JLRR = this.numberOfToolsParallel.value * 1;
      var JLRS = this.identicalPartsPerCycle.value * 1;
      var result = (JLRQ / (JLRR * JLRS)).toFixed(2);
      return isNaN(result) ? '' : result;
    },
    plannedProductionPerWeek: function() {
      var JLRE = this.hoursPerShift.value * 1;
      var JLRF = this.personalBreaks.value * 1;
      var JLRG = this.plannedMaintenance.value * 1;
      var JLRH = this.inspectionOfFacilities.value * 1;
      var JLRC = this.daysPerWeek.value * 1;
      var JLRD = this.shiftsPerDay.value * 1;
      var JLRI = this.plannedChangeoverFrequency.value * 1;
      var JLRJ = this.plannedMinutesPerChangeover.value * 1;
      var JLRL = this.allocationPercentage.value * 1;
      var JLRT = this.netIdealCycleTime.value * 1;
      var result = Math.floor(((60 * JLRE) - (JLRF + JLRG) - (JLRH / JLRC / JLRD) - (JLRI * JLRJ / JLRC / JLRD)) * JLRC * JLRD * JLRL / 100 * 60 / JLRT);
      return isNaN(result) ? '' : result;
    },
    requiredOEE: function() {
      var JLRP = this.requiredGoodPartsPerWeek.value * 1;
      var JLRU = this.plannedProductionPerWeek.value * 1;
      var result = ((JLRP / JLRU) * 100).toFixed(2);
      return isNaN(result) ? '' : result;
    },
    plannedProductionPerHour: function() {
      var JLRF = this.personalBreaks.value * 1;
      var JLRE = this.hoursPerShift.value * 1;
      var JLRG = this.plannedMaintenance.value * 1;
      var JLRH = this.inspectionOfFacilities.value * 1;
      var JLRC = this.daysPerWeek.value * 1;
      var JLRD = this.shiftsPerDay.value * 1;
      var JLRI = this.plannedChangeoverFrequency.value * 1;
      var JLRJ = this.plannedMinutesPerChangeover.value * 1;
      var JLRL = this.allocationPercentage.value * 1;
      var JLRT = this.netIdealCycleTime.value * 1;
      var result = Math.floor(((60 - (JLRF / JLRE) - (JLRG / JLRE) - (JLRH / JLRC / JLRD / JLRE) - (JLRI * JLRJ / JLRC / JLRD / JLRE)) * JLRL / 100 * 60 / JLRT));
      return isNaN(result) ? '' : result;
    },
    plannedProductionPerDay: function() {
      var JLRF = this.personalBreaks.value * 1;
      var JLRE = this.hoursPerShift.value * 1;
      var JLRG = this.plannedMaintenance.value * 1;
      var JLRH = this.inspectionOfFacilities.value * 1;
      var JLRC = this.daysPerWeek.value * 1;
      var JLRD = this.shiftsPerDay.value * 1;
      var JLRI = this.plannedChangeoverFrequency.value * 1;
      var JLRJ = this.plannedMinutesPerChangeover.value * 1;
      var JLRL = this.allocationPercentage.value * 1;
      var JLRT = this.netIdealCycleTime.value * 1;
      var result = Math.floor((((60 * JLRE) - (JLRF + JLRG) - (JLRH / JLRC / JLRD) - (JLRI * JLRJ / JLRC / JLRD)) * JLRD * JLRL / 100 * 60 / JLRT).toFixed(2));
      return isNaN(result) ? '' : result;
    },
    totalPercentageAllocation: function() {
      var sharedLoadingPlan = this.sharedLoadingPlan.value;
      var sum = 0;
      sharedLoadingPlan.forEach(function(item) {
        if (!isNaN(item.requiredAllocationByPart.value) * 1) {
          sum += item.requiredAllocationByPart.value * 1;
        }
      });
      if (!isNaN(this.allocationPercentage.value * 1)) {
        sum += this.allocationPercentage.value * 1;
      }
      if (!isNaN(this.percentageNetAvailTime.value * 1)) {
        sum += this.percentageNetAvailTime.value * 1;
      }
      return isNaN(sum) ? '' : sum;
    }
  };
});
var $__default = capacityPlanningFormulas;

//# sourceMappingURL=<compileOutput>


},{}],74:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var otherPhasesFormulas = (function(phase, model) {
  return {
    equipNetAvailableTime: function() {
      var JLRAD = this[phase + 'totalDurationOfProductionRun'].value * 1;
      var JLRAE = this[phase + 'equipTotalPlannedDowntime'].value * 1;
      var result = JLRAD - JLRAE;
      return isNaN(result) ? '' : result;
    },
    actualProductionTime: function() {
      var JLRAF = this[phase + 'equipNetAvailableTime'].value * 1;
      var JLRAG = this[phase + 'sharedEquipChangeover'].value * 1;
      var JLRAI = this[phase + 'totalUnplannedDowntime'].value * 1;
      var result = JLRAF - JLRAG - JLRAI;
      return isNaN(result) ? '' : result;
    },
    equipmentAvailability: function() {
      var JLRAJ = this[phase + 'actualProductionTime'].value * 1;
      var JLRAF = this[phase + 'equipNetAvailableTime'].value * 1;
      var result = ((JLRAJ / JLRAF) * 100).toFixed(2);
      return isNaN(result) ? '' : result;
    },
    performanceEfficiency: function() {
      var JLRAM = this[phase + 'totalPartsRun'].value * 1;
      var JLRAN = this[phase + 'perfNetIdealCycleTime'].value * 1;
      var JLRAJ = this[phase + 'actualProductionTime'].value * 1;
      var result = ((JLRAM * JLRAN / (JLRAJ * 60)) * 100).toFixed(2);
      return isNaN(result) ? '' : result;
    },
    availabilityAndPELossesNotCaptured: function() {
      var JLRAM = this[phase + 'totalPartsRun'].value * 1;
      var JLRAN = this[phase + 'perfNetIdealCycleTime'].value * 1;
      var JLRAK = this[phase + 'equipmentAvailability'].value * 1;
      var result = (JLRAK - (JLRAN * JLRAM) / 60).toFixed(2);
      return isNaN(result) ? '' : result;
    },
    rightFirstTime: function() {
      var JLRAM = this[phase + 'totalPartsRun'].value * 1;
      var JLRAQ = this[phase + 'numberOfPartsRejected'].value * 1;
      var JLRAR = this[phase + 'numberOfPartsReworked'].value * 1;
      var result = ((JLRAM - (JLRAQ - JLRAR)) / JLRAM) * 100;
      return isNaN(result) ? '' : result;
    },
    firstTimeThrough: function() {
      var JLRAM = this[phase + 'totalPartsRun'].value * 1;
      var JLRAQ = this[phase + 'numberOfPartsRejected'].value * 1;
      var result = ((JLRAM - JLRAQ) / JLRAM) * 100;
      return isNaN(result) ? '' : result;
    },
    oee: function() {
      var JLRAK = this[phase + 'equipmentAvailability'].value * 1;
      var JLRAO = this[phase + 'performanceEfficiency'].value * 1;
      var JLRAS = this[phase + 'rightFirstTime'].value * 1;
      var result = ((JLRAK * JLRAO * JLRAS) / 10000).toFixed(2);
      return isNaN(result) ? '' : result;
    },
    perfNetIdealCycleTime: function() {
      return this.netIdealCycleTime.value;
    },
    processSpecificWeek: function() {
      var JLRU = this.plannedProductionPerWeek.value * 1;
      var JLRAU = this[phase + 'oee'].value * 1;
      var result = Math.round(JLRU * JLRAU / 100);
      return isNaN(result) ? '' : result;
    },
    processSpecificHour: function() {
      var JLRCA = this.plannedProductionPerHour.value * 1;
      var JLRAU = this[phase + 'oee'].value * 1;
      var result = Math.round(JLRCA * JLRAU / 100);
      return isNaN(result) ? '' : result;
    },
    processSpecificDay: function() {
      var JLRCB = this.plannedProductionPerDay.value * 1;
      var JLRAU = this[phase + 'oee'].value * 1;
      var result = Math.round(JLRCB * JLRAU / 100);
      return isNaN(result) ? '' : result;
    },
    observedCycleTime: function() {
      var JLRAJ = this[phase + 'actualProductionTime'].value * 1;
      var JLRAM = this[phase + 'totalPartsRun'].value * 1;
      var result = (JLRAJ * 60 / JLRAM).toFixed(2);
      return isNaN(result) ? '' : result;
    },
    jlrDemand: function() {
      return model.find('totalRequiredDemand')[0].value;
    },
    partsAvailableForShipment: function() {
      var partType = model.find('partType')[0].value;
      var toFind = {
        sequenced: 'processSpecificWeek',
        non: 'processSpecificHour'
      };
      if (toFind[partType]) {
        return this[phase + toFind[partType]].value;
      } else {
        return '';
      }
    },
    percentageJLRDemand: function() {
      var JLRBD = this[phase + 'partsAvailableForShipment'].value * 1;
      var JLRBC = this[phase + 'jlrDemand'].value * 1;
      var result = Math.round(((JLRBD - JLRBC) / JLRBC) * 100);
      return isNaN(result) ? '' : result;
    }
  };
});
var $__default = otherPhasesFormulas;

//# sourceMappingURL=<compileOutput>


},{}],75:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var language = {
  approve: {
    check: {
      warning: true,
      header: 'Are you sure?',
      message: 'Are you sure you want to approve this eCAR?'
    },
    wait: {
      waiting: true,
      header: 'Please Wait..',
      message: 'You are approving this eCAR'
    },
    success: {
      success: true,
      header: 'Success',
      message: 'The eCAR has been approved',
      buttons: [{
        type: 'link',
        link: '/#/current',
        text: 'Go to your eCARs'
      }]
    }
  },
  reject: {
    check: {
      warning: true,
      header: 'Are you sure?',
      message: 'Are you sure you want to reject this eCAR?'
    },
    wait: {
      waiting: true,
      header: 'Please Wait..',
      message: 'You are rejecting this eCAR'
    },
    success: {
      success: true,
      header: 'Success',
      message: 'The eCAR has been rejected',
      buttons: [{
        type: 'link',
        link: '/#/current',
        text: 'Go to your eCARs'
      }]
    }
  },
  save: {
    wait: {
      waiting: true,
      header: 'Please Wait..',
      message: 'Your eCAR is being saved'
    },
    success: {
      success: true,
      header: 'Success',
      message: 'Your eCAR has been saved'
    }
  },
  submit: {
    check: {
      warning: true,
      header: 'Are you sure?',
      message: 'Are you sure that you want to submit this eCAR for approval'
    },
    wait: {
      waiting: true,
      header: 'Please Wait..',
      message: 'Your eCAR is being submitted'
    },
    success: {
      success: true,
      header: 'Success',
      message: 'Your eCAR has been submitted',
      buttons: [{
        type: 'link',
        link: '/#/current',
        text: 'Go to your eCARs'
      }]
    }
  },
  errors: {generic: {
      error: true,
      header: 'Something went wrong',
      message: 'An error has occured, please try again later',
      buttons: [{
        type: 'button',
        text: 'Continue'
      }]
    }},
  detailsCheck: {
    warning: true,
    header: 'Check your details',
    message: 'Your contact details have not been modified. Please make sure they\'re up to date before continuing.'
  },
  ppapCheck: {
    warning: true,
    header: 'Please check PPAP Level',
    message: 'Please check what your PPAP level is with your STA',
    buttons: [{
      type: 'button',
      text: 'Continue'
    }]
  }
};
var $__default = language;

//# sourceMappingURL=<compileOutput>


},{}],76:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_actions_47_blocks__,
    $___46__46__47_router_47_stores_47_router__,
    $___46__46__47_actions_47_alert__,
    $___46__46__47_utils__,
    $__constants__,
    $__formulas_47_capacityPlanning__,
    $__formulas_47_otherPhases__;
var blocksActions = ($___46__46__47_actions_47_blocks__ = require("../actions/blocks"), $___46__46__47_actions_47_blocks__ && $___46__46__47_actions_47_blocks__.__esModule && $___46__46__47_actions_47_blocks__ || {default: $___46__46__47_actions_47_blocks__}).default;
var routerStore = ($___46__46__47_router_47_stores_47_router__ = require("../router/stores/router"), $___46__46__47_router_47_stores_47_router__ && $___46__46__47_router_47_stores_47_router__.__esModule && $___46__46__47_router_47_stores_47_router__ || {default: $___46__46__47_router_47_stores_47_router__}).default;
var alert = ($___46__46__47_actions_47_alert__ = require("../actions/alert"), $___46__46__47_actions_47_alert__ && $___46__46__47_actions_47_alert__.__esModule && $___46__46__47_actions_47_alert__ || {default: $___46__46__47_actions_47_alert__}).default;
var utils = ($___46__46__47_utils__ = require("../utils"), $___46__46__47_utils__ && $___46__46__47_utils__.__esModule && $___46__46__47_utils__ || {default: $___46__46__47_utils__}).default;
var constants = ($__constants__ = require("./constants"), $__constants__ && $__constants__.__esModule && $__constants__ || {default: $__constants__}).default;
var capacityPlanning = ($__formulas_47_capacityPlanning__ = require("./formulas/capacityPlanning"), $__formulas_47_capacityPlanning__ && $__formulas_47_capacityPlanning__.__esModule && $__formulas_47_capacityPlanning__ || {default: $__formulas_47_capacityPlanning__}).default;
var otherPhasesFormulas = ($__formulas_47_otherPhases__ = require("./formulas/otherPhases"), $__formulas_47_otherPhases__ && $__formulas_47_otherPhases__.__esModule && $__formulas_47_otherPhases__ || {default: $__formulas_47_otherPhases__}).default;
function isValid(children, toReturn) {
  toReturn = typeof toReturn === 'undefined' ? true : toReturn;
  for (var i in children) {
    if (typeof children[i].valid !== 'undefined') {
      if (children[i].valid === false) {
        toReturn = false;
      }
    }
    if (children[i].items) {
      toReturn = isValid(children[i].items, toReturn);
    }
  }
  return toReturn;
}
var listeners = function(form) {
  var model = form.model;
  var view = form.view;
  var capacityPlanningFormulas = capacityPlanning(model);
  var parts = ["l359", "l319", "l316", "l538", "l550", "l450", "l460", "l494", "l462", "x760", "x260", "x150", "x152", "x250", "x351"];
  function addPhase0Dates(newVal) {
    var phase0column = view.find('tabs.phase.phase0Dates');
    if (newVal === 'phase0' || newVal === 'capacityPlanning') {
      phase0column.append('phase0date', {
        type: 'input:date',
        label: 'Phase 0 Run at Rate'
      }, model.items.phase0date ? model.items.phase0date.value * 1 : '', form.config.controller.supplierName);
      phase0column.append('phase3date', {
        type: 'input:date',
        label: 'Phase 3 Run at Rate'
      }, model.items.phase3date ? model.items.phase3date.value * 1 : '', form.config.controller.supplierName);
    } else {
      phase0column.destroy('phase0date');
      phase0column.destroy('phase3date');
    }
  }
  addPhase0Dates(model.find('phase')[0].value);
  model.find('phase').observe(addPhase0Dates);
  model.find('volumeTotal').setValue(function() {
    var total = 0;
    model.items.studySubmittedFor.value.forEach(function(element) {
      var modelValue = model.find(element);
      if (modelValue[0]) {
        total += modelValue[0].value * 1;
      }
    });
    return total;
  });
  model.find('partType').observe(function(newVal) {
    var period;
    if (newVal === 'sequenced') {
      period = ' Hourly';
    } else {
      period = ' Weekly';
    }
    parts.forEach(function(element) {
      var itemsView = view.find('tabs.part.volumeTotals')[0];
      if (itemsView.items[element]) {
        itemsView.items[element].label = element + period + ' Volume';
      }
      form.observe.digest();
    });
  });
  var studySubmittedFor = model.items.studySubmittedFor.value;
  if (studySubmittedFor.length) {
    var sequenced = model.find('partType')[0];
    var suffix = view.find('tabs.part.volumeTotals');
    studySubmittedFor.forEach(function(value) {
      var label = value;
      if (sequenced.value) {
        label += {
          sequenced: ' Hourly',
          non: ' Weekly'
        }[sequenced.value];
      }
      label += ' Volume';
      var modelValue = '';
      if (model.items[value]) {
        modelValue = model.items[value].value;
      }
      suffix.append(value, {
        type: 'input',
        label: label
      }, modelValue, form.config.controller.prefix);
    });
  }
  model.find('studySubmittedFor').observe(function(newVal, oldVal, diff) {
    var volumeTotals = view.find('tabs.part.volumeTotals');
    var sequenced = model.find('partType')[0];
    if (diff) {
      diff.forEach(function(element) {
        if (element.action === 'removed') {
          volumeTotals.destroy(element.value);
        } else {
          var label = element.value;
          if (sequenced.value) {
            label += {
              sequenced: ' Hourly',
              non: ' Weekly'
            }[sequenced.value];
          }
          label += ' Volume';
          volumeTotals.append(element.value, {
            type: 'input',
            label: label
          }, form.config.controller.prefix);
        }
      });
    }
  });
  model.find('directedPart').observe(function(newVal) {
    var directedCol = view.find('tabs.part.directedCol');
    var responses = {
      yes: function() {
        directedCol.append('directedName', {
          type: 'input',
          label: 'Directed Supplier Name'
        }, model.items.directedName ? model.items.directedName.value : '', form.config.controller.directedName || form.config.controller.prefix);
        directedCol.append('directedGSDB', {
          type: 'input',
          label: 'Directed to Supplier GSDB code'
        }, model.items.directedGSDB ? model.items.directedGSDB.value : '', form.config.controller.directedGSDB || form.config.controller.prefix);
      },
      no: function() {
        directedCol.destroy('directedName');
        directedCol.destroy('directedGSDB');
      }
    };
    (responses[newVal] || function() {})();
  });
  var tts = 0;
  model.find('studySupplierFor').observe(function(newVal, oldVal) {
    var nameCol = view.find('tabs.part.nameCol');
    var complexCol = view.find('tabs.part.complexCommodityCol');
    var prefix = model.find('prefix')[0] ? model.find('prefix')[0].value : '';
    var base = model.find('base')[0] ? model.find('base')[0].value : '';
    var suffix = model.find('suffix')[0] ? model.find('suffix')[0].value : '';
    if (newVal !== 'complex' && oldVal === 'complex') {
      complexCol.destroy('complexCommodityParts');
    }
    var handle = {
      multi: function() {
        nameCol.destroy('suffix');
        nameCol.append('prefix', {
          type: 'input',
          label: 'Prefix'
        }, prefix, form.controller.items.prefix);
        nameCol.append('base', {
          type: 'input',
          label: 'Base'
        }, base, form.controller.items.base);
        var modelValue = [{}];
        if (tts < 2 && form.config.model.studySupplierFor === 'multi' && utils.isArray(form.config.model.suffix)) {
          modelValue = form.config.model.suffix;
          tts++;
        }
        console.log('SUFFIX', form.controller.items.suffix);
        nameCol.append('suffix', {
          type: 'table:simple',
          model: {suffix: {
              type: 'input',
              label: 'Suffix'
            }}
        }, modelValue, {suffix: form.controller.items.suffix || form.config.controller.prefix});
      },
      single: function() {
        if (oldVal === 'multi') {
          nameCol.destroy('suffix');
        }
        nameCol.append('prefix', {
          type: 'input',
          label: 'Prefix'
        }, prefix, form.controller.items.prefix);
        nameCol.append('base', {
          type: 'input',
          label: 'Base'
        }, base, form.controller.items.base);
        if (oldVal != '') {
          suffix = '';
        }
        nameCol.append('suffix', {
          type: 'input',
          label: 'Suffix'
        }, suffix, form.controller.items.suffix || form.config.controller.prefix);
      },
      multiAll: function() {
        if (oldVal === 'multi') {
          nameCol.destroy('suffix');
        }
        nameCol.append('prefix', {
          type: 'input',
          label: 'Prefix'
        }, prefix, form.controller.items.prefix);
        nameCol.append('base', {
          type: 'input',
          label: 'Base'
        }, base, form.controller.items.base);
        nameCol.append('suffix', {
          type: 'input',
          label: 'Suffix'
        }, 'All', {disabled: true});
      },
      complex: function() {
        nameCol.destroy('base');
        nameCol.destroy('prefix');
        nameCol.destroy('suffix');
        complexCol.append('complexCommodityParts', {
          type: 'textarea',
          label: 'Complex Commodity Part Numbers'
        }, model.items.complexCommodityParts ? model.items.complexCommodityParts.value : '', form.config.controller.prefix);
      }
    };
    (handle[newVal] || handle.single)();
  });
  function observePercentageJLRDemand(phase) {
    return function(newVal, oldVal, diff, name) {
      var className = '';
      if (newVal < 0) {
        className = 'negative';
      } else if (newVal > 0) {
        className = 'positive';
      }
      this[phase + 'percentageJLRDemand'].model = className;
      this[phase + 'partsAvailableForShipment'].model = className;
      this[phase + 'jlrDemand'].model = className;
    };
  }
  function oeeColour(phase) {
    return function(newVal, oldVal, diff, name) {
      var className = '';
      if (newVal >= 100) {
        className = 'negative';
      }
      this[phase + 'oee'].model = className;
    };
  }
  var alreadySet = [];
  var formulas = (function(phase) {
    if (alreadySet.indexOf(phase) === -1) {
      alreadySet.push(phase);
      if (phase === 'capacityPlanning') {
        for (var i in capacityPlanningFormulas) {
          model.find('processes.' + i).setValue(capacityPlanningFormulas[i]);
        }
      } else {
        var calculations = otherPhasesFormulas(phase, model);
        constants.calculatedFields.forEach((function(field) {
          model.find('processes.' + phase + field).setValue(calculations[field]);
        }));
        model.find('processes.' + phase + 'percentageJLRDemand').observe(observePercentageJLRDemand(phase));
        model.find('processes.' + phase + 'oee').observe(oeeColour(phase));
      }
    }
  });
  if (!form.model.items.supersedesAnotherWf) {
    model.find('phase').observe(function(newVal) {
      var actions = {
        'capacityPlanning': function() {
          blocksActions.setVisible(['capacityPlanning']);
          blocksActions.setOpen(['capacityPlanning']);
          formulas('capacityPlanning');
        },
        'phase0': function() {
          blocksActions.setVisible(['capacityPlanning', 'phase0']);
          blocksActions.setOpen(['capacityPlanning', 'phase0']);
          formulas('capacityPlanning');
          formulas('phase0');
        },
        'phase3': function() {
          blocksActions.setVisible(['capacityPlanning', 'phase3']);
          blocksActions.setOpen(['capacityPlanning', 'phase3']);
          formulas('capacityPlanning');
          formulas('phase3');
        }
      };
      if (!!newVal) {
        actions[newVal]();
      }
    });
  } else {
    var phases = ['capacityPlanning', 'phase0', 'phase3', 'capacityConfirmation'];
    var currentPhase = form.model.items.phase.value;
    var phaseIndex = phases.indexOf(currentPhase);
    var openPhases = phases.slice(0, phaseIndex + 1);
    blocksActions.setVisible(openPhases);
    blocksActions.setOpen([currentPhase]);
    formulas(currentPhase);
    form.observe.addListener((function() {
      return model.items.processes.value.length;
    }), (function() {
      openPhases.forEach((function(phase) {
        formulas(phase);
      }));
    }));
  }
};
var $__default = listeners;

//# sourceMappingURL=<compileOutput>


},{"../actions/alert":3,"../actions/blocks":5,"../router/stores/router":97,"../utils":105,"./constants":67,"./formulas/capacityPlanning":73,"./formulas/otherPhases":74}],77:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_stores_47_save__,
    $___46__46__47_utils__,
    $___46__46__47_actions_47_alert__,
    $___46__46__47_stores_47_user__,
    $__constants__,
    $___46__46__47_xhr__;
var saveStore = ($___46__46__47_stores_47_save__ = require("../stores/save"), $___46__46__47_stores_47_save__ && $___46__46__47_stores_47_save__.__esModule && $___46__46__47_stores_47_save__ || {default: $___46__46__47_stores_47_save__}).default;
var utils = ($___46__46__47_utils__ = require("../utils"), $___46__46__47_utils__ && $___46__46__47_utils__.__esModule && $___46__46__47_utils__ || {default: $___46__46__47_utils__}).default;
var alert = ($___46__46__47_actions_47_alert__ = require("../actions/alert"), $___46__46__47_actions_47_alert__ && $___46__46__47_actions_47_alert__.__esModule && $___46__46__47_actions_47_alert__ || {default: $___46__46__47_actions_47_alert__}).default;
var userStore = ($___46__46__47_stores_47_user__ = require("../stores/user"), $___46__46__47_stores_47_user__ && $___46__46__47_stores_47_user__.__esModule && $___46__46__47_stores_47_user__ || {default: $___46__46__47_stores_47_user__}).default;
var constants = ($__constants__ = require("./constants"), $__constants__ && $__constants__.__esModule && $__constants__ || {default: $__constants__}).default;
var xhr = ($___46__46__47_xhr__ = require("../xhr"), $___46__46__47_xhr__ && $___46__46__47_xhr__.__esModule && $___46__46__47_xhr__ || {default: $___46__46__47_xhr__}).default;
var statusBar = React.createClass({
  displayName: 'statusBar',
  componentWillMount: function() {
    saveStore.on('saveStarted', this.handleSaving);
    saveStore.on('saveStopped', this.handleStopped);
    saveStore.on('saveSaving', this.handleSave);
  },
  componentWillUnmount: function() {
    saveStore.off('saveStarted', this.handleSaving);
    saveStore.off('saveStopped', this.handleStopped);
    saveStore.off('saveSaving', this.handleSave);
  },
  handleSaving: function() {
    this.setState({
      started: true,
      saving: true
    });
  },
  handleStopped: function() {
    this.setState({
      started: true,
      saving: false
    });
  },
  getInitialState: function() {
    return {
      started: false,
      saving: false
    };
  },
  supersede: function(phase) {
    alert.open({
      waiting: true,
      header: 'Creating ' + phase,
      message: 'Please wait..'
    });
    xhr('GET', '/rest/workflow/ecar/supersede/' + this.workflowId).then((function(data) {
      alert.close();
      window.location.hash = '#/ecar/' + data.workflowId;
    }));
  },
  render: function() {
    var cx = React.addons.classSet;
    var state = this.state;
    var text = 'Last saved at 16:03';
    var statusIconClasses = {
      fa: true,
      'fa-fw': true
    };
    var statusIconContainerClasses = {'status__autosave__icon': true};
    if (state.saving) {
      text = 'Saving..';
      statusIconClasses['fa-refresh'] = true;
      statusIconClasses['fa-spin'] = true;
    } else if (state.started) {
      var date = new Date();
      text = 'Last saved at ' + date.getHours() + ':' + ('0' + date.getMinutes()).slice(-2);
      statusIconClasses['fa-check'] = true;
      statusIconContainerClasses['status__autosave__icon--saved'] = true;
    }
    var statusIcon = cx(statusIconClasses);
    var statusIconContainer = cx(statusIconContainerClasses);
    var response = this.props.response;
    this.workflowId = response.workflowId;
    var statusContent;
    var statuses = {
      CREATED: function() {},
      ACTIVE: function() {
        if (utils.hasNode('STARejectedSupplierReview', response.currentRenderedNodes)) {
          statusContent = (React.createElement("span", null, React.createElement("div", {className: "phase-notice"}, "This eCAR has been rejected"), React.createElement("a", null, "Recreate this eCAR")));
        }
      },
      COMPLETED: function() {
        if (response.model.superseded) {
          var supersededWorkflows = response.model.supersededByWorkflows;
          var latestPhase = supersededWorkflows[supersededWorkflows.length - 1];
          var actualPhase = constants.phases[latestPhase.phase].prettyName;
          var id = latestPhase.workflowId;
          statusContent = (React.createElement("span", null, React.createElement("div", {className: "phase-notice"}, "This eCAR is currently at ", actualPhase, "."), React.createElement("a", {href: '/#/ecar/' + id}, "Go to ", actualPhase)));
        } else if (userStore.user.emailAddress === response.createdByEmail) {
          if (response.model.phase !== 'capacityConfirmation') {
            var nextPhaseCode = constants.phases[response.model.phase].nextPhase;
            var nextPhase = constants.phases[nextPhaseCode].prettyName;
            statusContent = (React.createElement("a", {onClick: this.supersede.bind(this, nextPhase)}, "Submit ", nextPhase, " for this eCAR"));
          }
        }
      }
    };
    var phase = constants.phases[this.props.phase].prettyName;
    statuses[response.status].call(this);
    var $__6 = utils.getStatus(response, {'current-status__pill': true}, 'current-status__pill'),
        status = $__6.status,
        classes = $__6.classes;
    var toolbarContent = (React.createElement("div", {className: "current-status"}, React.createElement("div", {className: "current-status__status"}, React.createElement("span", {className: cx(classes)}, phase + ' ' + status)), statusContent));
    return (React.createElement("div", {className: "status"}, React.createElement("div", {className: "status__fixed"}, React.createElement("ul", {className: "status__toolbar"}, React.createElement("li", {className: "status__toolbar__item"}, React.createElement("i", {className: "fa fa-download fa-fw"}), React.createElement("div", {className: "status__toolbar__tooltip"}, "Download PDF")), React.createElement("li", {className: "status__toolbar__item"}, React.createElement("i", {className: "fa fa-copy fa-fw"}), React.createElement("div", {className: "status__toolbar__tooltip status__toolbar__tooltip--right"}, "Create new eCAR from this"))), React.createElement("div", {className: "status__autosave"}, text, React.createElement("div", {className: statusIconContainer}, React.createElement("i", {className: statusIcon}))), toolbarContent)));
  }
});
var $__default = statusBar;

//# sourceMappingURL=<compileOutput>


},{"../actions/alert":3,"../stores/save":103,"../stores/user":104,"../utils":105,"../xhr":106,"./constants":67}],78:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var form = {
  "tabs": {
    "type": "tabs",
    "items": {
      details: {
        "padding": "10px 15px",
        title: 'Details',
        items: {
          header: {
            type: 'header:h4',
            text: 'Supplier Details'
          },
          col: {
            type: 'column:rows',
            span: 3,
            items: {supplierName: {
                label: 'Name',
                type: 'input',
                placeholder: 'Supplier Name'
              }}
          },
          addressCol: {
            type: 'column:rows',
            span: 3,
            items: {
              address: {
                label: 'Address',
                type: 'input',
                placeholder: 'Supplier Address'
              },
              city: {
                label: 'City',
                type: 'input',
                placeholder: 'Supplier City'
              },
              county: {
                label: 'County/State/Region',
                type: 'input',
                placeholder: 'Supplier County/State/Region'
              }
            }
          },
          countryCol: {
            type: 'column:rows',
            span: 3,
            items: {country: {
                label: 'Country',
                type: 'input',
                placeholder: 'Supplier Country'
              }}
          },
          gsdbCol: {
            type: 'column:rows',
            span: 3,
            items: {
              qualityGSDB: {
                label: 'Quality GSDB',
                type: 'input',
                placeholder: 'Quality GSDB'
              },
              manufacturingGSDB: {
                label: 'Manufacturing GSDB',
                type: 'input',
                placeholder: 'Manufacturing GSDB'
              }
            }
          },
          hr: {type: 'hr'},
          headerKey: {
            type: 'header:h4',
            text: 'Key Contact Details'
          },
          supplierCol: {
            type: 'column:rows',
            span: 3,
            items: {
              supplierRepresentativeName: {
                label: 'Supplier Representative Name',
                type: 'input',
                placeholder: 'Supplier Representative Name'
              },
              supplierRepresentativeEmail: {
                label: 'Supplier Representative Email',
                type: 'input',
                placeholder: 'Supplier Representative Email'
              },
              supplierRepresentativePhone: {
                label: 'Supplier Representative Phone',
                type: 'input',
                placeholder: 'Supplier Representative Phone'
              },
              supplierRepresentativeRole: {
                label: 'Supplier Representative Role',
                type: 'input',
                placeholder: 'Supplier Representative Role'
              }
            }
          },
          staCol: {
            type: 'column:rows',
            span: 3,
            items: {
              jlrStaName: {
                label: 'JLR STA Name',
                type: 'input',
                placeholder: 'JLR STA Name'
              },
              jlrStaEmail: {
                label: 'JLR STA Email',
                type: 'input',
                placeholder: 'JLR STA Email'
              },
              jlrStaPhone: {
                label: 'JLR STA Phone',
                type: 'input',
                placeholder: 'JLR STA Phone'
              }
            }
          }
        }
      },
      phase: {
        "padding": "10px 15px",
        title: 'Phase Information',
        items: {
          col: {
            type: 'column:rows',
            span: 2,
            items: {
              phase: {
                type: 'select',
                label: 'Phase Submitting For',
                options: [{
                  value: 'capacityPlanning',
                  label: 'Capacity Planning'
                }, {
                  value: 'phase0',
                  label: 'Phase 0'
                }, {
                  value: 'phase3',
                  label: 'Phase 3'
                }]
              },
              ppapLevel: {
                type: 'select',
                label: 'PPAP Level',
                options: [{
                  value: 'PPAP_1',
                  label: '1'
                }, {
                  value: 'PPAP_3',
                  label: '3'
                }, {
                  value: 'PPAP_5',
                  label: '5'
                }]
              }
            }
          },
          phase0Dates: {
            type: 'column:rows',
            span: 2,
            items: {}
          },
          reason: {
            type: 'textarea',
            label: 'Reason for submission'
          }
        }
      },
      part: {
        "padding": "10px 15px",
        title: 'Part Information',
        items: {
          partName: {
            type: 'input',
            label: 'Part Name/Description'
          },
          partType: {
            type: 'radio',
            label: 'Part Type',
            options: {
              sequenced: 'Sequenced',
              non: 'Non-Sequenced'
            }
          },
          directedCol: {
            type: 'column:rows',
            span: 3,
            items: {directedPart: {
                type: 'radio',
                label: 'Is this part supplied as a directed source?',
                options: {
                  yes: 'Yes',
                  no: 'No'
                }
              }}
          },
          hr4: {type: 'hr'},
          studySupplierFor: {
            type: 'radio',
            label: 'Study Supplied For',
            options: {
              single: 'Single Part / Single Suffix',
              multi: 'Multiple Part / Listed Suffixes',
              multiAll: 'Multiple Part / All Suffixes',
              complex: 'Complex Commodity'
            }
          },
          nameCol: {
            type: 'column:rows',
            span: 3,
            items: {
              prefix: {
                type: 'input',
                label: 'Prefix'
              },
              base: {
                type: 'input',
                label: 'Base'
              }
            }
          },
          complexCommodityCol: {
            type: 'column:rows',
            span: [1],
            items: {}
          },
          hr: {type: 'hr'},
          programmeVolume: {
            type: 'header:h4',
            text: 'Programme(s) Volume Information (JLR Demand)'
          },
          studySubmittedFor: {
            type: 'checkbox',
            label: 'Study Submitted For',
            options: {
              l359: 'L359',
              l319: 'L319',
              l316: 'L316',
              l538: 'L538',
              l550: 'L550',
              l450: 'L450',
              l460: 'L460',
              l494: 'L494',
              l462: 'L462',
              x760: 'X760',
              x260: 'X260',
              x150: 'X150',
              x152: 'X152',
              x250: 'X250',
              x351: 'X351'
            }
          },
          volumeTotals: {
            type: 'column:rows',
            span: 4,
            items: {}
          },
          volumeHeader: {
            type: 'header:h4',
            text: 'Volume Total'
          },
          volumeTotal: {type: 'input'},
          hr2: {type: 'hr'},
          hr3: {type: 'hr'},
          totalHeader: {
            type: 'header:h4',
            text: 'Total Demand of Study Submitted For'
          },
          "totalRequiredDemand": {"type": "input"}
        }
      },
      "processes": {
        "title": "Manufacturing Processes",
        "items": {"processes": {
            "type": "spreadsheet",
            "title": "Process",
            "model": {
              "desc": {
                "type": "input",
                "label": "Description"
              },
              "capacityPlanning": {
                "type": "block",
                "items": {
                  "capPlanningHeader": {
                    "type": "blockheader",
                    "label": "Capacity Planning"
                  },
                  "plannedOperatingPattern": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Planned Operating Pattern"
                  },
                  "daysPerWeek": {
                    "type": "input:number",
                    "label": "Days / Week"
                  },
                  "shiftsPerDay": {
                    "type": "input:number",
                    "label": "Shifts / Day"
                  },
                  "hoursPerShift": {
                    "type": "input:number",
                    "label": "Hours / Shift"
                  },
                  "personalBreaks": {
                    "type": "input:number",
                    "label": "Personal Breaks"
                  },
                  "plannedMaintenance": {
                    "type": "input:number",
                    "label": "Planned Maintenance"
                  },
                  "inspectionOfFacilities": {
                    "type": "input:number",
                    "label": "Inspection of Facilities"
                  },
                  "plannedChangeoverFrequency": {
                    "type": "input:number",
                    "label": "Planned Changeover Frequency",
                    "desc": "(per week)"
                  },
                  "plannedMinutesPerChangeover": {
                    "type": "input:number",
                    "label": "Planned Minutes per Changeover",
                    "desc": "(into this part number)"
                  },
                  "totalPlannedDowntime": {
                    "type": "input:number",
                    "label": "Total Planned Downtime",
                    "desc": "(per week, inc breaks, etc)"
                  },
                  "allocationPercentage": {
                    "type": "input:number",
                    "label": "Allocation Percentage",
                    "desc": "Enter 100 for a dedicated process"
                  },
                  "sharedLoadingPlan": {
                    "type": "overlay",
                    "text": "Submit Shared Loading Plan",
                    "label": "Shared Loading Plan",
                    "items": {
                      "header": {
                        "type": "header:h2",
                        "text": "Shared Loading Plan"
                      },
                      "sharedLoadingPlan": {
                        "type": "sharedLoadingPlan",
                        "model": {
                          "jlrPartNumber": {
                            "type": "input",
                            "label": "JLR Part # or \"Non - JLR Part \""
                          },
                          "reqGoodPartsPerWeek": {
                            "type": "input:number",
                            "label": "Req'd Good Parts / Week"
                          },
                          "reqProdHoursPerWeek": {
                            "type": "input:number",
                            "label": "Req'd Prod Hours / Week"
                          },
                          "requiredAllocationByPart": {
                            "type": "input:number",
                            "label": "Required % Allocation by Part"
                          }
                        }
                      },
                      "percentageNetAvailTime": {
                        "type": "input:number",
                        "label": "Percentage of Net Available Time not utilized for production (%) {PM, etc.}"
                      },
                      "totalPercentageAllocation": {
                        "type": "input",
                        "label": "Total % Allocation"
                      }
                    }
                  },
                  "netAvailableTime": {
                    "type": "input:number",
                    "label": "Net Available Time"
                  },
                  "requiredGoodPartsHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Required Good Parts / Week"
                  },
                  "percentageOfPartsRejected": {
                    "type": "input:number",
                    "label": "Percentage of Parts Rejected",
                    "desc": "(inc scrap & rework)"
                  },
                  "requiredGoodPartsPerWeek": {
                    "type": "input:number",
                    "label": "Required Good Parts Per Week/Hour",
                    "desc": "To support this process"
                  },
                  "percentOfPartsReworked": {
                    "type": "input:number",
                    "label": "Percentage of Parts Reworked",
                    "desc": "(re-run through process"
                  },
                  "plannedCycleTimeHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Planned Cycle Time / Capacity"
                  },
                  "idealPlannedCycleTime": {
                    "type": "input:number",
                    "label": "Ideal Planned Cycle Time",
                    "desc": "Per tool or machine (sec/cycle)"
                  },
                  "numberOfToolsParallel": {
                    "type": "input:number",
                    "label": "Number of Tools or Machines in Parallel"
                  },
                  "identicalPartsPerCycle": {
                    "type": "input:number",
                    "label": "Number of Identical Parts Produced",
                    "desc": "Per Tool/Machine Per Cycle"
                  },
                  "netIdealCycleTime": {
                    "type": "input:number",
                    "label": "Net Ideal Cycle Time per Part",
                    "desc": "(sec/part)"
                  },
                  "plannedProductionPerWeek": {
                    "type": "input:number",
                    "label": "Planned Production Per Week"
                  },
                  "requiredOEE": {
                    "type": "input:number",
                    "label": "Required OEE"
                  },
                  "plannedProductionPerDay": {
                    "type": "input:number",
                    "label": "Planned Production Per Day"
                  },
                  "plannedProductionPerHour": {
                    "type": "input:number",
                    "label": "Planned Production Per Hour"
                  },
                  "otherAssumptions": {
                    "type": "input",
                    "label": "Enter any other assumptions"
                  }
                }
              },
              "phase0": {
                "type": "block",
                "items": {
                  "phase0Header": {
                    "type": "blockheader",
                    "label": "Phase 0"
                  },
                  "phase0productionRunHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Supplier Demonstrated - Production Run"
                  },
                  "phase0sharedProcessAllocation": {
                    "type": "input:number",
                    "label": "Shared Process Allocation %"
                  },
                  "phase0equipmentHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Equipment Availability"
                  },
                  "phase0totalDurationOfProductionRun": {
                    "type": "input:number",
                    "label": "Total Duration of Production Run",
                    "desc": "(minutes)"
                  },
                  "phase0equipTotalPlannedDowntime": {
                    "type": "input:number",
                    "label": "Total Planned Downtime",
                    "desc": "(in minutes) (inc breaks, etc)"
                  },
                  "phase0equipNetAvailableTime": {
                    "type": "input:number",
                    "label": "Net Available Time",
                    "desc": "(minutes)"
                  },
                  "phase0sharedEquipChangeover": {
                    "type": "input:number",
                    "label": "Shared Equipment Changeover Time",
                    "desc": "(minutes)"
                  },
                  "phase0totalUnplannedDowntime": {
                    "type": "input:number",
                    "label": "Total Unplanned Downtime",
                    "desc": "(mins)"
                  },
                  "phase0actualProductionTime": {
                    "type": "input:number",
                    "label": "Actual Production Time",
                    "desc": "(minutes)"
                  },
                  "phase0equipmentAvailability": {
                    "type": "input:number",
                    "label": "Equipment Availability %"
                  },
                  "phase0performanceHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Performance Efficiency"
                  },
                  "phase0totalPartsRun": {
                    "type": "input:number",
                    "label": "Total Parts Run",
                    "desc": "(Good, Rejected)"
                  },
                  "phase0perfNetIdealCycleTime": {
                    "type": "input:number",
                    "label": "Net Ideal Cycle Time",
                    "desc": "(seconds/part)"
                  },
                  "phase0performanceEfficiency": {
                    "type": "input:number",
                    "label": "Performance Efficiency %"
                  },
                  "phase0availabilityAndPELossesNotCaptured": {
                    "type": "input:number",
                    "label": "Availability and/or Perf Efficiency Losses",
                    "desc": "Not Captured (minutes)"
                  },
                  "phase0qualityRateHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Quality Rate"
                  },
                  "phase0numberOfPartsRejected": {
                    "type": "input:number",
                    "label": "Number of Parts Rejected"
                  },
                  "phase0numberOfPartsReworked": {
                    "type": "input:number",
                    "label": "Number of Parts Reworked & Accepted"
                  },
                  "phase0rightFirstTime": {
                    "type": "input:number",
                    "label": "Right First Time Quality Rate %",
                    "desc": "(inc. reworked parts)"
                  },
                  "phase0firstTimeThrough": {
                    "type": "input:number",
                    "label": "First Time Through Quality Rate %"
                  },
                  "phase0oeeHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Overal Equipment Effectiveness (OEE)"
                  },
                  "phase0oee": {
                    "type": "input:number",
                    "label": "OEE %"
                  },
                  "phase0weeklyHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Weekly or Hourly Parts Avail for Shipment"
                  },
                  "phase0processSpecificWeek": {
                    "type": "input:number",
                    "label": "Process Specific Weekly Part Estimate"
                  },
                  "phase0processSpecificHour": {
                    "type": "input:number",
                    "label": "Process Specific Estimate Per Hour"
                  },
                  "phase0processSpecificDay": {
                    "type": "input:number",
                    "label": "Process Specific Estimate Per Day"
                  },
                  "phase0processHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Process Total Actual Cycle Time (sec/part)"
                  },
                  "phase0observedCycleTime": {
                    "type": "input:number",
                    "label": "Observed Average Cycle Time",
                    "desc": "(sec/cycle)"
                  },
                  "phase0analysisHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Analysis of Run @ Rate"
                  },
                  "phase0jlrDemand": {
                    "type": "input:number",
                    "label": "JLR Demand"
                  },
                  "phase0partsAvailableForShipment": {
                    "type": "input:number",
                    "label": "Weekly Parts Available for Shipment"
                  },
                  "phase0percentageJLRDemand": {
                    "type": "input:number",
                    "label": "Percentage Above/Below JLR Demand"
                  }
                }
              },
              "phase3": {
                "type": "block",
                "items": {
                  "phase3Header": {
                    "type": "blockheader",
                    "label": "Phase 3"
                  },
                  "phase3productionRunHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Supplier Demonstrated - Production Run"
                  },
                  "phase3sharedProcessAllocation": {
                    "type": "input:number",
                    "label": "Shared Process Allocation %"
                  },
                  "phase3equipmentHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Equipment Availability"
                  },
                  "phase3totalDurationOfProductionRun": {
                    "type": "input:number",
                    "label": "Total Duration of Production Run",
                    "desc": "(minutes)"
                  },
                  "phase3equipTotalPlannedDowntime": {
                    "type": "input:number",
                    "label": "Total Planned Downtime",
                    "desc": "(in minutes) (inc breaks, etc)"
                  },
                  "phase3equipNetAvailableTime": {
                    "type": "input:number",
                    "label": "Net Available Time",
                    "desc": "(minutes)"
                  },
                  "phase3sharedEquipChangeover": {
                    "type": "input:number",
                    "label": "Shared Equipment Changeover Time",
                    "desc": "(minutes)"
                  },
                  "phase3totalUnplannedDowntime": {
                    "type": "input:number",
                    "label": "Total Unplanned Downtime",
                    "desc": "(mins)"
                  },
                  "phase3actualProductionTime": {
                    "type": "input:number",
                    "label": "Actual Production Time",
                    "desc": "(minutes)"
                  },
                  "phase3equipmentAvailability": {
                    "type": "input:number",
                    "label": "Equipment Availability %"
                  },
                  "phase3performanceHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Performance Efficiency"
                  },
                  "phase3totalPartsRun": {
                    "type": "input:number",
                    "label": "Total Parts Run",
                    "desc": "(Good, Rejected)"
                  },
                  "phase3perfNetIdealCycleTime": {
                    "type": "input:number",
                    "label": "Net Ideal Cycle Time",
                    "desc": "(seconds/part)"
                  },
                  "phase3performanceEfficiency": {
                    "type": "input:number",
                    "label": "Performance Efficiency %"
                  },
                  "phase3qualityRateHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Quality Rate"
                  },
                  "phase3numberOfPartsRejected": {
                    "type": "input:number",
                    "label": "Number of Parts Rejected"
                  },
                  "phase3numberOfPartsReworked": {
                    "type": "input:number",
                    "label": "Number of Parts Reworked & Accepted"
                  },
                  "phase3rightFirstTime": {
                    "type": "input:number",
                    "label": "Right First Time Quality Rate %",
                    "desc": "(inc. reworked parts)"
                  },
                  "phase3firstTimeThrough": {
                    "type": "input:number",
                    "label": "First Time Through Quality Rate %"
                  },
                  "phase3oeeHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Overal Equipment Effectiveness (OEE)"
                  },
                  "phase3oee": {
                    "type": "input:number",
                    "label": "OEE %"
                  },
                  "phase3weeklyHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Weekly or Hourly Parts Avail for Shipment"
                  },
                  "phase3processSpecificWeek": {
                    "type": "input:number",
                    "label": "Process Specific Weekly Part Estimate"
                  },
                  "phase3processSpecificHour": {
                    "type": "input:number",
                    "label": "Process Specific Estimate Per Hour"
                  },
                  "phase3processSpecificDay": {
                    "type": "input:number",
                    "label": "Process Specific Estimate Per Day"
                  },
                  "phase3processHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Process Total Actual Cycle Time (sec/part)"
                  },
                  "phase3observedCycleTime": {
                    "type": "input:number",
                    "label": "Observed Average Cycle Time",
                    "desc": "(sec/cycle)"
                  },
                  "phase3analysisHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Analysis of Run @ Rate"
                  },
                  "phase3jlrDemand": {
                    "type": "input:number",
                    "label": "JLR Demand"
                  },
                  "phase3partsAvailableForShipment": {
                    "type": "input:number",
                    "label": "Weekly Parts Available for Shipment"
                  },
                  "phase3percentageJLRDemand": {
                    "type": "input:number",
                    "label": "Percentage Above/Below JLR Demand"
                  }
                }
              },
              "capacityConfirmation": {
                "type": "block",
                "items": {
                  "capacityConfirmationHeader": {
                    "type": "blockheader",
                    "label": "Capacity Confirmation"
                  },
                  "capacityConfirmationproductionRunHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Supplier Demonstrated - Production Run"
                  },
                  "capacityConfirmationsharedProcessAllocation": {
                    "type": "input:number",
                    "label": "Shared Process Allocation %"
                  },
                  "capacityConfirmationequipmentHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Equipment Availability"
                  },
                  "capacityConfirmationtotalDurationOfProductionRun": {
                    "type": "input:number",
                    "label": "Total Duration of Production Run",
                    "desc": "(minutes)"
                  },
                  "capacityConfirmationequipTotalPlannedDowntime": {
                    "type": "input:number",
                    "label": "Total Planned Downtime",
                    "desc": "(in minutes) (inc breaks, etc)"
                  },
                  "capacityConfirmationequipNetAvailableTime": {
                    "type": "input:number",
                    "label": "Net Available Time",
                    "desc": "(minutes)"
                  },
                  "capacityConfirmationsharedEquipChangeover": {
                    "type": "input:number",
                    "label": "Shared Equipment Changeover Time",
                    "desc": "(minutes)"
                  },
                  "capacityConfirmationtotalUnplannedDowntime": {
                    "type": "input:number",
                    "label": "Total Unplanned Downtime",
                    "desc": "(mins)"
                  },
                  "capacityConfirmationactualProductionTime": {
                    "type": "input:number",
                    "label": "Actual Production Time",
                    "desc": "(minutes)"
                  },
                  "capacityConfirmationequipmentAvailability": {
                    "type": "input:number",
                    "label": "Equipment Availability %"
                  },
                  "capacityConfirmationperformanceHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Performance Efficiency"
                  },
                  "capacityConfirmationtotalPartsRun": {
                    "type": "input:number",
                    "label": "Total Parts Run",
                    "desc": "(Good, Rejected)"
                  },
                  "capacityConfirmationperfNetIdealCycleTime": {
                    "type": "input:number",
                    "label": "Net Ideal Cycle Time",
                    "desc": "(seconds/part)"
                  },
                  "capacityConfirmationperformanceEfficiency": {
                    "type": "input:number",
                    "label": "Performance Efficiency %"
                  },
                  "capacityConfirmationqualityRateHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Quality Rate"
                  },
                  "capacityConfirmationnumberOfPartsRejected": {
                    "type": "input:number",
                    "label": "Number of Parts Rejected"
                  },
                  "capacityConfirmationnumberOfPartsReworked": {
                    "type": "input:number",
                    "label": "Number of Parts Reworked & Accepted"
                  },
                  "capacityConfirmationrightFirstTime": {
                    "type": "input:number",
                    "label": "Right First Time Quality Rate %",
                    "desc": "(inc. reworked parts)"
                  },
                  "capacityConfirmationfirstTimeThrough": {
                    "type": "input:number",
                    "label": "First Time Through Quality Rate %"
                  },
                  "capacityConfirmationoeeHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Overal Equipment Effectiveness (OEE)"
                  },
                  "capacityConfirmationoee": {
                    "type": "input:number",
                    "label": "OEE %"
                  },
                  "capacityConfirmationweeklyHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Weekly or Hourly Parts Avail for Shipment"
                  },
                  "capacityConfirmationprocessSpecificWeek": {
                    "type": "input:number",
                    "label": "Process Specific Weekly Part Estimate"
                  },
                  "capacityConfirmationprocessSpecificHour": {
                    "type": "input:number",
                    "label": "Process Specific Estimate Per Hour"
                  },
                  "capacityConfirmationprocessSpecificDay": {
                    "type": "input:number",
                    "label": "Process Specific Estimate Per Day"
                  },
                  "capacityConfirmationprocessHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Process Total Actual Cycle Time (sec/part)"
                  },
                  "capacityConfirmationobservedCycleTime": {
                    "type": "input:number",
                    "label": "Observed Average Cycle Time",
                    "desc": "(sec/cycle)"
                  },
                  "capacityConfirmationanalysisHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Analysis of Run @ Rate"
                  },
                  "capacityConfirmationjlrDemand": {
                    "type": "input:number",
                    "label": "JLR Demand"
                  },
                  "capacityConfirmationpartsAvailableForShipment": {
                    "type": "input:number",
                    "label": "Weekly Parts Available for Shipment"
                  },
                  "capacityConfirmationpercentageJLRDemand": {
                    "type": "input:number",
                    "label": "Percentage Above/Below JLR Demand"
                  }
                }
              }
            }
          }}
      },
      "summary": {
        "padding": "10px 15px",
        "title": "Summary",
        "items": {
          "summary": {"type": "summaryTab"},
          "chart": {"type": "chart"},
          "bottlenecks": {"type": "bottlenecks"},
          "hr": {"type": "hr"},
          "commentsCol": {
            "type": "column:rows",
            "span": 2,
            "items": {
              "supplierNameSign": {
                "type": "input",
                "label": "Supplier Name"
              },
              "staNameSign": {
                "type": "input",
                "label": "STA Name"
              },
              "supplierDateSign": {
                "type": "input:date",
                "label": "Supplier Date"
              },
              "staDateSign": {
                "type": "input:date",
                "label": "STA Date"
              },
              "supplierComments": {
                "type": "textarea",
                "label": "Supplier Comments"
              },
              "staComments": {
                "type": "textarea",
                "label": "STA Comments"
              }
            }
          },
          "declaration": {
            "type": "checkbox",
            "label": "Declaration",
            "desc": "I hereby confirm that I have the right and authority to fill in this document on behalf of the supplier company mentioned above. The information I have given is true and accurate to the best of my knowledge. Sub Tier Components: In addition to the data contained in the report, the Supplier Authorised Representative approval confirms that all sub-tier components used in the assembly of these components are also approved to the relevant Production Run i.e. Run at Rate (Phase 0) or Capacity Confirmation",
            options: {agree: 'I agree to the below'}
          }
        }
      }
    }
  },
  "buttonContainer": {
    "type": "buttonContainer",
    "items": {}
  }
};
var $__default = form;

//# sourceMappingURL=<compileOutput>


},{}],79:[function(require,module,exports){
"use strict";
var $__router_47_stores_47_router__;
var routerStore = ($__router_47_stores_47_router__ = require("./router/stores/router"), $__router_47_stores_47_router__ && $__router_47_stores_47_router__.__esModule && $__router_47_stores_47_router__ || {default: $__router_47_stores_47_router__}).default;
var loading = {};
loading.status = 'idle';
loading.bar = document.querySelectorAll('.loading__bar')[0];
loading.container = document.querySelectorAll('.loading')[0];
var loadingBar = React.createClass({
  displayName: 'loadingBar',
  getInitialState: function() {
    return {
      percentage: 0,
      active: false
    };
  },
  reqCompleted: 0,
  reqTotal: 0,
  start: function(payload) {
    if (payload.state.resolve) {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      if (this.status === 'started') {
        return;
      }
      this.setState({active: true});
      this.reqTotal = Object.keys(payload.state.resolve).length;
      this.status = 'started';
      this.set(0.2);
    }
  },
  finishPromise: function() {
    this.reqCompleted++;
    if (this.reqCompleted >= this.reqTotal) {
      this.complete();
    } else {
      this.set(this.reqCompleted / this.reqTotal);
    }
  },
  set: function(number) {
    var $__1 = this;
    if (this.status !== 'started') {
      return;
    }
    var percentage = (number * 100);
    this.percentage = number;
    this.setState({percentage: percentage});
    if (this.incrementTimeout) {
      clearTimeout(this.incrementTimeout);
    }
    this.incrementTimeout = setTimeout((function() {
      $__1.increment();
    }), 250);
  },
  increment: function() {
    if (this.percentage >= 1) {
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
    this.set(percentage);
  },
  complete: function() {
    this.set(1);
    this.status = 'idle';
    this.reqTotal = 0;
    this.reqCompleted = 0;
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    var _this = this;
    this.timeout = setTimeout(function() {
      _this.setState({
        percentage: 0,
        active: false
      });
    }, 250);
  },
  componentWillMount: function() {
    routerStore.on('stateChangeStart', this.start);
    routerStore.on('statePromiseFinished', this.finishPromise);
  },
  componentWillUnmount: function() {
    routerStore.off('stateChangeStart', this.start);
    routerStore.off('statePromiseFinished', this.finishPromise);
  },
  render: function() {
    var cx = React.addons.classSet;
    var loadingClass = cx({
      loading: true,
      active: this.state.active
    });
    var style = {width: this.state.percentage + '%'};
    return (React.createElement("div", {className: loadingClass}, React.createElement("div", {
      className: "loading__bar",
      style: style
    }, React.createElement("div", {className: "loading__percentage"}))));
  }
});
module.exports = loadingBar;

//# sourceMappingURL=<compileOutput>


},{"./router/stores/router":97}],80:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var admin = React.createClass({
  displayName: 'admin',
  render: function() {
    return (React.createElement("div", null, "Administration Page"));
  }
});
var $__default = admin;

//# sourceMappingURL=<compileOutput>


},{}],81:[function(require,module,exports){
"use strict";

//# sourceMappingURL=<compileOutput>


},{}],82:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  current: {get: function() {
      return current;
    }},
  resolve: {get: function() {
      return resolve;
    }},
  __esModule: {value: true}
});
var $___46__46__47_router_47_router__,
    $___46__46__47_xhr__,
    $___46__46__47_actions_47_current__,
    $___46__46__47_stores_47_current__,
    $___46__46__47_utils__;
var router = ($___46__46__47_router_47_router__ = require("../router/router"), $___46__46__47_router_47_router__ && $___46__46__47_router_47_router__.__esModule && $___46__46__47_router_47_router__ || {default: $___46__46__47_router_47_router__}).default;
var xhr = ($___46__46__47_xhr__ = require("../xhr"), $___46__46__47_xhr__ && $___46__46__47_xhr__.__esModule && $___46__46__47_xhr__ || {default: $___46__46__47_xhr__}).default;
var actions = ($___46__46__47_actions_47_current__ = require("../actions/current"), $___46__46__47_actions_47_current__ && $___46__46__47_actions_47_current__.__esModule && $___46__46__47_actions_47_current__ || {default: $___46__46__47_actions_47_current__}).default;
var store = ($___46__46__47_stores_47_current__ = require("../stores/current"), $___46__46__47_stores_47_current__ && $___46__46__47_stores_47_current__.__esModule && $___46__46__47_stores_47_current__ || {default: $___46__46__47_stores_47_current__}).default;
var utils = ($___46__46__47_utils__ = require("../utils"), $___46__46__47_utils__ && $___46__46__47_utils__.__esModule && $___46__46__47_utils__ || {default: $___46__46__47_utils__}).default;
function findClosestParent(event, className) {
  var parent = event.parentNode;
  while (parent != document.body && parent != null) {
    if ((parent) && parent.className && parent.className.indexOf(className) != -1) {
      return parent;
    } else {
      parent = parent ? parent.parentNode : null;
    }
  }
  return null;
}
var current = React.createClass({
  displayName: 'current',
  componentWillMount: function() {
    var _this = this;
    store.on('selectItem', this.updateSelected);
  },
  componentWillUnmount: function() {
    store.off('selectItem', this.updateSelected);
    document.removeEventListener('click', this.handleBodyClick);
    document.removeEventListener('contextmenu', this.handleBodyContext);
    document.removeEventListener('keydown', this.handleBodyKeydown);
  },
  updateSelected: function(payload) {
    this.setState({selected: payload});
  },
  handleBodyClick: function(e) {
    if (!findClosestParent(e.target, 'current__row')) {
      if (!findClosestParent(e.target, 'contextmenu')) {
        if (this.state.contextMenu.open) {
          this.setState({contextMenu: {
              open: false,
              location: {
                x: 0,
                y: 0
              },
              multiple: false
            }});
          actions.clearSelected();
        }
      }
    } else {
      this.setState({contextMenu: {
          open: false,
          location: {
            x: 0,
            y: 0
          },
          multiple: false
        }});
    }
  },
  handleBodyContext: function(e) {
    var overContextMenu = !findClosestParent(e.target, 'contextmenu');
    if (!overContextMenu) {
      e.preventDefault();
    }
    if (!findClosestParent(e.target, 'current__row') && overContextMenu) {
      if (this.state.contextMenu.open) {
        this.setState({contextMenu: {
            open: false,
            location: {
              x: 0,
              y: 0
            },
            multiple: false
          }});
        actions.clearSelected();
      }
    }
  },
  handleBodyKeydown: function(e) {
    if (e.keyCode === 27 && this.state.contextMenu.open) {
      this.setState({contextMenu: {
          open: false,
          location: {
            x: 0,
            y: 0
          }
        }});
    }
  },
  componentDidMount: function() {
    document.addEventListener('click', this.handleBodyClick);
    document.addEventListener('contextmenu', this.handleBodyContext);
    document.addEventListener('keydown', this.handleBodyKeydown);
  },
  handleContextMenu: function(e) {
    var _this = this;
    e.preventDefault();
    var row = findClosestParent(e.target, 'current__row');
    var id = row.attributes['data-id'].value;
    var selected = this.state.selected || [];
    var index = selected.indexOf(id);
    var multiple = false;
    var location = {};
    var open;
    if (index > -1) {
      if (selected.length === 1) {
        if (_this.state.contextMenu.location.x === e.clientX && _this.state.contextMenu.location.y === e.clientY) {
          open = false;
        } else {
          open = true;
        }
      } else {
        open = true;
        multiple = true;
      }
    } else {
      if (selected.length === 0) {
        selected.push(id);
        open = true;
      } else {
        open = true;
        selected = [id];
      }
    }
    if (open) {
      location.x = e.clientX;
      location.y = e.clientY;
    } else {
      location.y = 0;
      location.x = 0;
    }
    _this.setState({contextMenu: {
        open: open,
        location: location,
        multiple: multiple
      }});
    actions.setSelected(selected);
  },
  selectRow: function(e) {
    e.preventDefault();
    var row = findClosestParent(e.target, 'current__row');
    var selected = this.state.selected;
    var id = row.attributes['data-id'].value;
    var index = selected.indexOf(id);
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(id);
    }
    actions.setSelected(selected);
  },
  getInitialState: function() {
    return {
      contextMenu: {
        open: false,
        location: {
          x: 0,
          y: 0
        },
        multiple: false
      },
      selected: store.getSelected()
    };
  },
  render: function() {
    var cx = React.addons.classSet;
    var list = this.props.data.getList;
    var rows = [];
    var _this = this;
    list.forEach(function(element) {
      var selected = false;
      if (_this.state.selected.indexOf(String(element.workflowId)) > -1) {
        selected = true;
      }
      var rowClass = cx({
        'current__row': true,
        'current__row--active': selected
      });
      var iconClass = cx({
        'fa': true,
        'fa-fw': true,
        'fa-square-o': !selected,
        'fa-check-square-o': selected
      });
      element.model = element.model || {};
      var $__5 = utils.getStatus(element, {'current__status': true}, 'current__status'),
          status = $__5.status,
          classes = $__5.classes;
      var createdAt = new Date(element.dateCreated);
      var months = {
        0: 'Jan',
        1: 'Feb',
        2: 'Mar',
        3: 'Apr',
        4: 'May',
        5: 'Jun',
        6: 'Jul',
        7: 'Aug',
        8: 'Sep',
        9: 'Oct',
        10: 'Nov',
        11: 'Dec'
      };
      var phases = {
        capacityConfirmation: 'Capacity Confirmation',
        capacityPlanning: 'Capacity Planning',
        phase0: 'Phase 0',
        phase3: 'Phase 3'
      };
      var date = months[createdAt.getMonth()] + ' ' + createdAt.getDate() + ', ' + createdAt.getFullYear() + ' ' + createdAt.getHours() + ':' + createdAt.getMinutes() + ':' + createdAt.getSeconds();
      var statusClasses = cx(classes);
      rows.push(React.createElement("li", {
        className: rowClass,
        'data-id': element.workflowId,
        onContextMenu: _this.handleContextMenu,
        key: element.workflowId
      }, React.createElement(router.linkTo, {
        stateName: "ecar",
        params: {workflowId: element.workflowId},
        className: "current__link"
      }, React.createElement("div", {
        className: "current__col current__col--select",
        onClick: _this.selectRow
      }, React.createElement("i", {className: iconClass})), React.createElement("div", {className: "current__col current__col--id"}, element.workflowId), React.createElement("div", {className: "current__col"}, element.model.prefix), React.createElement("div", {className: "current__col"}, element.model.base), React.createElement("div", {className: "current__col"}, element.model.supplierName), React.createElement("div", {className: "current__col current__col--gsdb"}, element.model.manufacturingGSDB), React.createElement("div", {className: "current__col"}, element.model.partName), React.createElement("div", {className: "current__col"}, phases[element.model.phase] || ''), React.createElement("div", {className: "current__col"}), React.createElement("div", {className: "current__col current__col--status"}, React.createElement("span", {className: statusClasses}, status)), React.createElement("div", {className: "current__col current__col--date"}, date))));
    });
    var contextMenuElementList = [];
    var contextMenu = this.state.contextMenu;
    var contextMenuClass = cx({
      'contextmenu': true,
      'contextmenu--active': contextMenu.open
    });
    var contextMenuStyle = {
      left: contextMenu.location.x + 1 + 'px',
      top: contextMenu.location.y + 1 + 'px'
    };
    if (contextMenu.multiple) {
      var length = this.state.selected.length;
      contextMenuElementList.push(React.createElement("li", {
        key: "approveMultiple",
        className: "contextmenu__item contextmenu__item--approve"
      }, React.createElement("i", {className: "fa fa-check fa-fw contextmenu__icon"}), "Approve ", length, " items"));
      contextMenuElementList.push(React.createElement("li", {
        key: "rejectMultiple",
        className: "contextmenu__item contextmenu__item--reject"
      }, React.createElement("i", {className: "fa fa-times fa-fw contextmenu__icon"}), "Reject ", length, " items"));
      contextMenuElementList.push(React.createElement("li", {
        key: "deleteMultiple",
        className: "contextmenu__item contextmenu__item--delete"
      }, React.createElement("i", {className: "fa fa-trash-o fa-fw contextmenu__icon"}), "Delete ", length, " items"));
    } else {
      contextMenuElementList.push(React.createElement("li", {
        key: "create",
        className: "contextmenu__item contextmenu__item--create"
      }, React.createElement("i", {className: "fa fa-plus fa-fw contextmenu__icon"}), "Create new eCar from this one"));
      contextMenuElementList.push(React.createElement("li", {
        key: "approve",
        className: "contextmenu__item contextmenu__item--approve"
      }, React.createElement("i", {className: "fa fa-check fa-fw contextmenu__icon"}), "Approve"));
      contextMenuElementList.push(React.createElement("li", {
        key: "reject",
        className: "contextmenu__item contextmenu__item--reject"
      }, React.createElement("i", {className: "fa fa-times fa-fw contextmenu__icon"}), "Reject"));
      contextMenuElementList.push(React.createElement("li", {
        key: "delete",
        className: "contextmenu__item contextmenu__item--delete"
      }, React.createElement("i", {className: "fa fa-trash-o fa-fw contextmenu__icon"}), "Delete"));
    }
    var contextMenuElement = (React.createElement("div", {
      className: contextMenuClass,
      style: contextMenuStyle
    }, React.createElement("ul", {className: "contextmenu__list"}, contextMenuElementList)));
    var actionsClass = cx({
      'actions': true,
      'actions__active': this.state.selected.length
    });
    return (React.createElement("div", {className: "current no-select"}, React.createElement("div", {className: actionsClass}, React.createElement("ul", {className: "actions__list clear"}, React.createElement("li", {className: "actions__item actions__item--deselect"}, React.createElement("i", {className: "fa fa-minus-square fa-fw actions__icon"}), " "), React.createElement("li", {className: "actions__item actions__item--left actions__item--approve"}, React.createElement("i", {className: "fa fa-check fa-fw actions__icon"}), "Approve"), React.createElement("li", {className: "actions__item actions__item--middle actions__item--reject"}, React.createElement("i", {className: "fa fa-times fa-fw actions__icon"}), "Reject"), React.createElement("li", {className: "actions__item actions__item--right"}, React.createElement("i", {className: "fa fa-trash-o fa-fw actions__icon"}), "Delete"))), React.createElement("ul", {className: "current__table"}, React.createElement("li", {className: "current__header"}, React.createElement("div", {className: "current__col current__col--select"}), React.createElement("div", {className: "current__col current__col--id"}, "ID"), React.createElement("div", {className: "current__col"}, "Prefix"), React.createElement("div", {className: "current__col"}, "Base"), React.createElement("div", {className: "current__col"}, "Supplier Name"), React.createElement("div", {className: "current__col"}, "Supplier GSDB"), React.createElement("div", {className: "current__col"}, "Part Name"), React.createElement("div", {className: "current__col"}, "Submitted Phases"), React.createElement("div", {className: "current__col"}, "Current Phase"), React.createElement("div", {className: "current__col current__col--status"}), React.createElement("div", {className: "current__col"}, "Date Created")), rows), contextMenuElement));
  }
});
var resolve = {'getList': function() {
    return xhr('get', '/rest/reporting/list');
  }};
;

//# sourceMappingURL=<compileOutput>


},{"../actions/current":7,"../router/router":96,"../stores/current":102,"../utils":105,"../xhr":106}],83:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_form_47_view__,
    $___46__46__47_form_47_listeners__,
    $___46__46__47_form_47_controller__,
    $___46__46__47_xhr__,
    $___46__46__47_actions_47_blocks__,
    $___46__46__47_actions_47_alert__,
    $___46__46__47_stores_47_user__,
    $___46__46__47_utils__,
    $___46__46__47_form_47_constants__,
    $___46__46__47_form_47_form__,
    $___46__46__47_form_47_statusBar__;
var formView = ($___46__46__47_form_47_view__ = require("../form/view"), $___46__46__47_form_47_view__ && $___46__46__47_form_47_view__.__esModule && $___46__46__47_form_47_view__ || {default: $___46__46__47_form_47_view__}).default;
var formListeners = ($___46__46__47_form_47_listeners__ = require("../form/listeners"), $___46__46__47_form_47_listeners__ && $___46__46__47_form_47_listeners__.__esModule && $___46__46__47_form_47_listeners__ || {default: $___46__46__47_form_47_listeners__}).default;
var formController = ($___46__46__47_form_47_controller__ = require("../form/controller"), $___46__46__47_form_47_controller__ && $___46__46__47_form_47_controller__.__esModule && $___46__46__47_form_47_controller__ || {default: $___46__46__47_form_47_controller__}).default;
var xhr = ($___46__46__47_xhr__ = require("../xhr"), $___46__46__47_xhr__ && $___46__46__47_xhr__.__esModule && $___46__46__47_xhr__ || {default: $___46__46__47_xhr__}).default;
var blocksActions = ($___46__46__47_actions_47_blocks__ = require("../actions/blocks"), $___46__46__47_actions_47_blocks__ && $___46__46__47_actions_47_blocks__.__esModule && $___46__46__47_actions_47_blocks__ || {default: $___46__46__47_actions_47_blocks__}).default;
var alert = ($___46__46__47_actions_47_alert__ = require("../actions/alert"), $___46__46__47_actions_47_alert__ && $___46__46__47_actions_47_alert__.__esModule && $___46__46__47_actions_47_alert__ || {default: $___46__46__47_actions_47_alert__}).default;
var userStore = ($___46__46__47_stores_47_user__ = require("../stores/user"), $___46__46__47_stores_47_user__ && $___46__46__47_stores_47_user__.__esModule && $___46__46__47_stores_47_user__ || {default: $___46__46__47_stores_47_user__}).default;
var utils = ($___46__46__47_utils__ = require("../utils"), $___46__46__47_utils__ && $___46__46__47_utils__.__esModule && $___46__46__47_utils__ || {default: $___46__46__47_utils__}).default;
var constants = ($___46__46__47_form_47_constants__ = require("../form/constants"), $___46__46__47_form_47_constants__ && $___46__46__47_form_47_constants__.__esModule && $___46__46__47_form_47_constants__ || {default: $___46__46__47_form_47_constants__}).default;
var formFactory = ($___46__46__47_form_47_form__ = require("../form/form"), $___46__46__47_form_47_form__ && $___46__46__47_form_47_form__.__esModule && $___46__46__47_form_47_form__ || {default: $___46__46__47_form_47_form__}).default;
var StatusBar = ($___46__46__47_form_47_statusBar__ = require("../form/statusBar"), $___46__46__47_form_47_statusBar__ && $___46__46__47_form_47_statusBar__.__esModule && $___46__46__47_form_47_statusBar__ || {default: $___46__46__47_form_47_statusBar__}).default;
var adapt = require('../adapt/adapt');
var ecar = React.createClass({
  displayName: 'ecar',
  handleSaving: function() {
    this.setState({
      started: true,
      saving: true
    });
  },
  handleStopped: function() {
    this.setState({
      started: true,
      saving: false
    });
  },
  getInitialState: function() {
    return {
      started: false,
      saving: false,
      superseding: false,
      phase: false
    };
  },
  form: {},
  workflowId: 0,
  componentWillUnmount: function() {
    this.form.stopAutoSave();
  },
  componentDidMount: function() {
    var $__11 = this;
    this.form = new formFactory(this.props.data);
    this.form.instance = adapt.form('name', {
      view: this.form.createView(),
      model: this.form.createModel()
    });
    this.form.instance.controller.items = this.form.createController();
    this.form.instance.config.controller = this.form.createController();
    formListeners(this.form.instance);
    this.form.changePhase();
    this.form.changePPAP();
    var domNode = this.getDOMNode();
    this.form.instance.render(domNode.querySelectorAll('.form')[0]);
    this.form.monitorContactDetails();
    this.form.instance.observe.addListener((function() {
      return $__11.form.instance.model.items.phase.value;
    }), (function(newVal) {
      $__11.setState({phase: newVal});
    }));
    this.form.monitorPPAP();
    this.form.setupButtons();
    this.form.startAutoSave();
    this.form.instance.validation.validateAll();
  },
  render: function() {
    var phase;
    var model;
    if (this.state.phase) {
      phase = this.state.phase;
    } else if ((model = this.props.data.getForm.model) && model.length) {
      phase = model.phase;
    } else {
      phase = 'capacityPlanning';
    }
    return (React.createElement("div", null, React.createElement(StatusBar, {
      response: this.props.data.getForm,
      phase: phase
    }), React.createElement("div", {className: "form"}), React.createElement("div", {
      className: "summarybar",
      style: {display: 'none'}
    }, React.createElement("div", {className: "summarybar__header"}, "Processes Summary", React.createElement("div", {className: "summarybar__close"}, "Hide Summary Bar", React.createElement("i", {className: "fa fa-fw fa-times"}))), React.createElement("div", {className: "summarybar__processes clear"}, React.createElement("ul", {classname: "summarybar__processes--list "}, React.createElement("li", {className: "summarybar__processes--item clear summarybar__processes--below"}, React.createElement("span", {className: "summarybar__processes--name"}, React.createElement("h4", null, "Process 1"), React.createElement("h5", null, "Assembly")), React.createElement("span", {className: "summarybar__processes--percent"}, "-20%")), React.createElement("li", {className: "summarybar__processes--item clear summarybar__processes--above"}, React.createElement("span", {className: "summarybar__processes--name"}, React.createElement("h4", null, "Process 2"), React.createElement("h5", null, "Name Here")), React.createElement("span", {className: "summarybar__processes--percent"}, "80%")), React.createElement("li", {className: "summarybar__processes--item clear"}, React.createElement("span", {className: "summarybar__processes--name"}, React.createElement("h4", null, "Process 3"), React.createElement("h5", null, "Name Here")), React.createElement("span", {className: "summarybar__processes--percent"}, "0%")))), React.createElement("div", {className: "summarybar__chart"}, React.createElement("div", {className: "summarybar__legend clear"}, React.createElement("span", {className: "summarybar__legend--item"}, React.createElement("span", {
      className: "summarybar__legend--block",
      style: {background: '#CFE0C2'}
    }), "JLR Demand"), React.createElement("span", {className: "summarybar__legend--item"}, React.createElement("span", {
      className: "summarybar__legend--block",
      style: {background: '#DCDCDC'}
    }), "Weekly/Hourly Parts Available for Shipment")), React.createElement("canvas", {
      className: "summarybar__chart--canvas",
      height: "130"
    })))));
  }
});
ecar.resolve = {
  'getForm': function(params) {
    var endpoint = ['rest', 'workflow'];
    endpoint.push(params.workflowId.length === 16 && 'byWorkflowId' || 'byNodeId');
    endpoint.push(params.workflowId);
    return xhr('GET', endpoint.join('/'));
  },
  'getDetails': function() {
    return xhr('GET', '/rest/supplierDetails');
  }
};
var $__default = ecar;

//# sourceMappingURL=<compileOutput>


},{"../actions/alert":3,"../actions/blocks":5,"../adapt/adapt":10,"../form/constants":67,"../form/controller":68,"../form/form":72,"../form/listeners":76,"../form/statusBar":77,"../form/view":78,"../stores/user":104,"../utils":105,"../xhr":106}],84:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_stores_47_app__,
    $___46__46__47_components_47_alert__,
    $___46__46__47_router_47_router__,
    $___46__46__47_partials_47_header__;
var appStore = ($___46__46__47_stores_47_app__ = require("../stores/app"), $___46__46__47_stores_47_app__ && $___46__46__47_stores_47_app__.__esModule && $___46__46__47_stores_47_app__ || {default: $___46__46__47_stores_47_app__}).default;
var LoadingBar = require('../loading');
var Alert = ($___46__46__47_components_47_alert__ = require("../components/alert"), $___46__46__47_components_47_alert__ && $___46__46__47_components_47_alert__.__esModule && $___46__46__47_components_47_alert__ || {default: $___46__46__47_components_47_alert__}).default;
var Router = ($___46__46__47_router_47_router__ = require("../router/router"), $___46__46__47_router_47_router__ && $___46__46__47_router_47_router__.__esModule && $___46__46__47_router_47_router__ || {default: $___46__46__47_router_47_router__}).default;
var Header = ($___46__46__47_partials_47_header__ = require("../partials/header"), $___46__46__47_partials_47_header__ && $___46__46__47_partials_47_header__.__esModule && $___46__46__47_partials_47_header__ || {default: $___46__46__47_partials_47_header__}).default;
var index = React.createClass({
  displayName: 'index',
  componentDidMount: function() {
    Router.handleStateChange();
  },
  componentWillMount: function() {
    appStore.on('frozenUpdate', this.handleFrozenUpdate);
  },
  componentWillUnmount: function() {
    appStore.off('frozenUpdate', this.handleFrozenUpdate);
  },
  handleFrozenUpdate: function() {
    this.setState({
      frozen: appStore.frozen,
      top: appStore.top
    });
  },
  getInitialState: function() {
    return {
      frozen: appStore.frozen,
      top: 0
    };
  },
  render: function() {
    var cx = React.addons.classSet;
    var appClasses = cx({
      'app': true,
      'app--frozen': this.state.frozen
    });
    var appStyle = this.state.frozen ? {top: this.state.top} : {};
    return (React.createElement("div", {
      className: appClasses,
      style: appStyle
    }, React.createElement(LoadingBar, null), React.createElement(Alert, null), React.createElement(Header, null), React.createElement(Router.view, null)));
  }
});
var $__default = index;

//# sourceMappingURL=<compileOutput>


},{"../components/alert":46,"../loading":79,"../partials/header":88,"../router/router":96,"../stores/app":99}],85:[function(require,module,exports){
"use strict";
module.exports = React.createClass({
  displayName: 'exports',
  render: function() {
    return (React.createElement("div", null, "Info"));
  }
});

//# sourceMappingURL=<compileOutput>


},{}],86:[function(require,module,exports){
"use strict";
module.exports = React.createClass({
  displayName: 'exports',
  render: function() {
    return (React.createElement("div", null, "Reporting Page"));
  }
});

//# sourceMappingURL=<compileOutput>


},{}],87:[function(require,module,exports){
"use strict";
var xhr = require('../xhr');
var Search = React.createClass({
  displayName: 'Search',
  render: function() {
    console.log(this.props);
    var test = [];
    for (var i = 0; i < 2; i++) {
      test.push(React.createElement("div", null, "hello"));
    }
    var query = this.props.currentState.params.query;
    var cx = React.addons.classSet;
    var errorMessage;
    if (String(query).trim() == '') {
      console.log('hi');
      errorMessage = (React.createElement("div", {className: "results__empty"}, React.createElement("i", {className: "fa fa-frown-o fa-fw"}), "Please enter a search query in the search bar above"));
    }
    var data = this.props.data.getSearchResults;
    if (!errorMessage && data.resultCount === 0) {
      errorMessage = (React.createElement("div", {className: "results__none"}, React.createElement("i", {className: "fa fa-frown-o fa-fw"}), "No matches for ", query, ". Try another search term?"));
    }
    console.log(errorMessage);
    return (React.createElement("div", {className: "results"}, errorMessage));
  }
});
Search.resolve = {'getSearchResults': function(params) {
    return xhr('GET', '/rest/workflow/search/');
  }};
module.exports = Search;

//# sourceMappingURL=<compileOutput>


},{"../xhr":106}],88:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__navigation__,
    $__search__,
    $___46__46__47_router__,
    $___46__46__47_stores_47_user__;
var Navigation = ($__navigation__ = require("./navigation"), $__navigation__ && $__navigation__.__esModule && $__navigation__ || {default: $__navigation__}).default;
var Search = ($__search__ = require("./search"), $__search__ && $__search__.__esModule && $__search__ || {default: $__search__}).default;
var Router = ($___46__46__47_router__ = require("../router"), $___46__46__47_router__ && $___46__46__47_router__.__esModule && $___46__46__47_router__ || {default: $___46__46__47_router__}).default;
var User = ($___46__46__47_stores_47_user__ = require("../stores/user"), $___46__46__47_stores_47_user__ && $___46__46__47_stores_47_user__.__esModule && $___46__46__47_stores_47_user__ || {default: $___46__46__47_stores_47_user__}).default;
var header = React.createClass({
  displayName: 'header',
  componentWillMount: function() {
    User.on('userUpdated', this.handleUser);
  },
  componentWillUnmount: function() {
    User.off('userUpdated', this.handleUser);
  },
  getInitialState: function() {
    return {user: ''};
  },
  handleUser: function() {
    this.setState({user: User.user.emailAddress});
  },
  render: function() {
    return (React.createElement("header", {className: "mainheader"}, React.createElement("div", {className: "mainheader__fixed"}, React.createElement("div", {className: "mainheader__table"}, React.createElement("div", {className: "mainheader__logo-container mainheader__cell"}, React.createElement(Router.linkTo, {
      stateName: "current",
      className: "mainheader__logo"
    })), React.createElement("div", {className: "mainheader__cell mainheader__cell--search"}, React.createElement(Search, null)), React.createElement("div", {className: "mainheader__cell mainheader__cell--user"}, React.createElement("div", {className: "mainheader__user"}, this.state.user)), React.createElement("div", {className: "mainheader__cell mainheader__cell--navigation"}, React.createElement(Navigation, null))))));
  }
});
var $__default = header;

//# sourceMappingURL=<compileOutput>


},{"../router":91,"../stores/user":104,"./navigation":89,"./search":90}],89:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_router_47_router__,
    $___46__46__47_actions_47_alert__,
    $___46__46__47_xhr__;
var router = ($___46__46__47_router_47_router__ = require("../router/router"), $___46__46__47_router_47_router__ && $___46__46__47_router_47_router__.__esModule && $___46__46__47_router_47_router__ || {default: $___46__46__47_router_47_router__}).default;
var alert = ($___46__46__47_actions_47_alert__ = require("../actions/alert"), $___46__46__47_actions_47_alert__ && $___46__46__47_actions_47_alert__.__esModule && $___46__46__47_actions_47_alert__ || {default: $___46__46__47_actions_47_alert__}).default;
var xhr = ($___46__46__47_xhr__ = require("../xhr"), $___46__46__47_xhr__ && $___46__46__47_xhr__.__esModule && $___46__46__47_xhr__ || {default: $___46__46__47_xhr__}).default;
function findClosestParent(event, className) {
  var parent = event.parentNode;
  while (parent != document.body && parent != null) {
    if ((parent) && parent.className && parent.className.indexOf(className) != -1) {
      return parent;
    } else {
      parent = parent ? parent.parentNode : null;
    }
  }
  return null;
}
var navigation = React.createClass({
  displayName: 'navigation',
  getInitialState: function() {
    return {
      open: false,
      dropdownHover: -1
    };
  },
  create: function() {
    alert.open({
      waiting: true,
      header: 'Creating eCAR',
      message: 'Please wait..'
    });
    xhr('GET', '/rest/workflow/new').then(function(data) {
      alert.close();
      window.location = '/#/ecar/' + data.workflowId;
    });
  },
  componentDidMount: function() {
    var _this = this;
    document.addEventListener('click', function(e) {
      if (!findClosestParent(e.target, 'navigation__link--dropdown')) {
        if (_this.state.open) {
          _this.setState({open: false});
        }
      }
    });
  },
  setHover: function(id) {
    this.setState({dropdownHover: id});
  },
  removeHover: function() {
    this.setState({dropdownHover: -1});
  },
  toggleDropdown: function(event) {
    event.preventDefault();
    this.setState({open: !this.state.open});
  },
  render: function() {
    var cx = React.addons.classSet;
    var dropdownClass = cx({
      'dropdown': true,
      'dropdown--open': this.state.open,
      'dropdown--top': this.state.dropdownHover === 0
    });
    return (React.createElement("div", {className: "navigation"}, React.createElement("ul", {className: "navigation__list"}, React.createElement("li", {className: "navigation__item navigation__item--dropdown"}, React.createElement("a", {
      className: "navigation__link navigation__link--dropdown",
      href: "",
      onClick: this.toggleDropdown
    }, React.createElement("i", {className: "fa fa-bars fa-fw navigation__icon navigation__icon--dropdown"})), React.createElement("ul", {className: dropdownClass}, React.createElement("li", {className: "dropdown__item"}, React.createElement("div", {
      stateName: "create",
      className: "dropdown__link",
      onMouseOver: this.setHover.bind(this, 0),
      onMouseOut: this.removeHover,
      onClick: this.create
    }, React.createElement("i", {className: "fa fa-plus fa-fw dropdown__icon"}), "Create eCar")), React.createElement("li", {className: "dropdown__item"}, React.createElement(router.linkTo, {
      stateName: "current",
      href: "#",
      className: "dropdown__link"
    }, React.createElement("i", {className: "fa fa-list fa-fw dropdown__icon"}), "Current eCars")), React.createElement("li", {className: "dropdown__item"}, React.createElement(router.linkTo, {
      stateName: "reporting",
      className: "dropdown__link"
    }, React.createElement("i", {className: "fa fa-paperclip fa-fw dropdown__icon"}), "Reporting")), React.createElement("li", {className: "dropdown__item"}, React.createElement(router.linkTo, {
      stateName: "admin",
      className: "dropdown__link"
    }, React.createElement("i", {className: "fa fa-cog fa-fw dropdown__icon"}), "Administration")))))));
  }
});
var $__default = navigation;

//# sourceMappingURL=<compileOutput>


},{"../actions/alert":3,"../router/router":96,"../xhr":106}],90:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_router_47_router__;
var router = ($___46__46__47_router_47_router__ = require("../router/router"), $___46__46__47_router_47_router__ && $___46__46__47_router_47_router__.__esModule && $___46__46__47_router_47_router__ || {default: $___46__46__47_router_47_router__}).default;
var search = React.createClass({
  displayName: 'search',
  handleSearch: function(event) {
    if (event.keyCode === 13) {
      if (event.target.value.trim() !== '') {
        window.location = '/#/search/' + encodeURIComponent(event.target.value);
      }
      this.override = true;
    }
  },
  override: true,
  handleChange: function(event) {
    this.override = false;
    this.setState({searchTerm: event.target.value});
  },
  getInitialState: function() {
    return {searchTerm: ''};
  },
  componentWillMount: function() {
    var _this = this;
  },
  render: function() {
    return (React.createElement("div", {className: "search"}, React.createElement("i", {className: "fa fa-search search__icon"}), React.createElement("input", {
      type: "text",
      placeholder: "Search eCars",
      className: "search__box",
      value: this.state.searchTerm,
      onChange: this.handleChange,
      onKeyDown: this.handleSearch
    }), React.createElement("span", {className: "search__tip"}, "Press ", React.createElement("span", {className: "search__tip--button"}, "Enter"), " to search")));
  }
});
var $__default = search;

//# sourceMappingURL=<compileOutput>


},{"../router/router":96}],91:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__router_47_router_46_jsx__,
    $__pages_47_create_46_jsx__,
    $__pages_47_current_46_jsx__,
    $__pages_47_search_46_jsx__,
    $__pages_47_info_46_jsx__,
    $__pages_47_admin_46_jsx__,
    $__pages_47_reporting_46_jsx__,
    $__pages_47_ecar_46_jsx__,
    $__actions_47_user__;
var router = ($__router_47_router_46_jsx__ = require("./router/router.jsx"), $__router_47_router_46_jsx__ && $__router_47_router_46_jsx__.__esModule && $__router_47_router_46_jsx__ || {default: $__router_47_router_46_jsx__}).default;
var create = ($__pages_47_create_46_jsx__ = require("./pages/create.jsx"), $__pages_47_create_46_jsx__ && $__pages_47_create_46_jsx__.__esModule && $__pages_47_create_46_jsx__ || {default: $__pages_47_create_46_jsx__}).default;
var $__2 = ($__pages_47_current_46_jsx__ = require("./pages/current.jsx"), $__pages_47_current_46_jsx__ && $__pages_47_current_46_jsx__.__esModule && $__pages_47_current_46_jsx__ || {default: $__pages_47_current_46_jsx__}),
    current = $__2.current,
    currentResolve = $__2.resolve;
var search = ($__pages_47_search_46_jsx__ = require("./pages/search.jsx"), $__pages_47_search_46_jsx__ && $__pages_47_search_46_jsx__.__esModule && $__pages_47_search_46_jsx__ || {default: $__pages_47_search_46_jsx__}).default;
var info = ($__pages_47_info_46_jsx__ = require("./pages/info.jsx"), $__pages_47_info_46_jsx__ && $__pages_47_info_46_jsx__.__esModule && $__pages_47_info_46_jsx__ || {default: $__pages_47_info_46_jsx__}).default;
var admin = ($__pages_47_admin_46_jsx__ = require("./pages/admin.jsx"), $__pages_47_admin_46_jsx__ && $__pages_47_admin_46_jsx__.__esModule && $__pages_47_admin_46_jsx__ || {default: $__pages_47_admin_46_jsx__}).default;
var reporting = ($__pages_47_reporting_46_jsx__ = require("./pages/reporting.jsx"), $__pages_47_reporting_46_jsx__ && $__pages_47_reporting_46_jsx__.__esModule && $__pages_47_reporting_46_jsx__ || {default: $__pages_47_reporting_46_jsx__}).default;
var ecar = ($__pages_47_ecar_46_jsx__ = require("./pages/ecar.jsx"), $__pages_47_ecar_46_jsx__ && $__pages_47_ecar_46_jsx__.__esModule && $__pages_47_ecar_46_jsx__ || {default: $__pages_47_ecar_46_jsx__}).default;
var xhr = require('./xhr');
var userActions = ($__actions_47_user__ = require("./actions/user"), $__actions_47_user__ && $__actions_47_user__.__esModule && $__actions_47_user__ || {default: $__actions_47_user__}).default;
xhr('GET', '/rest/user').then(function(data) {
  userActions.setUser(data);
});
router.registerState('current', {
  url: '/current',
  view: current,
  resolve: currentResolve
});
router.registerState('ecar', {
  url: '/ecar/:workflowId',
  view: ecar,
  resolve: ecar.resolve,
  forceRemount: true
});
router.registerState('info', {
  url: '/info',
  view: info
});
router.registerState('reporting', {
  url: '/reporting',
  view: reporting
});
router.registerState('admin', {
  url: '/admin',
  view: admin
});
router.registerState('search', {
  url: '/search/:query',
  optionalParams: ['query'],
  view: search
});
router.otherwise('current');
var $__default = router;

//# sourceMappingURL=<compileOutput>


},{"./actions/user":9,"./pages/admin.jsx":80,"./pages/create.jsx":81,"./pages/current.jsx":82,"./pages/ecar.jsx":83,"./pages/info.jsx":85,"./pages/reporting.jsx":86,"./pages/search.jsx":87,"./router/router.jsx":96,"./xhr":106}],92:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_stores_47_router__;
var store = ($___46__46__47_stores_47_router__ = require("../stores/router"), $___46__46__47_stores_47_router__ && $___46__46__47_stores_47_router__.__esModule && $___46__46__47_stores_47_router__ || {default: $___46__46__47_stores_47_router__}).default;
var actions = {
  changeState: function(name) {
    this.dispatcher.dispatch({
      action: 'changeState',
      data: name
    });
  },
  stateChangeStart: function(state) {
    this.dispatcher.dispatch({
      action: 'stateChangeStart',
      data: {state: state}
    });
  },
  stateChangeFinish: function(state, data) {
    this.dispatcher.dispatch({
      action: 'stateChangeFinish',
      data: {
        state: state,
        data: data
      }
    });
  },
  statePromiseFinished: function(promise) {
    this.dispatcher.dispatch({
      action: 'statePromiseFinished',
      data: promise
    });
  },
  statePromiseFailed: function(promise) {
    this.dispatcher.dispatch({
      action: 'statePromiseFailed',
      data: promise
    });
  },
  registerState: function(name, config) {
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
var $__default = actions;

//# sourceMappingURL=<compileOutput>


},{"../stores/router":97}],93:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_stores_47_router__;
var router = require('../router');
var routerStore = ($___46__46__47_stores_47_router__ = require("../stores/router"), $___46__46__47_stores_47_router__ && $___46__46__47_stores_47_router__.__esModule && $___46__46__47_stores_47_router__ || {default: $___46__46__47_stores_47_router__}).default;
var linkTo = React.createClass({
  displayName: 'linkTo',
  componentWillMount: function() {
    var _this = this;
    routerStore.on('stateChangeStart', this.handleStateChange);
  },
  componentWillUnmount: function() {
    routerStore.off('stateChangeStart', this.handleStateChange);
  },
  handleStateChange: function(payload) {
    this.setState({
      active: payload.state.name === this.props.stateName,
      state: payload.state
    });
  },
  getInitialState: function() {
    var states = routerStore.getStates();
    var state = states[this.props.stateName];
    if (state) {
      return {
        href: '#' + state.compiledState.format(this.props.params || {}),
        active: false
      };
    } else {
      throw new Error('State ' + this.props.stateName + ' does not exist');
    }
  },
  render: function() {
    var href = this.state.href;
    var cx = React.addons.classSet;
    var classes = cx({'active': this.state.active});
    return this.transferPropsTo(React.createElement("a", {
      href: href,
      className: classes
    }, this.props.children));
  }
});
var $__default = linkTo;

//# sourceMappingURL=<compileOutput>


},{"../router":96,"../stores/router":97}],94:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_stores_47_router__;
var routerStore = ($___46__46__47_stores_47_router__ = require("../stores/router"), $___46__46__47_stores_47_router__ && $___46__46__47_stores_47_router__.__esModule && $___46__46__47_stores_47_router__ || {default: $___46__46__47_stores_47_router__}).default;
var view = React.createClass({
  displayName: 'view',
  componentWillMount: function() {
    var _this = this;
    routerStore.on('stateChangeFinish', this.handleStateChange);
  },
  componentWillUnmount: function() {
    routerStore.off('stateChangeFinish', this.handleStateChange);
  },
  handleStateChange: function(payload) {
    var $__1 = this;
    setTimeout((function() {
      $__1.setState({
        currentState: payload.state,
        data: payload.data
      });
    }), 0);
  },
  getInitialState: function() {
    return {
      currentState: {view: null},
      data: {}
    };
  },
  render: function() {
    var currentState = this.state.currentState;
    var data = this.state.data;
    if (!currentState.view) {
      return null;
    }
    var key = currentState.forceRemount ? +new Date() : currentState.name;
    return currentState.view({
      key: key,
      data: data,
      currentState: currentState
    });
  }
});
var $__default = view;

//# sourceMappingURL=<compileOutput>


},{"../stores/router":97}],95:[function(require,module,exports){
"use strict";
var matchFactory = function(url, config) {
  var placeholder = /([:*])(\w+)|\{(\w+)(?:\:((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g;
  config = config || {};
  var compiled = '^';
  var last = 0;
  var m;
  var segments = this.segments = [];
  var params = this.params = {};
  var id,
      regexp,
      segment,
      type,
      cfg;
  var pattern = url;
  function extend(target, dest) {
    for (var i in dest) {
      target[i] = dest[i];
    }
    return target;
  }
  function addParameter(id, type, config) {
    if (!/^\w+(-+\w+)*$/.test(id))
      throw new Error("Invalid parameter name '" + id + "' in pattern '" + pattern + "'");
    if (params[id])
      throw new Error("Duplicate parameter name '" + id + "' in pattern '" + pattern + "'");
    params[id] = extend({
      type: type || new Type(),
      $value: function(test) {
        return test;
      }
    }, config);
  }
  function $value(value) {
    return value ? this.type.decode(value) : $UrlMatcherFactory.$$getDefaultValue(this);
  }
  function quoteRegExp(string, pattern, isOptional) {
    var result = string.replace(/[\\\[\]\^$*+?.()|{}]/g, "\\$&");
    if (!pattern)
      return result;
    var flag = isOptional ? '?' : '';
    return result + flag + '(' + pattern + ')' + flag;
  }
  function paramConfig(param) {
    if (!config.params || !config.params[param])
      return {};
    var cfg = config.params[param];
    return typeof cfg === 'object' ? cfg : {value: cfg};
  }
  while ((m = placeholder.exec(pattern))) {
    id = m[2] || m[3];
    regexp = m[4] || (m[1] == '*' ? '.*' : '[^/]*');
    segment = pattern.substring(last, m.index);
    type = this.$types[regexp] || new Type({pattern: new RegExp(regexp)});
    cfg = paramConfig(id);
    if (segment.indexOf('?') >= 0)
      break;
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
    search.substring(1).split(/[&?]/).forEach(function(key) {});
  } else {
    this.sourcePath = pattern;
    this.sourceSearch = '';
  }
  compiled += quoteRegExp(segment) + (config.strict === false ? '\/?' : '') + '$';
  segments.push(segment);
  this.regexp = new RegExp(compiled, config.caseInsensitive ? 'i' : undefined);
  this.prefix = segments[0];
};
matchFactory.prototype.exec = function(path, searchParams) {
  var m = this.regexp.exec(path);
  if (!m)
    return null;
  searchParams = searchParams || {};
  var params = this.parameters(),
      nTotal = params.length,
      nPath = this.segments.length - 1,
      values = {},
      i,
      cfg,
      param;
  if (nPath !== m.length - 1)
    throw new Error("Unbalanced capture group in route '" + this.source + "'");
  for (i = 0; i < nPath; i++) {
    param = params[i];
    cfg = this.params[param];
    values[param] = cfg.$value(m[i + 1]);
  }
  for (; i < nTotal; i++) {
    param = params[i];
    cfg = this.params[param];
    values[param] = cfg.$value(searchParams[param]);
  }
  return values;
};
matchFactory.prototype.validates = function(params) {
  var result = true,
      isOptional,
      cfg,
      self = this;
  for (var key in params) {
    var val = params[key];
    if (!self.params[key])
      return;
    cfg = self.params[key];
    isOptional = !val && cfg && cfg.value;
    result = result;
  }
  return result;
};
matchFactory.prototype.format = function(values) {
  var segments = this.segments,
      params = this.parameters();
  if (!values)
    return segments.join('').replace('//', '/');
  var nPath = segments.length - 1,
      nTotal = params.length,
      result = segments[0],
      i,
      search,
      value,
      param,
      cfg,
      array;
  if (!this.validates(values))
    return '';
  for (i = 0; i < nPath; i++) {
    param = params[i];
    value = values[param];
    cfg = this.params[param];
    if (!value && (segments[i] === '/' && segments[i + 1] === '/'))
      continue;
    if (value != null)
      result += encodeURIComponent(value);
    result += segments[i + 1];
  }
  for (; i < nTotal; i++) {
    param = params[i];
    value = values[param];
    if (value == null)
      continue;
    array = typeof value === 'array';
    if (array) {
      value = value.map(encodeURIComponent).join('&' + param + '=');
    }
    result += (search ? '&' : '?') + param + '=' + (array ? value : encodeURIComponent(value));
    search = true;
  }
  return result.replace('//', '/');
};
matchFactory.prototype.parameters = function(param) {
  if (!param)
    return Object.keys(this.params);
  return this.params[param] || null;
};
matchFactory.prototype.$types = {};
function Type(config) {
  for (var i in config) {
    this[i] = config[i];
  }
}
Type.prototype.$subPattern = function() {
  var sub = this.pattern.toString();
  return sub.substr(1, sub.length - 2);
};
module.exports = matchFactory;

//# sourceMappingURL=<compileOutput>


},{}],96:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__components_47_linkTo__,
    $__components_47_view__,
    $__actions_47_router__,
    $__stores_47_router__;
var matchFactory = require('./matchFactory');
var linkTo = ($__components_47_linkTo__ = require("./components/linkTo"), $__components_47_linkTo__ && $__components_47_linkTo__.__esModule && $__components_47_linkTo__ || {default: $__components_47_linkTo__}).default;
var view = ($__components_47_view__ = require("./components/view"), $__components_47_view__ && $__components_47_view__.__esModule && $__components_47_view__ || {default: $__components_47_view__}).default;
var routerActions = ($__actions_47_router__ = require("./actions/router"), $__actions_47_router__ && $__actions_47_router__.__esModule && $__actions_47_router__ || {default: $__actions_47_router__}).default;
var routerStore = ($__stores_47_router__ = require("./stores/router"), $__stores_47_router__ && $__stores_47_router__.__esModule && $__stores_47_router__ || {default: $__stores_47_router__}).default;
var router = {};
router.states = {};
router.fallbackState = '';
router.registerState = function(name, config) {
  var compiledState = new matchFactory(config.url);
  var newState = config;
  newState.name = name;
  newState.compiledState = compiledState;
  this.states[name] = newState;
  routerActions.registerState(name, config);
};
router.otherwise = function(stateName) {
  this.fallbackState = this.states[stateName];
};
router.changeState = function(state) {
  routerActions.stateChangeStart(state);
  var promises = [];
  if (state.resolve) {
    var resolveKeys = Object.keys(state.resolve);
    var resolves = state.resolve;
    for (var i in resolves) {
      var resolve = resolves[i];
      var statePromise = resolve.call(this, state.params);
      promises.push(statePromise);
      statePromise.then(routerActions.statePromiseFinished, routerActions.statePromiseFailed);
    }
  }
  var promise = Q.all(promises);
  promise.then(function(data) {
    var dataToPass = {};
    if (state.resolve) {
      data.forEach(function(response, index) {
        var key = resolveKeys[index];
        dataToPass[key] = response;
      });
    }
    routerActions.stateChangeFinish(state, dataToPass);
  });
};
router.handleStateChange = function() {
  var url = window.location.hash.replace('#', '');
  var states = this.states;
  var changed = false;
  for (var i in states) {
    var state = states[i];
    var check = state.compiledState.exec(url);
    for (var i in check) {
      check[i] = decodeURIComponent(check[i]);
    }
    state.params = check;
    if (check) {
      changed = true;
      this.changeState(state);
    }
  }
  if (!changed) {
    window.location.hash = this.fallbackState.compiledState.prefix;
  }
};
window.onhashchange = router.handleStateChange.bind(router);
router.linkTo = linkTo;
router.view = view;
router.actions = routerActions;
router.store = routerStore;
var $__default = router;

//# sourceMappingURL=<compileOutput>


},{"./actions/router":92,"./components/linkTo":93,"./components/view":94,"./matchFactory":95,"./stores/router":97}],97:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var store = require('../../flux/store');
var dispatcher = require('../../dispatchers/ecar');
var routerStore = new store({dispatcher: dispatcher});
routerStore.currentState = {};
routerStore.states = {};
routerStore.registerHandlers({
  changeState: function(payload) {
    this.emit('changeState', payload);
  },
  registerState: function(payload) {
    this.states[payload.name] = payload.config;
    this.emit('stateAdded', payload);
  },
  stateChangeFinish: function(payload) {
    this.currentState = payload;
    this.emit('stateChangeFinish', payload);
  },
  stateChangeStart: function(payload) {
    this.currentState = payload;
    this.emit('stateChangeStart', payload);
  },
  statePromiseFinished: function(payload) {
    this.emit('statePromiseFinished', payload);
  }
});
routerStore.getCurrentState = function() {
  return this.currentState;
};
routerStore.getStates = function() {
  return this.states;
};
var $__default = routerStore;

//# sourceMappingURL=<compileOutput>


},{"../../dispatchers/ecar":59,"../../flux/store":63}],98:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var store = require('../flux/store');
var dispatcher = require('../dispatchers/ecar');
var alertStore = new store({dispatcher: dispatcher});
alertStore.open = false;
alertStore.config = {};
alertStore.registerHandlers({
  openAlert: function(config) {
    this.open = true;
    this.config = config;
    this.emit('toggleAlert');
  },
  closeAlert: function() {
    this.open = false;
    this.emit('toggleAlert');
  }
});
var store = alertStore;
var $__default = store;

//# sourceMappingURL=<compileOutput>


},{"../dispatchers/ecar":59,"../flux/store":63}],99:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var store = require('../flux/store');
var dispatcher = require('../dispatchers/ecar');
var appStore = new store({dispatcher: dispatcher});
appStore.frozen = false;
appStore.top = 0;
appStore.registerHandlers({
  freeze: function() {
    this.frozen = true;
    this.top = -document.body.scrollTop;
    this.emit('frozenUpdate', true);
  },
  unfreeze: function() {
    this.frozen = false;
    this.emit('frozenUpdate', false);
    window.scrollTo(0, -this.top);
  }
});
var store = appStore;
var $__default = store;

//# sourceMappingURL=<compileOutput>


},{"../dispatchers/ecar":59,"../flux/store":63}],100:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var store = require('../flux/store');
var dispatcher = require('../dispatchers/ecar');
var blockStore = new store({dispatcher: dispatcher});
blockStore.open = ['capacityPlanning'];
blockStore.visibile = ['capacityPlanning'];
blockStore.registerHandlers({
  toggleBlock: function(payload) {
    this.open = payload;
    this.emit('blockToggled', payload);
  },
  setVisible: function(payload) {
    this.visibile = payload;
    this.emit('blockVisibility', payload);
  }
});
blockStore.getOpen = function() {
  return this.open;
};
blockStore.getVisible = function() {
  return this.visibile;
};
var store = blockStore;
var $__default = store;

//# sourceMappingURL=<compileOutput>


},{"../dispatchers/ecar":59,"../flux/store":63}],101:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var store = require('../flux/store');
var dispatcher = require('../dispatchers/ecar');
var buttonStore = new store({dispatcher: dispatcher});
buttonStore.frozen = false;
buttonStore.top = 0;
buttonStore.registerHandlers({buttonClick: function(name) {
    this.emit('buttonClick', name);
  }});
var store = buttonStore;
var $__default = store;

//# sourceMappingURL=<compileOutput>


},{"../dispatchers/ecar":59,"../flux/store":63}],102:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var store = require('../flux/store');
var dispatcher = require('../dispatchers/ecar');
var currentStore = new store({dispatcher: dispatcher});
currentStore.payload = [];
currentStore.registerHandlers({setSelected: function(payload) {
    this.payload = payload;
    this.emit('selectItem', payload);
  }});
currentStore.getSelected = function() {
  return this.payload;
};
var store = currentStore;
var $__default = store;

//# sourceMappingURL=<compileOutput>


},{"../dispatchers/ecar":59,"../flux/store":63}],103:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var store = require('../flux/store');
var dispatcher = require('../dispatchers/ecar');
var saveStore = new store({dispatcher: dispatcher});
saveStore.registerHandlers({
  saveStart: function() {
    this.emit('saveStarted');
  },
  saveSaving: function() {
    this.emit('saveSaving');
  },
  saveStop: function() {
    this.emit('saveStopped');
  }
});
var $__default = saveStore;

//# sourceMappingURL=<compileOutput>


},{"../dispatchers/ecar":59,"../flux/store":63}],104:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var store = require('../flux/store');
var dispatcher = require('../dispatchers/ecar');
var userStore = new store({dispatcher: dispatcher});
userStore.user = {};
userStore.registerHandlers({setUser: function(payload) {
    this.user = payload;
    this.emit('userUpdated');
  }});
var store = userStore;
var $__default = store;

//# sourceMappingURL=<compileOutput>


},{"../dispatchers/ecar":59,"../flux/store":63}],105:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var utils = {
  hasNode: function(node, nodeList) {
    if (nodeList) {
      for (var i = 0; i < nodeList.length; i++) {
        if (nodeList[i].name === node) {
          return true;
        }
      }
      return false;
    }
    return false;
  },
  getStatus: function(response, classes, classPrefix) {
    if (response.status === 'CREATED') {
      status = 'Draft';
      classes[classPrefix + '--draft'] = true;
    }
    if (response.status === 'ACTIVE') {
      if (response.currentRenderedNodes) {
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
    if (response.status === 'COMPLETED') {
      status = 'Approved';
      classes[classPrefix + '--approved'] = true;
    }
    return {
      status: status,
      classes: classes
    };
  },
  copy: function(source, destination) {
    if (!destination) {
      if (this.isArray(source)) {
        destination = [];
      } else if (this.isObject(source)) {
        destination = {};
      } else {
        throw new Error(typeof source + ' is not supported by Utils.copy');
      }
    }
    for (var i in source) {
      destination[i] = source[i];
    }
    return destination;
  },
  arrayDiff: function(a1, a2) {
    var differences = [];
    for (var i = 0; i < a1.length; i++) {
      if (a2.indexOf(a1[i]) === -1) {
        differences.push({
          action: 'added',
          value: a1[i]
        });
      }
    }
    for (var i = 0; i < a2.length; i++) {
      if (a1.indexOf(a2[i]) === -1) {
        differences.push({
          action: 'removed',
          value: a2[i]
        });
      }
    }
    return differences;
  },
  equals: function(o1, o2) {
    if (o1 === o2)
      return true;
    if (o1 === null || o2 === null)
      return false;
    if (o1 !== o1 && o2 !== o2)
      return true;
    var t1 = typeof o1,
        t2 = typeof o2,
        length,
        key,
        keySet;
    if (t1 == t2) {
      if (t1 == 'object') {
        if (this.isArray(o1)) {
          if (!this.isArray(o2))
            return false;
          if ((length = o1.length) == o2.length) {
            for (key = 0; key < length; key++) {
              if (!this.equals(o1[key], o2[key]))
                return false;
            }
            return true;
          }
        } else if (this.isDate(o1)) {
          if (!this.isDate(o2))
            return false;
          return this.equals(o1.getTime(), o2.getTime());
        } else if (this.isRegExp(o1) && this.isRegExp(o2)) {
          return o1.toString() == o2.toString();
        } else {
          keySet = {};
          for (key in o1) {
            if (key.charAt(0) === '$' || this.isFunction(o1[key]))
              continue;
            if (!this.equals(o1[key], o2[key]))
              return false;
            keySet[key] = true;
          }
          for (key in o2) {
            if (!keySet.hasOwnProperty(key) && key.charAt(0) !== '$' && o2[key] !== undefined && !this.isFunction(o2[key]))
              return false;
          }
          return true;
        }
      }
    }
    return false;
  },
  convertToCamelCase: function(string) {
    return string.replace(/:([a-z])/g, function(g) {
      return g[1].toUpperCase();
    });
  },
  extend: function(source, destination) {
    for (var i in source) {
      destination[i] = source[i];
    }
    return destination;
  },
  findClosestParent: function(event, className) {
    var parent = event.parentNode;
    while (parent != document.body && parent != null) {
      if ((parent) && parent.className && parent.className.indexOf(className) != -1) {
        return parent;
      } else {
        parent = parent ? parent.parentNode : null;
      }
    }
    return null;
  },
  checkState: function(state, currentState) {
    var _this = this;
    function compareState(stateName, currentState) {
      var show = false;
      if (stateName) {
        if (_this.isString(stateName)) {
          show = stateName === currentState;
        } else if (_this.isArray(stateName)) {
          var index = stateName.indexOf(currentState);
          show = index > -1;
        }
      }
      return show;
    }
    if (state) {
      var show = false;
      if (this.isArray(currentState)) {
        currentState.forEach(function(element) {
          var result = compareState(state, element);
          if (!!result) {
            show = true;
          }
        }, this);
      } else {
        show = compareState(state, currentState);
      }
      return show;
    }
    return true;
  },
  convert: function(data, newData) {
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
  convert2: function(data, newData) {
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
var objTypes = ['Array', 'Object', 'String', 'Date', 'RegExp', 'Function', 'Boolean', 'Number', 'Null', 'Undefined'];
for (var i = objTypes.length; i--; ) {
  utils['is' + objTypes[i]] = (function(objectType) {
    return function(elem) {
      return toString.call(elem).slice(8, -1) === objectType;
    };
  })(objTypes[i]);
}
var $__default = utils;

//# sourceMappingURL=<compileOutput>


},{}],106:[function(require,module,exports){
"use strict";
module.exports = function(type, url, params, content, headers) {
  var request = new XMLHttpRequest();
  var deferred = Q.defer();
  var str = '';
  if (params) {
    for (var key in params) {
      if (str != "") {
        str += '&';
      }
      str += key + '=' + params[key];
    }
  }
  request.open(type, url + str, true);
  if (headers) {
    for (var i in headers) {
      request.setRequestHeader(i, headers[i]);
    }
  }
  request.onload = onload;
  request.onerror = onerror;
  request.onprogress = onprogress;
  request.send(content || '');
  function onload() {
    if (request.status === 200) {
      var response;
      try {
        response = JSON.parse(request.responseText);
      } catch (e) {
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

//# sourceMappingURL=<compileOutput>


},{}]},{},[2,60])