(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var router = require("./router")["default"];
var header = require("./components/header.jsx")["default"];
var sign = require("./components/sign.jsx")["default"];
var sLP = require("./components/sharedLoadingPlan.jsx")["default"];
var buttonContainer = require("./components/buttonContainer.jsx")["default"];
var button = require("./components/button.jsx")["default"];
var block = require("./components/block.jsx")["default"];
var overlay = require("./components/overlay.jsx")["default"];
var spreadsheet = require("./components/spreadsheet.jsx")["default"];
var summary = require("./components/summary.jsx")["default"];
var chart = require("./components/chart.jsx")["default"];
var index = require("./pages/index.jsx")["default"];


React.renderComponent(index(null), document.body);


},{"./components/block.jsx":7,"./components/button.jsx":8,"./components/buttonContainer.jsx":9,"./components/chart.jsx":10,"./components/header.jsx":11,"./components/overlay.jsx":12,"./components/sharedLoadingPlan.jsx":13,"./components/sign.jsx":14,"./components/spreadsheet.jsx":15,"./components/summary.jsx":16,"./pages/index.jsx":30,"./router":37}],2:[function(require,module,exports){
"use strict";

var store = require("../stores/alert")["default"];


var actions = {
  open: function (config) {
    this.dispatcher.dispatch({
      action: "openAlert",
      data: config
    });
  },
  close: function () {
    this.dispatcher.dispatch({
      action: "closeAlert"
    });
  }
};

var actions = store.createActions(actions);

exports["default"] = actions;


},{"../stores/alert":44}],3:[function(require,module,exports){
"use strict";

var store = require("../stores/app")["default"];


var actions = {
  freeze: function () {
    this.dispatcher.dispatch({
      action: "freeze"
    });
  },
  unfreeze: function () {
    this.dispatcher.dispatch({
      action: "unfreeze"
    });
  }
};

var actions = store.createActions(actions);

exports["default"] = actions;


},{"../stores/app":45}],4:[function(require,module,exports){
"use strict";

var store = require("../stores/blocks")["default"];


var actions = {
  toggle: function (block) {
    var blocks = store.getOpen();

    var index = blocks.indexOf(block);
    if (index > -1) {
      blocks.splice(index, 1);
    } else {
      blocks.push(block);
    }

    this.dispatcher.dispatch({
      action: "toggleBlock",
      data: blocks
    });
  },
  setOpen: function (payload) {
    this.dispatcher.dispatch({
      action: "toggleBlock",
      data: payload
    });
  },
  setVisible: function (payload) {
    this.dispatcher.dispatch({
      action: "setVisible",
      data: payload
    });
  }
};

var actions = store.createActions(actions);

exports["default"] = actions;


},{"../stores/blocks":46}],5:[function(require,module,exports){
"use strict";

var store = require("../stores/current")["default"];


var actions = {
  setSelected: function (payload) {
    this.dispatcher.dispatch({
      action: "setSelected",
      data: payload
    });
  },
  clearSelected: function () {
    this.dispatcher.dispatch({
      action: "setSelected",
      data: []
    });
  }
};

var actions = store.createActions(actions);

exports["default"] = actions;


},{"../stores/current":47}],6:[function(require,module,exports){
"use strict";

var store = require("../stores/alert")["default"];
var actions = require("../actions/alert")["default"];


var alert = React.createClass({
  displayName: "alert",
  componentWillMount: function () {
    store.on("toggleAlert", this.toggle);
  },
  componentWillUnmount: function () {
    store.off("toggleAlert", this.toggle);
  },
  toggle: function () {
    this.setState({
      open: store.open,
      config: store.config
    });
  },
  getInitialState: function () {
    return {
      open: false,
      config: {}
    };
  },
  close: function (callback) {
    actions.close();

    typeof callback === "function" && callback();
  },
  render: function () {
    var cx = React.addons.classSet;

    var classes = cx({
      "sweet-alert": true,
      showSweetAlert: this.state.open
    });

    var styles = {
      opacity: this.state.open ? 1 : 0,
      display: this.state.open ? "block" : "none"
    };

    // error icon

    var errorIcon = cx({
      icon: true,
      error: true,
      animateErrorIcon: this.state.config.error
    });

    var errorStyles = {
      display: this.state.config.error ? "block" : "none"
    };

    // warning

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

    var warningStyles = {
      display: this.state.config.warning ? "block" : "none"
    };

    // waiting

    var waitingIcon = cx({
      icon: true,
      waiting: true,
      animate: this.state.config.waiting
    });

    var waitingStyles = {
      display: this.state.config.waiting ? "block" : "none"
    };

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

    // success
    //
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

    var successStyles = {
      display: this.state.config.success ? "block" : "none"
    };

    var _this = this;
    var buttons = this.state.config.buttons && (this.state.config.buttons.map(function (obj) {
      var types = {
        cancel: function () {
          return (React.createElement("a", { key: "cancel", className: "button cancel", onClick: _this.close }, obj.text));
        },
        button: function () {
          return (React.createElement("a", { key: "button", className: "button", onClick: _this.close.bind(_this, obj.callback) }, obj.text));
        },
        link: function () {
          return (React.createElement("a", { key: "link", className: "button", onClick: _this.close, href: obj.link }, obj.text));
        }
      };

      return (types[obj.type] || types.button)();
    }));

    return (React.createElement("div", null, React.createElement("div", { className: "sweet-overlay", style: styles }), React.createElement("div", { className: classes, style: styles }, React.createElement("div", { className: errorIcon, style: errorStyles }, React.createElement("span", { className: "x-mark" }, React.createElement("span", { className: "line left" }), React.createElement("span", { className: "line right" }))), React.createElement("div", { className: warningIcon, style: warningStyles }, React.createElement("span", { className: warningBody }), React.createElement("span", { className: warningDot })), React.createElement("div", { className: successIcon, style: successStyles }, React.createElement("span", { className: successTipIcon }), React.createElement("span", { className: successLongIcon }), React.createElement("div", { className: "placeholder" }), React.createElement("div", { className: "fix" })), React.createElement("div", { className: waitingIcon, style: waitingStyles }, React.createElement("div", { className: "placeholder" })), React.createElement("h2", null, this.state.config.header), React.createElement("p", null, this.state.config.message), buttons)));
  }
});

exports["default"] = alert;


},{"../actions/alert":2,"../stores/alert":44}],7:[function(require,module,exports){
"use strict";

var store = require("../stores/blocks")["default"];
var actions = require("../actions/blocks")["default"];


var block = {
  displayName: "block",
  componentWillMount: function () {
    console.log("mounted");
    store.on("blockToggled", this.toggleBlock);
    store.on("blockVisibility", this.toggleVisibility);
  },
  componentWillUnmount: function () {
    console.log("unmounted");
    store.off("blockVisibility", this.toggleVisibility);
    store.off("blockToggled", this.toggleBlock);
  },
  toggleBlock: function () {
    var blocks = store.getOpen();

    console.log("block toggled");
    this.setState({
      open: blocks.indexOf(this.props.config.name) > -1
    });
  },
  toggleVisibility: function () {
    var visible = store.getVisible();

    console.log("visibility toggled");

    this.setState({
      visible: visible.indexOf(this.props.config.name) > -1
    });
  },
  getInitialState: function () {
    var blocks = store.getOpen();
    var visible = store.getVisible();

    return {
      open: blocks.indexOf(this.props.config.name) > -1,
      visible: visible.indexOf(this.props.config.name) > -1
    };
  },
  render: function () {
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
      "block--open": this.state.open
    });

    return (React.createElement("div", { className: classes }, children));
  }
};

adapt.component("block", block);


},{"../actions/blocks":4,"../stores/blocks":46}],8:[function(require,module,exports){
"use strict";

var button = adapt.component("button", {
  displayName: "button",
  statics: {
    defaultModelValue: false
  },
  handleClick: function (e) {
    this.props.config.model[this.props.config.name].value = true;
    this.props.adapt.observe.digest();
    this.props.config.model[this.props.config.name].value = false;
    this.props.adapt.observe.digest();

    e.preventDefault();
    e.stopPropagation();
  },
  setObservers: function () {
    var that = this;
    var config = this.props.config;

    var observers = config.observe[config.nameTrail + config.name];

    for (var i in observers) {
      observers[i].forEach(function (element, index) {
        that.state.listeners.push(that.props.adapt.observe.addListener(function () {
          return config.model[config.name][i] || config.item[i];
        }, element));
      });
    }
  },
  getInitialState: function () {
    var config = this.props.config;

    return {
      model: config.model[config.name].value,
      item: config.item,
      name: config.name,
      listeners: []
    };
  },
  componentWillMount: function () {
    var that = this;
    var config = this.props.config;

    var model = config.model[config.name];

    var expressionValue;

    if (config.observe[config.nameTrail + config.name]) {
      this.setObservers();
    }

    this.state.listeners.push(this.props.adapt.observe.addListener(function () {
      return config.observe[config.nameTrail + config.name];
    }, function (newVal) {
      that.setObservers();
    }));

    this.state.listeners.push(this.props.adapt.observe.addListener(function () {
      return config.item.text;
    }, function (newVal) {
      that.forceUpdate();
    }));
  },
  componentWillUnmount: function () {
    this.state.listeners.forEach(function (listener) {
      listener();
    });
  },
  render: function () {
    var model = this.props.config.model[this.props.config.name].value, item = this.props.config.item, controller = this.props.config.controller[this.props.config.name];

    var label = adapt.component("label");

    return (React.createElement("div", { className: "field field__button " + (this.props.config.item.className || "") }, typeof item.label === "undefined" ? "" : React.createElement(adapt.components.label, { config: { item: item }, adapt: this.props.adapt }), React.createElement("div", { className: "field__button--container" }, React.createElement("button", { onClick: this.handleClick }, item.text), typeof item.desc === "undefined" ? "" : React.createElement(adapt.components.description, { config: { item: item }, adapt: this.props.adapt }))));
  }
});

exports["default"] = button;


},{}],9:[function(require,module,exports){
"use strict";

var buttonContainer = {
  displayName: "buttonContainer",
  render: function () {
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

    return (React.createElement("div", { className: "button-container" }, children));
  }
};

adapt.component("buttonContainer", buttonContainer);


},{}],10:[function(require,module,exports){
"use strict";

var chart = {
  drawChart: function () {
    var chartElement = document.querySelectorAll(".chart__render")[0];
    console.log(chartElement);

    var data = google.visualization.arrayToDataTable([["Process Name", "Parts Avail Shipment", "Planned Production Per Week", "JLR Demand"], ["Test", 0, 0, 0], ["Test", 0, 0, 0], ["Test", 0, 0, 0]]);

    var options = {
      seriesType: "bars",
      series: { 0: { type: "line" }, 2: { type: "steppedArea" } },
      bar: { groupWidth: "20%" },
      width: 500,
      chartArea: {
        left: "3%",
        top: "3%",
        height: "94%",
        width: "94%"
      },
      legend: { position: "none" },
      colors: ["#F29100", "#3A5BCB", "#CA2800"]
    };

    // var chart = new google.visualization.ComboChart(chartElement);
    // chart.draw(data, options);
  },
  componentDidMount: function () {
    this.drawChart();
  },
  render: function () {
    return (React.createElement("div", { className: "chart" }, React.createElement("div", { className: "chart__render", style: { width: "100%" }, ref: "chart" })));
  }
};

adapt.component("chart", chart);

var inject = ["$scope"];


},{}],11:[function(require,module,exports){
"use strict";

var blockheader = {
  displayName: "blockheader",
  render: function () {
    return (React.createElement("div", { className: "blockheader " + (this.props.config.item.className || "") }));
  }
};

adapt.component("blockheader", blockheader);


},{}],12:[function(require,module,exports){
"use strict";

var appActions = require("../actions/app");

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
  displayName: "overlay",
  getInitialState: function () {
    return {
      open: false
    };
  },
  open: function () {
    this.setState({
      open: true
    });
  },
  close: function () {
    this.setState({
      open: false
    });
  },
  componentDidMount: function () {
    var node = this.refs.overlay.getDOMNode();

    node.addEventListener("scroll", function (e) {
      e.stopPropagation();
    });
  },
  render: function () {
    var cx = React.addons.classSet;
    var overlayClasses = cx({
      overlay__background: true,
      "overlay__background--open": this.state.open
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

    return (React.createElement("div", { className: "field overlay" }, React.createElement("div", { className: "overlay__open", onClick: this.open }, config.item.text), React.createElement("div", { className: overlayClasses }, React.createElement("div", { className: "overlay__container" }, React.createElement("div", { className: "overlay__children", ref: "overlay" }, children), React.createElement("div", { className: "overlay__buttons" }, React.createElement("div", { className: "button", onClick: this.close }, "Done"))))));
  }
};

adapt.component("overlay", overlay);


},{"../actions/app":3}],13:[function(require,module,exports){
"use strict";

var Utils = {
  /**
   * Copy without binding by reference
   * @param  {Object|Array} source      Source to copy from
   * @param  {Object|Array} destination Target
   * @return {Object|Array}             Copied object/array
   */
  copy: function (source, destination) {
    if (!destination) {
      if (this.isArray(source)) {
        destination = [];
      } else if (this.isObject(source)) {
        destination = {};
      } else {
        throw new Error(typeof source + " is not supported by Utils.copy");
      }
    }

    for (var i in source) {
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
  arrayDiff: function (a1, a2) {
    var differences = [];

    for (var i = 0; i < a1.length; i++) {
      if (a2.indexOf(a1[i]) === -1) {
        differences.push({
          action: "added",
          value: a1[i]
        });
      }
    }
    for (var i = 0; i < a2.length; i++) {
      if (a1.indexOf(a2[i]) === -1) {
        differences.push({
          action: "removed",
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
  equals: function (o1, o2) {
    if (o1 === o2) return true;
    if (o1 === null || o2 === null) return false;
    if (o1 !== o1 && o2 !== o2) return true;
    var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
    if (t1 == t2) {
      if (t1 == "object") {
        if (this.isArray(o1)) {
          if (!this.isArray(o2)) return false;
          if ((length = o1.length) == o2.length) {
            for (key = 0; key < length; key++) {
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
          for (key in o1) {
            if (key.charAt(0) === "$" || this.isFunction(o1[key])) continue;
            if (!this.equals(o1[key], o2[key])) return false;
            keySet[key] = true;
          }
          for (key in o2) {
            if (!keySet.hasOwnProperty(key) && key.charAt(0) !== "$" && o2[key] !== undefined && !this.isFunction(o2[key])) return false;
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
  convertToCamelCase: function (string) {
    return string.replace(/:([a-z])/g, function (g) {
      return g[1].toUpperCase();
    });
  },
  /**
   * Extend an object
   * @param  {Object} source      Source object to extend
   * @param  {Object} destination Target object to extend into
   * @return {Object}             Extended object
   */
  extend: function (source, destination) {
    for (var i in source) {
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
  findClosestParent: function (event, className) {
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
  checkState: function (state, currentState) {
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
        currentState.forEach(function (element) {
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

/**
 * Object Types
 * @type {Array}
 */
var objTypes = ["Array", "Object", "String", "Date", "RegExp", "Function", "Boolean", "Number", "Null", "Undefined"];

// Create individual functions on top of our Utils object for each objType
for (var i = objTypes.length; i--;) {
  Utils["is" + objTypes[i]] = (function (objectType) {
    return function (elem) {
      return toString.call(elem).slice(8, -1) === objectType;
    };
  })(objTypes[i]);
}

var AdaptTable = {
  displayName: "AdaptTable",
  extend: [adapt.mixins.arrayObject],
  render: function () {
    var item = this.props.config.item;
    var config = this.props.config;
    var openID = this.state.open || -1;
    var items = [];
    var model = this.state.model;

    var simple = !!config.item.type.split(":")[1];

    var header = [];

    var partName = "";
    var configItems = this.props.adapt.model.items;
    var study = {
      multi: function () {
        var suffixes = [];

        if (configItems.suffix) {
          configItems.suffix.value.forEach(function (value) {
            suffixes.push(value.suffix.value);
          });

          partName = [configItems.prefix.value, configItems.base.value, suffixes.join("")].join(" ");
        }

        partName = [configItems.prefix.value, configItems.base.value, suffixes.join("")].join(" ");

        return partName;
      },
      complex: function () {
        return configItems.partName.value;
      },
      single: function () {
        return [configItems.prefix.value, configItems.base.value, configItems.suffix.value].join(" ");
      },
      multiAll: function () {
        return [configItems.prefix.value, configItems.base.value, "(All)"].join(" ");
      }
    };

    partName = (study[configItems.studySupplierFor.value] || study.single)();

    for (var i in item.model) {
      header.push(React.createElement("th", { key: i }, item.model[i].label));
    }

    var t = 0;

    if (model) {
      for (var i = 0; i < model.length; i++) {
        var children = [];

        if (!simple) {
          children.push(React.createElement("td", { className: "id" }, i + 2));
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
            nameTrail: config.nameTrail + config.name + "."
          };

          var contents = this.transferPropsTo(React.createElement(adapt.components.item, { config: itemConfig }));

          children.push(React.createElement("td", { key: t + r }, contents));

          t++;
        }

        children.push(React.createElement("td", { className: "th__options" }, React.createElement("span", { onClick: this.remove.bind(this, i) }, React.createElement("i", { className: "fa fa-times fa-fw" }))));

        var REGEX_CURLY = /{([^}]+)}/g;

        items.push(React.createElement("tr", { key: i }, children));
      };
    }

    return (React.createElement("div", { className: "element__table clear no-select " + (simple ? "element__table--simple" : "") }, React.createElement("table", { cellPadding: "0", cellSpacing: "0" }, React.createElement("thead", null, React.createElement("tr", null, simple ? "" : React.createElement("th", { className: "id" }, "#"), header, React.createElement("th", { className: "th__options" }, React.createElement("span", { onClick: this.add }, React.createElement("i", { className: "fa fa-plus fa-fw" }))))), React.createElement("tbody", null, React.createElement("tr", null, React.createElement("td", { className: "id" }, "1"), React.createElement("td", null, React.createElement("div", { className: "field field__input" }, React.createElement("div", { className: "field__input--container" }, React.createElement("input", { value: partName, disabled: "disabled" })))), React.createElement("td", null, React.createElement("div", { className: "field field__input" }, React.createElement("div", { className: "field__input--container" }, React.createElement("input", { value: this.props.adapt.model.items.totalRequiredDemand.value, disabled: "disabled" })))), React.createElement("td", null, React.createElement("div", { className: "field field__input" }, React.createElement("div", { className: "field__input--container" }, React.createElement("input", { value: this.props.config.model.netAvailableTime.value, disabled: "disabled" })))), React.createElement("td", null, React.createElement("div", { className: "field field__input" }, React.createElement("div", { className: "field__input--container" }, React.createElement("input", { value: this.props.config.model.allocationPercentage.value, disabled: "disabled" }))))), items))));
  }
};

adapt.component("sharedLoadingPlan", AdaptTable);


},{}],14:[function(require,module,exports){
"use strict";

var sign = {
  componentDidMount: function () {
    var canvas = this.refs.canvas.getDOMNode();
    this.signaturePad = new SignaturePad(canvas, {});

    window.addEventListener("resize", this.resizeCanvas, false);

    this.resizeCanvas();

    var config = this.props.config;
    var _this = this;
    canvas.addEventListener("mousedown", function (e) {
      e.preventDefault();
    });

    canvas.addEventListener("mousemove", function (e) {
      config.model[config.name].value = _this.signaturePad.toDataURL();
    });
  },
  setObservers: function () {
    var that = this;
    var config = this.props.config;

    var observers = config.observe[config.nameTrail + config.name];

    for (var i in observers) {
      observers[i].forEach(function (element, index) {
        that.state.listeners.push(that.props.adapt.observe.addListener(function () {
          return config.model[config.name][i] || config.item[i];
        }, element));
      });
    }
  },
  componentWillMount: function () {
    var that = this;
    var config = this.props.config;

    var model = config.model[config.name];

    if (config.observe[config.nameTrail + config.name]) {
      this.setObservers();
    }

    this.state.listeners.push(this.props.adapt.observe.addListener(function () {
      return config.observe[config.nameTrail + config.name];
    }, function (newVal) {
      that.setObservers();
    }));
  },
  getInitialState: function () {
    var config = this.props.config;

    return {
      model: config.model[config.name].value,
      item: config.item,
      name: config.name,
      listeners: []
    };
  },
  clearCanvas: function () {
    this.signaturePad.clear();
  },
  componentWillUnmount: function () {
    window.removeEventListener("resize", this.resizeCanvas, false);
  },
  resizeCanvas: function () {
    var canvas = this.refs.canvas.getDOMNode();

    var oldData = this.signaturePad.toDataURL();

    canvas.width = window.outerWidth / 2 - 32;

    this.signaturePad.fromDataURL(oldData);
  },
  render: function () {
    var item = this.props.config.item;
    return (React.createElement("div", { className: "field sign", ref: "container" }, typeof item.label === "undefined" ? "" : React.createElement(adapt.components.label, { config: { item: item }, adapt: this.props.adapt }), React.createElement("div", { className: "sign__tip" }, "Enter signature below"), React.createElement("div", { className: "sign__clear", onClick: this.clearCanvas }, "Clear Signature", React.createElement("i", { className: "fa fa-times" })), React.createElement("canvas", { ref: "canvas", height: "200" }), typeof item.desc === "undefined" ? "" : React.createElement(adapt.components.description, { config: { item: item }, adapt: this.props.adapt })));
  }
};

adapt.component("sign", sign);


},{}],15:[function(require,module,exports){
"use strict";

var store = require("../stores/blocks")["default"];
var actions = require("../actions/blocks")["default"];


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
  displayName: "spreadsheet",
  extend: [adapt.mixins.arrayObject],
  getInitialState: function () {
    // set the initial state to have all accordions closed
    //
    var obj = {
      test: "hi",
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
  componentWillMount: function () {
    store.on("blockToggled", this.toggleBlockCallback);
    store.on("blockVisibility", this.toggleBlockVisibility);
    document.addEventListener("click", this.handleBodyClick);
  },
  componentWillUnmount: function () {
    store.off("blockVisibility", this.toggleBlockVisibility);
    store.off("blockToggled", this.toggleBlockCallback);
    document.removeEventListener("click", this.handleBodyClick);
  },
  handleBodyClick: function (e) {
    if (!findClosestParent(e.target, "spreadsheet__item--remove")) {
      this.setState({
        openDropdown: -1
      });
    }
  },
  duplicate: function (accordionId) {
    var config = this.props.config;

    var newModel = {};
    var config = this.props.config;

    config.model[config.name].value.push(JSON.parse(JSON.stringify((config.model[config.name].value[accordionId]))));

    this.props.adapt.observe.digest();
    this.setState({
      openDropdown: -1
    });
  },
  toggleBlockCallback: function () {
    this.setState({
      openBlocks: store.getOpen()
    });
  },
  toggleBlockVisibility: function () {
    this.setState({
      visibleBlocks: store.getVisible()
    });
  },
  openDropdown: function (id) {
    this.setState({
      openDropdown: id == this.state.openDropdown ? -1 : id
    });
  },
  openAccordion: function (id) {
    // toggle the accordion to be open, or closed if it is already open
    this.setState({
      open: id == this.state.open ? -1 : id
    });
  },
  toggleBlock: function (id) {
    actions.toggle(id);
  },
  componentDidMount: function () {
    var node = this.getDOMNode();
  },
  render: function () {
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
        // set the controller and view, accordions aren't invisible in the VC so we need to go down a level
        var childController = config.controller[config.name];
        var childModel = config.model[config.name].value;

        var dynamicItem = adapt.components.item;


        _this.state.subtitleListeners.map(function (listener) {
          listener();
        });

        _this.state.subtitleListeners = [];

        for (var i = 0; i < model.length; i++) {
          var children = [];

          // accordions models are arrays, and we need the appropriate model value for this iteration
          var finalModel = childModel[i];

          // accordions are the same, so we loop through the view's model for each accordion
          // TODO: make accordions have different views, to allow dynamically added elements

          children = loop({
            items: item.model,
            controller: childController,
            values: config.values,
            observe: config.observe,
            nameTrail: config.nameTrail + config.name + ".",
            model: finalModel,
            adapt: _this.props.adapt
          });

          // does the accordion have a title element for each one?
          var title = "Item"; // we'll set a default anyway
          if (item.title) {
            // accordions can have titles, so we need to replace any variables requested
            var REGEX_CURLY = /{([^}]+)}/g;

            title = item.title;
            title = title.replace(REGEX_CURLY, function (match) {
              if (match === "{index}") {
                // {index} allows us to display the number of the accordion (plus one..)
                return i + 1;
              }

              var possibleVariable = match.replace("{", "").replace("}", ""); // there's probably a regex for this somewhere

              if (finalModel[possibleVariable]) {
                // the variable exists in the model! let's bind them
                return finalModel[possibleVariable];
              }

              return false;
            });
          }

          var subtitle;
          if (item.subtitle) {
            // accordions can have subtitles, so we need to replace any variables requested
            var REGEX_CURLY = /{([^}]+)}/g;

            subtitle = item.subtitle;
            subtitle = subtitle.replace(REGEX_CURLY, function (match) {
              if (match === "{index}") {
                // {index} allows us to display the number of the accordion (plus one..)
                return i + 1;
              }

              var possibleVariable = match.replace("{", "").replace("}", ""); // there's probably a regex for this somewhere

              if (finalModel[possibleVariable]) {
                var index = i;
                _this.state.subtitleListeners.push(_this.props.adapt.observe.addListener(function () {
                  try {
                    return config.model[config.name].value[index][possibleVariable].value;
                  } catch (e) {
                    return "";
                  }
                }, function () {
                  _this.forceUpdate();
                }));

                // the variable exists in the model! let's bind them
                return finalModel[possibleVariable].value;
              }

              return false;
            });
          }

          // are they open?
          var titleClasses = cx({
            "element__accordion--title": true,
            open: i === openID
          });

          var contentClasses = cx({
            "element__accordion--content": true,
            open: i === openID
          });

          var dropdownClasses = cx({
            spreadsheet__dropdown: true,
            "spreadsheet__dropdown--open": this.state.openDropdown === i
          });

          // push the child into the items array, so we can render it below
          items.push(React.createElement("div", { className: "spreadsheet__item" }, React.createElement("div", {
            className: "spreadsheet__header",
            onClick: this.openAccordion.bind(this, i) }, React.createElement("h3", null, title), React.createElement("h4", null, subtitle, "\u00a0")), React.createElement("ul", { className: dropdownClasses }, React.createElement("li", {
            className: "spreadsheet__dropdown__item",
            onClick: this.duplicate.bind(this, i) }, React.createElement("i", { className: "fa fa-copy fa-fw spreadsheet__dropdown__icon" }), "Duplicate"), React.createElement("li", {
            className: "spreadsheet__dropdown__item spreadsheet__dropdown__item--delete",
            onClick: this.remove.bind(this, i) }, React.createElement("i", { className: "fa fa-times fa-fw spreadsheet__dropdown__icon" }), "Delete")), React.createElement("a", {
            className: "spreadsheet__item--remove no-select",
            onClick: this.openDropdown.bind(this, i) }, React.createElement("i", { className: "fa fa-chevron-down" })), React.createElement("div", { className: "spreadsheet__content" }, children)));
        };
      }

      var title;
      if (item.title) {
        // if the accordion has a title, we need to render it
        // grab the header component
        var header = adapt.components.header;

        // pass in a config, this is a bit overkill but it allows us to use it both here and in the JSON definition of the view
        title = header({
          config: {
            item: {
              title: item.title,
              type: "header:h2"
            }
          },
          adapt: this.props.adapt
        });
      }

      var labels = [];
      for (var i in item.model) {
        if (item.model[i].type === "blockheader") {
          labels.push(React.createElement("div", { className: "spreadsheet__blockheader " + (item.model[i].className || "") }, item.model[i].label));
        } else if (item.model[i].type === "block") {
          var childItem = item.model[i].items;
          for (var t in childItem) {
            if (childItem[t].type === "blockheader") {
              var classes = {
                spreadsheet__blockheader: true
              };

              var className = childItem[t].className;

              var iconClasses;
              var onClickEvent = function () {};
              if (className) {
                classes[className] = true;

                classes["spreadsheet__blockheader--hidden"] = this.state.openBlocks.indexOf(i) === -1;

                iconClasses = "";
              } else {
                onClickEvent = this.toggleBlock.bind(this, i);

                iconClasses = cx({
                  fa: true,
                  "fa-chevron-down": this.state.openBlocks.indexOf(i) > -1,
                  "fa-chevron-right": this.state.openBlocks.indexOf(i) === -1
                });
              }

              if (this.state.visibleBlocks.indexOf(i) > -1) {
                labels.push(React.createElement("div", { className: cx(classes), onClick: onClickEvent }, React.createElement("i", { className: iconClasses }), childItem[t].label));
              }
            } else {
              var classes = {
                spreadsheet__field: true
              };

              classes["spreadsheet__blockheader--hidden"] = this.state.openBlocks.indexOf(i) === -1;

              labels.push(React.createElement("div", { className: cx(classes) }, childItem[t].label, React.createElement("div", { className: "spreadsheet__field--desc" }, childItem[t].desc)));
            }
          }
        } else {
          labels.push(React.createElement("div", { className: "spreadsheet__field" }, item.model[i].label, React.createElement("div", { className: "spreadsheet__field--desc" }, item.model[i].desc)));
        }
      }

      var data;

      if (model.length) {
        data = (React.createElement("div", { className: "spreadsheet__data", ref: "data" }, items));
      } else {
        data = (React.createElement("div", { className: "spreadsheet__empty" }, "Click \"Add Process\" to get started"));
      }

      // return the accordion!
      return (React.createElement("div", { className: "spreadsheet clear" }, React.createElement("div", { className: "spreadsheet__titles", ref: "titles" }, React.createElement("div", { className: "spreadsheet__add no-select" }, React.createElement("div", { className: "spreadsheet__add--button", onClick: this.add }, React.createElement("i", { className: "fa fa-plus" }), React.createElement("h3", null, "Add Process"))), labels, React.createElement("div", { className: "spreadsheet__divider" })), data));
    } catch (e) {
      console.log(e);
    }
  }
};

adapt.component("spreadsheet", spreadsheet);


},{"../actions/blocks":4,"../stores/blocks":46}],16:[function(require,module,exports){
"use strict";

var summary = {
  render: function () {
    var cx = React.addons.classSet;

    var items = this.props.adapt.model.items;

    var processes = items.processes.value;
    var phase = items.phase.value;

    var children = processes.map(function (process, i) {
      var percentage = 0;
      if (process[phase + "percentageJLRDemand"]) {
        percentage = process[phase + "percentageJLRDemand"].value;
      }

      var classes = cx({
        summary__process: true,
        "summary__process--negative": percentage < 0,
        "summary__process--positive": percentage > 0
      });

      var jlrDemand;
      var partsAvailableForShipment;
      var percentageJLRDemand;

      if (process[phase + "jlrDemand"]) {
        jlrDemand = process[phase + "jlrDemand"].value;
      }
      if (process[phase + "partsAvailableForShipment"]) {
        partsAvailableForShipment = process[phase + "partsAvailableForShipment"].value;
      }
      if (process[phase + "jlrDemand"]) {
        percentageJLRDemand = process[phase + "percentageJLRDemand"].value;
      }

      return (React.createElement("div", { className: classes }, React.createElement("h4", { className: "summary__desc" }, "Process ", i + 1, ": ", process.desc), React.createElement("ul", { className: "summary__list" }, React.createElement("li", { className: "summary__item" }, React.createElement("div", { className: "summary__item--header" }, "JLR Demand"), React.createElement("div", { className: "summary__item--value" }, jlrDemand)), React.createElement("li", { className: "summary__item" }, React.createElement("div", { className: "summary__item--header" }, "Weekly Parts Available for Shipment"), React.createElement("div", { className: "summary__item--value" }, partsAvailableForShipment)), React.createElement("li", { className: "summary__item" }, React.createElement("div", { className: "summary__item--header" }, "Percentage Above/Below JLR Demand"), React.createElement("div", { className: "summary__item--value" }, percentageJLRDemand)))));
    });

    return (React.createElement("div", { className: "summary" }, children));
  }
};

adapt.component("summaryTab", summary);


},{}],17:[function(require,module,exports){
"use strict";

var dispatcher = require("../flux/dispatcher");

module.exports = new dispatcher();


},{"../flux/dispatcher":18}],18:[function(require,module,exports){
"use strict";

var utils = require("./utils");


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

    Object.keys(_callbacks).forEach(function (id) {
      _pending[id] = false;
      _handled[id] = false;
    });

    _name = name;
    _data = data;
  }

  function _dispatch() {
    Object.keys(_callbacks).forEach(function (id) {
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

  self.dispatch = function (name, data) {
    if (_dispatching) {
      throw new Error("Dispatcher.dispatch: called while dispatching");
    }

    console.log("dispatching", name);
    _preDispatch(name, data);
    _dispatch();
    console.log("not dispatching", name);
    _postDispatch();
  };

  self.register = function (cb, id) {
    if (typeof cb !== "function") {
      throw new Error("Dispatcher.register: callback is not a function");
    }

    id = id || utils.uid();
    _callbacks[id] = cb;

    return id;
  };

  self.unregister = function (id) {
    delete _callbacks[id];
  };

  self.wait = function (ids) {
    ids.forEach(function (id) {
      if (!_dispatching) {
        throw new Error("Dispatcher.wait: called while not dispatching");
      }

      if (!_callbacks[id]) {
        throw new Error("Dispatcher.wait: called with missing id");
      }

      if (_pending[id]) {
        if (!_handled[id]) {
          throw new Error("Dispatcher.wait: detected cycle");
        }

        return;
      }

      _call(id);
    });
  };
}

module.exports = Dispatcher;


},{"./utils":21}],19:[function(require,module,exports){
"use strict";

function Emitter() {
  var self = this;
  var _listeners = {};

  self.addListener = function (name, callback) {
    if (typeof callback !== "function" || self.hasListener(name, callback)) {
      return false;
    }

    _listeners[name] = _listeners[name] || [];
    _listeners[name].push(callback);

    return true;
  };

  self.emit = function (name, data) {
    if (!_listeners[name]) {
      return false;
    }

    _listeners[name].forEach(function (callback) {
      callback(data);
    });

    return true;
  };

  self.hasListener = function (name, callback) {
    var callbacks = _listeners[name];

    if (!callbacks || callbacks.indexOf(callback) === -1) {
      return false;
    }

    return true;
  };

  self.removeListener = function (name, callback) {
    if (!self.hasListener(name, callback)) {
      return false;
    }

    _listeners[name] = _listeners[name].filter(function (cb) {
      return cb !== callback;
    });

    if (!_listeners[name].length) {
      delete _listeners[name];
    }

    return true;
  };
}

module.exports = Emitter;


},{}],20:[function(require,module,exports){
"use strict";

var Emitter = require("./emitter");
var utils = require("./utils");

function Store(cfg) {
  var self = this;
  var _cfg, _data, _dispatcher, _emitter, _id, _handlers;

  _cfg = utils.config({
    data: null
  }, cfg, "Store");
  _data = _cfg.data;
  _dispatcher = _cfg.dispatcher;
  _emitter = new Emitter();
  _id = utils.uid();
  _handlers = {
    _global: {}
  };

  self.off = function (name, callback) {
    console.log("hi unbind", callback);
    return _emitter.removeListener(name, callback);
  };

  self.on = function (name, callback) {
    return _emitter.addListener(name, callback);
  };

  self.emit = function (name, data, opts) {
    opts = new Object(opts);

    if (opts.silent) {
      return false;
    }

    return _emitter.emit(name, data);
  };

  self.clear = function (opts) {
    _data = null;
    self.emit("change", _data, opts);

    return self;
  };

  self.set = function (data, opts) {
    _data = data;
    self.emit("change", _data, opts);

    return self;
  };

  self.registerHandlers = function (handlers, id) {
    if (id) {
      _handlers[id] = handlers;
    } else {
      _handlers._global = handlers;
    }
  };

  self.unregisterHandlers = function (id) {
    if (id) {
      delete _handlers[id];
    } else {
      _handlers._global = {};
    }
  };

  self.createActions = function (actions) {
    var boundActions = {};

    Object.keys(actions).forEach(function (key) {
      boundActions[key] = actions[key].bind(self);
    });

    return boundActions;
  };

  Object.defineProperties(self, {
    dispatcher: {
      enumerable: true,
      get: function () {
        return _dispatcher;
      }
    },
    id: {
      enumerable: true,
      get: function () {
        return _id;
      }
    },
    handlers: {
      enumerable: true,
      get: function () {
        return _handlers;
      }
    },
    data: {
      enumerable: true,
      get: function () {
        return _data;
      }
    }
  });

  _dispatcher.register(function (payload) {
    var cbs = payload.id ? _handlers[payload.id] : _handlers._global;
    var cb = cbs ? cbs[payload.action] : null;

    if (typeof cb === "function") {
      cb.call(self, payload.data);
    }
  }, _id);
}

module.exports = Store;


},{"./emitter":19,"./utils":21}],21:[function(require,module,exports){
"use strict";

var _uid = 1;
var utils;

utils = {
  config: function (defaults, config, name) {
    if (!config || !config.dispatcher) {
      throw new Error(name + " requires a Dispatcher");
    }

    return utils.merge(defaults, config);
  },
  merge: function () {
    var objs = Array.prototype.slice.call(arguments);
    var result = {};

    objs.forEach(function (obj) {
      Object.keys(obj).forEach(function (key) {
        result[key] = obj[key];
      });
    });

    return result;
  },
  parse: function (req) {
    var result;

    try {
      result = JSON.parse(req.responseText);
    } catch (e) {
      result = null;
    }

    return result;
  },
  request: function (url, cb) {
    var req = new XMLHttpRequest();

    req.onload = function () {
      if (req.status >= 200 && req.status < 400) {
        cb(undefined, req);
      } else {
        cb(new Error("Store: There was a status error."), req);
      }
    };

    req.onerror = function () {
      cb(new Error("Store: There was a network error."), req);
    };

    req.open("GET", url, true);
    req.send();
  },
  uid: function () {
    return _uid++;
  },
  url: function (v, params) {
    var result = v + "?";

    Object.keys(params).forEach(function (key) {
      result += encodeURIComponent(key) + "=" + encodeURIComponent(params[key]) + "&";
    });

    return result.slice(0, -1);
  }
};

module.exports = utils;


},{}],22:[function(require,module,exports){
"use strict";

var form = {
  tabs: {
    type: "tabs",
    items: {
      phase: {
        padding: "10px 15px",
        title: "Phase Information",
        items: {
          col: {
            type: "column",
            span: 2,
            items: [{
              phase: {
                type: "select",
                label: "Phase Submitting For",
                options: [{
                  value: "capacityPlanning",
                  label: "Capacity Planning"
                }, {
                  value: "phase0",
                  label: "Phase 0"
                }, {
                  value: "phase3",
                  label: "Phase 3"
                }, {
                  value: "capacityConfirmation",
                  label: "Capacity Confirmation"
                }]
              }
            }, {
              ppapLevel: {
                type: "select",
                label: "PPAP Level",
                options: [{
                  value: "PPAP_1",
                  label: "1"
                }, {
                  value: "PPAP_3",
                  label: "3"
                }, {
                  value: "PPAP_5",
                  label: "5"
                }]
              }
            }]
          },
          reason: {
            type: "textarea",
            label: "Reason for submission"
          }
        }
      },
      details: {
        padding: "10px 15px",
        title: "Details",
        items: {
          header: {
            type: "header:h4",
            text: "Supplier Details"
          },
          col: {
            type: "column:rows",
            span: 3,
            items: {
              supplierName: {
                label: "Name",
                type: "input",
                placeholder: "Supplier Name"
              },
              address: {
                label: "Address",
                type: "input",
                placeholder: "Supplier Address"
              },
              county: {
                label: "County/State/Region",
                type: "input",
                placeholder: "Supplier County/State/Region"
              },
              country: {
                label: "Country",
                type: "input",
                placeholder: "Supplier Country"
              },
              city: {
                label: "City",
                type: "input",
                placeholder: "Supplier City"
              },
              qualityGSDB: {
                label: "Quality GSDB",
                type: "input",
                placeholder: "Quality GSDB"
              },
              manufacturingGSDB: {
                label: "Manufacturing GSDB",
                type: "input",
                placeholder: "Manufacturing GSDB"
              }
            }
          },
          headerKey: {
            type: "header:h4",
            text: "Key Contact Details"
          },
          col2: {
            type: "column:rows",
            span: 3,
            items: {
              supplierRepresentativeName: {
                label: "Supplier Representative Name",
                type: "input",
                placeholder: "Supplier Representative Name"
              },
              supplierRepresentativeEmail: {
                label: "Supplier Representative Email",
                type: "input",
                placeholder: "Supplier Representative Email"
              },
              supplierRepresentativePhone: {
                label: "Supplier Representative Phone",
                type: "input",
                placeholder: "Supplier Representative Phone"
              },
              supplierRepresentativeRole: {
                label: "Supplier Representative Role",
                type: "input",
                placeholder: "Supplier Representative Role" },
              jlrStaName: {
                label: "JLR STA Name",
                type: "input",
                placeholder: "JLR STA Name"
              },
              jlrStaEmail: {
                label: "JLR STA Email",
                type: "input",
                placeholder: "JLR STA Email"
              },
              jlrStaPhone: {
                label: "JLR STA Phone",
                type: "input",
                placeholder: "JLR STA Phone"
              }
            }
          }
        }
      },
      part: {
        padding: "10px 15px",
        title: "Part Information",
        items: {
          col: {
            type: "column:rows",
            span: 2,
            items: {
              partName: {
                type: "input",
                label: "Part Name/Description"
              },
              partType: {
                type: "radio",
                label: "Part Type",
                options: {
                  sequenced: "Sequenced",
                  non: "Non-Sequenced"
                }
              }
            }
          },
          directedCol: {
            type: "column:rows",
            span: 3,
            items: {
              directedPart: {
                type: "radio",
                label: "Is this part supplied as a directed source?",
                options: {
                  yes: "Yes",
                  no: "No"
                }
              }
            }
          },
          studySupplierFor: {
            type: "radio",
            label: "Study Supplied For",
            options: {
              single: "Single Part / Single Suffix",
              multi: "Multiple Part / Listed Suffixes",
              multiAll: "Multiple Part / All Suffixes",
              complex: "Complex Comodity"
            }
          },
          nameCol: {
            type: "column:rows",
            span: 3,
            items: {
              prefix: {
                type: "input",
                label: "Prefix"
              },
              base: {
                type: "input",
                label: "Base"
              },
              suffix: {
                type: "input",
                label: "Suffix"
              }
            }
          },
          complexCommodityCol: {
            type: "column:rows",
            span: [1],
            items: {}
          },
          programmeVolume: {
            type: "header:h4",
            text: "Programme(s) Volume Information (JLR Demand)"
          },
          studySubmittedFor: {
            type: "checkbox",
            label: "Study Submitted For",
            options: {
              l359: "L359",
              l319: "L319",
              l316: "L316",
              l538: "L538",
              l550: "L550",
              l450: "L450",
              l460: "L460",
              l494: "L494",
              l462: "L462",
              x760: "X760",
              x260: "X260",
              x150: "X150",
              x152: "X152",
              x250: "X250",
              x351: "X351"
            }
          },
          volumeTotals: {
            type: "column:rows",
            span: 4,
            items: {}
          },
          volumeTotal: {
            type: "input",
            label: "Volume Total"
          },
          otherProgrammeVolume: {
            type: "header:h4",
            text: "Other Programme(s) Volume Information"
          },
          otherStudySubmittedFor: {
            type: "checkbox",
            label: "Other Programmes Same Parts Supplied To",
            includeNA: true,
            options: {
              l359: "L359",
              l319: "L319",
              l316: "L316",
              l538: "L538",
              l550: "L550",
              l450: "L450",
              l460: "L460",
              l494: "L494",
              l462: "L462",
              x760: "X760",
              x260: "X260",
              x150: "X150",
              x152: "X152",
              x250: "X250",
              x351: "X351"
            }
          },
          otherVolumeTotals: {
            type: "column:rows",
            span: 4,
            items: {}
          },
          otherVolumeTotal: {
            type: "input",
            label: "Other Volume Total"
          },
          totalRequiredDemand: {
            type: "input",
            label: "Total Demand of Study Submitted For"
          }
        }
      },
      processes: {
        title: "Manufacturing Processes",
        items: {
          processes: {
            type: "spreadsheet",
            title: "Process {index}",
            subtitle: "{desc}",
            model: {
              desc: {
                type: "input",
                label: "Description"
              },
              capacityPlanning: {
                type: "block",
                items: {
                  capPlanningHeader: {
                    type: "blockheader",
                    label: "Capacity Planning"
                  },
                  plannedOperatingPattern: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Planned Operating Pattern & Net Available Time"
                  },
                  daysPerWeek: {
                    type: "input",
                    label: "Days / Week"
                  },
                  shiftsPerDay: {
                    type: "input",
                    label: "Shifts / Day"
                  },
                  hoursPerShift: {
                    type: "input",
                    label: "Hours / Shift"
                  },
                  personalBreaks: {
                    type: "input",
                    label: "Personal Breaks"
                  },
                  plannedMaintenance: {
                    type: "input",
                    label: "Planned Maintenance"
                  },
                  inspectionOfFacilities: {
                    type: "input",
                    label: "Inspection of Facilities"
                  },
                  plannedChangeoverFrequency: {
                    type: "input",
                    label: "Planned Changeover Frequency",
                    desc: "(per week)"
                  },
                  plannedMinutesPerChangeover: {
                    type: "input",
                    label: "Planned Minutes per Changeover",
                    desc: "(into this part number)"
                  },
                  totalPlannedDowntime: {
                    type: "input",
                    label: "Total Planned Downtime",
                    desc: "(per week, inc breaks, etc)"
                  },
                  allocationPercentage: {
                    type: "input",
                    label: "Allocation Percentage",
                    desc: "Enter 100 for a dedicated process"
                  },
                  sharedLoadingPlan: {
                    type: "overlay",
                    text: "Submit Shared Loading Plan",
                    label: "Shared Loading Plan",
                    items: {
                      header: {
                        type: "header:h2",
                        text: "Shared Loading Plan"
                      },
                      sharedLoadingPlan: {
                        type: "sharedLoadingPlan",
                        model: {
                          jlrPartNumber: {
                            type: "input",
                            label: "JLR Part # or \"Non - JLR Part \""
                          },
                          reqGoodPartsPerWeek: {
                            type: "input",
                            label: "Req'd Good Parts / Week"
                          },
                          reqProdHoursPerWeek: {
                            type: "input",
                            label: "Req'd Prod Hours / Week"
                          },
                          requiredAllocationByPart: {
                            type: "input",
                            label: "Required % Allocation by Part"
                          }
                        }
                      },
                      percentageNetAvailTime: {
                        type: "input",
                        label: "Percentage of Net Available Time not utilized for production (%) {PM, etc.}"
                      },
                      totalPercentageAllocation: {
                        type: "input",
                        label: "Total % Allocation"
                      }
                    }
                  },
                  netAvailableTime: {
                    type: "input",
                    label: "Net Available Time"
                  },
                  requiredGoodPartsHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Required Good Parts / Week"
                  },
                  percentageOfPartsRejected: {
                    type: "input",
                    label: "Percentage of Parts Rejected",
                    desc: "(inc scrap & rework)"
                  },
                  requiredGoodPartsPerWeek: {
                    type: "input",
                    label: "Required Good Parts Per Week/Hour",
                    desc: "To support this process"
                  },
                  percentOfPartsReworked: {
                    type: "input",
                    label: "Percentage of Parts Reworked",
                    desc: "(re-run through process"
                  },
                  plannedCycleTimeHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Planned Cycle Time / Capacity"
                  },
                  idealPlannedCycleTime: {
                    type: "input",
                    label: "Ideal Planned Cycle Time",
                    desc: "Per tool or machine (sec/cycle)"
                  },
                  numberOfToolsParallel: {
                    type: "input",
                    label: "Number of Tools or Machines in Parallel"
                  },
                  identicalPartsPerCycle: {
                    type: "input",
                    label: "Number of Identical Parts Produced",
                    desc: "Per Tool/Machine Per Cycle"
                  },
                  netIdealCycleTime: {
                    type: "input",
                    label: "Net Ideal Cycle Time per Part",
                    desc: "(sec/part)"
                  },
                  plannedProductionPerWeek: {
                    type: "input",
                    label: "Planned Production Per Week"
                  },
                  requiredOEE: {
                    type: "input",
                    label: "Required OEE"
                  },
                  plannedProductionPerHour: {
                    type: "input",
                    label: "Planned Production Per Hour"
                  },
                  plannedProductionPerDay: {
                    type: "input",
                    label: "Planned Production Per Day"
                  },
                  otherAssumptions: {
                    type: "input",
                    label: "Enter any other assumptions"
                  }
                }
              },
              phase0: {
                type: "block",
                items: {
                  phase0Header: {
                    type: "blockheader",
                    label: "Phase 0"
                  },
                  phase0productionRunHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Supplier Demonstrated - Production Run"
                  },
                  phase0sharedProcessAllocation: {
                    type: "input",
                    label: "Shared Process Allocation %"
                  },
                  phase0equipmentHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Equipment Availability"
                  },
                  phase0totalDurationOfProductionRun: {
                    type: "input",
                    label: "Total Duration of Production Run",
                    desc: "(minutes)"
                  },
                  phase0equipTotalPlannedDowntime: {
                    type: "input",
                    label: "Total Planned Downtime",
                    desc: "(in minutes) (inc breaks, etc)"
                  },
                  phase0equipNetAvailableTime: {
                    type: "input",
                    label: "Net Available Time",
                    desc: "(minutes)"
                  },
                  phase0sharedEquipChangeover: {
                    type: "input",
                    label: "Shared Equipment Changeover Time",
                    desc: "(minutes)"
                  },
                  phase0totalUnplannedDowntime: {
                    type: "input",
                    label: "Total Unplanned Downtime",
                    desc: "(mins)"
                  },
                  phase0actualProductionTime: {
                    type: "input",
                    label: "Actual Production Time",
                    desc: "(minutes)"
                  },
                  phase0equipmentAvailability: {
                    type: "input",
                    label: "Equipment Availability %"
                  },
                  phase0performanceHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Performance Efficiency"
                  },
                  phase0totalPartsRun: {
                    type: "input",
                    label: "Total Parts Run",
                    desc: "(Good, Rejected)"
                  },
                  phase0perfNetIdealCycleTime: {
                    type: "input",
                    label: "Net Ideal Cycle Time",
                    desc: "(seconds/part)"
                  },
                  phase0performanceEfficiency: {
                    type: "input",
                    label: "Performance Efficiency %"
                  },
                  phase0availabilityAndPELossesNotCaptured: {
                    type: "input",
                    label: "Availability and/or Perf Efficiency Losses",
                    desc: "Not Captured (minutes)"
                  },
                  phase0qualityRateHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Quality Rate"
                  },
                  phase0numberOfPartsRejected: {
                    type: "input",
                    label: "Number of Parts Rejected"
                  },
                  phase0numberOfPartsReworked: {
                    type: "input",
                    label: "Number of Parts Reworked & Accepted"
                  },
                  phase0rightFirstTime: {
                    type: "input",
                    label: "Right First Time Quality Rate %",
                    desc: "(inc. reworked parts)"
                  },
                  phase0firstTimeThrough: {
                    type: "input",
                    label: "First Time Through Quality Rate %"
                  },
                  phase0oeeHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Overal Equipment Effectiveness (OEE)"
                  },
                  phase0oee: {
                    type: "input",
                    label: "OEE %"
                  },
                  phase0weeklyHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Weekly or Hourly Parts Avail for Shipment"
                  },
                  phase0processSpecificWeek: {
                    type: "input",
                    label: "Process Specific Weekly Part Estimate"
                  },
                  phase0processSpecificHour: {
                    type: "input",
                    label: "Process Specific Estimate Per Hour"
                  },
                  phase0processSpecificDay: {
                    type: "input",
                    label: "Process Specific Estimate Per Day"
                  },
                  phase0processHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Process Total Actual Cycle Time (sec/part)"
                  },
                  phase0observedCycleTime: {
                    type: "input",
                    label: "Observed Average Cycle Time",
                    desc: "(sec/cycle)"
                  },
                  phase0analysisHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Analysis of Run @ Rate"
                  },
                  phase0jlrDemand: {
                    type: "input",
                    label: "JLR Demand"
                  },
                  phase0partsAvailableForShipment: {
                    type: "input",
                    label: "Weekly Parts Available for Shipment"
                  },
                  phase0percentageJLRDemand: {
                    type: "input",
                    label: "Percentage Above/Below JLR Demand"
                  }
                }
              },
              phase3: {
                type: "block",
                items: {
                  phase3Header: {
                    type: "blockheader",
                    label: "Phase 3"
                  },
                  phase3productionRunHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Supplier Demonstrated - Production Run"
                  },
                  phase3sharedProcessAllocation: {
                    type: "input",
                    label: "Shared Process Allocation %"
                  },
                  phase3equipmentHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Equipment Availability"
                  },
                  phase3totalDurationOfProductionRun: {
                    type: "input",
                    label: "Total Duration of Production Run",
                    desc: "(minutes)"
                  },
                  phase3equipTotalPlannedDowntime: {
                    type: "input",
                    label: "Total Planned Downtime",
                    desc: "(in minutes) (inc breaks, etc)"
                  },
                  phase3equipNetAvailableTime: {
                    type: "input",
                    label: "Net Available Time",
                    desc: "(minutes)"
                  },
                  phase3sharedEquipChangeover: {
                    type: "input",
                    label: "Shared Equipment Changeover Time",
                    desc: "(minutes)"
                  },
                  phase3totalUnplannedDowntime: {
                    type: "input",
                    label: "Total Unplanned Downtime",
                    desc: "(mins)"
                  },
                  phase3actualProductionTime: {
                    type: "input",
                    label: "Actual Production Time",
                    desc: "(minutes)"
                  },
                  phase3equipmentAvailability: {
                    type: "input",
                    label: "Equipment Availability %"
                  },
                  phase3performanceHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Performance Efficiency"
                  },
                  phase3totalPartsRun: {
                    type: "input",
                    label: "Total Parts Run",
                    desc: "(Good, Rejected)"
                  },
                  phase3perfNetIdealCycleTime: {
                    type: "input",
                    label: "Net Ideal Cycle Time",
                    desc: "(seconds/part)"
                  },
                  phase3performanceEfficiency: {
                    type: "input",
                    label: "Performance Efficiency %"
                  },
                  phase3qualityRateHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Quality Rate"
                  },
                  phase3numberOfPartsRejected: {
                    type: "input",
                    label: "Number of Parts Rejected"
                  },
                  phase3numberOfPartsReworked: {
                    type: "input",
                    label: "Number of Parts Reworked & Accepted"
                  },
                  phase3rightFirstTime: {
                    type: "input",
                    label: "Right First Time Quality Rate %",
                    desc: "(inc. reworked parts)"
                  },
                  phase3firstTimeThrough: {
                    type: "input",
                    label: "First Time Through Quality Rate %"
                  },
                  phase3oeeHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Overal Equipment Effectiveness (OEE)"
                  },
                  phase3oee: {
                    type: "input",
                    label: "OEE %"
                  },
                  phase3weeklyHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Weekly or Hourly Parts Avail for Shipment"
                  },
                  phase3processSpecificWeek: {
                    type: "input",
                    label: "Process Specific Weekly Part Estimate"
                  },
                  phase3processSpecificHour: {
                    type: "input",
                    label: "Process Specific Estimate Per Hour"
                  },
                  phase3processSpecificDay: {
                    type: "input",
                    label: "Process Specific Estimate Per Day"
                  },
                  phase3processHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Process Total Actual Cycle Time (sec/part)"
                  },
                  phase3observedCycleTime: {
                    type: "input",
                    label: "Observed Average Cycle Time",
                    desc: "(sec/cycle)"
                  },
                  phase3analysisHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Analysis of Run @ Rate"
                  },
                  phase3jlrDemand: {
                    type: "input",
                    label: "JLR Demand"
                  },
                  phase3partsAvailableForShipment: {
                    type: "input",
                    label: "Weekly Parts Available for Shipment"
                  },
                  phase3percentageJLRDemand: {
                    type: "input",
                    label: "Percentage Above/Below JLR Demand"
                  }
                }
              },
              capacityConfirmation: {
                type: "block",
                items: {
                  capConfHeader: {
                    type: "blockheader",
                    label: "Capacity Confirmation"
                  },
                  capConfproductionRunHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Supplier Demonstrated - Production Run"
                  },
                  capConfsharedProcessAllocation: {
                    type: "input",
                    label: "Shared Process Allocation %"
                  },
                  capConfequipmentHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Equipment Availability"
                  },
                  capConftotalDurationOfProductionRun: {
                    type: "input",
                    label: "Total Duration of Production Run",
                    desc: "(minutes)"
                  },
                  capConfequipTotalPlannedDowntime: {
                    type: "input",
                    label: "Total Planned Downtime",
                    desc: "(in minutes) (inc breaks, etc)"
                  },
                  capConfequipNetAvailableTime: {
                    type: "input",
                    label: "Net Available Time",
                    desc: "(minutes)"
                  },
                  capConfsharedEquipChangeover: {
                    type: "input",
                    label: "Shared Equipment Changeover Time",
                    desc: "(minutes)"
                  },
                  capConftotalUnplannedDowntime: {
                    type: "input",
                    label: "Total Unplanned Downtime",
                    desc: "(mins)"
                  },
                  capConfactualProductionTime: {
                    type: "input",
                    label: "Actual Production Time",
                    desc: "(minutes)"
                  },
                  capConfequipmentAvailability: {
                    type: "input",
                    label: "Equipment Availability %"
                  },
                  capConfperformanceHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Performance Efficiency"
                  },
                  capConftotalPartsRun: {
                    type: "input",
                    label: "Total Parts Run",
                    desc: "(Good, Rejected)"
                  },
                  capConfperfNetIdealCycleTime: {
                    type: "input",
                    label: "Net Ideal Cycle Time",
                    desc: "(seconds/part)"
                  },
                  capConfperformanceEfficiency: {
                    type: "input",
                    label: "Performance Efficiency %"
                  },
                  capConfqualityRateHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Quality Rate"
                  },
                  capConfnumberOfPartsRejected: {
                    type: "input",
                    label: "Number of Parts Rejected"
                  },
                  capConfnumberOfPartsReworked: {
                    type: "input",
                    label: "Number of Parts Reworked & Accepted"
                  },
                  capConfrightFirstTime: {
                    type: "input",
                    label: "Right First Time Quality Rate %",
                    desc: "(inc. reworked parts)"
                  },
                  capConffirstTimeThrough: {
                    type: "input",
                    label: "First Time Through Quality Rate %"
                  },
                  capConfoeeHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Overal Equipment Effectiveness (OEE)"
                  },
                  capConfoee: {
                    type: "input",
                    label: "OEE %"
                  },
                  capConfweeklyHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Weekly or Hourly Parts Avail for Shipment"
                  },
                  capConfprocessSpecificWeek: {
                    type: "input",
                    label: "Process Specific Weekly Part Estimate"
                  },
                  capConfprocessSpecificHour: {
                    type: "input",
                    label: "Process Specific Estimate Per Hour"
                  },
                  capConfprocessSpecificDay: {
                    type: "input",
                    label: "Process Specific Estimate Per Day"
                  },
                  capConfprocessHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Process Total Actual Cycle Time (sec/part)"
                  },
                  capConfobservedCycleTime: {
                    type: "input",
                    label: "Observed Average Cycle Time",
                    desc: "(sec/cycle)"
                  },
                  capConfanalysisHeader: {
                    type: "blockheader",
                    className: "subheader",
                    label: "Analysis of Run @ Rate"
                  },
                  capConfjlrDemand: {
                    type: "input",
                    label: "JLR Demand"
                  },
                  capConfpartsAvailableForShipment: {
                    type: "input",
                    label: "Weekly Parts Available for Shipment"
                  },
                  capConfpercentageJLRDemand: {
                    type: "input",
                    label: "Percentage Above/Below JLR Demand"
                  }
                }
              }
            }
          }
        }
      },
      summary: {
        padding: "10px 15px",
        title: "Summary",
        items: {
          summary: {
            type: "summaryTab"
          },

          col: {
            type: "column",
            span: 2,
            items: [{
              signature: {
                type: "sign",
                label: "Decleration",
                desc: "I hereby confirm that I have the right and authority to fill in this document on behalf of the supplier company mentioned above. The information I have given is true and accurate to the best of my knowledge. Sub Tier Components: In addition to the data contained in the report, the Supplier Authorised Representative approval confirms that all sub-tier components used in the assembly of these components are also approved to the relevant Production Run i.e. Run at Rate (Phase 0) or Capacity Confirmation"
              }
            }, {}]
          }
        }
      }
    }
  },
  buttonContainer: {
    type: "buttonContainer",
    items: {}
  }
};

exports["default"] = form;


},{}],23:[function(require,module,exports){
"use strict";

var controller = {
  volumeTotal: {
    disabled: true
  },
  otherVolumeTotal: {
    disabled: true
  },
  processes: {
    totalPlannedDowntime: {
      disabled: true
    },
    netAvailableTime: {
      disabled: true
    },
    requiredGoodPartsPerWeek: {
      disabled: true
    },
    netIdealCycleTime: {
      disabled: true
    },
    plannedProductionPerWeek: {
      disabled: true
    },
    requiredOEE: {
      disabled: true
    },
    plannedProductionPerHour: {
      disabled: true
    },
    plannedProductionPerDay: {
      disabled: true
    },
    phase0equipNetAvailableTime: {
      disabled: true
    },
    phase3equipNetAvailableTime: {
      disabled: true
    },
    capConfequipNetAvailableTime: {
      disabled: true
    },
    phase0actualProductionTime: {
      disabled: true
    },
    phase3actualProductionTime: {
      disabled: true
    },
    capConfactualProductionTime: {
      disabled: true
    },
    totalPercentageAllocation: {
      disabled: true
    },
    phase0equipmentAvailability: {
      disabled: true
    },
    phase3equipmentAvailability: {
      disabled: true
    },
    capConfequipmentAvailability: {
      disabled: true
    },
    phase0performanceEfficiency: {
      disabled: true
    },
    phase3performanceEfficiency: {
      disabled: true
    },
    capConfperformanceEfficiency: {
      disabled: true
    },
    phase0availabilityAndPELossesNotCaptured: {
      disabled: true
    },
    phase3availabilityAndPELossesNotCaptured: {
      disabled: true
    },
    capConfavailabilityAndPELossesNotCaptured: {
      disabled: true
    },
    phase0rightFirstTime: {
      disabled: true
    },
    phase3rightFirstTime: {
      disabled: true
    },
    capConfrightFirstTime: {
      disabled: true
    },
    phase0firstTimeThrough: {
      disabled: true
    },
    phase3firstTimeThrough: {
      disabled: true
    },
    capConffirstTimeThrough: {
      disabled: true
    },
    phase0oee: {
      disabled: true
    },
    phase3oee: {
      disabled: true
    },
    capConfoee: {
      disabled: true
    },
    phase0processSpecificWeek: {
      disabled: true
    },
    phase3processSpecificWeek: {
      disabled: true
    },
    capConfprocessSpecificWeek: {
      disabled: true
    },
    phase0processSpecificHour: {
      disabled: true
    },
    phase3processSpecificHour: {
      disabled: true
    },
    capConfprocessSpecificHour: {
      disabled: true
    },
    phase0processSpecificDay: {
      disabled: true
    },
    phase3processSpecificDay: {
      disabled: true
    },
    capConfprocessSpecificDay: {
      disabled: true
    },
    phase0observedCycleTime: {
      disabled: true
    },
    phase3observedCycleTime: {
      disabled: true
    },
    capConfobservedCycleTime: {
      disabled: true
    },
    phase0jlrDemand: {
      disabled: true
    },
    phase3jlrDemand: {
      disabled: true
    },
    capConfjlrDemand: {
      disabled: true
    },
    phase0partsAvailableForShipment: {
      disabled: true
    },
    phase3partsAvailableForShipment: {
      disabled: true
    },
    capConfpartsAvailableForShipment: {
      disabled: true
    },
    phase0percentageJLRDemand: {
      disabled: true
    },
    phase3percentageJLRDemand: {
      disabled: true
    },
    capConfpercentageJLRDemand: {
      disabled: true
    }
  }
};

exports["default"] = controller;


},{}],24:[function(require,module,exports){
"use strict";

var blocksActions = require("../actions/blocks")["default"];
var routerStore = require("../router/stores/router")["default"];
var alert = require("../actions/alert")["default"];


var listeners = function (form) {
  var model = form.model;
  var view = form.view;
  var parts = ["l359", "l319", "l316", "l538", "l550", "l450", "l460", "l494", "l462", "x760", "x260", "x150", "x152", "x250", "x351"];

  model.find("volumeTotal").setValue(function () {
    var total = 0;
    parts.forEach(function (element) {
      var modelValue = model.find(element);

      if (modelValue[0]) {
        total += modelValue[0].value * 1;
      }
    });
    return total;
  });

  model.find("otherVolumeTotal").setValue(function () {
    var total = 0;

    parts.forEach(function (element) {
      var modelValue = model.find("other" + element);

      if (modelValue[0]) {
        total += modelValue[0].value * 1;
      }
    });
    return total;
  });

  model.find("partType").observe(function (newVal) {
    var period;
    if (newVal === "sequenced") {
      period = " Hourly";
    } else {
      period = " Weekly";
    }

    parts.forEach(function (element) {
      var itemsView = view.find("tabs.part.volumeTotals")[0];

      if (itemsView.items[element]) {
        itemsView.items[element].label = element + period + " Volume";
      }

      var itemsView = view.find("tabs.part.otherVolumeTotals")[0];

      if (itemsView.items["other" + element]) {
        itemsView.items["other" + element].label = element + period + " Volume";
      }
    });
  });

  model.find("studySubmittedFor").observe(function (newVal, oldVal, diff) {
    var suffix = view.find("tabs.part.volumeTotals");

    var sequenced = model.find("partType")[0];

    if (diff) {
      diff.forEach(function (element) {
        if (element.action === "removed") {
          suffix.destroy(element.value);
        } else {
          var label = element.value;

          if (sequenced.value) {
            label += {
              sequenced: " Hourly",
              non: " Weekly"
            }[sequenced.value];
          }

          label += " Volume";

          suffix.append(element.value, {
            type: "input",
            label: label
          });
        }
      });
    }
  });

  model.find("otherStudySubmittedFor").observe(function (newVal, oldVal, diff) {
    var suffix = view.find("tabs.part.otherVolumeTotals");

    console.log(suffix, diff);

    var sequenced = model.find("partType")[0];

    if (diff) {
      diff.forEach(function (element) {
        if (element.action === "removed") {
          suffix.destroy("other" + element.value);
        } else {
          var label = element.value;

          if (sequenced.value) {
            label += {
              sequenced: " Hourly",
              non: " Weekly"
            }[sequenced.value];
          }

          label += " Volume";

          suffix.append("other" + element.value, {
            type: "input",
            label: label
          });
        }
      });
    }
  });

  model.find("directedPart").observe(function (newVal) {
    var directedCol = view.find("tabs.part.directedCol");
    var responses = {
      yes: function () {
        directedCol.append("directedName", {
          type: "input",
          label: "Directed Supplier Name"
        });

        directedCol.append("directedGSDB", {
          type: "input",
          label: "Directed to Supplier GSDB code"
        });
      },
      no: function () {
        directedCol.destroy("directedName");
        directedCol.destroy("directedGSDB");
      }
    };

    (responses[newVal] || function () {})();
  });

  model.find("volumeTotal").observe(function (newVal, oldVal) {
    console.log("NEWVAL::", newVal, oldVal);
    model.find("totalRequiredDemand")[0].value = newVal;
  });

  model.find("studySupplierFor").observe(function (newVal, oldVal) {
    var nameCol = view.find("tabs.part.nameCol");
    var complexCol = view.find("tabs.part.complexCommodityCol");

    var prefix = model.find("prefix")[0] ? model.find("prefix")[0].value : "";
    var base = model.find("base")[0] ? model.find("base")[0].value : "";
    var suffix = model.find("suffix")[0] ? model.find("suffix")[0].value : "";

    if (newVal !== "complex" && oldVal === "complex") {
      complexCol.destroy("complexCommodityParts");
    }

    var handle = {
      multi: function () {
        nameCol.destroy("suffix");

        nameCol.append("prefix", {
          type: "input",
          label: "Prefix"
        }, prefix);

        nameCol.append("base", {
          type: "input",
          label: "Base"
        }, base);

        nameCol.append("suffix", {
          type: "table:simple",
          model: {
            suffix: {
              type: "input",
              label: "Suffix"
            }
          }
        }, [{
          suffix: {}
        }]);
      },
      single: function () {
        if (oldVal === "multi") {
          nameCol.destroy("suffix");
        }

        nameCol.append("prefix", {
          type: "input",
          label: "Prefix"
        }, prefix);

        nameCol.append("base", {
          type: "input",
          label: "Base"
        }, base);

        if (oldVal != "") {
          suffix = "";
        }

        nameCol.append("suffix", {
          type: "input",
          label: "Suffix"
        }, suffix);
      },
      multiAll: function () {
        if (oldVal === "multi") {
          nameCol.destroy("suffix");
        }

        nameCol.append("prefix", {
          type: "input",
          label: "Prefix"
        }, prefix);

        nameCol.append("base", {
          type: "input",
          label: "Base"
        }, base);

        nameCol.append("suffix", {
          type: "input",
          label: "Suffix"
        }, "All", {
          disabled: true
        });
      },
      complex: function () {
        nameCol.destroy("base");
        nameCol.destroy("prefix");
        nameCol.destroy("suffix");

        complexCol.append("complexCommodityParts", {
          type: "textarea",
          label: "Complex Commodity Part Numbers"
        });
      }
    };

    (handle[newVal] || function () {})();
  });

  model.find("processes.totalPlannedDowntime").setValue(function () {
    var JLRF = parseFloat(this.personalBreaks.value);
    var JLRG = parseFloat(this.plannedMaintenance.value);
    var JLRC = parseFloat(this.daysPerWeek.value);
    var JLRD = parseFloat(this.shiftsPerDay.value);
    var JLRI = parseFloat(this.plannedChangeoverFrequency.value);
    var JLRJ = parseFloat(this.plannedMinutesPerChangeover.value);
    var JLRH = parseFloat(this.inspectionOfFacilities.value);

    var result = (JLRF + JLRG) * JLRC * JLRD + (JLRI * JLRJ) + JLRH;

    console.log(isNaN(result));

    return isNaN(result) ? "" : result;
  });

  model.find("processes.netAvailableTime").setValue(function () {
    var JLRC = parseFloat(this.daysPerWeek.value);
    var JLRD = parseFloat(this.shiftsPerDay.value);
    var JLRE = parseFloat(this.hoursPerShift.value);
    var JLRK = parseFloat(this.totalPlannedDowntime.value);
    var JLRL = parseFloat(this.allocationPercentage.value);

    var result = ((((JLRC * JLRD * JLRE) - (JLRK / 60)) * JLRL) / 100).toFixed(2);

    return isNaN(result) ? "" : result;
  });

  model.find("processes.requiredGoodPartsPerWeek").setValue(function () {
    var JLRA = parseFloat(model.find("totalRequiredDemand")[0].value);
    var JLRN = parseFloat(this.percentageOfPartsRejected.value);

    var result = Math.ceil(JLRA * 100 / (100 - JLRN));

    return isNaN(result) ? "" : result;
  });

  model.find("processes.netIdealCycleTime").setValue(function () {
    var JLRQ = parseFloat(this.idealPlannedCycleTime.value);
    var JLRR = parseFloat(this.numberOfToolsParallel.value);
    var JLRS = parseFloat(this.identicalPartsPerCycle.value);

    var result = (JLRQ / (JLRR * JLRS)).toFixed(2);

    return isNaN(result) ? "" : result;
  });

  model.find("processes.plannedProductionPerWeek").setValue(function () {
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

    return isNaN(result) ? "" : result;
  });

  model.find("processes.requiredOEE").setValue(function () {
    var JLRP = parseFloat(this.requiredGoodPartsPerWeek.value);
    var JLRU = parseFloat(this.plannedProductionPerWeek.value);

    var result = ((JLRP / JLRU) * 100).toFixed(2);

    return isNaN(result) ? "" : result;
  });

  model.find("processes.plannedProductionPerHour").setValue(function () {
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

    return isNaN(result) ? "" : result;
  });

  model.find("processes.plannedProductionPerDay").setValue(function () {
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

    return isNaN(result) ? "" : result;
  });

  function equipNetAvailableTime(phase) {
    return function () {
      var JLRAD = parseFloat(this[phase + "totalDurationOfProductionRun"].value);
      var JLRAE = parseFloat(this[phase + "equipTotalPlannedDowntime"].value);

      var result = JLRAD - JLRAE;

      return isNaN(result) ? "" : result;
    };
  }

  model.find("processes.phase0equipNetAvailableTime").setValue(equipNetAvailableTime("phase0"));
  model.find("processes.phase3equipNetAvailableTime").setValue(equipNetAvailableTime("phase3"));
  model.find("processes.capConfequipNetAvailableTime").setValue(equipNetAvailableTime("capConf"));

  function actualProductionTime(phase) {
    return function () {
      var JLRAF = parseFloat(this[phase + "equipNetAvailableTime"].value);
      var JLRAG = parseFloat(this[phase + "sharedEquipChangeover"].value);
      var JLRAI = parseFloat(this[phase + "totalUnplannedDowntime"].value);

      var result = JLRAF - JLRAG - JLRAI;

      return isNaN(result) ? "" : result;
    };
  }

  model.find("processes.phase0actualProductionTime").setValue(actualProductionTime("phase0"));
  model.find("processes.phase3actualProductionTime").setValue(actualProductionTime("phase3"));
  model.find("processes.capConfactualProductionTime").setValue(actualProductionTime("capConf"));

  function equipmentAvailability(phase) {
    return function () {
      var JLRAJ = parseFloat(this[phase + "actualProductionTime"].value);
      var JLRAF = parseFloat(this[phase + "equipNetAvailableTime"].value);

      var result = ((JLRAJ / JLRAF) * 100).toFixed(2);

      return isNaN(result) ? "" : result;
    };
  }

  model.find("processes.phase0equipmentAvailability").setValue(equipmentAvailability("phase0"));
  model.find("processes.phase3equipmentAvailability").setValue(equipmentAvailability("phase3"));
  model.find("processes.capConfequipmentAvailability").setValue(equipmentAvailability("capConf"));

  function performanceEfficiency(phase) {
    return function () {
      var JLRAM = parseFloat(this[phase + "totalPartsRun"].value);
      var JLRAN = parseFloat(this[phase + "perfNetIdealCycleTime"].value);
      var JLRAJ = parseFloat(this[phase + "actualProductionTime"].value);

      var result = ((JLRAM * JLRAN / (JLRAJ * 60)) * 100).toFixed(2);

      return isNaN(result) ? "" : result;
    };
  }

  model.find("processes.phase0performanceEfficiency").setValue(performanceEfficiency("phase0"));
  model.find("processes.phase3performanceEfficiency").setValue(performanceEfficiency("phase3"));
  model.find("processes.capConfperformanceEfficiency").setValue(performanceEfficiency("capConf"));

  function availabilityAndPELossesNotCaptured(phase) {
    return function () {
      var JLRAM = parseFloat(this[phase + "totalPartsRun"].value);
      var JLRAN = parseFloat(this[phase + "perfNetIdealCycleTime"].value);
      var JLRAK = parseFloat(this[phase + "equipmentAvailability"].value);

      var result = (JLRAK - (JLRAN * JLRAM) / 60).toFixed(2);

      return isNaN(result) ? "" : result;
    };
  }

  model.find("processes.phase0availabilityAndPELossesNotCaptured").setValue(availabilityAndPELossesNotCaptured("phase0"));
  model.find("processes.phase3availabilityAndPELossesNotCaptured").setValue(availabilityAndPELossesNotCaptured("phase3"));
  model.find("processes.capConfavailabilityAndPELossesNotCaptured").setValue(availabilityAndPELossesNotCaptured("capConf"));

  function rightFirstTime(phase) {
    return function () {
      var JLRAM = parseFloat(this[phase + "totalPartsRun"].value);
      var JLRAQ = parseFloat(this[phase + "numberOfPartsRejected"].value);
      var JLRAR = parseFloat(this[phase + "numberOfPartsReworked"].value);

      var result = ((JLRAM - (JLRAQ - JLRAR)) / JLRAM) * 100;

      return isNaN(result) ? "" : result;
    };
  }

  model.find("processes.phase0rightFirstTime").setValue(rightFirstTime("phase0"));
  model.find("processes.phase3rightFirstTime").setValue(rightFirstTime("phase3"));
  model.find("processes.capConfrightFirstTime").setValue(rightFirstTime("capConf"));

  function firstTimeThrough(phase) {
    return function () {
      var JLRAM = parseFloat(this[phase + "totalPartsRun"].value);
      var JLRAQ = parseFloat(this[phase + "numberOfPartsRejected"].value);

      var result = ((JLRAM - JLRAQ) / JLRAM) * 100;

      return isNaN(result) ? "" : result;
    };
  }

  model.find("processes.phase0firstTimeThrough").setValue(firstTimeThrough("phase0"));
  model.find("processes.phase3firstTimeThrough").setValue(firstTimeThrough("phase3"));
  model.find("processes.capConffirstTimeThrough").setValue(firstTimeThrough("capConf"));

  function oee(phase) {
    return function () {
      var JLRAK = parseFloat(this[phase + "equipmentAvailability"].value);
      var JLRAO = parseFloat(this[phase + "performanceEfficiency"].value);
      var JLRAS = parseFloat(this[phase + "rightFirstTime"].value);

      var result = ((JLRAK * JLRAO * JLRAS) / 10000).toFixed(2);

      return isNaN(result) ? "" : result;
    };
  }

  model.find("processes.phase0oee").setValue(oee("phase0"));
  model.find("processes.phase3oee").setValue(oee("phase3"));
  model.find("processes.capConfoee").setValue(oee("capConf"));

  function processSpecificWeek(phase) {
    return function () {
      var JLRU = parseFloat(this.plannedProductionPerWeek.value);
      var JLRAU = parseFloat(this[phase + "oee"].value);

      var result = Math.round(JLRU * JLRAU / 100);

      return isNaN(result) ? "" : result;
    };
  }

  model.find("processes.phase0processSpecificWeek").setValue(processSpecificWeek("phase0"));
  model.find("processes.phase3processSpecificWeek").setValue(processSpecificWeek("phase3"));
  model.find("processes.capConfprocessSpecificWeek").setValue(processSpecificWeek("capConf"));

  function processSpecificHour(phase) {
    return function () {
      var JLRCA = parseFloat(this.plannedProductionPerHour.value);
      var JLRAU = parseFloat(this[phase + "oee"].value);

      var result = Math.round(JLRCA * JLRAU / 100);

      return isNaN(result) ? "" : result;
    };
  }

  model.find("processes.phase0processSpecificHour").setValue(processSpecificHour("phase0"));
  model.find("processes.phase3processSpecificHour").setValue(processSpecificHour("phase3"));
  model.find("processes.capConfprocessSpecificHour").setValue(processSpecificHour("capConf"));

  function processSpecificDay(phase) {
    return function () {
      var JLRCB = parseFloat(this.plannedProductionPerDay.value);
      var JLRAU = parseFloat(this[phase + "oee"].value);

      var result = Math.round(JLRCB * JLRAU / 100);

      return isNaN(result) ? "" : result;
    };
  }

  model.find("processes.phase0processSpecificDay").setValue(processSpecificDay("phase0"));
  model.find("processes.phase3processSpecificDay").setValue(processSpecificDay("phase3"));
  model.find("processes.capConfprocessSpecificDay").setValue(processSpecificDay("capConf"));

  function observedCycleTime(phase) {
    return function () {
      var JLRAJ = parseFloat(this[phase + "actualProductionTime"].value);
      var JLRAM = parseFloat(this[phase + "totalPartsRun"].value);

      var result = (JLRAJ * 60 / JLRAM).toFixed(2);

      return isNaN(result) ? "" : result;
    };
  }

  model.find("processes.phase0observedCycleTime").setValue(observedCycleTime("phase0"));
  model.find("processes.phase3observedCycleTime").setValue(observedCycleTime("phase3"));
  model.find("processes.capConfobservedCycleTime").setValue(observedCycleTime("capConf"));

  function jlrDemand(phase) {
    return function () {
      return model.find("totalRequiredDemand")[0].value;
    };
  }

  model.find("processes.phase0jlrDemand").setValue(jlrDemand("phase0"));
  model.find("processes.phase3jlrDemand").setValue(jlrDemand("phase3"));
  model.find("processes.capConfjlrDemand").setValue(jlrDemand("capConf"));

  function partsAvailableForShipment(phase) {
    return function () {
      var partType = model.find("partType")[0].value;

      var toFind = {
        sequenced: "processSpecificWeek",
        non: "processSpecificHour"
      };

      if (toFind[partType]) {
        return this[phase + toFind[partType]].value;
      } else {
        return "";
      }
    };
  }

  model.find("processes.phase0partsAvailableForShipment").setValue(partsAvailableForShipment("phase0"));
  model.find("processes.phase3partsAvailableForShipment").setValue(partsAvailableForShipment("phase3"));
  model.find("processes.capConfpartsAvailableForShipment").setValue(partsAvailableForShipment("capConf"));

  function observePercentageJLRDemand(phase) {
    return function (newVal, oldVal, diff, name) {
      var className = "";
      if (newVal < 0) {
        className = "negative";
      } else if (newVal > 0) {
        className = "positive";
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

  model.find("processes.phase0percentageJLRDemand").observe(observePercentageJLRDemand("phase0"));
  model.find("processes.phase3percentageJLRDemand").observe(observePercentageJLRDemand("phase3"));
  model.find("processes.capConfpercentageJLRDemand").observe(observePercentageJLRDemand("capConf"));


  function percentageJLRDemand(phase) {
    return function () {
      var JLRBD = parseFloat(this[phase + "partsAvailableForShipment"].value);
      var JLRBC = parseFloat(this[phase + "jlrDemand"].value);

      var result = Math.round((JLRBD - JLRBC / JLRBC) * 100);

      return isNaN(result) ? "" : result;
    };
  }

  model.find("processes.phase0percentageJLRDemand").setValue(percentageJLRDemand("phase0"));
  model.find("processes.phase3percentageJLRDemand").setValue(percentageJLRDemand("phase3"));
  model.find("processes.capConfpercentageJLRDemand").setValue(percentageJLRDemand("capConf"));

  model.find("processes.totalPercentageAllocation").setValue(function () {
    var sharedLoadingPlan = this.sharedLoadingPlan.value;

    var sum = 0;

    sharedLoadingPlan.forEach(function (item) {
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

    return isNaN(sum) ? "" : sum;
  });

  model.find("phase").observe(function (newVal) {
    console.log("hello");
    var actions = {
      capacityPlanning: function () {
        blocksActions.setVisible(["capacityPlanning"]);
        blocksActions.setOpen(["capacityPlanning"]);
      },
      phase0: function () {
        console.log("set to phase0");
        blocksActions.setVisible(["capacityPlanning", "phase0"]);
        blocksActions.setOpen(["capacityPlanning", "phase0"]);
      },
      phase3: function () {
        blocksActions.setVisible(["capacityPlanning", "phase3"]);
        blocksActions.setOpen(["capacityPlanning", "phase3"]);
      },
      capacityConfirmation: function () {
        blocksActions.setVisible(["capacityConfirmation"]);
        blocksActions.setOpen(["capacityConfirmation"]);
      }
    };

    if (!!newVal) {
      actions[newVal]();
    }
  });
};

exports["default"] = listeners;


},{"../actions/alert":2,"../actions/blocks":4,"../router/stores/router":43}],25:[function(require,module,exports){
"use strict";

var routerStore = require("./router/stores/router")["default"];


var loading = {};

loading.status = "idle";

loading.bar = document.querySelectorAll(".loading__bar")[0];
loading.container = document.querySelectorAll(".loading")[0];

var loadingBar = React.createClass({ displayName: "loadingBar",
  getInitialState: function () {
    return {
      percentage: 0,
      active: false
    };
  },
  reqCompleted: 0,
  reqTotal: 0,
  start: function (payload) {
    console.log("hello");
    if (payload.state.resolve) {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      if (this.status === "started") {
        return;
      }
      this.setState({
        active: true
      });

      this.reqTotal = Object.keys(payload.state.resolve).length;

      this.status = "started";

      this.set(0.2);
    }
  },
  finishPromise: function () {
    this.reqCompleted++;

    if (this.reqCompleted >= this.reqTotal) {
      this.complete();
    } else {
      this.set(this.reqCompleted / this.reqTotal);
    }
  },
  set: function (number) {
    var _this = this;
    if (this.status !== "started") {
      return;
    }

    var percentage = (number * 100);

    this.percentage = number;

    this.setState({
      percentage: percentage
    });

    if (this.incrementTimeout) {
      clearTimeout(this.incrementTimeout);
    }

    this.incrementTimeout = setTimeout(function () {
      _this.increment();
    }, 250);
  },
  increment: function () {
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
  complete: function () {
    this.set(1);

    this.status = "idle";
    this.reqTotal = 0;
    this.reqCompleted = 0;

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    var _this = this;
    this.timeout = setTimeout(function () {
      _this.setState({
        percentage: 0,
        active: false
      });
    }, 250);
  },
  componentWillMount: function () {
    routerStore.on("stateChangeStart", this.start);
    routerStore.on("statePromiseFinished", this.finishPromise);
  },
  componentWillUnmount: function () {
    routerStore.off("stateChangeStart", this.start);
    routerStore.off("statePromiseFinished", this.finishPromise);
  },
  render: function () {
    var cx = React.addons.classSet;

    var loadingClass = cx({
      loading: true,
      active: this.state.active
    });

    var style = {
      width: this.state.percentage + "%"
    };

    return (React.createElement("div", { className: loadingClass }, React.createElement("div", { className: "loading__bar", style: style }, React.createElement("div", { className: "loading__percentage" }))));
  }
});

module.exports = loadingBar;


},{"./router/stores/router":43}],26:[function(require,module,exports){
"use strict";

var admin = React.createClass({ displayName: "admin",
  render: function () {
    return (React.createElement("div", null, "Administration Page"));
  }
});

exports["default"] = admin;


},{}],27:[function(require,module,exports){
"use strict";

var formConfig = require("../form/config")["default"];
var listeners = require("../form/listeners")["default"];
var controller = require("../form/controller")["default"];
var alert = require("../actions/alert")["default"];
var xhr = require("../xhr")["default"];
var blocksActions = require("../actions/blocks")["default"];


var ecar = React.createClass({ displayName: "ecar",
  componentDidMount: function () {
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

    var form = adapt.form("name", formBuilder);

    var model = form.model;

    listeners(form);

    function isArray(value) {
      return toString.call(value).slice(8, -1) === "Array";
    }

    function isObject(value) {
      return toString.call(value).slice(8, -1) === "Object";
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
          if (typeof data[i].value !== "undefined") {
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
    model.find("saveButton").observe(function (newVal, oldVal) {
      if (!fired && newVal) {
        fired = true;
        var newData = {};
        convert(model.items, newData);

        var headers = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };


        alert.open({
          waiting: true,
          header: "Please Wait..",
          message: "Your eCAR is being saved" });

        xhr("PUT", "/rest/workflow", {}, JSON.stringify(newData), headers).then(function (data) {
          alert.open({
            success: true,
            header: "Success",
            message: "Your eCAR has been saved",
            buttons: [{
              type: "link",
              link: "/#/ecar/" + data.workflowId,
              text: "Continue"
            }]
          });
        }, function () {
          alert.open({
            error: true,
            header: "Something went wrong",
            message: "An error has occured, please try again later",
            buttons: [{
              type: "button",
              text: "Continue"
            }]
          });
        });
      } else if (newVal) {
        fired = false;
      }
    });

    model.find("ppapLevel").observe(function (newVal, oldVal) {
      if (newVal) {
        alert.open({
          warning: true,
          header: "Is this correct?",
          message: "Please ensure that the PPAP level you have selected is correct",
          buttons: [{
            type: "button",
            text: "Continue"
          }]
        });
      }
    });

    var contactDetailsPristine = true;

    var contactFired = false;
    form.observe.addListener(function () {
      var fields = [model.find("supplierName")[0].value, model.find("county")[0].value, model.find("qualityGSDB")[0].value, model.find("address")[0].value, model.find("country")[0].value, model.find("city")[0].value, model.find("manufacturingGSDB")[0].value, model.find("supplierRepresentativeName")[0].value, model.find("supplierRepresentativePhone")[0].value, model.find("supplierRepresentativeRole")[0].value, model.find("supplierRepresentativeEmail")[0].value, model.find("jlrStaEmail")[0].value, model.find("jlrStaName")[0].value, model.find("jlrStaPhone")[0].value];
      return fields.join("");
    }, function (newVal) {
      if (contactFired) {
        contactDetailsPristine = false;
      } else {
        contactFired = true;
      }
    });

    var submitFired = false;
    model.find("submitButton").observe(function (newVal, oldVal) {
      if (!submitFired && newVal) {
        submitFired = true;
        var newData = {};
        convert(model.items, newData);

        var headers = {
          Accept: "application/json",
          "Content-Type": "application/json"
        };

        function submit() {
          alert.open({
            waiting: true,
            header: "Please Wait..",
            message: "Your eCAR is being submitted" });

          xhr("PUT", "/rest/workflow/progress", {}, JSON.stringify(newData), headers).then(function () {
            alert.open({
              success: true,
              header: "Success",
              message: "Your eCAR has been submitted",
              buttons: [{
                type: "link",
                link: "/#/current",
                text: "Go to your eCARs"
              }]
            });
          }, function () {
            alert.open({
              error: true,
              header: "Something went wrong",
              message: "An error has occured, please try again later",
              buttons: [{
                type: "button",
                text: "Continue"
              }]
            });
          });
        }

        if (contactDetailsPristine) {
          alert.open({
            warning: true,
            header: "Are you sure?",
            message: "Your contact details have not been modified. Please make sure they're up to date before continuing.",
            buttons: [{
              type: "cancel",
              text: "Cancel"
            }, {
              type: "button",
              text: "Continue",
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

    form.render(domNode.querySelectorAll(".form")[0]);
    form.observe.digest();
  },
  render: function () {
    return (React.createElement("div", null, React.createElement("div", { className: "form" }), React.createElement("div", { className: "summarybar", style: { display: "none" } }, React.createElement("div", { className: "summarybar__header" }, "Processes Summary", React.createElement("div", { className: "summarybar__close" }, "Hide Summary Bar", React.createElement("i", { className: "fa fa-fw fa-times" }))), React.createElement("div", { className: "summarybar__processes clear" }, React.createElement("ul", { classname: "summarybar__processes--list " }, React.createElement("li", { className: "summarybar__processes--item clear summarybar__processes--below" }, React.createElement("span", { className: "summarybar__processes--name" }, React.createElement("h4", null, "Process 1"), React.createElement("h5", null, "Assembly")), React.createElement("span", { className: "summarybar__processes--percent" }, "-20%")), React.createElement("li", { className: "summarybar__processes--item clear summarybar__processes--above" }, React.createElement("span", { className: "summarybar__processes--name" }, React.createElement("h4", null, "Process 2"), React.createElement("h5", null, "Name Here")), React.createElement("span", { className: "summarybar__processes--percent" }, "80%")), React.createElement("li", { className: "summarybar__processes--item clear" }, React.createElement("span", { className: "summarybar__processes--name" }, React.createElement("h4", null, "Process 3"), React.createElement("h5", null, "Name Here")), React.createElement("span", { className: "summarybar__processes--percent" }, "0%")))), React.createElement("div", { className: "summarybar__chart" }, React.createElement("div", { className: "summarybar__legend clear" }, React.createElement("span", { className: "summarybar__legend--item" }, React.createElement("span", { className: "summarybar__legend--block", style: { background: "#CFE0C2" } }), "JLR Demand"), React.createElement("span", { className: "summarybar__legend--item" }, React.createElement("span", { className: "summarybar__legend--block", style: { background: "#DCDCDC" } }), "Weekly/Hourly Parts Available for Shipment")), React.createElement("canvas", { className: "summarybar__chart--canvas", height: "130" })))));
  }
});

ecar.resolve = {
  getDetails: function () {
    return xhr("GET", "/rest/supplierDetails");
  }
};

exports["default"] = ecar;


},{"../actions/alert":2,"../actions/blocks":4,"../form/config":22,"../form/controller":23,"../form/listeners":24,"../xhr":48}],28:[function(require,module,exports){
"use strict";

var router = require("../router/router")["default"];
var xhr = require("../xhr")["default"];
var actions = require("../actions/current")["default"];
var store = require("../stores/current")["default"];


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

var current = React.createClass({ displayName: "current",
  componentWillMount: function () {
    var _this = this;
    store.on("selectItem", this.updateSelected);
  },
  componentWillUnmount: function () {
    store.off("selectItem", this.updateSelected);
    document.removeEventListener("click", this.handleBodyClick);
    document.removeEventListener("contextmenu", this.handleBodyContext);
    document.removeEventListener("keydown", this.handleBodyKeydown);
  },
  updateSelected: function (payload) {
    this.setState({
      selected: payload
    });
  },
  handleBodyClick: function (e) {
    if (!findClosestParent(e.target, "current__row")) {
      if (!findClosestParent(e.target, "contextmenu")) {
        if (this.state.contextMenu.open) {
          this.setState({
            contextMenu: {
              open: false,
              location: {
                x: 0,
                y: 0
              },
              multiple: false
            }
          });

          actions.clearSelected();
        }
      }
    } else {
      this.setState({
        contextMenu: {
          open: false,
          location: {
            x: 0,
            y: 0
          },
          multiple: false
        }
      });
    }
  },
  handleBodyContext: function (e) {
    var overContextMenu = !findClosestParent(e.target, "contextmenu");

    if (!overContextMenu) {
      e.preventDefault();
    }

    if (!findClosestParent(e.target, "current__row") && overContextMenu) {
      if (this.state.contextMenu.open) {
        this.setState({
          contextMenu: {
            open: false,
            location: {
              x: 0,
              y: 0
            },
            multiple: false
          }
        });

        actions.clearSelected();
      }
    }
  },
  handleBodyKeydown: function (e) {
    if (e.keyCode === 27 && this.state.contextMenu.open) {
      this.setState({
        contextMenu: {
          open: false,
          location: {
            x: 0,
            y: 0
          }
        }
      });
    }
  },
  componentDidMount: function () {
    document.addEventListener("click", this.handleBodyClick);
    document.addEventListener("contextmenu", this.handleBodyContext);
    document.addEventListener("keydown", this.handleBodyKeydown);
  },
  handleContextMenu: function (e) {
    var _this = this;

    e.preventDefault();

    var row = findClosestParent(e.target, "current__row");

    var id = row.attributes["data-id"].value;

    var selected = this.state.selected || [];
    var index = selected.indexOf(id);

    var multiple = false;

    var location = {};
    var open;

    if (index > -1) {
      if (selected.length === 1) {
        // the user has right clicked on the same one that they just selected
        if (_this.state.contextMenu.location.x === e.clientX && _this.state.contextMenu.location.y === e.clientY) {
          // if they click in the same place, hide it

          open = false;
        } else {
          // if they click in a different place, move it

          open = true;
        }
      } else {
        // multiple items selected, including the one the user right clicked on
        open = true;
        multiple = true;
      }
    } else {
      // the one right clicked isn't selected
      if (selected.length === 0) {
        // add the selected one

        selected.push(id);
        open = true;
      } else {
        // multiple selected, not this one, so we need to clear selected and just set it to this

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

    _this.setState({
      contextMenu: {
        open: open,
        location: location,
        multiple: multiple
      }
    });

    actions.setSelected(selected);
  },
  selectRow: function (e) {
    e.preventDefault();

    var row = findClosestParent(e.target, "current__row");

    var selected = this.state.selected;
    var id = row.attributes["data-id"].value;
    var index = selected.indexOf(id);

    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(id);
    }

    actions.setSelected(selected);
  },
  getInitialState: function () {
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
  render: function () {
    var cx = React.addons.classSet;

    var list = this.props.data.getList;
    var rows = [];

    var _this = this;
    list.forEach(function (element) {
      var selected = false;

      if (_this.state.selected.indexOf(element.id) > -1) {
        selected = true;
      }

      var rowClass = cx({
        current__row: true,
        "current__row--active": selected
      });

      var iconClass = cx({
        fa: true,
        "fa-fw": true,
        "fa-square-o": !selected,
        "fa-check-square-o": selected
      });

      rows.push(React.createElement("li", {
        className: rowClass,
        "data-id": element.id,
        onContextMenu: _this.handleContextMenu,
        key: element.workflowId }, React.createElement(router.linkTo, {
        stateName: "ecar",
        params: {
          workflowId: element.workflowId
        },

        className: "current__link" }, React.createElement("div", {
        className: "current__col current__col--select",
        onClick: _this.selectRow }, React.createElement("i", { className: iconClass })), React.createElement("div", { className: "current__col current__col--id" }, element.workflowId), React.createElement("div", { className: "current__col" }, element.model.prefix), React.createElement("div", { className: "current__col" }, element.model.base), React.createElement("div", { className: "current__col" }, element.model.supplierName), React.createElement("div", { className: "current__col" }, element.model.manufacturingGSDB), React.createElement("div", { className: "current__col" }, element.model.partName), React.createElement("div", { className: "current__col" }, element.model.phase), React.createElement("div", { className: "current__col" }), React.createElement("div", { className: "current__col current__col--status" }, React.createElement("span", { className: "current__status" }, "Approved")), React.createElement("div", { className: "current__col" }, "Sep 1, 2014 2:40:17PM"), React.createElement("div", { className: "current__col current__col--icon" }, React.createElement("i", { className: "fa fa-chevron-right" })))));
    });

    var contextMenuElementList = [];
    var contextMenu = this.state.contextMenu;

    var contextMenuClass = cx({
      contextmenu: true,
      "contextmenu--active": contextMenu.open
    });

    var contextMenuStyle = {
      left: contextMenu.location.x + 1 + "px",
      top: contextMenu.location.y + 1 + "px" };

    if (contextMenu.multiple) {
      var length = this.state.selected.length;

      contextMenuElementList.push(React.createElement("li", { key: "approveMultiple", className: "contextmenu__item contextmenu__item--approve" }, React.createElement("i", { className: "fa fa-check fa-fw contextmenu__icon" }), "Approve ", length, " items"));

      contextMenuElementList.push(React.createElement("li", { key: "rejectMultiple", className: "contextmenu__item contextmenu__item--reject" }, React.createElement("i", { className: "fa fa-times fa-fw contextmenu__icon" }), "Reject ", length, " items"));

      contextMenuElementList.push(React.createElement("li", { key: "deleteMultiple", className: "contextmenu__item contextmenu__item--delete" }, React.createElement("i", { className: "fa fa-trash-o fa-fw contextmenu__icon" }), "Delete ", length, " items"));
    } else {
      contextMenuElementList.push(React.createElement("li", { key: "create", className: "contextmenu__item contextmenu__item--create" }, React.createElement("i", { className: "fa fa-plus fa-fw contextmenu__icon" }), "Create new eCar from this one"));

      contextMenuElementList.push(React.createElement("li", { key: "approve", className: "contextmenu__item contextmenu__item--approve" }, React.createElement("i", { className: "fa fa-check fa-fw contextmenu__icon" }), "Approve"));

      contextMenuElementList.push(React.createElement("li", { key: "reject", className: "contextmenu__item contextmenu__item--reject" }, React.createElement("i", { className: "fa fa-times fa-fw contextmenu__icon" }), "Reject"));

      contextMenuElementList.push(React.createElement("li", { key: "delete", className: "contextmenu__item contextmenu__item--delete" }, React.createElement("i", { className: "fa fa-trash-o fa-fw contextmenu__icon" }), "Delete"));
    }

    var contextMenuElement = (React.createElement("div", { className: contextMenuClass, style: contextMenuStyle }, React.createElement("ul", { className: "contextmenu__list" }, contextMenuElementList)));

    var actionsClass = cx({
      actions: true,
      actions__active: this.state.selected.length
    });

    return (React.createElement("div", { className: "current no-select" }, React.createElement("div", { className: actionsClass }, React.createElement("ul", { className: "actions__list clear" }, React.createElement("li", { className: "actions__item actions__item--deselect" }, React.createElement("i", { className: "fa fa-minus-square fa-fw actions__icon" }), "\u00a0"), React.createElement("li", { className: "actions__item actions__item--left actions__item--approve" }, React.createElement("i", { className: "fa fa-check fa-fw actions__icon" }), "Approve"), React.createElement("li", { className: "actions__item actions__item--middle actions__item--reject" }, React.createElement("i", { className: "fa fa-times fa-fw actions__icon" }), "Reject"), React.createElement("li", { className: "actions__item actions__item--right" }, React.createElement("i", { className: "fa fa-trash-o fa-fw actions__icon" }), "Delete"))), React.createElement("ul", { className: "current__table" }, React.createElement("li", { className: "current__header" }, React.createElement("div", { className: "current__col current__col--select" }), React.createElement("div", { className: "current__col current__col--id" }, "ID"), React.createElement("div", { className: "current__col" }, "Prefix"), React.createElement("div", { className: "current__col" }, "Base"), React.createElement("div", { className: "current__col" }, "Supplier Name"), React.createElement("div", { className: "current__col" }, "Supplier GSDB"), React.createElement("div", { className: "current__col" }, "Part Name"), React.createElement("div", { className: "current__col" }, "Submitted Phases"), React.createElement("div", { className: "current__col" }, "Submission Status"), React.createElement("div", { className: "current__col current__col--status" }), React.createElement("div", { className: "current__col" }, "Date Created"), React.createElement("div", { className: "current__col current__col--icon" })), rows), contextMenuElement));
  }
});

var resolve = {
  getList: function () {
    return xhr("get", "/rest/reporting/list");
  }
};

exports.current = current;
exports.resolve = resolve;


},{"../actions/current":5,"../router/router":42,"../stores/current":47,"../xhr":48}],29:[function(require,module,exports){
"use strict";

var formConfig = require("../form/config")["default"];
var listeners = require("../form/listeners")["default"];
var controller = require("../form/controller")["default"];
var xhr = require("../xhr")["default"];
var blocksActions = require("../actions/blocks")["default"];
var alert = require("../actions/alert")["default"];


var ecar = React.createClass({ displayName: "ecar",
  componentDidMount: function () {
    var formBuilder = {};

    formBuilder.model = this.props.data.getForm.model;
    formBuilder.controller = controller;

    var formView = JSON.parse(JSON.stringify(formConfig));

    formView.tabs.items.phase.items.col.items[1].ppapLevel.options = [{
      value: formBuilder.model.ppapLevel,
      label: formBuilder.model.ppapLevel.split("_")[1]
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

    var form = adapt.form("name", formBuilder);

    listeners(form);

    var domNode = this.getDOMNode();

    form.render(domNode.querySelectorAll(".form")[0]);
    //form.observe.digest();
    console.log("FORM:::", form);
  },
  render: function () {
    return (React.createElement("div", null, React.createElement("div", { className: "form" }), React.createElement("div", { className: "summarybar", style: { display: "none" } }, React.createElement("div", { className: "summarybar__header" }, "Processes Summary", React.createElement("div", { className: "summarybar__close" }, "Hide Summary Bar", React.createElement("i", { className: "fa fa-fw fa-times" }))), React.createElement("div", { className: "summarybar__processes clear" }, React.createElement("ul", { classname: "summarybar__processes--list " }, React.createElement("li", { className: "summarybar__processes--item clear summarybar__processes--below" }, React.createElement("span", { className: "summarybar__processes--name" }, React.createElement("h4", null, "Process 1"), React.createElement("h5", null, "Assembly")), React.createElement("span", { className: "summarybar__processes--percent" }, "-20%")), React.createElement("li", { className: "summarybar__processes--item clear summarybar__processes--above" }, React.createElement("span", { className: "summarybar__processes--name" }, React.createElement("h4", null, "Process 2"), React.createElement("h5", null, "Name Here")), React.createElement("span", { className: "summarybar__processes--percent" }, "80%")), React.createElement("li", { className: "summarybar__processes--item clear" }, React.createElement("span", { className: "summarybar__processes--name" }, React.createElement("h4", null, "Process 3"), React.createElement("h5", null, "Name Here")), React.createElement("span", { className: "summarybar__processes--percent" }, "0%")))), React.createElement("div", { className: "summarybar__chart" }, React.createElement("div", { className: "summarybar__legend clear" }, React.createElement("span", { className: "summarybar__legend--item" }, React.createElement("span", { className: "summarybar__legend--block", style: { background: "#CFE0C2" } }), "JLR Demand"), React.createElement("span", { className: "summarybar__legend--item" }, React.createElement("span", { className: "summarybar__legend--block", style: { background: "#DCDCDC" } }), "Weekly/Hourly Parts Available for Shipment")), React.createElement("canvas", { className: "summarybar__chart--canvas", height: "130" })))));
  }
});

ecar.resolve = {
  getForm: function (params) {
    var endpoint = ["rest", "workflow"];

    endpoint.push(params.workflowId.length === 16 && "byWorkflowId" || "byNodeId");
    endpoint.push(params.workflowId);

    return xhr("GET", endpoint.join("/"));
  }
};

exports["default"] = ecar;


},{"../actions/alert":2,"../actions/blocks":4,"../form/config":22,"../form/controller":23,"../form/listeners":24,"../xhr":48}],30:[function(require,module,exports){
"use strict";

var appStore = require("../stores/app")["default"];


var LoadingBar = require("../loading");
var Alert = require("../components/alert")["default"];
var Router = require("../router/router")["default"];
var Header = require("../partials/header")["default"];


console.log(Router);

var index = React.createClass({ displayName: "index",
  componentDidMount: function () {
    Router.handleStateChange();
  },
  componentWillMount: function () {
    appStore.on("frozenUpdate", this.handleFrozenUpdate);
  },
  componentWillUnmount: function () {
    appStore.off("frozenUpdate", this.handleFrozenUpdate);
  },
  handleFrozenUpdate: function () {
    this.setState({
      frozen: appStore.frozen,
      top: appStore.top });
  },
  getInitialState: function () {
    return {
      frozen: appStore.frozen,
      top: 0
    };
  },
  render: function () {
    var cx = React.addons.classSet;

    var appClasses = cx({
      app: true,
      "app--frozen": this.state.frozen
    });

    var appStyle = this.state.frozen ? {
      top: this.state.top
    } : {};

    return (React.createElement("div", { className: appClasses, style: appStyle }, React.createElement(LoadingBar, null), React.createElement(Alert, null), React.createElement(Header, null), React.createElement(Router.view, null)));
  }
});

exports["default"] = index;


},{"../components/alert":6,"../loading":25,"../partials/header":34,"../router/router":42,"../stores/app":45}],31:[function(require,module,exports){
"use strict";

module.exports = React.createClass({ displayName: "exports",
  render: function () {
    return (React.createElement("div", null, "Info"));
  }
});


},{}],32:[function(require,module,exports){
"use strict";

module.exports = React.createClass({ displayName: "exports",
  render: function () {
    return (React.createElement("div", null, "Reporting Page"));
  }
});


},{}],33:[function(require,module,exports){
"use strict";

var xhr = require("../xhr");

var Search = React.createClass({ displayName: "Search",
  render: function () {
    console.log(this.props);
    var test = [];
    for (var i = 0; i < 2; i++) {
      test.push(React.createElement("div", null, "hello"));
    }

    var query = this.props.currentState.params.query;

    var cx = React.addons.classSet;

    var errorMessage;
    if (String(query).trim() == "") {
      console.log("hi");
      errorMessage = (React.createElement("div", { className: "results__empty" }, React.createElement("i", { className: "fa fa-frown-o fa-fw" }), "Please enter a search query in the search bar above"));
    }

    var data = this.props.data.getSearchResults;
    if (!errorMessage && data.resultCount === 0) {
      errorMessage = (React.createElement("div", { className: "results__none" }, React.createElement("i", { className: "fa fa-frown-o fa-fw" }), "No matches for ", query, ". Try another search term?"));
    }

    console.log(errorMessage);

    return (React.createElement("div", { className: "results" }, errorMessage));
  }
});


Search.resolve = {
  getSearchResults: function (params) {
    return xhr("GET", "/rest/workflow/search/");
  }
};

module.exports = Search;


},{"../xhr":48}],34:[function(require,module,exports){
"use strict";

var Navigation = require("./navigation")["default"];
var Search = require("./search")["default"];
var Router = require("../router")["default"];


console.log(Router);

var header = React.createClass({ displayName: "header",
  render: function () {
    return (React.createElement("header", { className: "mainheader" }, React.createElement("div", { className: "mainheader__fixed" }, React.createElement("div", { className: "mainheader__table" }, React.createElement("div", { className: "mainheader__logo-container mainheader__cell" }, React.createElement(Router.linkTo, {
      stateName: "current",
      className: "mainheader__logo" })), React.createElement("div", { className: "mainheader__cell mainheader__cell--search" }, React.createElement(Search, null)), React.createElement("div", { className: "mainheader__cell mainheader__cell--user" }, React.createElement("div", { className: "mainheader__user" }, "Ryan Clark")), React.createElement("div", { className: "mainheader__cell mainheader__cell--navigation" }, React.createElement(Navigation, null))))));
  }
});

exports["default"] = header;


},{"../router":37,"./navigation":35,"./search":36}],35:[function(require,module,exports){
"use strict";

var router = require("../router/router")["default"];


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

var navigation = React.createClass({ displayName: "navigation",
  getInitialState: function () {
    return {
      open: false,
      dropdownHover: -1
    };
  },
  componentDidMount: function () {
    var _this = this;

    document.addEventListener("click", function (e) {
      if (!findClosestParent(e.target, "navigation__link--dropdown")) {
        if (_this.state.open) {
          _this.setState({
            open: false
          });
        }
      }
    });
  },
  setHover: function (id) {
    this.setState({
      dropdownHover: id
    });
  },
  removeHover: function () {
    this.setState({
      dropdownHover: -1
    });
  },
  toggleDropdown: function (event) {
    event.preventDefault();

    this.setState({
      open: !this.state.open
    });
  },
  render: function () {
    var cx = React.addons.classSet;

    var dropdownClass = cx({
      dropdown: true,
      "dropdown--open": this.state.open,
      "dropdown--top": this.state.dropdownHover === 0
    });

    return (React.createElement("div", { className: "navigation" }, React.createElement("ul", { className: "navigation__list" }, React.createElement("li", { className: "navigation__item navigation__item--dropdown" }, React.createElement("a", {
      className: "navigation__link navigation__link--dropdown",
      href: "",
      onClick: this.toggleDropdown }, React.createElement("i", { className: "fa fa-bars fa-fw navigation__icon navigation__icon--dropdown" })), React.createElement("ul", { className: dropdownClass }, React.createElement("li", {
      className: "dropdown__item"
    }, React.createElement(router.linkTo, {
      stateName: "create",
      className: "dropdown__link",
      onMouseOver: this.setHover.bind(this, 0),
      onMouseOut: this.removeHover }, React.createElement("i", { className: "fa fa-plus fa-fw dropdown__icon" }), "Create eCar")), React.createElement("li", { className: "dropdown__item" }, React.createElement(router.linkTo, {
      stateName: "current",
      href: "#", className: "dropdown__link" }, React.createElement("i", { className: "fa fa-list fa-fw dropdown__icon" }), "Current eCars")), React.createElement("li", { className: "dropdown__item" }, React.createElement(router.linkTo, {
      stateName: "reporting",
      className: "dropdown__link" }, React.createElement("i", { className: "fa fa-paperclip fa-fw dropdown__icon" }), "Reporting")), React.createElement("li", { className: "dropdown__item" }, React.createElement(router.linkTo, {
      stateName: "admin",
      className: "dropdown__link" }, React.createElement("i", { className: "fa fa-cog fa-fw dropdown__icon" }), "Administration")))))));
  }
});

exports["default"] = navigation;


},{"../router/router":42}],36:[function(require,module,exports){
"use strict";

var router = require("../router/router")["default"];


var search = React.createClass({ displayName: "search",
  handleSearch: function (event) {
    if (event.keyCode === 13) {
      if (event.target.value.trim() !== "") {
        window.location = "/#/search/" + encodeURIComponent(event.target.value);
      }
      this.override = true;
    }
  },
  override: true,
  handleChange: function (event) {
    this.override = false;
    this.setState({
      searchTerm: event.target.value
    });
  },
  getInitialState: function () {
    return {
      searchTerm: ""
    };
  },
  componentWillMount: function () {
    var _this = this;
    // router.registerCallback( 'default', function ( state ) {
    // 	var query = state.params.query;

    // 	console.log(_this.state.searchTerm, query);

    // 	if( _this.state.searchTerm !== query ) {
    // 		if( _this.override ) {
    // 			_this.setState({
    // 				searchTerm: query
    // 			});
    // 		}
    // 		_this.override = true;
    // 	}
    // } );
  },
  render: function () {
    return (React.createElement("div", { className: "search" }, React.createElement("i", { className: "fa fa-search search__icon" }), React.createElement("input", {
      type: "text",
      placeholder: "Search eCars",
      className: "search__box",
      value: this.state.searchTerm,
      onChange: this.handleChange,
      onKeyDown: this.handleSearch }), React.createElement("span", { className: "search__tip" }, "Press ", React.createElement("span", { className: "search__tip--button" }, "Enter"), " to search")));
  }
});

exports["default"] = search;


},{"../router/router":42}],37:[function(require,module,exports){
"use strict";

var router = require("./router/router.jsx")["default"];


console.log(router);

var create = require("./pages/create.jsx")["default"];
var current = require("./pages/current.jsx").current;
var currentResolve = require("./pages/current.jsx").resolve;
var search = require("./pages/search.jsx")["default"];
var info = require("./pages/info.jsx")["default"];
var admin = require("./pages/admin.jsx")["default"];
var reporting = require("./pages/reporting.jsx")["default"];
var ecar = require("./pages/ecar.jsx")["default"];


router.registerState("create", {
  url: "/create",
  view: create,
  resolve: create.resolve
});

router.registerState("current", {
  url: "/current",
  view: current,
  resolve: currentResolve
});

router.registerState("ecar", {
  url: "/ecar/:workflowId",
  view: ecar,
  resolve: ecar.resolve
});

router.registerState("info", {
  url: "/info",
  view: info
});

router.registerState("reporting", {
  url: "/reporting",
  view: reporting
});

router.registerState("admin", {
  url: "/admin",
  view: admin
});

router.registerState("search", {
  url: "/search/:query",
  optionalParams: ["query"],
  view: search,
  resolve: search.resolve
});

router.otherwise("current");

exports["default"] = router;


},{"./pages/admin.jsx":26,"./pages/create.jsx":27,"./pages/current.jsx":28,"./pages/ecar.jsx":29,"./pages/info.jsx":31,"./pages/reporting.jsx":32,"./pages/search.jsx":33,"./router/router.jsx":42}],38:[function(require,module,exports){
"use strict";

var store = require("../stores/router")["default"];


var actions = {
  changeState: function (name) {
    this.dispatcher.dispatch({
      action: "changeState",
      data: name
    });
  },
  stateChangeStart: function (state) {
    this.dispatcher.dispatch({
      action: "stateChangeStart",
      data: {
        state: state
      }
    });
  },
  stateChangeFinish: function (state, data) {
    this.dispatcher.dispatch({
      action: "stateChangeFinish",
      data: {
        state: state,
        data: data
      }
    });
  },
  statePromiseFinished: function (promise) {
    this.dispatcher.dispatch({
      action: "statePromiseFinished",
      data: promise
    });
  },
  statePromiseFailed: function (promise) {
    this.dispatcher.dispatch({
      action: "statePromiseFailed",
      data: promise
    });
  },
  registerState: function (name, config) {
    this.dispatcher.dispatch({
      action: "registerState",
      data: {
        name: name,
        config: config
      }
    });
  }
};

var actions = store.createActions(actions);

exports["default"] = actions;


},{"../stores/router":43}],39:[function(require,module,exports){
"use strict";

var router = require("../router");

var routerStore = require("../stores/router")["default"];


var linkTo = React.createClass({ displayName: "linkTo",
  componentWillMount: function () {
    var _this = this;

    routerStore.on("stateChangeStart", this.handleStateChange);
  },
  componentWillUnmount: function () {
    routerStore.off("stateChangeStart", this.handleStateChange);
  },
  handleStateChange: function (payload) {
    this.setState({
      active: payload.state.name === this.props.stateName,
      state: payload.state
    });
  },
  getInitialState: function () {
    var states = routerStore.getStates();
    var state = states[this.props.stateName];

    if (state) {
      return {
        href: "#" + state.compiledState.format(this.props.params || {}),
        active: false
      };
    } else {
      throw new Error("State " + this.props.stateName + " does not exist");
    }
  },
  render: function () {
    var href = this.state.href;
    var cx = React.addons.classSet;

    var classes = cx({
      active: this.state.active
    });

    return this.transferPropsTo(React.createElement("a", { href: href, className: classes }, this.props.children));
  }
});

exports["default"] = linkTo;


},{"../router":42,"../stores/router":43}],40:[function(require,module,exports){
"use strict";

var routerStore = require("../stores/router")["default"];


var view = React.createClass({ displayName: "view",
  componentWillMount: function () {
    var _this = this;

    routerStore.on("stateChangeFinish", this.handleStateChange);
  },
  componentWillUnmount: function () {
    routerStore.off("stateChangeFinish", this.handleStateChange);
  },
  handleStateChange: function (payload) {
    var _this = this;
    setTimeout(function () {
      _this.setState({
        currentState: payload.state,
        data: payload.data
      });
    }, 0);
  },
  getInitialState: function () {
    return {
      currentState: {
        view: null
      },
      data: {}
    };
  },
  render: function () {
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

exports["default"] = view;


},{"../stores/router":43}],41:[function(require,module,exports){
"use strict";

var matchFactory = function (url, config) {
  var placeholder = /([:*])(\w+)|\{(\w+)(?:\:((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g;

  config = config || {};

  var compiled = "^";
  var last = 0;
  var m;

  var segments = this.segments = [];
  var params = this.params = {};

  var id, regexp, segment, type, cfg;

  var pattern = url;
  function extend(target, dest) {
    console.log(target, dest);
    for (var i in dest) {
      target[i] = dest[i];
    }

    return target;
  }

  function addParameter(id, type, config) {
    if (!/^\w+(-+\w+)*$/.test(id)) throw new Error("Invalid parameter name '" + id + "' in pattern '" + pattern + "'");
    if (params[id]) throw new Error("Duplicate parameter name '" + id + "' in pattern '" + pattern + "'");

    params[id] = extend({ type: type || new Type(), $value: function (test) {
        return test;
      } }, config);
  }
  function $value(value) {
    /*jshint validthis: true */
    return value ? this.type.decode(value) : $UrlMatcherFactory.$$getDefaultValue(this);
  }

  function quoteRegExp(string, pattern, isOptional) {
    var result = string.replace(/[\\\[\]\^$*+?.()|{}]/g, "\\$&");
    if (!pattern) return result;
    var flag = isOptional ? "?" : "";
    return result + flag + "(" + pattern + ")" + flag;
  }

  function paramConfig(param) {
    if (!config.params || !config.params[param]) return {};
    var cfg = config.params[param];
    return typeof cfg === "object" ? cfg : { value: cfg };
  }

  while ((m = placeholder.exec(pattern))) {
    id = m[2] || m[3]; // IE[78] returns '' for unmatched groups instead of null
    regexp = m[4] || (m[1] == "*" ? ".*" : "[^/]*");
    segment = pattern.substring(last, m.index);
    type = this.$types[regexp] || new Type({ pattern: new RegExp(regexp) });
    cfg = paramConfig(id);

    if (segment.indexOf("?") >= 0) break; // we're into the search part

    compiled += quoteRegExp(segment, type.$subPattern(), cfg && cfg.value);

    addParameter(id, type, cfg);
    segments.push(segment);
    last = placeholder.lastIndex;
  }
  segment = pattern.substring(last);

  var i = segment.indexOf("?");

  if (i >= 0) {
    var search = this.sourceSearch = segment.substring(i);
    segment = segment.substring(0, i);
    this.sourcePath = pattern.substring(0, last + i);

    // Allow parameters to be separated by '?' as well as '&' to make concat() easier
    search.substring(1).split(/[&?]/).forEach(function (key) {});
  } else {
    this.sourcePath = pattern;
    this.sourceSearch = "";
  }

  compiled += quoteRegExp(segment) + (config.strict === false ? "/?" : "") + "$";
  segments.push(segment);

  this.regexp = new RegExp(compiled, config.caseInsensitive ? "i" : undefined);
  this.prefix = segments[0];
};

matchFactory.prototype.exec = function (path, searchParams) {
  var m = this.regexp.exec(path);
  if (!m) return null;
  searchParams = searchParams || {};

  var params = this.parameters(), nTotal = params.length, nPath = this.segments.length - 1, values = {}, i, cfg, param;

  if (nPath !== m.length - 1) throw new Error("Unbalanced capture group in route '" + this.source + "'");

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

matchFactory.prototype.validates = function (params) {
  var result = true, isOptional, cfg, self = this;

  for (var key in params) {
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

  if (!values) return segments.join("").replace("//", "/");

  var nPath = segments.length - 1, nTotal = params.length, result = segments[0], i, search, value, param, cfg, array;

  if (!this.validates(values)) return "";

  for (i = 0; i < nPath; i++) {
    param = params[i];
    value = values[param];
    cfg = this.params[param];

    if (!value && (segments[i] === "/" && segments[i + 1] === "/")) continue;
    if (value != null) result += encodeURIComponent(value);
    result += segments[i + 1];
  }

  for (; i < nTotal; i++) {
    param = params[i];
    value = values[param];
    if (value == null) continue;
    array = typeof value === "array";

    if (array) {
      value = value.map(encodeURIComponent).join("&" + param + "=");
    }
    result += (search ? "&" : "?") + param + "=" + (array ? value : encodeURIComponent(value));
    search = true;
  }
  return result.replace("//", "/");
};

matchFactory.prototype.parameters = function (param) {
  if (!param) return Object.keys(this.params);
  return this.params[param] || null;
};


matchFactory.prototype.$types = {};

function Type(config) {
  for (var i in config) {
    this[i] = config[i];
  }
}

Type.prototype.$subPattern = function () {
  var sub = this.pattern.toString();
  return sub.substr(1, sub.length - 2);
};


module.exports = matchFactory;


},{}],42:[function(require,module,exports){
"use strict";

/*
	Components
 */

var matchFactory = require("./matchFactory");

var linkTo = require("./components/linkTo")["default"];
var view = require("./components/view")["default"];
var routerActions = require("./actions/router")["default"];
var routerStore = require("./stores/router")["default"];


var router = {};

router.states = {};
router.fallbackState = "";

router.registerState = function (name, config) {
  var compiledState = new matchFactory(config.url);

  var newState = config;
  newState.name = name;
  newState.compiledState = compiledState;

  this.states[name] = newState;

  routerActions.registerState(name, config);
};

router.otherwise = function (stateName) {
  this.fallbackState = this.states[stateName];
};

router.changeState = function (state) {
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

  promise.then(function (data) {
    var dataToPass = {};

    if (state.resolve) {
      data.forEach(function (response, index) {
        var key = resolveKeys[index];
        dataToPass[key] = response;
      });
    }

    routerActions.stateChangeFinish(state, dataToPass);
  });
};

router.handleStateChange = function () {
  var url = window.location.hash.replace("#", "");

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

exports["default"] = router;


},{"./actions/router":38,"./components/linkTo":39,"./components/view":40,"./matchFactory":41,"./stores/router":43}],43:[function(require,module,exports){
"use strict";

var store = require("../../flux/store");
var dispatcher = require("../../dispatchers/ecar");

var routerStore = new store({
  dispatcher: dispatcher
});

routerStore.currentState = {};
routerStore.states = {};

routerStore.registerHandlers({
  changeState: function (payload) {
    this.emit("changeState", payload);
  },
  registerState: function (payload) {
    this.states[payload.name] = payload.config;
    this.emit("stateAdded", payload);
  },
  stateChangeFinish: function (payload) {
    this.currentState = payload;
    this.emit("stateChangeFinish", payload);
  },
  stateChangeStart: function (payload) {
    this.currentState = payload;
    this.emit("stateChangeStart", payload);
  },
  statePromiseFinished: function (payload) {
    this.emit("statePromiseFinished", payload);
  }
});

routerStore.getCurrentState = function () {
  return this.currentState;
};

routerStore.getStates = function () {
  return this.states;
};

exports["default"] = routerStore;


},{"../../dispatchers/ecar":17,"../../flux/store":20}],44:[function(require,module,exports){
"use strict";

var store = require("../flux/store");
var dispatcher = require("../dispatchers/ecar");

var alertStore = new store({
  dispatcher: dispatcher
});

alertStore.open = false;
alertStore.config = {};

alertStore.registerHandlers({
  openAlert: function (config) {
    this.open = true;
    this.config = config;

    this.emit("toggleAlert");
  },
  closeAlert: function () {
    this.open = false;
    this.emit("toggleAlert");
  }
});

var store = alertStore;

exports["default"] = store;


},{"../dispatchers/ecar":17,"../flux/store":20}],45:[function(require,module,exports){
"use strict";

var store = require("../flux/store");
var dispatcher = require("../dispatchers/ecar");

var appStore = new store({
  dispatcher: dispatcher
});

appStore.frozen = false;
appStore.top = 0;

appStore.registerHandlers({
  freeze: function () {
    this.frozen = true;
    this.top = -document.body.scrollTop;
    this.emit("frozenUpdate", true);
  },
  unfreeze: function () {
    this.frozen = false;
    this.emit("frozenUpdate", false);
    window.scrollTo(0, -this.top);
  }
});

var store = appStore;

exports["default"] = store;


},{"../dispatchers/ecar":17,"../flux/store":20}],46:[function(require,module,exports){
"use strict";

var store = require("../flux/store");
var dispatcher = require("../dispatchers/ecar");

var blockStore = new store({
  dispatcher: dispatcher
});

blockStore.open = ["capacityPlanning"];
blockStore.visibile = ["capacityPlanning"];

blockStore.registerHandlers({
  toggleBlock: function (payload) {
    this.open = payload;
    this.emit("blockToggled", payload);
  },
  setVisible: function (payload) {
    this.visibile = payload;
    this.emit("blockVisibility", payload);
  }
});

blockStore.getOpen = function () {
  return this.open;
};

blockStore.getVisible = function () {
  return this.visibile;
};

var store = blockStore;

exports["default"] = store;


},{"../dispatchers/ecar":17,"../flux/store":20}],47:[function(require,module,exports){
"use strict";

var store = require("../flux/store");
var dispatcher = require("../dispatchers/ecar");

var currentStore = new store({
  dispatcher: dispatcher
});

currentStore.payload = [];

currentStore.registerHandlers({
  setSelected: function (payload) {
    this.payload = payload;
    this.emit("selectItem", payload);
  }
});

currentStore.getSelected = function () {
  return this.payload;
};

var store = currentStore;
exports["default"] = store;


},{"../dispatchers/ecar":17,"../flux/store":20}],48:[function(require,module,exports){
"use strict";

module.exports = function (type, url, params, content, headers) {
  var request = new XMLHttpRequest();
  var deferred = Q.defer();

  var str = "";
  if (params) {
    for (var key in params) {
      if (str != "") {
        str += "&";
      }
      str += key + "=" + params[key];
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
  request.send(content || "");

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


},{}]},{},[1])