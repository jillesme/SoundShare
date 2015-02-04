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
            } catch(e) {
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