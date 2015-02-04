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