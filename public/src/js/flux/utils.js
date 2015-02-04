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
        } catch(e) {
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
            result +=
                encodeURIComponent(key) + '=' +
                encodeURIComponent(params[key]) + '&';
        });

        return result.slice(0, -1);
    }
};

module.exports = utils;