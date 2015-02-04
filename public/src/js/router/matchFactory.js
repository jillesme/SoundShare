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


module.exports = matchFactory;