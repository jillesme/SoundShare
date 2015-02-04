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


},{"../stores/alert":46}],4:[function(require,module,exports){
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


},{"../stores/app":47}],5:[function(require,module,exports){
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


},{"../stores/blocks":48}],6:[function(require,module,exports){
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


},{"../stores/current":49}],7:[function(require,module,exports){
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
            key: "cancel",
            className: "button cancel",
            onClick: _this.close
          }, obj.text));
        },
        button: function() {
          return (React.createElement("a", {
            key: "button",
            className: "button",
            onClick: _this.close.bind(_this, obj.callback)
          }, obj.text));
        },
        link: function() {
          return (React.createElement("a", {
            key: "link",
            className: "button",
            onClick: _this.close,
            href: obj.link
          }, obj.text));
        }
      };
      return (types[obj.type] || types.button)();
    }));
    return (React.createElement("div", null, React.createElement("div", {
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


},{"../actions/alert":3,"../stores/alert":46}],8:[function(require,module,exports){
"use strict";
var $___46__46__47_stores_47_blocks__,
    $___46__46__47_actions_47_blocks__;
var store = ($___46__46__47_stores_47_blocks__ = require("../stores/blocks"), $___46__46__47_stores_47_blocks__ && $___46__46__47_stores_47_blocks__.__esModule && $___46__46__47_stores_47_blocks__ || {default: $___46__46__47_stores_47_blocks__}).default;
var actions = ($___46__46__47_actions_47_blocks__ = require("../actions/blocks"), $___46__46__47_actions_47_blocks__ && $___46__46__47_actions_47_blocks__.__esModule && $___46__46__47_actions_47_blocks__ || {default: $___46__46__47_actions_47_blocks__}).default;
var block = {
  displayName: 'block',
  componentWillMount: function() {
    console.log('mounted');
    store.on('blockToggled', this.toggleBlock);
    store.on('blockVisibility', this.toggleVisibility);
  },
  componentWillUnmount: function() {
    console.log('unmounted');
    store.off('blockVisibility', this.toggleVisibility);
    store.off('blockToggled', this.toggleBlock);
  },
  toggleBlock: function() {
    var blocks = store.getOpen();
    console.log('block toggled');
    this.setState({open: blocks.indexOf(this.props.config.name) > -1});
  },
  toggleVisibility: function() {
    var visible = store.getVisible();
    console.log('visibility toggled');
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
    children = loop({
      items: items,
      controller: config.controller,
      values: config.values,
      observe: config.observe,
      nameTrail: config.nameTrail,
      model: config.model,
      adapt: _this.props.adapt
    });
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


},{"../actions/blocks":5,"../stores/blocks":48}],9:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return button;
    }},
  __esModule: {value: true}
});
var button = adapt.component('button', {
  displayName: 'button',
  statics: {defaultModelValue: false},
  handleClick: function(e) {
    this.props.config.model[this.props.config.name].value = true;
    this.props.adapt.observe.digest();
    this.props.config.model[this.props.config.name].value = false;
    this.props.adapt.observe.digest();
    e.preventDefault();
    e.stopPropagation();
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
    return (React.createElement("div", {className: 'field field__button ' + (this.props.config.item.className || '')}, typeof item.label === 'undefined' ? '' : React.createElement(adapt.components.label, {
      config: {item: item},
      adapt: this.props.adapt
    }), React.createElement("div", {className: "field__button--container"}, React.createElement("button", {onClick: this.handleClick}, item.text), typeof item.desc === 'undefined' ? '' : React.createElement(adapt.components.description, {
      config: {item: item},
      adapt: this.props.adapt
    }))));
  }
});
;

//# sourceMappingURL=<compileOutput>


},{}],10:[function(require,module,exports){
"use strict";
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


},{}],11:[function(require,module,exports){
"use strict";
var chart = {
  drawChart: function() {
    var chartElement = document.querySelectorAll('.chart__render')[0];
    console.log(chartElement);
    var data = google.visualization.arrayToDataTable([['Process Name', 'Parts Avail Shipment', 'Planned Production Per Week', 'JLR Demand'], ['Test', 0, 0, 0], ['Test', 0, 0, 0], ['Test', 0, 0, 0]]);
    var options = {
      seriesType: "bars",
      series: {
        0: {type: "line"},
        2: {type: "steppedArea"}
      },
      bar: {groupWidth: "20%"},
      width: 500,
      chartArea: {
        left: "3%",
        top: "3%",
        height: "94%",
        width: "94%"
      },
      legend: {position: 'none'},
      colors: ['#F29100', '#3A5BCB', '#CA2800']
    };
  },
  componentDidMount: function() {
    this.drawChart();
  },
  render: function() {
    return (React.createElement("div", {className: "chart"}, React.createElement("div", {
      className: "chart__render",
      style: {width: '100%'},
      ref: "chart"
    })));
  }
};
adapt.component('chart', chart);
var inject = ['$scope'];

//# sourceMappingURL=<compileOutput>


},{}],12:[function(require,module,exports){
"use strict";
var blockheader = {
  displayName: 'blockheader',
  render: function() {
    return (React.createElement("div", {className: 'blockheader ' + (this.props.config.item.className || '')}));
  }
};
adapt.component('blockheader', blockheader);

//# sourceMappingURL=<compileOutput>


},{}],13:[function(require,module,exports){
"use strict";
var appActions = require('../actions/app');
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
      adapt: this.props.adapt
    });
    return (React.createElement("div", {className: "field overlay"}, React.createElement("div", {
      className: "overlay__open",
      onClick: this.open
    }, config.item.text), React.createElement("div", {className: overlayClasses}, React.createElement("div", {className: "overlay__container"}, React.createElement("div", {
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


},{"../actions/app":4}],14:[function(require,module,exports){
"use strict";
var Utils = {
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
    var partName = '';
    var configItems = this.props.adapt.model.items;
    var study = {
      multi: function() {
        var suffixes = [];
        if (configItems.suffix) {
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
        return [configItems.prefix.value, configItems.base.value, configItems.suffix.value].join(' ');
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
    if (model) {
      for (var i = 0; i < model.length; i++) {
        var children = [];
        if (!simple) {
          children.push(React.createElement("td", {className: "id"}, i + 2));
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
        items.push(React.createElement("tr", {key: i}, children));
      }
      ;
    }
    return (React.createElement("div", {className: 'element__table clear no-select ' + (simple ? 'element__table--simple' : '')}, React.createElement("table", {
      cellPadding: "0",
      cellSpacing: "0"
    }, React.createElement("thead", null, React.createElement("tr", null, simple ? '' : React.createElement("th", {className: "id"}, "#"), header, React.createElement("th", {className: "th__options"}, React.createElement("span", {onClick: this.add}, React.createElement("i", {className: "fa fa-plus fa-fw"}))))), React.createElement("tbody", null, React.createElement("tr", null, React.createElement("td", {className: "id"}, "1"), React.createElement("td", null, React.createElement("div", {className: "field field__input"}, React.createElement("div", {className: "field__input--container"}, React.createElement("input", {
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


},{}],15:[function(require,module,exports){
"use strict";
var sign = {
  componentDidMount: function() {
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
    canvas.width = window.outerWidth / 2 - 32;
    this.signaturePad.fromDataURL(oldData);
  },
  render: function() {
    var item = this.props.config.item;
    return (React.createElement("div", {
      className: "field sign",
      ref: "container"
    }, typeof item.label === 'undefined' ? '' : React.createElement(adapt.components.label, {
      config: {item: item},
      adapt: this.props.adapt
    }), React.createElement("div", {className: "sign__tip"}, "Enter signature below"), React.createElement("div", {
      className: "sign__clear",
      onClick: this.clearCanvas
    }, "Clear Signature", React.createElement("i", {className: "fa fa-times"})), React.createElement("canvas", {
      ref: "canvas",
      height: "200"
    }), typeof item.desc === 'undefined' ? '' : React.createElement(adapt.components.description, {
      config: {item: item},
      adapt: this.props.adapt
    })));
  }
};
adapt.component('sign', sign);

//# sourceMappingURL=<compileOutput>


},{}],16:[function(require,module,exports){
"use strict";
var $___46__46__47_stores_47_blocks__,
    $___46__46__47_actions_47_blocks__;
var store = ($___46__46__47_stores_47_blocks__ = require("../stores/blocks"), $___46__46__47_stores_47_blocks__ && $___46__46__47_stores_47_blocks__.__esModule && $___46__46__47_stores_47_blocks__ || {default: $___46__46__47_stores_47_blocks__}).default;
var actions = ($___46__46__47_actions_47_blocks__ = require("../actions/blocks"), $___46__46__47_actions_47_blocks__ && $___46__46__47_actions_47_blocks__.__esModule && $___46__46__47_actions_47_blocks__ || {default: $___46__46__47_actions_47_blocks__}).default;
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
    var obj = {
      test: 'hi',
      lol: []
    };
    return {
      open: -1,
      subtitleListeners: [],
      openBlocks: store.getOpen(),
      openDropdown: -1,
      visibleBlocks: store.getVisible()
    };
  },
  componentWillMount: function() {
    store.on('blockToggled', this.toggleBlockCallback);
    store.on('blockVisibility', this.toggleBlockVisibility);
    document.addEventListener('click', this.handleBodyClick);
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
    config.model[config.name].value.push(JSON.parse(JSON.stringify((config.model[config.name].value[accordionId]))));
    this.props.adapt.observe.digest();
    this.setState({openDropdown: -1});
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
    try {
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
        _this.state.subtitleListeners.map(function(listener) {
          listener();
        });
        _this.state.subtitleListeners = [];
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
          var subtitle;
          if (item.subtitle) {
            var REGEX_CURLY = /{([^}]+)}/g;
            subtitle = item.subtitle;
            subtitle = subtitle.replace(REGEX_CURLY, function(match) {
              if (match === '{index}') {
                return i + 1;
              }
              var possibleVariable = match.replace('{', '').replace('}', '');
              if (finalModel[possibleVariable]) {
                var index = i;
                _this.state.subtitleListeners.push(_this.props.adapt.observe.addListener(function() {
                  try {
                    return config.model[config.name].value[index][possibleVariable].value;
                  } catch (e) {
                    return '';
                  }
                }, function() {
                  _this.forceUpdate();
                }));
                return finalModel[possibleVariable].value;
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
          var dropdownClasses = cx({
            'spreadsheet__dropdown': true,
            'spreadsheet__dropdown--open': this.state.openDropdown === i
          });
          items.push(React.createElement("div", {className: "spreadsheet__item"}, React.createElement("div", {
            className: "spreadsheet__header",
            onClick: this.openAccordion.bind(this, i)
          }, React.createElement("h3", null, title), React.createElement("h4", null, subtitle, " ")), React.createElement("ul", {className: dropdownClasses}, React.createElement("li", {
            className: "spreadsheet__dropdown__item",
            onClick: this.duplicate.bind(this, i)
          }, React.createElement("i", {className: "fa fa-copy fa-fw spreadsheet__dropdown__icon"}), "Duplicate"), React.createElement("li", {
            className: "spreadsheet__dropdown__item spreadsheet__dropdown__item--delete",
            onClick: this.remove.bind(this, i)
          }, React.createElement("i", {className: "fa fa-times fa-fw spreadsheet__dropdown__icon"}), "Delete")), React.createElement("a", {
            className: "spreadsheet__item--remove no-select",
            onClick: this.openDropdown.bind(this, i)
          }, React.createElement("i", {className: "fa fa-chevron-down"})), React.createElement("div", {className: "spreadsheet__content"}, children)));
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
      for (var i in item.model) {
        if (item.model[i].type === 'blockheader') {
          labels.push(React.createElement("div", {className: 'spreadsheet__blockheader ' + (item.model[i].className || '')}, item.model[i].label));
        } else if (item.model[i].type === 'block') {
          var childItem = item.model[i].items;
          for (var t in childItem) {
            if (childItem[t].type === 'blockheader') {
              var classes = {'spreadsheet__blockheader': true};
              var className = childItem[t].className;
              var iconClasses;
              var onClickEvent = function() {};
              if (className) {
                classes[className] = true;
                classes['spreadsheet__blockheader--hidden'] = this.state.openBlocks.indexOf(i) === -1;
                iconClasses = '';
              } else {
                onClickEvent = this.toggleBlock.bind(this, i);
                iconClasses = cx({
                  'fa': true,
                  'fa-chevron-down': this.state.openBlocks.indexOf(i) > -1,
                  'fa-chevron-right': this.state.openBlocks.indexOf(i) === -1
                });
              }
              if (this.state.visibleBlocks.indexOf(i) > -1) {
                labels.push(React.createElement("div", {
                  className: cx(classes),
                  onClick: onClickEvent
                }, React.createElement("i", {className: iconClasses}), childItem[t].label));
              }
            } else {
              var classes = {'spreadsheet__field': true};
              classes['spreadsheet__blockheader--hidden'] = this.state.openBlocks.indexOf(i) === -1;
              labels.push(React.createElement("div", {className: cx(classes)}, childItem[t].label, React.createElement("div", {className: "spreadsheet__field--desc"}, childItem[t].desc)));
            }
          }
        } else {
          labels.push(React.createElement("div", {className: "spreadsheet__field"}, item.model[i].label, React.createElement("div", {className: "spreadsheet__field--desc"}, item.model[i].desc)));
        }
      }
      var data;
      if (model.length) {
        data = (React.createElement("div", {
          className: "spreadsheet__data",
          ref: "data"
        }, items));
      } else {
        data = (React.createElement("div", {className: "spreadsheet__empty"}, "Click \"Add Process\" to get started"));
      }
      return (React.createElement("div", {className: "spreadsheet clear"}, React.createElement("div", {
        className: "spreadsheet__titles",
        ref: "titles"
      }, React.createElement("div", {className: "spreadsheet__add no-select"}, React.createElement("div", {
        className: "spreadsheet__add--button",
        onClick: this.add
      }, React.createElement("i", {className: "fa fa-plus"}), React.createElement("h3", null, "Add Process"))), labels, React.createElement("div", {className: "spreadsheet__divider"})), data));
    } catch (e) {
      console.log(e);
    }
  }
};
adapt.component('spreadsheet', spreadsheet);

//# sourceMappingURL=<compileOutput>


},{"../actions/blocks":5,"../stores/blocks":48}],17:[function(require,module,exports){
"use strict";
var summary = {render: function() {
    var cx = React.addons.classSet;
    var items = this.props.adapt.model.items;
    var processes = items.processes.value;
    var phase = items.phase.value;
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
    return (React.createElement("div", {className: "summary"}, children));
  }};
adapt.component('summaryTab', summary);

//# sourceMappingURL=<compileOutput>


},{}],18:[function(require,module,exports){
"use strict";
var dispatcher = require('../flux/dispatcher');
module.exports = new dispatcher();

//# sourceMappingURL=<compileOutput>


},{"../flux/dispatcher":20}],19:[function(require,module,exports){
"use strict";
var $__router__,
    $__components_47_header_46_jsx__,
    $__components_47_sign_46_jsx__,
    $__components_47_sharedLoadingPlan_46_jsx__,
    $__components_47_buttonContainer_46_jsx__,
    $__components_47_button_46_jsx__,
    $__components_47_block_46_jsx__,
    $__components_47_overlay_46_jsx__,
    $__components_47_spreadsheet_46_jsx__,
    $__components_47_summary_46_jsx__,
    $__components_47_chart_46_jsx__,
    $__pages_47_index_46_jsx__;
var router = ($__router__ = require("./router"), $__router__ && $__router__.__esModule && $__router__ || {default: $__router__}).default;
var header = ($__components_47_header_46_jsx__ = require("./components/header.jsx"), $__components_47_header_46_jsx__ && $__components_47_header_46_jsx__.__esModule && $__components_47_header_46_jsx__ || {default: $__components_47_header_46_jsx__}).default;
var sign = ($__components_47_sign_46_jsx__ = require("./components/sign.jsx"), $__components_47_sign_46_jsx__ && $__components_47_sign_46_jsx__.__esModule && $__components_47_sign_46_jsx__ || {default: $__components_47_sign_46_jsx__}).default;
var sLP = ($__components_47_sharedLoadingPlan_46_jsx__ = require("./components/sharedLoadingPlan.jsx"), $__components_47_sharedLoadingPlan_46_jsx__ && $__components_47_sharedLoadingPlan_46_jsx__.__esModule && $__components_47_sharedLoadingPlan_46_jsx__ || {default: $__components_47_sharedLoadingPlan_46_jsx__}).default;
var buttonContainer = ($__components_47_buttonContainer_46_jsx__ = require("./components/buttonContainer.jsx"), $__components_47_buttonContainer_46_jsx__ && $__components_47_buttonContainer_46_jsx__.__esModule && $__components_47_buttonContainer_46_jsx__ || {default: $__components_47_buttonContainer_46_jsx__}).default;
var button = ($__components_47_button_46_jsx__ = require("./components/button.jsx"), $__components_47_button_46_jsx__ && $__components_47_button_46_jsx__.__esModule && $__components_47_button_46_jsx__ || {default: $__components_47_button_46_jsx__}).default;
var block = ($__components_47_block_46_jsx__ = require("./components/block.jsx"), $__components_47_block_46_jsx__ && $__components_47_block_46_jsx__.__esModule && $__components_47_block_46_jsx__ || {default: $__components_47_block_46_jsx__}).default;
var overlay = ($__components_47_overlay_46_jsx__ = require("./components/overlay.jsx"), $__components_47_overlay_46_jsx__ && $__components_47_overlay_46_jsx__.__esModule && $__components_47_overlay_46_jsx__ || {default: $__components_47_overlay_46_jsx__}).default;
var spreadsheet = ($__components_47_spreadsheet_46_jsx__ = require("./components/spreadsheet.jsx"), $__components_47_spreadsheet_46_jsx__ && $__components_47_spreadsheet_46_jsx__.__esModule && $__components_47_spreadsheet_46_jsx__ || {default: $__components_47_spreadsheet_46_jsx__}).default;
var summary = ($__components_47_summary_46_jsx__ = require("./components/summary.jsx"), $__components_47_summary_46_jsx__ && $__components_47_summary_46_jsx__.__esModule && $__components_47_summary_46_jsx__ || {default: $__components_47_summary_46_jsx__}).default;
var chart = ($__components_47_chart_46_jsx__ = require("./components/chart.jsx"), $__components_47_chart_46_jsx__ && $__components_47_chart_46_jsx__.__esModule && $__components_47_chart_46_jsx__ || {default: $__components_47_chart_46_jsx__}).default;
var index = ($__pages_47_index_46_jsx__ = require("./pages/index.jsx"), $__pages_47_index_46_jsx__ && $__pages_47_index_46_jsx__.__esModule && $__pages_47_index_46_jsx__ || {default: $__pages_47_index_46_jsx__}).default;
React.renderComponent(index(null), document.body);

//# sourceMappingURL=<compileOutput>


},{"./components/block.jsx":8,"./components/button.jsx":9,"./components/buttonContainer.jsx":10,"./components/chart.jsx":11,"./components/header.jsx":12,"./components/overlay.jsx":13,"./components/sharedLoadingPlan.jsx":14,"./components/sign.jsx":15,"./components/spreadsheet.jsx":16,"./components/summary.jsx":17,"./pages/index.jsx":32,"./router":39}],20:[function(require,module,exports){
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
    console.log('dispatching', name);
    _preDispatch(name, data);
    _dispatch();
    console.log('not dispatching', name);
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


},{"./utils":23}],21:[function(require,module,exports){
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
  self.removeListener = function(name, callback) {
    if (!self.hasListener(name, callback)) {
      return false;
    }
    _listeners[name] = _listeners[name].filter(function(cb) {
      return cb !== callback;
    });
    if (!_listeners[name].length) {
      delete _listeners[name];
    }
    return true;
  };
}
module.exports = Emitter;

//# sourceMappingURL=<compileOutput>


},{}],22:[function(require,module,exports){
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
    console.log('hi unbind', callback);
    return _emitter.removeListener(name, callback);
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


},{"./emitter":21,"./utils":23}],23:[function(require,module,exports){
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


},{}],24:[function(require,module,exports){
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
      phase: {
        "padding": "10px 15px",
        title: 'Phase Information',
        items: {
          col: {
            type: 'column',
            span: 2,
            items: [{phase: {
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
                }, {
                  value: 'capacityConfirmation',
                  label: 'Capacity Confirmation'
                }]
              }}, {ppapLevel: {
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
              }}]
          },
          reason: {
            type: 'textarea',
            label: 'Reason for submission'
          }
        }
      },
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
            items: {
              supplierName: {
                label: 'Name',
                type: 'input',
                placeholder: 'Supplier Name'
              },
              address: {
                label: 'Address',
                type: 'input',
                placeholder: 'Supplier Address'
              },
              county: {
                label: 'County/State/Region',
                type: 'input',
                placeholder: 'Supplier County/State/Region'
              },
              country: {
                label: 'Country',
                type: 'input',
                placeholder: 'Supplier Country'
              },
              city: {
                label: 'City',
                type: 'input',
                placeholder: 'Supplier City'
              },
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
          headerKey: {
            type: 'header:h4',
            text: 'Key Contact Details'
          },
          col2: {
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
              },
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
      part: {
        "padding": "10px 15px",
        title: 'Part Information',
        items: {
          col: {
            type: 'column:rows',
            span: 2,
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
              }
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
          studySupplierFor: {
            type: 'radio',
            label: 'Study Supplied For',
            options: {
              single: 'Single Part / Single Suffix',
              multi: 'Multiple Part / Listed Suffixes',
              multiAll: 'Multiple Part / All Suffixes',
              complex: 'Complex Comodity'
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
              },
              suffix: {
                type: 'input',
                label: 'Suffix'
              }
            }
          },
          complexCommodityCol: {
            type: 'column:rows',
            span: [1],
            items: {}
          },
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
          volumeTotal: {
            type: 'input',
            label: 'Volume Total'
          },
          otherProgrammeVolume: {
            type: 'header:h4',
            text: 'Other Programme(s) Volume Information'
          },
          otherStudySubmittedFor: {
            type: 'checkbox',
            label: 'Other Programmes Same Parts Supplied To',
            includeNA: true,
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
          otherVolumeTotals: {
            type: 'column:rows',
            span: 4,
            items: {}
          },
          otherVolumeTotal: {
            type: 'input',
            label: 'Other Volume Total'
          },
          "totalRequiredDemand": {
            "type": "input",
            "label": "Total Demand of Study Submitted For"
          }
        }
      },
      "processes": {
        "title": "Manufacturing Processes",
        "items": {"processes": {
            "type": "spreadsheet",
            "title": "Process {index}",
            "subtitle": "{desc}",
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
                    "label": "Planned Operating Pattern & Net Available Time"
                  },
                  "daysPerWeek": {
                    "type": "input",
                    "label": "Days / Week"
                  },
                  "shiftsPerDay": {
                    "type": "input",
                    "label": "Shifts / Day"
                  },
                  "hoursPerShift": {
                    "type": "input",
                    "label": "Hours / Shift"
                  },
                  "personalBreaks": {
                    "type": "input",
                    "label": "Personal Breaks"
                  },
                  "plannedMaintenance": {
                    "type": "input",
                    "label": "Planned Maintenance"
                  },
                  "inspectionOfFacilities": {
                    "type": "input",
                    "label": "Inspection of Facilities"
                  },
                  "plannedChangeoverFrequency": {
                    "type": "input",
                    "label": "Planned Changeover Frequency",
                    "desc": "(per week)"
                  },
                  "plannedMinutesPerChangeover": {
                    "type": "input",
                    "label": "Planned Minutes per Changeover",
                    "desc": "(into this part number)"
                  },
                  "totalPlannedDowntime": {
                    "type": "input",
                    "label": "Total Planned Downtime",
                    "desc": "(per week, inc breaks, etc)"
                  },
                  "allocationPercentage": {
                    "type": "input",
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
                            "type": "input",
                            "label": "Req'd Good Parts / Week"
                          },
                          "reqProdHoursPerWeek": {
                            "type": "input",
                            "label": "Req'd Prod Hours / Week"
                          },
                          "requiredAllocationByPart": {
                            "type": "input",
                            "label": "Required % Allocation by Part"
                          }
                        }
                      },
                      "percentageNetAvailTime": {
                        "type": "input",
                        "label": "Percentage of Net Available Time not utilized for production (%) {PM, etc.}"
                      },
                      "totalPercentageAllocation": {
                        "type": "input",
                        "label": "Total % Allocation"
                      }
                    }
                  },
                  "netAvailableTime": {
                    "type": "input",
                    "label": "Net Available Time"
                  },
                  "requiredGoodPartsHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Required Good Parts / Week"
                  },
                  "percentageOfPartsRejected": {
                    "type": "input",
                    "label": "Percentage of Parts Rejected",
                    "desc": "(inc scrap & rework)"
                  },
                  "requiredGoodPartsPerWeek": {
                    "type": "input",
                    "label": "Required Good Parts Per Week/Hour",
                    "desc": "To support this process"
                  },
                  "percentOfPartsReworked": {
                    "type": "input",
                    "label": "Percentage of Parts Reworked",
                    "desc": "(re-run through process"
                  },
                  "plannedCycleTimeHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Planned Cycle Time / Capacity"
                  },
                  "idealPlannedCycleTime": {
                    "type": "input",
                    "label": "Ideal Planned Cycle Time",
                    "desc": "Per tool or machine (sec/cycle)"
                  },
                  "numberOfToolsParallel": {
                    "type": "input",
                    "label": "Number of Tools or Machines in Parallel"
                  },
                  "identicalPartsPerCycle": {
                    "type": "input",
                    "label": "Number of Identical Parts Produced",
                    "desc": "Per Tool/Machine Per Cycle"
                  },
                  "netIdealCycleTime": {
                    "type": "input",
                    "label": "Net Ideal Cycle Time per Part",
                    "desc": "(sec/part)"
                  },
                  "plannedProductionPerWeek": {
                    "type": "input",
                    "label": "Planned Production Per Week"
                  },
                  "requiredOEE": {
                    "type": "input",
                    "label": "Required OEE"
                  },
                  "plannedProductionPerDay": {
                    "type": "input",
                    "label": "Planned Production Per Day"
                  },
                  "plannedProductionPerHour": {
                    "type": "input",
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
                    "type": "input",
                    "label": "Shared Process Allocation %"
                  },
                  "phase0equipmentHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Equipment Availability"
                  },
                  "phase0totalDurationOfProductionRun": {
                    "type": "input",
                    "label": "Total Duration of Production Run",
                    "desc": "(minutes)"
                  },
                  "phase0equipTotalPlannedDowntime": {
                    "type": "input",
                    "label": "Total Planned Downtime",
                    "desc": "(in minutes) (inc breaks, etc)"
                  },
                  "phase0equipNetAvailableTime": {
                    "type": "input",
                    "label": "Net Available Time",
                    "desc": "(minutes)"
                  },
                  "phase0sharedEquipChangeover": {
                    "type": "input",
                    "label": "Shared Equipment Changeover Time",
                    "desc": "(minutes)"
                  },
                  "phase0totalUnplannedDowntime": {
                    "type": "input",
                    "label": "Total Unplanned Downtime",
                    "desc": "(mins)"
                  },
                  "phase0actualProductionTime": {
                    "type": "input",
                    "label": "Actual Production Time",
                    "desc": "(minutes)"
                  },
                  "phase0equipmentAvailability": {
                    "type": "input",
                    "label": "Equipment Availability %"
                  },
                  "phase0performanceHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Performance Efficiency"
                  },
                  "phase0totalPartsRun": {
                    "type": "input",
                    "label": "Total Parts Run",
                    "desc": "(Good, Rejected)"
                  },
                  "phase0perfNetIdealCycleTime": {
                    "type": "input",
                    "label": "Net Ideal Cycle Time",
                    "desc": "(seconds/part)"
                  },
                  "phase0performanceEfficiency": {
                    "type": "input",
                    "label": "Performance Efficiency %"
                  },
                  "phase0availabilityAndPELossesNotCaptured": {
                    "type": "input",
                    "label": "Availability and/or Perf Efficiency Losses",
                    "desc": "Not Captured (minutes)"
                  },
                  "phase0qualityRateHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Quality Rate"
                  },
                  "phase0numberOfPartsRejected": {
                    "type": "input",
                    "label": "Number of Parts Rejected"
                  },
                  "phase0numberOfPartsReworked": {
                    "type": "input",
                    "label": "Number of Parts Reworked & Accepted"
                  },
                  "phase0rightFirstTime": {
                    "type": "input",
                    "label": "Right First Time Quality Rate %",
                    "desc": "(inc. reworked parts)"
                  },
                  "phase0firstTimeThrough": {
                    "type": "input",
                    "label": "First Time Through Quality Rate %"
                  },
                  "phase0oeeHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Overal Equipment Effectiveness (OEE)"
                  },
                  "phase0oee": {
                    "type": "input",
                    "label": "OEE %"
                  },
                  "phase0weeklyHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Weekly or Hourly Parts Avail for Shipment"
                  },
                  "phase0processSpecificWeek": {
                    "type": "input",
                    "label": "Process Specific Weekly Part Estimate"
                  },
                  "phase0processSpecificHour": {
                    "type": "input",
                    "label": "Process Specific Estimate Per Hour"
                  },
                  "phase0processSpecificDay": {
                    "type": "input",
                    "label": "Process Specific Estimate Per Day"
                  },
                  "phase0processHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Process Total Actual Cycle Time (sec/part)"
                  },
                  "phase0observedCycleTime": {
                    "type": "input",
                    "label": "Observed Average Cycle Time",
                    "desc": "(sec/cycle)"
                  },
                  "phase0analysisHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Analysis of Run @ Rate"
                  },
                  "phase0jlrDemand": {
                    "type": "input",
                    "label": "JLR Demand"
                  },
                  "phase0partsAvailableForShipment": {
                    "type": "input",
                    "label": "Weekly Parts Available for Shipment"
                  },
                  "phase0percentageJLRDemand": {
                    "type": "input",
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
                    "type": "input",
                    "label": "Shared Process Allocation %"
                  },
                  "phase3equipmentHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Equipment Availability"
                  },
                  "phase3totalDurationOfProductionRun": {
                    "type": "input",
                    "label": "Total Duration of Production Run",
                    "desc": "(minutes)"
                  },
                  "phase3equipTotalPlannedDowntime": {
                    "type": "input",
                    "label": "Total Planned Downtime",
                    "desc": "(in minutes) (inc breaks, etc)"
                  },
                  "phase3equipNetAvailableTime": {
                    "type": "input",
                    "label": "Net Available Time",
                    "desc": "(minutes)"
                  },
                  "phase3sharedEquipChangeover": {
                    "type": "input",
                    "label": "Shared Equipment Changeover Time",
                    "desc": "(minutes)"
                  },
                  "phase3totalUnplannedDowntime": {
                    "type": "input",
                    "label": "Total Unplanned Downtime",
                    "desc": "(mins)"
                  },
                  "phase3actualProductionTime": {
                    "type": "input",
                    "label": "Actual Production Time",
                    "desc": "(minutes)"
                  },
                  "phase3equipmentAvailability": {
                    "type": "input",
                    "label": "Equipment Availability %"
                  },
                  "phase3performanceHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Performance Efficiency"
                  },
                  "phase3totalPartsRun": {
                    "type": "input",
                    "label": "Total Parts Run",
                    "desc": "(Good, Rejected)"
                  },
                  "phase3perfNetIdealCycleTime": {
                    "type": "input",
                    "label": "Net Ideal Cycle Time",
                    "desc": "(seconds/part)"
                  },
                  "phase3performanceEfficiency": {
                    "type": "input",
                    "label": "Performance Efficiency %"
                  },
                  "phase3qualityRateHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Quality Rate"
                  },
                  "phase3numberOfPartsRejected": {
                    "type": "input",
                    "label": "Number of Parts Rejected"
                  },
                  "phase3numberOfPartsReworked": {
                    "type": "input",
                    "label": "Number of Parts Reworked & Accepted"
                  },
                  "phase3rightFirstTime": {
                    "type": "input",
                    "label": "Right First Time Quality Rate %",
                    "desc": "(inc. reworked parts)"
                  },
                  "phase3firstTimeThrough": {
                    "type": "input",
                    "label": "First Time Through Quality Rate %"
                  },
                  "phase3oeeHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Overal Equipment Effectiveness (OEE)"
                  },
                  "phase3oee": {
                    "type": "input",
                    "label": "OEE %"
                  },
                  "phase3weeklyHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Weekly or Hourly Parts Avail for Shipment"
                  },
                  "phase3processSpecificWeek": {
                    "type": "input",
                    "label": "Process Specific Weekly Part Estimate"
                  },
                  "phase3processSpecificHour": {
                    "type": "input",
                    "label": "Process Specific Estimate Per Hour"
                  },
                  "phase3processSpecificDay": {
                    "type": "input",
                    "label": "Process Specific Estimate Per Day"
                  },
                  "phase3processHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Process Total Actual Cycle Time (sec/part)"
                  },
                  "phase3observedCycleTime": {
                    "type": "input",
                    "label": "Observed Average Cycle Time",
                    "desc": "(sec/cycle)"
                  },
                  "phase3analysisHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Analysis of Run @ Rate"
                  },
                  "phase3jlrDemand": {
                    "type": "input",
                    "label": "JLR Demand"
                  },
                  "phase3partsAvailableForShipment": {
                    "type": "input",
                    "label": "Weekly Parts Available for Shipment"
                  },
                  "phase3percentageJLRDemand": {
                    "type": "input",
                    "label": "Percentage Above/Below JLR Demand"
                  }
                }
              },
              "capacityConfirmation": {
                "type": "block",
                "items": {
                  "capConfHeader": {
                    "type": "blockheader",
                    "label": "Capacity Confirmation"
                  },
                  "capConfproductionRunHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Supplier Demonstrated - Production Run"
                  },
                  "capConfsharedProcessAllocation": {
                    "type": "input",
                    "label": "Shared Process Allocation %"
                  },
                  "capConfequipmentHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Equipment Availability"
                  },
                  "capConftotalDurationOfProductionRun": {
                    "type": "input",
                    "label": "Total Duration of Production Run",
                    "desc": "(minutes)"
                  },
                  "capConfequipTotalPlannedDowntime": {
                    "type": "input",
                    "label": "Total Planned Downtime",
                    "desc": "(in minutes) (inc breaks, etc)"
                  },
                  "capConfequipNetAvailableTime": {
                    "type": "input",
                    "label": "Net Available Time",
                    "desc": "(minutes)"
                  },
                  "capConfsharedEquipChangeover": {
                    "type": "input",
                    "label": "Shared Equipment Changeover Time",
                    "desc": "(minutes)"
                  },
                  "capConftotalUnplannedDowntime": {
                    "type": "input",
                    "label": "Total Unplanned Downtime",
                    "desc": "(mins)"
                  },
                  "capConfactualProductionTime": {
                    "type": "input",
                    "label": "Actual Production Time",
                    "desc": "(minutes)"
                  },
                  "capConfequipmentAvailability": {
                    "type": "input",
                    "label": "Equipment Availability %"
                  },
                  "capConfperformanceHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Performance Efficiency"
                  },
                  "capConftotalPartsRun": {
                    "type": "input",
                    "label": "Total Parts Run",
                    "desc": "(Good, Rejected)"
                  },
                  "capConfperfNetIdealCycleTime": {
                    "type": "input",
                    "label": "Net Ideal Cycle Time",
                    "desc": "(seconds/part)"
                  },
                  "capConfperformanceEfficiency": {
                    "type": "input",
                    "label": "Performance Efficiency %"
                  },
                  "capConfqualityRateHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Quality Rate"
                  },
                  "capConfnumberOfPartsRejected": {
                    "type": "input",
                    "label": "Number of Parts Rejected"
                  },
                  "capConfnumberOfPartsReworked": {
                    "type": "input",
                    "label": "Number of Parts Reworked & Accepted"
                  },
                  "capConfrightFirstTime": {
                    "type": "input",
                    "label": "Right First Time Quality Rate %",
                    "desc": "(inc. reworked parts)"
                  },
                  "capConffirstTimeThrough": {
                    "type": "input",
                    "label": "First Time Through Quality Rate %"
                  },
                  "capConfoeeHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Overal Equipment Effectiveness (OEE)"
                  },
                  "capConfoee": {
                    "type": "input",
                    "label": "OEE %"
                  },
                  "capConfweeklyHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Weekly or Hourly Parts Avail for Shipment"
                  },
                  "capConfprocessSpecificWeek": {
                    "type": "input",
                    "label": "Process Specific Weekly Part Estimate"
                  },
                  "capConfprocessSpecificHour": {
                    "type": "input",
                    "label": "Process Specific Estimate Per Hour"
                  },
                  "capConfprocessSpecificDay": {
                    "type": "input",
                    "label": "Process Specific Estimate Per Day"
                  },
                  "capConfprocessHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Process Total Actual Cycle Time (sec/part)"
                  },
                  "capConfobservedCycleTime": {
                    "type": "input",
                    "label": "Observed Average Cycle Time",
                    "desc": "(sec/cycle)"
                  },
                  "capConfanalysisHeader": {
                    "type": "blockheader",
                    "className": "subheader",
                    "label": "Analysis of Run @ Rate"
                  },
                  "capConfjlrDemand": {
                    "type": "input",
                    "label": "JLR Demand"
                  },
                  "capConfpartsAvailableForShipment": {
                    "type": "input",
                    "label": "Weekly Parts Available for Shipment"
                  },
                  "capConfpercentageJLRDemand": {
                    "type": "input",
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
          "col": {
            "type": "column",
            "span": 2,
            "items": [{"signature": {
                "type": "sign",
                "label": "Decleration",
                "desc": "I hereby confirm that I have the right and authority to fill in this document on behalf of the supplier company mentioned above. The information I have given is true and accurate to the best of my knowledge. Sub Tier Components: In addition to the data contained in the report, the Supplier Authorised Representative approval confirms that all sub-tier components used in the assembly of these components are also approved to the relevant Production Run i.e. Run at Rate (Phase 0) or Capacity Confirmation"
              }}, {}]
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


},{}],25:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var controller = {
  volumeTotal: {disabled: true},
  otherVolumeTotal: {disabled: true},
  processes: {
    totalPlannedDowntime: {disabled: true},
    netAvailableTime: {disabled: true},
    requiredGoodPartsPerWeek: {disabled: true},
    netIdealCycleTime: {disabled: true},
    plannedProductionPerWeek: {disabled: true},
    requiredOEE: {disabled: true},
    plannedProductionPerHour: {disabled: true},
    plannedProductionPerDay: {disabled: true},
    phase0equipNetAvailableTime: {disabled: true},
    phase3equipNetAvailableTime: {disabled: true},
    capConfequipNetAvailableTime: {disabled: true},
    phase0actualProductionTime: {disabled: true},
    phase3actualProductionTime: {disabled: true},
    capConfactualProductionTime: {disabled: true},
    totalPercentageAllocation: {disabled: true},
    phase0equipmentAvailability: {disabled: true},
    phase3equipmentAvailability: {disabled: true},
    capConfequipmentAvailability: {disabled: true},
    phase0performanceEfficiency: {disabled: true},
    phase3performanceEfficiency: {disabled: true},
    capConfperformanceEfficiency: {disabled: true},
    phase0availabilityAndPELossesNotCaptured: {disabled: true},
    phase3availabilityAndPELossesNotCaptured: {disabled: true},
    capConfavailabilityAndPELossesNotCaptured: {disabled: true},
    phase0rightFirstTime: {disabled: true},
    phase3rightFirstTime: {disabled: true},
    capConfrightFirstTime: {disabled: true},
    phase0firstTimeThrough: {disabled: true},
    phase3firstTimeThrough: {disabled: true},
    capConffirstTimeThrough: {disabled: true},
    phase0oee: {disabled: true},
    phase3oee: {disabled: true},
    capConfoee: {disabled: true},
    phase0processSpecificWeek: {disabled: true},
    phase3processSpecificWeek: {disabled: true},
    capConfprocessSpecificWeek: {disabled: true},
    phase0processSpecificHour: {disabled: true},
    phase3processSpecificHour: {disabled: true},
    capConfprocessSpecificHour: {disabled: true},
    phase0processSpecificDay: {disabled: true},
    phase3processSpecificDay: {disabled: true},
    capConfprocessSpecificDay: {disabled: true},
    phase0observedCycleTime: {disabled: true},
    phase3observedCycleTime: {disabled: true},
    capConfobservedCycleTime: {disabled: true},
    phase0jlrDemand: {disabled: true},
    phase3jlrDemand: {disabled: true},
    capConfjlrDemand: {disabled: true},
    phase0partsAvailableForShipment: {disabled: true},
    phase3partsAvailableForShipment: {disabled: true},
    capConfpartsAvailableForShipment: {disabled: true},
    phase0percentageJLRDemand: {disabled: true},
    phase3percentageJLRDemand: {disabled: true},
    capConfpercentageJLRDemand: {disabled: true}
  }
};
var $__default = controller;

//# sourceMappingURL=<compileOutput>


},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_actions_47_blocks__,
    $___46__46__47_router_47_stores_47_router__,
    $___46__46__47_actions_47_alert__;
var blocksActions = ($___46__46__47_actions_47_blocks__ = require("../actions/blocks"), $___46__46__47_actions_47_blocks__ && $___46__46__47_actions_47_blocks__.__esModule && $___46__46__47_actions_47_blocks__ || {default: $___46__46__47_actions_47_blocks__}).default;
var routerStore = ($___46__46__47_router_47_stores_47_router__ = require("../router/stores/router"), $___46__46__47_router_47_stores_47_router__ && $___46__46__47_router_47_stores_47_router__.__esModule && $___46__46__47_router_47_stores_47_router__ || {default: $___46__46__47_router_47_stores_47_router__}).default;
var alert = ($___46__46__47_actions_47_alert__ = require("../actions/alert"), $___46__46__47_actions_47_alert__ && $___46__46__47_actions_47_alert__.__esModule && $___46__46__47_actions_47_alert__ || {default: $___46__46__47_actions_47_alert__}).default;
var listeners = function(form) {
  var model = form.model;
  var view = form.view;
  var parts = ["l359", "l319", "l316", "l538", "l550", "l450", "l460", "l494", "l462", "x760", "x260", "x150", "x152", "x250", "x351"];
  model.find('volumeTotal').setValue(function() {
    var total = 0;
    parts.forEach(function(element) {
      var modelValue = model.find(element);
      if (modelValue[0]) {
        total += modelValue[0].value * 1;
      }
    });
    return total;
  });
  model.find('otherVolumeTotal').setValue(function() {
    var total = 0;
    parts.forEach(function(element) {
      var modelValue = model.find('other' + element);
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
      var itemsView = view.find('tabs.part.otherVolumeTotals')[0];
      if (itemsView.items['other' + element]) {
        itemsView.items['other' + element].label = element + period + ' Volume';
      }
    });
  });
  model.find('studySubmittedFor').observe(function(newVal, oldVal, diff) {
    var suffix = view.find('tabs.part.volumeTotals');
    var sequenced = model.find('partType')[0];
    if (diff) {
      diff.forEach(function(element) {
        if (element.action === 'removed') {
          suffix.destroy(element.value);
        } else {
          var label = element.value;
          if (sequenced.value) {
            label += {
              sequenced: ' Hourly',
              non: ' Weekly'
            }[sequenced.value];
          }
          label += ' Volume';
          suffix.append(element.value, {
            type: 'input',
            label: label
          });
        }
      });
    }
  });
  model.find('otherStudySubmittedFor').observe(function(newVal, oldVal, diff) {
    var suffix = view.find('tabs.part.otherVolumeTotals');
    console.log(suffix, diff);
    var sequenced = model.find('partType')[0];
    if (diff) {
      diff.forEach(function(element) {
        if (element.action === 'removed') {
          suffix.destroy('other' + element.value);
        } else {
          var label = element.value;
          if (sequenced.value) {
            label += {
              sequenced: ' Hourly',
              non: ' Weekly'
            }[sequenced.value];
          }
          label += ' Volume';
          suffix.append('other' + element.value, {
            type: 'input',
            label: label
          });
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
        });
        directedCol.append('directedGSDB', {
          type: 'input',
          label: 'Directed to Supplier GSDB code'
        });
      },
      no: function() {
        directedCol.destroy('directedName');
        directedCol.destroy('directedGSDB');
      }
    };
    (responses[newVal] || function() {})();
  });
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
        }, prefix);
        nameCol.append('base', {
          type: 'input',
          label: 'Base'
        }, base);
        nameCol.append('suffix', {
          type: 'table:simple',
          model: {suffix: {
              type: 'input',
              label: 'Suffix'
            }}
        }, [{'suffix': {}}]);
      },
      single: function() {
        if (oldVal === 'multi') {
          nameCol.destroy('suffix');
        }
        nameCol.append('prefix', {
          type: 'input',
          label: 'Prefix'
        }, prefix);
        nameCol.append('base', {
          type: 'input',
          label: 'Base'
        }, base);
        if (oldVal != '') {
          suffix = '';
        }
        nameCol.append('suffix', {
          type: 'input',
          label: 'Suffix'
        }, suffix);
      },
      multiAll: function() {
        if (oldVal === 'multi') {
          nameCol.destroy('suffix');
        }
        nameCol.append('prefix', {
          type: 'input',
          label: 'Prefix'
        }, prefix);
        nameCol.append('base', {
          type: 'input',
          label: 'Base'
        }, base);
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
        });
      }
    };
    (handle[newVal] || function() {})();
  });
  model.find('processes.totalPlannedDowntime').setValue(function(newVAl) {
    var JLRF = parseFloat(this.personalBreaks.value);
    var JLRG = parseFloat(this.plannedMaintenance.value);
    var JLRC = parseFloat(this.daysPerWeek.value);
    var JLRD = parseFloat(this.shiftsPerDay.value);
    var JLRI = parseFloat(this.plannedChangeoverFrequency.value);
    var JLRJ = parseFloat(this.plannedMinutesPerChangeover.value);
    var JLRH = parseFloat(this.inspectionOfFacilities.value);
    var result = (JLRF + JLRG) * JLRC * JLRD + (JLRI * JLRJ) + JLRH;
    return isNaN(result) ? '' : result;
  });
  model.find('processes.netAvailableTime').setValue(function() {
    var JLRC = parseFloat(this.daysPerWeek.value);
    var JLRD = parseFloat(this.shiftsPerDay.value);
    var JLRE = parseFloat(this.hoursPerShift.value);
    var JLRK = parseFloat(this.totalPlannedDowntime.value);
    var JLRL = parseFloat(this.allocationPercentage.value);
    var result = ((((JLRC * JLRD * JLRE) - (JLRK / 60)) * JLRL) / 100).toFixed(2);
    return isNaN(result) ? '' : result;
  });
  model.find('processes.requiredGoodPartsPerWeek').setValue(function() {
    var JLRA = parseFloat(model.find('totalRequiredDemand')[0].value);
    var JLRN = parseFloat(this.percentageOfPartsRejected.value);
    var result = Math.ceil(JLRA * 100 / (100 - JLRN));
    return isNaN(result) ? '' : result;
  });
  model.find('processes.netIdealCycleTime').setValue(function() {
    var JLRQ = parseFloat(this.idealPlannedCycleTime.value);
    var JLRR = parseFloat(this.numberOfToolsParallel.value);
    var JLRS = parseFloat(this.identicalPartsPerCycle.value);
    var result = (JLRQ / (JLRR * JLRS)).toFixed(2);
    return isNaN(result) ? '' : result;
  });
  model.find('processes.plannedProductionPerWeek').setValue(function() {
    var JLRE = parseFloat(this.hoursPerShift.value);
    var JLRF = parseFloat(this.personalBreaks.value);
    var JLRG = parseFloat(this.plannedMaintenance.value);
    var JLRH = parseFloat(this.inspectionOfFacilities.value);
    var JLRC = parseFloat(this.daysPerWeek.value);
    var JLRD = parseFloat(this.shiftsPerDay.value);
    var JLRI = parseFloat(this.plannedChangeoverFrequency.value);
    var JLRJ = parseFloat(this.plannedMinutesPerChangeover.value);
    var JLRL = parseFloat(this.allocationPercentage.value);
    var JLRT = parseFloat(this.netIdealCycleTime.value);
    var result = Math.floor(((60 * JLRE) - (JLRF + JLRG) - (JLRH / JLRC / JLRD) - (JLRI * JLRJ / JLRC / JLRD)) * JLRC * JLRD * JLRL / 100 * 60 / JLRT);
    return isNaN(result) ? '' : result;
  });
  model.find('processes.requiredOEE').setValue(function() {
    var JLRP = parseFloat(this.requiredGoodPartsPerWeek.value);
    var JLRU = parseFloat(this.plannedProductionPerWeek.value);
    var result = ((JLRP / JLRU) * 100).toFixed(2);
    return isNaN(result) ? '' : result;
  });
  model.find('processes.plannedProductionPerHour').setValue(function() {
    var JLRF = parseFloat(this.personalBreaks.value);
    var JLRE = parseFloat(this.hoursPerShift.value);
    var JLRG = parseFloat(this.plannedMaintenance.value);
    var JLRH = parseFloat(this.inspectionOfFacilities.value);
    var JLRC = parseFloat(this.daysPerWeek.value);
    var JLRD = parseFloat(this.shiftsPerDay.value);
    var JLRI = parseFloat(this.plannedChangeoverFrequency.value);
    var JLRJ = parseFloat(this.plannedMinutesPerChangeover.value);
    var JLRL = parseFloat(this.allocationPercentage.value);
    var JLRT = parseFloat(this.netIdealCycleTime.value);
    var result = Math.floor(((60 - (JLRF / JLRE) - (JLRG / JLRE) - (JLRH / JLRC / JLRD / JLRE) - (JLRI * JLRJ / JLRC / JLRD / JLRE)) * JLRL / 100 * 60 / JLRT));
    return isNaN(result) ? '' : result;
  });
  model.find('processes.plannedProductionPerDay').setValue(function() {
    var JLRF = parseFloat(this.personalBreaks.value);
    var JLRE = parseFloat(this.hoursPerShift.value);
    var JLRG = parseFloat(this.plannedMaintenance.value);
    var JLRH = parseFloat(this.inspectionOfFacilities.value);
    var JLRC = parseFloat(this.daysPerWeek.value);
    var JLRD = parseFloat(this.shiftsPerDay.value);
    var JLRI = parseFloat(this.plannedChangeoverFrequency.value);
    var JLRJ = parseFloat(this.plannedMinutesPerChangeover.value);
    var JLRL = parseFloat(this.allocationPercentage.value);
    var JLRT = parseFloat(this.netIdealCycleTime.value);
    var result = Math.floor(((60 * JLRE) - (JLRF + JLRG) - (JLRH / JLRC / JLRD) - (JLRI * JLRJ / JLRC / JLRD)) * JLRD * JLRL / 100 * 60 / JLRT);
    return isNaN(result) ? '' : result;
  });
  function equipNetAvailableTime(phase) {
    return function() {
      var JLRAD = parseFloat(this[phase + 'totalDurationOfProductionRun'].value);
      var JLRAE = parseFloat(this[phase + 'equipTotalPlannedDowntime'].value);
      var result = JLRAD - JLRAE;
      return isNaN(result) ? '' : result;
    };
  }
  model.find('processes.phase0equipNetAvailableTime').setValue(equipNetAvailableTime('phase0'));
  model.find('processes.phase3equipNetAvailableTime').setValue(equipNetAvailableTime('phase3'));
  model.find('processes.capConfequipNetAvailableTime').setValue(equipNetAvailableTime('capConf'));
  function actualProductionTime(phase) {
    return function() {
      var JLRAF = parseFloat(this[phase + 'equipNetAvailableTime'].value);
      var JLRAG = parseFloat(this[phase + 'sharedEquipChangeover'].value);
      var JLRAI = parseFloat(this[phase + 'totalUnplannedDowntime'].value);
      var result = JLRAF - JLRAG - JLRAI;
      return isNaN(result) ? '' : result;
    };
  }
  model.find('processes.phase0actualProductionTime').setValue(actualProductionTime('phase0'));
  model.find('processes.phase3actualProductionTime').setValue(actualProductionTime('phase3'));
  model.find('processes.capConfactualProductionTime').setValue(actualProductionTime('capConf'));
  function equipmentAvailability(phase) {
    return function() {
      var JLRAJ = parseFloat(this[phase + 'actualProductionTime'].value);
      var JLRAF = parseFloat(this[phase + 'equipNetAvailableTime'].value);
      var result = ((JLRAJ / JLRAF) * 100).toFixed(2);
      return isNaN(result) ? '' : result;
    };
  }
  model.find('processes.phase0equipmentAvailability').setValue(equipmentAvailability('phase0'));
  model.find('processes.phase3equipmentAvailability').setValue(equipmentAvailability('phase3'));
  model.find('processes.capConfequipmentAvailability').setValue(equipmentAvailability('capConf'));
  function performanceEfficiency(phase) {
    return function() {
      var JLRAM = parseFloat(this[phase + 'totalPartsRun'].value);
      var JLRAN = parseFloat(this[phase + 'perfNetIdealCycleTime'].value);
      var JLRAJ = parseFloat(this[phase + 'actualProductionTime'].value);
      var result = ((JLRAM * JLRAN / (JLRAJ * 60)) * 100).toFixed(2);
      return isNaN(result) ? '' : result;
    };
  }
  model.find('processes.phase0performanceEfficiency').setValue(performanceEfficiency('phase0'));
  model.find('processes.phase3performanceEfficiency').setValue(performanceEfficiency('phase3'));
  model.find('processes.capConfperformanceEfficiency').setValue(performanceEfficiency('capConf'));
  function availabilityAndPELossesNotCaptured(phase) {
    return function() {
      var JLRAM = parseFloat(this[phase + 'totalPartsRun'].value);
      var JLRAN = parseFloat(this[phase + 'perfNetIdealCycleTime'].value);
      var JLRAK = parseFloat(this[phase + 'equipmentAvailability'].value);
      var result = (JLRAK - (JLRAN * JLRAM) / 60).toFixed(2);
      return isNaN(result) ? '' : result;
    };
  }
  model.find('processes.phase0availabilityAndPELossesNotCaptured').setValue(availabilityAndPELossesNotCaptured('phase0'));
  model.find('processes.phase3availabilityAndPELossesNotCaptured').setValue(availabilityAndPELossesNotCaptured('phase3'));
  model.find('processes.capConfavailabilityAndPELossesNotCaptured').setValue(availabilityAndPELossesNotCaptured('capConf'));
  function rightFirstTime(phase) {
    return function() {
      var JLRAM = parseFloat(this[phase + 'totalPartsRun'].value);
      var JLRAQ = parseFloat(this[phase + 'numberOfPartsRejected'].value);
      var JLRAR = parseFloat(this[phase + 'numberOfPartsReworked'].value);
      var result = ((JLRAM - (JLRAQ - JLRAR)) / JLRAM) * 100;
      return isNaN(result) ? '' : result;
    };
  }
  model.find('processes.phase0rightFirstTime').setValue(rightFirstTime('phase0'));
  model.find('processes.phase3rightFirstTime').setValue(rightFirstTime('phase3'));
  model.find('processes.capConfrightFirstTime').setValue(rightFirstTime('capConf'));
  function firstTimeThrough(phase) {
    return function() {
      var JLRAM = parseFloat(this[phase + 'totalPartsRun'].value);
      var JLRAQ = parseFloat(this[phase + 'numberOfPartsRejected'].value);
      var result = ((JLRAM - JLRAQ) / JLRAM) * 100;
      return isNaN(result) ? '' : result;
    };
  }
  model.find('processes.phase0firstTimeThrough').setValue(firstTimeThrough('phase0'));
  model.find('processes.phase3firstTimeThrough').setValue(firstTimeThrough('phase3'));
  model.find('processes.capConffirstTimeThrough').setValue(firstTimeThrough('capConf'));
  function oee(phase) {
    return function() {
      var JLRAK = parseFloat(this[phase + 'equipmentAvailability'].value);
      var JLRAO = parseFloat(this[phase + 'performanceEfficiency'].value);
      var JLRAS = parseFloat(this[phase + 'rightFirstTime'].value);
      var result = ((JLRAK * JLRAO * JLRAS) / 10000).toFixed(2);
      return isNaN(result) ? '' : result;
    };
  }
  model.find('processes.phase0oee').setValue(oee('phase0'));
  model.find('processes.phase3oee').setValue(oee('phase3'));
  model.find('processes.capConfoee').setValue(oee('capConf'));
  function processSpecificWeek(phase) {
    return function() {
      var JLRU = parseFloat(this.plannedProductionPerWeek.value);
      var JLRAU = parseFloat(this[phase + 'oee'].value);
      var result = Math.round(JLRU * JLRAU / 100);
      return isNaN(result) ? '' : result;
    };
  }
  model.find('processes.phase0processSpecificWeek').setValue(processSpecificWeek('phase0'));
  model.find('processes.phase3processSpecificWeek').setValue(processSpecificWeek('phase3'));
  model.find('processes.capConfprocessSpecificWeek').setValue(processSpecificWeek('capConf'));
  function processSpecificHour(phase) {
    return function() {
      var JLRCA = parseFloat(this.plannedProductionPerHour.value);
      var JLRAU = parseFloat(this[phase + 'oee'].value);
      var result = Math.round(JLRCA * JLRAU / 100);
      return isNaN(result) ? '' : result;
    };
  }
  model.find('processes.phase0processSpecificHour').setValue(processSpecificHour('phase0'));
  model.find('processes.phase3processSpecificHour').setValue(processSpecificHour('phase3'));
  model.find('processes.capConfprocessSpecificHour').setValue(processSpecificHour('capConf'));
  function processSpecificDay(phase) {
    return function() {
      var JLRCB = parseFloat(this.plannedProductionPerDay.value);
      var JLRAU = parseFloat(this[phase + 'oee'].value);
      var result = Math.round(JLRCB * JLRAU / 100);
      return isNaN(result) ? '' : result;
    };
  }
  model.find('processes.phase0processSpecificDay').setValue(processSpecificDay('phase0'));
  model.find('processes.phase3processSpecificDay').setValue(processSpecificDay('phase3'));
  model.find('processes.capConfprocessSpecificDay').setValue(processSpecificDay('capConf'));
  function observedCycleTime(phase) {
    return function() {
      var JLRAJ = parseFloat(this[phase + 'actualProductionTime'].value);
      var JLRAM = parseFloat(this[phase + 'totalPartsRun'].value);
      var result = (JLRAJ * 60 / JLRAM).toFixed(2);
      return isNaN(result) ? '' : result;
    };
  }
  model.find('processes.phase0observedCycleTime').setValue(observedCycleTime('phase0'));
  model.find('processes.phase3observedCycleTime').setValue(observedCycleTime('phase3'));
  model.find('processes.capConfobservedCycleTime').setValue(observedCycleTime('capConf'));
  function jlrDemand(phase) {
    return function() {
      return model.find('totalRequiredDemand')[0].value;
    };
  }
  model.find('processes.phase0jlrDemand').setValue(jlrDemand('phase0'));
  model.find('processes.phase3jlrDemand').setValue(jlrDemand('phase3'));
  model.find('processes.capConfjlrDemand').setValue(jlrDemand('capConf'));
  function partsAvailableForShipment(phase) {
    return function() {
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
    };
  }
  model.find('processes.phase0partsAvailableForShipment').setValue(partsAvailableForShipment('phase0'));
  model.find('processes.phase3partsAvailableForShipment').setValue(partsAvailableForShipment('phase3'));
  model.find('processes.capConfpartsAvailableForShipment').setValue(partsAvailableForShipment('capConf'));
  function observePercentageJLRDemand(phase) {
    return function(newVal, oldVal, diff, name) {
      var className = '';
      if (newVal < 0) {
        className = 'negative';
      } else if (newVal > 0) {
        className = 'positive';
      }
      this.phase0percentageJLRDemand.model = className;
      this.phase3percentageJLRDemand.model = className;
      this.capConfpercentageJLRDemand.model = className;
      this.phase0partsAvailableForShipment.model = className;
      this.phase3partsAvailableForShipment.model = className;
      this.capConfpartsAvailableForShipment.model = className;
      this.phase0jlrDemand.model = className;
      this.phase3jlrDemand.model = className;
      this.capConfjlrDemand.model = className;
    };
  }
  model.find('processes.phase0percentageJLRDemand').observe(observePercentageJLRDemand('phase0'));
  model.find('processes.phase3percentageJLRDemand').observe(observePercentageJLRDemand('phase3'));
  model.find('processes.capConfpercentageJLRDemand').observe(observePercentageJLRDemand('capConf'));
  function percentageJLRDemand(phase) {
    return function() {
      var JLRBD = parseFloat(this[phase + 'partsAvailableForShipment'].value);
      var JLRBC = parseFloat(this[phase + 'jlrDemand'].value);
      var result = Math.round((JLRBD - JLRBC / JLRBC) * 100);
      return isNaN(result) ? '' : result;
    };
  }
  model.find('processes.phase0percentageJLRDemand').setValue(percentageJLRDemand('phase0'));
  model.find('processes.phase3percentageJLRDemand').setValue(percentageJLRDemand('phase3'));
  model.find('processes.capConfpercentageJLRDemand').setValue(percentageJLRDemand('capConf'));
  model.find('processes.totalPercentageAllocation').setValue(function() {
    var sharedLoadingPlan = this.sharedLoadingPlan.value;
    var sum = 0;
    sharedLoadingPlan.forEach(function(item) {
      if (!isNaN(parseFloat(item.requiredAllocationByPart.value))) {
        sum += parseFloat(item.requiredAllocationByPart.value);
      }
    });
    if (!isNaN(parseFloat(this.allocationPercentage.value))) {
      sum += parseFloat(this.allocationPercentage.value);
    }
    if (!isNaN(parseFloat(this.percentageNetAvailTime.value))) {
      sum += parseFloat(this.percentageNetAvailTime.value);
    }
    return isNaN(sum) ? '' : sum;
  });
  model.find('phase').observe(function(newVal) {
    var actions = {
      'capacityPlanning': function() {
        blocksActions.setVisible(['capacityPlanning']);
        blocksActions.setOpen(['capacityPlanning']);
      },
      'phase0': function() {
        blocksActions.setVisible(['capacityPlanning', 'phase0']);
        blocksActions.setOpen(['capacityPlanning', 'phase0']);
      },
      'phase3': function() {
        blocksActions.setVisible(['capacityPlanning', 'phase3']);
        blocksActions.setOpen(['capacityPlanning', 'phase3']);
      },
      'capacityConfirmation': function() {
        blocksActions.setVisible(['capacityConfirmation']);
        blocksActions.setOpen(['capacityConfirmation']);
      }
    };
    if (!!newVal) {
      actions[newVal]();
    }
  });
};
var $__default = listeners;

//# sourceMappingURL=<compileOutput>


},{"../actions/alert":3,"../actions/blocks":5,"../router/stores/router":45}],27:[function(require,module,exports){
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
    console.log('hello');
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


},{"./router/stores/router":45}],28:[function(require,module,exports){
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


},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_form_47_config__,
    $___46__46__47_form_47_listeners__,
    $___46__46__47_form_47_controller__,
    $___46__46__47_actions_47_alert__,
    $___46__46__47_xhr__,
    $___46__46__47_actions_47_blocks__;
var formConfig = ($___46__46__47_form_47_config__ = require("../form/config"), $___46__46__47_form_47_config__ && $___46__46__47_form_47_config__.__esModule && $___46__46__47_form_47_config__ || {default: $___46__46__47_form_47_config__}).default;
var listeners = ($___46__46__47_form_47_listeners__ = require("../form/listeners"), $___46__46__47_form_47_listeners__ && $___46__46__47_form_47_listeners__.__esModule && $___46__46__47_form_47_listeners__ || {default: $___46__46__47_form_47_listeners__}).default;
var controller = ($___46__46__47_form_47_controller__ = require("../form/controller"), $___46__46__47_form_47_controller__ && $___46__46__47_form_47_controller__.__esModule && $___46__46__47_form_47_controller__ || {default: $___46__46__47_form_47_controller__}).default;
var alert = ($___46__46__47_actions_47_alert__ = require("../actions/alert"), $___46__46__47_actions_47_alert__ && $___46__46__47_actions_47_alert__.__esModule && $___46__46__47_actions_47_alert__ || {default: $___46__46__47_actions_47_alert__}).default;
var xhr = ($___46__46__47_xhr__ = require("../xhr"), $___46__46__47_xhr__ && $___46__46__47_xhr__.__esModule && $___46__46__47_xhr__ || {default: $___46__46__47_xhr__}).default;
var blocksActions = ($___46__46__47_actions_47_blocks__ = require("../actions/blocks"), $___46__46__47_actions_47_blocks__ && $___46__46__47_actions_47_blocks__.__esModule && $___46__46__47_actions_47_blocks__ || {default: $___46__46__47_actions_47_blocks__}).default;
var ecar = React.createClass({
  displayName: 'ecar',
  componentDidMount: function() {
    var formBuilder = {};
    if (this.props.data && this.props.data.getDetails) {
      formBuilder.model = this.props.data.getDetails;
    }
    formBuilder.controller = controller;
    var formView = JSON.parse(JSON.stringify(formConfig));
    formView.buttonContainer.items = {
      submitButton: {
        type: "button",
        text: "Submit",
        className: "submit"
      },
      saveButton: {
        type: "button",
        text: "Save",
        className: "save"
      }
    };
    formBuilder.view = formView;
    var form = adapt.form('name', formBuilder);
    var model = form.model;
    listeners(form);
    function isArray(value) {
      return toString.call(value).slice(8, -1) === 'Array';
    }
    function isObject(value) {
      return toString.call(value).slice(8, -1) === 'Object';
    }
    function convert(data, newData) {
      if (isArray(data)) {
        newData = [];
        for (var i = 0; i < data.length; i++) {
          newData.push({});
          convert(data[i], newData[i]);
        }
      } else if (isObject(data)) {
        for (var i in data) {
          if (typeof data[i].value !== 'undefined') {
            if (isObject(data[i].value)) {
              newData[i] = {};
              convert(data[i].value, newData[i]);
            } else if (isArray(data[i].value)) {
              newData[i] = [];
              for (var t = 0; t < data[i].value.length; t++) {
                newData[i].push({});
                convert(data[i].value[t], newData[i][t]);
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
    var fired = false;
    model.find('saveButton').observe(function(newVal, oldVal) {
      if (!fired && newVal) {
        fired = true;
        var newData = {};
        convert(model.items, newData);
        var headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        };
        alert.open({
          waiting: true,
          header: 'Please Wait..',
          message: 'Your eCAR is being saved'
        });
        xhr('PUT', '/rest/workflow', {}, JSON.stringify(newData), headers).then(function(data) {
          alert.open({
            success: true,
            header: 'Success',
            message: 'Your eCAR has been saved',
            buttons: [{
              type: 'link',
              link: '/#/ecar/' + data.workflowId,
              text: 'Continue'
            }]
          });
        }, function() {
          alert.open({
            error: true,
            header: 'Something went wrong',
            message: 'An error has occured, please try again later',
            buttons: [{
              type: 'button',
              text: 'Continue'
            }]
          });
        });
      } else if (newVal) {
        fired = false;
      }
    });
    model.find('ppapLevel').observe(function(newVal, oldVal) {
      if (newVal) {
        alert.open({
          warning: true,
          header: 'Is this correct?',
          message: 'Please ensure that the PPAP level you have selected is correct',
          buttons: [{
            type: 'button',
            text: 'Continue'
          }]
        });
      }
    });
    var contactDetailsPristine = true;
    var contactFired = false;
    form.observe.addListener(function() {
      var fields = [model.find('supplierName')[0].value, model.find('county')[0].value, model.find('qualityGSDB')[0].value, model.find('address')[0].value, model.find('country')[0].value, model.find('city')[0].value, model.find('manufacturingGSDB')[0].value, model.find('supplierRepresentativeName')[0].value, model.find('supplierRepresentativePhone')[0].value, model.find('supplierRepresentativeRole')[0].value, model.find('supplierRepresentativeEmail')[0].value, model.find('jlrStaEmail')[0].value, model.find('jlrStaName')[0].value, model.find('jlrStaPhone')[0].value];
      return fields.join('');
    }, function(newVal) {
      if (contactFired) {
        contactDetailsPristine = false;
      } else {
        contactFired = true;
      }
    });
    function submit() {
      alert.open({
        waiting: true,
        header: 'Please Wait..',
        message: 'Your eCAR is being submitted'
      });
      xhr('PUT', '/rest/workflow/progress', {}, JSON.stringify(newData), headers).then(function() {
        alert.open({
          success: true,
          header: 'Success',
          message: 'Your eCAR has been submitted',
          buttons: [{
            type: 'link',
            link: '/#/current',
            text: 'Go to your eCARs'
          }]
        });
      }, function() {
        alert.open({
          error: true,
          header: 'Something went wrong',
          message: 'An error has occured, please try again later',
          buttons: [{
            type: 'button',
            text: 'Continue'
          }]
        });
      });
    }
    var submitFired = false;
    model.find('submitButton').observe(function(newVal, oldVal) {
      if (!submitFired && newVal) {
        submitFired = true;
        var newData = {};
        convert(model.items, newData);
        var headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        };
        if (contactDetailsPristine) {
          alert.open({
            warning: true,
            header: 'Are you sure?',
            message: 'Your contact details have not been modified. Please make sure they\'re up to date before continuing.',
            buttons: [{
              type: 'cancel',
              text: 'Cancel'
            }, {
              type: 'button',
              text: 'Continue',
              callback: submit
            }]
          });
        } else {
          submit();
        }
      } else if (newVal) {
        submitFired = false;
      }
    });
    var domNode = this.getDOMNode();
    form.render(domNode.querySelectorAll('.form')[0]);
    form.observe.digest();
  },
  render: function() {
    return (React.createElement("div", null, React.createElement("div", {className: "form"}), React.createElement("div", {
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
ecar.resolve = {'getDetails': function() {
    return xhr('GET', '/rest/supplierDetails');
  }};
var $__default = ecar;

//# sourceMappingURL=<compileOutput>


},{"../actions/alert":3,"../actions/blocks":5,"../form/config":24,"../form/controller":25,"../form/listeners":26,"../xhr":50}],30:[function(require,module,exports){
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
    $___46__46__47_stores_47_current__;
var router = ($___46__46__47_router_47_router__ = require("../router/router"), $___46__46__47_router_47_router__ && $___46__46__47_router_47_router__.__esModule && $___46__46__47_router_47_router__ || {default: $___46__46__47_router_47_router__}).default;
var xhr = ($___46__46__47_xhr__ = require("../xhr"), $___46__46__47_xhr__ && $___46__46__47_xhr__.__esModule && $___46__46__47_xhr__ || {default: $___46__46__47_xhr__}).default;
var actions = ($___46__46__47_actions_47_current__ = require("../actions/current"), $___46__46__47_actions_47_current__ && $___46__46__47_actions_47_current__.__esModule && $___46__46__47_actions_47_current__ || {default: $___46__46__47_actions_47_current__}).default;
var store = ($___46__46__47_stores_47_current__ = require("../stores/current"), $___46__46__47_stores_47_current__ && $___46__46__47_stores_47_current__.__esModule && $___46__46__47_stores_47_current__ || {default: $___46__46__47_stores_47_current__}).default;
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
      if (_this.state.selected.indexOf(element.id) > -1) {
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
      rows.push(React.createElement("li", {
        className: rowClass,
        'data-id': element.id,
        onContextMenu: _this.handleContextMenu,
        key: element.workflowId
      }, React.createElement(router.linkTo, {
        stateName: "ecar",
        params: {workflowId: element.workflowId},
        className: "current__link"
      }, React.createElement("div", {
        className: "current__col current__col--select",
        onClick: _this.selectRow
      }, React.createElement("i", {className: iconClass})), React.createElement("div", {className: "current__col current__col--id"}, element.workflowId), React.createElement("div", {className: "current__col"}, element.model.prefix), React.createElement("div", {className: "current__col"}, element.model.base), React.createElement("div", {className: "current__col"}, element.model.supplierName), React.createElement("div", {className: "current__col"}, element.model.manufacturingGSDB), React.createElement("div", {className: "current__col"}, element.model.partName), React.createElement("div", {className: "current__col"}, element.model.phase), React.createElement("div", {className: "current__col"}), React.createElement("div", {className: "current__col current__col--status"}, React.createElement("span", {className: "current__status"}, "Approved")), React.createElement("div", {className: "current__col"}, "Sep 1, 2014 2:40:17PM"), React.createElement("div", {className: "current__col current__col--icon"}, React.createElement("i", {className: "fa fa-chevron-right"})))));
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
    return (React.createElement("div", {className: "current no-select"}, React.createElement("div", {className: actionsClass}, React.createElement("ul", {className: "actions__list clear"}, React.createElement("li", {className: "actions__item actions__item--deselect"}, React.createElement("i", {className: "fa fa-minus-square fa-fw actions__icon"}), " "), React.createElement("li", {className: "actions__item actions__item--left actions__item--approve"}, React.createElement("i", {className: "fa fa-check fa-fw actions__icon"}), "Approve"), React.createElement("li", {className: "actions__item actions__item--middle actions__item--reject"}, React.createElement("i", {className: "fa fa-times fa-fw actions__icon"}), "Reject"), React.createElement("li", {className: "actions__item actions__item--right"}, React.createElement("i", {className: "fa fa-trash-o fa-fw actions__icon"}), "Delete"))), React.createElement("ul", {className: "current__table"}, React.createElement("li", {className: "current__header"}, React.createElement("div", {className: "current__col current__col--select"}), React.createElement("div", {className: "current__col current__col--id"}, "ID"), React.createElement("div", {className: "current__col"}, "Prefix"), React.createElement("div", {className: "current__col"}, "Base"), React.createElement("div", {className: "current__col"}, "Supplier Name"), React.createElement("div", {className: "current__col"}, "Supplier GSDB"), React.createElement("div", {className: "current__col"}, "Part Name"), React.createElement("div", {className: "current__col"}, "Submitted Phases"), React.createElement("div", {className: "current__col"}, "Submission Status"), React.createElement("div", {className: "current__col current__col--status"}), React.createElement("div", {className: "current__col"}, "Date Created"), React.createElement("div", {className: "current__col current__col--icon"})), rows), contextMenuElement));
  }
});
var resolve = {'getList': function() {
    return xhr('get', '/rest/reporting/list');
  }};
;

//# sourceMappingURL=<compileOutput>


},{"../actions/current":6,"../router/router":44,"../stores/current":49,"../xhr":50}],31:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_form_47_config__,
    $___46__46__47_form_47_listeners__,
    $___46__46__47_form_47_controller__,
    $___46__46__47_xhr__,
    $___46__46__47_actions_47_blocks__,
    $___46__46__47_actions_47_alert__;
var formConfig = ($___46__46__47_form_47_config__ = require("../form/config"), $___46__46__47_form_47_config__ && $___46__46__47_form_47_config__.__esModule && $___46__46__47_form_47_config__ || {default: $___46__46__47_form_47_config__}).default;
var listeners = ($___46__46__47_form_47_listeners__ = require("../form/listeners"), $___46__46__47_form_47_listeners__ && $___46__46__47_form_47_listeners__.__esModule && $___46__46__47_form_47_listeners__ || {default: $___46__46__47_form_47_listeners__}).default;
var controller = ($___46__46__47_form_47_controller__ = require("../form/controller"), $___46__46__47_form_47_controller__ && $___46__46__47_form_47_controller__.__esModule && $___46__46__47_form_47_controller__ || {default: $___46__46__47_form_47_controller__}).default;
var xhr = ($___46__46__47_xhr__ = require("../xhr"), $___46__46__47_xhr__ && $___46__46__47_xhr__.__esModule && $___46__46__47_xhr__ || {default: $___46__46__47_xhr__}).default;
var blocksActions = ($___46__46__47_actions_47_blocks__ = require("../actions/blocks"), $___46__46__47_actions_47_blocks__ && $___46__46__47_actions_47_blocks__.__esModule && $___46__46__47_actions_47_blocks__ || {default: $___46__46__47_actions_47_blocks__}).default;
var alert = ($___46__46__47_actions_47_alert__ = require("../actions/alert"), $___46__46__47_actions_47_alert__ && $___46__46__47_actions_47_alert__.__esModule && $___46__46__47_actions_47_alert__ || {default: $___46__46__47_actions_47_alert__}).default;
var ecar = React.createClass({
  displayName: 'ecar',
  componentDidMount: function() {
    var formBuilder = {};
    formBuilder.model = this.props.data.getForm.model;
    formBuilder.controller = controller;
    var formView = JSON.parse(JSON.stringify(formConfig));
    formView.tabs.items.phase.items.col.items[1].ppapLevel.options = [{
      value: formBuilder.model.ppapLevel,
      label: formBuilder.model.ppapLevel.split('_')[1]
    }];
    formView.buttonContainer.items = {
      rejectButton: {
        type: "button",
        text: "Reject",
        className: "reject"
      },
      approveButton: {
        type: "button",
        text: "Approve",
        className: "Approve"
      },
      saveButton: {
        type: "button",
        text: "Save",
        className: "save"
      }
    };
    formBuilder.view = formView;
    var form = adapt.form('name', formBuilder);
    listeners(form);
    var domNode = this.getDOMNode();
    form.render(domNode.querySelectorAll('.form')[0]);
    console.log('FORM:::', form);
  },
  render: function() {
    return (React.createElement("div", null, React.createElement("div", {className: "form"}), React.createElement("div", {
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
ecar.resolve = {'getForm': function(params) {
    var endpoint = ['rest', 'workflow'];
    endpoint.push(params.workflowId.length === 16 && 'byWorkflowId' || 'byNodeId');
    endpoint.push(params.workflowId);
    return xhr('GET', endpoint.join('/'));
  }};
var $__default = ecar;

//# sourceMappingURL=<compileOutput>


},{"../actions/alert":3,"../actions/blocks":5,"../form/config":24,"../form/controller":25,"../form/listeners":26,"../xhr":50}],32:[function(require,module,exports){
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
console.log(Router);
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


},{"../components/alert":7,"../loading":27,"../partials/header":36,"../router/router":44,"../stores/app":47}],33:[function(require,module,exports){
"use strict";
module.exports = React.createClass({
  displayName: 'exports',
  render: function() {
    return (React.createElement("div", null, "Info"));
  }
});

//# sourceMappingURL=<compileOutput>


},{}],34:[function(require,module,exports){
"use strict";
module.exports = React.createClass({
  displayName: 'exports',
  render: function() {
    return (React.createElement("div", null, "Reporting Page"));
  }
});

//# sourceMappingURL=<compileOutput>


},{}],35:[function(require,module,exports){
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


},{"../xhr":50}],36:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__navigation__,
    $__search__,
    $___46__46__47_router__;
var Navigation = ($__navigation__ = require("./navigation"), $__navigation__ && $__navigation__.__esModule && $__navigation__ || {default: $__navigation__}).default;
var Search = ($__search__ = require("./search"), $__search__ && $__search__.__esModule && $__search__ || {default: $__search__}).default;
var Router = ($___46__46__47_router__ = require("../router"), $___46__46__47_router__ && $___46__46__47_router__.__esModule && $___46__46__47_router__ || {default: $___46__46__47_router__}).default;
console.log(Router);
var header = React.createClass({
  displayName: 'header',
  render: function() {
    return (React.createElement("header", {className: "mainheader"}, React.createElement("div", {className: "mainheader__fixed"}, React.createElement("div", {className: "mainheader__table"}, React.createElement("div", {className: "mainheader__logo-container mainheader__cell"}, React.createElement(Router.linkTo, {
      stateName: "current",
      className: "mainheader__logo"
    })), React.createElement("div", {className: "mainheader__cell mainheader__cell--search"}, React.createElement(Search, null)), React.createElement("div", {className: "mainheader__cell mainheader__cell--user"}, React.createElement("div", {className: "mainheader__user"}, "Ryan Clark")), React.createElement("div", {className: "mainheader__cell mainheader__cell--navigation"}, React.createElement(Navigation, null))))));
  }
});
var $__default = header;

//# sourceMappingURL=<compileOutput>


},{"../router":39,"./navigation":37,"./search":38}],37:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $___46__46__47_router_47_router__;
var router = ($___46__46__47_router_47_router__ = require("../router/router"), $___46__46__47_router_47_router__ && $___46__46__47_router_47_router__.__esModule && $___46__46__47_router_47_router__ || {default: $___46__46__47_router_47_router__}).default;
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
    }, React.createElement("i", {className: "fa fa-bars fa-fw navigation__icon navigation__icon--dropdown"})), React.createElement("ul", {className: dropdownClass}, React.createElement("li", {className: "dropdown__item"}, React.createElement(router.linkTo, {
      stateName: "create",
      className: "dropdown__link",
      onMouseOver: this.setHover.bind(this, 0),
      onMouseOut: this.removeHover
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


},{"../router/router":44}],38:[function(require,module,exports){
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


},{"../router/router":44}],39:[function(require,module,exports){
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
    $__pages_47_ecar_46_jsx__;
var router = ($__router_47_router_46_jsx__ = require("./router/router.jsx"), $__router_47_router_46_jsx__ && $__router_47_router_46_jsx__.__esModule && $__router_47_router_46_jsx__ || {default: $__router_47_router_46_jsx__}).default;
console.log(router);
var create = ($__pages_47_create_46_jsx__ = require("./pages/create.jsx"), $__pages_47_create_46_jsx__ && $__pages_47_create_46_jsx__.__esModule && $__pages_47_create_46_jsx__ || {default: $__pages_47_create_46_jsx__}).default;
var $__2 = ($__pages_47_current_46_jsx__ = require("./pages/current.jsx"), $__pages_47_current_46_jsx__ && $__pages_47_current_46_jsx__.__esModule && $__pages_47_current_46_jsx__ || {default: $__pages_47_current_46_jsx__}),
    current = $__2.current,
    currentResolve = $__2.resolve;
var search = ($__pages_47_search_46_jsx__ = require("./pages/search.jsx"), $__pages_47_search_46_jsx__ && $__pages_47_search_46_jsx__.__esModule && $__pages_47_search_46_jsx__ || {default: $__pages_47_search_46_jsx__}).default;
var info = ($__pages_47_info_46_jsx__ = require("./pages/info.jsx"), $__pages_47_info_46_jsx__ && $__pages_47_info_46_jsx__.__esModule && $__pages_47_info_46_jsx__ || {default: $__pages_47_info_46_jsx__}).default;
var admin = ($__pages_47_admin_46_jsx__ = require("./pages/admin.jsx"), $__pages_47_admin_46_jsx__ && $__pages_47_admin_46_jsx__.__esModule && $__pages_47_admin_46_jsx__ || {default: $__pages_47_admin_46_jsx__}).default;
var reporting = ($__pages_47_reporting_46_jsx__ = require("./pages/reporting.jsx"), $__pages_47_reporting_46_jsx__ && $__pages_47_reporting_46_jsx__.__esModule && $__pages_47_reporting_46_jsx__ || {default: $__pages_47_reporting_46_jsx__}).default;
var ecar = ($__pages_47_ecar_46_jsx__ = require("./pages/ecar.jsx"), $__pages_47_ecar_46_jsx__ && $__pages_47_ecar_46_jsx__.__esModule && $__pages_47_ecar_46_jsx__ || {default: $__pages_47_ecar_46_jsx__}).default;
router.registerState('create', {
  url: '/create',
  view: create,
  resolve: create.resolve
});
router.registerState('current', {
  url: '/current',
  view: current,
  resolve: currentResolve
});
router.registerState('ecar', {
  url: '/ecar/:workflowId',
  view: ecar,
  resolve: ecar.resolve
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


},{"./pages/admin.jsx":28,"./pages/create.jsx":29,"./pages/current.jsx":30,"./pages/ecar.jsx":31,"./pages/info.jsx":33,"./pages/reporting.jsx":34,"./pages/search.jsx":35,"./router/router.jsx":44}],40:[function(require,module,exports){
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


},{"../stores/router":45}],41:[function(require,module,exports){
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


},{"../router":44,"../stores/router":45}],42:[function(require,module,exports){
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


},{"../stores/router":45}],43:[function(require,module,exports){
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
    console.log(target, dest);
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
    console.log(this.params);
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


},{}],44:[function(require,module,exports){
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


},{"./actions/router":40,"./components/linkTo":41,"./components/view":42,"./matchFactory":43,"./stores/router":45}],45:[function(require,module,exports){
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


},{"../../dispatchers/ecar":18,"../../flux/store":22}],46:[function(require,module,exports){
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


},{"../dispatchers/ecar":18,"../flux/store":22}],47:[function(require,module,exports){
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


},{"../dispatchers/ecar":18,"../flux/store":22}],48:[function(require,module,exports){
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


},{"../dispatchers/ecar":18,"../flux/store":22}],49:[function(require,module,exports){
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


},{"../dispatchers/ecar":18,"../flux/store":22}],50:[function(require,module,exports){
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


},{}]},{},[19,2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9lY2FyLXRhY3RpY2FsL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9lY2FyLXRhY3RpY2FsL25vZGVfbW9kdWxlcy9lczZpZnkvbm9kZV9tb2R1bGVzL3RyYWNldXIvYmluL3RyYWNldXItcnVudGltZS5qcyIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9hY3Rpb25zL2FsZXJ0LmpzIiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvZWNhci10YWN0aWNhbC9wdWJsaWMvc3JjL2pzL2FjdGlvbnMvYXBwLmpzIiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvZWNhci10YWN0aWNhbC9wdWJsaWMvc3JjL2pzL2FjdGlvbnMvYmxvY2tzLmpzIiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvZWNhci10YWN0aWNhbC9wdWJsaWMvc3JjL2pzL2FjdGlvbnMvY3VycmVudC5qcyIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9jb21wb25lbnRzL2FsZXJ0LmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9jb21wb25lbnRzL2Jsb2NrLmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9jb21wb25lbnRzL2J1dHRvbi5qc3giLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9lY2FyLXRhY3RpY2FsL3B1YmxpYy9zcmMvanMvY29tcG9uZW50cy9idXR0b25Db250YWluZXIuanN4IiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvZWNhci10YWN0aWNhbC9wdWJsaWMvc3JjL2pzL2NvbXBvbmVudHMvY2hhcnQuanN4IiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvZWNhci10YWN0aWNhbC9wdWJsaWMvc3JjL2pzL2NvbXBvbmVudHMvaGVhZGVyLmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9jb21wb25lbnRzL292ZXJsYXkuanN4IiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvZWNhci10YWN0aWNhbC9wdWJsaWMvc3JjL2pzL2NvbXBvbmVudHMvc2hhcmVkTG9hZGluZ1BsYW4uanN4IiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvZWNhci10YWN0aWNhbC9wdWJsaWMvc3JjL2pzL2NvbXBvbmVudHMvc2lnbi5qc3giLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9lY2FyLXRhY3RpY2FsL3B1YmxpYy9zcmMvanMvY29tcG9uZW50cy9zcHJlYWRzaGVldC5qc3giLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9lY2FyLXRhY3RpY2FsL3B1YmxpYy9zcmMvanMvY29tcG9uZW50cy9zdW1tYXJ5LmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9kaXNwYXRjaGVycy9lY2FyLmpzIiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvZWNhci10YWN0aWNhbC9wdWJsaWMvc3JjL2pzL2VjYXIuanN4IiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvZWNhci10YWN0aWNhbC9wdWJsaWMvc3JjL2pzL2ZsdXgvZGlzcGF0Y2hlci5qcyIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9mbHV4L2VtaXR0ZXIuanMiLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9lY2FyLXRhY3RpY2FsL3B1YmxpYy9zcmMvanMvZmx1eC9zdG9yZS5qcyIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9mbHV4L3V0aWxzLmpzIiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvZWNhci10YWN0aWNhbC9wdWJsaWMvc3JjL2pzL2Zvcm0vY29uZmlnLmpzIiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvZWNhci10YWN0aWNhbC9wdWJsaWMvc3JjL2pzL2Zvcm0vY29udHJvbGxlci5qcyIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9mb3JtL2xpc3RlbmVycy5qcyIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9sb2FkaW5nLmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9wYWdlcy9hZG1pbi5qc3giLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9lY2FyLXRhY3RpY2FsL3B1YmxpYy9zcmMvanMvcGFnZXMvY3JlYXRlLmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9wYWdlcy9jdXJyZW50LmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9wYWdlcy9lY2FyLmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9wYWdlcy9pbmRleC5qc3giLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9lY2FyLXRhY3RpY2FsL3B1YmxpYy9zcmMvanMvcGFnZXMvaW5mby5qc3giLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9lY2FyLXRhY3RpY2FsL3B1YmxpYy9zcmMvanMvcGFnZXMvcmVwb3J0aW5nLmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9wYWdlcy9zZWFyY2guanN4IiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvZWNhci10YWN0aWNhbC9wdWJsaWMvc3JjL2pzL3BhcnRpYWxzL2hlYWRlci5qc3giLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9lY2FyLXRhY3RpY2FsL3B1YmxpYy9zcmMvanMvcGFydGlhbHMvbmF2aWdhdGlvbi5qc3giLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9lY2FyLXRhY3RpY2FsL3B1YmxpYy9zcmMvanMvcGFydGlhbHMvc2VhcmNoLmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9yb3V0ZXIuanMiLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9lY2FyLXRhY3RpY2FsL3B1YmxpYy9zcmMvanMvcm91dGVyL2FjdGlvbnMvcm91dGVyLmpzIiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvZWNhci10YWN0aWNhbC9wdWJsaWMvc3JjL2pzL3JvdXRlci9jb21wb25lbnRzL2xpbmtUby5qc3giLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9lY2FyLXRhY3RpY2FsL3B1YmxpYy9zcmMvanMvcm91dGVyL2NvbXBvbmVudHMvdmlldy5qc3giLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9lY2FyLXRhY3RpY2FsL3B1YmxpYy9zcmMvanMvcm91dGVyL21hdGNoRmFjdG9yeS5qcyIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9yb3V0ZXIvcm91dGVyLmpzeCIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9yb3V0ZXIvc3RvcmVzL3JvdXRlci5qcyIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9zdG9yZXMvYWxlcnQuanMiLCIvVXNlcnMvUnlhbi9wcm9qZWN0cy9lY2FyLXRhY3RpY2FsL3B1YmxpYy9zcmMvanMvc3RvcmVzL2FwcC5qcyIsIi9Vc2Vycy9SeWFuL3Byb2plY3RzL2VjYXItdGFjdGljYWwvcHVibGljL3NyYy9qcy9zdG9yZXMvYmxvY2tzLmpzIiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvZWNhci10YWN0aWNhbC9wdWJsaWMvc3JjL2pzL3N0b3Jlcy9jdXJyZW50LmpzIiwiL1VzZXJzL1J5YW4vcHJvamVjdHMvZWNhci10YWN0aWNhbC9wdWJsaWMvc3JjL2pzL3hoci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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dCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCl7XG4oZnVuY3Rpb24oZ2xvYmFsKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgaWYgKGdsb2JhbC4kdHJhY2V1clJ1bnRpbWUpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyICRPYmplY3QgPSBPYmplY3Q7XG4gIHZhciAkVHlwZUVycm9yID0gVHlwZUVycm9yO1xuICB2YXIgJGNyZWF0ZSA9ICRPYmplY3QuY3JlYXRlO1xuICB2YXIgJGRlZmluZVByb3BlcnRpZXMgPSAkT2JqZWN0LmRlZmluZVByb3BlcnRpZXM7XG4gIHZhciAkZGVmaW5lUHJvcGVydHkgPSAkT2JqZWN0LmRlZmluZVByb3BlcnR5O1xuICB2YXIgJGZyZWV6ZSA9ICRPYmplY3QuZnJlZXplO1xuICB2YXIgJGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9ICRPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuICB2YXIgJGdldE93blByb3BlcnR5TmFtZXMgPSAkT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXM7XG4gIHZhciAka2V5cyA9ICRPYmplY3Qua2V5cztcbiAgdmFyICRoYXNPd25Qcm9wZXJ0eSA9ICRPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICB2YXIgJHRvU3RyaW5nID0gJE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG4gIHZhciAkcHJldmVudEV4dGVuc2lvbnMgPSBPYmplY3QucHJldmVudEV4dGVuc2lvbnM7XG4gIHZhciAkc2VhbCA9IE9iamVjdC5zZWFsO1xuICB2YXIgJGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGU7XG4gIGZ1bmN0aW9uIG5vbkVudW0odmFsdWUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH07XG4gIH1cbiAgdmFyIHR5cGVzID0ge1xuICAgIHZvaWQ6IGZ1bmN0aW9uIHZvaWRUeXBlKCkge30sXG4gICAgYW55OiBmdW5jdGlvbiBhbnkoKSB7fSxcbiAgICBzdHJpbmc6IGZ1bmN0aW9uIHN0cmluZygpIHt9LFxuICAgIG51bWJlcjogZnVuY3Rpb24gbnVtYmVyKCkge30sXG4gICAgYm9vbGVhbjogZnVuY3Rpb24gYm9vbGVhbigpIHt9XG4gIH07XG4gIHZhciBtZXRob2QgPSBub25FbnVtO1xuICB2YXIgY291bnRlciA9IDA7XG4gIGZ1bmN0aW9uIG5ld1VuaXF1ZVN0cmluZygpIHtcbiAgICByZXR1cm4gJ19fJCcgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxZTkpICsgJyQnICsgKytjb3VudGVyICsgJyRfXyc7XG4gIH1cbiAgdmFyIHN5bWJvbEludGVybmFsUHJvcGVydHkgPSBuZXdVbmlxdWVTdHJpbmcoKTtcbiAgdmFyIHN5bWJvbERlc2NyaXB0aW9uUHJvcGVydHkgPSBuZXdVbmlxdWVTdHJpbmcoKTtcbiAgdmFyIHN5bWJvbERhdGFQcm9wZXJ0eSA9IG5ld1VuaXF1ZVN0cmluZygpO1xuICB2YXIgc3ltYm9sVmFsdWVzID0gJGNyZWF0ZShudWxsKTtcbiAgdmFyIHByaXZhdGVOYW1lcyA9ICRjcmVhdGUobnVsbCk7XG4gIGZ1bmN0aW9uIGlzUHJpdmF0ZU5hbWUocykge1xuICAgIHJldHVybiBwcml2YXRlTmFtZXNbc107XG4gIH1cbiAgZnVuY3Rpb24gY3JlYXRlUHJpdmF0ZU5hbWUoKSB7XG4gICAgdmFyIHMgPSBuZXdVbmlxdWVTdHJpbmcoKTtcbiAgICBwcml2YXRlTmFtZXNbc10gPSB0cnVlO1xuICAgIHJldHVybiBzO1xuICB9XG4gIGZ1bmN0aW9uIGlzU2hpbVN5bWJvbChzeW1ib2wpIHtcbiAgICByZXR1cm4gdHlwZW9mIHN5bWJvbCA9PT0gJ29iamVjdCcgJiYgc3ltYm9sIGluc3RhbmNlb2YgU3ltYm9sVmFsdWU7XG4gIH1cbiAgZnVuY3Rpb24gdHlwZU9mKHYpIHtcbiAgICBpZiAoaXNTaGltU3ltYm9sKHYpKVxuICAgICAgcmV0dXJuICdzeW1ib2wnO1xuICAgIHJldHVybiB0eXBlb2YgdjtcbiAgfVxuICBmdW5jdGlvbiBTeW1ib2woZGVzY3JpcHRpb24pIHtcbiAgICB2YXIgdmFsdWUgPSBuZXcgU3ltYm9sVmFsdWUoZGVzY3JpcHRpb24pO1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBTeW1ib2wpKVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N5bWJvbCBjYW5ub3QgYmUgbmV3XFwnZWQnKTtcbiAgfVxuICAkZGVmaW5lUHJvcGVydHkoU3ltYm9sLnByb3RvdHlwZSwgJ2NvbnN0cnVjdG9yJywgbm9uRW51bShTeW1ib2wpKTtcbiAgJGRlZmluZVByb3BlcnR5KFN5bWJvbC5wcm90b3R5cGUsICd0b1N0cmluZycsIG1ldGhvZChmdW5jdGlvbigpIHtcbiAgICB2YXIgc3ltYm9sVmFsdWUgPSB0aGlzW3N5bWJvbERhdGFQcm9wZXJ0eV07XG4gICAgaWYgKCFnZXRPcHRpb24oJ3N5bWJvbHMnKSlcbiAgICAgIHJldHVybiBzeW1ib2xWYWx1ZVtzeW1ib2xJbnRlcm5hbFByb3BlcnR5XTtcbiAgICBpZiAoIXN5bWJvbFZhbHVlKVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdDb252ZXJzaW9uIGZyb20gc3ltYm9sIHRvIHN0cmluZycpO1xuICAgIHZhciBkZXNjID0gc3ltYm9sVmFsdWVbc3ltYm9sRGVzY3JpcHRpb25Qcm9wZXJ0eV07XG4gICAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZClcbiAgICAgIGRlc2MgPSAnJztcbiAgICByZXR1cm4gJ1N5bWJvbCgnICsgZGVzYyArICcpJztcbiAgfSkpO1xuICAkZGVmaW5lUHJvcGVydHkoU3ltYm9sLnByb3RvdHlwZSwgJ3ZhbHVlT2YnLCBtZXRob2QoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN5bWJvbFZhbHVlID0gdGhpc1tzeW1ib2xEYXRhUHJvcGVydHldO1xuICAgIGlmICghc3ltYm9sVmFsdWUpXG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ0NvbnZlcnNpb24gZnJvbSBzeW1ib2wgdG8gc3RyaW5nJyk7XG4gICAgaWYgKCFnZXRPcHRpb24oJ3N5bWJvbHMnKSlcbiAgICAgIHJldHVybiBzeW1ib2xWYWx1ZVtzeW1ib2xJbnRlcm5hbFByb3BlcnR5XTtcbiAgICByZXR1cm4gc3ltYm9sVmFsdWU7XG4gIH0pKTtcbiAgZnVuY3Rpb24gU3ltYm9sVmFsdWUoZGVzY3JpcHRpb24pIHtcbiAgICB2YXIga2V5ID0gbmV3VW5pcXVlU3RyaW5nKCk7XG4gICAgJGRlZmluZVByb3BlcnR5KHRoaXMsIHN5bWJvbERhdGFQcm9wZXJ0eSwge3ZhbHVlOiB0aGlzfSk7XG4gICAgJGRlZmluZVByb3BlcnR5KHRoaXMsIHN5bWJvbEludGVybmFsUHJvcGVydHksIHt2YWx1ZToga2V5fSk7XG4gICAgJGRlZmluZVByb3BlcnR5KHRoaXMsIHN5bWJvbERlc2NyaXB0aW9uUHJvcGVydHksIHt2YWx1ZTogZGVzY3JpcHRpb259KTtcbiAgICBmcmVlemUodGhpcyk7XG4gICAgc3ltYm9sVmFsdWVzW2tleV0gPSB0aGlzO1xuICB9XG4gICRkZWZpbmVQcm9wZXJ0eShTeW1ib2xWYWx1ZS5wcm90b3R5cGUsICdjb25zdHJ1Y3RvcicsIG5vbkVudW0oU3ltYm9sKSk7XG4gICRkZWZpbmVQcm9wZXJ0eShTeW1ib2xWYWx1ZS5wcm90b3R5cGUsICd0b1N0cmluZycsIHtcbiAgICB2YWx1ZTogU3ltYm9sLnByb3RvdHlwZS50b1N0cmluZyxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICB9KTtcbiAgJGRlZmluZVByb3BlcnR5KFN5bWJvbFZhbHVlLnByb3RvdHlwZSwgJ3ZhbHVlT2YnLCB7XG4gICAgdmFsdWU6IFN5bWJvbC5wcm90b3R5cGUudmFsdWVPZixcbiAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICB9KTtcbiAgdmFyIGhhc2hQcm9wZXJ0eSA9IGNyZWF0ZVByaXZhdGVOYW1lKCk7XG4gIHZhciBoYXNoUHJvcGVydHlEZXNjcmlwdG9yID0ge3ZhbHVlOiB1bmRlZmluZWR9O1xuICB2YXIgaGFzaE9iamVjdFByb3BlcnRpZXMgPSB7XG4gICAgaGFzaDoge3ZhbHVlOiB1bmRlZmluZWR9LFxuICAgIHNlbGY6IHt2YWx1ZTogdW5kZWZpbmVkfVxuICB9O1xuICB2YXIgaGFzaENvdW50ZXIgPSAwO1xuICBmdW5jdGlvbiBnZXRPd25IYXNoT2JqZWN0KG9iamVjdCkge1xuICAgIHZhciBoYXNoT2JqZWN0ID0gb2JqZWN0W2hhc2hQcm9wZXJ0eV07XG4gICAgaWYgKGhhc2hPYmplY3QgJiYgaGFzaE9iamVjdC5zZWxmID09PSBvYmplY3QpXG4gICAgICByZXR1cm4gaGFzaE9iamVjdDtcbiAgICBpZiAoJGlzRXh0ZW5zaWJsZShvYmplY3QpKSB7XG4gICAgICBoYXNoT2JqZWN0UHJvcGVydGllcy5oYXNoLnZhbHVlID0gaGFzaENvdW50ZXIrKztcbiAgICAgIGhhc2hPYmplY3RQcm9wZXJ0aWVzLnNlbGYudmFsdWUgPSBvYmplY3Q7XG4gICAgICBoYXNoUHJvcGVydHlEZXNjcmlwdG9yLnZhbHVlID0gJGNyZWF0ZShudWxsLCBoYXNoT2JqZWN0UHJvcGVydGllcyk7XG4gICAgICAkZGVmaW5lUHJvcGVydHkob2JqZWN0LCBoYXNoUHJvcGVydHksIGhhc2hQcm9wZXJ0eURlc2NyaXB0b3IpO1xuICAgICAgcmV0dXJuIGhhc2hQcm9wZXJ0eURlc2NyaXB0b3IudmFsdWU7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgZnVuY3Rpb24gZnJlZXplKG9iamVjdCkge1xuICAgIGdldE93bkhhc2hPYmplY3Qob2JqZWN0KTtcbiAgICByZXR1cm4gJGZyZWV6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG4gIGZ1bmN0aW9uIHByZXZlbnRFeHRlbnNpb25zKG9iamVjdCkge1xuICAgIGdldE93bkhhc2hPYmplY3Qob2JqZWN0KTtcbiAgICByZXR1cm4gJHByZXZlbnRFeHRlbnNpb25zLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cbiAgZnVuY3Rpb24gc2VhbChvYmplY3QpIHtcbiAgICBnZXRPd25IYXNoT2JqZWN0KG9iamVjdCk7XG4gICAgcmV0dXJuICRzZWFsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cbiAgZnJlZXplKFN5bWJvbFZhbHVlLnByb3RvdHlwZSk7XG4gIGZ1bmN0aW9uIGlzU3ltYm9sU3RyaW5nKHMpIHtcbiAgICByZXR1cm4gc3ltYm9sVmFsdWVzW3NdIHx8IHByaXZhdGVOYW1lc1tzXTtcbiAgfVxuICBmdW5jdGlvbiB0b1Byb3BlcnR5KG5hbWUpIHtcbiAgICBpZiAoaXNTaGltU3ltYm9sKG5hbWUpKVxuICAgICAgcmV0dXJuIG5hbWVbc3ltYm9sSW50ZXJuYWxQcm9wZXJ0eV07XG4gICAgcmV0dXJuIG5hbWU7XG4gIH1cbiAgZnVuY3Rpb24gcmVtb3ZlU3ltYm9sS2V5cyhhcnJheSkge1xuICAgIHZhciBydiA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghaXNTeW1ib2xTdHJpbmcoYXJyYXlbaV0pKSB7XG4gICAgICAgIHJ2LnB1c2goYXJyYXlbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcnY7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhvYmplY3QpIHtcbiAgICByZXR1cm4gcmVtb3ZlU3ltYm9sS2V5cygkZ2V0T3duUHJvcGVydHlOYW1lcyhvYmplY3QpKTtcbiAgfVxuICBmdW5jdGlvbiBrZXlzKG9iamVjdCkge1xuICAgIHJldHVybiByZW1vdmVTeW1ib2xLZXlzKCRrZXlzKG9iamVjdCkpO1xuICB9XG4gIGZ1bmN0aW9uIGdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpIHtcbiAgICB2YXIgcnYgPSBbXTtcbiAgICB2YXIgbmFtZXMgPSAkZ2V0T3duUHJvcGVydHlOYW1lcyhvYmplY3QpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzeW1ib2wgPSBzeW1ib2xWYWx1ZXNbbmFtZXNbaV1dO1xuICAgICAgaWYgKHN5bWJvbCkge1xuICAgICAgICBydi5wdXNoKHN5bWJvbCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBydjtcbiAgfVxuICBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBuYW1lKSB7XG4gICAgcmV0dXJuICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCB0b1Byb3BlcnR5KG5hbWUpKTtcbiAgfVxuICBmdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShuYW1lKSB7XG4gICAgcmV0dXJuICRoYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsIHRvUHJvcGVydHkobmFtZSkpO1xuICB9XG4gIGZ1bmN0aW9uIGdldE9wdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIGdsb2JhbC50cmFjZXVyICYmIGdsb2JhbC50cmFjZXVyLm9wdGlvbnNbbmFtZV07XG4gIH1cbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkob2JqZWN0LCBuYW1lLCBkZXNjcmlwdG9yKSB7XG4gICAgaWYgKGlzU2hpbVN5bWJvbChuYW1lKSkge1xuICAgICAgbmFtZSA9IG5hbWVbc3ltYm9sSW50ZXJuYWxQcm9wZXJ0eV07XG4gICAgfVxuICAgICRkZWZpbmVQcm9wZXJ0eShvYmplY3QsIG5hbWUsIGRlc2NyaXB0b3IpO1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cbiAgZnVuY3Rpb24gcG9seWZpbGxPYmplY3QoT2JqZWN0KSB7XG4gICAgJGRlZmluZVByb3BlcnR5KE9iamVjdCwgJ2RlZmluZVByb3BlcnR5Jywge3ZhbHVlOiBkZWZpbmVQcm9wZXJ0eX0pO1xuICAgICRkZWZpbmVQcm9wZXJ0eShPYmplY3QsICdnZXRPd25Qcm9wZXJ0eU5hbWVzJywge3ZhbHVlOiBnZXRPd25Qcm9wZXJ0eU5hbWVzfSk7XG4gICAgJGRlZmluZVByb3BlcnR5KE9iamVjdCwgJ2dldE93blByb3BlcnR5RGVzY3JpcHRvcicsIHt2YWx1ZTogZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yfSk7XG4gICAgJGRlZmluZVByb3BlcnR5KE9iamVjdC5wcm90b3R5cGUsICdoYXNPd25Qcm9wZXJ0eScsIHt2YWx1ZTogaGFzT3duUHJvcGVydHl9KTtcbiAgICAkZGVmaW5lUHJvcGVydHkoT2JqZWN0LCAnZnJlZXplJywge3ZhbHVlOiBmcmVlemV9KTtcbiAgICAkZGVmaW5lUHJvcGVydHkoT2JqZWN0LCAncHJldmVudEV4dGVuc2lvbnMnLCB7dmFsdWU6IHByZXZlbnRFeHRlbnNpb25zfSk7XG4gICAgJGRlZmluZVByb3BlcnR5KE9iamVjdCwgJ3NlYWwnLCB7dmFsdWU6IHNlYWx9KTtcbiAgICAkZGVmaW5lUHJvcGVydHkoT2JqZWN0LCAna2V5cycsIHt2YWx1ZToga2V5c30pO1xuICB9XG4gIGZ1bmN0aW9uIGV4cG9ydFN0YXIob2JqZWN0KSB7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBuYW1lcyA9ICRnZXRPd25Qcm9wZXJ0eU5hbWVzKGFyZ3VtZW50c1tpXSk7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG5hbWVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciBuYW1lID0gbmFtZXNbal07XG4gICAgICAgIGlmIChpc1N5bWJvbFN0cmluZyhuYW1lKSlcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgKGZ1bmN0aW9uKG1vZCwgbmFtZSkge1xuICAgICAgICAgICRkZWZpbmVQcm9wZXJ0eShvYmplY3QsIG5hbWUsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBtb2RbbmFtZV07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KShhcmd1bWVudHNbaV0sIG5hbWVzW2pdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuICBmdW5jdGlvbiBpc09iamVjdCh4KSB7XG4gICAgcmV0dXJuIHggIT0gbnVsbCAmJiAodHlwZW9mIHggPT09ICdvYmplY3QnIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nKTtcbiAgfVxuICBmdW5jdGlvbiB0b09iamVjdCh4KSB7XG4gICAgaWYgKHggPT0gbnVsbClcbiAgICAgIHRocm93ICRUeXBlRXJyb3IoKTtcbiAgICByZXR1cm4gJE9iamVjdCh4KTtcbiAgfVxuICBmdW5jdGlvbiBjaGVja09iamVjdENvZXJjaWJsZShhcmd1bWVudCkge1xuICAgIGlmIChhcmd1bWVudCA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdWYWx1ZSBjYW5ub3QgYmUgY29udmVydGVkIHRvIGFuIE9iamVjdCcpO1xuICAgIH1cbiAgICByZXR1cm4gYXJndW1lbnQ7XG4gIH1cbiAgZnVuY3Rpb24gcG9seWZpbGxTeW1ib2woZ2xvYmFsLCBTeW1ib2wpIHtcbiAgICBpZiAoIWdsb2JhbC5TeW1ib2wpIHtcbiAgICAgIGdsb2JhbC5TeW1ib2wgPSBTeW1ib2w7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuICAgIH1cbiAgICBpZiAoIWdsb2JhbC5TeW1ib2wuaXRlcmF0b3IpIHtcbiAgICAgIGdsb2JhbC5TeW1ib2wuaXRlcmF0b3IgPSBTeW1ib2woJ1N5bWJvbC5pdGVyYXRvcicpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBzZXR1cEdsb2JhbHMoZ2xvYmFsKSB7XG4gICAgcG9seWZpbGxTeW1ib2woZ2xvYmFsLCBTeW1ib2wpO1xuICAgIGdsb2JhbC5SZWZsZWN0ID0gZ2xvYmFsLlJlZmxlY3QgfHwge307XG4gICAgZ2xvYmFsLlJlZmxlY3QuZ2xvYmFsID0gZ2xvYmFsLlJlZmxlY3QuZ2xvYmFsIHx8IGdsb2JhbDtcbiAgICBwb2x5ZmlsbE9iamVjdChnbG9iYWwuT2JqZWN0KTtcbiAgfVxuICBzZXR1cEdsb2JhbHMoZ2xvYmFsKTtcbiAgZ2xvYmFsLiR0cmFjZXVyUnVudGltZSA9IHtcbiAgICBjaGVja09iamVjdENvZXJjaWJsZTogY2hlY2tPYmplY3RDb2VyY2libGUsXG4gICAgY3JlYXRlUHJpdmF0ZU5hbWU6IGNyZWF0ZVByaXZhdGVOYW1lLFxuICAgIGRlZmluZVByb3BlcnRpZXM6ICRkZWZpbmVQcm9wZXJ0aWVzLFxuICAgIGRlZmluZVByb3BlcnR5OiAkZGVmaW5lUHJvcGVydHksXG4gICAgZXhwb3J0U3RhcjogZXhwb3J0U3RhcixcbiAgICBnZXRPd25IYXNoT2JqZWN0OiBnZXRPd25IYXNoT2JqZWN0LFxuICAgIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogJGdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgICBnZXRPd25Qcm9wZXJ0eU5hbWVzOiAkZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgICBpc09iamVjdDogaXNPYmplY3QsXG4gICAgaXNQcml2YXRlTmFtZTogaXNQcml2YXRlTmFtZSxcbiAgICBpc1N5bWJvbFN0cmluZzogaXNTeW1ib2xTdHJpbmcsXG4gICAga2V5czogJGtleXMsXG4gICAgc2V0dXBHbG9iYWxzOiBzZXR1cEdsb2JhbHMsXG4gICAgdG9PYmplY3Q6IHRvT2JqZWN0LFxuICAgIHRvUHJvcGVydHk6IHRvUHJvcGVydHksXG4gICAgdHlwZTogdHlwZXMsXG4gICAgdHlwZW9mOiB0eXBlT2ZcbiAgfTtcbn0pKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogdGhpcyk7XG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgZnVuY3Rpb24gc3ByZWFkKCkge1xuICAgIHZhciBydiA9IFtdLFxuICAgICAgICBqID0gMCxcbiAgICAgICAgaXRlclJlc3VsdDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbHVlVG9TcHJlYWQgPSAkdHJhY2V1clJ1bnRpbWUuY2hlY2tPYmplY3RDb2VyY2libGUoYXJndW1lbnRzW2ldKTtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWVUb1NwcmVhZFskdHJhY2V1clJ1bnRpbWUudG9Qcm9wZXJ0eShTeW1ib2wuaXRlcmF0b3IpXSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3Qgc3ByZWFkIG5vbi1pdGVyYWJsZSBvYmplY3QuJyk7XG4gICAgICB9XG4gICAgICB2YXIgaXRlciA9IHZhbHVlVG9TcHJlYWRbJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHkoU3ltYm9sLml0ZXJhdG9yKV0oKTtcbiAgICAgIHdoaWxlICghKGl0ZXJSZXN1bHQgPSBpdGVyLm5leHQoKSkuZG9uZSkge1xuICAgICAgICBydltqKytdID0gaXRlclJlc3VsdC52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJ2O1xuICB9XG4gICR0cmFjZXVyUnVudGltZS5zcHJlYWQgPSBzcHJlYWQ7XG59KSgpO1xuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciAkT2JqZWN0ID0gT2JqZWN0O1xuICB2YXIgJFR5cGVFcnJvciA9IFR5cGVFcnJvcjtcbiAgdmFyICRjcmVhdGUgPSAkT2JqZWN0LmNyZWF0ZTtcbiAgdmFyICRkZWZpbmVQcm9wZXJ0aWVzID0gJHRyYWNldXJSdW50aW1lLmRlZmluZVByb3BlcnRpZXM7XG4gIHZhciAkZGVmaW5lUHJvcGVydHkgPSAkdHJhY2V1clJ1bnRpbWUuZGVmaW5lUHJvcGVydHk7XG4gIHZhciAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gJHRyYWNldXJSdW50aW1lLmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbiAgdmFyICRnZXRPd25Qcm9wZXJ0eU5hbWVzID0gJHRyYWNldXJSdW50aW1lLmdldE93blByb3BlcnR5TmFtZXM7XG4gIHZhciAkZ2V0UHJvdG90eXBlT2YgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG4gIHZhciAkX18wID0gT2JqZWN0LFxuICAgICAgZ2V0T3duUHJvcGVydHlOYW1lcyA9ICRfXzAuZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgICAgIGdldE93blByb3BlcnR5U3ltYm9scyA9ICRfXzAuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuICBmdW5jdGlvbiBzdXBlckRlc2NyaXB0b3IoaG9tZU9iamVjdCwgbmFtZSkge1xuICAgIHZhciBwcm90byA9ICRnZXRQcm90b3R5cGVPZihob21lT2JqZWN0KTtcbiAgICBkbyB7XG4gICAgICB2YXIgcmVzdWx0ID0gJGdldE93blByb3BlcnR5RGVzY3JpcHRvcihwcm90bywgbmFtZSk7XG4gICAgICBpZiAocmVzdWx0KVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgcHJvdG8gPSAkZ2V0UHJvdG90eXBlT2YocHJvdG8pO1xuICAgIH0gd2hpbGUgKHByb3RvKTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIGZ1bmN0aW9uIHN1cGVyQ2FsbChzZWxmLCBob21lT2JqZWN0LCBuYW1lLCBhcmdzKSB7XG4gICAgcmV0dXJuIHN1cGVyR2V0KHNlbGYsIGhvbWVPYmplY3QsIG5hbWUpLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICB9XG4gIGZ1bmN0aW9uIHN1cGVyR2V0KHNlbGYsIGhvbWVPYmplY3QsIG5hbWUpIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IHN1cGVyRGVzY3JpcHRvcihob21lT2JqZWN0LCBuYW1lKTtcbiAgICBpZiAoZGVzY3JpcHRvcikge1xuICAgICAgaWYgKCFkZXNjcmlwdG9yLmdldClcbiAgICAgICAgcmV0dXJuIGRlc2NyaXB0b3IudmFsdWU7XG4gICAgICByZXR1cm4gZGVzY3JpcHRvci5nZXQuY2FsbChzZWxmKTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICBmdW5jdGlvbiBzdXBlclNldChzZWxmLCBob21lT2JqZWN0LCBuYW1lLCB2YWx1ZSkge1xuICAgIHZhciBkZXNjcmlwdG9yID0gc3VwZXJEZXNjcmlwdG9yKGhvbWVPYmplY3QsIG5hbWUpO1xuICAgIGlmIChkZXNjcmlwdG9yICYmIGRlc2NyaXB0b3Iuc2V0KSB7XG4gICAgICBkZXNjcmlwdG9yLnNldC5jYWxsKHNlbGYsIHZhbHVlKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgdGhyb3cgJFR5cGVFcnJvcigoXCJzdXBlciBoYXMgbm8gc2V0dGVyICdcIiArIG5hbWUgKyBcIicuXCIpKTtcbiAgfVxuICBmdW5jdGlvbiBnZXREZXNjcmlwdG9ycyhvYmplY3QpIHtcbiAgICB2YXIgZGVzY3JpcHRvcnMgPSB7fTtcbiAgICB2YXIgbmFtZXMgPSBnZXRPd25Qcm9wZXJ0eU5hbWVzKG9iamVjdCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIG5hbWUgPSBuYW1lc1tpXTtcbiAgICAgIGRlc2NyaXB0b3JzW25hbWVdID0gJGdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIG5hbWUpO1xuICAgIH1cbiAgICB2YXIgc3ltYm9scyA9IGdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3ltYm9scy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHN5bWJvbCA9IHN5bWJvbHNbaV07XG4gICAgICBkZXNjcmlwdG9yc1skdHJhY2V1clJ1bnRpbWUudG9Qcm9wZXJ0eShzeW1ib2wpXSA9ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCAkdHJhY2V1clJ1bnRpbWUudG9Qcm9wZXJ0eShzeW1ib2wpKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlc2NyaXB0b3JzO1xuICB9XG4gIGZ1bmN0aW9uIGNyZWF0ZUNsYXNzKGN0b3IsIG9iamVjdCwgc3RhdGljT2JqZWN0LCBzdXBlckNsYXNzKSB7XG4gICAgJGRlZmluZVByb3BlcnR5KG9iamVjdCwgJ2NvbnN0cnVjdG9yJywge1xuICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAzKSB7XG4gICAgICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgPT09ICdmdW5jdGlvbicpXG4gICAgICAgIGN0b3IuX19wcm90b19fID0gc3VwZXJDbGFzcztcbiAgICAgIGN0b3IucHJvdG90eXBlID0gJGNyZWF0ZShnZXRQcm90b1BhcmVudChzdXBlckNsYXNzKSwgZ2V0RGVzY3JpcHRvcnMob2JqZWN0KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gb2JqZWN0O1xuICAgIH1cbiAgICAkZGVmaW5lUHJvcGVydHkoY3RvciwgJ3Byb3RvdHlwZScsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9KTtcbiAgICByZXR1cm4gJGRlZmluZVByb3BlcnRpZXMoY3RvciwgZ2V0RGVzY3JpcHRvcnMoc3RhdGljT2JqZWN0KSk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0UHJvdG9QYXJlbnQoc3VwZXJDbGFzcykge1xuICAgIGlmICh0eXBlb2Ygc3VwZXJDbGFzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdmFyIHByb3RvdHlwZSA9IHN1cGVyQ2xhc3MucHJvdG90eXBlO1xuICAgICAgaWYgKCRPYmplY3QocHJvdG90eXBlKSA9PT0gcHJvdG90eXBlIHx8IHByb3RvdHlwZSA9PT0gbnVsbClcbiAgICAgICAgcmV0dXJuIHN1cGVyQ2xhc3MucHJvdG90eXBlO1xuICAgICAgdGhyb3cgbmV3ICRUeXBlRXJyb3IoJ3N1cGVyIHByb3RvdHlwZSBtdXN0IGJlIGFuIE9iamVjdCBvciBudWxsJyk7XG4gICAgfVxuICAgIGlmIChzdXBlckNsYXNzID09PSBudWxsKVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgdGhyb3cgbmV3ICRUeXBlRXJyb3IoKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzICsgXCIuXCIpKTtcbiAgfVxuICBmdW5jdGlvbiBkZWZhdWx0U3VwZXJDYWxsKHNlbGYsIGhvbWVPYmplY3QsIGFyZ3MpIHtcbiAgICBpZiAoJGdldFByb3RvdHlwZU9mKGhvbWVPYmplY3QpICE9PSBudWxsKVxuICAgICAgc3VwZXJDYWxsKHNlbGYsIGhvbWVPYmplY3QsICdjb25zdHJ1Y3RvcicsIGFyZ3MpO1xuICB9XG4gICR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcyA9IGNyZWF0ZUNsYXNzO1xuICAkdHJhY2V1clJ1bnRpbWUuZGVmYXVsdFN1cGVyQ2FsbCA9IGRlZmF1bHRTdXBlckNhbGw7XG4gICR0cmFjZXVyUnVudGltZS5zdXBlckNhbGwgPSBzdXBlckNhbGw7XG4gICR0cmFjZXVyUnVudGltZS5zdXBlckdldCA9IHN1cGVyR2V0O1xuICAkdHJhY2V1clJ1bnRpbWUuc3VwZXJTZXQgPSBzdXBlclNldDtcbn0pKCk7XG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgdmFyIGNyZWF0ZVByaXZhdGVOYW1lID0gJHRyYWNldXJSdW50aW1lLmNyZWF0ZVByaXZhdGVOYW1lO1xuICB2YXIgJGRlZmluZVByb3BlcnRpZXMgPSAkdHJhY2V1clJ1bnRpbWUuZGVmaW5lUHJvcGVydGllcztcbiAgdmFyICRkZWZpbmVQcm9wZXJ0eSA9ICR0cmFjZXVyUnVudGltZS5kZWZpbmVQcm9wZXJ0eTtcbiAgdmFyICRjcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xuICB2YXIgJFR5cGVFcnJvciA9IFR5cGVFcnJvcjtcbiAgZnVuY3Rpb24gbm9uRW51bSh2YWx1ZSkge1xuICAgIHJldHVybiB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfTtcbiAgfVxuICB2YXIgU1RfTkVXQk9STiA9IDA7XG4gIHZhciBTVF9FWEVDVVRJTkcgPSAxO1xuICB2YXIgU1RfU1VTUEVOREVEID0gMjtcbiAgdmFyIFNUX0NMT1NFRCA9IDM7XG4gIHZhciBFTkRfU1RBVEUgPSAtMjtcbiAgdmFyIFJFVEhST1dfU1RBVEUgPSAtMztcbiAgZnVuY3Rpb24gZ2V0SW50ZXJuYWxFcnJvcihzdGF0ZSkge1xuICAgIHJldHVybiBuZXcgRXJyb3IoJ1RyYWNldXIgY29tcGlsZXIgYnVnOiBpbnZhbGlkIHN0YXRlIGluIHN0YXRlIG1hY2hpbmU6ICcgKyBzdGF0ZSk7XG4gIH1cbiAgZnVuY3Rpb24gR2VuZXJhdG9yQ29udGV4dCgpIHtcbiAgICB0aGlzLnN0YXRlID0gMDtcbiAgICB0aGlzLkdTdGF0ZSA9IFNUX05FV0JPUk47XG4gICAgdGhpcy5zdG9yZWRFeGNlcHRpb24gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5maW5hbGx5RmFsbFRocm91Z2ggPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5zZW50XyA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnJldHVyblZhbHVlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMudHJ5U3RhY2tfID0gW107XG4gIH1cbiAgR2VuZXJhdG9yQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gICAgcHVzaFRyeTogZnVuY3Rpb24oY2F0Y2hTdGF0ZSwgZmluYWxseVN0YXRlKSB7XG4gICAgICBpZiAoZmluYWxseVN0YXRlICE9PSBudWxsKSB7XG4gICAgICAgIHZhciBmaW5hbGx5RmFsbFRocm91Z2ggPSBudWxsO1xuICAgICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlTdGFja18ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBpZiAodGhpcy50cnlTdGFja19baV0uY2F0Y2ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZmluYWxseUZhbGxUaHJvdWdoID0gdGhpcy50cnlTdGFja19baV0uY2F0Y2g7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbmFsbHlGYWxsVGhyb3VnaCA9PT0gbnVsbClcbiAgICAgICAgICBmaW5hbGx5RmFsbFRocm91Z2ggPSBSRVRIUk9XX1NUQVRFO1xuICAgICAgICB0aGlzLnRyeVN0YWNrXy5wdXNoKHtcbiAgICAgICAgICBmaW5hbGx5OiBmaW5hbGx5U3RhdGUsXG4gICAgICAgICAgZmluYWxseUZhbGxUaHJvdWdoOiBmaW5hbGx5RmFsbFRocm91Z2hcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoY2F0Y2hTdGF0ZSAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnRyeVN0YWNrXy5wdXNoKHtjYXRjaDogY2F0Y2hTdGF0ZX0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgcG9wVHJ5OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMudHJ5U3RhY2tfLnBvcCgpO1xuICAgIH0sXG4gICAgZ2V0IHNlbnQoKSB7XG4gICAgICB0aGlzLm1heWJlVGhyb3coKTtcbiAgICAgIHJldHVybiB0aGlzLnNlbnRfO1xuICAgIH0sXG4gICAgc2V0IHNlbnQodikge1xuICAgICAgdGhpcy5zZW50XyA9IHY7XG4gICAgfSxcbiAgICBnZXQgc2VudElnbm9yZVRocm93KCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2VudF87XG4gICAgfSxcbiAgICBtYXliZVRocm93OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLmFjdGlvbiA9PT0gJ3Rocm93Jykge1xuICAgICAgICB0aGlzLmFjdGlvbiA9ICduZXh0JztcbiAgICAgICAgdGhyb3cgdGhpcy5zZW50XztcbiAgICAgIH1cbiAgICB9LFxuICAgIGVuZDogZnVuY3Rpb24oKSB7XG4gICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUpIHtcbiAgICAgICAgY2FzZSBFTkRfU1RBVEU6XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIGNhc2UgUkVUSFJPV19TVEFURTpcbiAgICAgICAgICB0aHJvdyB0aGlzLnN0b3JlZEV4Y2VwdGlvbjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBnZXRJbnRlcm5hbEVycm9yKHRoaXMuc3RhdGUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgaGFuZGxlRXhjZXB0aW9uOiBmdW5jdGlvbihleCkge1xuICAgICAgdGhpcy5HU3RhdGUgPSBTVF9DTE9TRUQ7XG4gICAgICB0aGlzLnN0YXRlID0gRU5EX1NUQVRFO1xuICAgICAgdGhyb3cgZXg7XG4gICAgfVxuICB9O1xuICBmdW5jdGlvbiBuZXh0T3JUaHJvdyhjdHgsIG1vdmVOZXh0LCBhY3Rpb24sIHgpIHtcbiAgICBzd2l0Y2ggKGN0eC5HU3RhdGUpIHtcbiAgICAgIGNhc2UgU1RfRVhFQ1VUSU5HOlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKFwiXFxcIlwiICsgYWN0aW9uICsgXCJcXFwiIG9uIGV4ZWN1dGluZyBnZW5lcmF0b3JcIikpO1xuICAgICAgY2FzZSBTVF9DTE9TRUQ6XG4gICAgICAgIGlmIChhY3Rpb24gPT0gJ25leHQnKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBkb25lOiB0cnVlXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyB4O1xuICAgICAgY2FzZSBTVF9ORVdCT1JOOlxuICAgICAgICBpZiAoYWN0aW9uID09PSAndGhyb3cnKSB7XG4gICAgICAgICAgY3R4LkdTdGF0ZSA9IFNUX0NMT1NFRDtcbiAgICAgICAgICB0aHJvdyB4O1xuICAgICAgICB9XG4gICAgICAgIGlmICh4ICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgdGhyb3cgJFR5cGVFcnJvcignU2VudCB2YWx1ZSB0byBuZXdib3JuIGdlbmVyYXRvcicpO1xuICAgICAgY2FzZSBTVF9TVVNQRU5ERUQ6XG4gICAgICAgIGN0eC5HU3RhdGUgPSBTVF9FWEVDVVRJTkc7XG4gICAgICAgIGN0eC5hY3Rpb24gPSBhY3Rpb247XG4gICAgICAgIGN0eC5zZW50ID0geDtcbiAgICAgICAgdmFyIHZhbHVlID0gbW92ZU5leHQoY3R4KTtcbiAgICAgICAgdmFyIGRvbmUgPSB2YWx1ZSA9PT0gY3R4O1xuICAgICAgICBpZiAoZG9uZSlcbiAgICAgICAgICB2YWx1ZSA9IGN0eC5yZXR1cm5WYWx1ZTtcbiAgICAgICAgY3R4LkdTdGF0ZSA9IGRvbmUgPyBTVF9DTE9TRUQgOiBTVF9TVVNQRU5ERUQ7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgIGRvbmU6IGRvbmVcbiAgICAgICAgfTtcbiAgICB9XG4gIH1cbiAgdmFyIGN0eE5hbWUgPSBjcmVhdGVQcml2YXRlTmFtZSgpO1xuICB2YXIgbW92ZU5leHROYW1lID0gY3JlYXRlUHJpdmF0ZU5hbWUoKTtcbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb24oKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSgpIHt9XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICAkZGVmaW5lUHJvcGVydHkoR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUsICdjb25zdHJ1Y3RvcicsIG5vbkVudW0oR2VuZXJhdG9yRnVuY3Rpb24pKTtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID0ge1xuICAgIGNvbnN0cnVjdG9yOiBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSxcbiAgICBuZXh0OiBmdW5jdGlvbih2KSB7XG4gICAgICByZXR1cm4gbmV4dE9yVGhyb3codGhpc1tjdHhOYW1lXSwgdGhpc1ttb3ZlTmV4dE5hbWVdLCAnbmV4dCcsIHYpO1xuICAgIH0sXG4gICAgdGhyb3c6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHJldHVybiBuZXh0T3JUaHJvdyh0aGlzW2N0eE5hbWVdLCB0aGlzW21vdmVOZXh0TmFtZV0sICd0aHJvdycsIHYpO1xuICAgIH1cbiAgfTtcbiAgJGRlZmluZVByb3BlcnRpZXMoR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IHtlbnVtZXJhYmxlOiBmYWxzZX0sXG4gICAgbmV4dDoge2VudW1lcmFibGU6IGZhbHNlfSxcbiAgICB0aHJvdzoge2VudW1lcmFibGU6IGZhbHNlfVxuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSwgU3ltYm9sLml0ZXJhdG9yLCBub25FbnVtKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9KSk7XG4gIGZ1bmN0aW9uIGNyZWF0ZUdlbmVyYXRvckluc3RhbmNlKGlubmVyRnVuY3Rpb24sIGZ1bmN0aW9uT2JqZWN0LCBzZWxmKSB7XG4gICAgdmFyIG1vdmVOZXh0ID0gZ2V0TW92ZU5leHQoaW5uZXJGdW5jdGlvbiwgc2VsZik7XG4gICAgdmFyIGN0eCA9IG5ldyBHZW5lcmF0b3JDb250ZXh0KCk7XG4gICAgdmFyIG9iamVjdCA9ICRjcmVhdGUoZnVuY3Rpb25PYmplY3QucHJvdG90eXBlKTtcbiAgICBvYmplY3RbY3R4TmFtZV0gPSBjdHg7XG4gICAgb2JqZWN0W21vdmVOZXh0TmFtZV0gPSBtb3ZlTmV4dDtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG4gIGZ1bmN0aW9uIGluaXRHZW5lcmF0b3JGdW5jdGlvbihmdW5jdGlvbk9iamVjdCkge1xuICAgIGZ1bmN0aW9uT2JqZWN0LnByb3RvdHlwZSA9ICRjcmVhdGUoR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlKTtcbiAgICBmdW5jdGlvbk9iamVjdC5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgICByZXR1cm4gZnVuY3Rpb25PYmplY3Q7XG4gIH1cbiAgZnVuY3Rpb24gQXN5bmNGdW5jdGlvbkNvbnRleHQoKSB7XG4gICAgR2VuZXJhdG9yQ29udGV4dC5jYWxsKHRoaXMpO1xuICAgIHRoaXMuZXJyID0gdW5kZWZpbmVkO1xuICAgIHZhciBjdHggPSB0aGlzO1xuICAgIGN0eC5yZXN1bHQgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGN0eC5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIGN0eC5yZWplY3QgPSByZWplY3Q7XG4gICAgfSk7XG4gIH1cbiAgQXN5bmNGdW5jdGlvbkNvbnRleHQucHJvdG90eXBlID0gJGNyZWF0ZShHZW5lcmF0b3JDb250ZXh0LnByb3RvdHlwZSk7XG4gIEFzeW5jRnVuY3Rpb25Db250ZXh0LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbigpIHtcbiAgICBzd2l0Y2ggKHRoaXMuc3RhdGUpIHtcbiAgICAgIGNhc2UgRU5EX1NUQVRFOlxuICAgICAgICB0aGlzLnJlc29sdmUodGhpcy5yZXR1cm5WYWx1ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBSRVRIUk9XX1NUQVRFOlxuICAgICAgICB0aGlzLnJlamVjdCh0aGlzLnN0b3JlZEV4Y2VwdGlvbik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5yZWplY3QoZ2V0SW50ZXJuYWxFcnJvcih0aGlzLnN0YXRlKSk7XG4gICAgfVxuICB9O1xuICBBc3luY0Z1bmN0aW9uQ29udGV4dC5wcm90b3R5cGUuaGFuZGxlRXhjZXB0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdGF0ZSA9IFJFVEhST1dfU1RBVEU7XG4gIH07XG4gIGZ1bmN0aW9uIGFzeW5jV3JhcChpbm5lckZ1bmN0aW9uLCBzZWxmKSB7XG4gICAgdmFyIG1vdmVOZXh0ID0gZ2V0TW92ZU5leHQoaW5uZXJGdW5jdGlvbiwgc2VsZik7XG4gICAgdmFyIGN0eCA9IG5ldyBBc3luY0Z1bmN0aW9uQ29udGV4dCgpO1xuICAgIGN0eC5jcmVhdGVDYWxsYmFjayA9IGZ1bmN0aW9uKG5ld1N0YXRlKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgY3R4LnN0YXRlID0gbmV3U3RhdGU7XG4gICAgICAgIGN0eC52YWx1ZSA9IHZhbHVlO1xuICAgICAgICBtb3ZlTmV4dChjdHgpO1xuICAgICAgfTtcbiAgICB9O1xuICAgIGN0eC5lcnJiYWNrID0gZnVuY3Rpb24oZXJyKSB7XG4gICAgICBoYW5kbGVDYXRjaChjdHgsIGVycik7XG4gICAgICBtb3ZlTmV4dChjdHgpO1xuICAgIH07XG4gICAgbW92ZU5leHQoY3R4KTtcbiAgICByZXR1cm4gY3R4LnJlc3VsdDtcbiAgfVxuICBmdW5jdGlvbiBnZXRNb3ZlTmV4dChpbm5lckZ1bmN0aW9uLCBzZWxmKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGN0eCkge1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gaW5uZXJGdW5jdGlvbi5jYWxsKHNlbGYsIGN0eCk7XG4gICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgaGFuZGxlQ2F0Y2goY3R4LCBleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGhhbmRsZUNhdGNoKGN0eCwgZXgpIHtcbiAgICBjdHguc3RvcmVkRXhjZXB0aW9uID0gZXg7XG4gICAgdmFyIGxhc3QgPSBjdHgudHJ5U3RhY2tfW2N0eC50cnlTdGFja18ubGVuZ3RoIC0gMV07XG4gICAgaWYgKCFsYXN0KSB7XG4gICAgICBjdHguaGFuZGxlRXhjZXB0aW9uKGV4KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY3R4LnN0YXRlID0gbGFzdC5jYXRjaCAhPT0gdW5kZWZpbmVkID8gbGFzdC5jYXRjaCA6IGxhc3QuZmluYWxseTtcbiAgICBpZiAobGFzdC5maW5hbGx5RmFsbFRocm91Z2ggIT09IHVuZGVmaW5lZClcbiAgICAgIGN0eC5maW5hbGx5RmFsbFRocm91Z2ggPSBsYXN0LmZpbmFsbHlGYWxsVGhyb3VnaDtcbiAgfVxuICAkdHJhY2V1clJ1bnRpbWUuYXN5bmNXcmFwID0gYXN5bmNXcmFwO1xuICAkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uID0gaW5pdEdlbmVyYXRvckZ1bmN0aW9uO1xuICAkdHJhY2V1clJ1bnRpbWUuY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UgPSBjcmVhdGVHZW5lcmF0b3JJbnN0YW5jZTtcbn0pKCk7XG4oZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIGJ1aWxkRnJvbUVuY29kZWRQYXJ0cyhvcHRfc2NoZW1lLCBvcHRfdXNlckluZm8sIG9wdF9kb21haW4sIG9wdF9wb3J0LCBvcHRfcGF0aCwgb3B0X3F1ZXJ5RGF0YSwgb3B0X2ZyYWdtZW50KSB7XG4gICAgdmFyIG91dCA9IFtdO1xuICAgIGlmIChvcHRfc2NoZW1lKSB7XG4gICAgICBvdXQucHVzaChvcHRfc2NoZW1lLCAnOicpO1xuICAgIH1cbiAgICBpZiAob3B0X2RvbWFpbikge1xuICAgICAgb3V0LnB1c2goJy8vJyk7XG4gICAgICBpZiAob3B0X3VzZXJJbmZvKSB7XG4gICAgICAgIG91dC5wdXNoKG9wdF91c2VySW5mbywgJ0AnKTtcbiAgICAgIH1cbiAgICAgIG91dC5wdXNoKG9wdF9kb21haW4pO1xuICAgICAgaWYgKG9wdF9wb3J0KSB7XG4gICAgICAgIG91dC5wdXNoKCc6Jywgb3B0X3BvcnQpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAob3B0X3BhdGgpIHtcbiAgICAgIG91dC5wdXNoKG9wdF9wYXRoKTtcbiAgICB9XG4gICAgaWYgKG9wdF9xdWVyeURhdGEpIHtcbiAgICAgIG91dC5wdXNoKCc/Jywgb3B0X3F1ZXJ5RGF0YSk7XG4gICAgfVxuICAgIGlmIChvcHRfZnJhZ21lbnQpIHtcbiAgICAgIG91dC5wdXNoKCcjJywgb3B0X2ZyYWdtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIG91dC5qb2luKCcnKTtcbiAgfVxuICA7XG4gIHZhciBzcGxpdFJlID0gbmV3IFJlZ0V4cCgnXicgKyAnKD86JyArICcoW146Lz8jLl0rKScgKyAnOik/JyArICcoPzovLycgKyAnKD86KFteLz8jXSopQCk/JyArICcoW1xcXFx3XFxcXGRcXFxcLVxcXFx1MDEwMC1cXFxcdWZmZmYuJV0qKScgKyAnKD86OihbMC05XSspKT8nICsgJyk/JyArICcoW14/I10rKT8nICsgJyg/OlxcXFw/KFteI10qKSk/JyArICcoPzojKC4qKSk/JyArICckJyk7XG4gIHZhciBDb21wb25lbnRJbmRleCA9IHtcbiAgICBTQ0hFTUU6IDEsXG4gICAgVVNFUl9JTkZPOiAyLFxuICAgIERPTUFJTjogMyxcbiAgICBQT1JUOiA0LFxuICAgIFBBVEg6IDUsXG4gICAgUVVFUllfREFUQTogNixcbiAgICBGUkFHTUVOVDogN1xuICB9O1xuICBmdW5jdGlvbiBzcGxpdCh1cmkpIHtcbiAgICByZXR1cm4gKHVyaS5tYXRjaChzcGxpdFJlKSk7XG4gIH1cbiAgZnVuY3Rpb24gcmVtb3ZlRG90U2VnbWVudHMocGF0aCkge1xuICAgIGlmIChwYXRoID09PSAnLycpXG4gICAgICByZXR1cm4gJy8nO1xuICAgIHZhciBsZWFkaW5nU2xhc2ggPSBwYXRoWzBdID09PSAnLycgPyAnLycgOiAnJztcbiAgICB2YXIgdHJhaWxpbmdTbGFzaCA9IHBhdGguc2xpY2UoLTEpID09PSAnLycgPyAnLycgOiAnJztcbiAgICB2YXIgc2VnbWVudHMgPSBwYXRoLnNwbGl0KCcvJyk7XG4gICAgdmFyIG91dCA9IFtdO1xuICAgIHZhciB1cCA9IDA7XG4gICAgZm9yICh2YXIgcG9zID0gMDsgcG9zIDwgc2VnbWVudHMubGVuZ3RoOyBwb3MrKykge1xuICAgICAgdmFyIHNlZ21lbnQgPSBzZWdtZW50c1twb3NdO1xuICAgICAgc3dpdGNoIChzZWdtZW50KSB7XG4gICAgICAgIGNhc2UgJyc6XG4gICAgICAgIGNhc2UgJy4nOlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICcuLic6XG4gICAgICAgICAgaWYgKG91dC5sZW5ndGgpXG4gICAgICAgICAgICBvdXQucG9wKCk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgdXArKztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBvdXQucHVzaChzZWdtZW50KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFsZWFkaW5nU2xhc2gpIHtcbiAgICAgIHdoaWxlICh1cC0tID4gMCkge1xuICAgICAgICBvdXQudW5zaGlmdCgnLi4nKTtcbiAgICAgIH1cbiAgICAgIGlmIChvdXQubGVuZ3RoID09PSAwKVxuICAgICAgICBvdXQucHVzaCgnLicpO1xuICAgIH1cbiAgICByZXR1cm4gbGVhZGluZ1NsYXNoICsgb3V0LmpvaW4oJy8nKSArIHRyYWlsaW5nU2xhc2g7XG4gIH1cbiAgZnVuY3Rpb24gam9pbkFuZENhbm9uaWNhbGl6ZVBhdGgocGFydHMpIHtcbiAgICB2YXIgcGF0aCA9IHBhcnRzW0NvbXBvbmVudEluZGV4LlBBVEhdIHx8ICcnO1xuICAgIHBhdGggPSByZW1vdmVEb3RTZWdtZW50cyhwYXRoKTtcbiAgICBwYXJ0c1tDb21wb25lbnRJbmRleC5QQVRIXSA9IHBhdGg7XG4gICAgcmV0dXJuIGJ1aWxkRnJvbUVuY29kZWRQYXJ0cyhwYXJ0c1tDb21wb25lbnRJbmRleC5TQ0hFTUVdLCBwYXJ0c1tDb21wb25lbnRJbmRleC5VU0VSX0lORk9dLCBwYXJ0c1tDb21wb25lbnRJbmRleC5ET01BSU5dLCBwYXJ0c1tDb21wb25lbnRJbmRleC5QT1JUXSwgcGFydHNbQ29tcG9uZW50SW5kZXguUEFUSF0sIHBhcnRzW0NvbXBvbmVudEluZGV4LlFVRVJZX0RBVEFdLCBwYXJ0c1tDb21wb25lbnRJbmRleC5GUkFHTUVOVF0pO1xuICB9XG4gIGZ1bmN0aW9uIGNhbm9uaWNhbGl6ZVVybCh1cmwpIHtcbiAgICB2YXIgcGFydHMgPSBzcGxpdCh1cmwpO1xuICAgIHJldHVybiBqb2luQW5kQ2Fub25pY2FsaXplUGF0aChwYXJ0cyk7XG4gIH1cbiAgZnVuY3Rpb24gcmVzb2x2ZVVybChiYXNlLCB1cmwpIHtcbiAgICB2YXIgcGFydHMgPSBzcGxpdCh1cmwpO1xuICAgIHZhciBiYXNlUGFydHMgPSBzcGxpdChiYXNlKTtcbiAgICBpZiAocGFydHNbQ29tcG9uZW50SW5kZXguU0NIRU1FXSkge1xuICAgICAgcmV0dXJuIGpvaW5BbmRDYW5vbmljYWxpemVQYXRoKHBhcnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydHNbQ29tcG9uZW50SW5kZXguU0NIRU1FXSA9IGJhc2VQYXJ0c1tDb21wb25lbnRJbmRleC5TQ0hFTUVdO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gQ29tcG9uZW50SW5kZXguU0NIRU1FOyBpIDw9IENvbXBvbmVudEluZGV4LlBPUlQ7IGkrKykge1xuICAgICAgaWYgKCFwYXJ0c1tpXSkge1xuICAgICAgICBwYXJ0c1tpXSA9IGJhc2VQYXJ0c1tpXTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBhcnRzW0NvbXBvbmVudEluZGV4LlBBVEhdWzBdID09ICcvJykge1xuICAgICAgcmV0dXJuIGpvaW5BbmRDYW5vbmljYWxpemVQYXRoKHBhcnRzKTtcbiAgICB9XG4gICAgdmFyIHBhdGggPSBiYXNlUGFydHNbQ29tcG9uZW50SW5kZXguUEFUSF07XG4gICAgdmFyIGluZGV4ID0gcGF0aC5sYXN0SW5kZXhPZignLycpO1xuICAgIHBhdGggPSBwYXRoLnNsaWNlKDAsIGluZGV4ICsgMSkgKyBwYXJ0c1tDb21wb25lbnRJbmRleC5QQVRIXTtcbiAgICBwYXJ0c1tDb21wb25lbnRJbmRleC5QQVRIXSA9IHBhdGg7XG4gICAgcmV0dXJuIGpvaW5BbmRDYW5vbmljYWxpemVQYXRoKHBhcnRzKTtcbiAgfVxuICBmdW5jdGlvbiBpc0Fic29sdXRlKG5hbWUpIHtcbiAgICBpZiAoIW5hbWUpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgaWYgKG5hbWVbMF0gPT09ICcvJylcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIHZhciBwYXJ0cyA9IHNwbGl0KG5hbWUpO1xuICAgIGlmIChwYXJ0c1tDb21wb25lbnRJbmRleC5TQ0hFTUVdKVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gICR0cmFjZXVyUnVudGltZS5jYW5vbmljYWxpemVVcmwgPSBjYW5vbmljYWxpemVVcmw7XG4gICR0cmFjZXVyUnVudGltZS5pc0Fic29sdXRlID0gaXNBYnNvbHV0ZTtcbiAgJHRyYWNldXJSdW50aW1lLnJlbW92ZURvdFNlZ21lbnRzID0gcmVtb3ZlRG90U2VnbWVudHM7XG4gICR0cmFjZXVyUnVudGltZS5yZXNvbHZlVXJsID0gcmVzb2x2ZVVybDtcbn0pKCk7XG4oZnVuY3Rpb24oZ2xvYmFsKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgdmFyICRfXzIgPSAkdHJhY2V1clJ1bnRpbWUsXG4gICAgICBjYW5vbmljYWxpemVVcmwgPSAkX18yLmNhbm9uaWNhbGl6ZVVybCxcbiAgICAgIHJlc29sdmVVcmwgPSAkX18yLnJlc29sdmVVcmwsXG4gICAgICBpc0Fic29sdXRlID0gJF9fMi5pc0Fic29sdXRlO1xuICB2YXIgbW9kdWxlSW5zdGFudGlhdG9ycyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIHZhciBiYXNlVVJMO1xuICBpZiAoZ2xvYmFsLmxvY2F0aW9uICYmIGdsb2JhbC5sb2NhdGlvbi5ocmVmKVxuICAgIGJhc2VVUkwgPSByZXNvbHZlVXJsKGdsb2JhbC5sb2NhdGlvbi5ocmVmLCAnLi8nKTtcbiAgZWxzZVxuICAgIGJhc2VVUkwgPSAnJztcbiAgdmFyIFVuY29hdGVkTW9kdWxlRW50cnkgPSBmdW5jdGlvbiBVbmNvYXRlZE1vZHVsZUVudHJ5KHVybCwgdW5jb2F0ZWRNb2R1bGUpIHtcbiAgICB0aGlzLnVybCA9IHVybDtcbiAgICB0aGlzLnZhbHVlXyA9IHVuY29hdGVkTW9kdWxlO1xuICB9O1xuICAoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKShVbmNvYXRlZE1vZHVsZUVudHJ5LCB7fSwge30pO1xuICB2YXIgTW9kdWxlRXZhbHVhdGlvbkVycm9yID0gZnVuY3Rpb24gTW9kdWxlRXZhbHVhdGlvbkVycm9yKGVycm9uZW91c01vZHVsZU5hbWUsIGNhdXNlKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lICsgJzogJyArIHRoaXMuc3RyaXBDYXVzZShjYXVzZSkgKyAnIGluICcgKyBlcnJvbmVvdXNNb2R1bGVOYW1lO1xuICAgIGlmICghKGNhdXNlIGluc3RhbmNlb2YgJE1vZHVsZUV2YWx1YXRpb25FcnJvcikgJiYgY2F1c2Uuc3RhY2spXG4gICAgICB0aGlzLnN0YWNrID0gdGhpcy5zdHJpcFN0YWNrKGNhdXNlLnN0YWNrKTtcbiAgICBlbHNlXG4gICAgICB0aGlzLnN0YWNrID0gJyc7XG4gIH07XG4gIHZhciAkTW9kdWxlRXZhbHVhdGlvbkVycm9yID0gTW9kdWxlRXZhbHVhdGlvbkVycm9yO1xuICAoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKShNb2R1bGVFdmFsdWF0aW9uRXJyb3IsIHtcbiAgICBzdHJpcEVycm9yOiBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICByZXR1cm4gbWVzc2FnZS5yZXBsYWNlKC8uKkVycm9yOi8sIHRoaXMuY29uc3RydWN0b3IubmFtZSArICc6Jyk7XG4gICAgfSxcbiAgICBzdHJpcENhdXNlOiBmdW5jdGlvbihjYXVzZSkge1xuICAgICAgaWYgKCFjYXVzZSlcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgaWYgKCFjYXVzZS5tZXNzYWdlKVxuICAgICAgICByZXR1cm4gY2F1c2UgKyAnJztcbiAgICAgIHJldHVybiB0aGlzLnN0cmlwRXJyb3IoY2F1c2UubWVzc2FnZSk7XG4gICAgfSxcbiAgICBsb2FkZWRCeTogZnVuY3Rpb24obW9kdWxlTmFtZSkge1xuICAgICAgdGhpcy5zdGFjayArPSAnXFxuIGxvYWRlZCBieSAnICsgbW9kdWxlTmFtZTtcbiAgICB9LFxuICAgIHN0cmlwU3RhY2s6IGZ1bmN0aW9uKGNhdXNlU3RhY2spIHtcbiAgICAgIHZhciBzdGFjayA9IFtdO1xuICAgICAgY2F1c2VTdGFjay5zcGxpdCgnXFxuJykuc29tZSgoZnVuY3Rpb24oZnJhbWUpIHtcbiAgICAgICAgaWYgKC9VbmNvYXRlZE1vZHVsZUluc3RhbnRpYXRvci8udGVzdChmcmFtZSkpXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIHN0YWNrLnB1c2goZnJhbWUpO1xuICAgICAgfSkpO1xuICAgICAgc3RhY2tbMF0gPSB0aGlzLnN0cmlwRXJyb3Ioc3RhY2tbMF0pO1xuICAgICAgcmV0dXJuIHN0YWNrLmpvaW4oJ1xcbicpO1xuICAgIH1cbiAgfSwge30sIEVycm9yKTtcbiAgdmFyIFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yID0gZnVuY3Rpb24gVW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3IodXJsLCBmdW5jKSB7XG4gICAgJHRyYWNldXJSdW50aW1lLnN1cGVyQ2FsbCh0aGlzLCAkVW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3IucHJvdG90eXBlLCBcImNvbnN0cnVjdG9yXCIsIFt1cmwsIG51bGxdKTtcbiAgICB0aGlzLmZ1bmMgPSBmdW5jO1xuICB9O1xuICB2YXIgJFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yID0gVW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3I7XG4gICgkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yLCB7Z2V0VW5jb2F0ZWRNb2R1bGU6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMudmFsdWVfKVxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZV87XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZV8gPSB0aGlzLmZ1bmMuY2FsbChnbG9iYWwpO1xuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgaWYgKGV4IGluc3RhbmNlb2YgTW9kdWxlRXZhbHVhdGlvbkVycm9yKSB7XG4gICAgICAgICAgZXgubG9hZGVkQnkodGhpcy51cmwpO1xuICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBNb2R1bGVFdmFsdWF0aW9uRXJyb3IodGhpcy51cmwsIGV4KTtcbiAgICAgIH1cbiAgICB9fSwge30sIFVuY29hdGVkTW9kdWxlRW50cnkpO1xuICBmdW5jdGlvbiBnZXRVbmNvYXRlZE1vZHVsZUluc3RhbnRpYXRvcihuYW1lKSB7XG4gICAgaWYgKCFuYW1lKVxuICAgICAgcmV0dXJuO1xuICAgIHZhciB1cmwgPSBNb2R1bGVTdG9yZS5ub3JtYWxpemUobmFtZSk7XG4gICAgcmV0dXJuIG1vZHVsZUluc3RhbnRpYXRvcnNbdXJsXTtcbiAgfVxuICA7XG4gIHZhciBtb2R1bGVJbnN0YW5jZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB2YXIgbGl2ZU1vZHVsZVNlbnRpbmVsID0ge307XG4gIGZ1bmN0aW9uIE1vZHVsZSh1bmNvYXRlZE1vZHVsZSkge1xuICAgIHZhciBpc0xpdmUgPSBhcmd1bWVudHNbMV07XG4gICAgdmFyIGNvYXRlZE1vZHVsZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModW5jb2F0ZWRNb2R1bGUpLmZvckVhY2goKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHZhciBnZXR0ZXIsXG4gICAgICAgICAgdmFsdWU7XG4gICAgICBpZiAoaXNMaXZlID09PSBsaXZlTW9kdWxlU2VudGluZWwpIHtcbiAgICAgICAgdmFyIGRlc2NyID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih1bmNvYXRlZE1vZHVsZSwgbmFtZSk7XG4gICAgICAgIGlmIChkZXNjci5nZXQpXG4gICAgICAgICAgZ2V0dGVyID0gZGVzY3IuZ2V0O1xuICAgICAgfVxuICAgICAgaWYgKCFnZXR0ZXIpIHtcbiAgICAgICAgdmFsdWUgPSB1bmNvYXRlZE1vZHVsZVtuYW1lXTtcbiAgICAgICAgZ2V0dGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvYXRlZE1vZHVsZSwgbmFtZSwge1xuICAgICAgICBnZXQ6IGdldHRlcixcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfSkpO1xuICAgIE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyhjb2F0ZWRNb2R1bGUpO1xuICAgIHJldHVybiBjb2F0ZWRNb2R1bGU7XG4gIH1cbiAgdmFyIE1vZHVsZVN0b3JlID0ge1xuICAgIG5vcm1hbGl6ZTogZnVuY3Rpb24obmFtZSwgcmVmZXJlck5hbWUsIHJlZmVyZXJBZGRyZXNzKSB7XG4gICAgICBpZiAodHlwZW9mIG5hbWUgIT09IFwic3RyaW5nXCIpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJtb2R1bGUgbmFtZSBtdXN0IGJlIGEgc3RyaW5nLCBub3QgXCIgKyB0eXBlb2YgbmFtZSk7XG4gICAgICBpZiAoaXNBYnNvbHV0ZShuYW1lKSlcbiAgICAgICAgcmV0dXJuIGNhbm9uaWNhbGl6ZVVybChuYW1lKTtcbiAgICAgIGlmICgvW15cXC5dXFwvXFwuXFwuXFwvLy50ZXN0KG5hbWUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbW9kdWxlIG5hbWUgZW1iZWRzIC8uLi86ICcgKyBuYW1lKTtcbiAgICAgIH1cbiAgICAgIGlmIChuYW1lWzBdID09PSAnLicgJiYgcmVmZXJlck5hbWUpXG4gICAgICAgIHJldHVybiByZXNvbHZlVXJsKHJlZmVyZXJOYW1lLCBuYW1lKTtcbiAgICAgIHJldHVybiBjYW5vbmljYWxpemVVcmwobmFtZSk7XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uKG5vcm1hbGl6ZWROYW1lKSB7XG4gICAgICB2YXIgbSA9IGdldFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yKG5vcm1hbGl6ZWROYW1lKTtcbiAgICAgIGlmICghbSlcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIHZhciBtb2R1bGVJbnN0YW5jZSA9IG1vZHVsZUluc3RhbmNlc1ttLnVybF07XG4gICAgICBpZiAobW9kdWxlSW5zdGFuY2UpXG4gICAgICAgIHJldHVybiBtb2R1bGVJbnN0YW5jZTtcbiAgICAgIG1vZHVsZUluc3RhbmNlID0gTW9kdWxlKG0uZ2V0VW5jb2F0ZWRNb2R1bGUoKSwgbGl2ZU1vZHVsZVNlbnRpbmVsKTtcbiAgICAgIHJldHVybiBtb2R1bGVJbnN0YW5jZXNbbS51cmxdID0gbW9kdWxlSW5zdGFuY2U7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKG5vcm1hbGl6ZWROYW1lLCBtb2R1bGUpIHtcbiAgICAgIG5vcm1hbGl6ZWROYW1lID0gU3RyaW5nKG5vcm1hbGl6ZWROYW1lKTtcbiAgICAgIG1vZHVsZUluc3RhbnRpYXRvcnNbbm9ybWFsaXplZE5hbWVdID0gbmV3IFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yKG5vcm1hbGl6ZWROYW1lLCAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBtb2R1bGU7XG4gICAgICB9KSk7XG4gICAgICBtb2R1bGVJbnN0YW5jZXNbbm9ybWFsaXplZE5hbWVdID0gbW9kdWxlO1xuICAgIH0sXG4gICAgZ2V0IGJhc2VVUkwoKSB7XG4gICAgICByZXR1cm4gYmFzZVVSTDtcbiAgICB9LFxuICAgIHNldCBiYXNlVVJMKHYpIHtcbiAgICAgIGJhc2VVUkwgPSBTdHJpbmcodik7XG4gICAgfSxcbiAgICByZWdpc3Rlck1vZHVsZTogZnVuY3Rpb24obmFtZSwgZnVuYykge1xuICAgICAgdmFyIG5vcm1hbGl6ZWROYW1lID0gTW9kdWxlU3RvcmUubm9ybWFsaXplKG5hbWUpO1xuICAgICAgaWYgKG1vZHVsZUluc3RhbnRpYXRvcnNbbm9ybWFsaXplZE5hbWVdKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2R1cGxpY2F0ZSBtb2R1bGUgbmFtZWQgJyArIG5vcm1hbGl6ZWROYW1lKTtcbiAgICAgIG1vZHVsZUluc3RhbnRpYXRvcnNbbm9ybWFsaXplZE5hbWVdID0gbmV3IFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yKG5vcm1hbGl6ZWROYW1lLCBmdW5jKTtcbiAgICB9LFxuICAgIGJ1bmRsZVN0b3JlOiBPYmplY3QuY3JlYXRlKG51bGwpLFxuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbihuYW1lLCBkZXBzLCBmdW5jKSB7XG4gICAgICBpZiAoIWRlcHMgfHwgIWRlcHMubGVuZ3RoICYmICFmdW5jLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnJlZ2lzdGVyTW9kdWxlKG5hbWUsIGZ1bmMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5idW5kbGVTdG9yZVtuYW1lXSA9IHtcbiAgICAgICAgICBkZXBzOiBkZXBzLFxuICAgICAgICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyICRfXzAgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICB2YXIgZGVwTWFwID0ge307XG4gICAgICAgICAgICBkZXBzLmZvckVhY2goKGZ1bmN0aW9uKGRlcCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGRlcE1hcFtkZXBdID0gJF9fMFtpbmRleF07XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB2YXIgcmVnaXN0cnlFbnRyeSA9IGZ1bmMuY2FsbCh0aGlzLCBkZXBNYXApO1xuICAgICAgICAgICAgcmVnaXN0cnlFbnRyeS5leGVjdXRlLmNhbGwodGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gcmVnaXN0cnlFbnRyeS5leHBvcnRzO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldEFub255bW91c01vZHVsZTogZnVuY3Rpb24oZnVuYykge1xuICAgICAgcmV0dXJuIG5ldyBNb2R1bGUoZnVuYy5jYWxsKGdsb2JhbCksIGxpdmVNb2R1bGVTZW50aW5lbCk7XG4gICAgfSxcbiAgICBnZXRGb3JUZXN0aW5nOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICB2YXIgJF9fMCA9IHRoaXM7XG4gICAgICBpZiAoIXRoaXMudGVzdGluZ1ByZWZpeF8pIHtcbiAgICAgICAgT2JqZWN0LmtleXMobW9kdWxlSW5zdGFuY2VzKS5zb21lKChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICB2YXIgbSA9IC8odHJhY2V1ckBbXlxcL10qXFwvKS8uZXhlYyhrZXkpO1xuICAgICAgICAgIGlmIChtKSB7XG4gICAgICAgICAgICAkX18wLnRlc3RpbmdQcmVmaXhfID0gbVsxXTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZ2V0KHRoaXMudGVzdGluZ1ByZWZpeF8gKyBuYW1lKTtcbiAgICB9XG4gIH07XG4gIE1vZHVsZVN0b3JlLnNldCgnQHRyYWNldXIvc3JjL3J1bnRpbWUvTW9kdWxlU3RvcmUnLCBuZXcgTW9kdWxlKHtNb2R1bGVTdG9yZTogTW9kdWxlU3RvcmV9KSk7XG4gIHZhciBzZXR1cEdsb2JhbHMgPSAkdHJhY2V1clJ1bnRpbWUuc2V0dXBHbG9iYWxzO1xuICAkdHJhY2V1clJ1bnRpbWUuc2V0dXBHbG9iYWxzID0gZnVuY3Rpb24oZ2xvYmFsKSB7XG4gICAgc2V0dXBHbG9iYWxzKGdsb2JhbCk7XG4gIH07XG4gICR0cmFjZXVyUnVudGltZS5Nb2R1bGVTdG9yZSA9IE1vZHVsZVN0b3JlO1xuICBnbG9iYWwuU3lzdGVtID0ge1xuICAgIHJlZ2lzdGVyOiBNb2R1bGVTdG9yZS5yZWdpc3Rlci5iaW5kKE1vZHVsZVN0b3JlKSxcbiAgICBnZXQ6IE1vZHVsZVN0b3JlLmdldCxcbiAgICBzZXQ6IE1vZHVsZVN0b3JlLnNldCxcbiAgICBub3JtYWxpemU6IE1vZHVsZVN0b3JlLm5vcm1hbGl6ZVxuICB9O1xuICAkdHJhY2V1clJ1bnRpbWUuZ2V0TW9kdWxlSW1wbCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaW5zdGFudGlhdG9yID0gZ2V0VW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3IobmFtZSk7XG4gICAgcmV0dXJuIGluc3RhbnRpYXRvciAmJiBpbnN0YW50aWF0b3IuZ2V0VW5jb2F0ZWRNb2R1bGUoKTtcbiAgfTtcbn0pKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogdGhpcyk7XG5TeXN0ZW0ucmVnaXN0ZXIoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlsc1wiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlsc1wiO1xuICB2YXIgJGNlaWwgPSBNYXRoLmNlaWw7XG4gIHZhciAkZmxvb3IgPSBNYXRoLmZsb29yO1xuICB2YXIgJGlzRmluaXRlID0gaXNGaW5pdGU7XG4gIHZhciAkaXNOYU4gPSBpc05hTjtcbiAgdmFyICRwb3cgPSBNYXRoLnBvdztcbiAgdmFyICRtaW4gPSBNYXRoLm1pbjtcbiAgdmFyIHRvT2JqZWN0ID0gJHRyYWNldXJSdW50aW1lLnRvT2JqZWN0O1xuICBmdW5jdGlvbiB0b1VpbnQzMih4KSB7XG4gICAgcmV0dXJuIHggPj4+IDA7XG4gIH1cbiAgZnVuY3Rpb24gaXNPYmplY3QoeCkge1xuICAgIHJldHVybiB4ICYmICh0eXBlb2YgeCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHggPT09ICdmdW5jdGlvbicpO1xuICB9XG4gIGZ1bmN0aW9uIGlzQ2FsbGFibGUoeCkge1xuICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJztcbiAgfVxuICBmdW5jdGlvbiBpc051bWJlcih4KSB7XG4gICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnbnVtYmVyJztcbiAgfVxuICBmdW5jdGlvbiB0b0ludGVnZXIoeCkge1xuICAgIHggPSAreDtcbiAgICBpZiAoJGlzTmFOKHgpKVxuICAgICAgcmV0dXJuIDA7XG4gICAgaWYgKHggPT09IDAgfHwgISRpc0Zpbml0ZSh4KSlcbiAgICAgIHJldHVybiB4O1xuICAgIHJldHVybiB4ID4gMCA/ICRmbG9vcih4KSA6ICRjZWlsKHgpO1xuICB9XG4gIHZhciBNQVhfU0FGRV9MRU5HVEggPSAkcG93KDIsIDUzKSAtIDE7XG4gIGZ1bmN0aW9uIHRvTGVuZ3RoKHgpIHtcbiAgICB2YXIgbGVuID0gdG9JbnRlZ2VyKHgpO1xuICAgIHJldHVybiBsZW4gPCAwID8gMCA6ICRtaW4obGVuLCBNQVhfU0FGRV9MRU5HVEgpO1xuICB9XG4gIGZ1bmN0aW9uIGNoZWNrSXRlcmFibGUoeCkge1xuICAgIHJldHVybiAhaXNPYmplY3QoeCkgPyB1bmRlZmluZWQgOiB4W1N5bWJvbC5pdGVyYXRvcl07XG4gIH1cbiAgZnVuY3Rpb24gaXNDb25zdHJ1Y3Rvcih4KSB7XG4gICAgcmV0dXJuIGlzQ2FsbGFibGUoeCk7XG4gIH1cbiAgZnVuY3Rpb24gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QodmFsdWUsIGRvbmUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZG9uZTogZG9uZVxuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVEZWZpbmUob2JqZWN0LCBuYW1lLCBkZXNjcikge1xuICAgIGlmICghKG5hbWUgaW4gb2JqZWN0KSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwgbmFtZSwgZGVzY3IpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBtYXliZURlZmluZU1ldGhvZChvYmplY3QsIG5hbWUsIHZhbHVlKSB7XG4gICAgbWF5YmVEZWZpbmUob2JqZWN0LCBuYW1lLCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVEZWZpbmVDb25zdChvYmplY3QsIG5hbWUsIHZhbHVlKSB7XG4gICAgbWF5YmVEZWZpbmUob2JqZWN0LCBuYW1lLCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9KTtcbiAgfVxuICBmdW5jdGlvbiBtYXliZUFkZEZ1bmN0aW9ucyhvYmplY3QsIGZ1bmN0aW9ucykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZnVuY3Rpb25zLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICB2YXIgbmFtZSA9IGZ1bmN0aW9uc1tpXTtcbiAgICAgIHZhciB2YWx1ZSA9IGZ1bmN0aW9uc1tpICsgMV07XG4gICAgICBtYXliZURlZmluZU1ldGhvZChvYmplY3QsIG5hbWUsIHZhbHVlKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVBZGRDb25zdHMob2JqZWN0LCBjb25zdHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbnN0cy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgdmFyIG5hbWUgPSBjb25zdHNbaV07XG4gICAgICB2YXIgdmFsdWUgPSBjb25zdHNbaSArIDFdO1xuICAgICAgbWF5YmVEZWZpbmVDb25zdChvYmplY3QsIG5hbWUsIHZhbHVlKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVBZGRJdGVyYXRvcihvYmplY3QsIGZ1bmMsIFN5bWJvbCkge1xuICAgIGlmICghU3ltYm9sIHx8ICFTeW1ib2wuaXRlcmF0b3IgfHwgb2JqZWN0W1N5bWJvbC5pdGVyYXRvcl0pXG4gICAgICByZXR1cm47XG4gICAgaWYgKG9iamVjdFsnQEBpdGVyYXRvciddKVxuICAgICAgZnVuYyA9IG9iamVjdFsnQEBpdGVyYXRvciddO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIFN5bWJvbC5pdGVyYXRvciwge1xuICAgICAgdmFsdWU6IGZ1bmMsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH1cbiAgdmFyIHBvbHlmaWxscyA9IFtdO1xuICBmdW5jdGlvbiByZWdpc3RlclBvbHlmaWxsKGZ1bmMpIHtcbiAgICBwb2x5ZmlsbHMucHVzaChmdW5jKTtcbiAgfVxuICBmdW5jdGlvbiBwb2x5ZmlsbEFsbChnbG9iYWwpIHtcbiAgICBwb2x5ZmlsbHMuZm9yRWFjaCgoZnVuY3Rpb24oZikge1xuICAgICAgcmV0dXJuIGYoZ2xvYmFsKTtcbiAgICB9KSk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBnZXQgdG9PYmplY3QoKSB7XG4gICAgICByZXR1cm4gdG9PYmplY3Q7XG4gICAgfSxcbiAgICBnZXQgdG9VaW50MzIoKSB7XG4gICAgICByZXR1cm4gdG9VaW50MzI7XG4gICAgfSxcbiAgICBnZXQgaXNPYmplY3QoKSB7XG4gICAgICByZXR1cm4gaXNPYmplY3Q7XG4gICAgfSxcbiAgICBnZXQgaXNDYWxsYWJsZSgpIHtcbiAgICAgIHJldHVybiBpc0NhbGxhYmxlO1xuICAgIH0sXG4gICAgZ2V0IGlzTnVtYmVyKCkge1xuICAgICAgcmV0dXJuIGlzTnVtYmVyO1xuICAgIH0sXG4gICAgZ2V0IHRvSW50ZWdlcigpIHtcbiAgICAgIHJldHVybiB0b0ludGVnZXI7XG4gICAgfSxcbiAgICBnZXQgdG9MZW5ndGgoKSB7XG4gICAgICByZXR1cm4gdG9MZW5ndGg7XG4gICAgfSxcbiAgICBnZXQgY2hlY2tJdGVyYWJsZSgpIHtcbiAgICAgIHJldHVybiBjaGVja0l0ZXJhYmxlO1xuICAgIH0sXG4gICAgZ2V0IGlzQ29uc3RydWN0b3IoKSB7XG4gICAgICByZXR1cm4gaXNDb25zdHJ1Y3RvcjtcbiAgICB9LFxuICAgIGdldCBjcmVhdGVJdGVyYXRvclJlc3VsdE9iamVjdCgpIHtcbiAgICAgIHJldHVybiBjcmVhdGVJdGVyYXRvclJlc3VsdE9iamVjdDtcbiAgICB9LFxuICAgIGdldCBtYXliZURlZmluZSgpIHtcbiAgICAgIHJldHVybiBtYXliZURlZmluZTtcbiAgICB9LFxuICAgIGdldCBtYXliZURlZmluZU1ldGhvZCgpIHtcbiAgICAgIHJldHVybiBtYXliZURlZmluZU1ldGhvZDtcbiAgICB9LFxuICAgIGdldCBtYXliZURlZmluZUNvbnN0KCkge1xuICAgICAgcmV0dXJuIG1heWJlRGVmaW5lQ29uc3Q7XG4gICAgfSxcbiAgICBnZXQgbWF5YmVBZGRGdW5jdGlvbnMoKSB7XG4gICAgICByZXR1cm4gbWF5YmVBZGRGdW5jdGlvbnM7XG4gICAgfSxcbiAgICBnZXQgbWF5YmVBZGRDb25zdHMoKSB7XG4gICAgICByZXR1cm4gbWF5YmVBZGRDb25zdHM7XG4gICAgfSxcbiAgICBnZXQgbWF5YmVBZGRJdGVyYXRvcigpIHtcbiAgICAgIHJldHVybiBtYXliZUFkZEl0ZXJhdG9yO1xuICAgIH0sXG4gICAgZ2V0IHJlZ2lzdGVyUG9seWZpbGwoKSB7XG4gICAgICByZXR1cm4gcmVnaXN0ZXJQb2x5ZmlsbDtcbiAgICB9LFxuICAgIGdldCBwb2x5ZmlsbEFsbCgpIHtcbiAgICAgIHJldHVybiBwb2x5ZmlsbEFsbDtcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5yZWdpc3RlcihcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL01hcFwiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9NYXBcIjtcbiAgdmFyICRfXzAgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHNcIiksXG4gICAgICBpc09iamVjdCA9ICRfXzAuaXNPYmplY3QsXG4gICAgICBtYXliZUFkZEl0ZXJhdG9yID0gJF9fMC5tYXliZUFkZEl0ZXJhdG9yLFxuICAgICAgcmVnaXN0ZXJQb2x5ZmlsbCA9ICRfXzAucmVnaXN0ZXJQb2x5ZmlsbDtcbiAgdmFyIGdldE93bkhhc2hPYmplY3QgPSAkdHJhY2V1clJ1bnRpbWUuZ2V0T3duSGFzaE9iamVjdDtcbiAgdmFyICRoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gIHZhciBkZWxldGVkU2VudGluZWwgPSB7fTtcbiAgZnVuY3Rpb24gbG9va3VwSW5kZXgobWFwLCBrZXkpIHtcbiAgICBpZiAoaXNPYmplY3Qoa2V5KSkge1xuICAgICAgdmFyIGhhc2hPYmplY3QgPSBnZXRPd25IYXNoT2JqZWN0KGtleSk7XG4gICAgICByZXR1cm4gaGFzaE9iamVjdCAmJiBtYXAub2JqZWN0SW5kZXhfW2hhc2hPYmplY3QuaGFzaF07XG4gICAgfVxuICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJylcbiAgICAgIHJldHVybiBtYXAuc3RyaW5nSW5kZXhfW2tleV07XG4gICAgcmV0dXJuIG1hcC5wcmltaXRpdmVJbmRleF9ba2V5XTtcbiAgfVxuICBmdW5jdGlvbiBpbml0TWFwKG1hcCkge1xuICAgIG1hcC5lbnRyaWVzXyA9IFtdO1xuICAgIG1hcC5vYmplY3RJbmRleF8gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIG1hcC5zdHJpbmdJbmRleF8gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIG1hcC5wcmltaXRpdmVJbmRleF8gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIG1hcC5kZWxldGVkQ291bnRfID0gMDtcbiAgfVxuICB2YXIgTWFwID0gZnVuY3Rpb24gTWFwKCkge1xuICAgIHZhciBpdGVyYWJsZSA9IGFyZ3VtZW50c1swXTtcbiAgICBpZiAoIWlzT2JqZWN0KHRoaXMpKVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWFwIGNhbGxlZCBvbiBpbmNvbXBhdGlibGUgdHlwZScpO1xuICAgIGlmICgkaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCAnZW50cmllc18nKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWFwIGNhbiBub3QgYmUgcmVlbnRyYW50bHkgaW5pdGlhbGlzZWQnKTtcbiAgICB9XG4gICAgaW5pdE1hcCh0aGlzKTtcbiAgICBpZiAoaXRlcmFibGUgIT09IG51bGwgJiYgaXRlcmFibGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZm9yICh2YXIgJF9fMiA9IGl0ZXJhYmxlW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgICAkX18zOyAhKCRfXzMgPSAkX18yLm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgIHZhciAkX180ID0gJF9fMy52YWx1ZSxcbiAgICAgICAgICAgIGtleSA9ICRfXzRbMF0sXG4gICAgICAgICAgICB2YWx1ZSA9ICRfXzRbMV07XG4gICAgICAgIHtcbiAgICAgICAgICB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoTWFwLCB7XG4gICAgZ2V0IHNpemUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbnRyaWVzXy5sZW5ndGggLyAyIC0gdGhpcy5kZWxldGVkQ291bnRfO1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHZhciBpbmRleCA9IGxvb2t1cEluZGV4KHRoaXMsIGtleSk7XG4gICAgICBpZiAoaW5kZXggIT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHRoaXMuZW50cmllc19baW5kZXggKyAxXTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgdmFyIG9iamVjdE1vZGUgPSBpc09iamVjdChrZXkpO1xuICAgICAgdmFyIHN0cmluZ01vZGUgPSB0eXBlb2Yga2V5ID09PSAnc3RyaW5nJztcbiAgICAgIHZhciBpbmRleCA9IGxvb2t1cEluZGV4KHRoaXMsIGtleSk7XG4gICAgICBpZiAoaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmVudHJpZXNfW2luZGV4ICsgMV0gPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluZGV4ID0gdGhpcy5lbnRyaWVzXy5sZW5ndGg7XG4gICAgICAgIHRoaXMuZW50cmllc19baW5kZXhdID0ga2V5O1xuICAgICAgICB0aGlzLmVudHJpZXNfW2luZGV4ICsgMV0gPSB2YWx1ZTtcbiAgICAgICAgaWYgKG9iamVjdE1vZGUpIHtcbiAgICAgICAgICB2YXIgaGFzaE9iamVjdCA9IGdldE93bkhhc2hPYmplY3Qoa2V5KTtcbiAgICAgICAgICB2YXIgaGFzaCA9IGhhc2hPYmplY3QuaGFzaDtcbiAgICAgICAgICB0aGlzLm9iamVjdEluZGV4X1toYXNoXSA9IGluZGV4O1xuICAgICAgICB9IGVsc2UgaWYgKHN0cmluZ01vZGUpIHtcbiAgICAgICAgICB0aGlzLnN0cmluZ0luZGV4X1trZXldID0gaW5kZXg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5wcmltaXRpdmVJbmRleF9ba2V5XSA9IGluZGV4O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGhhczogZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gbG9va3VwSW5kZXgodGhpcywga2V5KSAhPT0gdW5kZWZpbmVkO1xuICAgIH0sXG4gICAgZGVsZXRlOiBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHZhciBvYmplY3RNb2RlID0gaXNPYmplY3Qoa2V5KTtcbiAgICAgIHZhciBzdHJpbmdNb2RlID0gdHlwZW9mIGtleSA9PT0gJ3N0cmluZyc7XG4gICAgICB2YXIgaW5kZXg7XG4gICAgICB2YXIgaGFzaDtcbiAgICAgIGlmIChvYmplY3RNb2RlKSB7XG4gICAgICAgIHZhciBoYXNoT2JqZWN0ID0gZ2V0T3duSGFzaE9iamVjdChrZXkpO1xuICAgICAgICBpZiAoaGFzaE9iamVjdCkge1xuICAgICAgICAgIGluZGV4ID0gdGhpcy5vYmplY3RJbmRleF9baGFzaCA9IGhhc2hPYmplY3QuaGFzaF07XG4gICAgICAgICAgZGVsZXRlIHRoaXMub2JqZWN0SW5kZXhfW2hhc2hdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHN0cmluZ01vZGUpIHtcbiAgICAgICAgaW5kZXggPSB0aGlzLnN0cmluZ0luZGV4X1trZXldO1xuICAgICAgICBkZWxldGUgdGhpcy5zdHJpbmdJbmRleF9ba2V5XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluZGV4ID0gdGhpcy5wcmltaXRpdmVJbmRleF9ba2V5XTtcbiAgICAgICAgZGVsZXRlIHRoaXMucHJpbWl0aXZlSW5kZXhfW2tleV07XG4gICAgICB9XG4gICAgICBpZiAoaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmVudHJpZXNfW2luZGV4XSA9IGRlbGV0ZWRTZW50aW5lbDtcbiAgICAgICAgdGhpcy5lbnRyaWVzX1tpbmRleCArIDFdID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmRlbGV0ZWRDb3VudF8rKztcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgICBpbml0TWFwKHRoaXMpO1xuICAgIH0sXG4gICAgZm9yRWFjaDogZnVuY3Rpb24oY2FsbGJhY2tGbikge1xuICAgICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHNbMV07XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZW50cmllc18ubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgdmFyIGtleSA9IHRoaXMuZW50cmllc19baV07XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuZW50cmllc19baSArIDFdO1xuICAgICAgICBpZiAoa2V5ID09PSBkZWxldGVkU2VudGluZWwpXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIGNhbGxiYWNrRm4uY2FsbCh0aGlzQXJnLCB2YWx1ZSwga2V5LCB0aGlzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGVudHJpZXM6ICR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oZnVuY3Rpb24gJF9fNSgpIHtcbiAgICAgIHZhciBpLFxuICAgICAgICAgIGtleSxcbiAgICAgICAgICB2YWx1ZTtcbiAgICAgIHJldHVybiAkdHJhY2V1clJ1bnRpbWUuY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UoZnVuY3Rpb24oJGN0eCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSlcbiAgICAgICAgICBzd2l0Y2ggKCRjdHguc3RhdGUpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gKGkgPCB0aGlzLmVudHJpZXNfLmxlbmd0aCkgPyA4IDogLTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICBpICs9IDI7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgIGtleSA9IHRoaXMuZW50cmllc19baV07XG4gICAgICAgICAgICAgIHZhbHVlID0gdGhpcy5lbnRyaWVzX1tpICsgMV07XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSA5O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IChrZXkgPT09IGRlbGV0ZWRTZW50aW5lbCkgPyA0IDogNjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAyO1xuICAgICAgICAgICAgICByZXR1cm4gW2tleSwgdmFsdWVdO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAkY3R4Lm1heWJlVGhyb3coKTtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDQ7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgcmV0dXJuICRjdHguZW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgfSwgJF9fNSwgdGhpcyk7XG4gICAgfSksXG4gICAga2V5czogJHRyYWNldXJSdW50aW1lLmluaXRHZW5lcmF0b3JGdW5jdGlvbihmdW5jdGlvbiAkX182KCkge1xuICAgICAgdmFyIGksXG4gICAgICAgICAga2V5LFxuICAgICAgICAgIHZhbHVlO1xuICAgICAgcmV0dXJuICR0cmFjZXVyUnVudGltZS5jcmVhdGVHZW5lcmF0b3JJbnN0YW5jZShmdW5jdGlvbigkY3R4KSB7XG4gICAgICAgIHdoaWxlICh0cnVlKVxuICAgICAgICAgIHN3aXRjaCAoJGN0eC5zdGF0ZSkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICBpID0gMDtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDEyO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAoaSA8IHRoaXMuZW50cmllc18ubGVuZ3RoKSA/IDggOiAtMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgIGkgKz0gMjtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDEyO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgICAga2V5ID0gdGhpcy5lbnRyaWVzX1tpXTtcbiAgICAgICAgICAgICAgdmFsdWUgPSB0aGlzLmVudHJpZXNfW2kgKyAxXTtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gKGtleSA9PT0gZGVsZXRlZFNlbnRpbmVsKSA/IDQgOiA2O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDI7XG4gICAgICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICRjdHgubWF5YmVUaHJvdygpO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gNDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICByZXR1cm4gJGN0eC5lbmQoKTtcbiAgICAgICAgICB9XG4gICAgICB9LCAkX182LCB0aGlzKTtcbiAgICB9KSxcbiAgICB2YWx1ZXM6ICR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oZnVuY3Rpb24gJF9fNygpIHtcbiAgICAgIHZhciBpLFxuICAgICAgICAgIGtleSxcbiAgICAgICAgICB2YWx1ZTtcbiAgICAgIHJldHVybiAkdHJhY2V1clJ1bnRpbWUuY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UoZnVuY3Rpb24oJGN0eCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSlcbiAgICAgICAgICBzd2l0Y2ggKCRjdHguc3RhdGUpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gKGkgPCB0aGlzLmVudHJpZXNfLmxlbmd0aCkgPyA4IDogLTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICBpICs9IDI7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgIGtleSA9IHRoaXMuZW50cmllc19baV07XG4gICAgICAgICAgICAgIHZhbHVlID0gdGhpcy5lbnRyaWVzX1tpICsgMV07XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSA5O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IChrZXkgPT09IGRlbGV0ZWRTZW50aW5lbCkgPyA0IDogNjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAyO1xuICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICRjdHgubWF5YmVUaHJvdygpO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gNDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICByZXR1cm4gJGN0eC5lbmQoKTtcbiAgICAgICAgICB9XG4gICAgICB9LCAkX183LCB0aGlzKTtcbiAgICB9KVxuICB9LCB7fSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShNYXAucHJvdG90eXBlLCBTeW1ib2wuaXRlcmF0b3IsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgdmFsdWU6IE1hcC5wcm90b3R5cGUuZW50cmllc1xuICB9KTtcbiAgZnVuY3Rpb24gcG9seWZpbGxNYXAoZ2xvYmFsKSB7XG4gICAgdmFyICRfXzQgPSBnbG9iYWwsXG4gICAgICAgIE9iamVjdCA9ICRfXzQuT2JqZWN0LFxuICAgICAgICBTeW1ib2wgPSAkX180LlN5bWJvbDtcbiAgICBpZiAoIWdsb2JhbC5NYXApXG4gICAgICBnbG9iYWwuTWFwID0gTWFwO1xuICAgIHZhciBtYXBQcm90b3R5cGUgPSBnbG9iYWwuTWFwLnByb3RvdHlwZTtcbiAgICBpZiAobWFwUHJvdG90eXBlLmVudHJpZXMgPT09IHVuZGVmaW5lZClcbiAgICAgIGdsb2JhbC5NYXAgPSBNYXA7XG4gICAgaWYgKG1hcFByb3RvdHlwZS5lbnRyaWVzKSB7XG4gICAgICBtYXliZUFkZEl0ZXJhdG9yKG1hcFByb3RvdHlwZSwgbWFwUHJvdG90eXBlLmVudHJpZXMsIFN5bWJvbCk7XG4gICAgICBtYXliZUFkZEl0ZXJhdG9yKE9iamVjdC5nZXRQcm90b3R5cGVPZihuZXcgZ2xvYmFsLk1hcCgpLmVudHJpZXMoKSksIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFN5bWJvbCk7XG4gICAgfVxuICB9XG4gIHJlZ2lzdGVyUG9seWZpbGwocG9seWZpbGxNYXApO1xuICByZXR1cm4ge1xuICAgIGdldCBNYXAoKSB7XG4gICAgICByZXR1cm4gTWFwO1xuICAgIH0sXG4gICAgZ2V0IHBvbHlmaWxsTWFwKCkge1xuICAgICAgcmV0dXJuIHBvbHlmaWxsTWFwO1xuICAgIH1cbiAgfTtcbn0pO1xuU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL01hcFwiICsgJycpO1xuU3lzdGVtLnJlZ2lzdGVyKFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvU2V0XCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL1NldFwiO1xuICB2YXIgJF9fMCA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlsc1wiKSxcbiAgICAgIGlzT2JqZWN0ID0gJF9fMC5pc09iamVjdCxcbiAgICAgIG1heWJlQWRkSXRlcmF0b3IgPSAkX18wLm1heWJlQWRkSXRlcmF0b3IsXG4gICAgICByZWdpc3RlclBvbHlmaWxsID0gJF9fMC5yZWdpc3RlclBvbHlmaWxsO1xuICB2YXIgTWFwID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL01hcFwiKS5NYXA7XG4gIHZhciBnZXRPd25IYXNoT2JqZWN0ID0gJHRyYWNldXJSdW50aW1lLmdldE93bkhhc2hPYmplY3Q7XG4gIHZhciAkaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICBmdW5jdGlvbiBpbml0U2V0KHNldCkge1xuICAgIHNldC5tYXBfID0gbmV3IE1hcCgpO1xuICB9XG4gIHZhciBTZXQgPSBmdW5jdGlvbiBTZXQoKSB7XG4gICAgdmFyIGl0ZXJhYmxlID0gYXJndW1lbnRzWzBdO1xuICAgIGlmICghaXNPYmplY3QodGhpcykpXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTZXQgY2FsbGVkIG9uIGluY29tcGF0aWJsZSB0eXBlJyk7XG4gICAgaWYgKCRoYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsICdtYXBfJykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1NldCBjYW4gbm90IGJlIHJlZW50cmFudGx5IGluaXRpYWxpc2VkJyk7XG4gICAgfVxuICAgIGluaXRTZXQodGhpcyk7XG4gICAgaWYgKGl0ZXJhYmxlICE9PSBudWxsICYmIGl0ZXJhYmxlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGZvciAodmFyICRfXzQgPSBpdGVyYWJsZVtTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICAgJF9fNTsgISgkX181ID0gJF9fNC5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgICB2YXIgaXRlbSA9ICRfXzUudmFsdWU7XG4gICAgICAgIHtcbiAgICAgICAgICB0aGlzLmFkZChpdGVtKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoU2V0LCB7XG4gICAgZ2V0IHNpemUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXBfLnNpemU7XG4gICAgfSxcbiAgICBoYXM6IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIHRoaXMubWFwXy5oYXMoa2V5KTtcbiAgICB9LFxuICAgIGFkZDogZnVuY3Rpb24oa2V5KSB7XG4gICAgICB0aGlzLm1hcF8uc2V0KGtleSwga2V5KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZGVsZXRlOiBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiB0aGlzLm1hcF8uZGVsZXRlKGtleSk7XG4gICAgfSxcbiAgICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXBfLmNsZWFyKCk7XG4gICAgfSxcbiAgICBmb3JFYWNoOiBmdW5jdGlvbihjYWxsYmFja0ZuKSB7XG4gICAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIHZhciAkX18yID0gdGhpcztcbiAgICAgIHJldHVybiB0aGlzLm1hcF8uZm9yRWFjaCgoZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICBjYWxsYmFja0ZuLmNhbGwodGhpc0FyZywga2V5LCBrZXksICRfXzIpO1xuICAgICAgfSkpO1xuICAgIH0sXG4gICAgdmFsdWVzOiAkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uKGZ1bmN0aW9uICRfXzcoKSB7XG4gICAgICB2YXIgJF9fOCxcbiAgICAgICAgICAkX185O1xuICAgICAgcmV0dXJuICR0cmFjZXVyUnVudGltZS5jcmVhdGVHZW5lcmF0b3JJbnN0YW5jZShmdW5jdGlvbigkY3R4KSB7XG4gICAgICAgIHdoaWxlICh0cnVlKVxuICAgICAgICAgIHN3aXRjaCAoJGN0eC5zdGF0ZSkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAkX184ID0gdGhpcy5tYXBfLmtleXMoKVtTeW1ib2wuaXRlcmF0b3JdKCk7XG4gICAgICAgICAgICAgICRjdHguc2VudCA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgJGN0eC5hY3Rpb24gPSAnbmV4dCc7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgICAkX185ID0gJF9fOFskY3R4LmFjdGlvbl0oJGN0eC5zZW50SWdub3JlVGhyb3cpO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gOTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAoJF9fOS5kb25lKSA/IDMgOiAyO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgJGN0eC5zZW50ID0gJF9fOS52YWx1ZTtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IC0yO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDEyO1xuICAgICAgICAgICAgICByZXR1cm4gJF9fOS52YWx1ZTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHJldHVybiAkY3R4LmVuZCgpO1xuICAgICAgICAgIH1cbiAgICAgIH0sICRfXzcsIHRoaXMpO1xuICAgIH0pLFxuICAgIGVudHJpZXM6ICR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oZnVuY3Rpb24gJF9fMTAoKSB7XG4gICAgICB2YXIgJF9fMTEsXG4gICAgICAgICAgJF9fMTI7XG4gICAgICByZXR1cm4gJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlKGZ1bmN0aW9uKCRjdHgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpXG4gICAgICAgICAgc3dpdGNoICgkY3R4LnN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICRfXzExID0gdGhpcy5tYXBfLmVudHJpZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCk7XG4gICAgICAgICAgICAgICRjdHguc2VudCA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgJGN0eC5hY3Rpb24gPSAnbmV4dCc7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgICAkX18xMiA9ICRfXzExWyRjdHguYWN0aW9uXSgkY3R4LnNlbnRJZ25vcmVUaHJvdyk7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSA5O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9ICgkX18xMi5kb25lKSA/IDMgOiAyO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgJGN0eC5zZW50ID0gJF9fMTIudmFsdWU7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAtMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgcmV0dXJuICRfXzEyLnZhbHVlO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgcmV0dXJuICRjdHguZW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgfSwgJF9fMTAsIHRoaXMpO1xuICAgIH0pXG4gIH0sIHt9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNldC5wcm90b3R5cGUsIFN5bWJvbC5pdGVyYXRvciwge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB2YWx1ZTogU2V0LnByb3RvdHlwZS52YWx1ZXNcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTZXQucHJvdG90eXBlLCAna2V5cycsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgdmFsdWU6IFNldC5wcm90b3R5cGUudmFsdWVzXG4gIH0pO1xuICBmdW5jdGlvbiBwb2x5ZmlsbFNldChnbG9iYWwpIHtcbiAgICB2YXIgJF9fNiA9IGdsb2JhbCxcbiAgICAgICAgT2JqZWN0ID0gJF9fNi5PYmplY3QsXG4gICAgICAgIFN5bWJvbCA9ICRfXzYuU3ltYm9sO1xuICAgIGlmICghZ2xvYmFsLlNldClcbiAgICAgIGdsb2JhbC5TZXQgPSBTZXQ7XG4gICAgdmFyIHNldFByb3RvdHlwZSA9IGdsb2JhbC5TZXQucHJvdG90eXBlO1xuICAgIGlmIChzZXRQcm90b3R5cGUudmFsdWVzKSB7XG4gICAgICBtYXliZUFkZEl0ZXJhdG9yKHNldFByb3RvdHlwZSwgc2V0UHJvdG90eXBlLnZhbHVlcywgU3ltYm9sKTtcbiAgICAgIG1heWJlQWRkSXRlcmF0b3IoT2JqZWN0LmdldFByb3RvdHlwZU9mKG5ldyBnbG9iYWwuU2V0KCkudmFsdWVzKCkpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBTeW1ib2wpO1xuICAgIH1cbiAgfVxuICByZWdpc3RlclBvbHlmaWxsKHBvbHlmaWxsU2V0KTtcbiAgcmV0dXJuIHtcbiAgICBnZXQgU2V0KCkge1xuICAgICAgcmV0dXJuIFNldDtcbiAgICB9LFxuICAgIGdldCBwb2x5ZmlsbFNldCgpIHtcbiAgICAgIHJldHVybiBwb2x5ZmlsbFNldDtcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9TZXRcIiArICcnKTtcblN5c3RlbS5yZWdpc3RlcihcInRyYWNldXItcnVudGltZUAwLjAuNzIvbm9kZV9tb2R1bGVzL3JzdnAvbGliL3JzdnAvYXNhcFwiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL25vZGVfbW9kdWxlcy9yc3ZwL2xpYi9yc3ZwL2FzYXBcIjtcbiAgdmFyIGxlbiA9IDA7XG4gIGZ1bmN0aW9uIGFzYXAoY2FsbGJhY2ssIGFyZykge1xuICAgIHF1ZXVlW2xlbl0gPSBjYWxsYmFjaztcbiAgICBxdWV1ZVtsZW4gKyAxXSA9IGFyZztcbiAgICBsZW4gKz0gMjtcbiAgICBpZiAobGVuID09PSAyKSB7XG4gICAgICBzY2hlZHVsZUZsdXNoKCk7XG4gICAgfVxuICB9XG4gIHZhciAkX19kZWZhdWx0ID0gYXNhcDtcbiAgdmFyIGJyb3dzZXJHbG9iYWwgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpID8gd2luZG93IDoge307XG4gIHZhciBCcm93c2VyTXV0YXRpb25PYnNlcnZlciA9IGJyb3dzZXJHbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBicm93c2VyR2xvYmFsLldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG4gIHZhciBpc1dvcmtlciA9IHR5cGVvZiBVaW50OENsYW1wZWRBcnJheSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGltcG9ydFNjcmlwdHMgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCc7XG4gIGZ1bmN0aW9uIHVzZU5leHRUaWNrKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gdXNlTXV0YXRpb25PYnNlcnZlcigpIHtcbiAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgdmFyIG9ic2VydmVyID0gbmV3IEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKGZsdXNoKTtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICBvYnNlcnZlci5vYnNlcnZlKG5vZGUsIHtjaGFyYWN0ZXJEYXRhOiB0cnVlfSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgbm9kZS5kYXRhID0gKGl0ZXJhdGlvbnMgPSArK2l0ZXJhdGlvbnMgJSAyKTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIHVzZU1lc3NhZ2VDaGFubmVsKCkge1xuICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmbHVzaDtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gdXNlU2V0VGltZW91dCgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBzZXRUaW1lb3V0KGZsdXNoLCAxKTtcbiAgICB9O1xuICB9XG4gIHZhciBxdWV1ZSA9IG5ldyBBcnJheSgxMDAwKTtcbiAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gMikge1xuICAgICAgdmFyIGNhbGxiYWNrID0gcXVldWVbaV07XG4gICAgICB2YXIgYXJnID0gcXVldWVbaSArIDFdO1xuICAgICAgY2FsbGJhY2soYXJnKTtcbiAgICAgIHF1ZXVlW2ldID0gdW5kZWZpbmVkO1xuICAgICAgcXVldWVbaSArIDFdID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBsZW4gPSAwO1xuICB9XG4gIHZhciBzY2hlZHVsZUZsdXNoO1xuICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHt9LnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJykge1xuICAgIHNjaGVkdWxlRmx1c2ggPSB1c2VOZXh0VGljaygpO1xuICB9IGVsc2UgaWYgKEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgc2NoZWR1bGVGbHVzaCA9IHVzZU11dGF0aW9uT2JzZXJ2ZXIoKTtcbiAgfSBlbHNlIGlmIChpc1dvcmtlcikge1xuICAgIHNjaGVkdWxlRmx1c2ggPSB1c2VNZXNzYWdlQ2hhbm5lbCgpO1xuICB9IGVsc2Uge1xuICAgIHNjaGVkdWxlRmx1c2ggPSB1c2VTZXRUaW1lb3V0KCk7XG4gIH1cbiAgcmV0dXJuIHtnZXQgZGVmYXVsdCgpIHtcbiAgICAgIHJldHVybiAkX19kZWZhdWx0O1xuICAgIH19O1xufSk7XG5TeXN0ZW0ucmVnaXN0ZXIoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9Qcm9taXNlXCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL1Byb21pc2VcIjtcbiAgdmFyIGFzeW5jID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvbm9kZV9tb2R1bGVzL3JzdnAvbGliL3JzdnAvYXNhcFwiKS5kZWZhdWx0O1xuICB2YXIgcmVnaXN0ZXJQb2x5ZmlsbCA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlsc1wiKS5yZWdpc3RlclBvbHlmaWxsO1xuICB2YXIgcHJvbWlzZVJhdyA9IHt9O1xuICBmdW5jdGlvbiBpc1Byb21pc2UoeCkge1xuICAgIHJldHVybiB4ICYmIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB4LnN0YXR1c18gIT09IHVuZGVmaW5lZDtcbiAgfVxuICBmdW5jdGlvbiBpZFJlc29sdmVIYW5kbGVyKHgpIHtcbiAgICByZXR1cm4geDtcbiAgfVxuICBmdW5jdGlvbiBpZFJlamVjdEhhbmRsZXIoeCkge1xuICAgIHRocm93IHg7XG4gIH1cbiAgZnVuY3Rpb24gY2hhaW4ocHJvbWlzZSkge1xuICAgIHZhciBvblJlc29sdmUgPSBhcmd1bWVudHNbMV0gIT09ICh2b2lkIDApID8gYXJndW1lbnRzWzFdIDogaWRSZXNvbHZlSGFuZGxlcjtcbiAgICB2YXIgb25SZWplY3QgPSBhcmd1bWVudHNbMl0gIT09ICh2b2lkIDApID8gYXJndW1lbnRzWzJdIDogaWRSZWplY3RIYW5kbGVyO1xuICAgIHZhciBkZWZlcnJlZCA9IGdldERlZmVycmVkKHByb21pc2UuY29uc3RydWN0b3IpO1xuICAgIHN3aXRjaCAocHJvbWlzZS5zdGF0dXNfKSB7XG4gICAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgICAgdGhyb3cgVHlwZUVycm9yO1xuICAgICAgY2FzZSAwOlxuICAgICAgICBwcm9taXNlLm9uUmVzb2x2ZV8ucHVzaChvblJlc29sdmUsIGRlZmVycmVkKTtcbiAgICAgICAgcHJvbWlzZS5vblJlamVjdF8ucHVzaChvblJlamVjdCwgZGVmZXJyZWQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgKzE6XG4gICAgICAgIHByb21pc2VFbnF1ZXVlKHByb21pc2UudmFsdWVfLCBbb25SZXNvbHZlLCBkZWZlcnJlZF0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgLTE6XG4gICAgICAgIHByb21pc2VFbnF1ZXVlKHByb21pc2UudmFsdWVfLCBbb25SZWplY3QsIGRlZmVycmVkXSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfVxuICBmdW5jdGlvbiBnZXREZWZlcnJlZChDKSB7XG4gICAgaWYgKHRoaXMgPT09ICRQcm9taXNlKSB7XG4gICAgICB2YXIgcHJvbWlzZSA9IHByb21pc2VJbml0KG5ldyAkUHJvbWlzZShwcm9taXNlUmF3KSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9taXNlOiBwcm9taXNlLFxuICAgICAgICByZXNvbHZlOiAoZnVuY3Rpb24oeCkge1xuICAgICAgICAgIHByb21pc2VSZXNvbHZlKHByb21pc2UsIHgpO1xuICAgICAgICB9KSxcbiAgICAgICAgcmVqZWN0OiAoZnVuY3Rpb24ocikge1xuICAgICAgICAgIHByb21pc2VSZWplY3QocHJvbWlzZSwgcik7XG4gICAgICAgIH0pXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICByZXN1bHQucHJvbWlzZSA9IG5ldyBDKChmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgcmVzdWx0LnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICByZXN1bHQucmVqZWN0ID0gcmVqZWN0O1xuICAgICAgfSkpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gcHJvbWlzZVNldChwcm9taXNlLCBzdGF0dXMsIHZhbHVlLCBvblJlc29sdmUsIG9uUmVqZWN0KSB7XG4gICAgcHJvbWlzZS5zdGF0dXNfID0gc3RhdHVzO1xuICAgIHByb21pc2UudmFsdWVfID0gdmFsdWU7XG4gICAgcHJvbWlzZS5vblJlc29sdmVfID0gb25SZXNvbHZlO1xuICAgIHByb21pc2Uub25SZWplY3RfID0gb25SZWplY3Q7XG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cbiAgZnVuY3Rpb24gcHJvbWlzZUluaXQocHJvbWlzZSkge1xuICAgIHJldHVybiBwcm9taXNlU2V0KHByb21pc2UsIDAsIHVuZGVmaW5lZCwgW10sIFtdKTtcbiAgfVxuICB2YXIgUHJvbWlzZSA9IGZ1bmN0aW9uIFByb21pc2UocmVzb2x2ZXIpIHtcbiAgICBpZiAocmVzb2x2ZXIgPT09IHByb21pc2VSYXcpXG4gICAgICByZXR1cm47XG4gICAgaWYgKHR5cGVvZiByZXNvbHZlciAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gICAgdmFyIHByb21pc2UgPSBwcm9taXNlSW5pdCh0aGlzKTtcbiAgICB0cnkge1xuICAgICAgcmVzb2x2ZXIoKGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgcHJvbWlzZVJlc29sdmUocHJvbWlzZSwgeCk7XG4gICAgICB9KSwgKGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgcHJvbWlzZVJlamVjdChwcm9taXNlLCByKTtcbiAgICAgIH0pKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBwcm9taXNlUmVqZWN0KHByb21pc2UsIGUpO1xuICAgIH1cbiAgfTtcbiAgKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoUHJvbWlzZSwge1xuICAgIGNhdGNoOiBmdW5jdGlvbihvblJlamVjdCkge1xuICAgICAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIG9uUmVqZWN0KTtcbiAgICB9LFxuICAgIHRoZW46IGZ1bmN0aW9uKG9uUmVzb2x2ZSwgb25SZWplY3QpIHtcbiAgICAgIGlmICh0eXBlb2Ygb25SZXNvbHZlICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICBvblJlc29sdmUgPSBpZFJlc29sdmVIYW5kbGVyO1xuICAgICAgaWYgKHR5cGVvZiBvblJlamVjdCAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgb25SZWplY3QgPSBpZFJlamVjdEhhbmRsZXI7XG4gICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICB2YXIgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yO1xuICAgICAgcmV0dXJuIGNoYWluKHRoaXMsIGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgeCA9IHByb21pc2VDb2VyY2UoY29uc3RydWN0b3IsIHgpO1xuICAgICAgICByZXR1cm4geCA9PT0gdGhhdCA/IG9uUmVqZWN0KG5ldyBUeXBlRXJyb3IpIDogaXNQcm9taXNlKHgpID8geC50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpIDogb25SZXNvbHZlKHgpO1xuICAgICAgfSwgb25SZWplY3QpO1xuICAgIH1cbiAgfSwge1xuICAgIHJlc29sdmU6IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICh0aGlzID09PSAkUHJvbWlzZSkge1xuICAgICAgICBpZiAoaXNQcm9taXNlKHgpKSB7XG4gICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2VTZXQobmV3ICRQcm9taXNlKHByb21pc2VSYXcpLCArMSwgeCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IHRoaXMoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgcmVzb2x2ZSh4KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZWplY3Q6IGZ1bmN0aW9uKHIpIHtcbiAgICAgIGlmICh0aGlzID09PSAkUHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZVNldChuZXcgJFByb21pc2UocHJvbWlzZVJhdyksIC0xLCByKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcygoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgcmVqZWN0KHIpO1xuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhbGw6IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgdmFyIGRlZmVycmVkID0gZ2V0RGVmZXJyZWQodGhpcyk7XG4gICAgICB2YXIgcmVzb2x1dGlvbnMgPSBbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBjb3VudCA9IHZhbHVlcy5sZW5ndGg7XG4gICAgICAgIGlmIChjb3VudCA9PT0gMCkge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzb2x1dGlvbnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmUodmFsdWVzW2ldKS50aGVuKGZ1bmN0aW9uKGksIHgpIHtcbiAgICAgICAgICAgICAgcmVzb2x1dGlvbnNbaV0gPSB4O1xuICAgICAgICAgICAgICBpZiAoLS1jb3VudCA9PT0gMClcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc29sdXRpb25zKTtcbiAgICAgICAgICAgIH0uYmluZCh1bmRlZmluZWQsIGkpLCAoZnVuY3Rpb24ocikge1xuICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qocik7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG4gICAgcmFjZTogZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICB2YXIgZGVmZXJyZWQgPSBnZXREZWZlcnJlZCh0aGlzKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdGhpcy5yZXNvbHZlKHZhbHVlc1tpXSkudGhlbigoZnVuY3Rpb24oeCkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh4KTtcbiAgICAgICAgICB9KSwgKGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChyKTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICB9KTtcbiAgdmFyICRQcm9taXNlID0gUHJvbWlzZTtcbiAgdmFyICRQcm9taXNlUmVqZWN0ID0gJFByb21pc2UucmVqZWN0O1xuICBmdW5jdGlvbiBwcm9taXNlUmVzb2x2ZShwcm9taXNlLCB4KSB7XG4gICAgcHJvbWlzZURvbmUocHJvbWlzZSwgKzEsIHgsIHByb21pc2Uub25SZXNvbHZlXyk7XG4gIH1cbiAgZnVuY3Rpb24gcHJvbWlzZVJlamVjdChwcm9taXNlLCByKSB7XG4gICAgcHJvbWlzZURvbmUocHJvbWlzZSwgLTEsIHIsIHByb21pc2Uub25SZWplY3RfKTtcbiAgfVxuICBmdW5jdGlvbiBwcm9taXNlRG9uZShwcm9taXNlLCBzdGF0dXMsIHZhbHVlLCByZWFjdGlvbnMpIHtcbiAgICBpZiAocHJvbWlzZS5zdGF0dXNfICE9PSAwKVxuICAgICAgcmV0dXJuO1xuICAgIHByb21pc2VFbnF1ZXVlKHZhbHVlLCByZWFjdGlvbnMpO1xuICAgIHByb21pc2VTZXQocHJvbWlzZSwgc3RhdHVzLCB2YWx1ZSk7XG4gIH1cbiAgZnVuY3Rpb24gcHJvbWlzZUVucXVldWUodmFsdWUsIHRhc2tzKSB7XG4gICAgYXN5bmMoKGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YXNrcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICBwcm9taXNlSGFuZGxlKHZhbHVlLCB0YXNrc1tpXSwgdGFza3NbaSArIDFdKTtcbiAgICAgIH1cbiAgICB9KSk7XG4gIH1cbiAgZnVuY3Rpb24gcHJvbWlzZUhhbmRsZSh2YWx1ZSwgaGFuZGxlciwgZGVmZXJyZWQpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHJlc3VsdCA9IGhhbmRsZXIodmFsdWUpO1xuICAgICAgaWYgKHJlc3VsdCA9PT0gZGVmZXJyZWQucHJvbWlzZSlcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgICAgIGVsc2UgaWYgKGlzUHJvbWlzZShyZXN1bHQpKVxuICAgICAgICBjaGFpbihyZXN1bHQsIGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCk7XG4gICAgICBlbHNlXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZSk7XG4gICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH1cbiAgfVxuICB2YXIgdGhlbmFibGVTeW1ib2wgPSAnQEB0aGVuYWJsZSc7XG4gIGZ1bmN0aW9uIGlzT2JqZWN0KHgpIHtcbiAgICByZXR1cm4geCAmJiAodHlwZW9mIHggPT09ICdvYmplY3QnIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nKTtcbiAgfVxuICBmdW5jdGlvbiBwcm9taXNlQ29lcmNlKGNvbnN0cnVjdG9yLCB4KSB7XG4gICAgaWYgKCFpc1Byb21pc2UoeCkgJiYgaXNPYmplY3QoeCkpIHtcbiAgICAgIHZhciB0aGVuO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhlbiA9IHgudGhlbjtcbiAgICAgIH0gY2F0Y2ggKHIpIHtcbiAgICAgICAgdmFyIHByb21pc2UgPSAkUHJvbWlzZVJlamVjdC5jYWxsKGNvbnN0cnVjdG9yLCByKTtcbiAgICAgICAgeFt0aGVuYWJsZVN5bWJvbF0gPSBwcm9taXNlO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgcCA9IHhbdGhlbmFibGVTeW1ib2xdO1xuICAgICAgICBpZiAocCkge1xuICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBkZWZlcnJlZCA9IGdldERlZmVycmVkKGNvbnN0cnVjdG9yKTtcbiAgICAgICAgICB4W3RoZW5hYmxlU3ltYm9sXSA9IGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoZW4uY2FsbCh4LCBkZWZlcnJlZC5yZXNvbHZlLCBkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICAgIH0gY2F0Y2ggKHIpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHg7XG4gIH1cbiAgZnVuY3Rpb24gcG9seWZpbGxQcm9taXNlKGdsb2JhbCkge1xuICAgIGlmICghZ2xvYmFsLlByb21pc2UpXG4gICAgICBnbG9iYWwuUHJvbWlzZSA9IFByb21pc2U7XG4gIH1cbiAgcmVnaXN0ZXJQb2x5ZmlsbChwb2x5ZmlsbFByb21pc2UpO1xuICByZXR1cm4ge1xuICAgIGdldCBQcm9taXNlKCkge1xuICAgICAgcmV0dXJuIFByb21pc2U7XG4gICAgfSxcbiAgICBnZXQgcG9seWZpbGxQcm9taXNlKCkge1xuICAgICAgcmV0dXJuIHBvbHlmaWxsUHJvbWlzZTtcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9Qcm9taXNlXCIgKyAnJyk7XG5TeXN0ZW0ucmVnaXN0ZXIoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9TdHJpbmdJdGVyYXRvclwiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgJF9fMjtcbiAgdmFyIF9fbW9kdWxlTmFtZSA9IFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvU3RyaW5nSXRlcmF0b3JcIjtcbiAgdmFyICRfXzAgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHNcIiksXG4gICAgICBjcmVhdGVJdGVyYXRvclJlc3VsdE9iamVjdCA9ICRfXzAuY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QsXG4gICAgICBpc09iamVjdCA9ICRfXzAuaXNPYmplY3Q7XG4gIHZhciB0b1Byb3BlcnR5ID0gJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHk7XG4gIHZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gIHZhciBpdGVyYXRlZFN0cmluZyA9IFN5bWJvbCgnaXRlcmF0ZWRTdHJpbmcnKTtcbiAgdmFyIHN0cmluZ0l0ZXJhdG9yTmV4dEluZGV4ID0gU3ltYm9sKCdzdHJpbmdJdGVyYXRvck5leHRJbmRleCcpO1xuICB2YXIgU3RyaW5nSXRlcmF0b3IgPSBmdW5jdGlvbiBTdHJpbmdJdGVyYXRvcigpIHt9O1xuICAoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKShTdHJpbmdJdGVyYXRvciwgKCRfXzIgPSB7fSwgT2JqZWN0LmRlZmluZVByb3BlcnR5KCRfXzIsIFwibmV4dFwiLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG8gPSB0aGlzO1xuICAgICAgaWYgKCFpc09iamVjdChvKSB8fCAhaGFzT3duUHJvcGVydHkuY2FsbChvLCBpdGVyYXRlZFN0cmluZykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndGhpcyBtdXN0IGJlIGEgU3RyaW5nSXRlcmF0b3Igb2JqZWN0Jyk7XG4gICAgICB9XG4gICAgICB2YXIgcyA9IG9bdG9Qcm9wZXJ0eShpdGVyYXRlZFN0cmluZyldO1xuICAgICAgaWYgKHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QodW5kZWZpbmVkLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIHZhciBwb3NpdGlvbiA9IG9bdG9Qcm9wZXJ0eShzdHJpbmdJdGVyYXRvck5leHRJbmRleCldO1xuICAgICAgdmFyIGxlbiA9IHMubGVuZ3RoO1xuICAgICAgaWYgKHBvc2l0aW9uID49IGxlbikge1xuICAgICAgICBvW3RvUHJvcGVydHkoaXRlcmF0ZWRTdHJpbmcpXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUl0ZXJhdG9yUmVzdWx0T2JqZWN0KHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICB2YXIgZmlyc3QgPSBzLmNoYXJDb2RlQXQocG9zaXRpb24pO1xuICAgICAgdmFyIHJlc3VsdFN0cmluZztcbiAgICAgIGlmIChmaXJzdCA8IDB4RDgwMCB8fCBmaXJzdCA+IDB4REJGRiB8fCBwb3NpdGlvbiArIDEgPT09IGxlbikge1xuICAgICAgICByZXN1bHRTdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGZpcnN0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBzZWNvbmQgPSBzLmNoYXJDb2RlQXQocG9zaXRpb24gKyAxKTtcbiAgICAgICAgaWYgKHNlY29uZCA8IDB4REMwMCB8fCBzZWNvbmQgPiAweERGRkYpIHtcbiAgICAgICAgICByZXN1bHRTdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGZpcnN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHRTdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGZpcnN0KSArIFN0cmluZy5mcm9tQ2hhckNvZGUoc2Vjb25kKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgb1t0b1Byb3BlcnR5KHN0cmluZ0l0ZXJhdG9yTmV4dEluZGV4KV0gPSBwb3NpdGlvbiArIHJlc3VsdFN0cmluZy5sZW5ndGg7XG4gICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QocmVzdWx0U3RyaW5nLCBmYWxzZSk7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZVxuICB9KSwgT2JqZWN0LmRlZmluZVByb3BlcnR5KCRfXzIsIFN5bWJvbC5pdGVyYXRvciwge1xuICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWVcbiAgfSksICRfXzIpLCB7fSk7XG4gIGZ1bmN0aW9uIGNyZWF0ZVN0cmluZ0l0ZXJhdG9yKHN0cmluZykge1xuICAgIHZhciBzID0gU3RyaW5nKHN0cmluZyk7XG4gICAgdmFyIGl0ZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShTdHJpbmdJdGVyYXRvci5wcm90b3R5cGUpO1xuICAgIGl0ZXJhdG9yW3RvUHJvcGVydHkoaXRlcmF0ZWRTdHJpbmcpXSA9IHM7XG4gICAgaXRlcmF0b3JbdG9Qcm9wZXJ0eShzdHJpbmdJdGVyYXRvck5leHRJbmRleCldID0gMDtcbiAgICByZXR1cm4gaXRlcmF0b3I7XG4gIH1cbiAgcmV0dXJuIHtnZXQgY3JlYXRlU3RyaW5nSXRlcmF0b3IoKSB7XG4gICAgICByZXR1cm4gY3JlYXRlU3RyaW5nSXRlcmF0b3I7XG4gICAgfX07XG59KTtcblN5c3RlbS5yZWdpc3RlcihcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL1N0cmluZ1wiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9TdHJpbmdcIjtcbiAgdmFyIGNyZWF0ZVN0cmluZ0l0ZXJhdG9yID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL1N0cmluZ0l0ZXJhdG9yXCIpLmNyZWF0ZVN0cmluZ0l0ZXJhdG9yO1xuICB2YXIgJF9fMSA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlsc1wiKSxcbiAgICAgIG1heWJlQWRkRnVuY3Rpb25zID0gJF9fMS5tYXliZUFkZEZ1bmN0aW9ucyxcbiAgICAgIG1heWJlQWRkSXRlcmF0b3IgPSAkX18xLm1heWJlQWRkSXRlcmF0b3IsXG4gICAgICByZWdpc3RlclBvbHlmaWxsID0gJF9fMS5yZWdpc3RlclBvbHlmaWxsO1xuICB2YXIgJHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbiAgdmFyICRpbmRleE9mID0gU3RyaW5nLnByb3RvdHlwZS5pbmRleE9mO1xuICB2YXIgJGxhc3RJbmRleE9mID0gU3RyaW5nLnByb3RvdHlwZS5sYXN0SW5kZXhPZjtcbiAgZnVuY3Rpb24gc3RhcnRzV2l0aChzZWFyY2gpIHtcbiAgICB2YXIgc3RyaW5nID0gU3RyaW5nKHRoaXMpO1xuICAgIGlmICh0aGlzID09IG51bGwgfHwgJHRvU3RyaW5nLmNhbGwoc2VhcmNoKSA9PSAnW29iamVjdCBSZWdFeHBdJykge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgfVxuICAgIHZhciBzdHJpbmdMZW5ndGggPSBzdHJpbmcubGVuZ3RoO1xuICAgIHZhciBzZWFyY2hTdHJpbmcgPSBTdHJpbmcoc2VhcmNoKTtcbiAgICB2YXIgc2VhcmNoTGVuZ3RoID0gc2VhcmNoU3RyaW5nLmxlbmd0aDtcbiAgICB2YXIgcG9zaXRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcbiAgICB2YXIgcG9zID0gcG9zaXRpb24gPyBOdW1iZXIocG9zaXRpb24pIDogMDtcbiAgICBpZiAoaXNOYU4ocG9zKSkge1xuICAgICAgcG9zID0gMDtcbiAgICB9XG4gICAgdmFyIHN0YXJ0ID0gTWF0aC5taW4oTWF0aC5tYXgocG9zLCAwKSwgc3RyaW5nTGVuZ3RoKTtcbiAgICByZXR1cm4gJGluZGV4T2YuY2FsbChzdHJpbmcsIHNlYXJjaFN0cmluZywgcG9zKSA9PSBzdGFydDtcbiAgfVxuICBmdW5jdGlvbiBlbmRzV2l0aChzZWFyY2gpIHtcbiAgICB2YXIgc3RyaW5nID0gU3RyaW5nKHRoaXMpO1xuICAgIGlmICh0aGlzID09IG51bGwgfHwgJHRvU3RyaW5nLmNhbGwoc2VhcmNoKSA9PSAnW29iamVjdCBSZWdFeHBdJykge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgfVxuICAgIHZhciBzdHJpbmdMZW5ndGggPSBzdHJpbmcubGVuZ3RoO1xuICAgIHZhciBzZWFyY2hTdHJpbmcgPSBTdHJpbmcoc2VhcmNoKTtcbiAgICB2YXIgc2VhcmNoTGVuZ3RoID0gc2VhcmNoU3RyaW5nLmxlbmd0aDtcbiAgICB2YXIgcG9zID0gc3RyaW5nTGVuZ3RoO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgdmFyIHBvc2l0aW9uID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcG9zID0gcG9zaXRpb24gPyBOdW1iZXIocG9zaXRpb24pIDogMDtcbiAgICAgICAgaWYgKGlzTmFOKHBvcykpIHtcbiAgICAgICAgICBwb3MgPSAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBlbmQgPSBNYXRoLm1pbihNYXRoLm1heChwb3MsIDApLCBzdHJpbmdMZW5ndGgpO1xuICAgIHZhciBzdGFydCA9IGVuZCAtIHNlYXJjaExlbmd0aDtcbiAgICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiAkbGFzdEluZGV4T2YuY2FsbChzdHJpbmcsIHNlYXJjaFN0cmluZywgc3RhcnQpID09IHN0YXJ0O1xuICB9XG4gIGZ1bmN0aW9uIGNvbnRhaW5zKHNlYXJjaCkge1xuICAgIGlmICh0aGlzID09IG51bGwpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcigpO1xuICAgIH1cbiAgICB2YXIgc3RyaW5nID0gU3RyaW5nKHRoaXMpO1xuICAgIHZhciBzdHJpbmdMZW5ndGggPSBzdHJpbmcubGVuZ3RoO1xuICAgIHZhciBzZWFyY2hTdHJpbmcgPSBTdHJpbmcoc2VhcmNoKTtcbiAgICB2YXIgc2VhcmNoTGVuZ3RoID0gc2VhcmNoU3RyaW5nLmxlbmd0aDtcbiAgICB2YXIgcG9zaXRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcbiAgICB2YXIgcG9zID0gcG9zaXRpb24gPyBOdW1iZXIocG9zaXRpb24pIDogMDtcbiAgICBpZiAoaXNOYU4ocG9zKSkge1xuICAgICAgcG9zID0gMDtcbiAgICB9XG4gICAgdmFyIHN0YXJ0ID0gTWF0aC5taW4oTWF0aC5tYXgocG9zLCAwKSwgc3RyaW5nTGVuZ3RoKTtcbiAgICByZXR1cm4gJGluZGV4T2YuY2FsbChzdHJpbmcsIHNlYXJjaFN0cmluZywgcG9zKSAhPSAtMTtcbiAgfVxuICBmdW5jdGlvbiByZXBlYXQoY291bnQpIHtcbiAgICBpZiAodGhpcyA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICB9XG4gICAgdmFyIHN0cmluZyA9IFN0cmluZyh0aGlzKTtcbiAgICB2YXIgbiA9IGNvdW50ID8gTnVtYmVyKGNvdW50KSA6IDA7XG4gICAgaWYgKGlzTmFOKG4pKSB7XG4gICAgICBuID0gMDtcbiAgICB9XG4gICAgaWYgKG4gPCAwIHx8IG4gPT0gSW5maW5pdHkpIHtcbiAgICAgIHRocm93IFJhbmdlRXJyb3IoKTtcbiAgICB9XG4gICAgaWYgKG4gPT0gMCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gJyc7XG4gICAgd2hpbGUgKG4tLSkge1xuICAgICAgcmVzdWx0ICs9IHN0cmluZztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBmdW5jdGlvbiBjb2RlUG9pbnRBdChwb3NpdGlvbikge1xuICAgIGlmICh0aGlzID09IG51bGwpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcigpO1xuICAgIH1cbiAgICB2YXIgc3RyaW5nID0gU3RyaW5nKHRoaXMpO1xuICAgIHZhciBzaXplID0gc3RyaW5nLmxlbmd0aDtcbiAgICB2YXIgaW5kZXggPSBwb3NpdGlvbiA/IE51bWJlcihwb3NpdGlvbikgOiAwO1xuICAgIGlmIChpc05hTihpbmRleCkpIHtcbiAgICAgIGluZGV4ID0gMDtcbiAgICB9XG4gICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSBzaXplKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICB2YXIgZmlyc3QgPSBzdHJpbmcuY2hhckNvZGVBdChpbmRleCk7XG4gICAgdmFyIHNlY29uZDtcbiAgICBpZiAoZmlyc3QgPj0gMHhEODAwICYmIGZpcnN0IDw9IDB4REJGRiAmJiBzaXplID4gaW5kZXggKyAxKSB7XG4gICAgICBzZWNvbmQgPSBzdHJpbmcuY2hhckNvZGVBdChpbmRleCArIDEpO1xuICAgICAgaWYgKHNlY29uZCA+PSAweERDMDAgJiYgc2Vjb25kIDw9IDB4REZGRikge1xuICAgICAgICByZXR1cm4gKGZpcnN0IC0gMHhEODAwKSAqIDB4NDAwICsgc2Vjb25kIC0gMHhEQzAwICsgMHgxMDAwMDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZpcnN0O1xuICB9XG4gIGZ1bmN0aW9uIHJhdyhjYWxsc2l0ZSkge1xuICAgIHZhciByYXcgPSBjYWxsc2l0ZS5yYXc7XG4gICAgdmFyIGxlbiA9IHJhdy5sZW5ndGggPj4+IDA7XG4gICAgaWYgKGxlbiA9PT0gMClcbiAgICAgIHJldHVybiAnJztcbiAgICB2YXIgcyA9ICcnO1xuICAgIHZhciBpID0gMDtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgcyArPSByYXdbaV07XG4gICAgICBpZiAoaSArIDEgPT09IGxlbilcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgICBzICs9IGFyZ3VtZW50c1srK2ldO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBmcm9tQ29kZVBvaW50KCkge1xuICAgIHZhciBjb2RlVW5pdHMgPSBbXTtcbiAgICB2YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xuICAgIHZhciBoaWdoU3Vycm9nYXRlO1xuICAgIHZhciBsb3dTdXJyb2dhdGU7XG4gICAgdmFyIGluZGV4ID0gLTE7XG4gICAgdmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgaWYgKCFsZW5ndGgpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIHZhciBjb2RlUG9pbnQgPSBOdW1iZXIoYXJndW1lbnRzW2luZGV4XSk7XG4gICAgICBpZiAoIWlzRmluaXRlKGNvZGVQb2ludCkgfHwgY29kZVBvaW50IDwgMCB8fCBjb2RlUG9pbnQgPiAweDEwRkZGRiB8fCBmbG9vcihjb2RlUG9pbnQpICE9IGNvZGVQb2ludCkge1xuICAgICAgICB0aHJvdyBSYW5nZUVycm9yKCdJbnZhbGlkIGNvZGUgcG9pbnQ6ICcgKyBjb2RlUG9pbnQpO1xuICAgICAgfVxuICAgICAgaWYgKGNvZGVQb2ludCA8PSAweEZGRkYpIHtcbiAgICAgICAgY29kZVVuaXRzLnB1c2goY29kZVBvaW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvZGVQb2ludCAtPSAweDEwMDAwO1xuICAgICAgICBoaWdoU3Vycm9nYXRlID0gKGNvZGVQb2ludCA+PiAxMCkgKyAweEQ4MDA7XG4gICAgICAgIGxvd1N1cnJvZ2F0ZSA9IChjb2RlUG9pbnQgJSAweDQwMCkgKyAweERDMDA7XG4gICAgICAgIGNvZGVVbml0cy5wdXNoKGhpZ2hTdXJyb2dhdGUsIGxvd1N1cnJvZ2F0ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGNvZGVVbml0cyk7XG4gIH1cbiAgZnVuY3Rpb24gc3RyaW5nUHJvdG90eXBlSXRlcmF0b3IoKSB7XG4gICAgdmFyIG8gPSAkdHJhY2V1clJ1bnRpbWUuY2hlY2tPYmplY3RDb2VyY2libGUodGhpcyk7XG4gICAgdmFyIHMgPSBTdHJpbmcobyk7XG4gICAgcmV0dXJuIGNyZWF0ZVN0cmluZ0l0ZXJhdG9yKHMpO1xuICB9XG4gIGZ1bmN0aW9uIHBvbHlmaWxsU3RyaW5nKGdsb2JhbCkge1xuICAgIHZhciBTdHJpbmcgPSBnbG9iYWwuU3RyaW5nO1xuICAgIG1heWJlQWRkRnVuY3Rpb25zKFN0cmluZy5wcm90b3R5cGUsIFsnY29kZVBvaW50QXQnLCBjb2RlUG9pbnRBdCwgJ2NvbnRhaW5zJywgY29udGFpbnMsICdlbmRzV2l0aCcsIGVuZHNXaXRoLCAnc3RhcnRzV2l0aCcsIHN0YXJ0c1dpdGgsICdyZXBlYXQnLCByZXBlYXRdKTtcbiAgICBtYXliZUFkZEZ1bmN0aW9ucyhTdHJpbmcsIFsnZnJvbUNvZGVQb2ludCcsIGZyb21Db2RlUG9pbnQsICdyYXcnLCByYXddKTtcbiAgICBtYXliZUFkZEl0ZXJhdG9yKFN0cmluZy5wcm90b3R5cGUsIHN0cmluZ1Byb3RvdHlwZUl0ZXJhdG9yLCBTeW1ib2wpO1xuICB9XG4gIHJlZ2lzdGVyUG9seWZpbGwocG9seWZpbGxTdHJpbmcpO1xuICByZXR1cm4ge1xuICAgIGdldCBzdGFydHNXaXRoKCkge1xuICAgICAgcmV0dXJuIHN0YXJ0c1dpdGg7XG4gICAgfSxcbiAgICBnZXQgZW5kc1dpdGgoKSB7XG4gICAgICByZXR1cm4gZW5kc1dpdGg7XG4gICAgfSxcbiAgICBnZXQgY29udGFpbnMoKSB7XG4gICAgICByZXR1cm4gY29udGFpbnM7XG4gICAgfSxcbiAgICBnZXQgcmVwZWF0KCkge1xuICAgICAgcmV0dXJuIHJlcGVhdDtcbiAgICB9LFxuICAgIGdldCBjb2RlUG9pbnRBdCgpIHtcbiAgICAgIHJldHVybiBjb2RlUG9pbnRBdDtcbiAgICB9LFxuICAgIGdldCByYXcoKSB7XG4gICAgICByZXR1cm4gcmF3O1xuICAgIH0sXG4gICAgZ2V0IGZyb21Db2RlUG9pbnQoKSB7XG4gICAgICByZXR1cm4gZnJvbUNvZGVQb2ludDtcbiAgICB9LFxuICAgIGdldCBzdHJpbmdQcm90b3R5cGVJdGVyYXRvcigpIHtcbiAgICAgIHJldHVybiBzdHJpbmdQcm90b3R5cGVJdGVyYXRvcjtcbiAgICB9LFxuICAgIGdldCBwb2x5ZmlsbFN0cmluZygpIHtcbiAgICAgIHJldHVybiBwb2x5ZmlsbFN0cmluZztcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9TdHJpbmdcIiArICcnKTtcblN5c3RlbS5yZWdpc3RlcihcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL0FycmF5SXRlcmF0b3JcIiwgW10sIGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgdmFyICRfXzI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL0FycmF5SXRlcmF0b3JcIjtcbiAgdmFyICRfXzAgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHNcIiksXG4gICAgICB0b09iamVjdCA9ICRfXzAudG9PYmplY3QsXG4gICAgICB0b1VpbnQzMiA9ICRfXzAudG9VaW50MzIsXG4gICAgICBjcmVhdGVJdGVyYXRvclJlc3VsdE9iamVjdCA9ICRfXzAuY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3Q7XG4gIHZhciBBUlJBWV9JVEVSQVRPUl9LSU5EX0tFWVMgPSAxO1xuICB2YXIgQVJSQVlfSVRFUkFUT1JfS0lORF9WQUxVRVMgPSAyO1xuICB2YXIgQVJSQVlfSVRFUkFUT1JfS0lORF9FTlRSSUVTID0gMztcbiAgdmFyIEFycmF5SXRlcmF0b3IgPSBmdW5jdGlvbiBBcnJheUl0ZXJhdG9yKCkge307XG4gICgkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKEFycmF5SXRlcmF0b3IsICgkX18yID0ge30sIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkX18yLCBcIm5leHRcIiwge1xuICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpdGVyYXRvciA9IHRvT2JqZWN0KHRoaXMpO1xuICAgICAgdmFyIGFycmF5ID0gaXRlcmF0b3IuaXRlcmF0b3JPYmplY3RfO1xuICAgICAgaWYgKCFhcnJheSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QgaXMgbm90IGFuIEFycmF5SXRlcmF0b3InKTtcbiAgICAgIH1cbiAgICAgIHZhciBpbmRleCA9IGl0ZXJhdG9yLmFycmF5SXRlcmF0b3JOZXh0SW5kZXhfO1xuICAgICAgdmFyIGl0ZW1LaW5kID0gaXRlcmF0b3IuYXJyYXlJdGVyYXRpb25LaW5kXztcbiAgICAgIHZhciBsZW5ndGggPSB0b1VpbnQzMihhcnJheS5sZW5ndGgpO1xuICAgICAgaWYgKGluZGV4ID49IGxlbmd0aCkge1xuICAgICAgICBpdGVyYXRvci5hcnJheUl0ZXJhdG9yTmV4dEluZGV4XyA9IEluZmluaXR5O1xuICAgICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QodW5kZWZpbmVkLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGl0ZXJhdG9yLmFycmF5SXRlcmF0b3JOZXh0SW5kZXhfID0gaW5kZXggKyAxO1xuICAgICAgaWYgKGl0ZW1LaW5kID09IEFSUkFZX0lURVJBVE9SX0tJTkRfVkFMVUVTKVxuICAgICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QoYXJyYXlbaW5kZXhdLCBmYWxzZSk7XG4gICAgICBpZiAoaXRlbUtpbmQgPT0gQVJSQVlfSVRFUkFUT1JfS0lORF9FTlRSSUVTKVxuICAgICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QoW2luZGV4LCBhcnJheVtpbmRleF1dLCBmYWxzZSk7XG4gICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QoaW5kZXgsIGZhbHNlKTtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIHdyaXRhYmxlOiB0cnVlXG4gIH0pLCBPYmplY3QuZGVmaW5lUHJvcGVydHkoJF9fMiwgU3ltYm9sLml0ZXJhdG9yLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZVxuICB9KSwgJF9fMiksIHt9KTtcbiAgZnVuY3Rpb24gY3JlYXRlQXJyYXlJdGVyYXRvcihhcnJheSwga2luZCkge1xuICAgIHZhciBvYmplY3QgPSB0b09iamVjdChhcnJheSk7XG4gICAgdmFyIGl0ZXJhdG9yID0gbmV3IEFycmF5SXRlcmF0b3I7XG4gICAgaXRlcmF0b3IuaXRlcmF0b3JPYmplY3RfID0gb2JqZWN0O1xuICAgIGl0ZXJhdG9yLmFycmF5SXRlcmF0b3JOZXh0SW5kZXhfID0gMDtcbiAgICBpdGVyYXRvci5hcnJheUl0ZXJhdGlvbktpbmRfID0ga2luZDtcbiAgICByZXR1cm4gaXRlcmF0b3I7XG4gIH1cbiAgZnVuY3Rpb24gZW50cmllcygpIHtcbiAgICByZXR1cm4gY3JlYXRlQXJyYXlJdGVyYXRvcih0aGlzLCBBUlJBWV9JVEVSQVRPUl9LSU5EX0VOVFJJRVMpO1xuICB9XG4gIGZ1bmN0aW9uIGtleXMoKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUFycmF5SXRlcmF0b3IodGhpcywgQVJSQVlfSVRFUkFUT1JfS0lORF9LRVlTKTtcbiAgfVxuICBmdW5jdGlvbiB2YWx1ZXMoKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUFycmF5SXRlcmF0b3IodGhpcywgQVJSQVlfSVRFUkFUT1JfS0lORF9WQUxVRVMpO1xuICB9XG4gIHJldHVybiB7XG4gICAgZ2V0IGVudHJpZXMoKSB7XG4gICAgICByZXR1cm4gZW50cmllcztcbiAgICB9LFxuICAgIGdldCBrZXlzKCkge1xuICAgICAgcmV0dXJuIGtleXM7XG4gICAgfSxcbiAgICBnZXQgdmFsdWVzKCkge1xuICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5yZWdpc3RlcihcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL0FycmF5XCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL0FycmF5XCI7XG4gIHZhciAkX18wID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL0FycmF5SXRlcmF0b3JcIiksXG4gICAgICBlbnRyaWVzID0gJF9fMC5lbnRyaWVzLFxuICAgICAga2V5cyA9ICRfXzAua2V5cyxcbiAgICAgIHZhbHVlcyA9ICRfXzAudmFsdWVzO1xuICB2YXIgJF9fMSA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlsc1wiKSxcbiAgICAgIGNoZWNrSXRlcmFibGUgPSAkX18xLmNoZWNrSXRlcmFibGUsXG4gICAgICBpc0NhbGxhYmxlID0gJF9fMS5pc0NhbGxhYmxlLFxuICAgICAgaXNDb25zdHJ1Y3RvciA9ICRfXzEuaXNDb25zdHJ1Y3RvcixcbiAgICAgIG1heWJlQWRkRnVuY3Rpb25zID0gJF9fMS5tYXliZUFkZEZ1bmN0aW9ucyxcbiAgICAgIG1heWJlQWRkSXRlcmF0b3IgPSAkX18xLm1heWJlQWRkSXRlcmF0b3IsXG4gICAgICByZWdpc3RlclBvbHlmaWxsID0gJF9fMS5yZWdpc3RlclBvbHlmaWxsLFxuICAgICAgdG9JbnRlZ2VyID0gJF9fMS50b0ludGVnZXIsXG4gICAgICB0b0xlbmd0aCA9ICRfXzEudG9MZW5ndGgsXG4gICAgICB0b09iamVjdCA9ICRfXzEudG9PYmplY3Q7XG4gIGZ1bmN0aW9uIGZyb20oYXJyTGlrZSkge1xuICAgIHZhciBtYXBGbiA9IGFyZ3VtZW50c1sxXTtcbiAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1syXTtcbiAgICB2YXIgQyA9IHRoaXM7XG4gICAgdmFyIGl0ZW1zID0gdG9PYmplY3QoYXJyTGlrZSk7XG4gICAgdmFyIG1hcHBpbmcgPSBtYXBGbiAhPT0gdW5kZWZpbmVkO1xuICAgIHZhciBrID0gMDtcbiAgICB2YXIgYXJyLFxuICAgICAgICBsZW47XG4gICAgaWYgKG1hcHBpbmcgJiYgIWlzQ2FsbGFibGUobWFwRm4pKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICB9XG4gICAgaWYgKGNoZWNrSXRlcmFibGUoaXRlbXMpKSB7XG4gICAgICBhcnIgPSBpc0NvbnN0cnVjdG9yKEMpID8gbmV3IEMoKSA6IFtdO1xuICAgICAgZm9yICh2YXIgJF9fMiA9IGl0ZW1zW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgICAkX18zOyAhKCRfXzMgPSAkX18yLm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgIHZhciBpdGVtID0gJF9fMy52YWx1ZTtcbiAgICAgICAge1xuICAgICAgICAgIGlmIChtYXBwaW5nKSB7XG4gICAgICAgICAgICBhcnJba10gPSBtYXBGbi5jYWxsKHRoaXNBcmcsIGl0ZW0sIGspO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcnJba10gPSBpdGVtO1xuICAgICAgICAgIH1cbiAgICAgICAgICBrKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGFyci5sZW5ndGggPSBrO1xuICAgICAgcmV0dXJuIGFycjtcbiAgICB9XG4gICAgbGVuID0gdG9MZW5ndGgoaXRlbXMubGVuZ3RoKTtcbiAgICBhcnIgPSBpc0NvbnN0cnVjdG9yKEMpID8gbmV3IEMobGVuKSA6IG5ldyBBcnJheShsZW4pO1xuICAgIGZvciAoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIGlmIChtYXBwaW5nKSB7XG4gICAgICAgIGFycltrXSA9IHR5cGVvZiB0aGlzQXJnID09PSAndW5kZWZpbmVkJyA/IG1hcEZuKGl0ZW1zW2tdLCBrKSA6IG1hcEZuLmNhbGwodGhpc0FyZywgaXRlbXNba10sIGspO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXJyW2tdID0gaXRlbXNba107XG4gICAgICB9XG4gICAgfVxuICAgIGFyci5sZW5ndGggPSBsZW47XG4gICAgcmV0dXJuIGFycjtcbiAgfVxuICBmdW5jdGlvbiBvZigpIHtcbiAgICBmb3IgKHZhciBpdGVtcyA9IFtdLFxuICAgICAgICAkX180ID0gMDsgJF9fNCA8IGFyZ3VtZW50cy5sZW5ndGg7ICRfXzQrKylcbiAgICAgIGl0ZW1zWyRfXzRdID0gYXJndW1lbnRzWyRfXzRdO1xuICAgIHZhciBDID0gdGhpcztcbiAgICB2YXIgbGVuID0gaXRlbXMubGVuZ3RoO1xuICAgIHZhciBhcnIgPSBpc0NvbnN0cnVjdG9yKEMpID8gbmV3IEMobGVuKSA6IG5ldyBBcnJheShsZW4pO1xuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIGFycltrXSA9IGl0ZW1zW2tdO1xuICAgIH1cbiAgICBhcnIubGVuZ3RoID0gbGVuO1xuICAgIHJldHVybiBhcnI7XG4gIH1cbiAgZnVuY3Rpb24gZmlsbCh2YWx1ZSkge1xuICAgIHZhciBzdGFydCA9IGFyZ3VtZW50c1sxXSAhPT0gKHZvaWQgMCkgPyBhcmd1bWVudHNbMV0gOiAwO1xuICAgIHZhciBlbmQgPSBhcmd1bWVudHNbMl07XG4gICAgdmFyIG9iamVjdCA9IHRvT2JqZWN0KHRoaXMpO1xuICAgIHZhciBsZW4gPSB0b0xlbmd0aChvYmplY3QubGVuZ3RoKTtcbiAgICB2YXIgZmlsbFN0YXJ0ID0gdG9JbnRlZ2VyKHN0YXJ0KTtcbiAgICB2YXIgZmlsbEVuZCA9IGVuZCAhPT0gdW5kZWZpbmVkID8gdG9JbnRlZ2VyKGVuZCkgOiBsZW47XG4gICAgZmlsbFN0YXJ0ID0gZmlsbFN0YXJ0IDwgMCA/IE1hdGgubWF4KGxlbiArIGZpbGxTdGFydCwgMCkgOiBNYXRoLm1pbihmaWxsU3RhcnQsIGxlbik7XG4gICAgZmlsbEVuZCA9IGZpbGxFbmQgPCAwID8gTWF0aC5tYXgobGVuICsgZmlsbEVuZCwgMCkgOiBNYXRoLm1pbihmaWxsRW5kLCBsZW4pO1xuICAgIHdoaWxlIChmaWxsU3RhcnQgPCBmaWxsRW5kKSB7XG4gICAgICBvYmplY3RbZmlsbFN0YXJ0XSA9IHZhbHVlO1xuICAgICAgZmlsbFN0YXJ0Kys7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cbiAgZnVuY3Rpb24gZmluZChwcmVkaWNhdGUpIHtcbiAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1sxXTtcbiAgICByZXR1cm4gZmluZEhlbHBlcih0aGlzLCBwcmVkaWNhdGUsIHRoaXNBcmcpO1xuICB9XG4gIGZ1bmN0aW9uIGZpbmRJbmRleChwcmVkaWNhdGUpIHtcbiAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1sxXTtcbiAgICByZXR1cm4gZmluZEhlbHBlcih0aGlzLCBwcmVkaWNhdGUsIHRoaXNBcmcsIHRydWUpO1xuICB9XG4gIGZ1bmN0aW9uIGZpbmRIZWxwZXIoc2VsZiwgcHJlZGljYXRlKSB7XG4gICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHNbMl07XG4gICAgdmFyIHJldHVybkluZGV4ID0gYXJndW1lbnRzWzNdICE9PSAodm9pZCAwKSA/IGFyZ3VtZW50c1szXSA6IGZhbHNlO1xuICAgIHZhciBvYmplY3QgPSB0b09iamVjdChzZWxmKTtcbiAgICB2YXIgbGVuID0gdG9MZW5ndGgob2JqZWN0Lmxlbmd0aCk7XG4gICAgaWYgKCFpc0NhbGxhYmxlKHByZWRpY2F0ZSkpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcigpO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2YXIgdmFsdWUgPSBvYmplY3RbaV07XG4gICAgICBpZiAocHJlZGljYXRlLmNhbGwodGhpc0FyZywgdmFsdWUsIGksIG9iamVjdCkpIHtcbiAgICAgICAgcmV0dXJuIHJldHVybkluZGV4ID8gaSA6IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmV0dXJuSW5kZXggPyAtMSA6IHVuZGVmaW5lZDtcbiAgfVxuICBmdW5jdGlvbiBwb2x5ZmlsbEFycmF5KGdsb2JhbCkge1xuICAgIHZhciAkX181ID0gZ2xvYmFsLFxuICAgICAgICBBcnJheSA9ICRfXzUuQXJyYXksXG4gICAgICAgIE9iamVjdCA9ICRfXzUuT2JqZWN0LFxuICAgICAgICBTeW1ib2wgPSAkX181LlN5bWJvbDtcbiAgICBtYXliZUFkZEZ1bmN0aW9ucyhBcnJheS5wcm90b3R5cGUsIFsnZW50cmllcycsIGVudHJpZXMsICdrZXlzJywga2V5cywgJ3ZhbHVlcycsIHZhbHVlcywgJ2ZpbGwnLCBmaWxsLCAnZmluZCcsIGZpbmQsICdmaW5kSW5kZXgnLCBmaW5kSW5kZXhdKTtcbiAgICBtYXliZUFkZEZ1bmN0aW9ucyhBcnJheSwgWydmcm9tJywgZnJvbSwgJ29mJywgb2ZdKTtcbiAgICBtYXliZUFkZEl0ZXJhdG9yKEFycmF5LnByb3RvdHlwZSwgdmFsdWVzLCBTeW1ib2wpO1xuICAgIG1heWJlQWRkSXRlcmF0b3IoT2JqZWN0LmdldFByb3RvdHlwZU9mKFtdLnZhbHVlcygpKSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LCBTeW1ib2wpO1xuICB9XG4gIHJlZ2lzdGVyUG9seWZpbGwocG9seWZpbGxBcnJheSk7XG4gIHJldHVybiB7XG4gICAgZ2V0IGZyb20oKSB7XG4gICAgICByZXR1cm4gZnJvbTtcbiAgICB9LFxuICAgIGdldCBvZigpIHtcbiAgICAgIHJldHVybiBvZjtcbiAgICB9LFxuICAgIGdldCBmaWxsKCkge1xuICAgICAgcmV0dXJuIGZpbGw7XG4gICAgfSxcbiAgICBnZXQgZmluZCgpIHtcbiAgICAgIHJldHVybiBmaW5kO1xuICAgIH0sXG4gICAgZ2V0IGZpbmRJbmRleCgpIHtcbiAgICAgIHJldHVybiBmaW5kSW5kZXg7XG4gICAgfSxcbiAgICBnZXQgcG9seWZpbGxBcnJheSgpIHtcbiAgICAgIHJldHVybiBwb2x5ZmlsbEFycmF5O1xuICAgIH1cbiAgfTtcbn0pO1xuU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL0FycmF5XCIgKyAnJyk7XG5TeXN0ZW0ucmVnaXN0ZXIoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9PYmplY3RcIiwgW10sIGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgdmFyIF9fbW9kdWxlTmFtZSA9IFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvT2JqZWN0XCI7XG4gIHZhciAkX18wID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL3V0aWxzXCIpLFxuICAgICAgbWF5YmVBZGRGdW5jdGlvbnMgPSAkX18wLm1heWJlQWRkRnVuY3Rpb25zLFxuICAgICAgcmVnaXN0ZXJQb2x5ZmlsbCA9ICRfXzAucmVnaXN0ZXJQb2x5ZmlsbDtcbiAgdmFyICRfXzEgPSAkdHJhY2V1clJ1bnRpbWUsXG4gICAgICBkZWZpbmVQcm9wZXJ0eSA9ICRfXzEuZGVmaW5lUHJvcGVydHksXG4gICAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSAkX18xLmdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgICAgIGdldE93blByb3BlcnR5TmFtZXMgPSAkX18xLmdldE93blByb3BlcnR5TmFtZXMsXG4gICAgICBpc1ByaXZhdGVOYW1lID0gJF9fMS5pc1ByaXZhdGVOYW1lLFxuICAgICAga2V5cyA9ICRfXzEua2V5cztcbiAgZnVuY3Rpb24gaXMobGVmdCwgcmlnaHQpIHtcbiAgICBpZiAobGVmdCA9PT0gcmlnaHQpXG4gICAgICByZXR1cm4gbGVmdCAhPT0gMCB8fCAxIC8gbGVmdCA9PT0gMSAvIHJpZ2h0O1xuICAgIHJldHVybiBsZWZ0ICE9PSBsZWZ0ICYmIHJpZ2h0ICE9PSByaWdodDtcbiAgfVxuICBmdW5jdGlvbiBhc3NpZ24odGFyZ2V0KSB7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG4gICAgICB2YXIgcHJvcHMgPSBrZXlzKHNvdXJjZSk7XG4gICAgICB2YXIgcCxcbiAgICAgICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG4gICAgICBmb3IgKHAgPSAwOyBwIDwgbGVuZ3RoOyBwKyspIHtcbiAgICAgICAgdmFyIG5hbWUgPSBwcm9wc1twXTtcbiAgICAgICAgaWYgKGlzUHJpdmF0ZU5hbWUobmFtZSkpXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIHRhcmdldFtuYW1lXSA9IHNvdXJjZVtuYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxuICBmdW5jdGlvbiBtaXhpbih0YXJnZXQsIHNvdXJjZSkge1xuICAgIHZhciBwcm9wcyA9IGdldE93blByb3BlcnR5TmFtZXMoc291cmNlKTtcbiAgICB2YXIgcCxcbiAgICAgICAgZGVzY3JpcHRvcixcbiAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuICAgIGZvciAocCA9IDA7IHAgPCBsZW5ndGg7IHArKykge1xuICAgICAgdmFyIG5hbWUgPSBwcm9wc1twXTtcbiAgICAgIGlmIChpc1ByaXZhdGVOYW1lKG5hbWUpKVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIGRlc2NyaXB0b3IgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBwcm9wc1twXSk7XG4gICAgICBkZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BzW3BdLCBkZXNjcmlwdG9yKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxuICBmdW5jdGlvbiBwb2x5ZmlsbE9iamVjdChnbG9iYWwpIHtcbiAgICB2YXIgT2JqZWN0ID0gZ2xvYmFsLk9iamVjdDtcbiAgICBtYXliZUFkZEZ1bmN0aW9ucyhPYmplY3QsIFsnYXNzaWduJywgYXNzaWduLCAnaXMnLCBpcywgJ21peGluJywgbWl4aW5dKTtcbiAgfVxuICByZWdpc3RlclBvbHlmaWxsKHBvbHlmaWxsT2JqZWN0KTtcbiAgcmV0dXJuIHtcbiAgICBnZXQgaXMoKSB7XG4gICAgICByZXR1cm4gaXM7XG4gICAgfSxcbiAgICBnZXQgYXNzaWduKCkge1xuICAgICAgcmV0dXJuIGFzc2lnbjtcbiAgICB9LFxuICAgIGdldCBtaXhpbigpIHtcbiAgICAgIHJldHVybiBtaXhpbjtcbiAgICB9LFxuICAgIGdldCBwb2x5ZmlsbE9iamVjdCgpIHtcbiAgICAgIHJldHVybiBwb2x5ZmlsbE9iamVjdDtcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9PYmplY3RcIiArICcnKTtcblN5c3RlbS5yZWdpc3RlcihcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL051bWJlclwiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9OdW1iZXJcIjtcbiAgdmFyICRfXzAgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHNcIiksXG4gICAgICBpc051bWJlciA9ICRfXzAuaXNOdW1iZXIsXG4gICAgICBtYXliZUFkZENvbnN0cyA9ICRfXzAubWF5YmVBZGRDb25zdHMsXG4gICAgICBtYXliZUFkZEZ1bmN0aW9ucyA9ICRfXzAubWF5YmVBZGRGdW5jdGlvbnMsXG4gICAgICByZWdpc3RlclBvbHlmaWxsID0gJF9fMC5yZWdpc3RlclBvbHlmaWxsLFxuICAgICAgdG9JbnRlZ2VyID0gJF9fMC50b0ludGVnZXI7XG4gIHZhciAkYWJzID0gTWF0aC5hYnM7XG4gIHZhciAkaXNGaW5pdGUgPSBpc0Zpbml0ZTtcbiAgdmFyICRpc05hTiA9IGlzTmFOO1xuICB2YXIgTUFYX1NBRkVfSU5URUdFUiA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG4gIHZhciBNSU5fU0FGRV9JTlRFR0VSID0gLU1hdGgucG93KDIsIDUzKSArIDE7XG4gIHZhciBFUFNJTE9OID0gTWF0aC5wb3coMiwgLTUyKTtcbiAgZnVuY3Rpb24gTnVtYmVySXNGaW5pdGUobnVtYmVyKSB7XG4gICAgcmV0dXJuIGlzTnVtYmVyKG51bWJlcikgJiYgJGlzRmluaXRlKG51bWJlcik7XG4gIH1cbiAgO1xuICBmdW5jdGlvbiBpc0ludGVnZXIobnVtYmVyKSB7XG4gICAgcmV0dXJuIE51bWJlcklzRmluaXRlKG51bWJlcikgJiYgdG9JbnRlZ2VyKG51bWJlcikgPT09IG51bWJlcjtcbiAgfVxuICBmdW5jdGlvbiBOdW1iZXJJc05hTihudW1iZXIpIHtcbiAgICByZXR1cm4gaXNOdW1iZXIobnVtYmVyKSAmJiAkaXNOYU4obnVtYmVyKTtcbiAgfVxuICA7XG4gIGZ1bmN0aW9uIGlzU2FmZUludGVnZXIobnVtYmVyKSB7XG4gICAgaWYgKE51bWJlcklzRmluaXRlKG51bWJlcikpIHtcbiAgICAgIHZhciBpbnRlZ3JhbCA9IHRvSW50ZWdlcihudW1iZXIpO1xuICAgICAgaWYgKGludGVncmFsID09PSBudW1iZXIpXG4gICAgICAgIHJldHVybiAkYWJzKGludGVncmFsKSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZnVuY3Rpb24gcG9seWZpbGxOdW1iZXIoZ2xvYmFsKSB7XG4gICAgdmFyIE51bWJlciA9IGdsb2JhbC5OdW1iZXI7XG4gICAgbWF5YmVBZGRDb25zdHMoTnVtYmVyLCBbJ01BWF9TQUZFX0lOVEVHRVInLCBNQVhfU0FGRV9JTlRFR0VSLCAnTUlOX1NBRkVfSU5URUdFUicsIE1JTl9TQUZFX0lOVEVHRVIsICdFUFNJTE9OJywgRVBTSUxPTl0pO1xuICAgIG1heWJlQWRkRnVuY3Rpb25zKE51bWJlciwgWydpc0Zpbml0ZScsIE51bWJlcklzRmluaXRlLCAnaXNJbnRlZ2VyJywgaXNJbnRlZ2VyLCAnaXNOYU4nLCBOdW1iZXJJc05hTiwgJ2lzU2FmZUludGVnZXInLCBpc1NhZmVJbnRlZ2VyXSk7XG4gIH1cbiAgcmVnaXN0ZXJQb2x5ZmlsbChwb2x5ZmlsbE51bWJlcik7XG4gIHJldHVybiB7XG4gICAgZ2V0IE1BWF9TQUZFX0lOVEVHRVIoKSB7XG4gICAgICByZXR1cm4gTUFYX1NBRkVfSU5URUdFUjtcbiAgICB9LFxuICAgIGdldCBNSU5fU0FGRV9JTlRFR0VSKCkge1xuICAgICAgcmV0dXJuIE1JTl9TQUZFX0lOVEVHRVI7XG4gICAgfSxcbiAgICBnZXQgRVBTSUxPTigpIHtcbiAgICAgIHJldHVybiBFUFNJTE9OO1xuICAgIH0sXG4gICAgZ2V0IGlzRmluaXRlKCkge1xuICAgICAgcmV0dXJuIE51bWJlcklzRmluaXRlO1xuICAgIH0sXG4gICAgZ2V0IGlzSW50ZWdlcigpIHtcbiAgICAgIHJldHVybiBpc0ludGVnZXI7XG4gICAgfSxcbiAgICBnZXQgaXNOYU4oKSB7XG4gICAgICByZXR1cm4gTnVtYmVySXNOYU47XG4gICAgfSxcbiAgICBnZXQgaXNTYWZlSW50ZWdlcigpIHtcbiAgICAgIHJldHVybiBpc1NhZmVJbnRlZ2VyO1xuICAgIH0sXG4gICAgZ2V0IHBvbHlmaWxsTnVtYmVyKCkge1xuICAgICAgcmV0dXJuIHBvbHlmaWxsTnVtYmVyO1xuICAgIH1cbiAgfTtcbn0pO1xuU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL051bWJlclwiICsgJycpO1xuU3lzdGVtLnJlZ2lzdGVyKFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvcG9seWZpbGxzXCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL3BvbHlmaWxsc1wiO1xuICB2YXIgcG9seWZpbGxBbGwgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHNcIikucG9seWZpbGxBbGw7XG4gIHBvbHlmaWxsQWxsKHRoaXMpO1xuICB2YXIgc2V0dXBHbG9iYWxzID0gJHRyYWNldXJSdW50aW1lLnNldHVwR2xvYmFscztcbiAgJHRyYWNldXJSdW50aW1lLnNldHVwR2xvYmFscyA9IGZ1bmN0aW9uKGdsb2JhbCkge1xuICAgIHNldHVwR2xvYmFscyhnbG9iYWwpO1xuICAgIHBvbHlmaWxsQWxsKGdsb2JhbCk7XG4gIH07XG4gIHJldHVybiB7fTtcbn0pO1xuU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL3BvbHlmaWxsc1wiICsgJycpO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZSgnX3Byb2Nlc3MnKSx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsImltcG9ydCBzdG9yZSBmcm9tICcuLi9zdG9yZXMvYWxlcnQnO1xuXG52YXIgYWN0aW9ucyA9IHtcblx0b3BlbjogZnVuY3Rpb24gKGNvbmZpZykge1x0XHRcblx0XHR0aGlzLmRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuXHRcdFx0YWN0aW9uOiAnb3BlbkFsZXJ0Jyxcblx0XHRcdGRhdGE6IGNvbmZpZ1xuXHRcdH0pO1xuXHR9LFxuXHRjbG9zZTogZnVuY3Rpb24gKCkge1x0XHRcblx0XHR0aGlzLmRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuXHRcdFx0YWN0aW9uOiAnY2xvc2VBbGVydCdcblx0XHR9KTtcblx0fVxufTtcblxudmFyIGFjdGlvbnMgPSBzdG9yZS5jcmVhdGVBY3Rpb25zKGFjdGlvbnMpO1xuXG5leHBvcnQgZGVmYXVsdCBhY3Rpb25zOyIsImltcG9ydCBzdG9yZSBmcm9tICcuLi9zdG9yZXMvYXBwJztcblxudmFyIGFjdGlvbnMgPSB7XG5cdGZyZWV6ZTogZnVuY3Rpb24gKCkge1x0XHRcblx0XHR0aGlzLmRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuXHRcdFx0YWN0aW9uOiAnZnJlZXplJ1xuXHRcdH0pO1xuXHR9LFxuXHR1bmZyZWV6ZTogZnVuY3Rpb24gKCkge1x0XHRcblx0XHR0aGlzLmRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuXHRcdFx0YWN0aW9uOiAndW5mcmVlemUnXG5cdFx0fSk7XG5cdH1cbn07XG5cbnZhciBhY3Rpb25zID0gc3RvcmUuY3JlYXRlQWN0aW9ucyhhY3Rpb25zKTtcblxuZXhwb3J0IGRlZmF1bHQgYWN0aW9uczsiLCJpbXBvcnQgc3RvcmUgZnJvbSAnLi4vc3RvcmVzL2Jsb2Nrcyc7XG5cbnZhciBhY3Rpb25zID0ge1xuXHR0b2dnbGU6IGZ1bmN0aW9uIChibG9jaykge1xuXHRcdHZhciBibG9ja3MgPSBzdG9yZS5nZXRPcGVuKCk7XG5cblx0XHR2YXIgaW5kZXggPSBibG9ja3MuaW5kZXhPZihibG9jayk7XG5cdFx0aWYoIGluZGV4ID4gLTEgKSB7XG5cdFx0XHRibG9ja3Muc3BsaWNlKGluZGV4LCAxKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YmxvY2tzLnB1c2goYmxvY2spO1xuXHRcdH1cblxuXHRcdHRoaXMuZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG5cdFx0XHRhY3Rpb246ICd0b2dnbGVCbG9jaycsXG5cdFx0XHRkYXRhOiBibG9ja3Ncblx0XHR9KTtcblx0fSxcblx0c2V0T3BlbjogZnVuY3Rpb24gKHBheWxvYWQpIHtcblx0XHR0aGlzLmRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuXHRcdFx0YWN0aW9uOiAndG9nZ2xlQmxvY2snLFxuXHRcdFx0ZGF0YTogcGF5bG9hZFxuXHRcdH0pO1xuXHR9LFxuXHRzZXRWaXNpYmxlOiBmdW5jdGlvbiAocGF5bG9hZCkge1xuXHRcdHRoaXMuZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG5cdFx0XHRhY3Rpb246ICdzZXRWaXNpYmxlJyxcblx0XHRcdGRhdGE6IHBheWxvYWRcblx0XHR9KTtcblx0fVxufTtcblxudmFyIGFjdGlvbnMgPSBzdG9yZS5jcmVhdGVBY3Rpb25zKGFjdGlvbnMpO1xuXG5leHBvcnQgZGVmYXVsdCBhY3Rpb25zOyIsImltcG9ydCBzdG9yZSBmcm9tICcuLi9zdG9yZXMvY3VycmVudCc7XG5cbnZhciBhY3Rpb25zID0ge1xuXHRzZXRTZWxlY3RlZDogZnVuY3Rpb24gKHBheWxvYWQpIHtcblx0XHR0aGlzLmRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuXHRcdFx0YWN0aW9uOiAnc2V0U2VsZWN0ZWQnLFxuXHRcdFx0ZGF0YTogcGF5bG9hZFxuXHRcdH0pO1xuXHR9LFxuXHRjbGVhclNlbGVjdGVkOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5kaXNwYXRjaGVyLmRpc3BhdGNoKHtcblx0XHRcdGFjdGlvbjogJ3NldFNlbGVjdGVkJyxcblx0XHRcdGRhdGE6IFtdXG5cdFx0fSk7XG5cdH1cbn07XG5cbnZhciBhY3Rpb25zID0gc3RvcmUuY3JlYXRlQWN0aW9ucyhhY3Rpb25zKTtcblxuZXhwb3J0IGRlZmF1bHQgYWN0aW9uczsiLCJpbXBvcnQgc3RvcmUgZnJvbSAnLi4vc3RvcmVzL2FsZXJ0JztcbmltcG9ydCBhY3Rpb25zIGZyb20gJy4uL2FjdGlvbnMvYWxlcnQnO1xuXG52YXIgYWxlcnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnYWxlcnQnLFxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBzdG9yZS5vbigndG9nZ2xlQWxlcnQnLCB0aGlzLnRvZ2dsZSk7XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgc3RvcmUub2ZmKCd0b2dnbGVBbGVydCcsIHRoaXMudG9nZ2xlKTtcbiAgfSxcbiAgdG9nZ2xlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBvcGVuOiBzdG9yZS5vcGVuLFxuICAgICAgY29uZmlnOiBzdG9yZS5jb25maWdcbiAgICB9KTtcbiAgfSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9wZW46IGZhbHNlLFxuICAgICAgY29uZmlnOiB7fVxuICAgIH07XG4gIH0sXG4gIGNsb3NlOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICBhY3Rpb25zLmNsb3NlKCk7XG5cbiAgICB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgJiYgY2FsbGJhY2soKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG4gICAgdmFyIGNsYXNzZXMgPSBjeCh7XG4gICAgICAnc3dlZXQtYWxlcnQnOiB0cnVlLFxuICAgICAgJ3Nob3dTd2VldEFsZXJ0JzogdGhpcy5zdGF0ZS5vcGVuXG4gICAgfSk7XG5cbiAgICB2YXIgc3R5bGVzID0ge1xuICAgICAgb3BhY2l0eTogdGhpcy5zdGF0ZS5vcGVuID8gMSA6IDAsXG4gICAgICBkaXNwbGF5OiB0aGlzLnN0YXRlLm9wZW4gPyAnYmxvY2snIDogJ25vbmUnXG4gICAgfTtcblxuICAgIC8vIGVycm9yIGljb25cblxuICAgIHZhciBlcnJvckljb24gPSBjeCh7XG4gICAgICBpY29uOiB0cnVlLFxuICAgICAgZXJyb3I6IHRydWUsXG4gICAgICBhbmltYXRlRXJyb3JJY29uOiB0aGlzLnN0YXRlLmNvbmZpZy5lcnJvclxuICAgIH0pO1xuXG4gICAgdmFyIGVycm9yU3R5bGVzID0ge1xuICAgICAgZGlzcGxheTogdGhpcy5zdGF0ZS5jb25maWcuZXJyb3IgPyAnYmxvY2snIDogJ25vbmUnXG4gICAgfTtcblxuICAgIC8vIHdhcm5pbmdcblxuICAgIHZhciB3YXJuaW5nSWNvbiA9IGN4KHtcbiAgICAgIGljb246IHRydWUsXG4gICAgICB3YXJuaW5nOiB0cnVlLFxuICAgICAgcHVsc2VXYXJuaW5nOiB0aGlzLnN0YXRlLmNvbmZpZy53YXJuaW5nXG4gICAgfSk7XG5cbiAgICB2YXIgd2FybmluZ0JvZHkgPSBjeCh7XG4gICAgICBib2R5OiB0cnVlLFxuICAgICAgcHVsc2VXYXJuaW5nSW5zOiB0aGlzLnN0YXRlLmNvbmZpZy53YXJuaW5nXG4gICAgfSk7XG5cbiAgICB2YXIgd2FybmluZ0RvdCA9IGN4KHtcbiAgICAgIGRvdDogdHJ1ZSxcbiAgICAgIHB1bHNlV2FybmluZ0luczogdGhpcy5zdGF0ZS5jb25maWcud2FybmluZ1xuICAgIH0pO1xuXG4gICAgdmFyIHdhcm5pbmdTdHlsZXMgPSB7XG4gICAgICBkaXNwbGF5OiB0aGlzLnN0YXRlLmNvbmZpZy53YXJuaW5nID8gJ2Jsb2NrJyA6ICdub25lJ1xuICAgIH07XG5cbiAgICAvLyB3YWl0aW5nXG5cbiAgICB2YXIgd2FpdGluZ0ljb24gPSBjeCh7XG4gICAgICBpY29uOiB0cnVlLFxuICAgICAgd2FpdGluZzogdHJ1ZSxcbiAgICAgIGFuaW1hdGU6IHRoaXMuc3RhdGUuY29uZmlnLndhaXRpbmdcbiAgICB9KTtcblxuICAgIHZhciB3YWl0aW5nU3R5bGVzID0ge1xuICAgICAgZGlzcGxheTogdGhpcy5zdGF0ZS5jb25maWcud2FpdGluZyA/ICdibG9jaycgOiAnbm9uZSdcbiAgICB9O1xuXG4gICAgdmFyIHdhaXRpbmdUaXBJY29uID0gY3goe1xuICAgICAgbGluZTogdHJ1ZSxcbiAgICAgIHRpcDogdHJ1ZSxcbiAgICAgIGFuaW1hdGVXYWl0aW5nVGlwOiB0aGlzLnN0YXRlLmNvbmZpZy53YWl0aW5nXG4gICAgfSk7XG5cbiAgICB2YXIgd2FpdGluZ0xvbmdJY29uID0gY3goe1xuICAgICAgbGluZTogdHJ1ZSxcbiAgICAgIGxvbmc6IHRydWUsXG4gICAgICBhbmltYXRlV2FpdGluZ0xvbmc6IHRoaXMuc3RhdGUuY29uZmlnLndhaXRpbmdcbiAgICB9KTtcblxuICAgIC8vIHN1Y2Nlc3NcbiAgICAvLyBcbiAgICB2YXIgc3VjY2Vzc0ljb24gPSBjeCh7XG4gICAgICBpY29uOiB0cnVlLFxuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIGFuaW1hdGU6IHRoaXMuc3RhdGUuY29uZmlnLnN1Y2Nlc3NcbiAgICB9KTtcblxuICAgIHZhciBzdWNjZXNzVGlwSWNvbiA9IGN4KHtcbiAgICAgIGxpbmU6IHRydWUsXG4gICAgICB0aXA6IHRydWUsXG4gICAgICBhbmltYXRlU3VjY2Vzc1RpcDogdGhpcy5zdGF0ZS5jb25maWcuc3VjY2Vzc1xuICAgIH0pO1xuXG4gICAgdmFyIHN1Y2Nlc3NMb25nSWNvbiA9IGN4KHtcbiAgICAgIGxpbmU6IHRydWUsXG4gICAgICBsb25nOiB0cnVlLFxuICAgICAgYW5pbWF0ZVN1Y2Nlc3NMb25nOiB0aGlzLnN0YXRlLmNvbmZpZy5zdWNjZXNzXG4gICAgfSk7XG5cbiAgICB2YXIgc3VjY2Vzc1N0eWxlcyA9IHtcbiAgICAgIGRpc3BsYXk6IHRoaXMuc3RhdGUuY29uZmlnLnN1Y2Nlc3MgPyAnYmxvY2snIDogJ25vbmUnXG4gICAgfTtcblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdmFyIGJ1dHRvbnMgPSB0aGlzLnN0YXRlLmNvbmZpZy5idXR0b25zICYmIChcbiAgICAgICAgdGhpcy5zdGF0ZS5jb25maWcuYnV0dG9ucy5tYXAoIGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICB2YXIgdHlwZXMgPSB7XG4gICAgICAgICAgICBjYW5jZWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiYVwiLCB7a2V5OiBcImNhbmNlbFwiLCBjbGFzc05hbWU6IFwiYnV0dG9uIGNhbmNlbFwiLCBvbkNsaWNrOiAgX3RoaXMuY2xvc2V9LCAgb2JqLnRleHQpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBidXR0b246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiYVwiLCB7a2V5OiBcImJ1dHRvblwiLCBjbGFzc05hbWU6IFwiYnV0dG9uXCIsIG9uQ2xpY2s6ICBfdGhpcy5jbG9zZS5iaW5kKCBfdGhpcywgb2JqLmNhbGxiYWNrKSB9LCAgb2JqLnRleHQpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImFcIiwge2tleTogXCJsaW5rXCIsIGNsYXNzTmFtZTogXCJidXR0b25cIiwgb25DbGljazogIF90aGlzLmNsb3NlLCBocmVmOiAgb2JqLmxpbmt9LCAgb2JqLnRleHQpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgcmV0dXJuICh0eXBlc1tvYmoudHlwZV0gfHwgdHlwZXMuYnV0dG9uKSgpO1xuICAgICAgICB9IClcbiAgICAgICk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInN3ZWV0LW92ZXJsYXlcIiwgc3R5bGU6IHN0eWxlcyB9KSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogY2xhc3Nlcywgc3R5bGU6IHN0eWxlcyB9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IGVycm9ySWNvbiwgc3R5bGU6IGVycm9yU3R5bGVzIH0sIFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJ4LW1hcmtcIn0sIFxuICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcImxpbmUgbGVmdFwifSksIFxuICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcImxpbmUgcmlnaHRcIn0pXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSwgXG5cbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IHdhcm5pbmdJY29uLCBzdHlsZTogd2FybmluZ1N0eWxlcyB9LCBcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IHdhcm5pbmdCb2R5IH0pLCBcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IHdhcm5pbmdEb3QgfSlcbiAgICAgICAgICApLCBcblxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogc3VjY2Vzc0ljb24sIHN0eWxlOiBzdWNjZXNzU3R5bGVzIH0sIFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogc3VjY2Vzc1RpcEljb24gfSksIFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogc3VjY2Vzc0xvbmdJY29uIH0pLCBcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJwbGFjZWhvbGRlclwifSksIFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImZpeFwifSlcbiAgICAgICAgICApLCBcblxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogd2FpdGluZ0ljb24sIHN0eWxlOiB3YWl0aW5nU3R5bGVzIH0sIFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInBsYWNlaG9sZGVyXCJ9KVxuICAgICAgICAgICksIFxuXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImgyXCIsIG51bGwsICB0aGlzLnN0YXRlLmNvbmZpZy5oZWFkZXIpLCBcblxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJwXCIsIG51bGwsICB0aGlzLnN0YXRlLmNvbmZpZy5tZXNzYWdlKSwgXG5cbiAgICAgICAgICBidXR0b25zIFxuICAgICAgICApXG4gICAgICApXG4gICAgICApO1xuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgYWxlcnQ7IiwiaW1wb3J0IHN0b3JlIGZyb20gJy4uL3N0b3Jlcy9ibG9ja3MnO1xuaW1wb3J0IGFjdGlvbnMgZnJvbSAnLi4vYWN0aW9ucy9ibG9ja3MnO1xuXG52YXIgYmxvY2sgPSB7XG4gIGRpc3BsYXlOYW1lOiAnYmxvY2snLFxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygnbW91bnRlZCcpO1xuICAgIHN0b3JlLm9uKCdibG9ja1RvZ2dsZWQnLCB0aGlzLnRvZ2dsZUJsb2NrKTtcbiAgICBzdG9yZS5vbignYmxvY2tWaXNpYmlsaXR5JywgdGhpcy50b2dnbGVWaXNpYmlsaXR5KTtcbiAgfSxcbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygndW5tb3VudGVkJyk7XG4gICAgc3RvcmUub2ZmKCdibG9ja1Zpc2liaWxpdHknLCB0aGlzLnRvZ2dsZVZpc2liaWxpdHkpO1xuICAgIHN0b3JlLm9mZignYmxvY2tUb2dnbGVkJywgdGhpcy50b2dnbGVCbG9jayk7XG4gIH0sXG4gIHRvZ2dsZUJsb2NrOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGJsb2NrcyA9IHN0b3JlLmdldE9wZW4oKTtcblxuICAgIGNvbnNvbGUubG9nKCdibG9jayB0b2dnbGVkJyk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBvcGVuOiBibG9ja3MuaW5kZXhPZih0aGlzLnByb3BzLmNvbmZpZy5uYW1lKSA+IC0xXG4gICAgfSk7XG4gIH0sXG4gIHRvZ2dsZVZpc2liaWxpdHk6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdmlzaWJsZSA9IHN0b3JlLmdldFZpc2libGUoKTtcblxuICAgIGNvbnNvbGUubG9nKCd2aXNpYmlsaXR5IHRvZ2dsZWQnKTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgdmlzaWJsZTogdmlzaWJsZS5pbmRleE9mKHRoaXMucHJvcHMuY29uZmlnLm5hbWUpID4gLTFcbiAgICB9KTtcbiAgfSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGJsb2NrcyA9IHN0b3JlLmdldE9wZW4oKTtcbiAgICB2YXIgdmlzaWJsZSA9IHN0b3JlLmdldFZpc2libGUoKTtcblxuICAgIHJldHVybiB7XG4gICAgICBvcGVuOiBibG9ja3MuaW5kZXhPZih0aGlzLnByb3BzLmNvbmZpZy5uYW1lKSA+IC0xLFxuICAgICAgdmlzaWJsZTogdmlzaWJsZS5pbmRleE9mKHRoaXMucHJvcHMuY29uZmlnLm5hbWUpID4gLTFcbiAgICB9O1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG4gICAgdmFyIGl0ZW0gPSB0aGlzLnByb3BzLmNvbmZpZy5pdGVtO1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgY2hpbGRyZW4gPSBbXTtcblxuICAgIHZhciBsb29wID0gYWRhcHQuY29tcG9uZW50cy5sb29wO1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB2YXIgZHluYW1pY0l0ZW0gPSBhZGFwdC5jb21wb25lbnRzLml0ZW07XG5cbiAgICB2YXIgaXRlbXMgPSBpdGVtLml0ZW1zO1xuXG4gICAgY2hpbGRyZW4gPSBsb29wKFxuICAgICAge1xuICAgICAgICBpdGVtczogaXRlbXMsXG4gICAgICAgIGNvbnRyb2xsZXI6IGNvbmZpZy5jb250cm9sbGVyLFxuICAgICAgICB2YWx1ZXM6IGNvbmZpZy52YWx1ZXMsXG4gICAgICAgIG9ic2VydmU6IGNvbmZpZy5vYnNlcnZlLFxuICAgICAgICBuYW1lVHJhaWw6IGNvbmZpZy5uYW1lVHJhaWwsXG4gICAgICAgIG1vZGVsOiBjb25maWcubW9kZWwsXG4gICAgICAgIGFkYXB0OiBfdGhpcy5wcm9wcy5hZGFwdFxuICAgICAgfVxuICAgICk7XG5cbiAgICBpZiggIXRoaXMuc3RhdGUudmlzaWJsZSApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBjbGFzc2VzID0gY3goe1xuICAgICAgYmxvY2s6IHRydWUsXG4gICAgICAnYmxvY2stLW9wZW4nOiB0aGlzLnN0YXRlLm9wZW5cbiAgICB9KTtcblxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IGNsYXNzZXMgfSwgXG4gICAgICAgIGNoaWxkcmVuIFxuICAgICAgKVxuICAgICk7XG4gIH1cbn07XG5cbmFkYXB0LmNvbXBvbmVudCgnYmxvY2snLCBibG9jayk7IiwidmFyIGJ1dHRvbiA9IGFkYXB0LmNvbXBvbmVudCgnYnV0dG9uJywge1xuICBkaXNwbGF5TmFtZTogJ2J1dHRvbicsXG4gIHN0YXRpY3M6IHtcbiAgICBkZWZhdWx0TW9kZWxWYWx1ZTogZmFsc2VcbiAgfSxcbiAgaGFuZGxlQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICB0aGlzLnByb3BzLmNvbmZpZy5tb2RlbFsgdGhpcy5wcm9wcy5jb25maWcubmFtZSBdLnZhbHVlID0gdHJ1ZTtcbiAgICB0aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuZGlnZXN0KCk7XG4gICAgdGhpcy5wcm9wcy5jb25maWcubW9kZWxbIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgXS52YWx1ZSA9IGZhbHNlO1xuICAgIHRoaXMucHJvcHMuYWRhcHQub2JzZXJ2ZS5kaWdlc3QoKTtcblxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICB9LFxuICBzZXRPYnNlcnZlcnM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgdmFyIG9ic2VydmVycyA9IGNvbmZpZy5vYnNlcnZlW2NvbmZpZy5uYW1lVHJhaWwgKyBjb25maWcubmFtZV07XG5cbiAgICBmb3IoIHZhciBpIGluIG9ic2VydmVycykge1xuICAgICAgb2JzZXJ2ZXJzW2ldLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50LCBpbmRleCApIHtcbiAgICAgICAgdGhhdC5zdGF0ZS5saXN0ZW5lcnMucHVzaChcbiAgICAgICAgICB0aGF0LnByb3BzLmFkYXB0Lm9ic2VydmUuYWRkTGlzdGVuZXIoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiBjb25maWcubW9kZWxbY29uZmlnLm5hbWVdW2ldIHx8IGNvbmZpZy5pdGVtW2ldO1xuICAgICAgICAgIH0sIGVsZW1lbnQgKVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCApIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbW9kZWw6IGNvbmZpZy5tb2RlbFtjb25maWcubmFtZV0udmFsdWUsXG4gICAgICBpdGVtOiBjb25maWcuaXRlbSxcbiAgICAgIG5hbWU6IGNvbmZpZy5uYW1lLFxuICAgICAgbGlzdGVuZXJzOiBbXVxuICAgIH07XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICB2YXIgbW9kZWwgPSBjb25maWcubW9kZWxbY29uZmlnLm5hbWVdO1xuXG4gICAgdmFyIGV4cHJlc3Npb25WYWx1ZTtcblxuICAgIGlmKCBjb25maWcub2JzZXJ2ZVtjb25maWcubmFtZVRyYWlsICsgY29uZmlnLm5hbWVdICkge1xuICAgICAgdGhpcy5zZXRPYnNlcnZlcnMoKTtcbiAgICB9XG5cbiAgICB0aGlzLnN0YXRlLmxpc3RlbmVycy5wdXNoKFxuICAgICAgdGhpcy5wcm9wcy5hZGFwdC5vYnNlcnZlLmFkZExpc3RlbmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5vYnNlcnZlW2NvbmZpZy5uYW1lVHJhaWwgKyBjb25maWcubmFtZV07XG4gICAgICB9LCBmdW5jdGlvbiggbmV3VmFsICkge1xuICAgICAgICB0aGF0LnNldE9ic2VydmVycygpO1xuICAgICAgfSApXG4gICAgKTtcblxuICAgIHRoaXMuc3RhdGUubGlzdGVuZXJzLnB1c2goXG4gICAgICB0aGlzLnByb3BzLmFkYXB0Lm9ic2VydmUuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gY29uZmlnLml0ZW0udGV4dDtcbiAgICAgIH0sIGZ1bmN0aW9uKCBuZXdWYWwgKSB7XG4gICAgICAgIHRoYXQuZm9yY2VVcGRhdGUoKTtcbiAgICAgIH0gKVxuICAgICk7XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoICkge1xuICAgIHRoaXMuc3RhdGUubGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICBsaXN0ZW5lcigpO1xuICAgIH0pO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCApIHtcbiAgICB2YXJcbiAgICAgIG1vZGVsID0gdGhpcy5wcm9wcy5jb25maWcubW9kZWxbIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgXS52YWx1ZSxcbiAgICAgIGl0ZW0gPSB0aGlzLnByb3BzLmNvbmZpZy5pdGVtLFxuICAgICAgY29udHJvbGxlciA9IHRoaXMucHJvcHMuY29uZmlnLmNvbnRyb2xsZXJbIHRoaXMucHJvcHMuY29uZmlnLm5hbWUgXTtcblxuICAgIHZhciBsYWJlbCA9IGFkYXB0LmNvbXBvbmVudCgnbGFiZWwnKTtcblxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6ICAnZmllbGQgZmllbGRfX2J1dHRvbiAnICsgKCB0aGlzLnByb3BzLmNvbmZpZy5pdGVtLmNsYXNzTmFtZSB8fCAnJykgfSwgXG4gICAgICAgIFxuICAgICAgICAgIHR5cGVvZiBpdGVtLmxhYmVsID09PSAndW5kZWZpbmVkJyA/ICcnIDpcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KGFkYXB0LmNvbXBvbmVudHMubGFiZWwsIHtjb25maWc6ICB7IGl0ZW06IGl0ZW19LCBhZGFwdDogIHRoaXMucHJvcHMuYWRhcHR9KSwgXG4gICAgICAgICAgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJmaWVsZF9fYnV0dG9uLS1jb250YWluZXJcIn0sIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge29uQ2xpY2s6ICB0aGlzLmhhbmRsZUNsaWNrfSwgXG4gICAgICAgICAgICAgaXRlbS50ZXh0XG4gICAgICAgICAgKSwgXG4gICAgICAgICAgXG4gICAgICAgICAgICB0eXBlb2YgaXRlbS5kZXNjID09PSAndW5kZWZpbmVkJyA/ICcnIDpcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoYWRhcHQuY29tcG9uZW50cy5kZXNjcmlwdGlvbiwge2NvbmZpZzogIHsgaXRlbTogaXRlbX0sIGFkYXB0OiAgdGhpcy5wcm9wcy5hZGFwdH0pXG4gICAgICAgICAgICBcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5leHBvcnQgeyBidXR0b24gYXMgZGVmYXVsdCB9OyIsInZhciBidXR0b25Db250YWluZXIgPSB7XG4gIGRpc3BsYXlOYW1lOiAnYnV0dG9uQ29udGFpbmVyJyxcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuICAgIHZhciBpdGVtID0gdGhpcy5wcm9wcy5jb25maWcuaXRlbTtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGNoaWxkcmVuID0gW107XG5cbiAgICB2YXIgbG9vcCA9IGFkYXB0LmNvbXBvbmVudHMubG9vcDtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIGR5bmFtaWNJdGVtID0gYWRhcHQuY29tcG9uZW50cy5pdGVtO1xuXG4gICAgdmFyIGl0ZW1zID0gaXRlbS5pdGVtcztcblxuICAgIGNoaWxkcmVuID0gbG9vcChcbiAgICAgIHtcbiAgICAgICAgaXRlbXM6IGl0ZW1zLFxuICAgICAgICBjb250cm9sbGVyOiBjb25maWcuY29udHJvbGxlcixcbiAgICAgICAgdmFsdWVzOiBjb25maWcudmFsdWVzLFxuICAgICAgICBvYnNlcnZlOiBjb25maWcub2JzZXJ2ZSxcbiAgICAgICAgbmFtZVRyYWlsOiBjb25maWcubmFtZVRyYWlsLFxuICAgICAgICBtb2RlbDogY29uZmlnLm1vZGVsLFxuICAgICAgICBhZGFwdDogX3RoaXMucHJvcHMuYWRhcHRcbiAgICAgIH1cbiAgICApO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJidXR0b24tY29udGFpbmVyXCJ9LCBcbiAgICAgICAgY2hpbGRyZW4gXG4gICAgICApXG4gICAgKTtcbiAgfVxufTtcblxuYWRhcHQuY29tcG9uZW50KCdidXR0b25Db250YWluZXInLCBidXR0b25Db250YWluZXIpOyIsInZhciBjaGFydCA9IHtcbiAgICBkcmF3Q2hhcnQgKCkge1xuICAgICAgICB2YXIgY2hhcnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNoYXJ0X19yZW5kZXInKVswXTtcbiAgICAgICAgY29uc29sZS5sb2coY2hhcnRFbGVtZW50KTtcblxuICAgICAgICB2YXIgZGF0YSA9IGdvb2dsZS52aXN1YWxpemF0aW9uLmFycmF5VG9EYXRhVGFibGUoW1xuICAgICAgICAgICAgWydQcm9jZXNzIE5hbWUnLCAnUGFydHMgQXZhaWwgU2hpcG1lbnQnLCAnUGxhbm5lZCBQcm9kdWN0aW9uIFBlciBXZWVrJywgJ0pMUiBEZW1hbmQnXSxcbiAgICAgICAgICAgIFsnVGVzdCcsIDAsIDAsIDBdLFxuICAgICAgICAgICAgWydUZXN0JywgMCwgMCwgMF0sXG4gICAgICAgICAgICBbJ1Rlc3QnLCAwLCAwLCAwXVxuICAgICAgICBdKTtcblxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHNlcmllc1R5cGU6IFwiYmFyc1wiLFxuICAgICAgICAgICAgc2VyaWVzOiB7MDoge3R5cGU6IFwibGluZVwifSwgMjoge3R5cGU6IFwic3RlcHBlZEFyZWFcIn19LFxuICAgICAgICAgICAgYmFyOiB7Z3JvdXBXaWR0aDogXCIyMCVcIn0sXG4gICAgICAgICAgICB3aWR0aDogNTAwLFxuICAgICAgICAgICAgY2hhcnRBcmVhOiB7XG4gICAgICAgICAgICAgICAgbGVmdDogXCIzJVwiLFxuICAgICAgICAgICAgICAgIHRvcDogXCIzJVwiLFxuICAgICAgICAgICAgICAgIGhlaWdodDogXCI5NCVcIixcbiAgICAgICAgICAgICAgICB3aWR0aDogXCI5NCVcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxlZ2VuZDoge3Bvc2l0aW9uOiAnbm9uZSd9LFxuICAgICAgICAgICAgY29sb3JzOiBbJyNGMjkxMDAnLCAnIzNBNUJDQicsICcjQ0EyODAwJ11cbiAgICAgICAgfTtcblxuICAgICAgICAvLyB2YXIgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ29tYm9DaGFydChjaGFydEVsZW1lbnQpO1xuICAgICAgICAvLyBjaGFydC5kcmF3KGRhdGEsIG9wdGlvbnMpO1xuICAgIH0sXG4gICAgY29tcG9uZW50RGlkTW91bnQgKCkge1xuICAgICAgICB0aGlzLmRyYXdDaGFydCgpO1xuICAgIH0sXG4gICAgcmVuZGVyICgpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjaGFydFwifSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNoYXJ0X19yZW5kZXJcIiwgc3R5bGU6ICB7IHdpZHRoOiAnMTAwJSd9LCByZWY6IFwiY2hhcnRcIn0pXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufTtcblxuYWRhcHQuY29tcG9uZW50KCdjaGFydCcsIGNoYXJ0KTtcblxudmFyIGluamVjdCA9IFsnJHNjb3BlJ107IiwidmFyIGJsb2NraGVhZGVyID0ge1xuICBkaXNwbGF5TmFtZTogJ2Jsb2NraGVhZGVyJyxcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogICdibG9ja2hlYWRlciAnICsgKCB0aGlzLnByb3BzLmNvbmZpZy5pdGVtLmNsYXNzTmFtZSB8fCAnJykgfVxuICAgICAgKVxuICAgICk7XG4gIH1cbn07XG5cbmFkYXB0LmNvbXBvbmVudCgnYmxvY2toZWFkZXInLCBibG9ja2hlYWRlcik7IiwidmFyIGFwcEFjdGlvbnMgPSByZXF1aXJlKCcuLi9hY3Rpb25zL2FwcCcpO1xuXG5mdW5jdGlvbiBmaW5kQ2xvc2VzdFBhcmVudChldmVudCwgY2xhc3NOYW1lKSB7XG4gICAgdmFyIHBhcmVudCA9IGV2ZW50LnBhcmVudE5vZGU7XG4gICAgd2hpbGUgKHBhcmVudCE9ZG9jdW1lbnQuYm9keSAmJiBwYXJlbnQgIT0gbnVsbCkge1xuICAgICAgaWYgKChwYXJlbnQpICYmIHBhcmVudC5jbGFzc05hbWUgJiYgcGFyZW50LmNsYXNzTmFtZS5pbmRleE9mKGNsYXNzTmFtZSkgIT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIHBhcmVudDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcmVudCA9IHBhcmVudCA/IHBhcmVudC5wYXJlbnROb2RlIDogbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxudmFyIG92ZXJsYXkgPSB7XG4gIGRpc3BsYXlOYW1lOiAnb3ZlcmxheScsXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICBcdHJldHVybiB7XG4gIFx0XHRvcGVuOiBmYWxzZVxuICBcdH07XG4gIH0sXG4gIG9wZW46IGZ1bmN0aW9uICgpIHtcbiAgXHR0aGlzLnNldFN0YXRlKHtcbiAgXHRcdG9wZW46IHRydWVcbiAgXHR9KTtcbiAgfSxcbiAgY2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgXHR0aGlzLnNldFN0YXRlKHtcbiAgXHRcdG9wZW46IGZhbHNlXG4gIFx0fSk7XG4gIH0sXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gIFx0dmFyIG5vZGUgPSB0aGlzLnJlZnMub3ZlcmxheS5nZXRET01Ob2RlKCk7XG5cbiAgXHRub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGZ1bmN0aW9uIChlKXtcbiAgXHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIFx0fSk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICBcdHZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcbiAgXHR2YXIgb3ZlcmxheUNsYXNzZXMgPSBjeCh7XG4gIFx0XHQnb3ZlcmxheV9fYmFja2dyb3VuZCc6IHRydWUsXG4gIFx0XHQnb3ZlcmxheV9fYmFja2dyb3VuZC0tb3Blbic6IHRoaXMuc3RhdGUub3BlblxuICBcdH0pO1xuXG4gIFx0dmFyIGxvb3AgPSBhZGFwdC5jb21wb25lbnRzLmxvb3A7XG4gIFx0dmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICBcdHZhciBpdGVtID0gY29uZmlnLml0ZW07XG5cbiAgXHR2YXIgY2hpbGRyZW4gPSBsb29wKFxuICAgICAge1xuICAgICAgICBpdGVtczogaXRlbS5pdGVtcyxcbiAgICAgICAgY29udHJvbGxlcjogY29uZmlnLmNvbnRyb2xsZXIsXG4gICAgICAgIHZhbHVlczogY29uZmlnLnZhbHVlcyxcbiAgICAgICAgb2JzZXJ2ZTogY29uZmlnLm9ic2VydmUsXG4gICAgICAgIG5hbWVUcmFpbDogY29uZmlnLm5hbWVUcmFpbCxcbiAgICAgICAgbW9kZWw6IGNvbmZpZy5tb2RlbCxcbiAgICAgICAgYWRhcHQ6IHRoaXMucHJvcHMuYWRhcHRcbiAgICAgIH1cbiAgICApO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJmaWVsZCBvdmVybGF5XCJ9LCBcbiAgICAgIFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm92ZXJsYXlfX29wZW5cIiwgb25DbGljazogIHRoaXMub3Blbn0sIFxuICAgICAgXHRcdCBjb25maWcuaXRlbS50ZXh0XG4gICAgICBcdCksIFxuXG4gICAgICBcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogb3ZlcmxheUNsYXNzZXMgfSwgXG4gICAgICBcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm92ZXJsYXlfX2NvbnRhaW5lclwifSwgXG4gICAgICBcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwib3ZlcmxheV9fY2hpbGRyZW5cIiwgcmVmOiBcIm92ZXJsYXlcIn0sIFxuICAgICAgXHRcdFx0XHRjaGlsZHJlbiBcbiAgICAgIFx0XHRcdCksIFxuICAgICAgXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm92ZXJsYXlfX2J1dHRvbnNcIn0sIFxuICAgICAgXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiYnV0dG9uXCIsIG9uQ2xpY2s6ICB0aGlzLmNsb3NlfSwgXG4gICAgICBcdFx0XHRcdFx0XCJEb25lXCJcbiAgICAgIFx0XHRcdFx0KVxuICAgICAgXHRcdFx0KVxuICAgICAgXHRcdClcbiAgICAgIFx0KVxuICAgICAgKVxuICAgICk7XG4gIH1cbn07XG5cbmFkYXB0LmNvbXBvbmVudCgnb3ZlcmxheScsIG92ZXJsYXkpOyIsInZhciBVdGlscyA9IHtcbiAgICAvKipcbiAgICAgKiBDb3B5IHdpdGhvdXQgYmluZGluZyBieSByZWZlcmVuY2VcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R8QXJyYXl9IHNvdXJjZSAgICAgIFNvdXJjZSB0byBjb3B5IGZyb21cbiAgICAgKiBAcGFyYW0gIHtPYmplY3R8QXJyYXl9IGRlc3RpbmF0aW9uIFRhcmdldFxuICAgICAqIEByZXR1cm4ge09iamVjdHxBcnJheX0gICAgICAgICAgICAgQ29waWVkIG9iamVjdC9hcnJheVxuICAgICAqL1xuICAgIGNvcHk6IGZ1bmN0aW9uKCBzb3VyY2UsIGRlc3RpbmF0aW9uICkge1xuICAgICAgICBpZighZGVzdGluYXRpb24pIHtcbiAgICAgICAgICAgIGlmKCB0aGlzLmlzQXJyYXkoc291cmNlKSApIHtcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbiA9IFtdO1xuICAgICAgICAgICAgfSBlbHNlIGlmKCB0aGlzLmlzT2JqZWN0KHNvdXJjZSkgKSB7XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24gPSB7fTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCB0eXBlb2Ygc291cmNlICsgJyBpcyBub3Qgc3VwcG9ydGVkIGJ5IFV0aWxzLmNvcHknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciggdmFyIGkgaW4gc291cmNlICkge1xuICAgICAgICAgICAgZGVzdGluYXRpb25baV0gPSBzb3VyY2VbaV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGVzdGluYXRpb247XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBGaW5kIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdHdvIGFycmF5c1xuICAgICAqIEBwYXJhbSAge0FycmF5fSBhMSBOZXcgQXJyYXlcbiAgICAgKiBAcGFyYW0gIHtBcnJheX0gYTIgUHJldmlvdXMgQXJyYXlcbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gICAgQXJyYXkgb2Ygb2JqZWN0cyBvZiBjaGFuZ2VzIGZyb20gcHJldiA+IG5ld1xuICAgICAqL1xuICAgIGFycmF5RGlmZjogZnVuY3Rpb24oIGExLCBhMiApIHtcbiAgICAgICAgdmFyIGRpZmZlcmVuY2VzID0gW107XG5cbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBhMS5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIGlmKCBhMi5pbmRleE9mKCBhMVtpXSApID09PSAtMSApIHtcbiAgICAgICAgICAgICAgICBkaWZmZXJlbmNlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnYWRkZWQnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYTFbaV1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IGEyLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgaWYoIGExLmluZGV4T2YoIGEyW2ldICkgPT09IC0xICkge1xuICAgICAgICAgICAgICAgIGRpZmZlcmVuY2VzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdyZW1vdmVkJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGEyW2ldXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGlmZmVyZW5jZXM7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDb21wdXRlIGlmIHR3byBpdGVtcyBhcmUgZXF1YWxzXG4gICAgICogQHBhcmFtICB7Kn0gbzEgQW55IHR5cGUgb2YgZGF0YSB0byBjb21wYXJlXG4gICAgICogQHBhcmFtICB7Kn0gbzIgQW55IHR5cGUgb2YgZGF0YSB0byBjb21wYXJlXG4gICAgICogQHJldHVybiB7Ym9vbH0gV2hldGhlciBvciBub3QgdGhleSdyZSBlcXVhbFxuICAgICAqL1xuICAgIGVxdWFsczogZnVuY3Rpb24oIG8xLCBvMiApIHtcbiAgICAgICAgaWYgKG8xID09PSBvMikgcmV0dXJuIHRydWU7XG4gICAgICAgIGlmIChvMSA9PT0gbnVsbCB8fCBvMiA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAobzEgIT09IG8xICYmIG8yICE9PSBvMikgcmV0dXJuIHRydWU7XG4gICAgICAgIHZhciB0MSA9IHR5cGVvZiBvMSwgdDIgPSB0eXBlb2YgbzIsIGxlbmd0aCwga2V5LCBrZXlTZXQ7XG4gICAgICAgIGlmICh0MSA9PSB0Mikge1xuICAgICAgICAgICAgaWYgKHQxID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNBcnJheShvMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzQXJyYXkobzIpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGlmICgobGVuZ3RoID0gbzEubGVuZ3RoKSA9PSBvMi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcihrZXk9MDsga2V5PGxlbmd0aDsga2V5KyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZXF1YWxzKG8xW2tleV0sIG8yW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0RhdGUobzEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc0RhdGUobzIpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVxdWFscyhvMS5nZXRUaW1lKCksIG8yLmdldFRpbWUoKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzUmVnRXhwKG8xKSAmJiB0aGlzLmlzUmVnRXhwKG8yKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbzEudG9TdHJpbmcoKSA9PSBvMi50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGtleVNldCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBmb3Ioa2V5IGluIG8xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoa2V5LmNoYXJBdCgwKSA9PT0gJyQnIHx8IHRoaXMuaXNGdW5jdGlvbihvMVtrZXldKSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZXF1YWxzKG8xW2tleV0sIG8yW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXlTZXRba2V5XSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yKGtleSBpbiBvMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFrZXlTZXQuaGFzT3duUHJvcGVydHkoa2V5KSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleS5jaGFyQXQoMCkgIT09ICckJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8yW2tleV0gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICF0aGlzLmlzRnVuY3Rpb24obzJba2V5XSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ29udmVydCBzdHJpbmdzIGZyb20gaXRlbTpkZXNjIHRvIGl0ZW1EZXNjXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBzdHJpbmcgU3RyaW5nIHRvIGJlIGZvcm1hdHRlZFxuICAgICAqIEByZXR1cm4ge1N0cmluZ30gICAgICAgIEZvcm1hdHRlZCBzdHJpbmdcbiAgICAgKi9cbiAgICBjb252ZXJ0VG9DYW1lbENhc2U6IGZ1bmN0aW9uKCBzdHJpbmcgKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvOihbYS16XSkvZywgZnVuY3Rpb24gKGcpIHsgcmV0dXJuIGdbMV0udG9VcHBlckNhc2UoKTsgfSlcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEV4dGVuZCBhbiBvYmplY3RcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IHNvdXJjZSAgICAgIFNvdXJjZSBvYmplY3QgdG8gZXh0ZW5kXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBkZXN0aW5hdGlvbiBUYXJnZXQgb2JqZWN0IHRvIGV4dGVuZCBpbnRvXG4gICAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgICBFeHRlbmRlZCBvYmplY3RcbiAgICAgKi9cbiAgICBleHRlbmQ6IGZ1bmN0aW9uKCBzb3VyY2UsIGRlc3RpbmF0aW9uICkge1xuICAgICAgICBmb3IoIHZhciBpIGluIHNvdXJjZSApIHtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uW2ldID0gc291cmNlW2ldO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRlc3RpbmF0aW9uO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogRmluZCBjbG9zZXN0IHBhcmVudCBmcm9tIERPTSBldmVudFxuICAgICAqIEBwYXJhbSAge09iamVjdH0gZXZlbnQgICAgIERPTSBldmVudCBvYmpcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IGNsYXNzTmFtZSBDbGFzcyBuYW1lIHRvIGxvb2sgZm9yXG4gICAgICogQHJldHVybiB7T2JqZWN0fE51bGx9ICAgICAgUmVzdWx0IG9mIHNlYXJjaFxuICAgICAqL1xuICAgIGZpbmRDbG9zZXN0UGFyZW50OiBmdW5jdGlvbihldmVudCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSBldmVudC5wYXJlbnROb2RlO1xuICAgICAgICB3aGlsZSAocGFyZW50IT1kb2N1bWVudC5ib2R5ICYmIHBhcmVudCAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoKHBhcmVudCkgJiYgcGFyZW50LmNsYXNzTmFtZSAmJiBwYXJlbnQuY2xhc3NOYW1lLmluZGV4T2YoY2xhc3NOYW1lKSAhPSAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJlbnQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudCA/IHBhcmVudC5wYXJlbnROb2RlIDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIGNoZWNrU3RhdGU6IGZ1bmN0aW9uKCBzdGF0ZSwgY3VycmVudFN0YXRlICkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIGZ1bmN0aW9uIGNvbXBhcmVTdGF0ZSggc3RhdGVOYW1lLCBjdXJyZW50U3RhdGUgKSB7XG4gICAgICAgICAgICB2YXIgc2hvdyA9IGZhbHNlO1xuICAgICAgICAgICAgaWYoIHN0YXRlTmFtZSApIHtcbiAgICAgICAgICAgICAgICBpZiggX3RoaXMuaXNTdHJpbmcoIHN0YXRlTmFtZSApICkge1xuICAgICAgICAgICAgICAgICAgICBzaG93ID0gc3RhdGVOYW1lID09PSBjdXJyZW50U3RhdGU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCBfdGhpcy5pc0FycmF5KCBzdGF0ZU5hbWUgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gc3RhdGVOYW1lLmluZGV4T2YoIGN1cnJlbnRTdGF0ZSApO1xuXG4gICAgICAgICAgICAgICAgICAgIHNob3cgPSBpbmRleCA+IC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzaG93O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIHN0YXRlICkge1xuICAgICAgICAgICAgdmFyIHNob3cgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmKCB0aGlzLmlzQXJyYXkoIGN1cnJlbnRTdGF0ZSApICkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRTdGF0ZS5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbWVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGNvbXBhcmVTdGF0ZSggc3RhdGUsIGVsZW1lbnQgKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiggISFyZXN1bHQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hvdyA9IGNvbXBhcmVTdGF0ZSggc3RhdGUsIGN1cnJlbnRTdGF0ZSApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc2hvdztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn07XG5cbi8qKlxuICogT2JqZWN0IFR5cGVzXG4gKiBAdHlwZSB7QXJyYXl9XG4gKi9cbnZhciBvYmpUeXBlcyA9IFtcbiAgICAnQXJyYXknLCAnT2JqZWN0JywgJ1N0cmluZycsICdEYXRlJywgJ1JlZ0V4cCcsXG4gICAgJ0Z1bmN0aW9uJywgJ0Jvb2xlYW4nLCAnTnVtYmVyJywgJ051bGwnLCAnVW5kZWZpbmVkJ1xuXTtcblxuLy8gQ3JlYXRlIGluZGl2aWR1YWwgZnVuY3Rpb25zIG9uIHRvcCBvZiBvdXIgVXRpbHMgb2JqZWN0IGZvciBlYWNoIG9ialR5cGVcbmZvciAodmFyIGkgPSBvYmpUeXBlcy5sZW5ndGg7IGktLTspIHtcbiAgICBVdGlsc1snaXMnICsgb2JqVHlwZXNbaV1dID0gKGZ1bmN0aW9uIChvYmplY3RUeXBlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZWxlbSkge1xuICAgICAgICAgICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoZWxlbSkuc2xpY2UoOCwgLTEpID09PSBvYmplY3RUeXBlO1xuICAgICAgICB9O1xuICAgIH0pKG9ialR5cGVzW2ldKTtcbn1cblxudmFyIEFkYXB0VGFibGUgPSB7XG4gICAgZGlzcGxheU5hbWU6ICdBZGFwdFRhYmxlJyxcbiAgICBleHRlbmQ6IFthZGFwdC5taXhpbnMuYXJyYXlPYmplY3RdLFxuICAgIHJlbmRlcjogZnVuY3Rpb24oICkge1xuICAgICAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuY29uZmlnLml0ZW07XG4gICAgICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICAgICAgdmFyIG9wZW5JRCA9IHRoaXMuc3RhdGUub3BlbiB8fCAtMTtcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XG4gICAgICAgIHZhciBtb2RlbCA9IHRoaXMuc3RhdGUubW9kZWw7XG5cbiAgICAgICAgdmFyIHNpbXBsZSA9ICEhY29uZmlnLml0ZW0udHlwZS5zcGxpdCgnOicpWzFdO1xuXG4gICAgICAgIHZhciBoZWFkZXIgPSBbXTtcblxuICAgICAgICB2YXIgcGFydE5hbWUgPSAnJztcbiAgICAgICAgdmFyIGNvbmZpZ0l0ZW1zID0gdGhpcy5wcm9wcy5hZGFwdC5tb2RlbC5pdGVtcztcbiAgICAgICAgdmFyIHN0dWR5ID0ge1xuICAgICAgICAgICAgbXVsdGk6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3VmZml4ZXMgPSBbXTtcblxuICAgICAgICAgICAgICAgIGlmIChjb25maWdJdGVtcy5zdWZmaXgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnSXRlbXMuc3VmZml4LnZhbHVlLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWZmaXhlcy5wdXNoKHZhbHVlLnN1ZmZpeC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHBhcnROYW1lID0gW2NvbmZpZ0l0ZW1zLnByZWZpeC52YWx1ZSwgY29uZmlnSXRlbXMuYmFzZS52YWx1ZSwgc3VmZml4ZXMuam9pbignJyldLmpvaW4oJyAnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBwYXJ0TmFtZSA9IFtjb25maWdJdGVtcy5wcmVmaXgudmFsdWUsIGNvbmZpZ0l0ZW1zLmJhc2UudmFsdWUsIHN1ZmZpeGVzLmpvaW4oJycpXS5qb2luKCcgJyk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcGFydE5hbWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29tcGxleDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25maWdJdGVtcy5wYXJ0TmFtZS52YWx1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaW5nbGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW2NvbmZpZ0l0ZW1zLnByZWZpeC52YWx1ZSwgY29uZmlnSXRlbXMuYmFzZS52YWx1ZSwgY29uZmlnSXRlbXMuc3VmZml4LnZhbHVlXS5qb2luKCcgJyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbXVsdGlBbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW2NvbmZpZ0l0ZW1zLnByZWZpeC52YWx1ZSwgY29uZmlnSXRlbXMuYmFzZS52YWx1ZSwgJyhBbGwpJ10uam9pbignICcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHBhcnROYW1lID0gKHN0dWR5W2NvbmZpZ0l0ZW1zLnN0dWR5U3VwcGxpZXJGb3IudmFsdWVdIHx8IHN0dWR5WydzaW5nbGUnXSkoKTtcblxuICAgICAgICBmb3IoIHZhciBpIGluIGl0ZW0ubW9kZWwgKSB7XG4gICAgICAgICAgICBoZWFkZXIucHVzaChcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwidGhcIiwge2tleTogaSB9LCBcbiAgICAgICAgICAgaXRlbS5tb2RlbFtpXS5sYWJlbFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdCA9IDA7XG5cbiAgICAgICAgaWYgKG1vZGVsKSB7XG4gICAgICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IG1vZGVsLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IFtdO1xuXG4gICAgICAgICAgICAgICAgaWYoIXNpbXBsZSkge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKCBSZWFjdC5jcmVhdGVFbGVtZW50KFwidGRcIiwge2NsYXNzTmFtZTogXCJpZFwifSwgIGkgKyAyKSApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgICAgICAgICAgICAgIGZvciggdmFyIHIgaW4gaXRlbS5tb2RlbCApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0l0ZW0gPSBVdGlscy5jb3B5KGl0ZW0ubW9kZWxbcl0pO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgbmV3SXRlbS5kZXNjO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgbmV3SXRlbS5sYWJlbDtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbUNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiBjb25maWcubW9kZWxbY29uZmlnLm5hbWVdLnZhbHVlW2ldLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogY29uZmlnLmNvbnRyb2xsZXJbY29uZmlnLm5hbWVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IG5ld0l0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IGNvbmZpZy52YWx1ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlOiBjb25maWcub2JzZXJ2ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVUcmFpbDogY29uZmlnLm5hbWVUcmFpbCArIGNvbmZpZy5uYW1lICsgJy4nXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbnRlbnRzID0gdGhpcy50cmFuc2ZlclByb3BzVG8oUmVhY3QuY3JlYXRlRWxlbWVudChhZGFwdC5jb21wb25lbnRzLml0ZW0sIHtjb25maWc6IGl0ZW1Db25maWcgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwidGRcIiwge2tleTogIHQgKyByfSwgXG4gICAgICAgICAgICAgICAgY29udGVudHMgXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgdCsrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiLCB7Y2xhc3NOYW1lOiBcInRoX19vcHRpb25zXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtvbkNsaWNrOiAgdGhpcy5yZW1vdmUuYmluZCh0aGlzLCBpKSB9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLXRpbWVzIGZhLWZ3XCJ9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIHZhciBSRUdFWF9DVVJMWSA9IC97KFtefV0rKX0vZztcblxuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJ0clwiLCB7a2V5OiBpIH0sIFxuICAgICAgICAgICAgY2hpbGRyZW5cbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogICdlbGVtZW50X190YWJsZSBjbGVhciBuby1zZWxlY3QgJyArICggc2ltcGxlID8gJ2VsZW1lbnRfX3RhYmxlLS1zaW1wbGUnIDogJycpIH0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJ0YWJsZVwiLCB7Y2VsbFBhZGRpbmc6IFwiMFwiLCBjZWxsU3BhY2luZzogXCIwXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInRoZWFkXCIsIG51bGwsIFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInRyXCIsIG51bGwsIFxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgIHNpbXBsZSA/ICcnIDpcbiAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwidGhcIiwge2NsYXNzTmFtZTogXCJpZFwifSwgXCIjXCIpLCBcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBoZWFkZXIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJ0aFwiLCB7Y2xhc3NOYW1lOiBcInRoX19vcHRpb25zXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge29uQ2xpY2s6ICB0aGlzLmFkZH0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS1wbHVzIGZhLWZ3XCJ9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInRib2R5XCIsIG51bGwsIFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInRyXCIsIG51bGwsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiLCB7Y2xhc3NOYW1lOiBcImlkXCJ9LCBcIjFcIiksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiLCBudWxsLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImZpZWxkIGZpZWxkX19pbnB1dFwifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGRfX2lucHV0LS1jb250YWluZXJcIn0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7dmFsdWU6IHBhcnROYW1lLCBkaXNhYmxlZDogXCJkaXNhYmxlZFwifSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiLCBudWxsLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImZpZWxkIGZpZWxkX19pbnB1dFwifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGRfX2lucHV0LS1jb250YWluZXJcIn0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7dmFsdWU6ICB0aGlzLnByb3BzLmFkYXB0Lm1vZGVsLml0ZW1zLnRvdGFsUmVxdWlyZWREZW1hbmQudmFsdWUsIGRpc2FibGVkOiBcImRpc2FibGVkXCJ9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInRkXCIsIG51bGwsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGQgZmllbGRfX2lucHV0XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJmaWVsZF9faW5wdXQtLWNvbnRhaW5lclwifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHt2YWx1ZTogIHRoaXMucHJvcHMuY29uZmlnLm1vZGVsLm5ldEF2YWlsYWJsZVRpbWUudmFsdWUsIGRpc2FibGVkOiBcImRpc2FibGVkXCJ9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInRkXCIsIG51bGwsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGQgZmllbGRfX2lucHV0XCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJmaWVsZF9faW5wdXQtLWNvbnRhaW5lclwifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHt2YWx1ZTogIHRoaXMucHJvcHMuY29uZmlnLm1vZGVsLmFsbG9jYXRpb25QZXJjZW50YWdlLnZhbHVlLCBkaXNhYmxlZDogXCJkaXNhYmxlZFwifSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgaXRlbXNcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59O1xuXG5hZGFwdC5jb21wb25lbnQoJ3NoYXJlZExvYWRpbmdQbGFuJywgQWRhcHRUYWJsZSk7XG4iLCJ2YXIgc2lnbiA9IHtcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FudmFzID0gdGhpcy5yZWZzLmNhbnZhcy5nZXRET01Ob2RlKCk7XG4gICAgdGhpcy5zaWduYXR1cmVQYWQgPSBuZXcgU2lnbmF0dXJlUGFkKGNhbnZhcywge30pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVzaXplQ2FudmFzLCBmYWxzZSk7XG5cbiAgICB0aGlzLnJlc2l6ZUNhbnZhcygpO1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0pO1xuXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpe1xuICAgICAgY29uZmlnLm1vZGVsWyBjb25maWcubmFtZSBdLnZhbHVlID0gX3RoaXMuc2lnbmF0dXJlUGFkLnRvRGF0YVVSTCgpO1xuICAgIH0pO1xuICB9LFxuICBzZXRPYnNlcnZlcnM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgdmFyIG9ic2VydmVycyA9IGNvbmZpZy5vYnNlcnZlW2NvbmZpZy5uYW1lVHJhaWwgKyBjb25maWcubmFtZV07XG5cbiAgICBmb3IoIHZhciBpIGluIG9ic2VydmVycykge1xuICAgICAgb2JzZXJ2ZXJzW2ldLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50LCBpbmRleCApIHtcbiAgICAgICAgdGhhdC5zdGF0ZS5saXN0ZW5lcnMucHVzaChcbiAgICAgICAgICB0aGF0LnByb3BzLmFkYXB0Lm9ic2VydmUuYWRkTGlzdGVuZXIoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiBjb25maWcubW9kZWxbY29uZmlnLm5hbWVdW2ldIHx8IGNvbmZpZy5pdGVtW2ldO1xuICAgICAgICAgIH0sIGVsZW1lbnQgKVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgdmFyIG1vZGVsID0gY29uZmlnLm1vZGVsW2NvbmZpZy5uYW1lXTtcblxuICAgIGlmKCBjb25maWcub2JzZXJ2ZVtjb25maWcubmFtZVRyYWlsICsgY29uZmlnLm5hbWVdICkge1xuICAgICAgdGhpcy5zZXRPYnNlcnZlcnMoKTtcbiAgICB9XG5cbiAgICB0aGlzLnN0YXRlLmxpc3RlbmVycy5wdXNoKFxuICAgICAgdGhpcy5wcm9wcy5hZGFwdC5vYnNlcnZlLmFkZExpc3RlbmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5vYnNlcnZlW2NvbmZpZy5uYW1lVHJhaWwgKyBjb25maWcubmFtZV07XG4gICAgICB9LCBmdW5jdGlvbiggbmV3VmFsICkge1xuICAgICAgICB0aGF0LnNldE9ic2VydmVycygpO1xuICAgICAgfSApXG4gICAgKTtcbiAgfSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiggKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1vZGVsOiBjb25maWcubW9kZWxbY29uZmlnLm5hbWVdLnZhbHVlLFxuICAgICAgaXRlbTogY29uZmlnLml0ZW0sXG4gICAgICBuYW1lOiBjb25maWcubmFtZSxcbiAgICAgIGxpc3RlbmVyczogW11cbiAgICB9O1xuICB9LFxuICBjbGVhckNhbnZhczogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2lnbmF0dXJlUGFkLmNsZWFyKCk7XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVzaXplQ2FudmFzLCBmYWxzZSk7XG4gIH0sXG4gIHJlc2l6ZUNhbnZhczogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW52YXMgPSB0aGlzLnJlZnMuY2FudmFzLmdldERPTU5vZGUoKTtcblxuICAgIHZhciBvbGREYXRhID0gdGhpcy5zaWduYXR1cmVQYWQudG9EYXRhVVJMKCk7XG5cbiAgICBjYW52YXMud2lkdGggPSB3aW5kb3cub3V0ZXJXaWR0aCAvIDIgLSAzMjtcblxuICAgIHRoaXMuc2lnbmF0dXJlUGFkLmZyb21EYXRhVVJMKG9sZERhdGEpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuY29uZmlnLml0ZW07XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJmaWVsZCBzaWduXCIsIHJlZjogXCJjb250YWluZXJcIn0sIFxuICAgICAgICBcbiAgICAgICAgICB0eXBlb2YgaXRlbS5sYWJlbCA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6XG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChhZGFwdC5jb21wb25lbnRzLmxhYmVsLCB7Y29uZmlnOiAgeyBpdGVtOiBpdGVtfSwgYWRhcHQ6ICB0aGlzLnByb3BzLmFkYXB0fSksIFxuICAgICAgICAgIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwic2lnbl9fdGlwXCJ9LCBcbiAgICAgICAgICBcIkVudGVyIHNpZ25hdHVyZSBiZWxvd1wiXG4gICAgICAgICksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwic2lnbl9fY2xlYXJcIiwgb25DbGljazogIHRoaXMuY2xlYXJDYW52YXN9LCBcbiAgICAgICAgICBcIkNsZWFyIFNpZ25hdHVyZVwiLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLXRpbWVzXCJ9KVxuICAgICAgICApLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiLCB7cmVmOiBcImNhbnZhc1wiLCBoZWlnaHQ6IFwiMjAwXCJ9KSwgXG4gICAgICAgIFxuICAgICAgICAgIHR5cGVvZiBpdGVtLmRlc2MgPT09ICd1bmRlZmluZWQnID8gJycgOlxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoYWRhcHQuY29tcG9uZW50cy5kZXNjcmlwdGlvbiwge2NvbmZpZzogIHsgaXRlbTogaXRlbX0sIGFkYXB0OiAgdGhpcy5wcm9wcy5hZGFwdH0pXG4gICAgICAgICAgXG4gICAgICApXG4gICAgKTtcbiAgfVxufTtcblxuYWRhcHQuY29tcG9uZW50KCdzaWduJywgc2lnbik7IiwiaW1wb3J0IHN0b3JlIGZyb20gJy4uL3N0b3Jlcy9ibG9ja3MnO1xuaW1wb3J0IGFjdGlvbnMgZnJvbSAnLi4vYWN0aW9ucy9ibG9ja3MnO1xuXG5mdW5jdGlvbiBmaW5kQ2xvc2VzdFBhcmVudChldmVudCwgY2xhc3NOYW1lKSB7XG4gICAgdmFyIHBhcmVudCA9IGV2ZW50LnBhcmVudE5vZGU7XG4gICAgd2hpbGUgKHBhcmVudCE9ZG9jdW1lbnQuYm9keSAmJiBwYXJlbnQgIT0gbnVsbCkge1xuICAgICAgaWYgKChwYXJlbnQpICYmIHBhcmVudC5jbGFzc05hbWUgJiYgcGFyZW50LmNsYXNzTmFtZS5pbmRleE9mKGNsYXNzTmFtZSkgIT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIHBhcmVudDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcmVudCA9IHBhcmVudCA/IHBhcmVudC5wYXJlbnROb2RlIDogbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxudmFyIHNwcmVhZHNoZWV0ID0ge1xuICBkaXNwbGF5TmFtZTogJ3NwcmVhZHNoZWV0JyxcbiAgZXh0ZW5kOiBbYWRhcHQubWl4aW5zLmFycmF5T2JqZWN0XSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gc2V0IHRoZSBpbml0aWFsIHN0YXRlIHRvIGhhdmUgYWxsIGFjY29yZGlvbnMgY2xvc2VkXG4gICAgLy8gXG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIHRlc3Q6ICdoaScsXG4gICAgICBsb2w6IFtdXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICBvcGVuOiAtMSxcbiAgICAgIHN1YnRpdGxlTGlzdGVuZXJzOiBbXSxcbiAgICAgIG9wZW5CbG9ja3M6IHN0b3JlLmdldE9wZW4oKSxcbiAgICAgIG9wZW5Ecm9wZG93bjogLTEsXG4gICAgICB2aXNpYmxlQmxvY2tzOiBzdG9yZS5nZXRWaXNpYmxlKClcbiAgICB9O1xuICB9LFxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBzdG9yZS5vbignYmxvY2tUb2dnbGVkJywgdGhpcy50b2dnbGVCbG9ja0NhbGxiYWNrKTtcbiAgICBzdG9yZS5vbignYmxvY2tWaXNpYmlsaXR5JywgdGhpcy50b2dnbGVCbG9ja1Zpc2liaWxpdHkpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5oYW5kbGVCb2R5Q2xpY2spO1xuICB9LFxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHN0b3JlLm9mZignYmxvY2tWaXNpYmlsaXR5JywgdGhpcy50b2dnbGVCbG9ja1Zpc2liaWxpdHkpO1xuICAgIHN0b3JlLm9mZignYmxvY2tUb2dnbGVkJywgdGhpcy50b2dnbGVCbG9ja0NhbGxiYWNrKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuaGFuZGxlQm9keUNsaWNrKTtcbiAgfSxcbiAgaGFuZGxlQm9keUNsaWNrOiBmdW5jdGlvbiAoZSkge1xuICAgIGlmKCAhZmluZENsb3Nlc3RQYXJlbnQoZS50YXJnZXQsICdzcHJlYWRzaGVldF9faXRlbS0tcmVtb3ZlJykgKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgb3BlbkRyb3Bkb3duOiAtMVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBkdXBsaWNhdGU6IGZ1bmN0aW9uIChhY2NvcmRpb25JZCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHZhciBuZXdNb2RlbCA9IHt9O1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIGNvbmZpZy5tb2RlbFtjb25maWcubmFtZV0udmFsdWUucHVzaChcbiAgICAgIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoKGNvbmZpZy5tb2RlbFtjb25maWcubmFtZV0udmFsdWVbYWNjb3JkaW9uSWRdKSkpXG4gICAgICApO1xuXG4gICAgdGhpcy5wcm9wcy5hZGFwdC5vYnNlcnZlLmRpZ2VzdCgpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgb3BlbkRyb3Bkb3duOiAtMVxuICAgIH0pXG4gIH0sXG4gIHRvZ2dsZUJsb2NrQ2FsbGJhY2s6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG9wZW5CbG9ja3M6IHN0b3JlLmdldE9wZW4oKVxuICAgIH0pO1xuICB9LFxuICB0b2dnbGVCbG9ja1Zpc2liaWxpdHk6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHZpc2libGVCbG9ja3M6IHN0b3JlLmdldFZpc2libGUoKVxuICAgIH0pO1xuICB9LFxuICBvcGVuRHJvcGRvd246IGZ1bmN0aW9uIChpZCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgb3BlbkRyb3Bkb3duOiBpZCA9PSB0aGlzLnN0YXRlLm9wZW5Ecm9wZG93biA/IC0xIDogaWRcbiAgICB9KTtcbiAgfSxcbiAgb3BlbkFjY29yZGlvbjogZnVuY3Rpb24gKGlkKSB7XG4gICAgLy8gdG9nZ2xlIHRoZSBhY2NvcmRpb24gdG8gYmUgb3Blbiwgb3IgY2xvc2VkIGlmIGl0IGlzIGFscmVhZHkgb3BlblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgb3BlbjogaWQgPT0gdGhpcy5zdGF0ZS5vcGVuID8gLTEgOiBpZFxuICAgIH0pO1xuICB9LFxuICB0b2dnbGVCbG9jazogZnVuY3Rpb24gKGlkKSB7XG4gICAgYWN0aW9ucy50b2dnbGUoaWQpO1xuICB9LFxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBub2RlID0gdGhpcy5nZXRET01Ob2RlKCk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICBcdHRyeSB7XG4gICAgdmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuICAgIHZhciBpdGVtID0gdGhpcy5wcm9wcy5jb25maWcuaXRlbTtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIG9wZW5JRCA9IHRoaXMuc3RhdGUub3BlbjtcbiAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICB2YXIgbW9kZWwgPSBjb25maWcubW9kZWxbY29uZmlnLm5hbWVdLnZhbHVlO1xuXG4gICAgdmFyIGxvb3AgPSBhZGFwdC5jb21wb25lbnRzLmxvb3A7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmKG1vZGVsKSB7XG4gICAgICAvLyBzZXQgdGhlIGNvbnRyb2xsZXIgYW5kIHZpZXcsIGFjY29yZGlvbnMgYXJlbid0IGludmlzaWJsZSBpbiB0aGUgVkMgc28gd2UgbmVlZCB0byBnbyBkb3duIGEgbGV2ZWxcbiAgICAgIHZhciBjaGlsZENvbnRyb2xsZXIgPSBjb25maWcuY29udHJvbGxlcltjb25maWcubmFtZV07XG4gICAgICB2YXIgY2hpbGRNb2RlbCA9IGNvbmZpZy5tb2RlbFtjb25maWcubmFtZV0udmFsdWU7XG5cbiAgICAgIHZhciBkeW5hbWljSXRlbSA9IGFkYXB0LmNvbXBvbmVudHMuaXRlbTtcblxuXG4gICAgICBfdGhpcy5zdGF0ZS5zdWJ0aXRsZUxpc3RlbmVycy5tYXAoIGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgICBsaXN0ZW5lcigpO1xuICAgICAgfSApO1xuXG4gICAgICBfdGhpcy5zdGF0ZS5zdWJ0aXRsZUxpc3RlbmVycyA9IFtdO1xuXG4gICAgICBmb3IoIHZhciBpID0gMDsgaSA8IG1vZGVsLmxlbmd0aDsgaSsrICkge1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSBbXTtcblxuICAgICAgICAvLyBhY2NvcmRpb25zIG1vZGVscyBhcmUgYXJyYXlzLCBhbmQgd2UgbmVlZCB0aGUgYXBwcm9wcmlhdGUgbW9kZWwgdmFsdWUgZm9yIHRoaXMgaXRlcmF0aW9uXG4gICAgICAgIHZhciBmaW5hbE1vZGVsID0gY2hpbGRNb2RlbFtpXTtcblxuICAgICAgICAvLyBhY2NvcmRpb25zIGFyZSB0aGUgc2FtZSwgc28gd2UgbG9vcCB0aHJvdWdoIHRoZSB2aWV3J3MgbW9kZWwgZm9yIGVhY2ggYWNjb3JkaW9uXG4gICAgICAgIC8vIFRPRE86IG1ha2UgYWNjb3JkaW9ucyBoYXZlIGRpZmZlcmVudCB2aWV3cywgdG8gYWxsb3cgZHluYW1pY2FsbHkgYWRkZWQgZWxlbWVudHNcblxuICAgICAgICBjaGlsZHJlbiA9IGxvb3AoXG4gICAgICAgICAge1xuICAgICAgICAgICAgaXRlbXM6IGl0ZW0ubW9kZWwsXG4gICAgICAgICAgICBjb250cm9sbGVyOiBjaGlsZENvbnRyb2xsZXIsXG4gICAgICAgICAgICB2YWx1ZXM6IGNvbmZpZy52YWx1ZXMsXG4gICAgICAgICAgICBvYnNlcnZlOiBjb25maWcub2JzZXJ2ZSxcbiAgICAgICAgICAgIG5hbWVUcmFpbDogY29uZmlnLm5hbWVUcmFpbCArIGNvbmZpZy5uYW1lICsgJy4nLFxuICAgICAgICAgICAgbW9kZWw6IGZpbmFsTW9kZWwsXG4gICAgICAgICAgICBhZGFwdDogX3RoaXMucHJvcHMuYWRhcHRcbiAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gZG9lcyB0aGUgYWNjb3JkaW9uIGhhdmUgYSB0aXRsZSBlbGVtZW50IGZvciBlYWNoIG9uZT9cbiAgICAgICAgdmFyIHRpdGxlID0gJ0l0ZW0nOyAvLyB3ZSdsbCBzZXQgYSBkZWZhdWx0IGFueXdheVxuICAgICAgICBpZiAoaXRlbS50aXRsZSkge1xuICAgICAgICAgIC8vIGFjY29yZGlvbnMgY2FuIGhhdmUgdGl0bGVzLCBzbyB3ZSBuZWVkIHRvIHJlcGxhY2UgYW55IHZhcmlhYmxlcyByZXF1ZXN0ZWRcbiAgICAgICAgICB2YXIgUkVHRVhfQ1VSTFkgPSAveyhbXn1dKyl9L2c7XG5cbiAgICAgICAgICB0aXRsZSA9IGl0ZW0udGl0bGU7XG4gICAgICAgICAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlKFJFR0VYX0NVUkxZLCBmdW5jdGlvbiggbWF0Y2ggKSB7XG4gICAgICAgICAgICBpZiggbWF0Y2ggPT09ICd7aW5kZXh9JyApIHtcbiAgICAgICAgICAgICAgLy8ge2luZGV4fSBhbGxvd3MgdXMgdG8gZGlzcGxheSB0aGUgbnVtYmVyIG9mIHRoZSBhY2NvcmRpb24gKHBsdXMgb25lLi4pXG4gICAgICAgICAgICAgIHJldHVybiBpICsgMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHBvc3NpYmxlVmFyaWFibGUgPSBtYXRjaC5yZXBsYWNlKCd7JywgJycpLnJlcGxhY2UoJ30nLCAnJyk7IC8vIHRoZXJlJ3MgcHJvYmFibHkgYSByZWdleCBmb3IgdGhpcyBzb21ld2hlcmVcblxuICAgICAgICAgICAgaWYoIGZpbmFsTW9kZWxbcG9zc2libGVWYXJpYWJsZV0gKSB7XG4gICAgICAgICAgICAgIC8vIHRoZSB2YXJpYWJsZSBleGlzdHMgaW4gdGhlIG1vZGVsISBsZXQncyBiaW5kIHRoZW1cbiAgICAgICAgICAgICAgcmV0dXJuIGZpbmFsTW9kZWxbcG9zc2libGVWYXJpYWJsZV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3VidGl0bGU7XG4gICAgICAgIGlmIChpdGVtLnN1YnRpdGxlKSB7XG5cblxuICAgICAgICAgIC8vIGFjY29yZGlvbnMgY2FuIGhhdmUgc3VidGl0bGVzLCBzbyB3ZSBuZWVkIHRvIHJlcGxhY2UgYW55IHZhcmlhYmxlcyByZXF1ZXN0ZWRcbiAgICAgICAgICB2YXIgUkVHRVhfQ1VSTFkgPSAveyhbXn1dKyl9L2c7XG5cbiAgICAgICAgICBzdWJ0aXRsZSA9IGl0ZW0uc3VidGl0bGU7XG4gICAgICAgICAgc3VidGl0bGUgPSBzdWJ0aXRsZS5yZXBsYWNlKFJFR0VYX0NVUkxZLCBmdW5jdGlvbiggbWF0Y2ggKSB7XG4gICAgICAgICAgICBpZiggbWF0Y2ggPT09ICd7aW5kZXh9JyApIHtcbiAgICAgICAgICAgICAgLy8ge2luZGV4fSBhbGxvd3MgdXMgdG8gZGlzcGxheSB0aGUgbnVtYmVyIG9mIHRoZSBhY2NvcmRpb24gKHBsdXMgb25lLi4pXG4gICAgICAgICAgICAgIHJldHVybiBpICsgMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHBvc3NpYmxlVmFyaWFibGUgPSBtYXRjaC5yZXBsYWNlKCd7JywgJycpLnJlcGxhY2UoJ30nLCAnJyk7IC8vIHRoZXJlJ3MgcHJvYmFibHkgYSByZWdleCBmb3IgdGhpcyBzb21ld2hlcmVcblxuICAgICAgICAgICAgaWYoIGZpbmFsTW9kZWxbcG9zc2libGVWYXJpYWJsZV0gKSB7XG4gICAgICAgICAgICAgIHZhciBpbmRleCA9IGk7XG4gICAgICAgICAgICAgIF90aGlzLnN0YXRlLnN1YnRpdGxlTGlzdGVuZXJzLnB1c2goXG4gICAgICAgICAgICAgICAgX3RoaXMucHJvcHMuYWRhcHQub2JzZXJ2ZS5hZGRMaXN0ZW5lciggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5tb2RlbFtjb25maWcubmFtZV0udmFsdWVbaW5kZXhdW3Bvc3NpYmxlVmFyaWFibGVdLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICBfdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgIC8vIHRoZSB2YXJpYWJsZSBleGlzdHMgaW4gdGhlIG1vZGVsISBsZXQncyBiaW5kIHRoZW1cbiAgICAgICAgICAgICAgcmV0dXJuIGZpbmFsTW9kZWxbcG9zc2libGVWYXJpYWJsZV0udmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhcmUgdGhleSBvcGVuP1xuICAgICAgICB2YXIgdGl0bGVDbGFzc2VzID0gY3goe1xuICAgICAgICAgICdlbGVtZW50X19hY2NvcmRpb24tLXRpdGxlJzogdHJ1ZSxcbiAgICAgICAgICAnb3Blbic6IGkgPT09IG9wZW5JRFxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgY29udGVudENsYXNzZXMgPSBjeCh7XG4gICAgICAgICAgJ2VsZW1lbnRfX2FjY29yZGlvbi0tY29udGVudCc6IHRydWUsXG4gICAgICAgICAgJ29wZW4nOiBpID09PSBvcGVuSURcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGRyb3Bkb3duQ2xhc3NlcyA9IGN4KHtcbiAgICAgICAgICAnc3ByZWFkc2hlZXRfX2Ryb3Bkb3duJzogdHJ1ZSxcbiAgICAgICAgICAnc3ByZWFkc2hlZXRfX2Ryb3Bkb3duLS1vcGVuJzogdGhpcy5zdGF0ZS5vcGVuRHJvcGRvd24gPT09IGlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gcHVzaCB0aGUgY2hpbGQgaW50byB0aGUgaXRlbXMgYXJyYXksIHNvIHdlIGNhbiByZW5kZXIgaXQgYmVsb3dcbiAgICAgICAgaXRlbXMucHVzaChcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwic3ByZWFkc2hlZXRfX2l0ZW1cIn0sIFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XG4gICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJzcHJlYWRzaGVldF9faGVhZGVyXCIsIFxuICAgICAgICAgICAgICBvbkNsaWNrOiAgdGhpcy5vcGVuQWNjb3JkaW9uLmJpbmQodGhpcywgaSkgfSwgXG4gICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoM1wiLCBudWxsLCB0aXRsZSApLCBcbiAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImg0XCIsIG51bGwsIHN1YnRpdGxlLCBcIsKgXCIpXG4gICAgICAgICAgICApLCBcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJ1bFwiLCB7Y2xhc3NOYW1lOiBkcm9wZG93bkNsYXNzZXMgfSwgXG4gICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsaVwiLCB7XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcInNwcmVhZHNoZWV0X19kcm9wZG93bl9faXRlbVwiLCBcbiAgICAgICAgICAgICAgICBvbkNsaWNrOiAgdGhpcy5kdXBsaWNhdGUuYmluZCh0aGlzLCBpKSB9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLWNvcHkgZmEtZncgc3ByZWFkc2hlZXRfX2Ryb3Bkb3duX19pY29uXCJ9KSwgXG5cbiAgICAgICAgICAgICAgICBcIkR1cGxpY2F0ZVwiXG4gICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwibGlcIiwge1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJzcHJlYWRzaGVldF9fZHJvcGRvd25fX2l0ZW0gc3ByZWFkc2hlZXRfX2Ryb3Bkb3duX19pdGVtLS1kZWxldGVcIiwgXG4gICAgICAgICAgICAgICAgb25DbGljazogIHRoaXMucmVtb3ZlLmJpbmQodGhpcywgaSkgfSwgXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS10aW1lcyBmYS1mdyBzcHJlYWRzaGVldF9fZHJvcGRvd25fX2ljb25cIn0pLCBcblxuICAgICAgICAgICAgICAgIFwiRGVsZXRlXCJcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiYVwiLCB7XG4gICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJzcHJlYWRzaGVldF9faXRlbS0tcmVtb3ZlIG5vLXNlbGVjdFwiLCBcbiAgICAgICAgICAgICAgb25DbGljazogIHRoaXMub3BlbkRyb3Bkb3duLmJpbmQodGhpcywgaSkgfSwgXG4gICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IFwiZmEgZmEtY2hldnJvbi1kb3duXCJ9KVxuICAgICAgICAgICAgKSwgXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwic3ByZWFkc2hlZXRfX2NvbnRlbnRcIn0sIFxuICAgICAgICAgICAgICBjaGlsZHJlbiBcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciB0aXRsZTtcbiAgICBpZiggaXRlbS50aXRsZSApIHtcbiAgICAgIC8vIGlmIHRoZSBhY2NvcmRpb24gaGFzIGEgdGl0bGUsIHdlIG5lZWQgdG8gcmVuZGVyIGl0XG4gICAgICAvLyBncmFiIHRoZSBoZWFkZXIgY29tcG9uZW50XG4gICAgICB2YXIgaGVhZGVyID0gYWRhcHQuY29tcG9uZW50cy5oZWFkZXI7XG5cbiAgICAgIC8vIHBhc3MgaW4gYSBjb25maWcsIHRoaXMgaXMgYSBiaXQgb3ZlcmtpbGwgYnV0IGl0IGFsbG93cyB1cyB0byB1c2UgaXQgYm90aCBoZXJlIGFuZCBpbiB0aGUgSlNPTiBkZWZpbml0aW9uIG9mIHRoZSB2aWV3XG4gICAgICB0aXRsZSA9IGhlYWRlcigge1xuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICBpdGVtOiB7XG4gICAgICAgICAgICB0aXRsZTogaXRlbS50aXRsZSxcbiAgICAgICAgICAgIHR5cGU6ICdoZWFkZXI6aDInXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBhZGFwdDogdGhpcy5wcm9wcy5hZGFwdFxuICAgICAgfSApO1xuICAgIH1cblxuICAgIHZhciBsYWJlbHMgPSBbXTtcbiAgICBmb3IoIHZhciBpIGluIGl0ZW0ubW9kZWwgKSB7XG4gICAgICBpZiggaXRlbS5tb2RlbFtpXS50eXBlID09PSAnYmxvY2toZWFkZXInICkge1xuICAgICAgICBsYWJlbHMucHVzaChcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6ICAnc3ByZWFkc2hlZXRfX2Jsb2NraGVhZGVyICcgKyAoIGl0ZW0ubW9kZWxbaV0uY2xhc3NOYW1lIHx8ICcnKSB9LCBcbiAgICAgICAgICAgICBpdGVtLm1vZGVsW2ldLmxhYmVsXG4gICAgICAgICAgKVxuICAgICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYoIGl0ZW0ubW9kZWxbaV0udHlwZSA9PT0gJ2Jsb2NrJyApIHtcbiAgICAgICAgdmFyIGNoaWxkSXRlbSA9IGl0ZW0ubW9kZWxbaV0uaXRlbXM7XG4gICAgICAgIGZvciggdmFyIHQgaW4gY2hpbGRJdGVtICkge1xuICAgICAgICAgIGlmKCBjaGlsZEl0ZW1bdF0udHlwZSA9PT0gJ2Jsb2NraGVhZGVyJyApIHtcbiAgICAgICAgICAgIHZhciBjbGFzc2VzID0ge1xuICAgICAgICAgICAgICAnc3ByZWFkc2hlZXRfX2Jsb2NraGVhZGVyJzogdHJ1ZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGNoaWxkSXRlbVt0XS5jbGFzc05hbWU7XG5cbiAgICAgICAgICAgIHZhciBpY29uQ2xhc3NlcztcbiAgICAgICAgICAgIHZhciBvbkNsaWNrRXZlbnQgPSBmdW5jdGlvbigpe307XG4gICAgICAgICAgICBpZiggY2xhc3NOYW1lICkge1xuICAgICAgICAgICAgICBjbGFzc2VzW2NsYXNzTmFtZV0gPSB0cnVlO1xuXG4gICAgICAgICAgICAgIGNsYXNzZXNbJ3NwcmVhZHNoZWV0X19ibG9ja2hlYWRlci0taGlkZGVuJ10gPSB0aGlzLnN0YXRlLm9wZW5CbG9ja3MuaW5kZXhPZihpKSA9PT0gLTE7XG5cbiAgICAgICAgICAgICAgaWNvbkNsYXNzZXMgPSAnJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG9uQ2xpY2tFdmVudCA9IHRoaXMudG9nZ2xlQmxvY2suYmluZCh0aGlzLCBpICk7XG5cbiAgICAgICAgICAgICAgaWNvbkNsYXNzZXMgPSBjeCh7XG4gICAgICAgICAgICAgICAgJ2ZhJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAnZmEtY2hldnJvbi1kb3duJzogdGhpcy5zdGF0ZS5vcGVuQmxvY2tzLmluZGV4T2YoaSkgPiAtMSxcbiAgICAgICAgICAgICAgICAnZmEtY2hldnJvbi1yaWdodCc6IHRoaXMuc3RhdGUub3BlbkJsb2Nrcy5pbmRleE9mKGkpID09PSAtMVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoIHRoaXMuc3RhdGUudmlzaWJsZUJsb2Nrcy5pbmRleE9mKGkpID4gLTEgKSB7XG4gICAgICAgICAgICAgIGxhYmVscy5wdXNoKFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogIGN4KGNsYXNzZXMpLCBvbkNsaWNrOiBvbkNsaWNrRXZlbnQgfSwgXG4gICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBpY29uQ2xhc3NlcyB9KSwgXG5cbiAgICAgICAgICAgICAgICAgICBjaGlsZEl0ZW1bdF0ubGFiZWxcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGNsYXNzZXMgPSB7XG4gICAgICAgICAgICAgICdzcHJlYWRzaGVldF9fZmllbGQnOiB0cnVlXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjbGFzc2VzWydzcHJlYWRzaGVldF9fYmxvY2toZWFkZXItLWhpZGRlbiddID0gdGhpcy5zdGF0ZS5vcGVuQmxvY2tzLmluZGV4T2YoaSkgPT09IC0xO1xuXG4gICAgICAgICAgICBsYWJlbHMucHVzaChcbiAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiAgY3goY2xhc3NlcykgfSwgXG4gICAgICAgICAgICAgICAgIGNoaWxkSXRlbVt0XS5sYWJlbCwgXG5cbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwic3ByZWFkc2hlZXRfX2ZpZWxkLS1kZXNjXCJ9LCAgY2hpbGRJdGVtW3RdLmRlc2MpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxhYmVscy5wdXNoKFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJzcHJlYWRzaGVldF9fZmllbGRcIn0sIFxuICAgICAgICAgICAgIGl0ZW0ubW9kZWxbaV0ubGFiZWwsIFxuXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwic3ByZWFkc2hlZXRfX2ZpZWxkLS1kZXNjXCJ9LCAgaXRlbS5tb2RlbFtpXS5kZXNjKVxuICAgICAgICAgIClcbiAgICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBkYXRhO1xuXG4gICAgaWYoIG1vZGVsLmxlbmd0aCApIHtcbiAgICAgIGRhdGEgPSAoXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJzcHJlYWRzaGVldF9fZGF0YVwiLCByZWY6IFwiZGF0YVwifSwgXG4gICAgICAgICAgaXRlbXMgXG4gICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGF0YSA9IChcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInNwcmVhZHNoZWV0X19lbXB0eVwifSwgXG4gICAgICAgICAgXCJDbGljayBcXFwiQWRkIFByb2Nlc3NcXFwiIHRvIGdldCBzdGFydGVkXCJcbiAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8vIHJldHVybiB0aGUgYWNjb3JkaW9uIVxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwic3ByZWFkc2hlZXQgY2xlYXJcIn0sIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwic3ByZWFkc2hlZXRfX3RpdGxlc1wiLCByZWY6IFwidGl0bGVzXCJ9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwic3ByZWFkc2hlZXRfX2FkZCBuby1zZWxlY3RcIn0sIFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInNwcmVhZHNoZWV0X19hZGQtLWJ1dHRvblwiLCBvbkNsaWNrOiAgdGhpcy5hZGR9LCBcbiAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS1wbHVzXCJ9KSwgXG4gICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoM1wiLCBudWxsLCBcIkFkZCBQcm9jZXNzXCIpXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSwgXG4gICAgICAgIFx0bGFiZWxzLCBcblxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJzcHJlYWRzaGVldF9fZGl2aWRlclwifSlcbiAgICAgICAgKSwgXG5cbiAgICAgICAgZGF0YSBcbiAgICAgIClcbiAgICApO1xufSBjYXRjaChlKXtcblx0Y29uc29sZS5sb2coZSk7XG4gIH19XG59O1xuXG5hZGFwdC5jb21wb25lbnQoJ3NwcmVhZHNoZWV0Jywgc3ByZWFkc2hlZXQpOyIsInZhciBzdW1tYXJ5ID0ge1xuICAgIHJlbmRlciAoKSB7XG4gICAgICAgIHZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxuICAgICAgICB2YXIgaXRlbXMgPSB0aGlzLnByb3BzLmFkYXB0Lm1vZGVsLml0ZW1zO1xuXG4gICAgICAgIHZhciBwcm9jZXNzZXMgPSBpdGVtcy5wcm9jZXNzZXMudmFsdWU7XG4gICAgICAgIHZhciBwaGFzZSA9IGl0ZW1zLnBoYXNlLnZhbHVlO1xuXG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHByb2Nlc3Nlcy5tYXAoIGZ1bmN0aW9uIChwcm9jZXNzLCBpKSB7XG4gICAgICAgICAgICB2YXIgcGVyY2VudGFnZSA9IDA7XG4gICAgICAgICAgICBpZiggcHJvY2Vzc1twaGFzZSArICdwZXJjZW50YWdlSkxSRGVtYW5kJ10gKSB7XG4gICAgICAgICAgICAgICAgcGVyY2VudGFnZSA9IHByb2Nlc3NbcGhhc2UgKyAncGVyY2VudGFnZUpMUkRlbWFuZCddLnZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgY2xhc3NlcyA9IGN4KHtcbiAgICAgICAgICAgICAgICAnc3VtbWFyeV9fcHJvY2Vzcyc6IHRydWUsXG4gICAgICAgICAgICAgICAgJ3N1bW1hcnlfX3Byb2Nlc3MtLW5lZ2F0aXZlJzogcGVyY2VudGFnZSA8IDAsXG4gICAgICAgICAgICAgICAgJ3N1bW1hcnlfX3Byb2Nlc3MtLXBvc2l0aXZlJzogcGVyY2VudGFnZSA+IDBcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgamxyRGVtYW5kO1xuICAgICAgICAgICAgdmFyIHBhcnRzQXZhaWxhYmxlRm9yU2hpcG1lbnQ7XG4gICAgICAgICAgICB2YXIgcGVyY2VudGFnZUpMUkRlbWFuZDtcblxuICAgICAgICAgICAgaWYoIHByb2Nlc3NbcGhhc2UgKyAnamxyRGVtYW5kJ10gKSB7XG4gICAgICAgICAgICAgICAgamxyRGVtYW5kID0gcHJvY2Vzc1twaGFzZSArICdqbHJEZW1hbmQnXS52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKCBwcm9jZXNzW3BoYXNlICsgJ3BhcnRzQXZhaWxhYmxlRm9yU2hpcG1lbnQnXSApIHtcbiAgICAgICAgICAgICAgICBwYXJ0c0F2YWlsYWJsZUZvclNoaXBtZW50ID0gcHJvY2Vzc1twaGFzZSArICdwYXJ0c0F2YWlsYWJsZUZvclNoaXBtZW50J10udmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiggcHJvY2Vzc1twaGFzZSArICdqbHJEZW1hbmQnXSApIHtcbiAgICAgICAgICAgICAgICBwZXJjZW50YWdlSkxSRGVtYW5kID0gcHJvY2Vzc1twaGFzZSArICdwZXJjZW50YWdlSkxSRGVtYW5kJ10udmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBjbGFzc2VzIH0sIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaDRcIiwge2NsYXNzTmFtZTogXCJzdW1tYXJ5X19kZXNjXCJ9LCBcIlByb2Nlc3MgXCIsICBpICsgMSwgXCI6IFwiLCAgcHJvY2Vzcy5kZXNjKSwgXG5cbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInVsXCIsIHtjbGFzc05hbWU6IFwic3VtbWFyeV9fbGlzdFwifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwibGlcIiwge2NsYXNzTmFtZTogXCJzdW1tYXJ5X19pdGVtXCJ9LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwic3VtbWFyeV9faXRlbS0taGVhZGVyXCJ9LCBcIkpMUiBEZW1hbmRcIiksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJzdW1tYXJ5X19pdGVtLS12YWx1ZVwifSwgamxyRGVtYW5kIClcbiAgICAgICAgICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImxpXCIsIHtjbGFzc05hbWU6IFwic3VtbWFyeV9faXRlbVwifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInN1bW1hcnlfX2l0ZW0tLWhlYWRlclwifSwgXCJXZWVrbHkgUGFydHMgQXZhaWxhYmxlIGZvciBTaGlwbWVudFwiKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInN1bW1hcnlfX2l0ZW0tLXZhbHVlXCJ9LCBwYXJ0c0F2YWlsYWJsZUZvclNoaXBtZW50IClcbiAgICAgICAgICAgICAgICAgICAgICAgICksIFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImxpXCIsIHtjbGFzc05hbWU6IFwic3VtbWFyeV9faXRlbVwifSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInN1bW1hcnlfX2l0ZW0tLWhlYWRlclwifSwgXCJQZXJjZW50YWdlIEFib3ZlL0JlbG93IEpMUiBEZW1hbmRcIiksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJzdW1tYXJ5X19pdGVtLS12YWx1ZVwifSwgcGVyY2VudGFnZUpMUkRlbWFuZCApXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJzdW1tYXJ5XCJ9LCBcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiBcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59O1xuXG5hZGFwdC5jb21wb25lbnQoJ3N1bW1hcnlUYWInLCBzdW1tYXJ5KTsiLCJ2YXIgZGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2ZsdXgvZGlzcGF0Y2hlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBkaXNwYXRjaGVyKCk7IiwiaW1wb3J0IHJvdXRlciBmcm9tICcuL3JvdXRlcic7XG5pbXBvcnQgaGVhZGVyIGZyb20gJy4vY29tcG9uZW50cy9oZWFkZXIuanN4JztcbmltcG9ydCBzaWduIGZyb20gJy4vY29tcG9uZW50cy9zaWduLmpzeCc7XG5pbXBvcnQgc0xQIGZyb20gJy4vY29tcG9uZW50cy9zaGFyZWRMb2FkaW5nUGxhbi5qc3gnO1xuaW1wb3J0IGJ1dHRvbkNvbnRhaW5lciBmcm9tICcuL2NvbXBvbmVudHMvYnV0dG9uQ29udGFpbmVyLmpzeCc7XG5pbXBvcnQgYnV0dG9uIGZyb20gJy4vY29tcG9uZW50cy9idXR0b24uanN4JztcbmltcG9ydCBibG9jayBmcm9tICcuL2NvbXBvbmVudHMvYmxvY2suanN4JztcbmltcG9ydCBvdmVybGF5IGZyb20gJy4vY29tcG9uZW50cy9vdmVybGF5LmpzeCc7XG5pbXBvcnQgc3ByZWFkc2hlZXQgZnJvbSAnLi9jb21wb25lbnRzL3NwcmVhZHNoZWV0LmpzeCc7XG5pbXBvcnQgc3VtbWFyeSBmcm9tICcuL2NvbXBvbmVudHMvc3VtbWFyeS5qc3gnO1xuaW1wb3J0IGNoYXJ0IGZyb20gJy4vY29tcG9uZW50cy9jaGFydC5qc3gnO1xuaW1wb3J0IGluZGV4IGZyb20gJy4vcGFnZXMvaW5kZXguanN4JztcblxuUmVhY3QucmVuZGVyQ29tcG9uZW50KCBpbmRleChudWxsKSwgZG9jdW1lbnQuYm9keSApOyIsInZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxuXG5mdW5jdGlvbiBEaXNwYXRjaGVyKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgX2NhbGxiYWNrcyA9IHt9O1xuICAgIHZhciBfcGVuZGluZyA9IHt9O1xuICAgIHZhciBfaGFuZGxlZCA9IHt9O1xuICAgIHZhciBfbmFtZSA9IG51bGw7XG4gICAgdmFyIF9kYXRhID0gbnVsbDtcbiAgICB2YXIgX2Rpc3BhdGNoaW5nID0gZmFsc2U7XG5cbiAgICBmdW5jdGlvbiBfY2FsbChpZCkge1xuICAgICAgICBfcGVuZGluZ1tpZF0gPSB0cnVlO1xuICAgICAgICBfY2FsbGJhY2tzW2lkXShfbmFtZSwgX2RhdGEpO1xuICAgICAgICBfaGFuZGxlZFtpZF0gPSB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9wcmVEaXNwYXRjaChuYW1lLCBkYXRhKSB7XG4gICAgICAgIF9kaXNwYXRjaGluZyA9IHRydWU7XG5cbiAgICAgICAgT2JqZWN0LmtleXMoX2NhbGxiYWNrcykuZm9yRWFjaChmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgX3BlbmRpbmdbaWRdID0gZmFsc2U7XG4gICAgICAgICAgICBfaGFuZGxlZFtpZF0gPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgX25hbWUgPSBuYW1lO1xuICAgICAgICBfZGF0YSA9IGRhdGE7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2Rpc3BhdGNoKCkge1xuICAgICAgICBPYmplY3Qua2V5cyhfY2FsbGJhY2tzKS5mb3JFYWNoKGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICBpZiAoX3BlbmRpbmdbaWRdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBfY2FsbChpZCk7XG4gICAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRpcihlLnN0YWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3Bvc3REaXNwYXRjaCgpIHtcbiAgICAgICAgX2RhdGEgPSBudWxsO1xuICAgICAgICBfbmFtZSA9IG51bGw7XG4gICAgICAgIF9kaXNwYXRjaGluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHNlbGYuZGlzcGF0Y2ggPSBmdW5jdGlvbihuYW1lLCBkYXRhKSB7XG4gICAgICAgIGlmIChfZGlzcGF0Y2hpbmcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRGlzcGF0Y2hlci5kaXNwYXRjaDogY2FsbGVkIHdoaWxlIGRpc3BhdGNoaW5nJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZygnZGlzcGF0Y2hpbmcnLCBuYW1lKTtcbiAgICAgICAgX3ByZURpc3BhdGNoKG5hbWUsIGRhdGEpO1xuICAgICAgICBfZGlzcGF0Y2goKTtcbiAgICAgICAgY29uc29sZS5sb2coJ25vdCBkaXNwYXRjaGluZycsIG5hbWUpO1xuICAgICAgICBfcG9zdERpc3BhdGNoKCk7XG4gICAgfTtcblxuICAgIHNlbGYucmVnaXN0ZXIgPSBmdW5jdGlvbihjYiwgaWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEaXNwYXRjaGVyLnJlZ2lzdGVyOiBjYWxsYmFjayBpcyBub3QgYSBmdW5jdGlvbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWQgPSBpZCB8fCB1dGlscy51aWQoKTtcbiAgICAgICAgX2NhbGxiYWNrc1tpZF0gPSBjYjtcblxuICAgICAgICByZXR1cm4gaWQ7XG4gICAgfTtcblxuICAgIHNlbGYudW5yZWdpc3RlciA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIGRlbGV0ZSBfY2FsbGJhY2tzW2lkXTtcbiAgICB9O1xuXG4gICAgc2VsZi53YWl0ID0gZnVuY3Rpb24oaWRzKSB7XG4gICAgICAgIGlkcy5mb3JFYWNoKGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICBpZiAoIV9kaXNwYXRjaGluZykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRGlzcGF0Y2hlci53YWl0OiBjYWxsZWQgd2hpbGUgbm90IGRpc3BhdGNoaW5nJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghX2NhbGxiYWNrc1tpZF0pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Rpc3BhdGNoZXIud2FpdDogY2FsbGVkIHdpdGggbWlzc2luZyBpZCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoX3BlbmRpbmdbaWRdKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIV9oYW5kbGVkW2lkXSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Rpc3BhdGNoZXIud2FpdDogZGV0ZWN0ZWQgY3ljbGUnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF9jYWxsKGlkKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaXNwYXRjaGVyOyIsImZ1bmN0aW9uIEVtaXR0ZXIoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBfbGlzdGVuZXJzID0ge307XG5cbiAgICBzZWxmLmFkZExpc3RlbmVyID0gZnVuY3Rpb24obmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJyB8fCBzZWxmLmhhc0xpc3RlbmVyKG5hbWUsIGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgX2xpc3RlbmVyc1tuYW1lXSA9IF9saXN0ZW5lcnNbbmFtZV0gfHwgW107XG4gICAgICAgIF9saXN0ZW5lcnNbbmFtZV0ucHVzaChjYWxsYmFjayk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIHNlbGYuZW1pdCA9IGZ1bmN0aW9uKG5hbWUsIGRhdGEpIHtcbiAgICAgICAgaWYgKCFfbGlzdGVuZXJzW25hbWVdKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBfbGlzdGVuZXJzW25hbWVdLmZvckVhY2goZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGRhdGEpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgc2VsZi5oYXNMaXN0ZW5lciA9IGZ1bmN0aW9uKG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjYWxsYmFja3MgPSBfbGlzdGVuZXJzW25hbWVdO1xuXG4gICAgICAgIGlmICghY2FsbGJhY2tzIHx8IGNhbGxiYWNrcy5pbmRleE9mKGNhbGxiYWNrKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBzZWxmLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24obmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKCFzZWxmLmhhc0xpc3RlbmVyKG5hbWUsIGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgX2xpc3RlbmVyc1tuYW1lXSA9IF9saXN0ZW5lcnNbbmFtZV0uZmlsdGVyKGZ1bmN0aW9uKGNiKSB7XG4gICAgICAgICAgICByZXR1cm4gY2IgIT09IGNhbGxiYWNrO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIV9saXN0ZW5lcnNbbmFtZV0ubGVuZ3RoKSB7XG4gICAgICAgICAgICBkZWxldGUgX2xpc3RlbmVyc1tuYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjsiLCJ2YXIgRW1pdHRlciA9IHJlcXVpcmUoJy4vZW1pdHRlcicpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG5mdW5jdGlvbiBTdG9yZShjZmcpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIF9jZmcsIF9kYXRhLCBfZGlzcGF0Y2hlciwgX2VtaXR0ZXIsIF9pZCwgX2hhbmRsZXJzO1xuXG4gICAgX2NmZyA9IHV0aWxzLmNvbmZpZyh7XG4gICAgICAgIGRhdGE6IG51bGxcbiAgICB9LCBjZmcsICdTdG9yZScpO1xuICAgIF9kYXRhID0gX2NmZy5kYXRhO1xuICAgIF9kaXNwYXRjaGVyID0gX2NmZy5kaXNwYXRjaGVyO1xuICAgIF9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICBfaWQgPSB1dGlscy51aWQoKTtcbiAgICBfaGFuZGxlcnMgPSB7XG4gICAgICAgIF9nbG9iYWw6IHt9XG4gICAgfTtcblxuICAgIHNlbGYub2ZmID0gZnVuY3Rpb24obmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2hpIHVuYmluZCcsIGNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuIF9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKG5hbWUsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgc2VsZi5vbiA9IGZ1bmN0aW9uKG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBfZW1pdHRlci5hZGRMaXN0ZW5lcihuYW1lLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIHNlbGYuZW1pdCA9IGZ1bmN0aW9uKG5hbWUsIGRhdGEsIG9wdHMpIHtcbiAgICAgICAgb3B0cyA9IG5ldyBPYmplY3Qob3B0cyk7XG5cbiAgICAgICAgaWYgKG9wdHMuc2lsZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gX2VtaXR0ZXIuZW1pdChuYW1lLCBkYXRhKTtcbiAgICB9O1xuXG4gICAgc2VsZi5jbGVhciA9IGZ1bmN0aW9uKG9wdHMpIHtcbiAgICAgICAgX2RhdGEgPSBudWxsO1xuICAgICAgICBzZWxmLmVtaXQoJ2NoYW5nZScsIF9kYXRhLCBvcHRzKTtcblxuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICB9O1xuXG4gICAgc2VsZi5zZXQgPSBmdW5jdGlvbihkYXRhLCBvcHRzKSB7XG4gICAgICAgIF9kYXRhID0gZGF0YTtcbiAgICAgICAgc2VsZi5lbWl0KCdjaGFuZ2UnLCBfZGF0YSwgb3B0cyk7XG5cbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfTtcblxuICAgIHNlbGYucmVnaXN0ZXJIYW5kbGVycyA9IGZ1bmN0aW9uKGhhbmRsZXJzLCBpZCkge1xuICAgICAgICBpZiAoaWQpIHtcbiAgICAgICAgICAgIF9oYW5kbGVyc1tpZF0gPSBoYW5kbGVycztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9oYW5kbGVycy5fZ2xvYmFsID0gaGFuZGxlcnM7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgc2VsZi51bnJlZ2lzdGVySGFuZGxlcnMgPSBmdW5jdGlvbihpZCkge1xuICAgICAgICBpZiAoaWQpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBfaGFuZGxlcnNbaWRdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX2hhbmRsZXJzLl9nbG9iYWwgPSB7fTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBzZWxmLmNyZWF0ZUFjdGlvbnMgPSBmdW5jdGlvbihhY3Rpb25zKSB7XG4gICAgICAgIHZhciBib3VuZEFjdGlvbnMgPSB7fTtcblxuICAgICAgICBPYmplY3Qua2V5cyhhY3Rpb25zKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgYm91bmRBY3Rpb25zW2tleV0gPSBhY3Rpb25zW2tleV0uYmluZChzZWxmKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGJvdW5kQWN0aW9ucztcbiAgICB9O1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoc2VsZiwge1xuICAgICAgICBkaXNwYXRjaGVyOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Rpc3BhdGNoZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGlkOiB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2lkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVyczoge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9oYW5kbGVycztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9kYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBfZGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgICAgIHZhciBjYnMgPSBwYXlsb2FkLmlkID8gX2hhbmRsZXJzW3BheWxvYWQuaWRdIDogX2hhbmRsZXJzLl9nbG9iYWw7XG4gICAgICAgIHZhciBjYiA9IGNicyA/IGNic1twYXlsb2FkLmFjdGlvbl0gOiBudWxsO1xuXG4gICAgICAgIGlmICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNiLmNhbGwoc2VsZiwgcGF5bG9hZC5kYXRhKTtcbiAgICAgICAgfVxuICAgIH0sIF9pZCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3RvcmU7IiwidmFyIF91aWQgPSAxO1xudmFyIHV0aWxzO1xuXG51dGlscyA9IHtcbiAgICBjb25maWc6IGZ1bmN0aW9uKGRlZmF1bHRzLCBjb25maWcsIG5hbWUpIHtcbiAgICAgICAgaWYgKCFjb25maWcgfHwgIWNvbmZpZy5kaXNwYXRjaGVyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IobmFtZSArICcgcmVxdWlyZXMgYSBEaXNwYXRjaGVyJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdXRpbHMubWVyZ2UoZGVmYXVsdHMsIGNvbmZpZyk7XG4gICAgfSxcbiAgICBtZXJnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvYmpzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuXG4gICAgICAgIG9ianMuZm9yRWFjaChmdW5jdGlvbihvYmopIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IG9ialtrZXldO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcbiAgICBwYXJzZTogZnVuY3Rpb24ocmVxKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJlc3VsdCA9IEpTT04ucGFyc2UocmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcbiAgICByZXF1ZXN0OiBmdW5jdGlvbih1cmwsIGNiKSB7XG4gICAgICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICByZXEub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAocmVxLnN0YXR1cyA+PSAyMDAgJiYgcmVxLnN0YXR1cyA8IDQwMCkge1xuICAgICAgICAgICAgICAgIGNiKHVuZGVmaW5lZCwgcmVxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2IobmV3IEVycm9yKCdTdG9yZTogVGhlcmUgd2FzIGEgc3RhdHVzIGVycm9yLicpLCByZXEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJlcS5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjYihuZXcgRXJyb3IoJ1N0b3JlOiBUaGVyZSB3YXMgYSBuZXR3b3JrIGVycm9yLicpLCByZXEpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJlcS5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICAgICAgICByZXEuc2VuZCgpO1xuICAgIH0sXG4gICAgdWlkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF91aWQrKztcbiAgICB9LFxuICAgIHVybDogZnVuY3Rpb24odiwgcGFyYW1zKSB7XG4gICAgICAgICB2YXIgcmVzdWx0ID0gdiArICc/JztcblxuICAgICAgICBPYmplY3Qua2V5cyhwYXJhbXMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICByZXN1bHQgKz1cbiAgICAgICAgICAgICAgICBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArICc9JyArXG4gICAgICAgICAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtc1trZXldKSArICcmJztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdC5zbGljZSgwLCAtMSk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsczsiLCJ2YXIgZm9ybSA9IHtcbiAgICBcInRhYnNcIjoge1xuICAgICAgICBcInR5cGVcIjogXCJ0YWJzXCIsXG4gICAgICAgIFwiaXRlbXNcIjoge1xuICAgICAgICAgICAgcGhhc2U6IHtcbiAgICAgICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4IDE1cHhcIixcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1BoYXNlIEluZm9ybWF0aW9uJyxcbiAgICAgICAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgICAgICAgICBjb2w6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjb2x1bW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3BhbjogMixcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBoYXNlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzZWxlY3QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1BoYXNlIFN1Ym1pdHRpbmcgRm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnY2FwYWNpdHlQbGFubmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0NhcGFjaXR5IFBsYW5uaW5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ3BoYXNlMCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1BoYXNlIDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAncGhhc2UzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnUGhhc2UgMydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdjYXBhY2l0eUNvbmZpcm1hdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0NhcGFjaXR5IENvbmZpcm1hdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHBhcExldmVsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzZWxlY3QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1BQQVAgTGV2ZWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdQUEFQXzEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICcxJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ1BQQVBfMycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJzMnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnUFBBUF81JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnNSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZWFzb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0YXJlYScsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1JlYXNvbiBmb3Igc3VibWlzc2lvbidcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZXRhaWxzOiB7XG4gICAgICAgICAgICAgICAgXCJwYWRkaW5nXCI6IFwiMTBweCAxNXB4XCIsXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdEZXRhaWxzJyxcbiAgICAgICAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdoZWFkZXI6aDQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ1N1cHBsaWVyIERldGFpbHMnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNvbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NvbHVtbjpyb3dzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwYW46IDMsXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1cHBsaWVyTmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ05hbWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5wdXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ1N1cHBsaWVyIE5hbWUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQWRkcmVzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbnB1dCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnU3VwcGxpZXIgQWRkcmVzcydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50eToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0NvdW50eS9TdGF0ZS9SZWdpb24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5wdXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ1N1cHBsaWVyIENvdW50eS9TdGF0ZS9SZWdpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudHJ5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQ291bnRyeScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbnB1dCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnU3VwcGxpZXIgQ291bnRyeSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNpdHk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdDaXR5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lucHV0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdTdXBwbGllciBDaXR5J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVhbGl0eUdTREI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdRdWFsaXR5IEdTREInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5wdXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ1F1YWxpdHkgR1NEQidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hbnVmYWN0dXJpbmdHU0RCOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnTWFudWZhY3R1cmluZyBHU0RCJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lucHV0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdNYW51ZmFjdHVyaW5nIEdTREInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJLZXk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdoZWFkZXI6aDQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ0tleSBDb250YWN0IERldGFpbHMnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNvbDI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjb2x1bW46cm93cycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGFuOiAzLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdXBwbGllclJlcHJlc2VudGF0aXZlTmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1N1cHBsaWVyIFJlcHJlc2VudGF0aXZlIE5hbWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5wdXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ1N1cHBsaWVyIFJlcHJlc2VudGF0aXZlIE5hbWUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdXBwbGllclJlcHJlc2VudGF0aXZlRW1haWw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTdXBwbGllciBSZXByZXNlbnRhdGl2ZSBFbWFpbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbnB1dCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnU3VwcGxpZXIgUmVwcmVzZW50YXRpdmUgRW1haWwnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdXBwbGllclJlcHJlc2VudGF0aXZlUGhvbmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTdXBwbGllciBSZXByZXNlbnRhdGl2ZSBQaG9uZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbnB1dCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnU3VwcGxpZXIgUmVwcmVzZW50YXRpdmUgUGhvbmUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdXBwbGllclJlcHJlc2VudGF0aXZlUm9sZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1N1cHBsaWVyIFJlcHJlc2VudGF0aXZlIFJvbGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5wdXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ1N1cHBsaWVyIFJlcHJlc2VudGF0aXZlIFJvbGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgamxyU3RhTmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0pMUiBTVEEgTmFtZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbnB1dCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnSkxSIFNUQSBOYW1lJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgamxyU3RhRW1haWw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdKTFIgU1RBIEVtYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lucHV0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdKTFIgU1RBIEVtYWlsJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgamxyU3RhUGhvbmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdKTFIgU1RBIFBob25lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lucHV0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdKTFIgU1RBIFBob25lJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXJ0OiB7XG4gICAgICAgICAgICAgICAgXCJwYWRkaW5nXCI6IFwiMTBweCAxNXB4XCIsXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdQYXJ0IEluZm9ybWF0aW9uJyxcbiAgICAgICAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgICAgICAgICBjb2w6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjb2x1bW46cm93cycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGFuOiAyLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0TmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5wdXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1BhcnQgTmFtZS9EZXNjcmlwdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRUeXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdyYWRpbycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnUGFydCBUeXBlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VxdWVuY2VkOiAnU2VxdWVuY2VkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vbjogJ05vbi1TZXF1ZW5jZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdGVkQ29sOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY29sdW1uOnJvd3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3BhbjogMyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0ZWRQYXJ0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdyYWRpbycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnSXMgdGhpcyBwYXJ0IHN1cHBsaWVkIGFzIGEgZGlyZWN0ZWQgc291cmNlPycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHllczogJ1llcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBubzogJ05vJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzdHVkeVN1cHBsaWVyRm9yOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAncmFkaW8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTdHVkeSBTdXBwbGllZCBGb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpbmdsZTogJ1NpbmdsZSBQYXJ0IC8gU2luZ2xlIFN1ZmZpeCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGk6ICdNdWx0aXBsZSBQYXJ0IC8gTGlzdGVkIFN1ZmZpeGVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdWx0aUFsbDogJ011bHRpcGxlIFBhcnQgLyBBbGwgU3VmZml4ZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXg6ICdDb21wbGV4IENvbW9kaXR5J1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBuYW1lQ29sOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY29sdW1uOnJvd3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3BhbjogMyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZml4OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbnB1dCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnUHJlZml4J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5wdXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0Jhc2UnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWZmaXg6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lucHV0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTdWZmaXgnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjb21wbGV4Q29tbW9kaXR5Q29sOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY29sdW1uOnJvd3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3BhbjogWzFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IHt9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHByb2dyYW1tZVZvbHVtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2hlYWRlcjpoNCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnUHJvZ3JhbW1lKHMpIFZvbHVtZSBJbmZvcm1hdGlvbiAoSkxSIERlbWFuZCknXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHN0dWR5U3VibWl0dGVkRm9yOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTdHVkeSBTdWJtaXR0ZWQgRm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsMzU5OiAnTDM1OScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbDMxOTogJ0wzMTknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGwzMTY6ICdMMzE2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsNTM4OiAnTDUzOCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbDU1MDogJ0w1NTAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGw0NTA6ICdMNDUwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsNDYwOiAnTDQ2MCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbDQ5NDogJ0w0OTQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGw0NjI6ICdMNDYyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4NzYwOiAnWDc2MCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDI2MDogJ1gyNjAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgxNTA6ICdYMTUwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4MTUyOiAnWDE1MicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDI1MDogJ1gyNTAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgzNTE6ICdYMzUxJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB2b2x1bWVUb3RhbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjb2x1bW46cm93cycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGFuOiA0LFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IHt9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHZvbHVtZVRvdGFsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5wdXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdWb2x1bWUgVG90YWwnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG90aGVyUHJvZ3JhbW1lVm9sdW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaGVhZGVyOmg0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdPdGhlciBQcm9ncmFtbWUocykgVm9sdW1lIEluZm9ybWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvdGhlclN0dWR5U3VibWl0dGVkRm9yOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPdGhlciBQcm9ncmFtbWVzIFNhbWUgUGFydHMgU3VwcGxpZWQgVG8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVkZU5BOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGwzNTk6ICdMMzU5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsMzE5OiAnTDMxOScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbDMxNjogJ0wzMTYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGw1Mzg6ICdMNTM4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsNTUwOiAnTDU1MCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbDQ1MDogJ0w0NTAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGw0NjA6ICdMNDYwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsNDk0OiAnTDQ5NCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbDQ2MjogJ0w0NjInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg3NjA6ICdYNzYwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4MjYwOiAnWDI2MCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDE1MDogJ1gxNTAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgxNTI6ICdYMTUyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4MjUwOiAnWDI1MCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDM1MTogJ1gzNTEnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG90aGVyVm9sdW1lVG90YWxzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY29sdW1uOnJvd3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3BhbjogNCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiB7fVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvdGhlclZvbHVtZVRvdGFsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5wdXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdPdGhlciBWb2x1bWUgVG90YWwnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwidG90YWxSZXF1aXJlZERlbWFuZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlRvdGFsIERlbWFuZCBvZiBTdHVkeSBTdWJtaXR0ZWQgRm9yXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInByb2Nlc3Nlc1wiOiB7XG4gICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIk1hbnVmYWN0dXJpbmcgUHJvY2Vzc2VzXCIsXG4gICAgICAgICAgICAgICAgXCJpdGVtc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwicHJvY2Vzc2VzXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInNwcmVhZHNoZWV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRpdGxlXCI6IFwiUHJvY2VzcyB7aW5kZXh9XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRpdGxlXCI6IFwie2Rlc2N9XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm1vZGVsXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiRGVzY3JpcHRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYXBhY2l0eVBsYW5uaW5nXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiYmxvY2tcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpdGVtc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNhcFBsYW5uaW5nSGVhZGVyXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJibG9ja2hlYWRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJDYXBhY2l0eSBQbGFubmluZ1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwbGFubmVkT3BlcmF0aW5nUGF0dGVyblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiYmxvY2toZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNsYXNzTmFtZVwiOiBcInN1YmhlYWRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJQbGFubmVkIE9wZXJhdGluZyBQYXR0ZXJuICYgTmV0IEF2YWlsYWJsZSBUaW1lXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRheXNQZXJXZWVrXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJEYXlzIC8gV2Vla1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzaGlmdHNQZXJEYXlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlNoaWZ0cyAvIERheVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJob3Vyc1BlclNoaWZ0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJIb3VycyAvIFNoaWZ0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBlcnNvbmFsQnJlYWtzXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJQZXJzb25hbCBCcmVha3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGxhbm5lZE1haW50ZW5hbmNlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJQbGFubmVkIE1haW50ZW5hbmNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluc3BlY3Rpb25PZkZhY2lsaXRpZXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkluc3BlY3Rpb24gb2YgRmFjaWxpdGllc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwbGFubmVkQ2hhbmdlb3ZlckZyZXF1ZW5jeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUGxhbm5lZCBDaGFuZ2VvdmVyIEZyZXF1ZW5jeVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIihwZXIgd2VlaylcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGxhbm5lZE1pbnV0ZXNQZXJDaGFuZ2VvdmVyXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJQbGFubmVkIE1pbnV0ZXMgcGVyIENoYW5nZW92ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIoaW50byB0aGlzIHBhcnQgbnVtYmVyKVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0b3RhbFBsYW5uZWREb3dudGltZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiVG90YWwgUGxhbm5lZCBEb3dudGltZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIihwZXIgd2VlaywgaW5jIGJyZWFrcywgZXRjKVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGxvY2F0aW9uUGVyY2VudGFnZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiQWxsb2NhdGlvbiBQZXJjZW50YWdlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiRW50ZXIgMTAwIGZvciBhIGRlZGljYXRlZCBwcm9jZXNzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInNoYXJlZExvYWRpbmdQbGFuXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJvdmVybGF5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0ZXh0XCI6IFwiU3VibWl0IFNoYXJlZCBMb2FkaW5nIFBsYW5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiU2hhcmVkIExvYWRpbmcgUGxhblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaXRlbXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImhlYWRlclwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJoZWFkZXI6aDJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidGV4dFwiOiBcIlNoYXJlZCBMb2FkaW5nIFBsYW5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInNoYXJlZExvYWRpbmdQbGFuXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInNoYXJlZExvYWRpbmdQbGFuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1vZGVsXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImpsclBhcnROdW1iZXJcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiSkxSIFBhcnQgIyBvciBcXFwiTm9uIC0gSkxSIFBhcnQgXFxcIlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlcUdvb2RQYXJ0c1BlcldlZWtcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUmVxJ2QgR29vZCBQYXJ0cyAvIFdlZWtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXFQcm9kSG91cnNQZXJXZWVrXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlJlcSdkIFByb2QgSG91cnMgLyBXZWVrXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRBbGxvY2F0aW9uQnlQYXJ0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlJlcXVpcmVkICUgQWxsb2NhdGlvbiBieSBQYXJ0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGVyY2VudGFnZU5ldEF2YWlsVGltZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlBlcmNlbnRhZ2Ugb2YgTmV0IEF2YWlsYWJsZSBUaW1lIG5vdCB1dGlsaXplZCBmb3IgcHJvZHVjdGlvbiAoJSkge1BNLCBldGMufVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidG90YWxQZXJjZW50YWdlQWxsb2NhdGlvblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlRvdGFsICUgQWxsb2NhdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuZXRBdmFpbGFibGVUaW1lXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJOZXQgQXZhaWxhYmxlIFRpbWVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVxdWlyZWRHb29kUGFydHNIZWFkZXJcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImJsb2NraGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjbGFzc05hbWVcIjogXCJzdWJoZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUmVxdWlyZWQgR29vZCBQYXJ0cyAvIFdlZWtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGVyY2VudGFnZU9mUGFydHNSZWplY3RlZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUGVyY2VudGFnZSBvZiBQYXJ0cyBSZWplY3RlZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIihpbmMgc2NyYXAgJiByZXdvcmspXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkR29vZFBhcnRzUGVyV2Vla1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUmVxdWlyZWQgR29vZCBQYXJ0cyBQZXIgV2Vlay9Ib3VyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiVG8gc3VwcG9ydCB0aGlzIHByb2Nlc3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGVyY2VudE9mUGFydHNSZXdvcmtlZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUGVyY2VudGFnZSBvZiBQYXJ0cyBSZXdvcmtlZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIihyZS1ydW4gdGhyb3VnaCBwcm9jZXNzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBsYW5uZWRDeWNsZVRpbWVIZWFkZXJcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImJsb2NraGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjbGFzc05hbWVcIjogXCJzdWJoZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUGxhbm5lZCBDeWNsZSBUaW1lIC8gQ2FwYWNpdHlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaWRlYWxQbGFubmVkQ3ljbGVUaW1lXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJJZGVhbCBQbGFubmVkIEN5Y2xlIFRpbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjogXCJQZXIgdG9vbCBvciBtYWNoaW5lIChzZWMvY3ljbGUpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm51bWJlck9mVG9vbHNQYXJhbGxlbFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiTnVtYmVyIG9mIFRvb2xzIG9yIE1hY2hpbmVzIGluIFBhcmFsbGVsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlkZW50aWNhbFBhcnRzUGVyQ3ljbGVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIk51bWJlciBvZiBJZGVudGljYWwgUGFydHMgUHJvZHVjZWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjogXCJQZXIgVG9vbC9NYWNoaW5lIFBlciBDeWNsZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuZXRJZGVhbEN5Y2xlVGltZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiTmV0IElkZWFsIEN5Y2xlIFRpbWUgcGVyIFBhcnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIoc2VjL3BhcnQpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBsYW5uZWRQcm9kdWN0aW9uUGVyV2Vla1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUGxhbm5lZCBQcm9kdWN0aW9uIFBlciBXZWVrXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlcXVpcmVkT0VFXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJSZXF1aXJlZCBPRUVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGxhbm5lZFByb2R1Y3Rpb25QZXJEYXlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlBsYW5uZWQgUHJvZHVjdGlvbiBQZXIgRGF5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBsYW5uZWRQcm9kdWN0aW9uUGVySG91clwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUGxhbm5lZCBQcm9kdWN0aW9uIFBlciBIb3VyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm90aGVyQXNzdW1wdGlvbnNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkVudGVyIGFueSBvdGhlciBhc3N1bXB0aW9uc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2UwXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiYmxvY2tcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpdGVtc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlMEhlYWRlclwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiYmxvY2toZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUGhhc2UgMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTBwcm9kdWN0aW9uUnVuSGVhZGVyXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJibG9ja2hlYWRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2xhc3NOYW1lXCI6IFwic3ViaGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlN1cHBsaWVyIERlbW9uc3RyYXRlZCAtIFByb2R1Y3Rpb24gUnVuXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlMHNoYXJlZFByb2Nlc3NBbGxvY2F0aW9uXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJTaGFyZWQgUHJvY2VzcyBBbGxvY2F0aW9uICVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2UwZXF1aXBtZW50SGVhZGVyXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJibG9ja2hlYWRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2xhc3NOYW1lXCI6IFwic3ViaGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkVxdWlwbWVudCBBdmFpbGFiaWxpdHlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2UwdG90YWxEdXJhdGlvbk9mUHJvZHVjdGlvblJ1blwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiVG90YWwgRHVyYXRpb24gb2YgUHJvZHVjdGlvbiBSdW5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIobWludXRlcylcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2UwZXF1aXBUb3RhbFBsYW5uZWREb3dudGltZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiVG90YWwgUGxhbm5lZCBEb3dudGltZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIihpbiBtaW51dGVzKSAoaW5jIGJyZWFrcywgZXRjKVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTBlcXVpcE5ldEF2YWlsYWJsZVRpbWVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIk5ldCBBdmFpbGFibGUgVGltZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIihtaW51dGVzKVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTBzaGFyZWRFcXVpcENoYW5nZW92ZXJcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlNoYXJlZCBFcXVpcG1lbnQgQ2hhbmdlb3ZlciBUaW1lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiKG1pbnV0ZXMpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlMHRvdGFsVW5wbGFubmVkRG93bnRpbWVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlRvdGFsIFVucGxhbm5lZCBEb3dudGltZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIihtaW5zKVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTBhY3R1YWxQcm9kdWN0aW9uVGltZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiQWN0dWFsIFByb2R1Y3Rpb24gVGltZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIihtaW51dGVzKVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTBlcXVpcG1lbnRBdmFpbGFiaWxpdHlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkVxdWlwbWVudCBBdmFpbGFiaWxpdHkgJVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTBwZXJmb3JtYW5jZUhlYWRlclwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiYmxvY2toZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNsYXNzTmFtZVwiOiBcInN1YmhlYWRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJQZXJmb3JtYW5jZSBFZmZpY2llbmN5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlMHRvdGFsUGFydHNSdW5cIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlRvdGFsIFBhcnRzIFJ1blwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIihHb29kLCBSZWplY3RlZClcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2UwcGVyZk5ldElkZWFsQ3ljbGVUaW1lXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJOZXQgSWRlYWwgQ3ljbGUgVGltZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIihzZWNvbmRzL3BhcnQpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlMHBlcmZvcm1hbmNlRWZmaWNpZW5jeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUGVyZm9ybWFuY2UgRWZmaWNpZW5jeSAlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlMGF2YWlsYWJpbGl0eUFuZFBFTG9zc2VzTm90Q2FwdHVyZWRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkF2YWlsYWJpbGl0eSBhbmQvb3IgUGVyZiBFZmZpY2llbmN5IExvc3Nlc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIk5vdCBDYXB0dXJlZCAobWludXRlcylcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2UwcXVhbGl0eVJhdGVIZWFkZXJcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImJsb2NraGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjbGFzc05hbWVcIjogXCJzdWJoZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUXVhbGl0eSBSYXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlMG51bWJlck9mUGFydHNSZWplY3RlZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiTnVtYmVyIG9mIFBhcnRzIFJlamVjdGVkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlMG51bWJlck9mUGFydHNSZXdvcmtlZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiTnVtYmVyIG9mIFBhcnRzIFJld29ya2VkICYgQWNjZXB0ZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2UwcmlnaHRGaXJzdFRpbWVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlJpZ2h0IEZpcnN0IFRpbWUgUXVhbGl0eSBSYXRlICVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIoaW5jLiByZXdvcmtlZCBwYXJ0cylcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2UwZmlyc3RUaW1lVGhyb3VnaFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiRmlyc3QgVGltZSBUaHJvdWdoIFF1YWxpdHkgUmF0ZSAlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlMG9lZUhlYWRlclwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiYmxvY2toZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNsYXNzTmFtZVwiOiBcInN1YmhlYWRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJPdmVyYWwgRXF1aXBtZW50IEVmZmVjdGl2ZW5lc3MgKE9FRSlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2Uwb2VlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJPRUUgJVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTB3ZWVrbHlIZWFkZXJcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImJsb2NraGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjbGFzc05hbWVcIjogXCJzdWJoZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiV2Vla2x5IG9yIEhvdXJseSBQYXJ0cyBBdmFpbCBmb3IgU2hpcG1lbnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2UwcHJvY2Vzc1NwZWNpZmljV2Vla1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUHJvY2VzcyBTcGVjaWZpYyBXZWVrbHkgUGFydCBFc3RpbWF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTBwcm9jZXNzU3BlY2lmaWNIb3VyXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJQcm9jZXNzIFNwZWNpZmljIEVzdGltYXRlIFBlciBIb3VyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlMHByb2Nlc3NTcGVjaWZpY0RheVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUHJvY2VzcyBTcGVjaWZpYyBFc3RpbWF0ZSBQZXIgRGF5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlMHByb2Nlc3NIZWFkZXJcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImJsb2NraGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjbGFzc05hbWVcIjogXCJzdWJoZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUHJvY2VzcyBUb3RhbCBBY3R1YWwgQ3ljbGUgVGltZSAoc2VjL3BhcnQpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlMG9ic2VydmVkQ3ljbGVUaW1lXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJPYnNlcnZlZCBBdmVyYWdlIEN5Y2xlIFRpbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIoc2VjL2N5Y2xlKVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTBhbmFseXNpc0hlYWRlclwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiYmxvY2toZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNsYXNzTmFtZVwiOiBcInN1YmhlYWRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJBbmFseXNpcyBvZiBSdW4gQCBSYXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlMGpsckRlbWFuZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiSkxSIERlbWFuZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTBwYXJ0c0F2YWlsYWJsZUZvclNoaXBtZW50XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJXZWVrbHkgUGFydHMgQXZhaWxhYmxlIGZvciBTaGlwbWVudFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTBwZXJjZW50YWdlSkxSRGVtYW5kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJQZXJjZW50YWdlIEFib3ZlL0JlbG93IEpMUiBEZW1hbmRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlM1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImJsb2NrXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaXRlbXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTNIZWFkZXJcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImJsb2NraGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlBoYXNlIDNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2UzcHJvZHVjdGlvblJ1bkhlYWRlclwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiYmxvY2toZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNsYXNzTmFtZVwiOiBcInN1YmhlYWRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJTdXBwbGllciBEZW1vbnN0cmF0ZWQgLSBQcm9kdWN0aW9uIFJ1blwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTNzaGFyZWRQcm9jZXNzQWxsb2NhdGlvblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiU2hhcmVkIFByb2Nlc3MgQWxsb2NhdGlvbiAlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlM2VxdWlwbWVudEhlYWRlclwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiYmxvY2toZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNsYXNzTmFtZVwiOiBcInN1YmhlYWRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJFcXVpcG1lbnQgQXZhaWxhYmlsaXR5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlM3RvdGFsRHVyYXRpb25PZlByb2R1Y3Rpb25SdW5cIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlRvdGFsIER1cmF0aW9uIG9mIFByb2R1Y3Rpb24gUnVuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiKG1pbnV0ZXMpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlM2VxdWlwVG90YWxQbGFubmVkRG93bnRpbWVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlRvdGFsIFBsYW5uZWQgRG93bnRpbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIoaW4gbWludXRlcykgKGluYyBicmVha3MsIGV0YylcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2UzZXF1aXBOZXRBdmFpbGFibGVUaW1lXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJOZXQgQXZhaWxhYmxlIFRpbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIobWludXRlcylcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2Uzc2hhcmVkRXF1aXBDaGFuZ2VvdmVyXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJTaGFyZWQgRXF1aXBtZW50IENoYW5nZW92ZXIgVGltZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIihtaW51dGVzKVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTN0b3RhbFVucGxhbm5lZERvd250aW1lXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJUb3RhbCBVbnBsYW5uZWQgRG93bnRpbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIobWlucylcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2UzYWN0dWFsUHJvZHVjdGlvblRpbWVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkFjdHVhbCBQcm9kdWN0aW9uIFRpbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIobWludXRlcylcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2UzZXF1aXBtZW50QXZhaWxhYmlsaXR5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJFcXVpcG1lbnQgQXZhaWxhYmlsaXR5ICVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2UzcGVyZm9ybWFuY2VIZWFkZXJcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImJsb2NraGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjbGFzc05hbWVcIjogXCJzdWJoZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUGVyZm9ybWFuY2UgRWZmaWNpZW5jeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTN0b3RhbFBhcnRzUnVuXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJUb3RhbCBQYXJ0cyBSdW5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIoR29vZCwgUmVqZWN0ZWQpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlM3BlcmZOZXRJZGVhbEN5Y2xlVGltZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiTmV0IElkZWFsIEN5Y2xlIFRpbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIoc2Vjb25kcy9wYXJ0KVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTNwZXJmb3JtYW5jZUVmZmljaWVuY3lcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlBlcmZvcm1hbmNlIEVmZmljaWVuY3kgJVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTNxdWFsaXR5UmF0ZUhlYWRlclwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiYmxvY2toZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNsYXNzTmFtZVwiOiBcInN1YmhlYWRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJRdWFsaXR5IFJhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2UzbnVtYmVyT2ZQYXJ0c1JlamVjdGVkXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJOdW1iZXIgb2YgUGFydHMgUmVqZWN0ZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2UzbnVtYmVyT2ZQYXJ0c1Jld29ya2VkXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJOdW1iZXIgb2YgUGFydHMgUmV3b3JrZWQgJiBBY2NlcHRlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTNyaWdodEZpcnN0VGltZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUmlnaHQgRmlyc3QgVGltZSBRdWFsaXR5IFJhdGUgJVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIihpbmMuIHJld29ya2VkIHBhcnRzKVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTNmaXJzdFRpbWVUaHJvdWdoXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJGaXJzdCBUaW1lIFRocm91Z2ggUXVhbGl0eSBSYXRlICVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2Uzb2VlSGVhZGVyXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJibG9ja2hlYWRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2xhc3NOYW1lXCI6IFwic3ViaGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIk92ZXJhbCBFcXVpcG1lbnQgRWZmZWN0aXZlbmVzcyAoT0VFKVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTNvZWVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIk9FRSAlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlM3dlZWtseUhlYWRlclwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiYmxvY2toZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNsYXNzTmFtZVwiOiBcInN1YmhlYWRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJXZWVrbHkgb3IgSG91cmx5IFBhcnRzIEF2YWlsIGZvciBTaGlwbWVudFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaGFzZTNwcm9jZXNzU3BlY2lmaWNXZWVrXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJQcm9jZXNzIFNwZWNpZmljIFdlZWtseSBQYXJ0IEVzdGltYXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlM3Byb2Nlc3NTcGVjaWZpY0hvdXJcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlByb2Nlc3MgU3BlY2lmaWMgRXN0aW1hdGUgUGVyIEhvdXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2UzcHJvY2Vzc1NwZWNpZmljRGF5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJQcm9jZXNzIFNwZWNpZmljIEVzdGltYXRlIFBlciBEYXlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2UzcHJvY2Vzc0hlYWRlclwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiYmxvY2toZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNsYXNzTmFtZVwiOiBcInN1YmhlYWRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJQcm9jZXNzIFRvdGFsIEFjdHVhbCBDeWNsZSBUaW1lIChzZWMvcGFydClcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2Uzb2JzZXJ2ZWRDeWNsZVRpbWVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIk9ic2VydmVkIEF2ZXJhZ2UgQ3ljbGUgVGltZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIihzZWMvY3ljbGUpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlM2FuYWx5c2lzSGVhZGVyXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJibG9ja2hlYWRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2xhc3NOYW1lXCI6IFwic3ViaGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkFuYWx5c2lzIG9mIFJ1biBAIFJhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhhc2UzamxyRGVtYW5kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJKTFIgRGVtYW5kXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlM3BhcnRzQXZhaWxhYmxlRm9yU2hpcG1lbnRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIldlZWtseSBQYXJ0cyBBdmFpbGFibGUgZm9yIFNoaXBtZW50XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBoYXNlM3BlcmNlbnRhZ2VKTFJEZW1hbmRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlBlcmNlbnRhZ2UgQWJvdmUvQmVsb3cgSkxSIERlbWFuZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2FwYWNpdHlDb25maXJtYXRpb25cIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJibG9ja1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIml0ZW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2FwQ29uZkhlYWRlclwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiYmxvY2toZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiQ2FwYWNpdHkgQ29uZmlybWF0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNhcENvbmZwcm9kdWN0aW9uUnVuSGVhZGVyXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJibG9ja2hlYWRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2xhc3NOYW1lXCI6IFwic3ViaGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlN1cHBsaWVyIERlbW9uc3RyYXRlZCAtIFByb2R1Y3Rpb24gUnVuXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNhcENvbmZzaGFyZWRQcm9jZXNzQWxsb2NhdGlvblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiU2hhcmVkIFByb2Nlc3MgQWxsb2NhdGlvbiAlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNhcENvbmZlcXVpcG1lbnRIZWFkZXJcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImJsb2NraGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjbGFzc05hbWVcIjogXCJzdWJoZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiRXF1aXBtZW50IEF2YWlsYWJpbGl0eVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYXBDb25mdG90YWxEdXJhdGlvbk9mUHJvZHVjdGlvblJ1blwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiVG90YWwgRHVyYXRpb24gb2YgUHJvZHVjdGlvbiBSdW5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIobWludXRlcylcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2FwQ29uZmVxdWlwVG90YWxQbGFubmVkRG93bnRpbWVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlRvdGFsIFBsYW5uZWQgRG93bnRpbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIoaW4gbWludXRlcykgKGluYyBicmVha3MsIGV0YylcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2FwQ29uZmVxdWlwTmV0QXZhaWxhYmxlVGltZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiTmV0IEF2YWlsYWJsZSBUaW1lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiKG1pbnV0ZXMpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNhcENvbmZzaGFyZWRFcXVpcENoYW5nZW92ZXJcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlNoYXJlZCBFcXVpcG1lbnQgQ2hhbmdlb3ZlciBUaW1lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiKG1pbnV0ZXMpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNhcENvbmZ0b3RhbFVucGxhbm5lZERvd250aW1lXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJUb3RhbCBVbnBsYW5uZWQgRG93bnRpbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIobWlucylcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2FwQ29uZmFjdHVhbFByb2R1Y3Rpb25UaW1lXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJBY3R1YWwgUHJvZHVjdGlvbiBUaW1lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiKG1pbnV0ZXMpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNhcENvbmZlcXVpcG1lbnRBdmFpbGFiaWxpdHlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkVxdWlwbWVudCBBdmFpbGFiaWxpdHkgJVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYXBDb25mcGVyZm9ybWFuY2VIZWFkZXJcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImJsb2NraGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjbGFzc05hbWVcIjogXCJzdWJoZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUGVyZm9ybWFuY2UgRWZmaWNpZW5jeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYXBDb25mdG90YWxQYXJ0c1J1blwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiVG90YWwgUGFydHMgUnVuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiKEdvb2QsIFJlamVjdGVkKVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYXBDb25mcGVyZk5ldElkZWFsQ3ljbGVUaW1lXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJOZXQgSWRlYWwgQ3ljbGUgVGltZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIihzZWNvbmRzL3BhcnQpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNhcENvbmZwZXJmb3JtYW5jZUVmZmljaWVuY3lcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlBlcmZvcm1hbmNlIEVmZmljaWVuY3kgJVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYXBDb25mcXVhbGl0eVJhdGVIZWFkZXJcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImJsb2NraGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjbGFzc05hbWVcIjogXCJzdWJoZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUXVhbGl0eSBSYXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNhcENvbmZudW1iZXJPZlBhcnRzUmVqZWN0ZWRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIk51bWJlciBvZiBQYXJ0cyBSZWplY3RlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYXBDb25mbnVtYmVyT2ZQYXJ0c1Jld29ya2VkXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJOdW1iZXIgb2YgUGFydHMgUmV3b3JrZWQgJiBBY2NlcHRlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYXBDb25mcmlnaHRGaXJzdFRpbWVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlJpZ2h0IEZpcnN0IFRpbWUgUXVhbGl0eSBSYXRlICVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIoaW5jLiByZXdvcmtlZCBwYXJ0cylcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2FwQ29uZmZpcnN0VGltZVRocm91Z2hcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkZpcnN0IFRpbWUgVGhyb3VnaCBRdWFsaXR5IFJhdGUgJVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYXBDb25mb2VlSGVhZGVyXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJibG9ja2hlYWRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2xhc3NOYW1lXCI6IFwic3ViaGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIk92ZXJhbCBFcXVpcG1lbnQgRWZmZWN0aXZlbmVzcyAoT0VFKVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYXBDb25mb2VlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJPRUUgJVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYXBDb25md2Vla2x5SGVhZGVyXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJibG9ja2hlYWRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2xhc3NOYW1lXCI6IFwic3ViaGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIldlZWtseSBvciBIb3VybHkgUGFydHMgQXZhaWwgZm9yIFNoaXBtZW50XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNhcENvbmZwcm9jZXNzU3BlY2lmaWNXZWVrXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJQcm9jZXNzIFNwZWNpZmljIFdlZWtseSBQYXJ0IEVzdGltYXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNhcENvbmZwcm9jZXNzU3BlY2lmaWNIb3VyXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJQcm9jZXNzIFNwZWNpZmljIEVzdGltYXRlIFBlciBIb3VyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNhcENvbmZwcm9jZXNzU3BlY2lmaWNEYXlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImlucHV0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlByb2Nlc3MgU3BlY2lmaWMgRXN0aW1hdGUgUGVyIERheVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYXBDb25mcHJvY2Vzc0hlYWRlclwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiYmxvY2toZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNsYXNzTmFtZVwiOiBcInN1YmhlYWRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJQcm9jZXNzIFRvdGFsIEFjdHVhbCBDeWNsZSBUaW1lIChzZWMvcGFydClcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2FwQ29uZm9ic2VydmVkQ3ljbGVUaW1lXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJPYnNlcnZlZCBBdmVyYWdlIEN5Y2xlIFRpbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIoc2VjL2N5Y2xlKVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYXBDb25mYW5hbHlzaXNIZWFkZXJcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImJsb2NraGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjbGFzc05hbWVcIjogXCJzdWJoZWFkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiQW5hbHlzaXMgb2YgUnVuIEAgUmF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYXBDb25mamxyRGVtYW5kXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJKTFIgRGVtYW5kXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNhcENvbmZwYXJ0c0F2YWlsYWJsZUZvclNoaXBtZW50XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJpbnB1dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJXZWVrbHkgUGFydHMgQXZhaWxhYmxlIGZvciBTaGlwbWVudFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYXBDb25mcGVyY2VudGFnZUpMUkRlbWFuZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5wdXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhYmVsXCI6IFwiUGVyY2VudGFnZSBBYm92ZS9CZWxvdyBKTFIgRGVtYW5kXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInN1bW1hcnlcIjoge1xuICAgICAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHggMTVweFwiLFxuICAgICAgICAgICAgICAgIFwidGl0bGVcIjogXCJTdW1tYXJ5XCIsXG4gICAgICAgICAgICAgICAgXCJpdGVtc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwic3VtbWFyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwic3VtbWFyeVRhYlwiXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiY29sXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImNvbHVtblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzcGFuXCI6IDIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIml0ZW1zXCI6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzaWduYXR1cmVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJzaWduXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxcIjogXCJEZWNsZXJhdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRlc2NcIjogXCJJIGhlcmVieSBjb25maXJtIHRoYXQgSSBoYXZlIHRoZSByaWdodCBhbmQgYXV0aG9yaXR5IHRvIGZpbGwgaW4gdGhpcyBkb2N1bWVudCBvbiBiZWhhbGYgb2YgdGhlIHN1cHBsaWVyIGNvbXBhbnkgbWVudGlvbmVkIGFib3ZlLiBUaGUgaW5mb3JtYXRpb24gSSBoYXZlIGdpdmVuIGlzIHRydWUgYW5kIGFjY3VyYXRlIHRvIHRoZSBiZXN0IG9mIG15IGtub3dsZWRnZS4gU3ViIFRpZXIgQ29tcG9uZW50czogSW4gYWRkaXRpb24gdG8gdGhlIGRhdGEgY29udGFpbmVkIGluIHRoZSByZXBvcnQsIHRoZSBTdXBwbGllciBBdXRob3Jpc2VkIFJlcHJlc2VudGF0aXZlIGFwcHJvdmFsIGNvbmZpcm1zIHRoYXQgYWxsIHN1Yi10aWVyIGNvbXBvbmVudHMgdXNlZCBpbiB0aGUgYXNzZW1ibHkgb2YgdGhlc2UgY29tcG9uZW50cyBhcmUgYWxzbyBhcHByb3ZlZCB0byB0aGUgcmVsZXZhbnQgUHJvZHVjdGlvbiBSdW4gaS5lLiBSdW4gYXQgUmF0ZSAoUGhhc2UgMCkgb3IgQ2FwYWNpdHkgQ29uZmlybWF0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFwiYnV0dG9uQ29udGFpbmVyXCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiYnV0dG9uQ29udGFpbmVyXCIsXG4gICAgICAgIFwiaXRlbXNcIjoge1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZm9ybTsiLCJ2YXIgY29udHJvbGxlciA9IHtcblx0dm9sdW1lVG90YWw6IHtcblx0XHRkaXNhYmxlZDogdHJ1ZVxuXHR9LFxuXHRvdGhlclZvbHVtZVRvdGFsOiB7XG5cdFx0ZGlzYWJsZWQ6IHRydWVcblx0fSxcblx0cHJvY2Vzc2VzOiB7XG5cdFx0dG90YWxQbGFubmVkRG93bnRpbWU6IHtcblx0XHRcdGRpc2FibGVkOiB0cnVlXG5cdFx0fSxcblx0XHRuZXRBdmFpbGFibGVUaW1lOiB7XG5cdFx0XHRkaXNhYmxlZDogdHJ1ZVxuXHRcdH0sXG5cdFx0cmVxdWlyZWRHb29kUGFydHNQZXJXZWVrOiB7XG5cdFx0XHRkaXNhYmxlZDogdHJ1ZVxuXHRcdH0sXG5cdFx0bmV0SWRlYWxDeWNsZVRpbWU6IHtcblx0XHRcdGRpc2FibGVkOiB0cnVlXG5cdFx0fSxcblx0XHRwbGFubmVkUHJvZHVjdGlvblBlcldlZWs6IHtcblx0XHRcdGRpc2FibGVkOiB0cnVlXG5cdFx0fSxcblx0XHRyZXF1aXJlZE9FRToge1xuXHRcdFx0ZGlzYWJsZWQ6IHRydWVcblx0XHR9LFxuXHRcdHBsYW5uZWRQcm9kdWN0aW9uUGVySG91cjoge1xuXHRcdFx0ZGlzYWJsZWQ6IHRydWVcblx0XHR9LFxuXHRcdHBsYW5uZWRQcm9kdWN0aW9uUGVyRGF5OiB7XG5cdFx0XHRkaXNhYmxlZDogdHJ1ZVxuXHRcdH0sXG5cdFx0cGhhc2UwZXF1aXBOZXRBdmFpbGFibGVUaW1lOiB7XG5cdFx0XHRkaXNhYmxlZDogdHJ1ZVxuXHRcdH0sXG5cdFx0cGhhc2UzZXF1aXBOZXRBdmFpbGFibGVUaW1lOiB7XG5cdFx0XHRkaXNhYmxlZDogdHJ1ZVxuXHRcdH0sXG5cdFx0Y2FwQ29uZmVxdWlwTmV0QXZhaWxhYmxlVGltZToge1xuXHRcdFx0ZGlzYWJsZWQ6IHRydWVcblx0XHR9LFxuXHRcdHBoYXNlMGFjdHVhbFByb2R1Y3Rpb25UaW1lOiB7XG5cdFx0XHRkaXNhYmxlZDogdHJ1ZVxuXHRcdH0sXG5cdFx0cGhhc2UzYWN0dWFsUHJvZHVjdGlvblRpbWU6IHtcblx0XHRcdGRpc2FibGVkOiB0cnVlXG5cdFx0fSxcblx0XHRjYXBDb25mYWN0dWFsUHJvZHVjdGlvblRpbWU6IHtcblx0XHRcdGRpc2FibGVkOiB0cnVlXG5cdFx0fSxcblx0XHR0b3RhbFBlcmNlbnRhZ2VBbGxvY2F0aW9uOiB7XG5cdFx0XHRkaXNhYmxlZDogdHJ1ZVxuXHRcdH0sXG5cdFx0cGhhc2UwZXF1aXBtZW50QXZhaWxhYmlsaXR5OiB7XG5cdFx0XHRkaXNhYmxlZDogdHJ1ZVxuXHRcdH0sXG5cdFx0cGhhc2UzZXF1aXBtZW50QXZhaWxhYmlsaXR5OiB7XG5cdFx0XHRkaXNhYmxlZDogdHJ1ZVxuXHRcdH0sXG5cdFx0Y2FwQ29uZmVxdWlwbWVudEF2YWlsYWJpbGl0eToge1xuXHRcdFx0ZGlzYWJsZWQ6IHRydWVcblx0XHR9LFxuXHRcdHBoYXNlMHBlcmZvcm1hbmNlRWZmaWNpZW5jeToge1xuXHRcdFx0ZGlzYWJsZWQ6IHRydWVcblx0XHR9LFxuXHRcdHBoYXNlM3BlcmZvcm1hbmNlRWZmaWNpZW5jeToge1xuXHRcdFx0ZGlzYWJsZWQ6IHRydWVcblx0XHR9LFxuXHRcdGNhcENvbmZwZXJmb3JtYW5jZUVmZmljaWVuY3k6IHtcblx0XHRcdGRpc2FibGVkOiB0cnVlXG5cdFx0fSxcblx0XHRwaGFzZTBhdmFpbGFiaWxpdHlBbmRQRUxvc3Nlc05vdENhcHR1cmVkOiB7XG5cdFx0XHRkaXNhYmxlZDogdHJ1ZVxuXHRcdH0sXG5cdFx0cGhhc2UzYXZhaWxhYmlsaXR5QW5kUEVMb3NzZXNOb3RDYXB0dXJlZDoge1xuXHRcdFx0ZGlzYWJsZWQ6IHRydWVcblx0XHR9LFxuXHRcdGNhcENvbmZhdmFpbGFiaWxpdHlBbmRQRUxvc3Nlc05vdENhcHR1cmVkOiB7XG5cdFx0XHRkaXNhYmxlZDogdHJ1ZVxuXHRcdH0sXG5cdFx0cGhhc2UwcmlnaHRGaXJzdFRpbWU6IHtcblx0XHRcdGRpc2FibGVkOiB0cnVlXG5cdFx0fSxcblx0XHRwaGFzZTNyaWdodEZpcnN0VGltZToge1xuXHRcdFx0ZGlzYWJsZWQ6IHRydWVcblx0XHR9LFxuXHRcdGNhcENvbmZyaWdodEZpcnN0VGltZToge1xuXHRcdFx0ZGlzYWJsZWQ6IHRydWVcblx0XHR9LFxuXHRcdHBoYXNlMGZpcnN0VGltZVRocm91Z2g6IHtcblx0XHRcdGRpc2FibGVkOiB0cnVlXG5cdFx0fSxcblx0XHRwaGFzZTNmaXJzdFRpbWVUaHJvdWdoOiB7XG5cdFx0XHRkaXNhYmxlZDogdHJ1ZVxuXHRcdH0sXG5cdFx0Y2FwQ29uZmZpcnN0VGltZVRocm91Z2g6IHtcblx0XHRcdGRpc2FibGVkOiB0cnVlXG5cdFx0fSxcblx0XHRwaGFzZTBvZWU6IHtcblx0XHRcdGRpc2FibGVkOiB0cnVlXG5cdFx0fSxcblx0XHRwaGFzZTNvZWU6IHtcblx0XHRcdGRpc2FibGVkOiB0cnVlXG5cdFx0fSxcblx0XHRjYXBDb25mb2VlOiB7XG5cdFx0XHRkaXNhYmxlZDogdHJ1ZVxuXHRcdH0sXG5cdFx0cGhhc2UwcHJvY2Vzc1NwZWNpZmljV2Vlazoge1xuXHRcdFx0ZGlzYWJsZWQ6IHRydWVcblx0XHR9LFxuXHRcdHBoYXNlM3Byb2Nlc3NTcGVjaWZpY1dlZWs6IHtcblx0XHRcdGRpc2FibGVkOiB0cnVlXG5cdFx0fSxcblx0XHRjYXBDb25mcHJvY2Vzc1NwZWNpZmljV2Vlazoge1xuXHRcdFx0ZGlzYWJsZWQ6IHRydWVcblx0XHR9LFxuXHRcdHBoYXNlMHByb2Nlc3NTcGVjaWZpY0hvdXI6IHtcblx0XHRcdGRpc2FibGVkOiB0cnVlXG5cdFx0fSxcblx0XHRwaGFzZTNwcm9jZXNzU3BlY2lmaWNIb3VyOiB7XG5cdFx0XHRkaXNhYmxlZDogdHJ1ZVxuXHRcdH0sXG5cdFx0Y2FwQ29uZnByb2Nlc3NTcGVjaWZpY0hvdXI6IHtcblx0XHRcdGRpc2FibGVkOiB0cnVlXG5cdFx0fSxcblx0XHRwaGFzZTBwcm9jZXNzU3BlY2lmaWNEYXk6IHtcblx0XHRcdGRpc2FibGVkOiB0cnVlXG5cdFx0fSxcblx0XHRwaGFzZTNwcm9jZXNzU3BlY2lmaWNEYXk6IHtcblx0XHRcdGRpc2FibGVkOiB0cnVlXG5cdFx0fSxcblx0XHRjYXBDb25mcHJvY2Vzc1NwZWNpZmljRGF5OiB7XG5cdFx0XHRkaXNhYmxlZDogdHJ1ZVxuXHRcdH0sXG5cdFx0cGhhc2Uwb2JzZXJ2ZWRDeWNsZVRpbWU6IHtcblx0XHRcdGRpc2FibGVkOiB0cnVlXG5cdFx0fSxcblx0XHRwaGFzZTNvYnNlcnZlZEN5Y2xlVGltZToge1xuXHRcdFx0ZGlzYWJsZWQ6IHRydWVcblx0XHR9LFxuXHRcdGNhcENvbmZvYnNlcnZlZEN5Y2xlVGltZToge1xuXHRcdFx0ZGlzYWJsZWQ6IHRydWVcblx0XHR9LFxuXHRcdHBoYXNlMGpsckRlbWFuZDoge1xuXHRcdFx0ZGlzYWJsZWQ6IHRydWVcblx0XHR9LFxuXHRcdHBoYXNlM2psckRlbWFuZDoge1xuXHRcdFx0ZGlzYWJsZWQ6IHRydWVcblx0XHR9LFxuXHRcdGNhcENvbmZqbHJEZW1hbmQ6IHtcblx0XHRcdGRpc2FibGVkOiB0cnVlXG5cdFx0fSxcblx0XHRwaGFzZTBwYXJ0c0F2YWlsYWJsZUZvclNoaXBtZW50OiB7XG5cdFx0XHRkaXNhYmxlZDogdHJ1ZVxuXHRcdH0sXG5cdFx0cGhhc2UzcGFydHNBdmFpbGFibGVGb3JTaGlwbWVudDoge1xuXHRcdFx0ZGlzYWJsZWQ6IHRydWVcblx0XHR9LFxuXHRcdGNhcENvbmZwYXJ0c0F2YWlsYWJsZUZvclNoaXBtZW50OiB7XG5cdFx0XHRkaXNhYmxlZDogdHJ1ZVxuXHRcdH0sXG5cdFx0cGhhc2UwcGVyY2VudGFnZUpMUkRlbWFuZDoge1xuXHRcdFx0ZGlzYWJsZWQ6IHRydWVcblx0XHR9LFxuXHRcdHBoYXNlM3BlcmNlbnRhZ2VKTFJEZW1hbmQ6IHtcblx0XHRcdGRpc2FibGVkOiB0cnVlXG5cdFx0fSxcblx0XHRjYXBDb25mcGVyY2VudGFnZUpMUkRlbWFuZDoge1xuXHRcdFx0ZGlzYWJsZWQ6IHRydWVcblx0XHR9XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNvbnRyb2xsZXI7IiwiaW1wb3J0IGJsb2Nrc0FjdGlvbnMgZnJvbSAnLi4vYWN0aW9ucy9ibG9ja3MnO1xuaW1wb3J0IHJvdXRlclN0b3JlIGZyb20gJy4uL3JvdXRlci9zdG9yZXMvcm91dGVyJztcbmltcG9ydCBhbGVydCBmcm9tICcuLi9hY3Rpb25zL2FsZXJ0JztcblxudmFyIGxpc3RlbmVycyA9IGZ1bmN0aW9uIChmb3JtKSB7XG5cbiAgICB2YXIgbW9kZWwgPSBmb3JtLm1vZGVsO1xuICAgIHZhciB2aWV3ID0gZm9ybS52aWV3O1xuICAgIHZhciBwYXJ0cyA9IFtcImwzNTlcIiwgXCJsMzE5XCIsIFwibDMxNlwiLCBcImw1MzhcIiwgXCJsNTUwXCIsIFwibDQ1MFwiLCBcImw0NjBcIiwgXCJsNDk0XCIsIFwibDQ2MlwiLCBcIng3NjBcIiwgXCJ4MjYwXCIsIFwieDE1MFwiLCBcIngxNTJcIiwgXCJ4MjUwXCIsIFwieDM1MVwiXTtcblxuICAgIG1vZGVsLmZpbmQoJ3ZvbHVtZVRvdGFsJykuc2V0VmFsdWUoIGZ1bmN0aW9uKCApIHtcbiAgICAgICAgdmFyIHRvdGFsID0gMDtcbiAgICAgICAgcGFydHMuZm9yRWFjaCggZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG4gICAgICAgICAgICB2YXIgbW9kZWxWYWx1ZSA9IG1vZGVsLmZpbmQoIGVsZW1lbnQgKTtcblxuICAgICAgICAgICAgaWYoIG1vZGVsVmFsdWVbMF0gKSB7XG4gICAgICAgICAgICAgICAgdG90YWwgKz0gbW9kZWxWYWx1ZVswXS52YWx1ZSAqIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gKTtcbiAgICAgICAgcmV0dXJuIHRvdGFsO1xuICAgIH0gKTtcblxuICAgIG1vZGVsLmZpbmQoJ290aGVyVm9sdW1lVG90YWwnKS5zZXRWYWx1ZSggZnVuY3Rpb24oICkge1xuICAgICAgICB2YXIgdG90YWwgPSAwO1xuXG4gICAgICAgIHBhcnRzLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuICAgICAgICAgICAgdmFyIG1vZGVsVmFsdWUgPSBtb2RlbC5maW5kKCAnb3RoZXInICsgZWxlbWVudCApO1xuXG4gICAgICAgICAgICBpZiggbW9kZWxWYWx1ZVswXSApIHtcbiAgICAgICAgICAgICAgICB0b3RhbCArPSBtb2RlbFZhbHVlWzBdLnZhbHVlICogMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuICAgICAgICByZXR1cm4gdG90YWw7XG4gICAgfSApO1xuXG4gICAgbW9kZWwuZmluZCgncGFydFR5cGUnKS5vYnNlcnZlKCBmdW5jdGlvbiggbmV3VmFsICkge1xuICAgICAgICB2YXIgcGVyaW9kO1xuICAgICAgICBpZiggbmV3VmFsID09PSAnc2VxdWVuY2VkJyApIHtcbiAgICAgICAgICAgIHBlcmlvZCA9ICcgSG91cmx5JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBlcmlvZCA9ICcgV2Vla2x5JztcbiAgICAgICAgfVxuXG4gICAgICAgIHBhcnRzLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuICAgICAgICAgICAgdmFyIGl0ZW1zVmlldyA9IHZpZXcuZmluZCgndGFicy5wYXJ0LnZvbHVtZVRvdGFscycpWzBdO1xuXG4gICAgICAgICAgICBpZiggaXRlbXNWaWV3Lml0ZW1zW2VsZW1lbnRdICkge1xuICAgICAgICAgICAgICAgIGl0ZW1zVmlldy5pdGVtc1tlbGVtZW50XS5sYWJlbCA9IGVsZW1lbnQgKyBwZXJpb2QgKyAnIFZvbHVtZSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBpdGVtc1ZpZXcgPSB2aWV3LmZpbmQoJ3RhYnMucGFydC5vdGhlclZvbHVtZVRvdGFscycpWzBdO1xuXG4gICAgICAgICAgICBpZiggaXRlbXNWaWV3Lml0ZW1zWydvdGhlcicgKyBlbGVtZW50XSApIHtcbiAgICAgICAgICAgICAgICBpdGVtc1ZpZXcuaXRlbXNbJ290aGVyJyArIGVsZW1lbnRdLmxhYmVsID0gZWxlbWVudCArIHBlcmlvZCArICcgVm9sdW1lJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuICAgIH0gKTtcblxuICAgIG1vZGVsLmZpbmQoJ3N0dWR5U3VibWl0dGVkRm9yJykub2JzZXJ2ZSggZnVuY3Rpb24oIG5ld1ZhbCwgb2xkVmFsLCBkaWZmICkge1xuXG4gICAgICAgIHZhciBzdWZmaXggPSB2aWV3LmZpbmQoJ3RhYnMucGFydC52b2x1bWVUb3RhbHMnKTtcblxuICAgICAgICB2YXIgc2VxdWVuY2VkID0gbW9kZWwuZmluZCgncGFydFR5cGUnKVswXTtcblxuICAgICAgICBpZiggZGlmZiApIHtcbiAgICAgICAgICAgIGRpZmYuZm9yRWFjaCggZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG4gICAgICAgICAgICAgICAgaWYoIGVsZW1lbnQuYWN0aW9uID09PSAncmVtb3ZlZCcgKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1ZmZpeC5kZXN0cm95KGVsZW1lbnQudmFsdWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IGVsZW1lbnQudmFsdWU7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoIHNlcXVlbmNlZC52YWx1ZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsICs9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXF1ZW5jZWQ6ICcgSG91cmx5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub246ICcgV2Vla2x5J1xuICAgICAgICAgICAgICAgICAgICAgICAgfVsgc2VxdWVuY2VkLnZhbHVlIF07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsYWJlbCArPSAnIFZvbHVtZSc7XG5cbiAgICAgICAgICAgICAgICAgICAgc3VmZml4LmFwcGVuZChlbGVtZW50LnZhbHVlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5wdXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuICAgIH0gKTtcblxuICAgIG1vZGVsLmZpbmQoJ290aGVyU3R1ZHlTdWJtaXR0ZWRGb3InKS5vYnNlcnZlKCBmdW5jdGlvbiggbmV3VmFsLCBvbGRWYWwsIGRpZmYgKSB7XG4gICAgICAgIHZhciBzdWZmaXggPSB2aWV3LmZpbmQoJ3RhYnMucGFydC5vdGhlclZvbHVtZVRvdGFscycpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKHN1ZmZpeCwgZGlmZik7XG5cbiAgICAgICAgdmFyIHNlcXVlbmNlZCA9IG1vZGVsLmZpbmQoJ3BhcnRUeXBlJylbMF07XG5cbiAgICAgICAgaWYoIGRpZmYgKSB7XG4gICAgICAgICAgICBkaWZmLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuICAgICAgICAgICAgICAgIGlmKCBlbGVtZW50LmFjdGlvbiA9PT0gJ3JlbW92ZWQnICkge1xuICAgICAgICAgICAgICAgICAgICBzdWZmaXguZGVzdHJveSgnb3RoZXInICsgZWxlbWVudC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gZWxlbWVudC52YWx1ZTtcblxuICAgICAgICAgICAgICAgICAgICBpZiggc2VxdWVuY2VkLnZhbHVlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgKz0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcXVlbmNlZDogJyBIb3VybHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vbjogJyBXZWVrbHknXG4gICAgICAgICAgICAgICAgICAgICAgICB9WyBzZXF1ZW5jZWQudmFsdWUgXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsICs9ICcgVm9sdW1lJztcblxuICAgICAgICAgICAgICAgICAgICBzdWZmaXguYXBwZW5kKCAnb3RoZXInICsgZWxlbWVudC52YWx1ZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lucHV0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICB9ICk7XG5cbiAgICBtb2RlbC5maW5kKCdkaXJlY3RlZFBhcnQnKS5vYnNlcnZlKCBmdW5jdGlvbiAobmV3VmFsKSB7XG4gICAgICAgIHZhciBkaXJlY3RlZENvbCA9IHZpZXcuZmluZCgndGFicy5wYXJ0LmRpcmVjdGVkQ29sJyk7XG4gICAgICAgIHZhciByZXNwb25zZXMgPSB7XG4gICAgICAgICAgICB5ZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBkaXJlY3RlZENvbC5hcHBlbmQoJ2RpcmVjdGVkTmFtZScsIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lucHV0JyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdEaXJlY3RlZCBTdXBwbGllciBOYW1lJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgZGlyZWN0ZWRDb2wuYXBwZW5kKCdkaXJlY3RlZEdTREInLCB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbnB1dCcsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGlyZWN0ZWQgdG8gU3VwcGxpZXIgR1NEQiBjb2RlJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG5vOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZGlyZWN0ZWRDb2wuZGVzdHJveSgnZGlyZWN0ZWROYW1lJyk7XG4gICAgICAgICAgICAgICAgZGlyZWN0ZWRDb2wuZGVzdHJveSgnZGlyZWN0ZWRHU0RCJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgKHJlc3BvbnNlc1tuZXdWYWxdIHx8IGZ1bmN0aW9uKCl7fSkoKTtcbiAgICB9ICk7XG5cbiAgICBtb2RlbC5maW5kKCdzdHVkeVN1cHBsaWVyRm9yJykub2JzZXJ2ZSggZnVuY3Rpb24oIG5ld1ZhbCwgb2xkVmFsICkge1xuICAgICAgICB2YXIgbmFtZUNvbCA9IHZpZXcuZmluZCgndGFicy5wYXJ0Lm5hbWVDb2wnKTtcbiAgICAgICAgdmFyIGNvbXBsZXhDb2wgPSB2aWV3LmZpbmQoJ3RhYnMucGFydC5jb21wbGV4Q29tbW9kaXR5Q29sJyk7XG5cbiAgICAgICAgdmFyIHByZWZpeCA9IG1vZGVsLmZpbmQoJ3ByZWZpeCcpWzBdID8gbW9kZWwuZmluZCgncHJlZml4JylbMF0udmFsdWUgOiAnJztcbiAgICAgICAgdmFyIGJhc2UgPSBtb2RlbC5maW5kKCdiYXNlJylbMF0gPyBtb2RlbC5maW5kKCdiYXNlJylbMF0udmFsdWUgOiAnJztcbiAgICAgICAgdmFyIHN1ZmZpeCA9IG1vZGVsLmZpbmQoJ3N1ZmZpeCcpWzBdID8gbW9kZWwuZmluZCgnc3VmZml4JylbMF0udmFsdWUgOiAnJztcblxuICAgICAgICBpZiggbmV3VmFsICE9PSAnY29tcGxleCcgJiYgb2xkVmFsID09PSAnY29tcGxleCcgKSB7XG4gICAgICAgICAgICBjb21wbGV4Q29sLmRlc3Ryb3koJ2NvbXBsZXhDb21tb2RpdHlQYXJ0cycpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGhhbmRsZSA9IHtcbiAgICAgICAgICAgIG11bHRpOiBmdW5jdGlvbiggKSB7XG4gICAgICAgICAgICAgICAgbmFtZUNvbC5kZXN0cm95KCdzdWZmaXgnKTtcblxuICAgICAgICAgICAgICAgIG5hbWVDb2wuYXBwZW5kKCdwcmVmaXgnLCB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbnB1dCcsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnUHJlZml4J1xuICAgICAgICAgICAgICAgIH0sIHByZWZpeCk7XG5cbiAgICAgICAgICAgICAgICBuYW1lQ29sLmFwcGVuZCgnYmFzZScsIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lucHV0JyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdCYXNlJ1xuICAgICAgICAgICAgICAgIH0sIGJhc2UpO1xuXG4gICAgICAgICAgICAgICAgbmFtZUNvbC5hcHBlbmQoJ3N1ZmZpeCcsIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3RhYmxlOnNpbXBsZScsXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWZmaXg6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5wdXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnU3VmZml4J1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgW3tcbiAgICAgICAgICAgICAgICAgICAgJ3N1ZmZpeCc6IHt9XG4gICAgICAgICAgICAgICAgfV0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNpbmdsZTogZnVuY3Rpb24oICkge1xuICAgICAgICAgICAgICAgIGlmKCBvbGRWYWwgPT09ICdtdWx0aScgKSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWVDb2wuZGVzdHJveSgnc3VmZml4Jyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbmFtZUNvbC5hcHBlbmQoJ3ByZWZpeCcsIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lucHV0JyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdQcmVmaXgnXG4gICAgICAgICAgICAgICAgfSwgcHJlZml4ICk7XG5cbiAgICAgICAgICAgICAgICBuYW1lQ29sLmFwcGVuZCgnYmFzZScsIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lucHV0JyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdCYXNlJ1xuICAgICAgICAgICAgICAgIH0sIGJhc2UpO1xuXG4gICAgICAgICAgICAgICAgaWYoIG9sZFZhbCAhPSAnJyApIHtcbiAgICAgICAgICAgICAgICAgICAgc3VmZml4ID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbmFtZUNvbC5hcHBlbmQoJ3N1ZmZpeCcsIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lucHV0JyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTdWZmaXgnXG4gICAgICAgICAgICAgICAgfSwgc3VmZml4KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtdWx0aUFsbDogZnVuY3Rpb24oICkge1xuICAgICAgICAgICAgICAgIGlmKCBvbGRWYWwgPT09ICdtdWx0aScgKSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWVDb2wuZGVzdHJveSgnc3VmZml4Jyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbmFtZUNvbC5hcHBlbmQoJ3ByZWZpeCcsIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lucHV0JyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdQcmVmaXgnXG4gICAgICAgICAgICAgICAgfSwgcHJlZml4KTtcblxuICAgICAgICAgICAgICAgIG5hbWVDb2wuYXBwZW5kKCdiYXNlJywge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW5wdXQnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0Jhc2UnXG4gICAgICAgICAgICAgICAgfSwgYmFzZSk7XG5cbiAgICAgICAgICAgICAgICBuYW1lQ29sLmFwcGVuZChcbiAgICAgICAgICAgICAgICAgICAgJ3N1ZmZpeCcsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbnB1dCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1N1ZmZpeCdcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgJ0FsbCcsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbXBsZXg6IGZ1bmN0aW9uKCApIHtcbiAgICAgICAgICAgICAgICBuYW1lQ29sLmRlc3Ryb3koJ2Jhc2UnKTtcbiAgICAgICAgICAgICAgICBuYW1lQ29sLmRlc3Ryb3koJ3ByZWZpeCcpO1xuICAgICAgICAgICAgICAgIG5hbWVDb2wuZGVzdHJveSgnc3VmZml4Jyk7XG5cbiAgICAgICAgICAgICAgICBjb21wbGV4Q29sLmFwcGVuZCgnY29tcGxleENvbW1vZGl0eVBhcnRzJywge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAndGV4dGFyZWEnLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0NvbXBsZXggQ29tbW9kaXR5IFBhcnQgTnVtYmVycydcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAoaGFuZGxlW25ld1ZhbF0gfHwgZnVuY3Rpb24oKXt9KSgpO1xuXG4gICAgfSApO1xuXG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLnRvdGFsUGxhbm5lZERvd250aW1lJykuc2V0VmFsdWUoZnVuY3Rpb24gKG5ld1ZBbCl7XG4gICAgICAgIHZhciBKTFJGID0gcGFyc2VGbG9hdCh0aGlzLnBlcnNvbmFsQnJlYWtzLnZhbHVlKTtcbiAgICAgICAgdmFyIEpMUkcgPSBwYXJzZUZsb2F0KHRoaXMucGxhbm5lZE1haW50ZW5hbmNlLnZhbHVlKTtcbiAgICAgICAgdmFyIEpMUkMgPSBwYXJzZUZsb2F0KHRoaXMuZGF5c1BlcldlZWsudmFsdWUpO1xuICAgICAgICB2YXIgSkxSRCA9IHBhcnNlRmxvYXQodGhpcy5zaGlmdHNQZXJEYXkudmFsdWUpO1xuICAgICAgICB2YXIgSkxSSSA9IHBhcnNlRmxvYXQodGhpcy5wbGFubmVkQ2hhbmdlb3ZlckZyZXF1ZW5jeS52YWx1ZSk7XG4gICAgICAgIHZhciBKTFJKID0gcGFyc2VGbG9hdCh0aGlzLnBsYW5uZWRNaW51dGVzUGVyQ2hhbmdlb3Zlci52YWx1ZSk7XG4gICAgICAgIHZhciBKTFJIID0gcGFyc2VGbG9hdCh0aGlzLmluc3BlY3Rpb25PZkZhY2lsaXRpZXMudmFsdWUpO1xuXG4gICAgICAgIHZhciByZXN1bHQgPSAoSkxSRitKTFJHKSpKTFJDKkpMUkQrKEpMUkkqSkxSSikrSkxSSDtcblxuICAgICAgICByZXR1cm4gaXNOYU4ocmVzdWx0KSA/ICcnIDogcmVzdWx0O1xuICAgIH0pO1xuXG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLm5ldEF2YWlsYWJsZVRpbWUnKS5zZXRWYWx1ZShmdW5jdGlvbiAoKXtcbiAgICAgICAgdmFyIEpMUkMgPSBwYXJzZUZsb2F0KHRoaXMuZGF5c1BlcldlZWsudmFsdWUpO1xuICAgICAgICB2YXIgSkxSRCA9IHBhcnNlRmxvYXQodGhpcy5zaGlmdHNQZXJEYXkudmFsdWUpO1xuICAgICAgICB2YXIgSkxSRSA9IHBhcnNlRmxvYXQodGhpcy5ob3Vyc1BlclNoaWZ0LnZhbHVlKTtcbiAgICAgICAgdmFyIEpMUksgPSBwYXJzZUZsb2F0KHRoaXMudG90YWxQbGFubmVkRG93bnRpbWUudmFsdWUpO1xuICAgICAgICB2YXIgSkxSTCA9IHBhcnNlRmxvYXQodGhpcy5hbGxvY2F0aW9uUGVyY2VudGFnZS52YWx1ZSk7XG5cbiAgICAgICAgdmFyIHJlc3VsdCA9ICgoKChKTFJDKkpMUkQqSkxSRSktKEpMUksvNjApKSpKTFJMKS8xMDApLnRvRml4ZWQoMik7XG5cbiAgICAgICAgcmV0dXJuIGlzTmFOKHJlc3VsdCkgPyAnJyA6IHJlc3VsdDtcbiAgICB9KTtcblxuICAgIG1vZGVsLmZpbmQoJ3Byb2Nlc3Nlcy5yZXF1aXJlZEdvb2RQYXJ0c1BlcldlZWsnKS5zZXRWYWx1ZShmdW5jdGlvbiAoKXtcbiAgICAgICAgdmFyIEpMUkEgPSBwYXJzZUZsb2F0KG1vZGVsLmZpbmQoJ3RvdGFsUmVxdWlyZWREZW1hbmQnKVswXS52YWx1ZSk7XG4gICAgICAgIHZhciBKTFJOID0gcGFyc2VGbG9hdCh0aGlzLnBlcmNlbnRhZ2VPZlBhcnRzUmVqZWN0ZWQudmFsdWUpO1xuXG4gICAgICAgIHZhciByZXN1bHQgPSBNYXRoLmNlaWwoSkxSQSoxMDAvKDEwMC1KTFJOKSk7XG5cbiAgICAgICAgcmV0dXJuIGlzTmFOKHJlc3VsdCkgPyAnJyA6IHJlc3VsdDtcbiAgICB9KTtcblxuICAgIG1vZGVsLmZpbmQoJ3Byb2Nlc3Nlcy5uZXRJZGVhbEN5Y2xlVGltZScpLnNldFZhbHVlKGZ1bmN0aW9uICgpe1xuICAgICAgICB2YXIgSkxSUSA9IHBhcnNlRmxvYXQodGhpcy5pZGVhbFBsYW5uZWRDeWNsZVRpbWUudmFsdWUpO1xuICAgICAgICB2YXIgSkxSUiA9IHBhcnNlRmxvYXQodGhpcy5udW1iZXJPZlRvb2xzUGFyYWxsZWwudmFsdWUpO1xuICAgICAgICB2YXIgSkxSUyA9IHBhcnNlRmxvYXQodGhpcy5pZGVudGljYWxQYXJ0c1BlckN5Y2xlLnZhbHVlKTtcblxuICAgICAgICB2YXIgcmVzdWx0ID0gKEpMUlEvKEpMUlIgKiBKTFJTKSkudG9GaXhlZCgyKTtcblxuICAgICAgICByZXR1cm4gaXNOYU4ocmVzdWx0KSA/ICcnIDogcmVzdWx0O1xuICAgIH0pO1xuXG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLnBsYW5uZWRQcm9kdWN0aW9uUGVyV2VlaycpLnNldFZhbHVlKGZ1bmN0aW9uICgpe1xuICAgICAgICB2YXIgSkxSRSA9IHBhcnNlRmxvYXQodGhpcy5ob3Vyc1BlclNoaWZ0LnZhbHVlKTtcbiAgICAgICAgdmFyIEpMUkYgPSBwYXJzZUZsb2F0KHRoaXMucGVyc29uYWxCcmVha3MudmFsdWUpO1xuICAgICAgICB2YXIgSkxSRyA9IHBhcnNlRmxvYXQodGhpcy5wbGFubmVkTWFpbnRlbmFuY2UudmFsdWUpO1xuICAgICAgICB2YXIgSkxSSCA9IHBhcnNlRmxvYXQodGhpcy5pbnNwZWN0aW9uT2ZGYWNpbGl0aWVzLnZhbHVlKTtcbiAgICAgICAgdmFyIEpMUkMgPSBwYXJzZUZsb2F0KHRoaXMuZGF5c1BlcldlZWsudmFsdWUpO1xuICAgICAgICB2YXIgSkxSRCA9IHBhcnNlRmxvYXQodGhpcy5zaGlmdHNQZXJEYXkudmFsdWUpO1xuICAgICAgICB2YXIgSkxSSSA9IHBhcnNlRmxvYXQodGhpcy5wbGFubmVkQ2hhbmdlb3ZlckZyZXF1ZW5jeS52YWx1ZSk7XG4gICAgICAgIHZhciBKTFJKID0gcGFyc2VGbG9hdCh0aGlzLnBsYW5uZWRNaW51dGVzUGVyQ2hhbmdlb3Zlci52YWx1ZSk7XG4gICAgICAgIHZhciBKTFJMID0gcGFyc2VGbG9hdCh0aGlzLmFsbG9jYXRpb25QZXJjZW50YWdlLnZhbHVlKTtcbiAgICAgICAgdmFyIEpMUlQgPSBwYXJzZUZsb2F0KHRoaXMubmV0SWRlYWxDeWNsZVRpbWUudmFsdWUpO1xuXG4gICAgICAgIHZhciByZXN1bHQgPSBNYXRoLmZsb29yKCgoNjAqSkxSRSktKEpMUkYrSkxSRyktKEpMUkgvSkxSQy9KTFJEKS0oSkxSSSpKTFJKL0pMUkMvSkxSRCkpKkpMUkMqSkxSRCpKTFJMLzEwMCo2MC9KTFJUKTtcblxuICAgICAgICByZXR1cm4gaXNOYU4ocmVzdWx0KSA/ICcnIDogcmVzdWx0O1xuICAgIH0pO1xuXG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLnJlcXVpcmVkT0VFJykuc2V0VmFsdWUoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgSkxSUCA9IHBhcnNlRmxvYXQodGhpcy5yZXF1aXJlZEdvb2RQYXJ0c1BlcldlZWsudmFsdWUpO1xuICAgICAgICB2YXIgSkxSVSA9IHBhcnNlRmxvYXQodGhpcy5wbGFubmVkUHJvZHVjdGlvblBlcldlZWsudmFsdWUpO1xuXG4gICAgICAgIHZhciByZXN1bHQgPSAoKEpMUlAvSkxSVSkqMTAwKS50b0ZpeGVkKDIpO1xuXG4gICAgICAgIHJldHVybiBpc05hTihyZXN1bHQpID8gJycgOiByZXN1bHQ7XG4gICAgfSk7XG5cbiAgICBtb2RlbC5maW5kKCdwcm9jZXNzZXMucGxhbm5lZFByb2R1Y3Rpb25QZXJIb3VyJykuc2V0VmFsdWUoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgSkxSRiA9IHBhcnNlRmxvYXQodGhpcy5wZXJzb25hbEJyZWFrcy52YWx1ZSk7XG4gICAgICAgIHZhciBKTFJFID0gcGFyc2VGbG9hdCh0aGlzLmhvdXJzUGVyU2hpZnQudmFsdWUpO1xuICAgICAgICB2YXIgSkxSRyA9IHBhcnNlRmxvYXQodGhpcy5wbGFubmVkTWFpbnRlbmFuY2UudmFsdWUpO1xuICAgICAgICB2YXIgSkxSSCA9IHBhcnNlRmxvYXQodGhpcy5pbnNwZWN0aW9uT2ZGYWNpbGl0aWVzLnZhbHVlKTtcbiAgICAgICAgdmFyIEpMUkMgPSBwYXJzZUZsb2F0KHRoaXMuZGF5c1BlcldlZWsudmFsdWUpO1xuICAgICAgICB2YXIgSkxSRCA9IHBhcnNlRmxvYXQodGhpcy5zaGlmdHNQZXJEYXkudmFsdWUpO1xuICAgICAgICB2YXIgSkxSSSA9IHBhcnNlRmxvYXQodGhpcy5wbGFubmVkQ2hhbmdlb3ZlckZyZXF1ZW5jeS52YWx1ZSk7XG4gICAgICAgIHZhciBKTFJKID0gcGFyc2VGbG9hdCh0aGlzLnBsYW5uZWRNaW51dGVzUGVyQ2hhbmdlb3Zlci52YWx1ZSk7XG4gICAgICAgIHZhciBKTFJMID0gcGFyc2VGbG9hdCh0aGlzLmFsbG9jYXRpb25QZXJjZW50YWdlLnZhbHVlKTtcbiAgICAgICAgdmFyIEpMUlQgPSBwYXJzZUZsb2F0KHRoaXMubmV0SWRlYWxDeWNsZVRpbWUudmFsdWUpO1xuXG4gICAgICAgIHZhciByZXN1bHQgPSBNYXRoLmZsb29yKCgoNjAtKEpMUkYvSkxSRSktKEpMUkcvSkxSRSktKEpMUkgvSkxSQy9KTFJEL0pMUkUpLShKTFJJKkpMUkovSkxSQy9KTFJEL0pMUkUpKSpKTFJMLzEwMCo2MC9KTFJUKSk7XG5cbiAgICAgICAgcmV0dXJuIGlzTmFOKHJlc3VsdCkgPyAnJyA6IHJlc3VsdDtcbiAgICB9KTtcblxuICAgIG1vZGVsLmZpbmQoJ3Byb2Nlc3Nlcy5wbGFubmVkUHJvZHVjdGlvblBlckRheScpLnNldFZhbHVlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIEpMUkYgPSBwYXJzZUZsb2F0KHRoaXMucGVyc29uYWxCcmVha3MudmFsdWUpO1xuICAgICAgICB2YXIgSkxSRSA9IHBhcnNlRmxvYXQodGhpcy5ob3Vyc1BlclNoaWZ0LnZhbHVlKTtcbiAgICAgICAgdmFyIEpMUkcgPSBwYXJzZUZsb2F0KHRoaXMucGxhbm5lZE1haW50ZW5hbmNlLnZhbHVlKTtcbiAgICAgICAgdmFyIEpMUkggPSBwYXJzZUZsb2F0KHRoaXMuaW5zcGVjdGlvbk9mRmFjaWxpdGllcy52YWx1ZSk7XG4gICAgICAgIHZhciBKTFJDID0gcGFyc2VGbG9hdCh0aGlzLmRheXNQZXJXZWVrLnZhbHVlKTtcbiAgICAgICAgdmFyIEpMUkQgPSBwYXJzZUZsb2F0KHRoaXMuc2hpZnRzUGVyRGF5LnZhbHVlKTtcbiAgICAgICAgdmFyIEpMUkkgPSBwYXJzZUZsb2F0KHRoaXMucGxhbm5lZENoYW5nZW92ZXJGcmVxdWVuY3kudmFsdWUpO1xuICAgICAgICB2YXIgSkxSSiA9IHBhcnNlRmxvYXQodGhpcy5wbGFubmVkTWludXRlc1BlckNoYW5nZW92ZXIudmFsdWUpO1xuICAgICAgICB2YXIgSkxSTCA9IHBhcnNlRmxvYXQodGhpcy5hbGxvY2F0aW9uUGVyY2VudGFnZS52YWx1ZSk7XG4gICAgICAgIHZhciBKTFJUID0gcGFyc2VGbG9hdCh0aGlzLm5ldElkZWFsQ3ljbGVUaW1lLnZhbHVlKTtcblxuICAgICAgICB2YXIgcmVzdWx0ID0gTWF0aC5mbG9vcigoKDYwKkpMUkUpLShKTFJGK0pMUkcpLShKTFJIL0pMUkMvSkxSRCktKEpMUkkqSkxSSi9KTFJDL0pMUkQpKSpKTFJEKkpMUkwvMTAwKjYwL0pMUlQpO1xuXG4gICAgICAgIHJldHVybiBpc05hTihyZXN1bHQpID8gJycgOiByZXN1bHQ7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBlcXVpcE5ldEF2YWlsYWJsZVRpbWUgKHBoYXNlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgSkxSQUQgPSBwYXJzZUZsb2F0KHRoaXNbcGhhc2UgKyAndG90YWxEdXJhdGlvbk9mUHJvZHVjdGlvblJ1biddLnZhbHVlKTtcbiAgICAgICAgICAgIHZhciBKTFJBRSA9IHBhcnNlRmxvYXQodGhpc1twaGFzZSArICdlcXVpcFRvdGFsUGxhbm5lZERvd250aW1lJ10udmFsdWUpO1xuXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gSkxSQUQtSkxSQUU7XG5cbiAgICAgICAgICAgIHJldHVybiBpc05hTihyZXN1bHQpID8gJycgOiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLnBoYXNlMGVxdWlwTmV0QXZhaWxhYmxlVGltZScpLnNldFZhbHVlKGVxdWlwTmV0QXZhaWxhYmxlVGltZSgncGhhc2UwJykpO1xuICAgIG1vZGVsLmZpbmQoJ3Byb2Nlc3Nlcy5waGFzZTNlcXVpcE5ldEF2YWlsYWJsZVRpbWUnKS5zZXRWYWx1ZShlcXVpcE5ldEF2YWlsYWJsZVRpbWUoJ3BoYXNlMycpKTtcbiAgICBtb2RlbC5maW5kKCdwcm9jZXNzZXMuY2FwQ29uZmVxdWlwTmV0QXZhaWxhYmxlVGltZScpLnNldFZhbHVlKGVxdWlwTmV0QXZhaWxhYmxlVGltZSgnY2FwQ29uZicpKTtcblxuICAgIGZ1bmN0aW9uIGFjdHVhbFByb2R1Y3Rpb25UaW1lIChwaGFzZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIEpMUkFGID0gcGFyc2VGbG9hdCh0aGlzW3BoYXNlICsgJ2VxdWlwTmV0QXZhaWxhYmxlVGltZSddLnZhbHVlKTtcbiAgICAgICAgICAgIHZhciBKTFJBRyA9IHBhcnNlRmxvYXQodGhpc1twaGFzZSArICdzaGFyZWRFcXVpcENoYW5nZW92ZXInXS52YWx1ZSk7XG4gICAgICAgICAgICB2YXIgSkxSQUkgPSBwYXJzZUZsb2F0KHRoaXNbcGhhc2UgKyAndG90YWxVbnBsYW5uZWREb3dudGltZSddLnZhbHVlKTtcblxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IEpMUkFGLUpMUkFHLUpMUkFJO1xuXG4gICAgICAgICAgICByZXR1cm4gaXNOYU4ocmVzdWx0KSA/ICcnIDogcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIG1vZGVsLmZpbmQoJ3Byb2Nlc3Nlcy5waGFzZTBhY3R1YWxQcm9kdWN0aW9uVGltZScpLnNldFZhbHVlKGFjdHVhbFByb2R1Y3Rpb25UaW1lKCdwaGFzZTAnKSk7XG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLnBoYXNlM2FjdHVhbFByb2R1Y3Rpb25UaW1lJykuc2V0VmFsdWUoYWN0dWFsUHJvZHVjdGlvblRpbWUoJ3BoYXNlMycpKTtcbiAgICBtb2RlbC5maW5kKCdwcm9jZXNzZXMuY2FwQ29uZmFjdHVhbFByb2R1Y3Rpb25UaW1lJykuc2V0VmFsdWUoYWN0dWFsUHJvZHVjdGlvblRpbWUoJ2NhcENvbmYnKSk7XG5cbiAgICBmdW5jdGlvbiBlcXVpcG1lbnRBdmFpbGFiaWxpdHkgKHBoYXNlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgSkxSQUogPSBwYXJzZUZsb2F0KHRoaXNbcGhhc2UgKyAnYWN0dWFsUHJvZHVjdGlvblRpbWUnXS52YWx1ZSk7XG4gICAgICAgICAgICB2YXIgSkxSQUYgPSBwYXJzZUZsb2F0KHRoaXNbcGhhc2UgKyAnZXF1aXBOZXRBdmFpbGFibGVUaW1lJ10udmFsdWUpO1xuXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gKChKTFJBSi9KTFJBRikqMTAwKS50b0ZpeGVkKDIpO1xuXG4gICAgICAgICAgICByZXR1cm4gaXNOYU4ocmVzdWx0KSA/ICcnIDogcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIG1vZGVsLmZpbmQoJ3Byb2Nlc3Nlcy5waGFzZTBlcXVpcG1lbnRBdmFpbGFiaWxpdHknKS5zZXRWYWx1ZShlcXVpcG1lbnRBdmFpbGFiaWxpdHkoJ3BoYXNlMCcpKTtcbiAgICBtb2RlbC5maW5kKCdwcm9jZXNzZXMucGhhc2UzZXF1aXBtZW50QXZhaWxhYmlsaXR5Jykuc2V0VmFsdWUoZXF1aXBtZW50QXZhaWxhYmlsaXR5KCdwaGFzZTMnKSk7XG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLmNhcENvbmZlcXVpcG1lbnRBdmFpbGFiaWxpdHknKS5zZXRWYWx1ZShlcXVpcG1lbnRBdmFpbGFiaWxpdHkoJ2NhcENvbmYnKSk7XG5cbiAgICBmdW5jdGlvbiBwZXJmb3JtYW5jZUVmZmljaWVuY3kgKHBoYXNlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgSkxSQU0gPSBwYXJzZUZsb2F0KHRoaXNbcGhhc2UgKyAndG90YWxQYXJ0c1J1biddLnZhbHVlKTtcbiAgICAgICAgICAgIHZhciBKTFJBTiA9IHBhcnNlRmxvYXQodGhpc1twaGFzZSArICdwZXJmTmV0SWRlYWxDeWNsZVRpbWUnXS52YWx1ZSk7XG4gICAgICAgICAgICB2YXIgSkxSQUogPSBwYXJzZUZsb2F0KHRoaXNbcGhhc2UgKyAnYWN0dWFsUHJvZHVjdGlvblRpbWUnXS52YWx1ZSk7XG5cbiAgICAgICAgICAgIHZhciByZXN1bHQgPSAoKEpMUkFNICogSkxSQU4gLyAoSkxSQUogKiA2MCkpKjEwMCkudG9GaXhlZCgyKTtcblxuICAgICAgICAgICAgcmV0dXJuIGlzTmFOKHJlc3VsdCkgPyAnJyA6IHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBtb2RlbC5maW5kKCdwcm9jZXNzZXMucGhhc2UwcGVyZm9ybWFuY2VFZmZpY2llbmN5Jykuc2V0VmFsdWUocGVyZm9ybWFuY2VFZmZpY2llbmN5KCdwaGFzZTAnKSk7XG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLnBoYXNlM3BlcmZvcm1hbmNlRWZmaWNpZW5jeScpLnNldFZhbHVlKHBlcmZvcm1hbmNlRWZmaWNpZW5jeSgncGhhc2UzJykpO1xuICAgIG1vZGVsLmZpbmQoJ3Byb2Nlc3Nlcy5jYXBDb25mcGVyZm9ybWFuY2VFZmZpY2llbmN5Jykuc2V0VmFsdWUocGVyZm9ybWFuY2VFZmZpY2llbmN5KCdjYXBDb25mJykpO1xuXG4gICAgZnVuY3Rpb24gYXZhaWxhYmlsaXR5QW5kUEVMb3NzZXNOb3RDYXB0dXJlZCAocGhhc2UpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBKTFJBTSA9IHBhcnNlRmxvYXQodGhpc1twaGFzZSArICd0b3RhbFBhcnRzUnVuJ10udmFsdWUpO1xuICAgICAgICAgICAgdmFyIEpMUkFOID0gcGFyc2VGbG9hdCh0aGlzW3BoYXNlICsgJ3BlcmZOZXRJZGVhbEN5Y2xlVGltZSddLnZhbHVlKTtcbiAgICAgICAgICAgIHZhciBKTFJBSyA9IHBhcnNlRmxvYXQodGhpc1twaGFzZSArICdlcXVpcG1lbnRBdmFpbGFiaWxpdHknXS52YWx1ZSk7XG5cbiAgICAgICAgICAgIHZhciByZXN1bHQgPSAoSkxSQUsgLSAoSkxSQU4gKiBKTFJBTSkvNjApLnRvRml4ZWQoMik7XG5cbiAgICAgICAgICAgIHJldHVybiBpc05hTihyZXN1bHQpID8gJycgOiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLnBoYXNlMGF2YWlsYWJpbGl0eUFuZFBFTG9zc2VzTm90Q2FwdHVyZWQnKS5zZXRWYWx1ZShhdmFpbGFiaWxpdHlBbmRQRUxvc3Nlc05vdENhcHR1cmVkKCdwaGFzZTAnKSk7XG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLnBoYXNlM2F2YWlsYWJpbGl0eUFuZFBFTG9zc2VzTm90Q2FwdHVyZWQnKS5zZXRWYWx1ZShhdmFpbGFiaWxpdHlBbmRQRUxvc3Nlc05vdENhcHR1cmVkKCdwaGFzZTMnKSk7XG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLmNhcENvbmZhdmFpbGFiaWxpdHlBbmRQRUxvc3Nlc05vdENhcHR1cmVkJykuc2V0VmFsdWUoYXZhaWxhYmlsaXR5QW5kUEVMb3NzZXNOb3RDYXB0dXJlZCgnY2FwQ29uZicpKTtcblxuICAgIGZ1bmN0aW9uIHJpZ2h0Rmlyc3RUaW1lIChwaGFzZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIEpMUkFNID0gcGFyc2VGbG9hdCh0aGlzW3BoYXNlICsgJ3RvdGFsUGFydHNSdW4nXS52YWx1ZSk7XG4gICAgICAgICAgICB2YXIgSkxSQVEgPSBwYXJzZUZsb2F0KHRoaXNbcGhhc2UgKyAnbnVtYmVyT2ZQYXJ0c1JlamVjdGVkJ10udmFsdWUpO1xuICAgICAgICAgICAgdmFyIEpMUkFSID0gcGFyc2VGbG9hdCh0aGlzW3BoYXNlICsgJ251bWJlck9mUGFydHNSZXdvcmtlZCddLnZhbHVlKTtcblxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9ICgoSkxSQU0tKEpMUkFRLUpMUkFSKSkvSkxSQU0pICogMTAwO1xuXG4gICAgICAgICAgICByZXR1cm4gaXNOYU4ocmVzdWx0KSA/ICcnIDogcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIG1vZGVsLmZpbmQoJ3Byb2Nlc3Nlcy5waGFzZTByaWdodEZpcnN0VGltZScpLnNldFZhbHVlKHJpZ2h0Rmlyc3RUaW1lKCdwaGFzZTAnKSk7XG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLnBoYXNlM3JpZ2h0Rmlyc3RUaW1lJykuc2V0VmFsdWUocmlnaHRGaXJzdFRpbWUoJ3BoYXNlMycpKTtcbiAgICBtb2RlbC5maW5kKCdwcm9jZXNzZXMuY2FwQ29uZnJpZ2h0Rmlyc3RUaW1lJykuc2V0VmFsdWUocmlnaHRGaXJzdFRpbWUoJ2NhcENvbmYnKSk7XG5cbiAgICBmdW5jdGlvbiBmaXJzdFRpbWVUaHJvdWdoIChwaGFzZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIEpMUkFNID0gcGFyc2VGbG9hdCh0aGlzW3BoYXNlICsgJ3RvdGFsUGFydHNSdW4nXS52YWx1ZSk7XG4gICAgICAgICAgICB2YXIgSkxSQVEgPSBwYXJzZUZsb2F0KHRoaXNbcGhhc2UgKyAnbnVtYmVyT2ZQYXJ0c1JlamVjdGVkJ10udmFsdWUpO1xuXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gKChKTFJBTS1KTFJBUSkvSkxSQU0pKjEwMDtcblxuICAgICAgICAgICAgcmV0dXJuIGlzTmFOKHJlc3VsdCkgPyAnJyA6IHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBtb2RlbC5maW5kKCdwcm9jZXNzZXMucGhhc2UwZmlyc3RUaW1lVGhyb3VnaCcpLnNldFZhbHVlKGZpcnN0VGltZVRocm91Z2goJ3BoYXNlMCcpKTtcbiAgICBtb2RlbC5maW5kKCdwcm9jZXNzZXMucGhhc2UzZmlyc3RUaW1lVGhyb3VnaCcpLnNldFZhbHVlKGZpcnN0VGltZVRocm91Z2goJ3BoYXNlMycpKTtcbiAgICBtb2RlbC5maW5kKCdwcm9jZXNzZXMuY2FwQ29uZmZpcnN0VGltZVRocm91Z2gnKS5zZXRWYWx1ZShmaXJzdFRpbWVUaHJvdWdoKCdjYXBDb25mJykpO1xuXG4gICAgZnVuY3Rpb24gb2VlIChwaGFzZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIEpMUkFLID0gcGFyc2VGbG9hdCh0aGlzW3BoYXNlICsgJ2VxdWlwbWVudEF2YWlsYWJpbGl0eSddLnZhbHVlKTtcbiAgICAgICAgICAgIHZhciBKTFJBTyA9IHBhcnNlRmxvYXQodGhpc1twaGFzZSArICdwZXJmb3JtYW5jZUVmZmljaWVuY3knXS52YWx1ZSk7XG4gICAgICAgICAgICB2YXIgSkxSQVMgPSBwYXJzZUZsb2F0KHRoaXNbcGhhc2UgKyAncmlnaHRGaXJzdFRpbWUnXS52YWx1ZSk7XG5cbiAgICAgICAgICAgIHZhciByZXN1bHQgPSAoKEpMUkFLKkpMUkFPKkpMUkFTKS8xMDAwMCkudG9GaXhlZCgyKTtcblxuICAgICAgICAgICAgcmV0dXJuIGlzTmFOKHJlc3VsdCkgPyAnJyA6IHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBtb2RlbC5maW5kKCdwcm9jZXNzZXMucGhhc2Uwb2VlJykuc2V0VmFsdWUob2VlKCdwaGFzZTAnKSk7XG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLnBoYXNlM29lZScpLnNldFZhbHVlKG9lZSgncGhhc2UzJykpO1xuICAgIG1vZGVsLmZpbmQoJ3Byb2Nlc3Nlcy5jYXBDb25mb2VlJykuc2V0VmFsdWUob2VlKCdjYXBDb25mJykpO1xuXG4gICAgZnVuY3Rpb24gcHJvY2Vzc1NwZWNpZmljV2VlayAocGhhc2UpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBKTFJVID0gcGFyc2VGbG9hdCh0aGlzLnBsYW5uZWRQcm9kdWN0aW9uUGVyV2Vlay52YWx1ZSk7XG4gICAgICAgICAgICB2YXIgSkxSQVUgPSBwYXJzZUZsb2F0KHRoaXNbcGhhc2UgKyAnb2VlJ10udmFsdWUpO1xuXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gTWF0aC5yb3VuZChKTFJVKkpMUkFVLzEwMCk7XG5cbiAgICAgICAgICAgIHJldHVybiBpc05hTihyZXN1bHQpID8gJycgOiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLnBoYXNlMHByb2Nlc3NTcGVjaWZpY1dlZWsnKS5zZXRWYWx1ZShwcm9jZXNzU3BlY2lmaWNXZWVrKCdwaGFzZTAnKSk7XG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLnBoYXNlM3Byb2Nlc3NTcGVjaWZpY1dlZWsnKS5zZXRWYWx1ZShwcm9jZXNzU3BlY2lmaWNXZWVrKCdwaGFzZTMnKSk7XG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLmNhcENvbmZwcm9jZXNzU3BlY2lmaWNXZWVrJykuc2V0VmFsdWUocHJvY2Vzc1NwZWNpZmljV2VlaygnY2FwQ29uZicpKTtcblxuICAgIGZ1bmN0aW9uIHByb2Nlc3NTcGVjaWZpY0hvdXIgKHBoYXNlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgSkxSQ0EgPSBwYXJzZUZsb2F0KHRoaXMucGxhbm5lZFByb2R1Y3Rpb25QZXJIb3VyLnZhbHVlKTtcbiAgICAgICAgICAgIHZhciBKTFJBVSA9IHBhcnNlRmxvYXQodGhpc1twaGFzZSArICdvZWUnXS52YWx1ZSk7XG5cbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBNYXRoLnJvdW5kKEpMUkNBKkpMUkFVLzEwMCk7XG5cbiAgICAgICAgICAgIHJldHVybiBpc05hTihyZXN1bHQpID8gJycgOiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLnBoYXNlMHByb2Nlc3NTcGVjaWZpY0hvdXInKS5zZXRWYWx1ZShwcm9jZXNzU3BlY2lmaWNIb3VyKCdwaGFzZTAnKSk7XG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLnBoYXNlM3Byb2Nlc3NTcGVjaWZpY0hvdXInKS5zZXRWYWx1ZShwcm9jZXNzU3BlY2lmaWNIb3VyKCdwaGFzZTMnKSk7XG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLmNhcENvbmZwcm9jZXNzU3BlY2lmaWNIb3VyJykuc2V0VmFsdWUocHJvY2Vzc1NwZWNpZmljSG91cignY2FwQ29uZicpKTtcblxuICAgIGZ1bmN0aW9uIHByb2Nlc3NTcGVjaWZpY0RheSAocGhhc2UpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBKTFJDQiA9IHBhcnNlRmxvYXQodGhpcy5wbGFubmVkUHJvZHVjdGlvblBlckRheS52YWx1ZSk7XG4gICAgICAgICAgICB2YXIgSkxSQVUgPSBwYXJzZUZsb2F0KHRoaXNbcGhhc2UgKyAnb2VlJ10udmFsdWUpO1xuXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gTWF0aC5yb3VuZChKTFJDQipKTFJBVS8xMDApO1xuXG4gICAgICAgICAgICByZXR1cm4gaXNOYU4ocmVzdWx0KSA/ICcnIDogcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIG1vZGVsLmZpbmQoJ3Byb2Nlc3Nlcy5waGFzZTBwcm9jZXNzU3BlY2lmaWNEYXknKS5zZXRWYWx1ZShwcm9jZXNzU3BlY2lmaWNEYXkoJ3BoYXNlMCcpKTtcbiAgICBtb2RlbC5maW5kKCdwcm9jZXNzZXMucGhhc2UzcHJvY2Vzc1NwZWNpZmljRGF5Jykuc2V0VmFsdWUocHJvY2Vzc1NwZWNpZmljRGF5KCdwaGFzZTMnKSk7XG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLmNhcENvbmZwcm9jZXNzU3BlY2lmaWNEYXknKS5zZXRWYWx1ZShwcm9jZXNzU3BlY2lmaWNEYXkoJ2NhcENvbmYnKSk7XG5cbiAgICBmdW5jdGlvbiBvYnNlcnZlZEN5Y2xlVGltZSAocGhhc2UpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBKTFJBSiA9IHBhcnNlRmxvYXQodGhpc1twaGFzZSArICdhY3R1YWxQcm9kdWN0aW9uVGltZSddLnZhbHVlKTtcbiAgICAgICAgICAgIHZhciBKTFJBTSA9IHBhcnNlRmxvYXQodGhpc1twaGFzZSArICd0b3RhbFBhcnRzUnVuJ10udmFsdWUpO1xuXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gKEpMUkFKICogNjAgLyBKTFJBTSkudG9GaXhlZCgyKTtcblxuICAgICAgICAgICAgcmV0dXJuIGlzTmFOKHJlc3VsdCkgPyAnJyA6IHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBtb2RlbC5maW5kKCdwcm9jZXNzZXMucGhhc2Uwb2JzZXJ2ZWRDeWNsZVRpbWUnKS5zZXRWYWx1ZShvYnNlcnZlZEN5Y2xlVGltZSgncGhhc2UwJykpO1xuICAgIG1vZGVsLmZpbmQoJ3Byb2Nlc3Nlcy5waGFzZTNvYnNlcnZlZEN5Y2xlVGltZScpLnNldFZhbHVlKG9ic2VydmVkQ3ljbGVUaW1lKCdwaGFzZTMnKSk7XG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLmNhcENvbmZvYnNlcnZlZEN5Y2xlVGltZScpLnNldFZhbHVlKG9ic2VydmVkQ3ljbGVUaW1lKCdjYXBDb25mJykpO1xuXG4gICAgZnVuY3Rpb24gamxyRGVtYW5kIChwaGFzZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmZpbmQoJ3RvdGFsUmVxdWlyZWREZW1hbmQnKVswXS52YWx1ZTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBtb2RlbC5maW5kKCdwcm9jZXNzZXMucGhhc2UwamxyRGVtYW5kJykuc2V0VmFsdWUoamxyRGVtYW5kKCdwaGFzZTAnKSk7XG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLnBoYXNlM2psckRlbWFuZCcpLnNldFZhbHVlKGpsckRlbWFuZCgncGhhc2UzJykpO1xuICAgIG1vZGVsLmZpbmQoJ3Byb2Nlc3Nlcy5jYXBDb25mamxyRGVtYW5kJykuc2V0VmFsdWUoamxyRGVtYW5kKCdjYXBDb25mJykpO1xuXG4gICAgZnVuY3Rpb24gcGFydHNBdmFpbGFibGVGb3JTaGlwbWVudCAocGhhc2UpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBwYXJ0VHlwZSA9IG1vZGVsLmZpbmQoJ3BhcnRUeXBlJylbMF0udmFsdWU7XG5cbiAgICAgICAgICAgIHZhciB0b0ZpbmQgPSB7XG4gICAgICAgICAgICAgICAgc2VxdWVuY2VkOiAncHJvY2Vzc1NwZWNpZmljV2VlaycsXG4gICAgICAgICAgICAgICAgbm9uOiAncHJvY2Vzc1NwZWNpZmljSG91cidcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmICh0b0ZpbmRbcGFydFR5cGVdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNbcGhhc2UgKyB0b0ZpbmRbcGFydFR5cGVdXS52YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIG1vZGVsLmZpbmQoJ3Byb2Nlc3Nlcy5waGFzZTBwYXJ0c0F2YWlsYWJsZUZvclNoaXBtZW50Jykuc2V0VmFsdWUocGFydHNBdmFpbGFibGVGb3JTaGlwbWVudCgncGhhc2UwJykpO1xuICAgIG1vZGVsLmZpbmQoJ3Byb2Nlc3Nlcy5waGFzZTNwYXJ0c0F2YWlsYWJsZUZvclNoaXBtZW50Jykuc2V0VmFsdWUocGFydHNBdmFpbGFibGVGb3JTaGlwbWVudCgncGhhc2UzJykpO1xuICAgIG1vZGVsLmZpbmQoJ3Byb2Nlc3Nlcy5jYXBDb25mcGFydHNBdmFpbGFibGVGb3JTaGlwbWVudCcpLnNldFZhbHVlKHBhcnRzQXZhaWxhYmxlRm9yU2hpcG1lbnQoJ2NhcENvbmYnKSk7XG5cbiAgICBmdW5jdGlvbiBvYnNlcnZlUGVyY2VudGFnZUpMUkRlbWFuZCggcGhhc2UgKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoIG5ld1ZhbCwgb2xkVmFsLCBkaWZmLCBuYW1lICkge1xuICAgICAgICAgICAgdmFyIGNsYXNzTmFtZSA9ICcnO1xuICAgICAgICAgICAgaWYoIG5ld1ZhbCA8IDAgKSB7XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gJ25lZ2F0aXZlJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiggbmV3VmFsID4gMCApIHtcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSAncG9zaXRpdmUnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnBoYXNlMHBlcmNlbnRhZ2VKTFJEZW1hbmQubW9kZWwgPSBjbGFzc05hbWU7XG4gICAgICAgICAgICB0aGlzLnBoYXNlM3BlcmNlbnRhZ2VKTFJEZW1hbmQubW9kZWwgPSBjbGFzc05hbWU7XG4gICAgICAgICAgICB0aGlzLmNhcENvbmZwZXJjZW50YWdlSkxSRGVtYW5kLm1vZGVsID0gY2xhc3NOYW1lO1xuICAgICAgICAgICAgdGhpcy5waGFzZTBwYXJ0c0F2YWlsYWJsZUZvclNoaXBtZW50Lm1vZGVsID0gY2xhc3NOYW1lO1xuICAgICAgICAgICAgdGhpcy5waGFzZTNwYXJ0c0F2YWlsYWJsZUZvclNoaXBtZW50Lm1vZGVsID0gY2xhc3NOYW1lO1xuICAgICAgICAgICAgdGhpcy5jYXBDb25mcGFydHNBdmFpbGFibGVGb3JTaGlwbWVudC5tb2RlbCA9IGNsYXNzTmFtZTtcbiAgICAgICAgICAgIHRoaXMucGhhc2UwamxyRGVtYW5kLm1vZGVsID0gY2xhc3NOYW1lO1xuICAgICAgICAgICAgdGhpcy5waGFzZTNqbHJEZW1hbmQubW9kZWwgPSBjbGFzc05hbWU7XG4gICAgICAgICAgICB0aGlzLmNhcENvbmZqbHJEZW1hbmQubW9kZWwgPSBjbGFzc05hbWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtb2RlbC5maW5kKCdwcm9jZXNzZXMucGhhc2UwcGVyY2VudGFnZUpMUkRlbWFuZCcpLm9ic2VydmUob2JzZXJ2ZVBlcmNlbnRhZ2VKTFJEZW1hbmQoJ3BoYXNlMCcpKTtcbiAgICBtb2RlbC5maW5kKCdwcm9jZXNzZXMucGhhc2UzcGVyY2VudGFnZUpMUkRlbWFuZCcpLm9ic2VydmUob2JzZXJ2ZVBlcmNlbnRhZ2VKTFJEZW1hbmQoJ3BoYXNlMycpKTtcbiAgICBtb2RlbC5maW5kKCdwcm9jZXNzZXMuY2FwQ29uZnBlcmNlbnRhZ2VKTFJEZW1hbmQnKS5vYnNlcnZlKG9ic2VydmVQZXJjZW50YWdlSkxSRGVtYW5kKCdjYXBDb25mJykpO1xuXG5cbiAgICBmdW5jdGlvbiBwZXJjZW50YWdlSkxSRGVtYW5kIChwaGFzZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIEpMUkJEID0gcGFyc2VGbG9hdCh0aGlzW3BoYXNlICsgJ3BhcnRzQXZhaWxhYmxlRm9yU2hpcG1lbnQnXS52YWx1ZSk7XG4gICAgICAgICAgICB2YXIgSkxSQkMgPSBwYXJzZUZsb2F0KHRoaXNbcGhhc2UgKyAnamxyRGVtYW5kJ10udmFsdWUpO1xuXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gTWF0aC5yb3VuZCgoSkxSQkQtSkxSQkMvSkxSQkMpKjEwMCk7XG5cbiAgICAgICAgICAgIHJldHVybiBpc05hTihyZXN1bHQpID8gJycgOiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLnBoYXNlMHBlcmNlbnRhZ2VKTFJEZW1hbmQnKS5zZXRWYWx1ZShwZXJjZW50YWdlSkxSRGVtYW5kKCdwaGFzZTAnKSk7XG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLnBoYXNlM3BlcmNlbnRhZ2VKTFJEZW1hbmQnKS5zZXRWYWx1ZShwZXJjZW50YWdlSkxSRGVtYW5kKCdwaGFzZTMnKSk7XG4gICAgbW9kZWwuZmluZCgncHJvY2Vzc2VzLmNhcENvbmZwZXJjZW50YWdlSkxSRGVtYW5kJykuc2V0VmFsdWUocGVyY2VudGFnZUpMUkRlbWFuZCgnY2FwQ29uZicpKTtcblxuICAgIG1vZGVsLmZpbmQoJ3Byb2Nlc3Nlcy50b3RhbFBlcmNlbnRhZ2VBbGxvY2F0aW9uJykuc2V0VmFsdWUoZnVuY3Rpb24gKCl7XG4gICAgICAgIHZhciBzaGFyZWRMb2FkaW5nUGxhbiA9IHRoaXMuc2hhcmVkTG9hZGluZ1BsYW4udmFsdWU7XG5cbiAgICAgICAgdmFyIHN1bSA9IDA7XG5cbiAgICAgICAgc2hhcmVkTG9hZGluZ1BsYW4uZm9yRWFjaCggZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIGlmKCAhaXNOYU4ocGFyc2VGbG9hdChpdGVtLnJlcXVpcmVkQWxsb2NhdGlvbkJ5UGFydC52YWx1ZSkpICkge1xuICAgICAgICAgICAgICAgIHN1bSArPSBwYXJzZUZsb2F0KGl0ZW0ucmVxdWlyZWRBbGxvY2F0aW9uQnlQYXJ0LnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYoICFpc05hTihwYXJzZUZsb2F0KHRoaXMuYWxsb2NhdGlvblBlcmNlbnRhZ2UudmFsdWUpKSApIHtcbiAgICAgICAgICAgIHN1bSArPSBwYXJzZUZsb2F0KHRoaXMuYWxsb2NhdGlvblBlcmNlbnRhZ2UudmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmKCAhaXNOYU4ocGFyc2VGbG9hdCh0aGlzLnBlcmNlbnRhZ2VOZXRBdmFpbFRpbWUudmFsdWUpKSApIHtcbiAgICAgICAgICAgIHN1bSArPSBwYXJzZUZsb2F0KHRoaXMucGVyY2VudGFnZU5ldEF2YWlsVGltZS52YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaXNOYU4oc3VtKSA/ICcnIDogc3VtO1xuICAgIH0pO1xuXG4gICAgbW9kZWwuZmluZCgncGhhc2UnKS5vYnNlcnZlKGZ1bmN0aW9uKG5ld1ZhbCkge1xuICAgICAgICB2YXIgYWN0aW9ucyA9IHtcbiAgICAgICAgICAgICdjYXBhY2l0eVBsYW5uaW5nJzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGJsb2Nrc0FjdGlvbnMuc2V0VmlzaWJsZShbJ2NhcGFjaXR5UGxhbm5pbmcnXSk7XG4gICAgICAgICAgICAgICAgYmxvY2tzQWN0aW9ucy5zZXRPcGVuKFsnY2FwYWNpdHlQbGFubmluZyddKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAncGhhc2UwJzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGJsb2Nrc0FjdGlvbnMuc2V0VmlzaWJsZShbJ2NhcGFjaXR5UGxhbm5pbmcnLCAncGhhc2UwJ10pO1xuICAgICAgICAgICAgICAgIGJsb2Nrc0FjdGlvbnMuc2V0T3BlbihbJ2NhcGFjaXR5UGxhbm5pbmcnLCAncGhhc2UwJ10pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdwaGFzZTMnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgYmxvY2tzQWN0aW9ucy5zZXRWaXNpYmxlKFsnY2FwYWNpdHlQbGFubmluZycsICdwaGFzZTMnXSk7XG4gICAgICAgICAgICAgICAgYmxvY2tzQWN0aW9ucy5zZXRPcGVuKFsnY2FwYWNpdHlQbGFubmluZycsICdwaGFzZTMnXSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2NhcGFjaXR5Q29uZmlybWF0aW9uJzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGJsb2Nrc0FjdGlvbnMuc2V0VmlzaWJsZShbJ2NhcGFjaXR5Q29uZmlybWF0aW9uJ10pO1xuICAgICAgICAgICAgICAgIGJsb2Nrc0FjdGlvbnMuc2V0T3BlbihbJ2NhcGFjaXR5Q29uZmlybWF0aW9uJ10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmKCAhIW5ld1ZhbCApIHtcbiAgICAgICAgICAgIGFjdGlvbnNbbmV3VmFsXSgpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBsaXN0ZW5lcnM7IiwiaW1wb3J0IHJvdXRlclN0b3JlIGZyb20gJy4vcm91dGVyL3N0b3Jlcy9yb3V0ZXInO1xuXG52YXIgbG9hZGluZyA9IHt9O1xuXG5sb2FkaW5nLnN0YXR1cyA9ICdpZGxlJztcblxubG9hZGluZy5iYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubG9hZGluZ19fYmFyJylbMF07XG5sb2FkaW5nLmNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5sb2FkaW5nJylbMF07XG5cbnZhciBsb2FkaW5nQmFyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnbG9hZGluZ0JhcicsXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRwZXJjZW50YWdlOiAwLFxuXHRcdFx0YWN0aXZlOiBmYWxzZVxuXHRcdH07XG5cdH0sXG5cdHJlcUNvbXBsZXRlZDogMCxcblx0cmVxVG90YWw6IDAsXG5cdHN0YXJ0OiBmdW5jdGlvbiAocGF5bG9hZCkge1xuXHRcdGNvbnNvbGUubG9nKCdoZWxsbycpO1xuXHRcdGlmKCBwYXlsb2FkLnN0YXRlLnJlc29sdmUgKSB7XG5cdFx0XHRpZiggdGhpcy50aW1lb3V0ICkge1xuXHRcdFx0XHRjbGVhclRpbWVvdXQoIHRoaXMudGltZW91dCApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiggdGhpcy5zdGF0dXMgPT09ICdzdGFydGVkJyApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdGFjdGl2ZTogdHJ1ZVxuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMucmVxVG90YWwgPSBPYmplY3Qua2V5cyhwYXlsb2FkLnN0YXRlLnJlc29sdmUpLmxlbmd0aDtcblxuXHRcdFx0dGhpcy5zdGF0dXMgPSAnc3RhcnRlZCc7XG5cblx0XHRcdHRoaXMuc2V0KDAuMik7XG5cdFx0fVxuXHR9LFxuXHRmaW5pc2hQcm9taXNlOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5yZXFDb21wbGV0ZWQrKztcblxuXHRcdGlmKCB0aGlzLnJlcUNvbXBsZXRlZCA+PSB0aGlzLnJlcVRvdGFsICkge1xuXHRcdFx0dGhpcy5jb21wbGV0ZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNldCggdGhpcy5yZXFDb21wbGV0ZWQgLyB0aGlzLnJlcVRvdGFsICk7XG5cdFx0fVxuXHR9LFxuXHRzZXQ6IGZ1bmN0aW9uICggbnVtYmVyICkge1xuXHRcdGlmKCB0aGlzLnN0YXR1cyAhPT0gJ3N0YXJ0ZWQnICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBwZXJjZW50YWdlID0gKCBudW1iZXIgKiAxMDAgKTtcblxuXHRcdHRoaXMucGVyY2VudGFnZSA9IG51bWJlcjtcblxuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0cGVyY2VudGFnZTogcGVyY2VudGFnZVxuXHRcdH0pO1xuXG5cdFx0aWYoIHRoaXMuaW5jcmVtZW50VGltZW91dCApIHtcblx0XHRcdGNsZWFyVGltZW91dCggdGhpcy5pbmNyZW1lbnRUaW1lb3V0ICk7XG5cdFx0fVxuXG5cdFx0dGhpcy5pbmNyZW1lbnRUaW1lb3V0ID0gc2V0VGltZW91dCggKCkgPT4gIHtcblx0XHRcdHRoaXMuaW5jcmVtZW50KCk7XG5cdFx0fSwgMjUwICk7XG5cdH0sXG5cdGluY3JlbWVudDogZnVuY3Rpb24gKCkge1xuXHRcdGlmKCB0aGlzLnBlcmNlbnRhZ2UgPj0gMSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgcmFuZG9tID0gMDtcblxuXHRcdHZhciBzdGF0dXMgPSB0aGlzLnBlcmNlbnRhZ2U7XG5cblx0ICAgIGlmIChzdGF0dXMgPj0gMCAmJiBzdGF0dXMgPCAwLjI1KSB7XG5cdFx0XHRyYW5kb20gPSAoTWF0aC5yYW5kb20oKSAqICg1IC0gMyArIDEpICsgMykgLyAxMDA7XG5cdCAgICB9IGVsc2UgaWYgKHN0YXR1cyA+PSAwLjI1ICYmIHN0YXR1cyA8IDAuNjUpIHtcblx0XHRcdHJhbmRvbSA9IChNYXRoLnJhbmRvbSgpICogMykgLyAxMDA7XG5cdCAgICB9IGVsc2UgaWYgKHN0YXR1cyA+PSAwLjY1ICYmIHN0YXR1cyA8IDAuOSkge1xuXHRcdFx0cmFuZG9tID0gKE1hdGgucmFuZG9tKCkgKiAyKSAvIDEwMDtcblx0ICAgIH0gZWxzZSBpZiAoc3RhdHVzID49IDAuOSAmJiBzdGF0dXMgPCAwLjk5KSB7XG5cdCAgICBcdHJhbmRvbSA9IDAuMDA1O1xuXHQgICAgfSBlbHNlIHtcblx0ICAgIFx0cmFuZG9tID0gMDtcblx0ICAgIH1cblxuXHQgICAgdmFyIHBlcmNlbnRhZ2UgPSB0aGlzLnBlcmNlbnRhZ2UgKyByYW5kb207XG5cblx0ICAgIHRoaXMuc2V0KCBwZXJjZW50YWdlICk7XG5cdH0sXG5cdGNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5zZXQoMSk7XG5cblx0XHR0aGlzLnN0YXR1cyA9ICdpZGxlJztcblx0XHR0aGlzLnJlcVRvdGFsID0gMDtcblx0XHR0aGlzLnJlcUNvbXBsZXRlZCA9IDA7XG5cblx0XHRpZiggdGhpcy50aW1lb3V0ICkge1xuXHRcdFx0Y2xlYXJUaW1lb3V0KCB0aGlzLnRpbWVvdXQgKTtcblx0XHR9XG5cblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXHRcdHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0X3RoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRwZXJjZW50YWdlOiAwLFxuXHRcdFx0XHRhY3RpdmU6IGZhbHNlXG5cdFx0XHR9KTtcblx0XHR9LCAyNTAgKTtcblx0fSxcblx0Y29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiAoKSB7XG5cdFx0cm91dGVyU3RvcmUub24oJ3N0YXRlQ2hhbmdlU3RhcnQnLCB0aGlzLnN0YXJ0KTtcblx0XHRyb3V0ZXJTdG9yZS5vbignc3RhdGVQcm9taXNlRmluaXNoZWQnLCB0aGlzLmZpbmlzaFByb21pc2UpO1xuXHR9LFxuXHRjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuXHRcdHJvdXRlclN0b3JlLm9mZignc3RhdGVDaGFuZ2VTdGFydCcsIHRoaXMuc3RhcnQpO1xuXHRcdHJvdXRlclN0b3JlLm9mZignc3RhdGVQcm9taXNlRmluaXNoZWQnLCB0aGlzLmZpbmlzaFByb21pc2UpO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cblx0XHR2YXIgbG9hZGluZ0NsYXNzID0gY3goe1xuXHRcdFx0bG9hZGluZzogdHJ1ZSxcblx0XHRcdGFjdGl2ZTogdGhpcy5zdGF0ZS5hY3RpdmVcblx0XHR9KTtcblxuXHRcdHZhciBzdHlsZSA9IHtcblx0XHRcdHdpZHRoOiB0aGlzLnN0YXRlLnBlcmNlbnRhZ2UgKyAnJSdcblx0XHR9O1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogbG9hZGluZ0NsYXNzIH0sIFxuXHRcdCAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJsb2FkaW5nX19iYXJcIiwgc3R5bGU6IHN0eWxlIH0sIFxuXHRcdCAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImxvYWRpbmdfX3BlcmNlbnRhZ2VcIn0pXG5cdFx0ICAgICAgKVxuXHRcdCAgICApXG5cdFx0XHQpO1xuXHR9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxvYWRpbmdCYXI7IiwidmFyIGFkbWluID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnYWRtaW4nLFxuXHRyZW5kZXIoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXG5cdFx0XHRcdFwiQWRtaW5pc3RyYXRpb24gUGFnZVwiXG5cdFx0XHQpXG5cdFx0XHQpO1xuXHR9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgYWRtaW47IiwiaW1wb3J0IGZvcm1Db25maWcgZnJvbSAnLi4vZm9ybS9jb25maWcnO1xuaW1wb3J0IGxpc3RlbmVycyBmcm9tICcuLi9mb3JtL2xpc3RlbmVycyc7XG5pbXBvcnQgY29udHJvbGxlciBmcm9tICcuLi9mb3JtL2NvbnRyb2xsZXInO1xuXG5pbXBvcnQgYWxlcnQgZnJvbSAnLi4vYWN0aW9ucy9hbGVydCc7XG5pbXBvcnQgeGhyIGZyb20gJy4uL3hocic7XG5pbXBvcnQgYmxvY2tzQWN0aW9ucyBmcm9tICcuLi9hY3Rpb25zL2Jsb2Nrcyc7XG5cbnZhciBlY2FyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnZWNhcicsXG5cdGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoICkge1xuXHRcdHZhciBmb3JtQnVpbGRlciA9IHt9O1xuXG5cdFx0aWYoIHRoaXMucHJvcHMuZGF0YSAmJiB0aGlzLnByb3BzLmRhdGEuZ2V0RGV0YWlscyApIHtcblx0XHRcdGZvcm1CdWlsZGVyLm1vZGVsID0gdGhpcy5wcm9wcy5kYXRhLmdldERldGFpbHM7XG5cdFx0fVxuXG5cdFx0Zm9ybUJ1aWxkZXIuY29udHJvbGxlciA9IGNvbnRyb2xsZXI7XG5cblx0XHR2YXIgZm9ybVZpZXcgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGZvcm1Db25maWcpKTtcblxuXHRcdGZvcm1WaWV3LmJ1dHRvbkNvbnRhaW5lci5pdGVtcyA9IHtcblx0XHRcdHN1Ym1pdEJ1dHRvbjoge1xuXHRcdFx0XHR0eXBlOiBcImJ1dHRvblwiLFxuXHRcdFx0XHR0ZXh0OiBcIlN1Ym1pdFwiLFxuXHRcdFx0XHRjbGFzc05hbWU6IFwic3VibWl0XCJcblx0XHRcdH0sXG5cdFx0XHRzYXZlQnV0dG9uOiB7XG5cdFx0XHRcdHR5cGU6IFwiYnV0dG9uXCIsXG5cdFx0XHRcdHRleHQ6IFwiU2F2ZVwiLFxuXHRcdFx0XHRjbGFzc05hbWU6IFwic2F2ZVwiXG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGZvcm1CdWlsZGVyLnZpZXcgPSBmb3JtVmlldztcblxuXHRcdHZhciBmb3JtID0gYWRhcHQuZm9ybSgnbmFtZScsIGZvcm1CdWlsZGVyKTtcblxuXHRcdHZhciBtb2RlbCA9IGZvcm0ubW9kZWw7XG5cblx0XHRsaXN0ZW5lcnMoZm9ybSk7XG5cblx0XHRmdW5jdGlvbiBpc0FycmF5KHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWx1ZSkuc2xpY2UoOCwgLTEpID09PSAnQXJyYXknO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWx1ZSkuc2xpY2UoOCwgLTEpID09PSAnT2JqZWN0Jztcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBjb252ZXJ0KGRhdGEsIG5ld0RhdGEpIHtcblx0XHRcdGlmKCBpc0FycmF5KGRhdGEpICkge1xuXHRcdFx0XHRuZXdEYXRhID0gW107XG5cblx0XHRcdFx0Zm9yKCB2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrICkge1xuXHRcdFx0XHRcdG5ld0RhdGEucHVzaCh7fSk7XG5cblx0XHRcdFx0XHRjb252ZXJ0KGRhdGFbaV0sIG5ld0RhdGFbaV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYoIGlzT2JqZWN0KGRhdGEpICkge1xuXHRcdFx0XHRmb3IoIHZhciBpIGluIGRhdGEgKSB7XG5cdFx0XHRcdFx0aWYoIHR5cGVvZiBkYXRhW2ldLnZhbHVlICE9PSAndW5kZWZpbmVkJyApIHtcblx0XHRcdFx0XHRcdGlmKCBpc09iamVjdChkYXRhW2ldLnZhbHVlKSApIHtcblx0XHRcdFx0XHRcdFx0bmV3RGF0YVtpXSA9IHt9O1xuXHRcdFx0XHRcdFx0XHRjb252ZXJ0KGRhdGFbaV0udmFsdWUsIG5ld0RhdGFbaV0pO1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmKCBpc0FycmF5KGRhdGFbaV0udmFsdWUpICkge1xuXHRcdFx0XHRcdFx0XHRuZXdEYXRhW2ldID0gW107XG5cdFx0XHRcdFx0XHRcdGZvciggdmFyIHQgPSAwOyB0IDwgZGF0YVtpXS52YWx1ZS5sZW5ndGg7IHQrKyApIHtcblx0XHRcdFx0XHRcdFx0XHRuZXdEYXRhW2ldLnB1c2goe30pO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnZlcnQoZGF0YVtpXS52YWx1ZVt0XSwgbmV3RGF0YVtpXVt0XSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG5ld0RhdGFbaV0gPSBkYXRhW2ldLnZhbHVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRuZXdEYXRhW2ldID0gZGF0YVtpXS52YWx1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG5ld0RhdGEgPSBkYXRhO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHZhciBmaXJlZCA9IGZhbHNlO1xuXHRcdG1vZGVsLmZpbmQoJ3NhdmVCdXR0b24nKS5vYnNlcnZlKGZ1bmN0aW9uIChuZXdWYWwsIG9sZFZhbCl7XG5cdFx0XHRpZiggIWZpcmVkICYmIG5ld1ZhbCApIHtcblx0XHRcdFx0ZmlyZWQgPSB0cnVlO1xuXHRcdFx0XHR2YXIgbmV3RGF0YSA9IHt9O1xuXHRcdFx0XHRjb252ZXJ0KG1vZGVsLml0ZW1zLCBuZXdEYXRhKTtcblxuXHRcdFx0XHR2YXIgaGVhZGVycyA9IHtcblx0XHRcdFx0XHQnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuXHRcdFx0XHRcdCdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcblx0XHRcdFx0fTtcblxuXG5cdFx0XHRcdGFsZXJ0Lm9wZW4oe1xuXHRcdFx0XHRcdHdhaXRpbmc6IHRydWUsXG5cdFx0XHRcdFx0aGVhZGVyOiAnUGxlYXNlIFdhaXQuLicsXG5cdFx0XHRcdFx0bWVzc2FnZTogJ1lvdXIgZUNBUiBpcyBiZWluZyBzYXZlZCcsXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHhocignUFVUJywgJy9yZXN0L3dvcmtmbG93Jywge30sIEpTT04uc3RyaW5naWZ5KG5ld0RhdGEpLCBoZWFkZXJzKVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0XHRcdFx0YWxlcnQub3Blbih7XG5cdFx0XHRcdFx0XHRcdHN1Y2Nlc3M6IHRydWUsXG5cdFx0XHRcdFx0XHRcdGhlYWRlcjogJ1N1Y2Nlc3MnLFxuXHRcdFx0XHRcdFx0XHRtZXNzYWdlOiAnWW91ciBlQ0FSIGhhcyBiZWVuIHNhdmVkJyxcblx0XHRcdFx0XHRcdFx0YnV0dG9uczogW1xuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHR5cGU6ICdsaW5rJyxcblx0XHRcdFx0XHRcdFx0XHRcdGxpbms6ICcvIy9lY2FyLycgKyBkYXRhLndvcmtmbG93SWQsXG5cdFx0XHRcdFx0XHRcdFx0XHR0ZXh0OiAnQ29udGludWUnXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRdXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9LCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRhbGVydC5vcGVuKHtcblx0XHRcdFx0XHRcdFx0ZXJyb3I6IHRydWUsXG5cdFx0XHRcdFx0XHRcdGhlYWRlcjogJ1NvbWV0aGluZyB3ZW50IHdyb25nJyxcblx0XHRcdFx0XHRcdFx0bWVzc2FnZTogJ0FuIGVycm9yIGhhcyBvY2N1cmVkLCBwbGVhc2UgdHJ5IGFnYWluIGxhdGVyJyxcblx0XHRcdFx0XHRcdFx0YnV0dG9uczogW1xuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHR5cGU6ICdidXR0b24nLFxuXHRcdFx0XHRcdFx0XHRcdFx0dGV4dDogJ0NvbnRpbnVlJ1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2UgaWYoIG5ld1ZhbCApIHtcblx0XHRcdFx0ZmlyZWQgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdG1vZGVsLmZpbmQoJ3BwYXBMZXZlbCcpLm9ic2VydmUoZnVuY3Rpb24gKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRpZiggbmV3VmFsICkge1xuXHRcdFx0XHRhbGVydC5vcGVuKHtcblx0XHRcdFx0XHR3YXJuaW5nOiB0cnVlLFxuXHRcdFx0XHRcdGhlYWRlcjogJ0lzIHRoaXMgY29ycmVjdD8nLFxuXHRcdFx0XHRcdG1lc3NhZ2U6ICdQbGVhc2UgZW5zdXJlIHRoYXQgdGhlIFBQQVAgbGV2ZWwgeW91IGhhdmUgc2VsZWN0ZWQgaXMgY29ycmVjdCcsXG5cdFx0XHRcdFx0YnV0dG9uczogW1xuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHR0eXBlOiAnYnV0dG9uJyxcblx0XHRcdFx0XHRcdFx0dGV4dDogJ0NvbnRpbnVlJ1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdF1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR2YXIgY29udGFjdERldGFpbHNQcmlzdGluZSA9IHRydWU7XG5cblx0XHR2YXIgY29udGFjdEZpcmVkID0gZmFsc2U7XG5cdFx0Zm9ybS5vYnNlcnZlLmFkZExpc3RlbmVyKCBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgZmllbGRzID0gW1xuXHRcdFx0XHRtb2RlbC5maW5kKCdzdXBwbGllck5hbWUnKVswXS52YWx1ZSxcblx0XHRcdFx0bW9kZWwuZmluZCgnY291bnR5JylbMF0udmFsdWUsXG5cdFx0XHRcdG1vZGVsLmZpbmQoJ3F1YWxpdHlHU0RCJylbMF0udmFsdWUsXG5cdFx0XHRcdG1vZGVsLmZpbmQoJ2FkZHJlc3MnKVswXS52YWx1ZSxcblx0XHRcdFx0bW9kZWwuZmluZCgnY291bnRyeScpWzBdLnZhbHVlLFxuXHRcdFx0XHRtb2RlbC5maW5kKCdjaXR5JylbMF0udmFsdWUsXG5cdFx0XHRcdG1vZGVsLmZpbmQoJ21hbnVmYWN0dXJpbmdHU0RCJylbMF0udmFsdWUsXG5cdFx0XHRcdG1vZGVsLmZpbmQoJ3N1cHBsaWVyUmVwcmVzZW50YXRpdmVOYW1lJylbMF0udmFsdWUsXG5cdFx0XHRcdG1vZGVsLmZpbmQoJ3N1cHBsaWVyUmVwcmVzZW50YXRpdmVQaG9uZScpWzBdLnZhbHVlLFxuXHRcdFx0XHRtb2RlbC5maW5kKCdzdXBwbGllclJlcHJlc2VudGF0aXZlUm9sZScpWzBdLnZhbHVlLFxuXHRcdFx0XHRtb2RlbC5maW5kKCdzdXBwbGllclJlcHJlc2VudGF0aXZlRW1haWwnKVswXS52YWx1ZSxcblx0XHRcdFx0bW9kZWwuZmluZCgnamxyU3RhRW1haWwnKVswXS52YWx1ZSxcblx0XHRcdFx0bW9kZWwuZmluZCgnamxyU3RhTmFtZScpWzBdLnZhbHVlLFxuXHRcdFx0XHRtb2RlbC5maW5kKCdqbHJTdGFQaG9uZScpWzBdLnZhbHVlXG5cdFx0XHRdO1xuXHRcdFx0cmV0dXJuIGZpZWxkcy5qb2luKCcnKTtcblx0XHR9LCBmdW5jdGlvbiAobmV3VmFsKSB7XG5cdFx0XHRpZiggY29udGFjdEZpcmVkICkge1xuXHRcdFx0XHRjb250YWN0RGV0YWlsc1ByaXN0aW5lID0gZmFsc2U7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb250YWN0RmlyZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0gKTtcblxuXHRcdGZ1bmN0aW9uIHN1Ym1pdCgpIHtcblx0XHRcdGFsZXJ0Lm9wZW4oe1xuXHRcdFx0XHR3YWl0aW5nOiB0cnVlLFxuXHRcdFx0XHRoZWFkZXI6ICdQbGVhc2UgV2FpdC4uJyxcblx0XHRcdFx0bWVzc2FnZTogJ1lvdXIgZUNBUiBpcyBiZWluZyBzdWJtaXR0ZWQnLFxuXHRcdFx0fSk7XG5cblx0XHRcdHhocignUFVUJywgJy9yZXN0L3dvcmtmbG93L3Byb2dyZXNzJywge30sIEpTT04uc3RyaW5naWZ5KG5ld0RhdGEpLCBoZWFkZXJzKVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbigpe1xuXHRcdFx0XHRcdGFsZXJ0Lm9wZW4oe1xuXHRcdFx0XHRcdFx0c3VjY2VzczogdHJ1ZSxcblx0XHRcdFx0XHRcdGhlYWRlcjogJ1N1Y2Nlc3MnLFxuXHRcdFx0XHRcdFx0bWVzc2FnZTogJ1lvdXIgZUNBUiBoYXMgYmVlbiBzdWJtaXR0ZWQnLFxuXHRcdFx0XHRcdFx0YnV0dG9uczogW1xuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0dHlwZTogJ2xpbmsnLFxuXHRcdFx0XHRcdFx0XHRcdGxpbms6ICcvIy9jdXJyZW50Jyxcblx0XHRcdFx0XHRcdFx0XHR0ZXh0OiAnR28gdG8geW91ciBlQ0FScydcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9LCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0YWxlcnQub3Blbih7XG5cdFx0XHRcdFx0XHRlcnJvcjogdHJ1ZSxcblx0XHRcdFx0XHRcdGhlYWRlcjogJ1NvbWV0aGluZyB3ZW50IHdyb25nJyxcblx0XHRcdFx0XHRcdG1lc3NhZ2U6ICdBbiBlcnJvciBoYXMgb2NjdXJlZCwgcGxlYXNlIHRyeSBhZ2FpbiBsYXRlcicsXG5cdFx0XHRcdFx0XHRidXR0b25zOiBbXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHR0eXBlOiAnYnV0dG9uJyxcblx0XHRcdFx0XHRcdFx0XHR0ZXh0OiAnQ29udGludWUnXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdF1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0dmFyIHN1Ym1pdEZpcmVkID0gZmFsc2U7XG5cdFx0bW9kZWwuZmluZCgnc3VibWl0QnV0dG9uJykub2JzZXJ2ZShmdW5jdGlvbiAobmV3VmFsLCBvbGRWYWwpe1xuXHRcdFx0aWYoICFzdWJtaXRGaXJlZCAmJiBuZXdWYWwgKSB7XG5cdFx0XHRcdHN1Ym1pdEZpcmVkID0gdHJ1ZTtcblx0XHRcdFx0dmFyIG5ld0RhdGEgPSB7fTtcblx0XHRcdFx0Y29udmVydChtb2RlbC5pdGVtcywgbmV3RGF0YSk7XG5cblx0XHRcdFx0dmFyIGhlYWRlcnMgPSB7XG5cdFx0XHRcdFx0J0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcblx0XHRcdFx0XHQnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG5cdFx0XHRcdH07XG5cblxuXG5cdFx0XHRcdGlmKCBjb250YWN0RGV0YWlsc1ByaXN0aW5lICkge1xuXHRcdFx0XHRcdGFsZXJ0Lm9wZW4oe1xuXHRcdFx0XHRcdFx0d2FybmluZzogdHJ1ZSxcblx0XHRcdFx0XHRcdGhlYWRlcjogJ0FyZSB5b3Ugc3VyZT8nLFxuXHRcdFx0XHRcdFx0bWVzc2FnZTogJ1lvdXIgY29udGFjdCBkZXRhaWxzIGhhdmUgbm90IGJlZW4gbW9kaWZpZWQuIFBsZWFzZSBtYWtlIHN1cmUgdGhleVxcJ3JlIHVwIHRvIGRhdGUgYmVmb3JlIGNvbnRpbnVpbmcuJyxcblx0XHRcdFx0XHRcdGJ1dHRvbnM6IFtcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHR5cGU6ICdjYW5jZWwnLFxuXHRcdFx0XHRcdFx0XHRcdHRleHQ6ICdDYW5jZWwnXG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHR0eXBlOiAnYnV0dG9uJyxcblx0XHRcdFx0XHRcdFx0XHR0ZXh0OiAnQ29udGludWUnLFxuXHRcdFx0XHRcdFx0XHRcdGNhbGxiYWNrOiBzdWJtaXRcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHN1Ym1pdCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYoIG5ld1ZhbCApIHtcblx0XHRcdFx0c3VibWl0RmlyZWQgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHZhciBkb21Ob2RlID0gdGhpcy5nZXRET01Ob2RlKCk7XG5cblx0XHRmb3JtLnJlbmRlciggZG9tTm9kZS5xdWVyeVNlbGVjdG9yQWxsKCcuZm9ybScpWzBdICk7XG5cdFx0Zm9ybS5vYnNlcnZlLmRpZ2VzdCgpO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImZvcm1cIn0pLCBcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInN1bW1hcnliYXJcIiwgc3R5bGU6ICB7IGRpc3BsYXk6ICdub25lJ30gfSwgXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInN1bW1hcnliYXJfX2hlYWRlclwifSwgXG5cdFx0XHRcdFx0XHRcIlByb2Nlc3NlcyBTdW1tYXJ5XCIsIFxuXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwic3VtbWFyeWJhcl9fY2xvc2VcIn0sIFxuXHRcdFx0XHRcdFx0XHRcIkhpZGUgU3VtbWFyeSBCYXJcIiwgXG5cblx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS1mdyBmYS10aW1lc1wifSlcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpLCBcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwic3VtbWFyeWJhcl9fcHJvY2Vzc2VzIGNsZWFyXCJ9LCBcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJ1bFwiLCB7Y2xhc3NuYW1lOiBcInN1bW1hcnliYXJfX3Byb2Nlc3Nlcy0tbGlzdCBcIn0sIFxuXHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwibGlcIiwge2NsYXNzTmFtZTogXCJzdW1tYXJ5YmFyX19wcm9jZXNzZXMtLWl0ZW0gY2xlYXIgc3VtbWFyeWJhcl9fcHJvY2Vzc2VzLS1iZWxvd1wifSwgXG5cdFx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJzdW1tYXJ5YmFyX19wcm9jZXNzZXMtLW5hbWVcIn0sIFxuXHRcdFx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImg0XCIsIG51bGwsIFwiUHJvY2VzcyAxXCIpLCBcblx0XHRcdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoNVwiLCBudWxsLCBcIkFzc2VtYmx5XCIpXG5cdFx0XHRcdFx0XHRcdFx0KSwgXG5cdFx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJzdW1tYXJ5YmFyX19wcm9jZXNzZXMtLXBlcmNlbnRcIn0sIFxuXHRcdFx0XHRcdFx0XHRcdFx0XCItMjAlXCJcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdCksIFxuXHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwibGlcIiwge2NsYXNzTmFtZTogXCJzdW1tYXJ5YmFyX19wcm9jZXNzZXMtLWl0ZW0gY2xlYXIgc3VtbWFyeWJhcl9fcHJvY2Vzc2VzLS1hYm92ZVwifSwgXG5cdFx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJzdW1tYXJ5YmFyX19wcm9jZXNzZXMtLW5hbWVcIn0sIFxuXHRcdFx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImg0XCIsIG51bGwsIFwiUHJvY2VzcyAyXCIpLCBcblx0XHRcdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoNVwiLCBudWxsLCBcIk5hbWUgSGVyZVwiKVxuXHRcdFx0XHRcdFx0XHRcdCksIFxuXHRcdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwic3VtbWFyeWJhcl9fcHJvY2Vzc2VzLS1wZXJjZW50XCJ9LCBcblx0XHRcdFx0XHRcdFx0XHRcdFwiODAlXCJcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdCksIFxuXHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwibGlcIiwge2NsYXNzTmFtZTogXCJzdW1tYXJ5YmFyX19wcm9jZXNzZXMtLWl0ZW0gY2xlYXJcIn0sIFxuXHRcdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwic3VtbWFyeWJhcl9fcHJvY2Vzc2VzLS1uYW1lXCJ9LCBcblx0XHRcdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoNFwiLCBudWxsLCBcIlByb2Nlc3MgM1wiKSwgXG5cdFx0XHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaDVcIiwgbnVsbCwgXCJOYW1lIEhlcmVcIilcblx0XHRcdFx0XHRcdFx0XHQpLCBcblx0XHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcInN1bW1hcnliYXJfX3Byb2Nlc3Nlcy0tcGVyY2VudFwifSwgXG5cdFx0XHRcdFx0XHRcdFx0XHRcIjAlXCJcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpLCBcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwic3VtbWFyeWJhcl9fY2hhcnRcIn0sIFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInN1bW1hcnliYXJfX2xlZ2VuZCBjbGVhclwifSwgXG5cdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwic3VtbWFyeWJhcl9fbGVnZW5kLS1pdGVtXCJ9LCBcblx0XHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcInN1bW1hcnliYXJfX2xlZ2VuZC0tYmxvY2tcIiwgc3R5bGU6ICB7IGJhY2tncm91bmQ6ICcjQ0ZFMEMyJ30gfSksIFxuXG5cdFx0XHRcdFx0XHRcdFx0XCJKTFIgRGVtYW5kXCJcblx0XHRcdFx0XHRcdFx0KSwgXG5cdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwic3VtbWFyeWJhcl9fbGVnZW5kLS1pdGVtXCJ9LCBcblx0XHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcInN1bW1hcnliYXJfX2xlZ2VuZC0tYmxvY2tcIiwgc3R5bGU6ICB7IGJhY2tncm91bmQ6ICcjRENEQ0RDJ30gfSksIFxuXG5cdFx0XHRcdFx0XHRcdFx0XCJXZWVrbHkvSG91cmx5IFBhcnRzIEF2YWlsYWJsZSBmb3IgU2hpcG1lbnRcIlxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQpLCBcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIiwge2NsYXNzTmFtZTogXCJzdW1tYXJ5YmFyX19jaGFydC0tY2FudmFzXCIsIGhlaWdodDogXCIxMzBcIn0pXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0XHQpO1xuXHR9XG59KTtcblxuZWNhci5yZXNvbHZlID0ge1xuXHQnZ2V0RGV0YWlscyc6IGZ1bmN0aW9uICggKSB7XG5cdFx0cmV0dXJuIHhocignR0VUJywgJy9yZXN0L3N1cHBsaWVyRGV0YWlscycpO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBlY2FyOyIsImltcG9ydCByb3V0ZXIgZnJvbSAnLi4vcm91dGVyL3JvdXRlcic7XG5cbmltcG9ydCB4aHIgZnJvbSAnLi4veGhyJztcbmltcG9ydCBhY3Rpb25zIGZyb20gJy4uL2FjdGlvbnMvY3VycmVudCc7XG5pbXBvcnQgc3RvcmUgZnJvbSAnLi4vc3RvcmVzL2N1cnJlbnQnO1xuXG5mdW5jdGlvbiBmaW5kQ2xvc2VzdFBhcmVudCggZXZlbnQsIGNsYXNzTmFtZSApIHtcblx0dmFyIHBhcmVudCA9IGV2ZW50LnBhcmVudE5vZGU7XG4gICAgd2hpbGUgKHBhcmVudCE9ZG9jdW1lbnQuYm9keSAmJiBwYXJlbnQgIT0gbnVsbCkge1xuICAgICAgaWYgKChwYXJlbnQpICYmIHBhcmVudC5jbGFzc05hbWUgJiYgcGFyZW50LmNsYXNzTmFtZS5pbmRleE9mKGNsYXNzTmFtZSkgIT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIHBhcmVudDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcmVudCA9IHBhcmVudCA/IHBhcmVudC5wYXJlbnROb2RlIDogbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5cbnZhciBjdXJyZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnY3VycmVudCcsXG5cdGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cdFx0c3RvcmUub24oJ3NlbGVjdEl0ZW0nLCB0aGlzLnVwZGF0ZVNlbGVjdGVkKTtcblx0fSxcblx0Y29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcblx0XHRzdG9yZS5vZmYoJ3NlbGVjdEl0ZW0nLCB0aGlzLnVwZGF0ZVNlbGVjdGVkKTtcblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuaGFuZGxlQm9keUNsaWNrKTtcblx0ICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgdGhpcy5oYW5kbGVCb2R5Q29udGV4dCk7XG5cdCAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5oYW5kbGVCb2R5S2V5ZG93bik7XG5cdH0sXG5cdHVwZGF0ZVNlbGVjdGVkOiBmdW5jdGlvbiAocGF5bG9hZCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0c2VsZWN0ZWQ6IHBheWxvYWRcblx0XHR9KTtcblx0fSxcblx0aGFuZGxlQm9keUNsaWNrOiBmdW5jdGlvbiAoZSkge1xuXHRcdGlmKCAhZmluZENsb3Nlc3RQYXJlbnQoZS50YXJnZXQsICdjdXJyZW50X19yb3cnKSApIHtcbiAgICAgXHRcdGlmKCAhZmluZENsb3Nlc3RQYXJlbnQoZS50YXJnZXQsICdjb250ZXh0bWVudScpICkge1xuICAgICAgIFx0XHRcdGlmKCB0aGlzLnN0YXRlLmNvbnRleHRNZW51Lm9wZW4gKSB7XG5cdFx0ICAgICAgICAgXHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0XHRcdGNvbnRleHRNZW51OiB7XG5cdFx0XHRcdFx0XHRcdG9wZW46IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRsb2NhdGlvbjoge1xuXHRcdFx0XHRcdFx0XHRcdHg6IDAsXG5cdFx0XHRcdFx0XHRcdFx0eTogMFxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRtdWx0aXBsZTogZmFsc2Vcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdGFjdGlvbnMuY2xlYXJTZWxlY3RlZCgpO1xuXHQgICAgICAgIFx0fVxuXHQgICAgICAgIH1cbiAgICBcdH0gZWxzZSB7XG4gICAgXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRjb250ZXh0TWVudToge1xuXHRcdFx0XHRcdG9wZW46IGZhbHNlLFxuXHRcdFx0XHRcdGxvY2F0aW9uOiB7XG5cdFx0XHRcdFx0XHR4OiAwLFxuXHRcdFx0XHRcdFx0eTogMFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bXVsdGlwbGU6IGZhbHNlXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuICAgIFx0fVxuXHR9LFxuXHRoYW5kbGVCb2R5Q29udGV4dDogZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgb3ZlckNvbnRleHRNZW51ID0gIWZpbmRDbG9zZXN0UGFyZW50KGUudGFyZ2V0LCAnY29udGV4dG1lbnUnKTtcblxuXHRcdGlmKCAhb3ZlckNvbnRleHRNZW51ICkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblx0XHRcblx0XHRpZiggIWZpbmRDbG9zZXN0UGFyZW50KGUudGFyZ2V0LCAnY3VycmVudF9fcm93JykgJiYgb3ZlckNvbnRleHRNZW51ICkge1xuICBcdFx0XHRpZiggdGhpcy5zdGF0ZS5jb250ZXh0TWVudS5vcGVuICkge1xuICAgICBcdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0XHRjb250ZXh0TWVudToge1xuXHRcdFx0XHRcdFx0b3BlbjogZmFsc2UsXG5cdFx0XHRcdFx0XHRsb2NhdGlvbjoge1xuXHRcdFx0XHRcdFx0XHR4OiAwLFxuXHRcdFx0XHRcdFx0XHR5OiAwXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0bXVsdGlwbGU6IGZhbHNlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRhY3Rpb25zLmNsZWFyU2VsZWN0ZWQoKTtcbiAgICAgXHRcdH1cbiAgICBcdH1cblx0fSxcblx0aGFuZGxlQm9keUtleWRvd246IGZ1bmN0aW9uIChlKSB7XG5cdFx0aWYoIGUua2V5Q29kZSA9PT0gMjcgJiYgdGhpcy5zdGF0ZS5jb250ZXh0TWVudS5vcGVuICkge1xuICAgIFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0Y29udGV4dE1lbnU6IHtcblx0XHRcdFx0XHRvcGVuOiBmYWxzZSxcblx0XHRcdFx0XHRsb2NhdGlvbjoge1xuXHRcdFx0XHRcdFx0eDogMCxcblx0XHRcdFx0XHRcdHk6IDBcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuICAgIFx0fVxuXHR9LFxuXHRjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5oYW5kbGVCb2R5Q2xpY2spO1xuXHQgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCB0aGlzLmhhbmRsZUJvZHlDb250ZXh0KTtcblx0ICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmhhbmRsZUJvZHlLZXlkb3duKTtcblx0fSxcblx0aGFuZGxlQ29udGV4dE1lbnU6IGZ1bmN0aW9uIChlKSB7XG5cdFx0dmFyIF90aGlzID0gdGhpcztcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHZhciByb3cgPSBmaW5kQ2xvc2VzdFBhcmVudChlLnRhcmdldCwgJ2N1cnJlbnRfX3JvdycpO1xuXG5cdCAgICB2YXIgaWQgPSByb3cuYXR0cmlidXRlc1snZGF0YS1pZCddLnZhbHVlO1xuXG5cdCAgICB2YXIgc2VsZWN0ZWQgPSB0aGlzLnN0YXRlLnNlbGVjdGVkIHx8IFtdO1xuXHQgICAgdmFyIGluZGV4ID0gc2VsZWN0ZWQuaW5kZXhPZihpZCk7XG5cblx0ICAgIHZhciBtdWx0aXBsZSA9IGZhbHNlO1xuXG5cdCAgICB2YXIgbG9jYXRpb24gPSB7fTtcblx0ICAgIHZhciBvcGVuO1xuXG5cdFx0aWYoIGluZGV4ID4gLTEgKSB7XG5cdFx0XHRpZiggc2VsZWN0ZWQubGVuZ3RoID09PSAxICkge1xuXHRcdFx0XHQvLyB0aGUgdXNlciBoYXMgcmlnaHQgY2xpY2tlZCBvbiB0aGUgc2FtZSBvbmUgdGhhdCB0aGV5IGp1c3Qgc2VsZWN0ZWRcblx0XHRcdFx0aWYoIF90aGlzLnN0YXRlLmNvbnRleHRNZW51LmxvY2F0aW9uLnggPT09IGUuY2xpZW50WCAmJiBfdGhpcy5zdGF0ZS5jb250ZXh0TWVudS5sb2NhdGlvbi55ID09PSBlLmNsaWVudFkgKSB7XG5cblx0XHRcdFx0XHQvLyBpZiB0aGV5IGNsaWNrIGluIHRoZSBzYW1lIHBsYWNlLCBoaWRlIGl0XG5cblx0XHRcdFx0XHRvcGVuID0gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gaWYgdGhleSBjbGljayBpbiBhIGRpZmZlcmVudCBwbGFjZSwgbW92ZSBpdFxuXG5cdFx0XHRcdFx0b3BlbiA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIG11bHRpcGxlIGl0ZW1zIHNlbGVjdGVkLCBpbmNsdWRpbmcgdGhlIG9uZSB0aGUgdXNlciByaWdodCBjbGlja2VkIG9uXG5cdFx0XHRcdG9wZW4gPSB0cnVlO1xuXHRcdFx0XHRtdWx0aXBsZSA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHRoZSBvbmUgcmlnaHQgY2xpY2tlZCBpc24ndCBzZWxlY3RlZFxuXHRcdFx0aWYoIHNlbGVjdGVkLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdFx0Ly8gYWRkIHRoZSBzZWxlY3RlZCBvbmVcblxuXHRcdFx0XHRzZWxlY3RlZC5wdXNoKGlkKTtcblx0XHRcdFx0b3BlbiA9IHRydWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBtdWx0aXBsZSBzZWxlY3RlZCwgbm90IHRoaXMgb25lLCBzbyB3ZSBuZWVkIHRvIGNsZWFyIHNlbGVjdGVkIGFuZCBqdXN0IHNldCBpdCB0byB0aGlzXG5cblx0XHRcdFx0b3BlbiA9IHRydWU7XG5cdFx0XHRcdHNlbGVjdGVkID0gW2lkXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiggb3BlbiApIHtcblx0XHRcdGxvY2F0aW9uLnggPSBlLmNsaWVudFg7XG5cdFx0XHRsb2NhdGlvbi55ID0gZS5jbGllbnRZO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsb2NhdGlvbi55ID0gMDtcblx0XHRcdGxvY2F0aW9uLnggPSAwO1xuXHRcdH1cblxuXHRcdF90aGlzLnNldFN0YXRlKHtcblx0XHRcdGNvbnRleHRNZW51OiB7XG5cdFx0XHRcdG9wZW46IG9wZW4sXG5cdFx0XHRcdGxvY2F0aW9uOiBsb2NhdGlvbixcblx0XHRcdFx0bXVsdGlwbGU6IG11bHRpcGxlXG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRhY3Rpb25zLnNldFNlbGVjdGVkKHNlbGVjdGVkKTtcblx0fSxcblx0c2VsZWN0Um93OiBmdW5jdGlvbiAoZSkge1xuXHQgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdCAgICB2YXIgcm93ID0gZmluZENsb3Nlc3RQYXJlbnQoZS50YXJnZXQsICdjdXJyZW50X19yb3cnKTtcblxuXHQgICAgdmFyIHNlbGVjdGVkID0gdGhpcy5zdGF0ZS5zZWxlY3RlZDtcblx0ICAgIHZhciBpZCA9IHJvdy5hdHRyaWJ1dGVzWydkYXRhLWlkJ10udmFsdWU7XG5cdFx0dmFyIGluZGV4ID0gc2VsZWN0ZWQuaW5kZXhPZihpZCk7XG5cblx0XHRpZiggaW5kZXggPiAtMSApIHtcblx0XHRcdHNlbGVjdGVkLnNwbGljZShpbmRleCwgMSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNlbGVjdGVkLnB1c2goaWQpO1xuXHRcdH1cblxuXHRcdGFjdGlvbnMuc2V0U2VsZWN0ZWQoc2VsZWN0ZWQpO1xuXHR9LFxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Y29udGV4dE1lbnU6IHtcblx0XHRcdFx0b3BlbjogZmFsc2UsXG5cdFx0XHRcdGxvY2F0aW9uOiB7XG5cdFx0XHRcdFx0eDogMCxcblx0XHRcdFx0XHR5OiAwXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG11bHRpcGxlOiBmYWxzZVxuXHRcdFx0fSxcblx0XHRcdHNlbGVjdGVkOiBzdG9yZS5nZXRTZWxlY3RlZCgpXG5cdFx0fTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5cdFx0dmFyIGxpc3QgPSB0aGlzLnByb3BzLmRhdGEuZ2V0TGlzdDtcblx0XHR2YXIgcm93cyA9IFtdO1xuXG5cdFx0dmFyIF90aGlzID0gdGhpcztcblx0XHRsaXN0LmZvckVhY2goIGZ1bmN0aW9uICggZWxlbWVudCApIHtcblx0XHRcdHZhciBzZWxlY3RlZCA9IGZhbHNlO1xuXG5cdFx0XHRpZiggX3RoaXMuc3RhdGUuc2VsZWN0ZWQuaW5kZXhPZihlbGVtZW50LmlkKSA+IC0xICkge1xuXHRcdFx0XHRzZWxlY3RlZCA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdHZhciByb3dDbGFzcyA9IGN4KHtcblx0XHRcdFx0J2N1cnJlbnRfX3Jvdyc6IHRydWUsXG5cdFx0XHRcdCdjdXJyZW50X19yb3ctLWFjdGl2ZSc6IHNlbGVjdGVkXG5cdFx0XHR9KTtcblxuXHRcdFx0dmFyIGljb25DbGFzcyA9IGN4KHtcblx0XHRcdFx0J2ZhJzogdHJ1ZSxcblx0XHRcdFx0J2ZhLWZ3JzogdHJ1ZSxcblx0XHRcdFx0J2ZhLXNxdWFyZS1vJzogIXNlbGVjdGVkLFxuXHRcdFx0XHQnZmEtY2hlY2stc3F1YXJlLW8nOiBzZWxlY3RlZFxuXHRcdFx0fSk7XG5cblx0XHRcdHJvd3MucHVzaChcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImxpXCIsIHtcblx0XHRcdFx0XHRjbGFzc05hbWU6IHJvd0NsYXNzLCBcblx0XHRcdFx0XHQnZGF0YS1pZCc6ICBlbGVtZW50LmlkLCBcblx0XHRcdFx0XHRvbkNvbnRleHRNZW51OiAgX3RoaXMuaGFuZGxlQ29udGV4dE1lbnUsIFxuXHRcdFx0XHRcdGtleTogIGVsZW1lbnQud29ya2Zsb3dJZH0sIFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChyb3V0ZXIubGlua1RvLCB7XG5cdFx0XHRcdFx0XHRcdHN0YXRlTmFtZTogXCJlY2FyXCIsIFxuXHRcdFx0XHRcdFx0XHRwYXJhbXM6IFxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHdvcmtmbG93SWQ6IGVsZW1lbnQud29ya2Zsb3dJZFxuXHRcdFx0XHRcdFx0XHRcdH0sIFxuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0Y2xhc3NOYW1lOiBcImN1cnJlbnRfX2xpbmtcIn0sIFxuXHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcblx0XHRcdFx0XHRcdFx0XHRjbGFzc05hbWU6IFwiY3VycmVudF9fY29sIGN1cnJlbnRfX2NvbC0tc2VsZWN0XCIsIFxuXHRcdFx0XHRcdFx0XHRcdG9uQ2xpY2s6ICBfdGhpcy5zZWxlY3RSb3d9LCBcblx0XHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBpY29uQ2xhc3MgfSlcblx0XHRcdFx0XHRcdFx0KSwgXG5cdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjdXJyZW50X19jb2wgY3VycmVudF9fY29sLS1pZFwifSwgXG5cdFx0XHRcdFx0XHRcdFx0IGVsZW1lbnQud29ya2Zsb3dJZFxuXHRcdFx0XHRcdFx0XHQpLCBcblx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImN1cnJlbnRfX2NvbFwifSwgXG5cdFx0XHRcdFx0XHRcdFx0IGVsZW1lbnQubW9kZWwucHJlZml4XG5cdFx0XHRcdFx0XHRcdCksIFxuXHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY3VycmVudF9fY29sXCJ9LCBcblx0XHRcdFx0XHRcdFx0XHQgZWxlbWVudC5tb2RlbC5iYXNlXG5cdFx0XHRcdFx0XHRcdCksIFxuXHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY3VycmVudF9fY29sXCJ9LCBcblx0XHRcdFx0XHRcdFx0XHQgZWxlbWVudC5tb2RlbC5zdXBwbGllck5hbWVcblx0XHRcdFx0XHRcdFx0KSwgXG5cdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjdXJyZW50X19jb2xcIn0sIFxuXHRcdFx0XHRcdFx0XHRcdCBlbGVtZW50Lm1vZGVsLm1hbnVmYWN0dXJpbmdHU0RCXG5cdFx0XHRcdFx0XHRcdCksIFxuXHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY3VycmVudF9fY29sXCJ9LCBcblx0XHRcdFx0XHRcdFx0XHQgZWxlbWVudC5tb2RlbC5wYXJ0TmFtZVxuXHRcdFx0XHRcdFx0XHQpLCBcblx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImN1cnJlbnRfX2NvbFwifSwgXG5cdFx0XHRcdFx0XHRcdFx0IGVsZW1lbnQubW9kZWwucGhhc2Vcblx0XHRcdFx0XHRcdFx0KSwgXG5cdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjdXJyZW50X19jb2xcIn1cblx0XHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0KSwgXG5cdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjdXJyZW50X19jb2wgY3VycmVudF9fY29sLS1zdGF0dXNcIn0sIFxuXHRcdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwiY3VycmVudF9fc3RhdHVzXCJ9LCBcIkFwcHJvdmVkXCJcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdCksIFxuXHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY3VycmVudF9fY29sXCJ9LCBcblx0XHRcdFx0XHRcdFx0XHRcIlNlcCAxLCAyMDE0IDI6NDA6MTdQTVwiXG5cdFx0XHRcdFx0XHRcdCksIFxuXHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY3VycmVudF9fY29sIGN1cnJlbnRfX2NvbC0taWNvblwifSwgXG5cdFx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS1jaGV2cm9uLXJpZ2h0XCJ9KVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KSApO1xuXHRcdH0gKTtcblxuXHRcdHZhciBjb250ZXh0TWVudUVsZW1lbnRMaXN0ID0gW107XG5cdFx0dmFyIGNvbnRleHRNZW51ID0gdGhpcy5zdGF0ZS5jb250ZXh0TWVudTtcblxuXHRcdHZhciBjb250ZXh0TWVudUNsYXNzID0gY3goe1xuXHRcdFx0J2NvbnRleHRtZW51JzogdHJ1ZSxcblx0XHRcdCdjb250ZXh0bWVudS0tYWN0aXZlJzogY29udGV4dE1lbnUub3BlblxuXHRcdH0pO1xuXG5cdFx0dmFyIGNvbnRleHRNZW51U3R5bGUgPSB7XG5cdFx0XHRsZWZ0OiBjb250ZXh0TWVudS5sb2NhdGlvbi54ICsgMSArICdweCcsXG5cdFx0XHR0b3A6IGNvbnRleHRNZW51LmxvY2F0aW9uLnkgKyAxICsgJ3B4Jyxcblx0XHR9O1xuXG5cdFx0aWYoIGNvbnRleHRNZW51Lm11bHRpcGxlICkge1xuXHRcdFx0dmFyIGxlbmd0aCA9IHRoaXMuc3RhdGUuc2VsZWN0ZWQubGVuZ3RoO1xuXG5cdFx0XHRjb250ZXh0TWVudUVsZW1lbnRMaXN0LnB1c2goXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsaVwiLCB7a2V5OiBcImFwcHJvdmVNdWx0aXBsZVwiLCBjbGFzc05hbWU6IFwiY29udGV4dG1lbnVfX2l0ZW0gY29udGV4dG1lbnVfX2l0ZW0tLWFwcHJvdmVcIn0sIFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IFwiZmEgZmEtY2hlY2sgZmEtZncgY29udGV4dG1lbnVfX2ljb25cIn0pLCBcblxuXHRcdFx0XHRcdFwiQXBwcm92ZSBcIiwgbGVuZ3RoLCBcIiBpdGVtc1wiXG5cdFx0XHRcdCkgKTtcblxuXHRcdFx0Y29udGV4dE1lbnVFbGVtZW50TGlzdC5wdXNoKFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwibGlcIiwge2tleTogXCJyZWplY3RNdWx0aXBsZVwiLCBjbGFzc05hbWU6IFwiY29udGV4dG1lbnVfX2l0ZW0gY29udGV4dG1lbnVfX2l0ZW0tLXJlamVjdFwifSwgXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS10aW1lcyBmYS1mdyBjb250ZXh0bWVudV9faWNvblwifSksIFxuXG5cdFx0XHRcdFx0XCJSZWplY3QgXCIsIGxlbmd0aCwgXCIgaXRlbXNcIlxuXHRcdFx0XHQpICk7XG5cblx0XHRcdGNvbnRleHRNZW51RWxlbWVudExpc3QucHVzaChcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImxpXCIsIHtrZXk6IFwiZGVsZXRlTXVsdGlwbGVcIiwgY2xhc3NOYW1lOiBcImNvbnRleHRtZW51X19pdGVtIGNvbnRleHRtZW51X19pdGVtLS1kZWxldGVcIn0sIFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IFwiZmEgZmEtdHJhc2gtbyBmYS1mdyBjb250ZXh0bWVudV9faWNvblwifSksIFxuXG5cdFx0XHRcdFx0XCJEZWxldGUgXCIsIGxlbmd0aCwgXCIgaXRlbXNcIlxuXHRcdFx0XHQpICk7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29udGV4dE1lbnVFbGVtZW50TGlzdC5wdXNoKFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwibGlcIiwge2tleTogXCJjcmVhdGVcIiwgY2xhc3NOYW1lOiBcImNvbnRleHRtZW51X19pdGVtIGNvbnRleHRtZW51X19pdGVtLS1jcmVhdGVcIn0sIFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IFwiZmEgZmEtcGx1cyBmYS1mdyBjb250ZXh0bWVudV9faWNvblwifSksIFxuXG5cdFx0XHRcdFx0XCJDcmVhdGUgbmV3IGVDYXIgZnJvbSB0aGlzIG9uZVwiXG5cdFx0XHRcdCkgKTtcblxuXHRcdFx0Y29udGV4dE1lbnVFbGVtZW50TGlzdC5wdXNoKFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwibGlcIiwge2tleTogXCJhcHByb3ZlXCIsIGNsYXNzTmFtZTogXCJjb250ZXh0bWVudV9faXRlbSBjb250ZXh0bWVudV9faXRlbS0tYXBwcm92ZVwifSwgXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS1jaGVjayBmYS1mdyBjb250ZXh0bWVudV9faWNvblwifSksIFxuXG5cdFx0XHRcdFx0XCJBcHByb3ZlXCJcblx0XHRcdFx0KSApO1xuXG5cdFx0XHRjb250ZXh0TWVudUVsZW1lbnRMaXN0LnB1c2goXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsaVwiLCB7a2V5OiBcInJlamVjdFwiLCBjbGFzc05hbWU6IFwiY29udGV4dG1lbnVfX2l0ZW0gY29udGV4dG1lbnVfX2l0ZW0tLXJlamVjdFwifSwgXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS10aW1lcyBmYS1mdyBjb250ZXh0bWVudV9faWNvblwifSksIFxuXG5cdFx0XHRcdFx0XCJSZWplY3RcIlxuXHRcdFx0XHQpICk7XG5cblx0XHRcdGNvbnRleHRNZW51RWxlbWVudExpc3QucHVzaChcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImxpXCIsIHtrZXk6IFwiZGVsZXRlXCIsIGNsYXNzTmFtZTogXCJjb250ZXh0bWVudV9faXRlbSBjb250ZXh0bWVudV9faXRlbS0tZGVsZXRlXCJ9LCBcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLXRyYXNoLW8gZmEtZncgY29udGV4dG1lbnVfX2ljb25cIn0pLCBcblxuXHRcdFx0XHRcdFwiRGVsZXRlXCJcblx0XHRcdFx0KSApO1xuXHRcdH1cblxuXHRcdHZhciBjb250ZXh0TWVudUVsZW1lbnQgPSAoXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogY29udGV4dE1lbnVDbGFzcywgc3R5bGU6IGNvbnRleHRNZW51U3R5bGUgfSwgXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcInVsXCIsIHtjbGFzc05hbWU6IFwiY29udGV4dG1lbnVfX2xpc3RcIn0sIFxuXHRcdFx0XHRcdFx0Y29udGV4dE1lbnVFbGVtZW50TGlzdCBcblx0XHRcdFx0XHQpXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cblx0XHR2YXIgYWN0aW9uc0NsYXNzID0gY3goe1xuXHRcdFx0J2FjdGlvbnMnOiB0cnVlLFxuXHRcdFx0J2FjdGlvbnNfX2FjdGl2ZSc6IHRoaXMuc3RhdGUuc2VsZWN0ZWQubGVuZ3RoXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImN1cnJlbnQgbm8tc2VsZWN0XCJ9LCBcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBhY3Rpb25zQ2xhc3MgfSwgXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcInVsXCIsIHtjbGFzc05hbWU6IFwiYWN0aW9uc19fbGlzdCBjbGVhclwifSwgXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwibGlcIiwge2NsYXNzTmFtZTogXCJhY3Rpb25zX19pdGVtIGFjdGlvbnNfX2l0ZW0tLWRlc2VsZWN0XCJ9LCBcblx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS1taW51cy1zcXVhcmUgZmEtZncgYWN0aW9uc19faWNvblwifSksIFxuXHRcdFx0XHRcdFx0XHRcIsKgXCJcblx0XHRcdFx0XHRcdCksIFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImxpXCIsIHtjbGFzc05hbWU6IFwiYWN0aW9uc19faXRlbSBhY3Rpb25zX19pdGVtLS1sZWZ0IGFjdGlvbnNfX2l0ZW0tLWFwcHJvdmVcIn0sIFxuXHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLWNoZWNrIGZhLWZ3IGFjdGlvbnNfX2ljb25cIn0pLCBcblxuXHRcdFx0XHRcdFx0XHRcIkFwcHJvdmVcIlxuXHRcdFx0XHRcdFx0KSwgXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwibGlcIiwge2NsYXNzTmFtZTogXCJhY3Rpb25zX19pdGVtIGFjdGlvbnNfX2l0ZW0tLW1pZGRsZSBhY3Rpb25zX19pdGVtLS1yZWplY3RcIn0sIFxuXHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLXRpbWVzIGZhLWZ3IGFjdGlvbnNfX2ljb25cIn0pLCBcblxuXHRcdFx0XHRcdFx0XHRcIlJlamVjdFwiXG5cdFx0XHRcdFx0XHQpLCBcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsaVwiLCB7Y2xhc3NOYW1lOiBcImFjdGlvbnNfX2l0ZW0gYWN0aW9uc19faXRlbS0tcmlnaHRcIn0sIFxuXHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLXRyYXNoLW8gZmEtZncgYWN0aW9uc19faWNvblwifSksIFxuXG5cdFx0XHRcdFx0XHRcdFwiRGVsZXRlXCJcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpXG5cdFx0XHRcdCksIFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwidWxcIiwge2NsYXNzTmFtZTogXCJjdXJyZW50X190YWJsZVwifSwgXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImxpXCIsIHtjbGFzc05hbWU6IFwiY3VycmVudF9faGVhZGVyXCJ9LCBcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjdXJyZW50X19jb2wgY3VycmVudF9fY29sLS1zZWxlY3RcIn1cblx0XHRcdFx0XHRcdCksIFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImN1cnJlbnRfX2NvbCBjdXJyZW50X19jb2wtLWlkXCJ9LCBcblx0XHRcdFx0XHRcdFx0XCJJRFwiXG5cdFx0XHRcdFx0XHQpLCBcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjdXJyZW50X19jb2xcIn0sIFxuXHRcdFx0XHRcdFx0XHRcIlByZWZpeFwiXG5cdFx0XHRcdFx0XHQpLCBcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjdXJyZW50X19jb2xcIn0sIFxuXHRcdFx0XHRcdFx0XHRcIkJhc2VcIlxuXHRcdFx0XHRcdFx0KSwgXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY3VycmVudF9fY29sXCJ9LCBcblx0XHRcdFx0XHRcdFx0XCJTdXBwbGllciBOYW1lXCJcblx0XHRcdFx0XHRcdCksIFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImN1cnJlbnRfX2NvbFwifSwgXG5cdFx0XHRcdFx0XHRcdFwiU3VwcGxpZXIgR1NEQlwiXG5cdFx0XHRcdFx0XHQpLCBcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjdXJyZW50X19jb2xcIn0sIFxuXHRcdFx0XHRcdFx0XHRcIlBhcnQgTmFtZVwiXG5cdFx0XHRcdFx0XHQpLCBcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjdXJyZW50X19jb2xcIn0sIFxuXHRcdFx0XHRcdFx0XHRcIlN1Ym1pdHRlZCBQaGFzZXNcIlxuXHRcdFx0XHRcdFx0KSwgXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY3VycmVudF9fY29sXCJ9LCBcblx0XHRcdFx0XHRcdFx0XCJTdWJtaXNzaW9uIFN0YXR1c1wiXG5cdFx0XHRcdFx0XHQpLCBcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjdXJyZW50X19jb2wgY3VycmVudF9fY29sLS1zdGF0dXNcIn1cblx0XHRcdFx0XHRcdCksIFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImN1cnJlbnRfX2NvbFwifSwgXG5cdFx0XHRcdFx0XHRcdFwiRGF0ZSBDcmVhdGVkXCJcblx0XHRcdFx0XHRcdCksIFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImN1cnJlbnRfX2NvbCBjdXJyZW50X19jb2wtLWljb25cIn1cblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpLCBcblx0XHRcdFx0XHRyb3dzIFxuXHRcdFx0XHQpLCBcblx0XHRcdFx0Y29udGV4dE1lbnVFbGVtZW50IFxuXHRcdFx0KVxuXHRcdFx0KTtcblx0fVxufSk7XG5cbnZhciByZXNvbHZlID0ge1xuXHQnZ2V0TGlzdCc6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4geGhyKCdnZXQnLCAnL3Jlc3QvcmVwb3J0aW5nL2xpc3QnKTtcblx0fVxufTtcblxuZXhwb3J0IHsgY3VycmVudCwgcmVzb2x2ZSB9OyIsImltcG9ydCBmb3JtQ29uZmlnIGZyb20gJy4uL2Zvcm0vY29uZmlnJztcbmltcG9ydCBsaXN0ZW5lcnMgZnJvbSAnLi4vZm9ybS9saXN0ZW5lcnMnO1xuaW1wb3J0IGNvbnRyb2xsZXIgZnJvbSAnLi4vZm9ybS9jb250cm9sbGVyJztcblxuaW1wb3J0IHhociBmcm9tICcuLi94aHInO1xuaW1wb3J0IGJsb2Nrc0FjdGlvbnMgZnJvbSAnLi4vYWN0aW9ucy9ibG9ja3MnO1xuaW1wb3J0IGFsZXJ0IGZyb20gJy4uL2FjdGlvbnMvYWxlcnQnO1xuXG52YXIgZWNhciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ2VjYXInLFxuXHRjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCApIHtcblx0XHR2YXIgZm9ybUJ1aWxkZXIgPSB7fTtcblxuXHRcdGZvcm1CdWlsZGVyLm1vZGVsID0gdGhpcy5wcm9wcy5kYXRhLmdldEZvcm0ubW9kZWw7XG5cdFx0Zm9ybUJ1aWxkZXIuY29udHJvbGxlciA9IGNvbnRyb2xsZXI7XG5cblx0XHR2YXIgZm9ybVZpZXcgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGZvcm1Db25maWcpKTtcblxuXHRcdGZvcm1WaWV3LnRhYnMuaXRlbXMucGhhc2UuaXRlbXMuY29sLml0ZW1zWzFdLnBwYXBMZXZlbC5vcHRpb25zID0gW3tcblx0XHRcdHZhbHVlOiBmb3JtQnVpbGRlci5tb2RlbC5wcGFwTGV2ZWwsXG5cdFx0XHRsYWJlbDogZm9ybUJ1aWxkZXIubW9kZWwucHBhcExldmVsLnNwbGl0KCdfJylbMV1cblx0XHR9XTtcblxuXHRcdGZvcm1WaWV3LmJ1dHRvbkNvbnRhaW5lci5pdGVtcyA9IHtcblx0XHRcdHJlamVjdEJ1dHRvbjoge1xuXHRcdFx0XHR0eXBlOiBcImJ1dHRvblwiLFxuXHRcdFx0XHR0ZXh0OiBcIlJlamVjdFwiLFxuXHRcdFx0XHRjbGFzc05hbWU6IFwicmVqZWN0XCJcblx0XHRcdH0sXG5cdFx0XHRhcHByb3ZlQnV0dG9uOiB7XG5cdFx0XHRcdHR5cGU6IFwiYnV0dG9uXCIsXG5cdFx0XHRcdHRleHQ6IFwiQXBwcm92ZVwiLFxuXHRcdFx0XHRjbGFzc05hbWU6IFwiQXBwcm92ZVwiXG5cdFx0XHR9LFxuXHRcdFx0c2F2ZUJ1dHRvbjoge1xuXHRcdFx0XHR0eXBlOiBcImJ1dHRvblwiLFxuXHRcdFx0XHR0ZXh0OiBcIlNhdmVcIixcblx0XHRcdFx0Y2xhc3NOYW1lOiBcInNhdmVcIlxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRmb3JtQnVpbGRlci52aWV3ID0gZm9ybVZpZXc7XG5cblx0XHR2YXIgZm9ybSA9IGFkYXB0LmZvcm0oJ25hbWUnLCBmb3JtQnVpbGRlcik7XG5cblx0XHRsaXN0ZW5lcnMoZm9ybSk7XG5cblx0XHR2YXIgZG9tTm9kZSA9IHRoaXMuZ2V0RE9NTm9kZSgpO1xuXG5cdFx0Zm9ybS5yZW5kZXIoIGRvbU5vZGUucXVlcnlTZWxlY3RvckFsbCgnLmZvcm0nKVswXSApO1xuXHRcdC8vZm9ybS5vYnNlcnZlLmRpZ2VzdCgpO1xuXHRcdGNvbnNvbGUubG9nKCdGT1JNOjo6JywgZm9ybSk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsIFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZm9ybVwifSksIFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwic3VtbWFyeWJhclwiLCBzdHlsZTogIHsgZGlzcGxheTogJ25vbmUnfSB9LCBcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwic3VtbWFyeWJhcl9faGVhZGVyXCJ9LCBcblx0XHRcdFx0XHRcIlByb2Nlc3NlcyBTdW1tYXJ5XCIsIFxuXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwic3VtbWFyeWJhcl9fY2xvc2VcIn0sIFxuXHRcdFx0XHRcdFx0XCJIaWRlIFN1bW1hcnkgQmFyXCIsIFxuXG5cdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IFwiZmEgZmEtZncgZmEtdGltZXNcIn0pXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KSwgXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInN1bW1hcnliYXJfX3Byb2Nlc3NlcyBjbGVhclwifSwgXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwidWxcIiwge2NsYXNzbmFtZTogXCJzdW1tYXJ5YmFyX19wcm9jZXNzZXMtLWxpc3QgXCJ9LCBcblx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImxpXCIsIHtjbGFzc05hbWU6IFwic3VtbWFyeWJhcl9fcHJvY2Vzc2VzLS1pdGVtIGNsZWFyIHN1bW1hcnliYXJfX3Byb2Nlc3Nlcy0tYmVsb3dcIn0sIFxuXHRcdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwic3VtbWFyeWJhcl9fcHJvY2Vzc2VzLS1uYW1lXCJ9LCBcblx0XHRcdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoNFwiLCBudWxsLCBcIlByb2Nlc3MgMVwiKSwgXG5cdFx0XHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaDVcIiwgbnVsbCwgXCJBc3NlbWJseVwiKVxuXHRcdFx0XHRcdFx0XHRcdCksIFxuXHRcdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwic3VtbWFyeWJhcl9fcHJvY2Vzc2VzLS1wZXJjZW50XCJ9LCBcblx0XHRcdFx0XHRcdFx0XHRcIi0yMCVcIlxuXHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0KSwgXG5cdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsaVwiLCB7Y2xhc3NOYW1lOiBcInN1bW1hcnliYXJfX3Byb2Nlc3Nlcy0taXRlbSBjbGVhciBzdW1tYXJ5YmFyX19wcm9jZXNzZXMtLWFib3ZlXCJ9LCBcblx0XHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcInN1bW1hcnliYXJfX3Byb2Nlc3Nlcy0tbmFtZVwifSwgXG5cdFx0XHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaDRcIiwgbnVsbCwgXCJQcm9jZXNzIDJcIiksIFxuXHRcdFx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImg1XCIsIG51bGwsIFwiTmFtZSBIZXJlXCIpXG5cdFx0XHRcdFx0XHRcdFx0KSwgXG5cdFx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJzdW1tYXJ5YmFyX19wcm9jZXNzZXMtLXBlcmNlbnRcIn0sIFxuXHRcdFx0XHRcdFx0XHRcdFwiODAlXCJcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdCksIFxuXHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwibGlcIiwge2NsYXNzTmFtZTogXCJzdW1tYXJ5YmFyX19wcm9jZXNzZXMtLWl0ZW0gY2xlYXJcIn0sIFxuXHRcdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwic3VtbWFyeWJhcl9fcHJvY2Vzc2VzLS1uYW1lXCJ9LCBcblx0XHRcdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoNFwiLCBudWxsLCBcIlByb2Nlc3MgM1wiKSwgXG5cdFx0XHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaDVcIiwgbnVsbCwgXCJOYW1lIEhlcmVcIilcblx0XHRcdFx0XHRcdFx0XHQpLCBcblx0XHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcInN1bW1hcnliYXJfX3Byb2Nlc3Nlcy0tcGVyY2VudFwifSwgXG5cdFx0XHRcdFx0XHRcdFx0XCIwJVwiXG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KSwgXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInN1bW1hcnliYXJfX2NoYXJ0XCJ9LCBcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJzdW1tYXJ5YmFyX19sZWdlbmQgY2xlYXJcIn0sIFxuXHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcInN1bW1hcnliYXJfX2xlZ2VuZC0taXRlbVwifSwgXG5cdFx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJzdW1tYXJ5YmFyX19sZWdlbmQtLWJsb2NrXCIsIHN0eWxlOiAgeyBiYWNrZ3JvdW5kOiAnI0NGRTBDMid9IH0pLCBcblxuXHRcdFx0XHRcdFx0XHRcIkpMUiBEZW1hbmRcIlxuXHRcdFx0XHRcdFx0XHQpLCBcblx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJzdW1tYXJ5YmFyX19sZWdlbmQtLWl0ZW1cIn0sIFxuXHRcdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwic3VtbWFyeWJhcl9fbGVnZW5kLS1ibG9ja1wiLCBzdHlsZTogIHsgYmFja2dyb3VuZDogJyNEQ0RDREMnfSB9KSwgXG5cblx0XHRcdFx0XHRcdFx0XCJXZWVrbHkvSG91cmx5IFBhcnRzIEF2YWlsYWJsZSBmb3IgU2hpcG1lbnRcIlxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQpLCBcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIiwge2NsYXNzTmFtZTogXCJzdW1tYXJ5YmFyX19jaGFydC0tY2FudmFzXCIsIGhlaWdodDogXCIxMzBcIn0pXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KTtcblx0fVxufSk7XG5cbmVjYXIucmVzb2x2ZSA9IHtcblx0J2dldEZvcm0nOiBmdW5jdGlvbiAocGFyYW1zKSB7XG5cdFx0dmFyIGVuZHBvaW50ID0gWydyZXN0JywgJ3dvcmtmbG93J107XG5cblx0XHRlbmRwb2ludC5wdXNoKCBwYXJhbXMud29ya2Zsb3dJZC5sZW5ndGggPT09IDE2ICYmICdieVdvcmtmbG93SWQnIHx8ICdieU5vZGVJZCcgKTtcblx0XHRlbmRwb2ludC5wdXNoKCBwYXJhbXMud29ya2Zsb3dJZCApO1xuXG5cdFx0cmV0dXJuIHhocignR0VUJywgZW5kcG9pbnQuam9pbignLycpKTtcblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZWNhcjsiLCJpbXBvcnQgYXBwU3RvcmUgZnJvbSAnLi4vc3RvcmVzL2FwcCc7XG5cbnZhciBMb2FkaW5nQmFyID0gcmVxdWlyZSgnLi4vbG9hZGluZycpO1xuaW1wb3J0IEFsZXJ0IGZyb20gJy4uL2NvbXBvbmVudHMvYWxlcnQnO1xuaW1wb3J0IFJvdXRlciBmcm9tICcuLi9yb3V0ZXIvcm91dGVyJztcbmltcG9ydCBIZWFkZXIgZnJvbSAnLi4vcGFydGlhbHMvaGVhZGVyJztcblxuY29uc29sZS5sb2coUm91dGVyKTtcblxudmFyIGluZGV4ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiAnaW5kZXgnLFxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHRSb3V0ZXIuaGFuZGxlU3RhdGVDaGFuZ2UoKTtcblx0fSxcblx0Y29tcG9uZW50V2lsbE1vdW50KCkge1xuXHRcdGFwcFN0b3JlLm9uKCdmcm96ZW5VcGRhdGUnLCB0aGlzLmhhbmRsZUZyb3plblVwZGF0ZSk7XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdGFwcFN0b3JlLm9mZignZnJvemVuVXBkYXRlJywgdGhpcy5oYW5kbGVGcm96ZW5VcGRhdGUpO1xuXHR9LFxuXHRoYW5kbGVGcm96ZW5VcGRhdGUoKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRmcm96ZW46IGFwcFN0b3JlLmZyb3plbixcblx0XHRcdHRvcDogYXBwU3RvcmUudG9wLFxuXHRcdH0pO1xuXHR9LFxuXHRnZXRJbml0aWFsU3RhdGUoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGZyb3plbjogYXBwU3RvcmUuZnJvemVuLFxuXHRcdFx0dG9wOiAwXG5cdFx0fVxuXHR9LFxuXHRyZW5kZXIoKSB7XG5cdFx0dmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5cdFx0dmFyIGFwcENsYXNzZXMgPSBjeCh7XG5cdFx0XHQnYXBwJzogdHJ1ZSxcblx0XHRcdCdhcHAtLWZyb3plbic6IHRoaXMuc3RhdGUuZnJvemVuXG5cdFx0fSk7XG5cblx0XHR2YXIgYXBwU3R5bGUgPSB0aGlzLnN0YXRlLmZyb3plbiA/IHtcblx0XHRcdHRvcDogdGhpcy5zdGF0ZS50b3Bcblx0XHR9IDoge307XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBhcHBDbGFzc2VzLCBzdHlsZTogYXBwU3R5bGUgfSwgXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoTG9hZGluZ0JhciwgbnVsbCksIFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KEFsZXJ0LCBudWxsKSwgXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoSGVhZGVyLCBudWxsKSwgXG5cblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChSb3V0ZXIudmlldywgbnVsbClcblx0XHRcdClcblx0XHQpO1xuXHR9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgaW5kZXg7IiwibW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdleHBvcnRzJyxcblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXG5cdFx0XHRcdFwiSW5mb1wiXG5cdFx0XHQpXG5cdFx0XHQpO1xuXHR9XG59KTsiLCJtb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogJ2V4cG9ydHMnLFxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcblx0XHRcdFx0XCJSZXBvcnRpbmcgUGFnZVwiXG5cdFx0XHQpXG5cdFx0XHQpO1xuXHR9XG59KTsiLCJ2YXIgeGhyID0gcmVxdWlyZSgnLi4veGhyJyk7XG5cbnZhciBTZWFyY2ggPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6ICdTZWFyY2gnLFxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblx0XHRjb25zb2xlLmxvZyh0aGlzLnByb3BzKTtcblx0XHR2YXIgdGVzdCA9IFtdO1xuXHRcdGZvciggdmFyIGkgPSAwOyBpIDwgMjsgaSsrICkge1xuXHRcdFx0dGVzdC5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXCJoZWxsb1wiKSk7XG5cdFx0fVxuXG5cdFx0dmFyIHF1ZXJ5ID0gdGhpcy5wcm9wcy5jdXJyZW50U3RhdGUucGFyYW1zLnF1ZXJ5O1xuXG5cdFx0dmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5cdFx0dmFyIGVycm9yTWVzc2FnZTtcblx0XHRpZiggU3RyaW5nKHF1ZXJ5KS50cmltKCkgPT0gJycgKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnaGknKTtcblx0XHRcdGVycm9yTWVzc2FnZSA9IChcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInJlc3VsdHNfX2VtcHR5XCJ9LCBcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLWZyb3duLW8gZmEtZndcIn0pLCBcblxuXHRcdFx0XHRcdFwiUGxlYXNlIGVudGVyIGEgc2VhcmNoIHF1ZXJ5IGluIHRoZSBzZWFyY2ggYmFyIGFib3ZlXCJcblx0XHRcdFx0KVxuXHRcdFx0XHQpO1xuXHRcdH1cblxuXHRcdHZhciBkYXRhID0gdGhpcy5wcm9wcy5kYXRhLmdldFNlYXJjaFJlc3VsdHM7XG5cdFx0aWYoICFlcnJvck1lc3NhZ2UgJiYgZGF0YS5yZXN1bHRDb3VudCA9PT0gMCApIHtcblx0XHRcdGVycm9yTWVzc2FnZSA9IChcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInJlc3VsdHNfX25vbmVcIn0sIFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IFwiZmEgZmEtZnJvd24tbyBmYS1md1wifSksIFxuXHRcdFx0XHRcdFwiTm8gbWF0Y2hlcyBmb3IgXCIsIHF1ZXJ5LCBcIi4gVHJ5IGFub3RoZXIgc2VhcmNoIHRlcm0/XCJcblx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0fVxuXG5cdFx0Y29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuXHRcdHJldHVybiAoXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwicmVzdWx0c1wifSwgXG5cdFx0XHRcdGVycm9yTWVzc2FnZSBcblx0XHRcdClcblx0XHRcdCk7XG5cdH1cbn0pO1xuXG5cblNlYXJjaC5yZXNvbHZlID0ge1xuXHQnZ2V0U2VhcmNoUmVzdWx0cyc6IGZ1bmN0aW9uKCBwYXJhbXMgKSB7XG5cdFx0cmV0dXJuIHhocignR0VUJywgJy9yZXN0L3dvcmtmbG93L3NlYXJjaC8nKTtcblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZWFyY2g7IiwiaW1wb3J0IE5hdmlnYXRpb24gZnJvbSAnLi9uYXZpZ2F0aW9uJztcbmltcG9ydCBTZWFyY2ggZnJvbSAnLi9zZWFyY2gnO1xuaW1wb3J0IFJvdXRlciBmcm9tICcuLi9yb3V0ZXInO1xuXG5jb25zb2xlLmxvZyhSb3V0ZXIpO1xuXG52YXIgaGVhZGVyID0gUmVhY3QuY3JlYXRlQ2xhc3MoIHtkaXNwbGF5TmFtZTogJ2hlYWRlcicsXG5cdHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXG5cdFx0cmV0dXJuIChcblx0XHQgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImhlYWRlclwiLCB7Y2xhc3NOYW1lOiBcIm1haW5oZWFkZXJcIn0sIFxuXHRcdCAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtYWluaGVhZGVyX19maXhlZFwifSwgXG5cdFx0ICAgICAgXHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibWFpbmhlYWRlcl9fdGFibGVcIn0sIFxuXHRcdCAgICAgIFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibWFpbmhlYWRlcl9fbG9nby1jb250YWluZXIgbWFpbmhlYWRlcl9fY2VsbFwifSwgXG5cdFx0XHQgICAgICAgIFx0UmVhY3QuY3JlYXRlRWxlbWVudChSb3V0ZXIubGlua1RvLCB7XG5cdFx0XHQgICAgICAgIFx0XHRzdGF0ZU5hbWU6IFwiY3VycmVudFwiLCBcblx0XHRcdCAgICAgICAgXHRcdGNsYXNzTmFtZTogXCJtYWluaGVhZGVyX19sb2dvXCJ9KVxuXHQgICAgICAgIFx0XHQpLCBcblxuXHQgICAgICAgIFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibWFpbmhlYWRlcl9fY2VsbCBtYWluaGVhZGVyX19jZWxsLS1zZWFyY2hcIn0sIFxuXHRcdFx0ICAgICAgIFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFNlYXJjaCwgbnVsbClcblx0XHQgICAgICAgXHRcdCksIFxuXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1haW5oZWFkZXJfX2NlbGwgbWFpbmhlYWRlcl9fY2VsbC0tdXNlclwifSwgXG5cdFx0XHRcdCAgICAgICBcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtYWluaGVhZGVyX191c2VyXCJ9LCBcblx0XHRcdCAgICAgICBcdFx0XHRcIlJ5YW4gQ2xhcmtcIlxuXHRcdFx0XHQgICAgICAgXHQpXG5cdFx0XHQgICAgICAgXHQpLCBcblxuXHRcdFx0ICAgICAgIFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1haW5oZWFkZXJfX2NlbGwgbWFpbmhlYWRlcl9fY2VsbC0tbmF2aWdhdGlvblwifSwgXG5cdFx0ICAgICAgICAgIFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KE5hdmlnYXRpb24sIG51bGwpXG5cdCAgICAgICAgICBcdFx0KVxuXHRcdFx0ICAgICAgKVxuXHRcdCAgICBcdClcblx0XHQgICAgKVxuXHRcdFx0KTtcblx0fVxufSApO1xuXG5leHBvcnQgZGVmYXVsdCBoZWFkZXI7IiwiaW1wb3J0IHJvdXRlciBmcm9tICcuLi9yb3V0ZXIvcm91dGVyJztcblxuZnVuY3Rpb24gZmluZENsb3Nlc3RQYXJlbnQoIGV2ZW50LCBjbGFzc05hbWUgKSB7XG5cdHZhciBwYXJlbnQgPSBldmVudC5wYXJlbnROb2RlO1xuICAgIHdoaWxlIChwYXJlbnQhPWRvY3VtZW50LmJvZHkgJiYgcGFyZW50ICE9IG51bGwpIHtcbiAgICAgIGlmICgocGFyZW50KSAmJiBwYXJlbnQuY2xhc3NOYW1lICYmIHBhcmVudC5jbGFzc05hbWUuaW5kZXhPZihjbGFzc05hbWUpICE9IC0xKSB7XG4gICAgICAgIHJldHVybiBwYXJlbnQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJlbnQgPSBwYXJlbnQgPyBwYXJlbnQucGFyZW50Tm9kZSA6IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuXG52YXIgbmF2aWdhdGlvbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKCB7ZGlzcGxheU5hbWU6ICduYXZpZ2F0aW9uJyxcblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG9wZW46IGZhbHNlLFxuXHRcdFx0ZHJvcGRvd25Ib3ZlcjogLTFcblx0XHR9O1xuXHR9LFxuXHRjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuXHQgICAgICBpZiggIWZpbmRDbG9zZXN0UGFyZW50KGUudGFyZ2V0LCAnbmF2aWdhdGlvbl9fbGluay0tZHJvcGRvd24nKSApIHtcblx0ICAgICAgICBpZiggX3RoaXMuc3RhdGUub3BlbiApIHtcblx0ICAgICAgICAgIF90aGlzLnNldFN0YXRlKHtcblx0ICAgICAgICAgIFx0b3BlbjogZmFsc2Vcblx0ICAgICAgICAgIH0pO1xuXHQgICAgICAgIH1cblx0ICAgICAgfVxuXHQgICAgfSk7XG5cdH0sXG5cdHNldEhvdmVyOiBmdW5jdGlvbiAoIGlkICkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0ZHJvcGRvd25Ib3ZlcjogaWRcblx0XHR9KTtcblx0fSxcblx0cmVtb3ZlSG92ZXI6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGRyb3Bkb3duSG92ZXI6IC0xXG5cdFx0fSk7XG5cdH0sXG5cdHRvZ2dsZURyb3Bkb3duOiBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdG9wZW46ICF0aGlzLnN0YXRlLm9wZW5cblx0XHR9KTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5cdFx0dmFyIGRyb3Bkb3duQ2xhc3MgPSBjeCh7XG5cdFx0XHQnZHJvcGRvd24nOiB0cnVlLFxuXHRcdFx0J2Ryb3Bkb3duLS1vcGVuJzogdGhpcy5zdGF0ZS5vcGVuLFxuXHRcdFx0J2Ryb3Bkb3duLS10b3AnOiB0aGlzLnN0YXRlLmRyb3Bkb3duSG92ZXIgPT09IDBcblx0XHR9KTtcblxuXHRcdHJldHVybiAoXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibmF2aWdhdGlvblwifSwgXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJ1bFwiLCB7Y2xhc3NOYW1lOiBcIm5hdmlnYXRpb25fX2xpc3RcIn0sIFxuXHRcdCAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsaVwiLCB7Y2xhc3NOYW1lOiBcIm5hdmlnYXRpb25fX2l0ZW0gbmF2aWdhdGlvbl9faXRlbS0tZHJvcGRvd25cIn0sIFxuXHRcdCAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImFcIiwge1xuXHRcdCAgICAgICAgICAgICAgXHRjbGFzc05hbWU6IFwibmF2aWdhdGlvbl9fbGluayBuYXZpZ2F0aW9uX19saW5rLS1kcm9wZG93blwiLCBcblx0XHQgICAgICAgICAgICAgIFx0aHJlZjogXCJcIiwgXG5cdFx0ICAgICAgICAgICAgICBcdG9uQ2xpY2s6ICB0aGlzLnRvZ2dsZURyb3Bkb3dufSwgXG5cdFx0ICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IFwiZmEgZmEtYmFycyBmYS1mdyBuYXZpZ2F0aW9uX19pY29uIG5hdmlnYXRpb25fX2ljb24tLWRyb3Bkb3duXCJ9KVxuXHRcdCAgICAgICAgICAgICAgKSwgXG5cblx0XHQgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJ1bFwiLCB7Y2xhc3NOYW1lOiBkcm9wZG93bkNsYXNzIH0sIFxuXHRcdCAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwibGlcIiwge1xuXHRcdCAgICAgICAgICAgICAgICBcdGNsYXNzTmFtZTogXCJkcm9wZG93bl9faXRlbVwiXG5cdFx0ICAgICAgICAgICAgICAgIFx0fSwgXG5cdFx0ICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChyb3V0ZXIubGlua1RvLCB7XG5cdFx0ICAgICAgICAgICAgICAgICAgXHRzdGF0ZU5hbWU6IFwiY3JlYXRlXCIsIFxuXHRcdCAgICAgICAgICAgICAgICAgIFx0Y2xhc3NOYW1lOiBcImRyb3Bkb3duX19saW5rXCIsIFxuXHRcdCAgICAgICAgICAgICAgICAgIFx0b25Nb3VzZU92ZXI6ICB0aGlzLnNldEhvdmVyLmJpbmQodGhpcywgMCksIFxuXHRcdCAgICAgICAgICAgICAgICAgIFx0b25Nb3VzZU91dDogIHRoaXMucmVtb3ZlSG92ZXJ9LCBcblx0XHQgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IFwiZmEgZmEtcGx1cyBmYS1mdyBkcm9wZG93bl9faWNvblwifSksIFxuXG5cdFx0ICAgICAgICAgICAgICAgICAgICBcIkNyZWF0ZSBlQ2FyXCJcblx0XHQgICAgICAgICAgICAgICAgICApXG5cdFx0ICAgICAgICAgICAgICAgICksIFxuXHRcdCAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwibGlcIiwge2NsYXNzTmFtZTogXCJkcm9wZG93bl9faXRlbVwifSwgXG5cdFx0ICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChyb3V0ZXIubGlua1RvLCB7XG5cdFx0ICAgICAgICAgICAgICAgICAgXHRzdGF0ZU5hbWU6IFwiY3VycmVudFwiLCBcblx0XHQgICAgICAgICAgICAgICAgICBcdGhyZWY6IFwiI1wiLCBjbGFzc05hbWU6IFwiZHJvcGRvd25fX2xpbmtcIn0sIFxuXHRcdCAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS1saXN0IGZhLWZ3IGRyb3Bkb3duX19pY29uXCJ9KSwgXG5cblx0XHQgICAgICAgICAgICAgICAgICAgIFwiQ3VycmVudCBlQ2Fyc1wiXG5cdFx0ICAgICAgICAgICAgICAgICAgKVxuXHRcdCAgICAgICAgICAgICAgICApLCBcblx0XHQgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImxpXCIsIHtjbGFzc05hbWU6IFwiZHJvcGRvd25fX2l0ZW1cIn0sIFxuXHRcdCAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQocm91dGVyLmxpbmtUbywge1xuXHRcdCAgICAgICAgICAgICAgICAgIFx0c3RhdGVOYW1lOiBcInJlcG9ydGluZ1wiLCBcblx0XHQgICAgICAgICAgICAgICAgICBcdGNsYXNzTmFtZTogXCJkcm9wZG93bl9fbGlua1wifSwgXG5cdFx0ICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLXBhcGVyY2xpcCBmYS1mdyBkcm9wZG93bl9faWNvblwifSksIFxuXG5cdFx0ICAgICAgICAgICAgICAgICAgICBcIlJlcG9ydGluZ1wiXG5cdFx0ICAgICAgICAgICAgICAgICAgKVxuXHRcdCAgICAgICAgICAgICAgICApLCBcblx0XHQgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImxpXCIsIHtjbGFzc05hbWU6IFwiZHJvcGRvd25fX2l0ZW1cIn0sIFxuXHRcdCAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQocm91dGVyLmxpbmtUbywge1xuXHRcdCAgICAgICAgICAgICAgICAgIFx0c3RhdGVOYW1lOiBcImFkbWluXCIsIFxuXHRcdCAgICAgICAgICAgICAgICAgIFx0Y2xhc3NOYW1lOiBcImRyb3Bkb3duX19saW5rXCJ9LCBcblx0XHQgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IFwiZmEgZmEtY29nIGZhLWZ3IGRyb3Bkb3duX19pY29uXCJ9KSwgXG5cblx0XHQgICAgICAgICAgICAgICAgICAgIFwiQWRtaW5pc3RyYXRpb25cIlxuXHRcdCAgICAgICAgICAgICAgICAgIClcblx0XHQgICAgICAgICAgICAgICAgKVxuXHRcdCAgICAgICAgICAgICAgKVxuXHRcdCAgICAgICAgICAgIClcblx0ICAgICAgICAgXHQgKVxuICAgICAgICAgXHQgKVxuXHRcdFx0KTtcblx0fVxufSApO1xuXG5leHBvcnQgZGVmYXVsdCBuYXZpZ2F0aW9uOyIsImltcG9ydCByb3V0ZXIgZnJvbSAnLi4vcm91dGVyL3JvdXRlcic7XG5cbnZhciBzZWFyY2ggPSBSZWFjdC5jcmVhdGVDbGFzcygge2Rpc3BsYXlOYW1lOiAnc2VhcmNoJyxcblx0aGFuZGxlU2VhcmNoOiBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdGlmKCBldmVudC5rZXlDb2RlID09PSAxMyApIHtcblx0XHRcdGlmKCBldmVudC50YXJnZXQudmFsdWUudHJpbSgpICE9PSAnJyApIHtcblx0XHRcdFx0d2luZG93LmxvY2F0aW9uID0gJy8jL3NlYXJjaC8nICsgZW5jb2RlVVJJQ29tcG9uZW50KCBldmVudC50YXJnZXQudmFsdWUgKTtcblx0XHRcdH1cblx0XHRcdHRoaXMub3ZlcnJpZGUgPSB0cnVlO1xuXHRcdH1cblx0fSxcblx0b3ZlcnJpZGU6IHRydWUsXG5cdGhhbmRsZUNoYW5nZTogZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHR0aGlzLm92ZXJyaWRlID0gZmFsc2U7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRzZWFyY2hUZXJtOiBldmVudC50YXJnZXQudmFsdWVcblx0XHR9KTtcblx0fSxcblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNlYXJjaFRlcm06ICcnXG5cdFx0fTtcblx0fSxcblx0Y29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIF90aGlzID0gdGhpcztcblx0XHQvLyByb3V0ZXIucmVnaXN0ZXJDYWxsYmFjayggJ2RlZmF1bHQnLCBmdW5jdGlvbiAoIHN0YXRlICkge1xuXHRcdC8vIFx0dmFyIHF1ZXJ5ID0gc3RhdGUucGFyYW1zLnF1ZXJ5O1xuXG5cdFx0Ly8gXHRjb25zb2xlLmxvZyhfdGhpcy5zdGF0ZS5zZWFyY2hUZXJtLCBxdWVyeSk7XG5cblx0XHQvLyBcdGlmKCBfdGhpcy5zdGF0ZS5zZWFyY2hUZXJtICE9PSBxdWVyeSApIHtcblx0XHQvLyBcdFx0aWYoIF90aGlzLm92ZXJyaWRlICkge1xuXHRcdC8vIFx0XHRcdF90aGlzLnNldFN0YXRlKHtcblx0XHQvLyBcdFx0XHRcdHNlYXJjaFRlcm06IHF1ZXJ5XG5cdFx0Ly8gXHRcdFx0fSk7XG5cdFx0Ly8gXHRcdH1cblx0XHQvLyBcdFx0X3RoaXMub3ZlcnJpZGUgPSB0cnVlO1xuXHRcdC8vIFx0fVxuXHRcdC8vIH0gKTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIChcblx0XHQgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInNlYXJjaFwifSwgXG5cdFx0ICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IFwiZmEgZmEtc2VhcmNoIHNlYXJjaF9faWNvblwifSksIFxuXG5cdCAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge1xuXHQgICAgICAgICAgXHR0eXBlOiBcInRleHRcIiwgXG5cdCAgICAgICAgICBcdHBsYWNlaG9sZGVyOiBcIlNlYXJjaCBlQ2Fyc1wiLCBcblx0ICAgICAgICAgIFx0Y2xhc3NOYW1lOiBcInNlYXJjaF9fYm94XCIsIFxuXHQgICAgICAgICAgXHR2YWx1ZTogIHRoaXMuc3RhdGUuc2VhcmNoVGVybSwgXG5cdCAgICAgICAgICBcdG9uQ2hhbmdlOiAgdGhpcy5oYW5kbGVDaGFuZ2UsIFxuXHQgICAgICAgICAgXHRvbktleURvd246ICB0aGlzLmhhbmRsZVNlYXJjaH0pLCBcblxuXHQgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJzZWFyY2hfX3RpcFwifSwgXG5cdCAgICAgICAgICAgIFwiUHJlc3MgXCIsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwic2VhcmNoX190aXAtLWJ1dHRvblwifSwgXCJFbnRlclwiKSwgXCIgdG8gc2VhcmNoXCJcblx0ICAgICAgICAgIClcblx0ICAgICAgICApXG5cblx0XHRcdCk7XG5cdH1cbn0gKTtcblxuZXhwb3J0IGRlZmF1bHQgc2VhcmNoOyIsImltcG9ydCByb3V0ZXIgZnJvbSAnLi9yb3V0ZXIvcm91dGVyLmpzeCc7XG5cbmNvbnNvbGUubG9nKHJvdXRlcik7XG5cbmltcG9ydCBjcmVhdGUgZnJvbSAnLi9wYWdlcy9jcmVhdGUuanN4JztcbmltcG9ydCB7IGN1cnJlbnQsIHJlc29sdmUgYXMgY3VycmVudFJlc29sdmUgfSBmcm9tICcuL3BhZ2VzL2N1cnJlbnQuanN4JztcbmltcG9ydCBzZWFyY2ggZnJvbSAnLi9wYWdlcy9zZWFyY2guanN4JztcbmltcG9ydCBpbmZvIGZyb20gJy4vcGFnZXMvaW5mby5qc3gnO1xuaW1wb3J0IGFkbWluIGZyb20gJy4vcGFnZXMvYWRtaW4uanN4JztcbmltcG9ydCByZXBvcnRpbmcgZnJvbSAnLi9wYWdlcy9yZXBvcnRpbmcuanN4JztcbmltcG9ydCBlY2FyIGZyb20gJy4vcGFnZXMvZWNhci5qc3gnO1xuXG5yb3V0ZXIucmVnaXN0ZXJTdGF0ZSgnY3JlYXRlJywge1xuICAgIHVybDogJy9jcmVhdGUnLFxuICAgIHZpZXc6IGNyZWF0ZSxcbiAgICByZXNvbHZlOiBjcmVhdGUucmVzb2x2ZVxufSk7XG5cbnJvdXRlci5yZWdpc3RlclN0YXRlKCdjdXJyZW50Jywge1xuICAgIHVybDogJy9jdXJyZW50JyxcbiAgICB2aWV3OiBjdXJyZW50LFxuICAgIHJlc29sdmU6IGN1cnJlbnRSZXNvbHZlXG59KTtcblxucm91dGVyLnJlZ2lzdGVyU3RhdGUoJ2VjYXInLCB7XG4gICAgdXJsOiAnL2VjYXIvOndvcmtmbG93SWQnLFxuICAgIHZpZXc6IGVjYXIsXG4gICAgcmVzb2x2ZTogZWNhci5yZXNvbHZlXG59KTtcblxucm91dGVyLnJlZ2lzdGVyU3RhdGUoJ2luZm8nLCB7XG4gICAgdXJsOiAnL2luZm8nLFxuICAgIHZpZXc6IGluZm9cbn0pO1xuXG5yb3V0ZXIucmVnaXN0ZXJTdGF0ZSgncmVwb3J0aW5nJywge1xuICAgIHVybDogJy9yZXBvcnRpbmcnLFxuICAgIHZpZXc6IHJlcG9ydGluZ1xufSk7XG5cbnJvdXRlci5yZWdpc3RlclN0YXRlKCdhZG1pbicsIHtcbiAgICB1cmw6ICcvYWRtaW4nLFxuICAgIHZpZXc6IGFkbWluXG59KTtcblxucm91dGVyLnJlZ2lzdGVyU3RhdGUoJ3NlYXJjaCcsIHtcbiAgICB1cmw6ICcvc2VhcmNoLzpxdWVyeScsXG4gICAgb3B0aW9uYWxQYXJhbXM6IFsncXVlcnknXSxcbiAgICB2aWV3OiBzZWFyY2hcbn0pO1xuXG5yb3V0ZXIub3RoZXJ3aXNlKCdjdXJyZW50Jyk7XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlcjsiLCJpbXBvcnQgc3RvcmUgZnJvbSAnLi4vc3RvcmVzL3JvdXRlcic7XG5cbnZhciBhY3Rpb25zID0ge1xuXHRjaGFuZ2VTdGF0ZTogZnVuY3Rpb24gKG5hbWUpIHtcblx0XHR0aGlzLmRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuXHRcdFx0YWN0aW9uOiAnY2hhbmdlU3RhdGUnLFxuXHRcdFx0ZGF0YTogbmFtZVxuXHRcdH0pO1xuXHR9LFxuXHRzdGF0ZUNoYW5nZVN0YXJ0OiBmdW5jdGlvbiAoc3RhdGUpIHtcblx0XHR0aGlzLmRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuXHRcdFx0YWN0aW9uOiAnc3RhdGVDaGFuZ2VTdGFydCcsXG5cdFx0XHRkYXRhOiB7XG5cdFx0XHRcdHN0YXRlOiBzdGF0ZVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHRzdGF0ZUNoYW5nZUZpbmlzaDogZnVuY3Rpb24gKHN0YXRlLCBkYXRhKSB7XG5cdFx0dGhpcy5kaXNwYXRjaGVyLmRpc3BhdGNoKHtcblx0XHRcdGFjdGlvbjogJ3N0YXRlQ2hhbmdlRmluaXNoJyxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0c3RhdGU6IHN0YXRlLFxuXHRcdFx0XHRkYXRhOiBkYXRhXG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdHN0YXRlUHJvbWlzZUZpbmlzaGVkOiBmdW5jdGlvbiAocHJvbWlzZSkge1xuXHRcdHRoaXMuZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG5cdFx0XHRhY3Rpb246ICdzdGF0ZVByb21pc2VGaW5pc2hlZCcsXG5cdFx0XHRkYXRhOiBwcm9taXNlXG5cdFx0fSk7XG5cdH0sXG5cdHN0YXRlUHJvbWlzZUZhaWxlZDogZnVuY3Rpb24gKHByb21pc2UpIHtcblx0XHR0aGlzLmRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuXHRcdFx0YWN0aW9uOiAnc3RhdGVQcm9taXNlRmFpbGVkJyxcblx0XHRcdGRhdGE6IHByb21pc2Vcblx0XHR9KTtcblx0fSxcblx0cmVnaXN0ZXJTdGF0ZTogZnVuY3Rpb24gKG5hbWUsIGNvbmZpZykge1xuXHRcdHRoaXMuZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG5cdFx0XHRhY3Rpb246ICdyZWdpc3RlclN0YXRlJyxcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0bmFtZTogbmFtZSxcblx0XHRcdFx0Y29uZmlnOiBjb25maWdcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufTtcblxudmFyIGFjdGlvbnMgPSBzdG9yZS5jcmVhdGVBY3Rpb25zKGFjdGlvbnMpO1xuXG5leHBvcnQgZGVmYXVsdCBhY3Rpb25zOyIsInZhciByb3V0ZXIgXHRcdD0gcmVxdWlyZSgnLi4vcm91dGVyJyk7XG5cbmltcG9ydCByb3V0ZXJTdG9yZSBmcm9tICcuLi9zdG9yZXMvcm91dGVyJztcblxudmFyIGxpbmtUbyA9IFJlYWN0LmNyZWF0ZUNsYXNzKCB7ZGlzcGxheU5hbWU6ICdsaW5rVG8nLFxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0dmFyIF90aGlzID0gdGhpcztcblxuXHRcdHJvdXRlclN0b3JlLm9uKCdzdGF0ZUNoYW5nZVN0YXJ0JywgdGhpcy5oYW5kbGVTdGF0ZUNoYW5nZSk7XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdHJvdXRlclN0b3JlLm9mZignc3RhdGVDaGFuZ2VTdGFydCcsIHRoaXMuaGFuZGxlU3RhdGVDaGFuZ2UpO1xuXHR9LFxuXHRoYW5kbGVTdGF0ZUNoYW5nZShwYXlsb2FkKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRhY3RpdmU6IHBheWxvYWQuc3RhdGUubmFtZSA9PT0gdGhpcy5wcm9wcy5zdGF0ZU5hbWUsXG5cdFx0XHRzdGF0ZTogcGF5bG9hZC5zdGF0ZVxuXHRcdH0pO1xuXHR9LFxuXHRnZXRJbml0aWFsU3RhdGUoKSB7XG5cdFx0dmFyIHN0YXRlcyA9IHJvdXRlclN0b3JlLmdldFN0YXRlcygpO1xuXHRcdHZhciBzdGF0ZSA9IHN0YXRlc1t0aGlzLnByb3BzLnN0YXRlTmFtZV07XG5cblx0XHRpZiggc3RhdGUgKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRocmVmOiAnIycgKyBzdGF0ZS5jb21waWxlZFN0YXRlLmZvcm1hdCggdGhpcy5wcm9wcy5wYXJhbXMgfHwge30gKSxcblx0XHRcdFx0YWN0aXZlOiBmYWxzZVxuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdTdGF0ZSAnICsgdGhpcy5wcm9wcy5zdGF0ZU5hbWUgKyAnIGRvZXMgbm90IGV4aXN0Jyk7XG5cdFx0fVxuXHR9LFxuXHRyZW5kZXIoKSB7XG5cdFx0dmFyIGhyZWYgPSB0aGlzLnN0YXRlLmhyZWY7XG5cdFx0dmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5cdFx0dmFyIGNsYXNzZXMgPSBjeCh7XG5cdFx0XHQnYWN0aXZlJzogdGhpcy5zdGF0ZS5hY3RpdmVcblx0XHR9KTtcblxuXHRcdHJldHVybiB0aGlzLnRyYW5zZmVyUHJvcHNUbyhcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJhXCIsIHtocmVmOiBocmVmLCBjbGFzc05hbWU6IGNsYXNzZXMgfSwgIHRoaXMucHJvcHMuY2hpbGRyZW4pXG5cdFx0XHQpO1xuXHR9XG59ICk7XG5cbmV4cG9ydCBkZWZhdWx0IGxpbmtUbzsiLCJpbXBvcnQgcm91dGVyU3RvcmUgZnJvbSAnLi4vc3RvcmVzL3JvdXRlcic7XG5cbnZhciB2aWV3ID0gUmVhY3QuY3JlYXRlQ2xhc3MoIHtkaXNwbGF5TmFtZTogJ3ZpZXcnLFxuXHRjb21wb25lbnRXaWxsTW91bnQoKSB7XG5cdFx0dmFyIF90aGlzID0gdGhpcztcblxuXHRcdHJvdXRlclN0b3JlLm9uKCdzdGF0ZUNoYW5nZUZpbmlzaCcsIHRoaXMuaGFuZGxlU3RhdGVDaGFuZ2UpO1xuXHR9LFxuXHRjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcblx0XHRyb3V0ZXJTdG9yZS5vZmYoJ3N0YXRlQ2hhbmdlRmluaXNoJywgdGhpcy5oYW5kbGVTdGF0ZUNoYW5nZSk7XG5cdH0sXG5cdGhhbmRsZVN0YXRlQ2hhbmdlOiBmdW5jdGlvbiAocGF5bG9hZCkge1xuXHRcdHNldFRpbWVvdXQoICgpID0+IHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRjdXJyZW50U3RhdGU6IHBheWxvYWQuc3RhdGUsXG5cdFx0XHRcdGRhdGE6IHBheWxvYWQuZGF0YVxuXHRcdFx0fSk7XG5cdFx0fSwgMCk7XG5cdH0sXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oICkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRjdXJyZW50U3RhdGU6IHtcblx0XHRcdFx0dmlldzogbnVsbFxuXHRcdFx0fSxcblx0XHRcdGRhdGE6IHtcblxuXHRcdFx0fVxuXHRcdH07XG5cdH0sXG5cdHJlbmRlcigpIHtcblx0XHR2YXIgY3VycmVudFN0YXRlID0gdGhpcy5zdGF0ZS5jdXJyZW50U3RhdGU7XG5cdFx0dmFyIGRhdGEgPSB0aGlzLnN0YXRlLmRhdGE7XG5cblx0XHRpZiggIWN1cnJlbnRTdGF0ZS52aWV3ICkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0dmFyIGtleSA9IGN1cnJlbnRTdGF0ZS5mb3JjZVJlbW91bnQgPyArbmV3IERhdGUoKSA6IGN1cnJlbnRTdGF0ZS5uYW1lO1xuXG5cdFx0cmV0dXJuIGN1cnJlbnRTdGF0ZS52aWV3KCB7XG5cdFx0XHRrZXk6IGtleSxcblx0XHRcdGRhdGE6IGRhdGEsXG5cdFx0XHRjdXJyZW50U3RhdGU6IGN1cnJlbnRTdGF0ZVxuXHRcdH0gKTtcblx0fVxufSApO1xuXG5leHBvcnQgZGVmYXVsdCB2aWV3OyIsInZhciBtYXRjaEZhY3RvcnkgPSBmdW5jdGlvbiAoIHVybCwgY29uZmlnICkge1xuXHQgdmFyIHBsYWNlaG9sZGVyID0gLyhbOipdKShcXHcrKXxcXHsoXFx3KykoPzpcXDooKD86W157fVxcXFxdK3xcXFxcLnxcXHsoPzpbXnt9XFxcXF0rfFxcXFwuKSpcXH0pKykpP1xcfS9nO1xuXG5cdGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcblxuICAgIHZhciBjb21waWxlZCA9ICdeJztcbiAgICB2YXIgbGFzdCA9IDA7XG4gICAgdmFyIG07XG5cbiAgICB2YXIgc2VnbWVudHMgPSB0aGlzLnNlZ21lbnRzID0gW107XG4gICAgdmFyIHBhcmFtcyA9IHRoaXMucGFyYW1zID0ge307XG5cbiAgICB2YXIgaWQsIHJlZ2V4cCwgc2VnbWVudCwgdHlwZSwgY2ZnO1xuXG4gICAgdmFyIHBhdHRlcm4gPSB1cmw7XG4gICAgZnVuY3Rpb24gZXh0ZW5kKCB0YXJnZXQsIGRlc3QgKSB7XG4gICAgXHRjb25zb2xlLmxvZyh0YXJnZXQsZGVzdCk7XG4gICAgXHRmb3IoIHZhciBpIGluIGRlc3QgKSB7XG4gICAgXHRcdHRhcmdldFtpXSA9IGRlc3RbaV07XG4gICAgXHR9XG5cbiAgICBcdHJldHVybiB0YXJnZXQ7XG4gICAgfVxuXG4gIGZ1bmN0aW9uIGFkZFBhcmFtZXRlcihpZCwgdHlwZSwgY29uZmlnKSB7XG4gICAgaWYgKCEvXlxcdysoLStcXHcrKSokLy50ZXN0KGlkKSkgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBwYXJhbWV0ZXIgbmFtZSAnXCIgKyBpZCArIFwiJyBpbiBwYXR0ZXJuICdcIiArIHBhdHRlcm4gKyBcIidcIik7XG4gICAgaWYgKHBhcmFtc1tpZF0pIHRocm93IG5ldyBFcnJvcihcIkR1cGxpY2F0ZSBwYXJhbWV0ZXIgbmFtZSAnXCIgKyBpZCArIFwiJyBpbiBwYXR0ZXJuICdcIiArIHBhdHRlcm4gKyBcIidcIik7XG5cbiAgICBwYXJhbXNbaWRdID0gZXh0ZW5kKHsgdHlwZTogdHlwZSB8fCBuZXcgVHlwZSgpLCAkdmFsdWU6IGZ1bmN0aW9uKHRlc3Qpe3JldHVybiB0ZXN0O30gfSwgY29uZmlnKTtcbiAgfVxuICBmdW5jdGlvbiAkdmFsdWUodmFsdWUpIHtcbiAgICAvKmpzaGludCB2YWxpZHRoaXM6IHRydWUgKi9cbiAgICByZXR1cm4gdmFsdWUgPyB0aGlzLnR5cGUuZGVjb2RlKHZhbHVlKSA6ICRVcmxNYXRjaGVyRmFjdG9yeS4kJGdldERlZmF1bHRWYWx1ZSh0aGlzKTtcbiAgfVxuXG4gICAgZnVuY3Rpb24gcXVvdGVSZWdFeHAoc3RyaW5nLCBwYXR0ZXJuLCBpc09wdGlvbmFsKSB7XG5cdCAgICB2YXIgcmVzdWx0ID0gc3RyaW5nLnJlcGxhY2UoL1tcXFxcXFxbXFxdXFxeJCorPy4oKXx7fV0vZywgXCJcXFxcJCZcIik7XG5cdCBcdGlmICghcGF0dGVybikgcmV0dXJuIHJlc3VsdDtcblx0IFx0dmFyIGZsYWcgPSBpc09wdGlvbmFsID8gJz8nIDogJyc7XG5cdFx0cmV0dXJuIHJlc3VsdCArIGZsYWcgKyAnKCcgKyBwYXR0ZXJuICsgJyknICsgZmxhZztcblx0fVxuXG5cdCAgZnVuY3Rpb24gcGFyYW1Db25maWcocGFyYW0pIHtcbiAgICBpZiAoIWNvbmZpZy5wYXJhbXMgfHwgIWNvbmZpZy5wYXJhbXNbcGFyYW1dKSByZXR1cm4ge307XG4gICAgdmFyIGNmZyA9IGNvbmZpZy5wYXJhbXNbcGFyYW1dO1xuICAgIHJldHVybiB0eXBlb2YgY2ZnID09PSAnb2JqZWN0JyA/IGNmZyA6IHsgdmFsdWU6IGNmZyB9O1xuICB9XG5cbiAgXHR3aGlsZSAoKG0gPSBwbGFjZWhvbGRlci5leGVjKHBhdHRlcm4pKSkge1xuXG5cdCAgICBpZCAgICAgID0gbVsyXSB8fCBtWzNdOyAvLyBJRVs3OF0gcmV0dXJucyAnJyBmb3IgdW5tYXRjaGVkIGdyb3VwcyBpbnN0ZWFkIG9mIG51bGxcblx0ICAgIHJlZ2V4cCAgPSBtWzRdIHx8IChtWzFdID09ICcqJyA/ICcuKicgOiAnW14vXSonKTtcblx0ICAgIHNlZ21lbnQgPSBwYXR0ZXJuLnN1YnN0cmluZyhsYXN0LCBtLmluZGV4KTtcblx0ICAgIHR5cGUgICAgPSB0aGlzLiR0eXBlc1tyZWdleHBdIHx8IG5ldyBUeXBlKHsgcGF0dGVybjogbmV3IFJlZ0V4cChyZWdleHApIH0pO1xuXHQgICAgY2ZnICAgICA9IHBhcmFtQ29uZmlnKGlkKTtcblxuXHQgICAgaWYgKHNlZ21lbnQuaW5kZXhPZignPycpID49IDApIGJyZWFrOyAvLyB3ZSdyZSBpbnRvIHRoZSBzZWFyY2ggcGFydFxuXG5cdCAgICBjb21waWxlZCArPSBxdW90ZVJlZ0V4cChzZWdtZW50LCB0eXBlLiRzdWJQYXR0ZXJuKCksIGNmZyAmJiBjZmcudmFsdWUpO1xuXG5cdCAgICBhZGRQYXJhbWV0ZXIoaWQsIHR5cGUsIGNmZyk7XG5cdCAgXHRzZWdtZW50cy5wdXNoKHNlZ21lbnQpO1xuXHQgICAgbGFzdCA9IHBsYWNlaG9sZGVyLmxhc3RJbmRleDtcblx0fVxuXHRzZWdtZW50ID0gcGF0dGVybi5zdWJzdHJpbmcobGFzdCk7XG5cblx0dmFyIGkgPSBzZWdtZW50LmluZGV4T2YoJz8nKTtcblxuXHRpZiAoaSA+PSAwKSB7XG5cdCAgICB2YXIgc2VhcmNoID0gdGhpcy5zb3VyY2VTZWFyY2ggPSBzZWdtZW50LnN1YnN0cmluZyhpKTtcblx0ICAgIHNlZ21lbnQgPSBzZWdtZW50LnN1YnN0cmluZygwLCBpKTtcblx0ICAgIHRoaXMuc291cmNlUGF0aCA9IHBhdHRlcm4uc3Vic3RyaW5nKDAsIGxhc3QgKyBpKTtcblxuXHQgICAgLy8gQWxsb3cgcGFyYW1ldGVycyB0byBiZSBzZXBhcmF0ZWQgYnkgJz8nIGFzIHdlbGwgYXMgJyYnIHRvIG1ha2UgY29uY2F0KCkgZWFzaWVyXG5cdCAgICBzZWFyY2guc3Vic3RyaW5nKDEpLnNwbGl0KC9bJj9dLykuZm9yRWFjaCggZnVuY3Rpb24oa2V5KSB7XG5cdCAgICAgIC8vYWRkUGFyYW1ldGVyKGtleSwgbnVsbCwgcGFyYW1Db25maWcoa2V5KSk7XG5cdCAgICB9KTtcblx0fSBlbHNlIHtcblx0ICAgIHRoaXMuc291cmNlUGF0aCA9IHBhdHRlcm47XG5cdFx0dGhpcy5zb3VyY2VTZWFyY2ggPSAnJztcblx0fVxuXG5cdGNvbXBpbGVkICs9IHF1b3RlUmVnRXhwKHNlZ21lbnQpICsgKGNvbmZpZy5zdHJpY3QgPT09IGZhbHNlID8gJ1xcLz8nIDogJycpICsgJyQnO1xuXHRzZWdtZW50cy5wdXNoKHNlZ21lbnQpO1xuXG5cdHRoaXMucmVnZXhwID0gbmV3IFJlZ0V4cChjb21waWxlZCwgY29uZmlnLmNhc2VJbnNlbnNpdGl2ZSA/ICdpJyA6IHVuZGVmaW5lZCk7XG5cdHRoaXMucHJlZml4ID0gc2VnbWVudHNbMF07XG59O1xuXG5tYXRjaEZhY3RvcnkucHJvdG90eXBlLmV4ZWMgPSBmdW5jdGlvbiAocGF0aCwgc2VhcmNoUGFyYW1zKSB7XG4gIHZhciBtID0gdGhpcy5yZWdleHAuZXhlYyhwYXRoKTtcbiAgaWYgKCFtKSByZXR1cm4gbnVsbDtcbiAgc2VhcmNoUGFyYW1zID0gc2VhcmNoUGFyYW1zIHx8IHt9O1xuXG4gIHZhciBwYXJhbXMgPSB0aGlzLnBhcmFtZXRlcnMoKSwgblRvdGFsID0gcGFyYW1zLmxlbmd0aCxcbiAgICBuUGF0aCA9IHRoaXMuc2VnbWVudHMubGVuZ3RoIC0gMSxcbiAgICB2YWx1ZXMgPSB7fSwgaSwgY2ZnLCBwYXJhbTtcblxuICBpZiAoblBhdGggIT09IG0ubGVuZ3RoIC0gMSkgdGhyb3cgbmV3IEVycm9yKFwiVW5iYWxhbmNlZCBjYXB0dXJlIGdyb3VwIGluIHJvdXRlICdcIiArIHRoaXMuc291cmNlICsgXCInXCIpO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBuUGF0aDsgaSsrKSB7XG4gICAgcGFyYW0gPSBwYXJhbXNbaV07XG4gICAgY2ZnID0gdGhpcy5wYXJhbXNbcGFyYW1dO1xuICAgIGNvbnNvbGUubG9nKHRoaXMucGFyYW1zKTtcbiAgICB2YWx1ZXNbcGFyYW1dID0gY2ZnLiR2YWx1ZShtW2kgKyAxXSk7XG4gIH1cbiAgZm9yICgvKiovOyBpIDwgblRvdGFsOyBpKyspIHtcbiAgICBwYXJhbSA9IHBhcmFtc1tpXTtcbiAgICBjZmcgPSB0aGlzLnBhcmFtc1twYXJhbV07XG4gICAgdmFsdWVzW3BhcmFtXSA9IGNmZy4kdmFsdWUoc2VhcmNoUGFyYW1zW3BhcmFtXSk7XG4gIH1cblxuICByZXR1cm4gdmFsdWVzO1xufTtcblxubWF0Y2hGYWN0b3J5LnByb3RvdHlwZS52YWxpZGF0ZXMgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gIHZhciByZXN1bHQgPSB0cnVlLCBpc09wdGlvbmFsLCBjZmcsIHNlbGYgPSB0aGlzO1xuXG4gIGZvciggdmFyIGtleSBpbiBwYXJhbXMgKSB7XG4gIFx0dmFyIHZhbCA9IHBhcmFtc1trZXldO1xuICAgIGlmICghc2VsZi5wYXJhbXNba2V5XSkgcmV0dXJuO1xuICAgIGNmZyA9IHNlbGYucGFyYW1zW2tleV07XG4gICAgaXNPcHRpb25hbCA9ICF2YWwgJiYgY2ZnICYmIGNmZy52YWx1ZTtcbiAgICByZXN1bHQgPSByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbm1hdGNoRmFjdG9yeS5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICB2YXIgc2VnbWVudHMgPSB0aGlzLnNlZ21lbnRzLCBwYXJhbXMgPSB0aGlzLnBhcmFtZXRlcnMoKTtcblxuICBpZiAoIXZhbHVlcykgcmV0dXJuIHNlZ21lbnRzLmpvaW4oJycpLnJlcGxhY2UoJy8vJywgJy8nKTtcblxuICB2YXIgblBhdGggPSBzZWdtZW50cy5sZW5ndGggLSAxLCBuVG90YWwgPSBwYXJhbXMubGVuZ3RoLFxuICAgIHJlc3VsdCA9IHNlZ21lbnRzWzBdLCBpLCBzZWFyY2gsIHZhbHVlLCBwYXJhbSwgY2ZnLCBhcnJheTtcblxuICBpZiAoIXRoaXMudmFsaWRhdGVzKHZhbHVlcykpIHJldHVybiAnJztcblxuICBmb3IgKGkgPSAwOyBpIDwgblBhdGg7IGkrKykge1xuICAgIHBhcmFtID0gcGFyYW1zW2ldO1xuICAgIHZhbHVlID0gdmFsdWVzW3BhcmFtXTtcbiAgICBjZmcgICA9IHRoaXMucGFyYW1zW3BhcmFtXTtcblxuICAgIGlmICghdmFsdWUgJiYgKHNlZ21lbnRzW2ldID09PSAnLycgJiYgc2VnbWVudHNbaSArIDFdID09PSAnLycpKSBjb250aW51ZTtcbiAgICBpZiAodmFsdWUgIT0gbnVsbCkgcmVzdWx0ICs9IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG4gICAgcmVzdWx0ICs9IHNlZ21lbnRzW2kgKyAxXTtcbiAgfVxuXG4gIGZvciAoLyoqLzsgaSA8IG5Ub3RhbDsgaSsrKSB7XG4gICAgcGFyYW0gPSBwYXJhbXNbaV07XG4gICAgdmFsdWUgPSB2YWx1ZXNbcGFyYW1dO1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSBjb250aW51ZTtcbiAgICBhcnJheSA9IHR5cGVvZiB2YWx1ZSA9PT0gJ2FycmF5JztcblxuICAgIGlmIChhcnJheSkge1xuICAgICAgdmFsdWUgPSB2YWx1ZS5tYXAoZW5jb2RlVVJJQ29tcG9uZW50KS5qb2luKCcmJyArIHBhcmFtICsgJz0nKTtcbiAgICB9XG4gICAgcmVzdWx0ICs9IChzZWFyY2ggPyAnJicgOiAnPycpICsgcGFyYW0gKyAnPScgKyAoYXJyYXkgPyB2YWx1ZSA6IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuICAgIHNlYXJjaCA9IHRydWU7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdC5yZXBsYWNlKCcvLycsICcvJyk7XG59O1xuXG5tYXRjaEZhY3RvcnkucHJvdG90eXBlLnBhcmFtZXRlcnMgPSBmdW5jdGlvbiAocGFyYW0pIHtcbiAgaWYgKCFwYXJhbSkgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMucGFyYW1zKTtcbiAgcmV0dXJuIHRoaXMucGFyYW1zW3BhcmFtXSB8fCBudWxsO1xufTtcblxuXG5tYXRjaEZhY3RvcnkucHJvdG90eXBlLiR0eXBlcyA9IHt9O1xuXG5mdW5jdGlvbiBUeXBlKCBjb25maWcgKSB7XG5cdGZvciggdmFyIGkgaW4gY29uZmlnICkge1xuXHRcdHRoaXNbaV0gPSBjb25maWdbaV07XG5cdH1cbn1cblxuVHlwZS5wcm90b3R5cGUuJHN1YlBhdHRlcm4gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHN1YiA9IHRoaXMucGF0dGVybi50b1N0cmluZygpO1xuICByZXR1cm4gc3ViLnN1YnN0cigxLCBzdWIubGVuZ3RoIC0gMik7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gbWF0Y2hGYWN0b3J5OyIsIi8qXG5cdENvbXBvbmVudHNcbiAqL1xuXG52YXIgbWF0Y2hGYWN0b3J5IFx0PSByZXF1aXJlKCcuL21hdGNoRmFjdG9yeScpO1xuXG5pbXBvcnQgbGlua1RvIGZyb20gJy4vY29tcG9uZW50cy9saW5rVG8nO1xuaW1wb3J0IHZpZXcgZnJvbSAnLi9jb21wb25lbnRzL3ZpZXcnO1xuXG5pbXBvcnQgcm91dGVyQWN0aW9ucyBmcm9tICcuL2FjdGlvbnMvcm91dGVyJztcbmltcG9ydCByb3V0ZXJTdG9yZSBmcm9tICcuL3N0b3Jlcy9yb3V0ZXInO1xuXG52YXIgcm91dGVyID0ge307XG5cbnJvdXRlci5zdGF0ZXMgPSB7fTtcbnJvdXRlci5mYWxsYmFja1N0YXRlID0gJyc7XG5cbnJvdXRlci5yZWdpc3RlclN0YXRlID0gZnVuY3Rpb24gKCBuYW1lLCBjb25maWcgKSB7XG5cdHZhciBjb21waWxlZFN0YXRlID0gbmV3IG1hdGNoRmFjdG9yeSggY29uZmlnLnVybCApO1xuXG5cdHZhciBuZXdTdGF0ZSA9IGNvbmZpZztcblx0bmV3U3RhdGUubmFtZSA9IG5hbWU7XG5cdG5ld1N0YXRlLmNvbXBpbGVkU3RhdGUgPSBjb21waWxlZFN0YXRlO1xuXG5cdHRoaXMuc3RhdGVzW25hbWVdID0gbmV3U3RhdGU7XG5cblx0cm91dGVyQWN0aW9ucy5yZWdpc3RlclN0YXRlKG5hbWUsIGNvbmZpZyk7XG59O1xuXG5yb3V0ZXIub3RoZXJ3aXNlID0gZnVuY3Rpb24gKCBzdGF0ZU5hbWUgKSB7XG5cdHRoaXMuZmFsbGJhY2tTdGF0ZSA9IHRoaXMuc3RhdGVzW3N0YXRlTmFtZV07XG59O1xuXG5yb3V0ZXIuY2hhbmdlU3RhdGUgPSBmdW5jdGlvbiAoc3RhdGUpIHtcblx0cm91dGVyQWN0aW9ucy5zdGF0ZUNoYW5nZVN0YXJ0KHN0YXRlKTtcblxuXHR2YXIgcHJvbWlzZXMgPSBbXTtcblxuXHRpZiggc3RhdGUucmVzb2x2ZSApIHtcblx0XHR2YXIgcmVzb2x2ZUtleXMgPSBPYmplY3Qua2V5cyhzdGF0ZS5yZXNvbHZlKTtcblxuXHRcdHZhciByZXNvbHZlcyA9IHN0YXRlLnJlc29sdmU7XG5cdFx0Zm9yKCB2YXIgaSBpbiByZXNvbHZlcyApIHtcblx0XHRcdHZhciByZXNvbHZlID0gcmVzb2x2ZXNbaV07XG5cblx0XHRcdHZhciBzdGF0ZVByb21pc2UgPSByZXNvbHZlLmNhbGwoIHRoaXMsIHN0YXRlLnBhcmFtcyApO1xuXG5cdFx0XHRwcm9taXNlcy5wdXNoKHN0YXRlUHJvbWlzZSk7XG5cblx0XHRcdHN0YXRlUHJvbWlzZS50aGVuKHJvdXRlckFjdGlvbnMuc3RhdGVQcm9taXNlRmluaXNoZWQsIHJvdXRlckFjdGlvbnMuc3RhdGVQcm9taXNlRmFpbGVkKTtcblx0XHR9XG5cdH1cblxuXHR2YXIgcHJvbWlzZSA9IFEuYWxsKHByb21pc2VzKTtcblxuXHRwcm9taXNlLnRoZW4oIGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0dmFyIGRhdGFUb1Bhc3MgPSB7fTtcblxuXHRcdGlmKCBzdGF0ZS5yZXNvbHZlICkge1xuXHRcdFx0ZGF0YS5mb3JFYWNoKCBmdW5jdGlvbiAocmVzcG9uc2UsIGluZGV4KSB7XG5cdFx0XHRcdHZhciBrZXkgPSByZXNvbHZlS2V5c1tpbmRleF07XG5cdFx0XHRcdGRhdGFUb1Bhc3NbIGtleSBdID0gcmVzcG9uc2U7IFxuXHRcdFx0fSApO1xuXHRcdH1cblxuXHRcdHJvdXRlckFjdGlvbnMuc3RhdGVDaGFuZ2VGaW5pc2goc3RhdGUsIGRhdGFUb1Bhc3MpO1xuXHR9ICk7XG59O1xuXG5yb3V0ZXIuaGFuZGxlU3RhdGVDaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG5cdHZhciB1cmwgPSB3aW5kb3cubG9jYXRpb24uaGFzaC5yZXBsYWNlKCcjJywgJycpO1xuXG5cdHZhciBzdGF0ZXMgPSB0aGlzLnN0YXRlcztcblx0dmFyIGNoYW5nZWQgPSBmYWxzZTtcblx0Zm9yKCB2YXIgaSBpbiBzdGF0ZXMgKSB7XG5cdFx0dmFyIHN0YXRlID0gc3RhdGVzW2ldO1xuXG5cdFx0dmFyIGNoZWNrID0gc3RhdGUuY29tcGlsZWRTdGF0ZS5leGVjKHVybCk7XG5cdFx0Zm9yKCB2YXIgaSBpbiBjaGVjayApIHtcblx0XHRcdGNoZWNrW2ldID0gZGVjb2RlVVJJQ29tcG9uZW50KGNoZWNrW2ldKTtcblx0XHR9XG5cdFx0c3RhdGUucGFyYW1zID0gY2hlY2s7XG5cblx0XHRpZiggY2hlY2sgKSB7XG5cdFx0XHRjaGFuZ2VkID0gdHJ1ZTtcblx0XHRcdHRoaXMuY2hhbmdlU3RhdGUoIHN0YXRlICk7XG5cdFx0fVxuXHR9XG5cblx0aWYoICFjaGFuZ2VkICkge1xuXHRcdHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gdGhpcy5mYWxsYmFja1N0YXRlLmNvbXBpbGVkU3RhdGUucHJlZml4O1xuXHR9XG59O1xuXG53aW5kb3cub25oYXNoY2hhbmdlID0gcm91dGVyLmhhbmRsZVN0YXRlQ2hhbmdlLmJpbmQocm91dGVyKTtcblxucm91dGVyLmxpbmtUbyA9IGxpbmtUbztcbnJvdXRlci52aWV3ID0gdmlldztcblxucm91dGVyLmFjdGlvbnMgPSByb3V0ZXJBY3Rpb25zO1xucm91dGVyLnN0b3JlID0gcm91dGVyU3RvcmU7XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlcjsiLCJ2YXIgc3RvcmUgPSByZXF1aXJlKCcuLi8uLi9mbHV4L3N0b3JlJyk7XG52YXIgZGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uLy4uL2Rpc3BhdGNoZXJzL2VjYXInKTtcblxudmFyIHJvdXRlclN0b3JlID0gbmV3IHN0b3JlKHtcblx0ZGlzcGF0Y2hlcjogZGlzcGF0Y2hlclxufSk7XG5cbnJvdXRlclN0b3JlLmN1cnJlbnRTdGF0ZSA9IHt9O1xucm91dGVyU3RvcmUuc3RhdGVzID0ge307XG5cbnJvdXRlclN0b3JlLnJlZ2lzdGVySGFuZGxlcnMoe1xuXHRjaGFuZ2VTdGF0ZTogZnVuY3Rpb24gKHBheWxvYWQpIHtcblx0XHR0aGlzLmVtaXQoJ2NoYW5nZVN0YXRlJywgcGF5bG9hZCk7XG5cdH0sXG5cdHJlZ2lzdGVyU3RhdGU6IGZ1bmN0aW9uIChwYXlsb2FkKSB7XG5cdFx0dGhpcy5zdGF0ZXNbcGF5bG9hZC5uYW1lXSA9IHBheWxvYWQuY29uZmlnO1xuXHRcdHRoaXMuZW1pdCgnc3RhdGVBZGRlZCcsIHBheWxvYWQpO1xuXHR9LFxuXHRzdGF0ZUNoYW5nZUZpbmlzaDogZnVuY3Rpb24gKHBheWxvYWQpIHtcblx0XHR0aGlzLmN1cnJlbnRTdGF0ZSA9IHBheWxvYWQ7XG5cdFx0dGhpcy5lbWl0KCdzdGF0ZUNoYW5nZUZpbmlzaCcsIHBheWxvYWQpO1xuXHR9LFxuXHRzdGF0ZUNoYW5nZVN0YXJ0OiBmdW5jdGlvbiAocGF5bG9hZCkge1xuXHRcdHRoaXMuY3VycmVudFN0YXRlID0gcGF5bG9hZDtcblx0XHR0aGlzLmVtaXQoJ3N0YXRlQ2hhbmdlU3RhcnQnLCBwYXlsb2FkKTtcblx0fSxcblx0c3RhdGVQcm9taXNlRmluaXNoZWQ6IGZ1bmN0aW9uIChwYXlsb2FkKSB7XG5cdFx0dGhpcy5lbWl0KCdzdGF0ZVByb21pc2VGaW5pc2hlZCcsIHBheWxvYWQpO1xuXHR9XG59KTtcblxucm91dGVyU3RvcmUuZ2V0Q3VycmVudFN0YXRlID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gdGhpcy5jdXJyZW50U3RhdGU7XG59O1xuXG5yb3V0ZXJTdG9yZS5nZXRTdGF0ZXMgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiB0aGlzLnN0YXRlcztcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlclN0b3JlOyIsInZhciBzdG9yZSA9IHJlcXVpcmUoJy4uL2ZsdXgvc3RvcmUnKTtcbnZhciBkaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vZGlzcGF0Y2hlcnMvZWNhcicpO1xuXG52YXIgYWxlcnRTdG9yZSA9IG5ldyBzdG9yZSh7XG5cdGRpc3BhdGNoZXI6IGRpc3BhdGNoZXJcbn0pO1xuXG5hbGVydFN0b3JlLm9wZW4gPSBmYWxzZTtcbmFsZXJ0U3RvcmUuY29uZmlnID0ge307XG5cbmFsZXJ0U3RvcmUucmVnaXN0ZXJIYW5kbGVycyh7XG5cdG9wZW5BbGVydDogZnVuY3Rpb24gKGNvbmZpZykge1xuXHRcdHRoaXMub3BlbiA9IHRydWU7XG5cdFx0dGhpcy5jb25maWcgPSBjb25maWc7XG5cblx0XHR0aGlzLmVtaXQoJ3RvZ2dsZUFsZXJ0Jyk7XG5cdH0sXG5cdGNsb3NlQWxlcnQ6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLm9wZW4gPSBmYWxzZTtcblx0XHR0aGlzLmVtaXQoJ3RvZ2dsZUFsZXJ0Jyk7XG5cdH1cbn0pO1xuXG52YXIgc3RvcmUgPSBhbGVydFN0b3JlO1xuXG5leHBvcnQgZGVmYXVsdCBzdG9yZTsiLCJ2YXIgc3RvcmUgPSByZXF1aXJlKCcuLi9mbHV4L3N0b3JlJyk7XG52YXIgZGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXJzL2VjYXInKTtcblxudmFyIGFwcFN0b3JlID0gbmV3IHN0b3JlKHtcblx0ZGlzcGF0Y2hlcjogZGlzcGF0Y2hlclxufSk7XG5cbmFwcFN0b3JlLmZyb3plbiA9IGZhbHNlO1xuYXBwU3RvcmUudG9wID0gMDtcblxuYXBwU3RvcmUucmVnaXN0ZXJIYW5kbGVycyh7XG5cdGZyZWV6ZTogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuZnJvemVuID0gdHJ1ZTtcblx0XHR0aGlzLnRvcCA9IC1kb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcblx0XHR0aGlzLmVtaXQoJ2Zyb3plblVwZGF0ZScsIHRydWUpO1xuXHR9LFxuXHR1bmZyZWV6ZTogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuZnJvemVuID0gZmFsc2U7XG5cdFx0dGhpcy5lbWl0KCdmcm96ZW5VcGRhdGUnLCBmYWxzZSk7XG5cdFx0d2luZG93LnNjcm9sbFRvKDAsIC10aGlzLnRvcCk7XG5cdH1cbn0pO1xuXG52YXIgc3RvcmUgPSBhcHBTdG9yZTtcblxuZXhwb3J0IGRlZmF1bHQgc3RvcmU7IiwidmFyIHN0b3JlID0gcmVxdWlyZSgnLi4vZmx1eC9zdG9yZScpO1xudmFyIGRpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi9kaXNwYXRjaGVycy9lY2FyJyk7XG5cbnZhciBibG9ja1N0b3JlID0gbmV3IHN0b3JlKHtcblx0ZGlzcGF0Y2hlcjogZGlzcGF0Y2hlclxufSk7XG5cbmJsb2NrU3RvcmUub3BlbiA9IFsnY2FwYWNpdHlQbGFubmluZyddO1xuYmxvY2tTdG9yZS52aXNpYmlsZSA9IFsnY2FwYWNpdHlQbGFubmluZyddO1xuXG5ibG9ja1N0b3JlLnJlZ2lzdGVySGFuZGxlcnMoe1xuXHR0b2dnbGVCbG9jazogZnVuY3Rpb24gKHBheWxvYWQpIHtcblx0XHR0aGlzLm9wZW4gPSBwYXlsb2FkO1xuXHRcdHRoaXMuZW1pdCgnYmxvY2tUb2dnbGVkJywgcGF5bG9hZCk7XG5cdH0sXG5cdHNldFZpc2libGU6IGZ1bmN0aW9uIChwYXlsb2FkKSB7XG5cdFx0dGhpcy52aXNpYmlsZSA9IHBheWxvYWQ7XG5cdFx0dGhpcy5lbWl0KCdibG9ja1Zpc2liaWxpdHknLCBwYXlsb2FkKTtcblx0fVxufSk7XG5cbmJsb2NrU3RvcmUuZ2V0T3BlbiA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHRoaXMub3Blbjtcbn07XG5cbmJsb2NrU3RvcmUuZ2V0VmlzaWJsZSA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHRoaXMudmlzaWJpbGU7XG59O1xuXG52YXIgc3RvcmUgPSBibG9ja1N0b3JlO1xuXG5leHBvcnQgZGVmYXVsdCBzdG9yZTsiLCJ2YXIgc3RvcmUgPSByZXF1aXJlKCcuLi9mbHV4L3N0b3JlJyk7XG52YXIgZGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL2Rpc3BhdGNoZXJzL2VjYXInKTtcblxudmFyIGN1cnJlbnRTdG9yZSA9IG5ldyBzdG9yZSh7XG5cdGRpc3BhdGNoZXI6IGRpc3BhdGNoZXJcbn0pO1xuXG5jdXJyZW50U3RvcmUucGF5bG9hZCA9IFtdO1xuXG5jdXJyZW50U3RvcmUucmVnaXN0ZXJIYW5kbGVycyh7XG5cdHNldFNlbGVjdGVkOiBmdW5jdGlvbiAocGF5bG9hZCkge1xuXHRcdHRoaXMucGF5bG9hZCA9IHBheWxvYWQ7XG5cdFx0dGhpcy5lbWl0KCdzZWxlY3RJdGVtJywgcGF5bG9hZCk7XG5cdH1cbn0pO1xuXG5jdXJyZW50U3RvcmUuZ2V0U2VsZWN0ZWQgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiB0aGlzLnBheWxvYWQ7XG59O1xuXG52YXIgc3RvcmUgPSBjdXJyZW50U3RvcmU7XG5leHBvcnQgZGVmYXVsdCBzdG9yZTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICggdHlwZSwgdXJsLCBwYXJhbXMsIGNvbnRlbnQsIGhlYWRlcnMgKSB7XG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cblx0dmFyIHN0ciA9ICcnO1xuICAgIGlmKCBwYXJhbXMgKSB7XG5cdFx0Zm9yICh2YXIga2V5IGluIHBhcmFtcykge1xuXHRcdCAgICBpZiAoc3RyICE9IFwiXCIpIHtcblx0XHQgICAgICAgIHN0ciArPSAnJic7XG5cdFx0ICAgIH1cblx0XHQgICAgc3RyICs9IGtleSArICc9JyArIHBhcmFtc1trZXldO1xuXHRcdH1cbiAgICB9XG5cbiAgICByZXF1ZXN0Lm9wZW4odHlwZSwgdXJsICsgc3RyLCB0cnVlKTtcblxuICAgIGlmKCBoZWFkZXJzICkge1xuICAgICAgICBmb3IoIHZhciBpIGluIGhlYWRlcnMgKSB7XG4gICAgICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoaSwgaGVhZGVyc1tpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVxdWVzdC5vbmxvYWQgPSBvbmxvYWQ7XG4gICAgcmVxdWVzdC5vbmVycm9yID0gb25lcnJvcjtcbiAgICByZXF1ZXN0Lm9ucHJvZ3Jlc3MgPSBvbnByb2dyZXNzO1xuICAgIHJlcXVlc3Quc2VuZChjb250ZW50IHx8ICcnKTtcblxuICAgIGZ1bmN0aW9uIG9ubG9hZCgpIHtcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKCBlICkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gcmVxdWVzdC5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KG5ldyBFcnJvcihcIlN0YXR1cyBjb2RlIHdhcyBcIiArIHJlcXVlc3Quc3RhdHVzKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbmVycm9yKCkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QobmV3IEVycm9yKFwiQ2FuJ3QgWEhSIFwiICsgSlNPTi5zdHJpbmdpZnkodXJsKSkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9ucHJvZ3Jlc3MoZXZlbnQpIHtcbiAgICAgICAgZGVmZXJyZWQubm90aWZ5KGV2ZW50LmxvYWRlZCAvIGV2ZW50LnRvdGFsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07Il19
