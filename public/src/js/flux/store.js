var Emitter = require('./emitter');
var utils = require('./utils');

function Store(cfg) {
    var self = this;
    var _cfg, _data, _dispatcher, _emitter, _id, _handlers;

    _cfg = utils.config({
        data: null
    }, cfg, 'Store');
    _data = _cfg.data;
    _dispatcher = _cfg.dispatcher;
    _emitter = new Emitter();
    _id = utils.uid();
    _handlers = {
        _global: {}
    };

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