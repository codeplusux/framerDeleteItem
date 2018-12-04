require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"TabBar":[function(require,module,exports){
var RippleButton, TabContent,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

RippleButton = (function(superClass) {
  extend(RippleButton, superClass);

  function RippleButton(options) {
    this.options = options != null ? options : {};
    _.defaults(this.options, {
      backgroundColor: "white",
      rippleColor: void 0,
      rippleOptions: {
        time: 0.25,
        curve: Bezier.easeOut
      },
      triggerOnClick: true
    });
    RippleButton.__super__.constructor.call(this, this.options);
    if (this.rippleColor === void 0) {
      this.rippleColor = this.backgroundColor.darken(10);
    }
    this._clipper = new Layer({
      size: this.size,
      parent: this,
      clip: true,
      backgroundColor: ""
    });
    this._ripple = new Layer({
      name: "ripple",
      borderRadius: "50%",
      backgroundColor: this.rippleColor,
      parent: this._clipper,
      size: 0
    });
    this.on("change:size", function() {
      return this._clipper.size = this.size;
    });
    this._clipper.onClick((function(_this) {
      return function(event, target) {
        if (_this.triggerOnClick === true) {
          return _this.sendRipple(event, target);
        }
      };
    })(this));
  }

  RippleButton.prototype.sendRipple = function(event, target) {
    var clickPoint, fadeAnimation, r, radius, rippleAnimation;
    clickPoint = target.convertPointToLayer(event.point, target);
    r = this.selectChild("ripple");
    r.size = Math.min(this.width, this.height) / 10;
    r.midX = clickPoint.x;
    r.midY = clickPoint.y;
    r.opacity = 1;
    radius = this._longestRadius(clickPoint, this);
    rippleAnimation = new Animation(r, {
      size: radius * 2,
      x: clickPoint.x - radius,
      y: clickPoint.y - radius,
      options: this.rippleOptions
    });
    fadeAnimation = new Animation(r, {
      opacity: 0,
      options: {
        time: rippleAnimation.options.time * 2.5,
        curve: rippleAnimation.options.curve
      }
    });
    rippleAnimation.restart();
    return fadeAnimation.restart();
  };

  RippleButton.prototype._longestRadius = function(point, layer) {
    var pointToLowerLeft, pointToLowerRight, pointToUpperLeft, pointToUpperRight;
    pointToUpperLeft = Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2));
    pointToUpperRight = Math.sqrt(Math.pow(layer.width - point.x, 2) + Math.pow(point.y, 2));
    pointToLowerLeft = Math.sqrt(Math.pow(point.x, 2) + Math.pow(layer.height - point.y, 2));
    pointToLowerRight = Math.sqrt(Math.pow(layer.width - point.x, 2) + Math.pow(layer.height - point.y, 2));
    return Math.max(pointToUpperLeft, pointToUpperRight, pointToLowerLeft, pointToLowerRight);
  };

  RippleButton.define("rippleOptions", {
    get: function() {
      return this.options.rippleOptions;
    },
    set: function(value) {
      return this.options.rippleOptions = value;
    }
  });

  RippleButton.define("rippleColor", {
    get: function() {
      return this.options.rippleColor;
    },
    set: function(value) {
      return this.options.rippleColor = value;
    }
  });

  RippleButton.define("triggerOnClick", {
    get: function() {
      return this.options.triggerOnClick;
    },
    set: function(value) {
      return this.options.triggerOnClick = value;
    }
  });

  return RippleButton;

})(Layer);

TabContent = (function(superClass) {
  extend(TabContent, superClass);

  function TabContent(options) {
    this.options = options != null ? options : {};
    _.defaults(this.options, {
      backgroundColor: "",
      name: "TabContent",
      clip: true
    });
    TabContent.__super__.constructor.call(this, this.options);
    this.currentPageIndex = void 0;
    this.priorPageIndex = void 0;
    this.pages = [];
    this.onSwipeRightStart(function() {
      return this._selectPreviousPage();
    });
    this.onSwipeLeftStart(function() {
      return this._selectNextPage();
    });
    this.on("change:size", function() {
      return this.layoutPages();
    });
  }

  TabContent.prototype.addPage = function(page) {
    this.pages.push(page);
    page.parent = this;
    page.animationOptions = this.animationOptions;
    page.point = {
      x: -page.width,
      y: 0
    };
    return this.layoutPages();
  };

  TabContent.prototype.layoutPages = Utils.debounce(0.01, function() {
    var i, j, len, page, ref, results;
    ref = this.pages;
    results = [];
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      page = ref[i];
      page.size = this.size;
      if (this.tabBar.selectedTabIndex === i) {
        page.x = 0;
        results.push(this.currentPageIndex = i);
      } else {
        results.push(page.x = -page.width);
      }
    }
    return results;
  });

  TabContent.prototype._selectNextPage = function() {
    if (this.currentPageIndex + 1 < this.pages.length) {
      return this.tabBar.selectTab(this.currentPageIndex + 1);
    }
  };

  TabContent.prototype._selectPreviousPage = function() {
    if (this.currentPageIndex > 0) {
      return this.tabBar.selectTab(this.currentPageIndex - 1);
    }
  };

  TabContent.prototype.selectPage = function(index) {
    var currentLayer, priorLayer;
    if (index === this.currentPageIndex) {
      return;
    }
    currentLayer = this.pages[index];
    priorLayer = this.pages[this.currentPageIndex];
    if (index > this.currentPageIndex) {
      currentLayer.x = Screen.width;
      priorLayer.animate({
        x: -priorLayer.width
      });
      currentLayer.animate({
        x: 0
      });
    } else if (index < this.currentPageIndex) {
      currentLayer.x = -currentLayer.width;
      priorLayer.animate({
        x: Screen.width
      });
      currentLayer.animate({
        x: 0
      });
    }
    this.priorPageIndex = this.currentPageIndex;
    this.currentPageIndex = index;
    return this.emit("change:page", {
      index: this.currentPageIndex,
      layer: this.pages[this.currentPageIndex]
    }, {
      index: this.priorPageIndex,
      layer: this.pages[this.priorPageIndex]
    });
  };

  TabContent.define("currentPage", {
    get: function() {
      return this.pages[this.currentPageIndex];
    }
  });

  return TabContent;

})(Layer);

exports.TabBar = (function(superClass) {
  extend(TabBar, superClass);

  function TabBar(options) {
    var rippleColor;
    this.options = options != null ? options : {};
    _.defaults(this.options, {
      tabLabels: ["TAB ONE", "TAB TWO", "TAB THREE"],
      width: Screen.width,
      height: 46,
      font: Utils.loadWebFont("Roboto"),
      fontSize: 14,
      ripple: true
    }, rippleColor = void 0, {
      selectedColor: "#EC7000",
      deselectedColor: "#252220",
      selectedTabIndex: 0,
      minimumPadding: 10,
      firstLastTabInset: 5,
      backgroundColor: "#fff",
      animationOptions: {
        time: 0.275,
        curve: Bezier.ease
      }
    });
    TabBar.__super__.constructor.call(this, this.options);
    this.scrollVertical = false;
    this.tabBar = new Layer({
      x: 0,
      name: "tabBar",
      height: this.height,
      parent: this.content,
      backgroundColor: ""
    });
    this.tabSelectionLine = new Layer({
      name: "tabSelectionLine",
      height: 2,
      width: 0,
      backgroundColor: "#EC7000",
      y: this.tabBar.height - 2,
      animationOptions: this.animationOptions,
      parent: this.tabBar
    });
    this.currentTab = void 0;
    this.priorTab = void 0;
    this.tabs = [];
    this.on("change:width", function() {
      return this.layoutTabs();
    });
    this._createTabs();
  }

  TabBar.prototype.createTabContent = function() {
    var tcp;
    tcp = new TabContent({
      width: Screen.width,
      height: 380,
      y: 230,
      animationOptions: this.animationOptions,
      parent: record
    });
    tcp.tabBar = this;
    return tcp;
  };

  TabBar.prototype._createTabs = function() {
    var i, j, k, label, len, len1, props, ref, ref1, tab, tabLabel;
    ref = this.tabs;
    for (j = 0, len = ref.length; j < len; j++) {
      tab = ref[j];
      tab.parent = null;
      tab.destroy();
    }
    this.tabs = [];
    this._labelWidths = [];
    ref1 = this.tabLabels;
    for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
      label = ref1[i];
      tabLabel = new TextLayer({
        name: "label",
        font: this.font,
        fontSize: this.fontSize,
        color: this.deselectedColor,
        textAlign: "center",
        text: label,
        animationOptions: this.animationOptions
      });
      props = {
        name: "tab_" + i,
        height: this.tabBar.height,
        backgroundColor: this.backgroundColor,
        parent: this.tabBar,
        animationOptions: this.animationOptions
      };
      if (this.options.ripple === true) {
        tab = new RippleButton(props);
        tab.triggerOnClick = false;
      } else {
        tab = new Layer(props);
      }
      this.tabs.push(tab);
      tabLabel.parent = tab;
      this._labelWidths.push(tabLabel.width);
      tab.onClick((function(_this) {
        return function(event, target) {
          if (_this.currentTab !== target) {
            if (target.constructor.name === "RippleButton") {
              target.sendRipple(event, target);
            }
            return _this.selectTab(target);
          }
        };
      })(this));
    }
    return this.layoutTabs();
  };

  TabBar.prototype._scrollToSelectedTab = function(animated) {
    var newScrollX;
    if (animated == null) {
      animated = true;
    }
    if (this.currentTab === void 0) {
      return;
    }
    newScrollX = Math.max(0, Math.min(this.currentTab.x + this.currentTab.width / 2 - this.width / 2, this.tabBar.width - this.width));
    if (animated) {
      return this.animate({
        scrollX: newScrollX
      });
    } else {
      return this.scrollX = newScrollX;
    }
  };

  TabBar.prototype.layoutTabs = function() {
    var extraWidthPerTab, i, j, k, len, ref, ref1, runningLeft, width, widthOfAllTabs;
    widthOfAllTabs = 0;
    ref = this._labelWidths;
    for (j = 0, len = ref.length; j < len; j++) {
      width = ref[j];
      widthOfAllTabs += width + this.minimumPadding * 2;
    }
    if (widthOfAllTabs >= this.width - this.contentInset.left - this.contentInset.right) {
      this.tabBar.width = widthOfAllTabs + this.firstLastTabInset * 2;
      this.content.draggable.overdrag = true;
      extraWidthPerTab = 0;
    } else {
      this.tabBar.width = this.width;
      this.content.draggable.overdrag = false;
      extraWidthPerTab = Math.round((this.tabBar.width - widthOfAllTabs - this.firstLastTabInset * 2) / this.tabs.length);
    }
    runningLeft = this.firstLastTabInset;
    for (i = k = 0, ref1 = this._labelWidths.length; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
      this.tabs[i].x = runningLeft;
      this.tabs[i].width = this._labelWidths[i] + extraWidthPerTab + this.minimumPadding * 2;
      this.tabs[i].selectChild("label").width = this.tabs[i].width;
      this.tabs[i].selectChild("label").point = Align.center;
      runningLeft += this.tabs[i].width;
    }
    this.selectTab(this.selectedTabIndex, false, true);
    this.tabSelectionLine.bringToFront();
    return this.updateContent();
  };

  TabBar.prototype.selectTab = function(value, animated, forceSelection) {
    var layer, ref, ref1, ref2, ref3, selectedLineProps;
    if (animated == null) {
      animated = true;
    }
    if (forceSelection == null) {
      forceSelection = false;
    }
    if (Utils.inspectObjectType(value) !== "Number") {
      layer = value;
    } else {
      layer = this.tabs[value];
    }
    if (layer === this.currentTab && !forceSelection) {
      return;
    }
    this.options.selectedTabIndex = _.indexOf(this.tabs, layer);
    selectedLineProps = {
      width: layer.width,
      x: layer.x
    };
    if (animated) {
      this.tabSelectionLine.animate(selectedLineProps);
      layer.selectChild("label").animate({
        color: this.selectedColor
      });
    } else {
      this.tabSelectionLine.props = selectedLineProps;
      layer.selectChild("label").color = this.selectedColor;
    }
    if (!forceSelection) {
      this.priorTab = this.currentTab;
    }
    if (animated) {
      if ((ref = this.priorTab) != null) {
        ref.selectChild("label").animate({
          color: this.deselectedColor
        });
      }
    } else {
      if ((ref1 = this.priorTab) != null) {
        ref1.selectChild("label").color = this.deselectedColor;
      }
    }
    this.currentTab = layer;
    this._scrollToSelectedTab(animated);
    if (!forceSelection) {
      if ((ref2 = this._tabContent) != null) {
        ref2.selectPage(this.options.selectedTabIndex);
      }
      this.emit("change:tab", {
        index: this.selectedTabIndex,
        layer: layer,
        text: this.currentTab.selectChild("label").text
      }, {
        index: _.indexOf(this.tabs, this.priorTab),
        layer: this.priorTab,
        text: (ref3 = this.priorTab) != null ? ref3.selectChild("label").text : void 0
      });
    }
    return layer;
  };

  TabBar.define("newTab", {
    get: function() {
      var button;
      if (this.options.ripple === true) {
        return button = new RippleButton;
      } else {
        return button = new Layer;
      }
    }
  });

  TabBar.define("tabContent", {
    get: function() {
      if (this._tabContent === void 0) {
        return this._tabContent = this.createTabContent();
      } else {
        return this._tabContent;
      }
    }
  });

  TabBar.define("minimumPadding", {
    get: function() {
      return this.options.minimumPadding;
    },
    set: function(value) {
      if (this.__framerInstanceInfo != null) {
        this.options.minimumPadding = value;
        return this.layoutTabs();
      }
    }
  });

  TabBar.define("firstLastTabInset", {
    get: function() {
      return this.options.firstLastTabInset;
    },
    set: function(value) {
      if (this.__framerInstanceInfo != null) {
        this.options.firstLastTabInset = value;
        return this.layoutTabs();
      }
    }
  });

  TabBar.define("tabLabels", {
    get: function() {
      return this.options.tabLabels;
    },
    set: function(value) {
      if (this.__framerInstanceInfo != null) {
        this.options.selectedTabIndex = Math.min(this.selectedTabIndex, value.length - 1);
        this.options.tabLabels = value;
        return this._createTabs();
      }
    }
  });

  TabBar.define("selectedTabIndex", {
    get: function() {
      return this.options.selectedTabIndex;
    },
    set: function(value) {
      if (this.__framerInstanceInfo != null) {
        this.options.selectedTabIndex = value;
        return this.selectTab(value);
      }
    }
  });

  TabBar.define("font", {
    get: function() {
      return this.options.font;
    }
  });

  TabBar.define("fontSize", {
    get: function() {
      return this.options.fontSize;
    }
  });

  TabBar.define("selectedColor", {
    get: function() {
      return this.options.selectedColor;
    }
  });

  TabBar.define("deselectedColor", {
    get: function() {
      return this.options.deselectedColor;
    }
  });

  return TabBar;

})(ScrollComponent);


},{}],"input":[function(require,module,exports){
var wrapInput,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Events.EnterKey = "EnterKey";

Events.SpaceKey = "SpaceKey";

Events.BackspaceKey = "BackspaceKey";

Events.CapsLockKey = "CapsLockKey";

Events.ShiftKey = "ShiftKey";

Events.ValueChange = "ValueChange";

Events.InputFocus = "InputFocus";

Events.InputBlur = "InputBlur";

exports.InputLayer = (function(superClass) {
  extend(InputLayer, superClass);

  function InputLayer(options) {
    var base, currentValue, property, textProperties, value;
    if (options == null) {
      options = {};
    }
    this._setTextProperties = bind(this._setTextProperties, this);
    this._setPlaceholder = bind(this._setPlaceholder, this);
    _.defaults(options, {
      backgroundColor: "#FFF",
      width: 375,
      height: 60,
      padding: {
        left: 20
      },
      text: "Type something...",
      fontSize: 40,
      fontWeight: 300
    });
    if (options.multiLine) {
      if ((base = options.padding).top == null) {
        base.top = 20;
      }
    }
    this._inputElement = document.createElement("input");
    this._inputElement.style.position = "absolute";
    InputLayer.__super__.constructor.call(this, options);
    this._background = void 0;
    this._placeholder = void 0;
    this._isDesignLayer = false;
    this.input = new Layer({
      backgroundColor: "transparent",
      name: "input",
      width: this.width,
      height: this.height,
      parent: this
    });
    if (this.multiLine) {
      this._inputElement = document.createElement("textarea");
    }
    this.input._element.appendChild(this._inputElement);
    this._setTextProperties(this);
    this._inputElement.autocomplete = "off";
    this._inputElement.autocorrect = "off";
    this._inputElement.spellcheck = false;
    this._inputElement.className = "input" + this.id;
    textProperties = {
      text: this.text,
      fontFamily: this.fontFamily,
      fontSize: this.fontSize,
      lineHeight: this.lineHeight,
      fontWeight: this.fontWeight,
      color: this.color,
      backgroundColor: this.backgroundColor,
      width: this.width,
      height: this.height,
      padding: this.padding,
      parent: this.parent
    };
    for (property in textProperties) {
      value = textProperties[property];
      this.on("change:" + property, (function(_this) {
        return function(value) {
          _this._elementHTML.children[0].textContent = "";
          if (_this._isDesignLayer) {
            return;
          }
          _this._setTextProperties(_this);
          return _this._setPlaceholderColor(_this._id, _this.color);
        };
      })(this));
    }
    this._setPlaceholder(this.text);
    this._setPlaceholderColor(this._id, this.color);
    this._elementHTML.children[0].textContent = "";
    this._isFocused = false;
    this._inputElement.onfocus = (function(_this) {
      return function(e) {
        if (_this.focusColor == null) {
          _this.focusColor = "#000";
        }
        _this.emit(Events.InputFocus, event);
        return _this._isFocused = true;
      };
    })(this);
    this._inputElement.onblur = (function(_this) {
      return function(e) {
        _this.emit(Events.InputBlur, event);
        return _this._isFocused = false;
      };
    })(this);
    currentValue = void 0;
    this._inputElement.onkeydown = (function(_this) {
      return function(e) {
        currentValue = _this.value;
        if (e.which === 20) {
          _this.emit(Events.CapsLockKey, event);
        }
        if (e.which === 16) {
          return _this.emit(Events.ShiftKey, event);
        }
      };
    })(this);
    this._inputElement.onkeyup = (function(_this) {
      return function(e) {
        if (currentValue !== _this.value) {
          _this.emit("change:value", _this.value);
          _this.emit(Events.ValueChange, _this.value);
        }
        if (e.which === 13) {
          _this.emit(Events.EnterKey, event);
        }
        if (e.which === 8) {
          _this.emit(Events.BackspaceKey, event);
        }
        if (e.which === 32) {
          _this.emit(Events.SpaceKey, event);
        }
        if (e.which === 20) {
          return _this.emit(Events.CapsLockKey, event);
        }
      };
    })(this);
  }

  InputLayer.prototype._setPlaceholder = function(text) {
    return this._inputElement.placeholder = text;
  };

  InputLayer.prototype._setPlaceholderColor = function(id, color) {
    return document.styleSheets[0].addRule(".input" + id + "::-webkit-input-placeholder", "color: " + color);
  };

  InputLayer.prototype._checkDevicePixelRatio = function() {
    var dpr, ratio;
    ratio = Screen.width / Framer.Device.screen.width;
    if (Utils.isDesktop()) {
      if (ratio < 0.5 && ratio > 0.25) {
        dpr = 1 - ratio;
      } else if (ratio === 0.25) {
        dpr = 1 - (ratio * 2);
      } else {
        dpr = Utils.devicePixelRatio();
      }
      if (Framer.Device.deviceType === "fullscreen") {
        dpr = 2;
      }
    } else {
      if (ratio < 0.5 && ratio > 0.25) {
        dpr = 1 - ratio;
      } else if (ratio === 0.25) {
        dpr = 1 - (ratio * 2);
      } else if (ratio === 0.5) {
        dpr = 1;
      }
    }
    return dpr;
  };

  InputLayer.prototype._setTextProperties = function(layer) {
    var dpr, ref;
    dpr = this._checkDevicePixelRatio();
    if (!this._isDesignLayer) {
      this._inputElement.style.fontFamily = layer.fontFamily;
      this._inputElement.style.fontSize = (layer.fontSize / dpr) + "px";
      this._inputElement.style.fontWeight = (ref = layer.fontWeight) != null ? ref : "normal";
      this._inputElement.style.paddingTop = (layer.padding.top * 2 / dpr) + "px";
      this._inputElement.style.paddingRight = (layer.padding.bottom * 2 / dpr) + "px";
      this._inputElement.style.paddingBottom = (layer.padding.right * 2 / dpr) + "px";
      this._inputElement.style.paddingLeft = (layer.padding.left * 2 / dpr) + "px";
    }
    this._inputElement.style.width = ((layer.width - layer.padding.left * 2) * 2 / dpr) + "px";
    this._inputElement.style.height = (layer.height * 2 / dpr) + "px";
    this._inputElement.style.outline = "none";
    this._inputElement.style.backgroundColor = "transparent";
    this._inputElement.style.cursor = "auto";
    this._inputElement.style.webkitAppearance = "none";
    this._inputElement.style.resize = "none";
    this._inputElement.style.overflow = "hidden";
    return this._inputElement.style.webkitFontSmoothing = "antialiased";
  };

  InputLayer.prototype.addBackgroundLayer = function(layer) {
    this._background = layer;
    this._background.parent = this;
    this._background.name = "background";
    this._background.x = this._background.y = 0;
    this._background._element.appendChild(this._inputElement);
    return this._background;
  };

  InputLayer.prototype.addPlaceHolderLayer = function(layer) {
    var dpr;
    this._isDesignLayer = true;
    this._inputElement.className = "input" + layer.id;
    this.padding = {
      left: 0,
      top: 0
    };
    this._setPlaceholder(layer.text);
    this._setTextProperties(layer);
    this._setPlaceholderColor(layer.id, layer.color);
    this.on("change:color", (function(_this) {
      return function() {
        return _this._setPlaceholderColor(layer.id, _this.color);
      };
    })(this));
    layer.visible = false;
    this._elementHTML.children[0].textContent = "";
    dpr = this._checkDevicePixelRatio();
    this._inputElement.style.fontSize = (layer.fontSize * 2 / dpr) + "px";
    this._inputElement.style.paddingTop = (layer.y * 2 / dpr) + "px";
    this._inputElement.style.paddingLeft = (layer.x * 2 / dpr) + "px";
    this._inputElement.style.width = ((this._background.width - layer.x * 2) * 2 / dpr) + "px";
    if (this.multiLine) {
      this._inputElement.style.height = (this._background.height * 2 / dpr) + "px";
    }
    this.on("change:padding", (function(_this) {
      return function() {
        _this._inputElement.style.paddingTop = (_this.padding.top * 2 / dpr) + "px";
        return _this._inputElement.style.paddingLeft = (_this.padding.left * 2 / dpr) + "px";
      };
    })(this));
    return this._placeholder;
  };

  InputLayer.prototype.focus = function() {
    return this._inputElement.focus();
  };

  InputLayer.define("value", {
    get: function() {
      return this._inputElement.value;
    },
    set: function(value) {
      return this._inputElement.value = value;
    }
  });

  InputLayer.define("focusColor", {
    get: function() {
      return this._inputElement.style.color;
    },
    set: function(value) {
      return this._inputElement.style.color = value;
    }
  });

  InputLayer.define("multiLine", InputLayer.simpleProperty("multiLine", false));

  InputLayer.wrap = function(background, placeholder, options) {
    return wrapInput(new this(options), background, placeholder, options);
  };

  InputLayer.prototype.onEnterKey = function(cb) {
    return this.on(Events.EnterKey, cb);
  };

  InputLayer.prototype.onSpaceKey = function(cb) {
    return this.on(Events.SpaceKey, cb);
  };

  InputLayer.prototype.onBackspaceKey = function(cb) {
    return this.on(Events.BackspaceKey, cb);
  };

  InputLayer.prototype.onCapsLockKey = function(cb) {
    return this.on(Events.CapsLockKey, cb);
  };

  InputLayer.prototype.onShiftKey = function(cb) {
    return this.on(Events.ShiftKey, cb);
  };

  InputLayer.prototype.onValueChange = function(cb) {
    return this.on(Events.ValueChange, cb);
  };

  InputLayer.prototype.onInputFocus = function(cb) {
    return this.on(Events.InputFocus, cb);
  };

  InputLayer.prototype.onInputBlur = function(cb) {
    return this.on(Events.InputBlur, cb);
  };

  return InputLayer;

})(TextLayer);

wrapInput = function(instance, background, placeholder) {
  var input, ref;
  if (!(background instanceof Layer)) {
    throw new Error("InputLayer expects a background layer.");
  }
  if (!(placeholder instanceof TextLayer)) {
    throw new Error("InputLayer expects a text layer.");
  }
  input = instance;
  if (input.__framerInstanceInfo == null) {
    input.__framerInstanceInfo = {};
  }
  if ((ref = input.__framerInstanceInfo) != null) {
    ref.name = instance.constructor.name;
  }
  input.frame = background.frame;
  input.parent = background.parent;
  input.index = background.index;
  input.addBackgroundLayer(background);
  input.addPlaceHolderLayer(placeholder);
  return input;
};


},{}],"myModule":[function(require,module,exports){
exports.myVar = "myVariable";

exports.myFunction = function() {
  return print("myFunction is running");
};

exports.myArray = [1, 2, 3];


},{}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1VzZXJzL3BhYmxvLnZpdmFuY28vRGVza3RvcC9EZXZlbG9wbWVudC9mcmFtZXIvZGVsZXRlT3ZlcmxheS5mcmFtZXIvbW9kdWxlcy9teU1vZHVsZS5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9wYWJsby52aXZhbmNvL0Rlc2t0b3AvRGV2ZWxvcG1lbnQvZnJhbWVyL2RlbGV0ZU92ZXJsYXkuZnJhbWVyL21vZHVsZXMvaW5wdXQuY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvcGFibG8udml2YW5jby9EZXNrdG9wL0RldmVsb3BtZW50L2ZyYW1lci9kZWxldGVPdmVybGF5LmZyYW1lci9tb2R1bGVzL1RhYkJhci5jb2ZmZWUiLCJub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiMgQWRkIHRoZSBmb2xsb3dpbmcgbGluZSB0byB5b3VyIHByb2plY3QgaW4gRnJhbWVyIFN0dWRpby4gXG4jIG15TW9kdWxlID0gcmVxdWlyZSBcIm15TW9kdWxlXCJcbiMgUmVmZXJlbmNlIHRoZSBjb250ZW50cyBieSBuYW1lLCBsaWtlIG15TW9kdWxlLm15RnVuY3Rpb24oKSBvciBteU1vZHVsZS5teVZhclxuXG5leHBvcnRzLm15VmFyID0gXCJteVZhcmlhYmxlXCJcblxuZXhwb3J0cy5teUZ1bmN0aW9uID0gLT5cblx0cHJpbnQgXCJteUZ1bmN0aW9uIGlzIHJ1bm5pbmdcIlxuXG5leHBvcnRzLm15QXJyYXkgPSBbMSwgMiwgM10iLCJFdmVudHMuRW50ZXJLZXkgPSBcIkVudGVyS2V5XCJcbkV2ZW50cy5TcGFjZUtleSA9IFwiU3BhY2VLZXlcIlxuRXZlbnRzLkJhY2tzcGFjZUtleSA9IFwiQmFja3NwYWNlS2V5XCJcbkV2ZW50cy5DYXBzTG9ja0tleSA9IFwiQ2Fwc0xvY2tLZXlcIlxuRXZlbnRzLlNoaWZ0S2V5ID0gXCJTaGlmdEtleVwiXG5FdmVudHMuVmFsdWVDaGFuZ2UgPSBcIlZhbHVlQ2hhbmdlXCJcbkV2ZW50cy5JbnB1dEZvY3VzID0gXCJJbnB1dEZvY3VzXCJcbkV2ZW50cy5JbnB1dEJsdXIgPSBcIklucHV0Qmx1clwiXG5cbmNsYXNzIGV4cG9ydHMuSW5wdXRMYXllciBleHRlbmRzIFRleHRMYXllclxuXG5cdGNvbnN0cnVjdG9yOiAob3B0aW9ucz17fSkgLT5cblxuXHRcdF8uZGVmYXVsdHMgb3B0aW9ucyxcblx0XHRcdGJhY2tncm91bmRDb2xvcjogXCIjRkZGXCJcblx0XHRcdHdpZHRoOiAzNzVcblx0XHRcdGhlaWdodDogNjBcblx0XHRcdHBhZGRpbmc6XG5cdFx0XHRcdGxlZnQ6IDIwXG5cdFx0XHR0ZXh0OiBcIlR5cGUgc29tZXRoaW5nLi4uXCJcblx0XHRcdGZvbnRTaXplOiA0MFxuXHRcdFx0Zm9udFdlaWdodDogMzAwXG5cblx0XHRpZiBvcHRpb25zLm11bHRpTGluZVxuXHRcdFx0b3B0aW9ucy5wYWRkaW5nLnRvcCA/PSAyMFxuXG5cdFx0QF9pbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIilcblx0XHRAX2lucHV0RWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIlxuXG5cdFx0c3VwZXIgb3B0aW9uc1xuXG5cdFx0IyBHbG9iYWxzXG5cdFx0QF9iYWNrZ3JvdW5kID0gdW5kZWZpbmVkXG5cdFx0QF9wbGFjZWhvbGRlciA9IHVuZGVmaW5lZFxuXHRcdEBfaXNEZXNpZ25MYXllciA9IGZhbHNlXG5cblx0XHQjIExheWVyIGNvbnRhaW5pbmcgaW5wdXQgZWxlbWVudFxuXHRcdEBpbnB1dCA9IG5ldyBMYXllclxuXHRcdFx0YmFja2dyb3VuZENvbG9yOiBcInRyYW5zcGFyZW50XCJcblx0XHRcdG5hbWU6IFwiaW5wdXRcIlxuXHRcdFx0d2lkdGg6IEB3aWR0aFxuXHRcdFx0aGVpZ2h0OiBAaGVpZ2h0XG5cdFx0XHRwYXJlbnQ6IEBcblxuXHRcdCMgVGV4dCBhcmVhXG5cdFx0aWYgQG11bHRpTGluZVxuXHRcdFx0QF9pbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGV4dGFyZWFcIilcblxuXHRcdCMgQXBwZW5kIGVsZW1lbnRcblx0XHRAaW5wdXQuX2VsZW1lbnQuYXBwZW5kQ2hpbGQoQF9pbnB1dEVsZW1lbnQpXG5cblx0XHQjIE1hdGNoIFRleHRMYXllciBkZWZhdWx0cyBhbmQgdHlwZSBwcm9wZXJ0aWVzXG5cdFx0QF9zZXRUZXh0UHJvcGVydGllcyhAKVxuXG5cdFx0IyBTZXQgYXR0cmlidXRlc1xuXHRcdEBfaW5wdXRFbGVtZW50LmF1dG9jb21wbGV0ZSA9IFwib2ZmXCJcblx0XHRAX2lucHV0RWxlbWVudC5hdXRvY29ycmVjdCA9IFwib2ZmXCJcblx0XHRAX2lucHV0RWxlbWVudC5zcGVsbGNoZWNrID0gZmFsc2VcblxuXHRcdCMgVGhlIGlkIHNlcnZlcyB0byBkaWZmZXJlbnRpYXRlIG11bHRpcGxlIGlucHV0IGVsZW1lbnRzIGZyb20gb25lIGFub3RoZXIuXG5cdFx0IyBUbyBhbGxvdyBzdHlsaW5nIHRoZSBwbGFjZWhvbGRlciBjb2xvcnMgb2Ygc2VwZXJhdGUgZWxlbWVudHMuXG5cdFx0QF9pbnB1dEVsZW1lbnQuY2xhc3NOYW1lID0gXCJpbnB1dFwiICsgQGlkXG5cblx0XHQjIEFsbCBpbmhlcml0ZWQgcHJvcGVydGllc1xuXHRcdHRleHRQcm9wZXJ0aWVzID1cblx0XHRcdHtAdGV4dCwgQGZvbnRGYW1pbHksIEBmb250U2l6ZSwgQGxpbmVIZWlnaHQsIEBmb250V2VpZ2h0LCBAY29sb3IsIEBiYWNrZ3JvdW5kQ29sb3IsIEB3aWR0aCwgQGhlaWdodCwgQHBhZGRpbmcsIEBwYXJlbnR9XG5cblx0XHRmb3IgcHJvcGVydHksIHZhbHVlIG9mIHRleHRQcm9wZXJ0aWVzXG5cblx0XHRcdEBvbiBcImNoYW5nZToje3Byb3BlcnR5fVwiLCAodmFsdWUpID0+XG5cdFx0XHRcdCMgUmVzZXQgdGV4dExheWVyIGNvbnRlbnRzXG5cdFx0XHRcdEBfZWxlbWVudEhUTUwuY2hpbGRyZW5bMF0udGV4dENvbnRlbnQgPSBcIlwiXG5cblx0XHRcdFx0cmV0dXJuIGlmIEBfaXNEZXNpZ25MYXllclxuXHRcdFx0XHRAX3NldFRleHRQcm9wZXJ0aWVzKEApXG5cdFx0XHRcdEBfc2V0UGxhY2Vob2xkZXJDb2xvcihAX2lkLCBAY29sb3IpXG5cblxuXHRcdCMgU2V0IGRlZmF1bHQgcGxhY2Vob2xkZXJcblx0XHRAX3NldFBsYWNlaG9sZGVyKEB0ZXh0KVxuXHRcdEBfc2V0UGxhY2Vob2xkZXJDb2xvcihAX2lkLCBAY29sb3IpXG5cblx0XHQjIFJlc2V0IHRleHRMYXllciBjb250ZW50c1xuXHRcdEBfZWxlbWVudEhUTUwuY2hpbGRyZW5bMF0udGV4dENvbnRlbnQgPSBcIlwiXG5cblx0XHQjIENoZWNrIGlmIGluIGZvY3VzXG5cdFx0QF9pc0ZvY3VzZWQgPSBmYWxzZVxuXG5cdFx0IyBEZWZhdWx0IGZvY3VzIGludGVyYWN0aW9uXG5cdFx0QF9pbnB1dEVsZW1lbnQub25mb2N1cyA9IChlKSA9PlxuXG5cdFx0XHRAZm9jdXNDb2xvciA/PSBcIiMwMDBcIlxuXG5cdFx0XHQjIEVtaXQgZm9jdXMgZXZlbnRcblx0XHRcdEBlbWl0KEV2ZW50cy5JbnB1dEZvY3VzLCBldmVudClcblxuXHRcdFx0QF9pc0ZvY3VzZWQgPSB0cnVlXG5cblx0XHQjIEVtaXQgYmx1ciBldmVudFxuXHRcdEBfaW5wdXRFbGVtZW50Lm9uYmx1ciA9IChlKSA9PlxuXHRcdFx0QGVtaXQoRXZlbnRzLklucHV0Qmx1ciwgZXZlbnQpXG5cblx0XHRcdEBfaXNGb2N1c2VkID0gZmFsc2VcblxuXHRcdCMgVG8gZmlsdGVyIGlmIHZhbHVlIGNoYW5nZWQgbGF0ZXJcblx0XHRjdXJyZW50VmFsdWUgPSB1bmRlZmluZWRcblxuXHRcdCMgU3RvcmUgY3VycmVudCB2YWx1ZVxuXHRcdEBfaW5wdXRFbGVtZW50Lm9ua2V5ZG93biA9IChlKSA9PlxuXHRcdFx0Y3VycmVudFZhbHVlID0gQHZhbHVlXG5cblx0XHRcdCMgSWYgY2FwcyBsb2NrIGtleSBpcyBwcmVzc2VkIGRvd25cblx0XHRcdGlmIGUud2hpY2ggaXMgMjBcblx0XHRcdFx0QGVtaXQoRXZlbnRzLkNhcHNMb2NrS2V5LCBldmVudClcblxuXHRcdFx0IyBJZiBzaGlmdCBrZXkgaXMgcHJlc3NlZFxuXHRcdFx0aWYgZS53aGljaCBpcyAxNlxuXHRcdFx0XHRAZW1pdChFdmVudHMuU2hpZnRLZXksIGV2ZW50KVxuXG5cdFx0QF9pbnB1dEVsZW1lbnQub25rZXl1cCA9IChlKSA9PlxuXG5cdFx0XHRpZiBjdXJyZW50VmFsdWUgaXNudCBAdmFsdWVcblx0XHRcdFx0QGVtaXQoXCJjaGFuZ2U6dmFsdWVcIiwgQHZhbHVlKVxuXHRcdFx0XHRAZW1pdChFdmVudHMuVmFsdWVDaGFuZ2UsIEB2YWx1ZSlcblxuXHRcdFx0IyBJZiBlbnRlciBrZXkgaXMgcHJlc3NlZFxuXHRcdFx0aWYgZS53aGljaCBpcyAxM1xuXHRcdFx0XHRAZW1pdChFdmVudHMuRW50ZXJLZXksIGV2ZW50KVxuXG5cdFx0XHQjIElmIGJhY2tzcGFjZSBrZXkgaXMgcHJlc3NlZFxuXHRcdFx0aWYgZS53aGljaCBpcyA4XG5cdFx0XHRcdEBlbWl0KEV2ZW50cy5CYWNrc3BhY2VLZXksIGV2ZW50KVxuXG5cdFx0XHQjIElmIHNwYWNlIGtleSBpcyBwcmVzc2VkXG5cdFx0XHRpZiBlLndoaWNoIGlzIDMyXG5cdFx0XHRcdEBlbWl0KEV2ZW50cy5TcGFjZUtleSwgZXZlbnQpXG5cblx0XHRcdCMgSWYgY2FwcyBsb2NrIGtleSBpcyBwcmVzc2VkIHVwXG5cdFx0XHRpZiBlLndoaWNoIGlzIDIwXG5cdFx0XHRcdEBlbWl0KEV2ZW50cy5DYXBzTG9ja0tleSwgZXZlbnQpXG5cblx0X3NldFBsYWNlaG9sZGVyOiAodGV4dCkgPT5cblx0XHRAX2lucHV0RWxlbWVudC5wbGFjZWhvbGRlciA9IHRleHRcblxuXHRfc2V0UGxhY2Vob2xkZXJDb2xvcjogKGlkLCBjb2xvcikgLT5cblx0XHRkb2N1bWVudC5zdHlsZVNoZWV0c1swXS5hZGRSdWxlKFwiLmlucHV0I3tpZH06Oi13ZWJraXQtaW5wdXQtcGxhY2Vob2xkZXJcIiwgXCJjb2xvcjogI3tjb2xvcn1cIilcblxuXHRfY2hlY2tEZXZpY2VQaXhlbFJhdGlvOiAtPlxuXHRcdHJhdGlvID0gKFNjcmVlbi53aWR0aCAvIEZyYW1lci5EZXZpY2Uuc2NyZWVuLndpZHRoKVxuXHRcdGlmIFV0aWxzLmlzRGVza3RvcCgpXG5cdFx0XHQjIEAzeFxuXHRcdFx0aWYgcmF0aW8gPCAwLjUgYW5kIHJhdGlvID4gMC4yNVxuXHRcdFx0XHRkcHIgPSAxIC0gcmF0aW9cblx0XHRcdCMgQDR4XG5cdFx0XHRlbHNlIGlmIHJhdGlvIGlzIDAuMjVcblx0XHRcdFx0ZHByID0gMSAtIChyYXRpbyAqIDIpXG5cdFx0XHQjIEAxeCwgQDJ4XG5cdFx0XHRlbHNlXG5cdFx0XHRcdGRwciA9IFV0aWxzLmRldmljZVBpeGVsUmF0aW8oKVxuXHRcdFx0aWYgRnJhbWVyLkRldmljZS5kZXZpY2VUeXBlIGlzIFwiZnVsbHNjcmVlblwiXG5cdFx0XHRcdGRwciA9IDJcblx0XHRlbHNlXG5cdFx0XHQjIEAzeFxuXHRcdFx0aWYgcmF0aW8gPCAwLjUgYW5kIHJhdGlvID4gMC4yNVxuXHRcdFx0XHRkcHIgPSAxIC0gcmF0aW9cblx0XHRcdCMgQDR4XG5cdFx0XHRlbHNlIGlmIHJhdGlvIGlzIDAuMjVcblx0XHRcdFx0ZHByID0gMSAtIChyYXRpbyAqIDIpXG5cdFx0XHQjIEAxeCwgQDJ4XG5cdFx0XHRlbHNlIGlmIHJhdGlvIGlzIDAuNVxuXHRcdFx0XHRkcHIgPSAxXG5cblx0XHRyZXR1cm4gZHByXG5cblx0X3NldFRleHRQcm9wZXJ0aWVzOiAobGF5ZXIpID0+XG5cblx0XHRkcHIgPSBAX2NoZWNrRGV2aWNlUGl4ZWxSYXRpbygpXG5cblx0XHRpZiBub3QgQF9pc0Rlc2lnbkxheWVyXG5cdFx0XHRAX2lucHV0RWxlbWVudC5zdHlsZS5mb250RmFtaWx5ID0gbGF5ZXIuZm9udEZhbWlseVxuXHRcdFx0QF9pbnB1dEVsZW1lbnQuc3R5bGUuZm9udFNpemUgPSBcIiN7bGF5ZXIuZm9udFNpemUgLyBkcHJ9cHhcIlxuXHRcdFx0QF9pbnB1dEVsZW1lbnQuc3R5bGUuZm9udFdlaWdodCA9IGxheWVyLmZvbnRXZWlnaHQgPyBcIm5vcm1hbFwiXG5cdFx0XHRAX2lucHV0RWxlbWVudC5zdHlsZS5wYWRkaW5nVG9wID0gXCIje2xheWVyLnBhZGRpbmcudG9wICogMiAvIGRwcn1weFwiXG5cdFx0XHRAX2lucHV0RWxlbWVudC5zdHlsZS5wYWRkaW5nUmlnaHQgPSBcIiN7bGF5ZXIucGFkZGluZy5ib3R0b20gKiAyIC8gZHByfXB4XCJcblx0XHRcdEBfaW5wdXRFbGVtZW50LnN0eWxlLnBhZGRpbmdCb3R0b20gPSBcIiN7bGF5ZXIucGFkZGluZy5yaWdodCAqIDIgLyBkcHJ9cHhcIlxuXHRcdFx0QF9pbnB1dEVsZW1lbnQuc3R5bGUucGFkZGluZ0xlZnQgPSBcIiN7bGF5ZXIucGFkZGluZy5sZWZ0ICogMiAvIGRwcn1weFwiXG5cblx0XHRAX2lucHV0RWxlbWVudC5zdHlsZS53aWR0aCA9IFwiI3soKGxheWVyLndpZHRoIC0gbGF5ZXIucGFkZGluZy5sZWZ0ICogMikgKiAyIC8gZHByKX1weFwiXG5cdFx0QF9pbnB1dEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gXCIje2xheWVyLmhlaWdodCAqIDIgLyBkcHJ9cHhcIlxuXHRcdEBfaW5wdXRFbGVtZW50LnN0eWxlLm91dGxpbmUgPSBcIm5vbmVcIlxuXHRcdEBfaW5wdXRFbGVtZW50LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwidHJhbnNwYXJlbnRcIlxuXHRcdEBfaW5wdXRFbGVtZW50LnN0eWxlLmN1cnNvciA9IFwiYXV0b1wiXG5cdFx0QF9pbnB1dEVsZW1lbnQuc3R5bGUud2Via2l0QXBwZWFyYW5jZSA9IFwibm9uZVwiXG5cdFx0QF9pbnB1dEVsZW1lbnQuc3R5bGUucmVzaXplID0gXCJub25lXCJcblx0XHRAX2lucHV0RWxlbWVudC5zdHlsZS5vdmVyZmxvdyA9IFwiaGlkZGVuXCJcblx0XHRAX2lucHV0RWxlbWVudC5zdHlsZS53ZWJraXRGb250U21vb3RoaW5nID0gXCJhbnRpYWxpYXNlZFwiXG5cblx0YWRkQmFja2dyb3VuZExheWVyOiAobGF5ZXIpIC0+XG5cdFx0QF9iYWNrZ3JvdW5kID0gbGF5ZXJcblx0XHRAX2JhY2tncm91bmQucGFyZW50ID0gQFxuXHRcdEBfYmFja2dyb3VuZC5uYW1lID0gXCJiYWNrZ3JvdW5kXCJcblx0XHRAX2JhY2tncm91bmQueCA9IEBfYmFja2dyb3VuZC55ID0gMFxuXHRcdEBfYmFja2dyb3VuZC5fZWxlbWVudC5hcHBlbmRDaGlsZChAX2lucHV0RWxlbWVudClcblxuXHRcdHJldHVybiBAX2JhY2tncm91bmRcblxuXHRhZGRQbGFjZUhvbGRlckxheWVyOiAobGF5ZXIpIC0+XG5cblx0XHRAX2lzRGVzaWduTGF5ZXIgPSB0cnVlXG5cdFx0QF9pbnB1dEVsZW1lbnQuY2xhc3NOYW1lID0gXCJpbnB1dFwiICsgbGF5ZXIuaWRcblx0XHRAcGFkZGluZyA9IGxlZnQ6IDAsIHRvcDogMFxuXG5cdFx0QF9zZXRQbGFjZWhvbGRlcihsYXllci50ZXh0KVxuXHRcdEBfc2V0VGV4dFByb3BlcnRpZXMobGF5ZXIpXG5cdFx0QF9zZXRQbGFjZWhvbGRlckNvbG9yKGxheWVyLmlkLCBsYXllci5jb2xvcilcblxuXHRcdEBvbiBcImNoYW5nZTpjb2xvclwiLCA9PlxuXHRcdFx0QF9zZXRQbGFjZWhvbGRlckNvbG9yKGxheWVyLmlkLCBAY29sb3IpXG5cblx0XHQjIFJlbW92ZSBvcmlnaW5hbCBsYXllclxuXHRcdGxheWVyLnZpc2libGUgPSBmYWxzZVxuXHRcdEBfZWxlbWVudEhUTUwuY2hpbGRyZW5bMF0udGV4dENvbnRlbnQgPSBcIlwiXG5cblx0XHQjIENvbnZlcnQgcG9zaXRpb24gdG8gcGFkZGluZ1xuXHRcdGRwciA9IEBfY2hlY2tEZXZpY2VQaXhlbFJhdGlvKClcblx0XHRAX2lucHV0RWxlbWVudC5zdHlsZS5mb250U2l6ZSA9IFwiI3tsYXllci5mb250U2l6ZSAqIDIgLyBkcHJ9cHhcIlxuXHRcdEBfaW5wdXRFbGVtZW50LnN0eWxlLnBhZGRpbmdUb3AgPSBcIiN7bGF5ZXIueSAqIDIgLyBkcHJ9cHhcIlxuXHRcdEBfaW5wdXRFbGVtZW50LnN0eWxlLnBhZGRpbmdMZWZ0ID0gXCIje2xheWVyLnggKiAyIC8gZHByfXB4XCJcblx0XHRAX2lucHV0RWxlbWVudC5zdHlsZS53aWR0aCA9IFwiI3soQF9iYWNrZ3JvdW5kLndpZHRoIC0gbGF5ZXIueCAqIDIpICogMiAvIGRwcn1weFwiXG5cblx0XHRpZiBAbXVsdGlMaW5lXG5cdFx0XHRAX2lucHV0RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBcIiN7QF9iYWNrZ3JvdW5kLmhlaWdodCAqIDIgLyBkcHJ9cHhcIlxuXG5cdFx0QG9uIFwiY2hhbmdlOnBhZGRpbmdcIiwgPT5cblx0XHRcdEBfaW5wdXRFbGVtZW50LnN0eWxlLnBhZGRpbmdUb3AgPSBcIiN7QHBhZGRpbmcudG9wICogMiAvIGRwcn1weFwiXG5cdFx0XHRAX2lucHV0RWxlbWVudC5zdHlsZS5wYWRkaW5nTGVmdCA9IFwiI3tAcGFkZGluZy5sZWZ0ICogMiAvIGRwcn1weFwiXG5cblx0XHRyZXR1cm4gQF9wbGFjZWhvbGRlclxuXG5cdGZvY3VzOiAtPlxuXHRcdEBfaW5wdXRFbGVtZW50LmZvY3VzKClcblxuXHRAZGVmaW5lIFwidmFsdWVcIixcblx0XHRnZXQ6IC0+IEBfaW5wdXRFbGVtZW50LnZhbHVlXG5cdFx0c2V0OiAodmFsdWUpIC0+XG5cdFx0XHRAX2lucHV0RWxlbWVudC52YWx1ZSA9IHZhbHVlXG5cblx0QGRlZmluZSBcImZvY3VzQ29sb3JcIixcblx0XHRnZXQ6IC0+XG5cdFx0XHRAX2lucHV0RWxlbWVudC5zdHlsZS5jb2xvclxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0QF9pbnB1dEVsZW1lbnQuc3R5bGUuY29sb3IgPSB2YWx1ZVxuXG5cdEBkZWZpbmUgXCJtdWx0aUxpbmVcIiwgQHNpbXBsZVByb3BlcnR5KFwibXVsdGlMaW5lXCIsIGZhbHNlKVxuXG5cdCMgTmV3IENvbnN0cnVjdG9yXG5cdEB3cmFwID0gKGJhY2tncm91bmQsIHBsYWNlaG9sZGVyLCBvcHRpb25zKSAtPlxuXHRcdHJldHVybiB3cmFwSW5wdXQobmV3IEAob3B0aW9ucyksIGJhY2tncm91bmQsIHBsYWNlaG9sZGVyLCBvcHRpb25zKVxuXG5cdG9uRW50ZXJLZXk6IChjYikgLT4gQG9uKEV2ZW50cy5FbnRlcktleSwgY2IpXG5cdG9uU3BhY2VLZXk6IChjYikgLT4gQG9uKEV2ZW50cy5TcGFjZUtleSwgY2IpXG5cdG9uQmFja3NwYWNlS2V5OiAoY2IpIC0+IEBvbihFdmVudHMuQmFja3NwYWNlS2V5LCBjYilcblx0b25DYXBzTG9ja0tleTogKGNiKSAtPiBAb24oRXZlbnRzLkNhcHNMb2NrS2V5LCBjYilcblx0b25TaGlmdEtleTogKGNiKSAtPiBAb24oRXZlbnRzLlNoaWZ0S2V5LCBjYilcblx0b25WYWx1ZUNoYW5nZTogKGNiKSAtPiBAb24oRXZlbnRzLlZhbHVlQ2hhbmdlLCBjYilcblx0b25JbnB1dEZvY3VzOiAoY2IpIC0+IEBvbihFdmVudHMuSW5wdXRGb2N1cywgY2IpXG5cdG9uSW5wdXRCbHVyOiAoY2IpIC0+IEBvbihFdmVudHMuSW5wdXRCbHVyLCBjYilcblxud3JhcElucHV0ID0gKGluc3RhbmNlLCBiYWNrZ3JvdW5kLCBwbGFjZWhvbGRlcikgLT5cblx0aWYgbm90IChiYWNrZ3JvdW5kIGluc3RhbmNlb2YgTGF5ZXIpXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiSW5wdXRMYXllciBleHBlY3RzIGEgYmFja2dyb3VuZCBsYXllci5cIilcblxuXHRpZiBub3QgKHBsYWNlaG9sZGVyIGluc3RhbmNlb2YgVGV4dExheWVyKVxuXHRcdHRocm93IG5ldyBFcnJvcihcIklucHV0TGF5ZXIgZXhwZWN0cyBhIHRleHQgbGF5ZXIuXCIpXG5cblx0aW5wdXQgPSBpbnN0YW5jZVxuXG5cdGlucHV0Ll9fZnJhbWVySW5zdGFuY2VJbmZvID89IHt9XG5cdGlucHV0Ll9fZnJhbWVySW5zdGFuY2VJbmZvPy5uYW1lID0gaW5zdGFuY2UuY29uc3RydWN0b3IubmFtZVxuXG5cdGlucHV0LmZyYW1lID0gYmFja2dyb3VuZC5mcmFtZVxuXHRpbnB1dC5wYXJlbnQgPSBiYWNrZ3JvdW5kLnBhcmVudFxuXHRpbnB1dC5pbmRleCA9IGJhY2tncm91bmQuaW5kZXhcblxuXHRpbnB1dC5hZGRCYWNrZ3JvdW5kTGF5ZXIoYmFja2dyb3VuZClcblx0aW5wdXQuYWRkUGxhY2VIb2xkZXJMYXllcihwbGFjZWhvbGRlcilcblxuXHRyZXR1cm4gaW5wdXQiLCIjIGJ1dHRvbiB0aGF0IGNyZWF0ZXMgYSByaXBwbGUgZWZmZWN0IHdoZW4gY2xpY2tlZFxuY2xhc3MgUmlwcGxlQnV0dG9uIGV4dGVuZHMgTGF5ZXJcblx0Y29uc3RydWN0b3I6IChAb3B0aW9ucz17fSkgLT5cblx0XHRfLmRlZmF1bHRzIEBvcHRpb25zLFxuXHRcdFx0YmFja2dyb3VuZENvbG9yOiBcIndoaXRlXCJcblx0XHRcdHJpcHBsZUNvbG9yOiB1bmRlZmluZWRcblx0XHRcdHJpcHBsZU9wdGlvbnM6IHRpbWU6IDAuMjUsIGN1cnZlOiBCZXppZXIuZWFzZU91dFxuXHRcdFx0dHJpZ2dlck9uQ2xpY2s6IHRydWVcblx0XHRzdXBlciBAb3B0aW9uc1xuXHRcdGlmIEByaXBwbGVDb2xvciBpcyB1bmRlZmluZWRcblx0XHRcdEByaXBwbGVDb2xvciA9IEBiYWNrZ3JvdW5kQ29sb3IuZGFya2VuIDEwXG5cblx0XHQjIGxheWVyIHRoYXQgY29udGFpbnMgQF9yaXBwbGUgY2lyY2xlXG5cdFx0QF9jbGlwcGVyID0gbmV3IExheWVyXG5cdFx0XHRzaXplOiBAc2l6ZVxuXHRcdFx0cGFyZW50OiBAXG5cdFx0XHRjbGlwOiB0cnVlXG5cdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IFwiXCJcblxuXHRcdCMgY2lyY2xlIHRoYXQgYW5pbWF0ZXMgdG8gY3JlYXRlIHJpcHBsZSBlZmZlY3Rcblx0XHRAX3JpcHBsZSA9IG5ldyBMYXllclxuXHRcdFx0bmFtZTogXCJyaXBwbGVcIlxuXHRcdFx0Ym9yZGVyUmFkaXVzOiBcIjUwJVwiXG5cdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IEByaXBwbGVDb2xvclxuXHRcdFx0cGFyZW50OiBAX2NsaXBwZXJcblx0XHRcdHNpemU6IDBcblx0XHRAb24gXCJjaGFuZ2U6c2l6ZVwiLCAtPlxuXHRcdFx0QF9jbGlwcGVyLnNpemUgPSBAc2l6ZVxuXHRcdEBfY2xpcHBlci5vbkNsaWNrIChldmVudCwgdGFyZ2V0KSA9PlxuXHRcdFx0aWYgQHRyaWdnZXJPbkNsaWNrIGlzIHRydWVcblx0XHRcdFx0QHNlbmRSaXBwbGUgZXZlbnQsdGFyZ2V0XG5cblx0IyB0cmlnZ2VycyByaXBwbGUgYW5pbWF0aW9uXG5cdCMgcGFyYW1ldGVycyBldmVudCBhbmQgdGFyZ2V0IGNvbWUgZnJvbSBjbGljayBldmVudFxuXHRzZW5kUmlwcGxlOiAoZXZlbnQsIHRhcmdldCkgLT5cblx0XHRjbGlja1BvaW50ID0gdGFyZ2V0LmNvbnZlcnRQb2ludFRvTGF5ZXIoZXZlbnQucG9pbnQsIHRhcmdldClcblx0XHRyID0gQHNlbGVjdENoaWxkKFwicmlwcGxlXCIpXG5cdFx0ci5zaXplID0gTWF0aC5taW4oQHdpZHRoLCBAaGVpZ2h0KS8xMFxuXHRcdHIubWlkWCA9IGNsaWNrUG9pbnQueFxuXHRcdHIubWlkWSA9IGNsaWNrUG9pbnQueVxuXHRcdHIub3BhY2l0eSA9IDFcblx0XHRyYWRpdXMgPSBAX2xvbmdlc3RSYWRpdXMgY2xpY2tQb2ludCwgQFxuXHRcdHJpcHBsZUFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24gcixcblx0XHRcdHNpemU6IHJhZGl1cyAqIDJcblx0XHRcdHg6IGNsaWNrUG9pbnQueCAtIHJhZGl1c1xuXHRcdFx0eTogY2xpY2tQb2ludC55IC0gcmFkaXVzXG5cdFx0XHRvcHRpb25zOiBAcmlwcGxlT3B0aW9uc1xuXHRcdGZhZGVBbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uIHIsXG5cdFx0XHRvcGFjaXR5OiAwXG5cdFx0XHRvcHRpb25zOlxuXHRcdFx0XHR0aW1lOlxuXHRcdFx0XHRcdHJpcHBsZUFuaW1hdGlvbi5vcHRpb25zLnRpbWUgKiAyLjVcblx0XHRcdFx0Y3VydmU6XG5cdFx0XHRcdFx0cmlwcGxlQW5pbWF0aW9uLm9wdGlvbnMuY3VydmVcblx0XHRyaXBwbGVBbmltYXRpb24ucmVzdGFydCgpXG5cdFx0ZmFkZUFuaW1hdGlvbi5yZXN0YXJ0KClcblxuXHRfbG9uZ2VzdFJhZGl1czogKHBvaW50LCBsYXllcikgLT5cblx0XHRwb2ludFRvVXBwZXJMZWZ0ID0gTWF0aC5zcXJ0KCBNYXRoLnBvdyhwb2ludC54LCAyKSArIE1hdGgucG93KHBvaW50LnksIDIpKVxuXHRcdHBvaW50VG9VcHBlclJpZ2h0ID0gTWF0aC5zcXJ0KCBNYXRoLnBvdyhsYXllci53aWR0aCAtIHBvaW50LngsIDIpICsgTWF0aC5wb3cocG9pbnQueSwgMikpXG5cdFx0cG9pbnRUb0xvd2VyTGVmdCA9IE1hdGguc3FydCggTWF0aC5wb3cocG9pbnQueCwgMikgKyBNYXRoLnBvdyhsYXllci5oZWlnaHQgLSBwb2ludC55LCAyKSlcblx0XHRwb2ludFRvTG93ZXJSaWdodCA9IE1hdGguc3FydCggTWF0aC5wb3cobGF5ZXIud2lkdGggLSBwb2ludC54LCAyKSArIE1hdGgucG93KGxheWVyLmhlaWdodCAtIHBvaW50LnksIDIpKVxuXHRcdHJldHVybiBNYXRoLm1heCBwb2ludFRvVXBwZXJMZWZ0LCBwb2ludFRvVXBwZXJSaWdodCwgcG9pbnRUb0xvd2VyTGVmdCwgcG9pbnRUb0xvd2VyUmlnaHRcblxuXHRAZGVmaW5lIFwicmlwcGxlT3B0aW9uc1wiLFxuXHRcdGdldDogLT4gQG9wdGlvbnMucmlwcGxlT3B0aW9uc1xuXHRcdHNldDogKHZhbHVlKSAtPiBAb3B0aW9ucy5yaXBwbGVPcHRpb25zID0gdmFsdWVcblx0QGRlZmluZSBcInJpcHBsZUNvbG9yXCIsXG5cdFx0Z2V0OiAtPiBAb3B0aW9ucy5yaXBwbGVDb2xvclxuXHRcdHNldDogKHZhbHVlKSAtPiBAb3B0aW9ucy5yaXBwbGVDb2xvciA9IHZhbHVlXG5cdEBkZWZpbmUgXCJ0cmlnZ2VyT25DbGlja1wiLFxuXHRcdGdldDogLT4gQG9wdGlvbnMudHJpZ2dlck9uQ2xpY2tcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gQG9wdGlvbnMudHJpZ2dlck9uQ2xpY2sgPSB2YWx1ZVxuXG5jbGFzcyBUYWJDb250ZW50IGV4dGVuZHMgTGF5ZXJcblx0Y29uc3RydWN0b3I6IChAb3B0aW9ucz17fSkgLT5cblx0XHRfLmRlZmF1bHRzIEBvcHRpb25zLFxuXHRcdFx0YmFja2dyb3VuZENvbG9yOiBcIlwiXG5cdFx0XHRuYW1lOiBcIlRhYkNvbnRlbnRcIlxuXHRcdFx0Y2xpcDogdHJ1ZVxuXHRcdHN1cGVyIEBvcHRpb25zXG5cdFx0QGN1cnJlbnRQYWdlSW5kZXggPSB1bmRlZmluZWQgI2N1cnJlbnQgcGFnZSBpbmRleFxuXHRcdEBwcmlvclBhZ2VJbmRleCA9IHVuZGVmaW5lZCAjcHJpb3IgcGFnZSBpbmRleFxuXHRcdEBwYWdlcyA9IFtdXG5cblx0XHQjIGhhbmRsZSBzd2lwaW5nIHRvIGNoYW5nZSB0YWJzXG5cdFx0QG9uU3dpcGVSaWdodFN0YXJ0IC0+XG5cdFx0XHRAX3NlbGVjdFByZXZpb3VzUGFnZSgpXG5cdFx0QG9uU3dpcGVMZWZ0U3RhcnQgLT5cblx0XHRcdEBfc2VsZWN0TmV4dFBhZ2UoKVxuXG5cdFx0IyBoYW5kbGUgc2l6ZSBjaGFuZ2Vcblx0XHRAb24gXCJjaGFuZ2U6c2l6ZVwiLCAtPlxuXHRcdFx0QGxheW91dFBhZ2VzKClcblxuXHQjIGNhbGwgZm9yIGVhY2ggcGFnZSB0byBhZGRcblx0YWRkUGFnZTogKHBhZ2UpIC0+XG5cdFx0QHBhZ2VzLnB1c2ggcGFnZVxuXHRcdHBhZ2UucGFyZW50ID0gQFxuXHRcdHBhZ2UuYW5pbWF0aW9uT3B0aW9ucyA9IEBhbmltYXRpb25PcHRpb25zXG5cdFx0cGFnZS5wb2ludCA9IHg6IC1wYWdlLndpZHRoLCB5OiAwXG5cdFx0QGxheW91dFBhZ2VzKClcblxuXHRsYXlvdXRQYWdlczogVXRpbHMuZGVib3VuY2UgMC4wMSwgLT5cblx0XHRmb3IgcGFnZSwgaSBpbiBAcGFnZXNcblx0XHRcdHBhZ2Uuc2l6ZSA9IEBzaXplXG5cdFx0XHRpZiBAdGFiQmFyLnNlbGVjdGVkVGFiSW5kZXggaXMgaVxuXHRcdFx0XHRwYWdlLnggPSAwXG5cdFx0XHRcdEBjdXJyZW50UGFnZUluZGV4ID0gaVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRwYWdlLnggPSAtcGFnZS53aWR0aFxuXG5cblx0IyBzZWxlY3RzIHRhYiB0byByaWdodC4gY2FsbGVkIG9uIHN3aXBlXG5cdF9zZWxlY3ROZXh0UGFnZTogLT5cblx0XHRpZiBAY3VycmVudFBhZ2VJbmRleCArIDEgPCBAcGFnZXMubGVuZ3RoXG5cdFx0XHRAdGFiQmFyLnNlbGVjdFRhYiBAY3VycmVudFBhZ2VJbmRleCArIDFcblxuXHQjIHNlbGVjdHMgdGFiIHRvIGxlZnQuIGNhbGxlZCBvbiBzd2lwZVxuXHRfc2VsZWN0UHJldmlvdXNQYWdlOiAtPlxuXHRcdGlmIEBjdXJyZW50UGFnZUluZGV4ID4gMFxuXHRcdFx0QHRhYkJhci5zZWxlY3RUYWIgQGN1cnJlbnRQYWdlSW5kZXggLSAxXG5cblx0IyBjYWxsZWQgZnJvbSB0aGUgVGFiQmFyIGFuZCBzbGlkZXMgdGhlIHBhZ2UgaW50byBwb3NpdGlvbi5cblx0c2VsZWN0UGFnZTogKGluZGV4KSAtPlxuXHRcdHJldHVybiBpZiBpbmRleCBpcyBAY3VycmVudFBhZ2VJbmRleFxuXHRcdGN1cnJlbnRMYXllciA9IEBwYWdlc1tpbmRleF1cblx0XHRwcmlvckxheWVyID0gQHBhZ2VzW0BjdXJyZW50UGFnZUluZGV4XVxuXHRcdCMgdGhlIGN1cnJlbnQgdGFiIGlzIHRvIHRoZSByaWdodCwgc28gYW5pbWF0ZSBmcm9tIHRoZSBsZWZ0XG5cdFx0aWYgIGluZGV4ID4gQGN1cnJlbnRQYWdlSW5kZXhcblx0XHRcdGN1cnJlbnRMYXllci54ID0gU2NyZWVuLndpZHRoXG5cdFx0XHRwcmlvckxheWVyLmFuaW1hdGUgeDogLXByaW9yTGF5ZXIud2lkdGhcblx0XHRcdGN1cnJlbnRMYXllci5hbmltYXRlIHg6IDBcblx0XHQjIHRoZSBjdXJyZW50IHRhYiBpcyB0byB0aGUgbGVmdCwgc28gYW5pbWF0ZSBmcm9tIHRoZSByaWdodFxuXHRcdGVsc2UgaWYgaW5kZXggPCBAY3VycmVudFBhZ2VJbmRleFxuXHRcdFx0Y3VycmVudExheWVyLnggPSAtY3VycmVudExheWVyLndpZHRoXG5cdFx0XHRwcmlvckxheWVyLmFuaW1hdGUgeDogU2NyZWVuLndpZHRoXG5cdFx0XHRjdXJyZW50TGF5ZXIuYW5pbWF0ZSB4OiAwXG5cdFx0QHByaW9yUGFnZUluZGV4ID0gQGN1cnJlbnRQYWdlSW5kZXhcblx0XHRAY3VycmVudFBhZ2VJbmRleCA9IGluZGV4XG5cdFx0QGVtaXQgXCJjaGFuZ2U6cGFnZVwiLFxuXHRcdFx0e2luZGV4OiBAY3VycmVudFBhZ2VJbmRleCwgbGF5ZXI6IEBwYWdlc1tAY3VycmVudFBhZ2VJbmRleF19LFxuXHRcdFx0e2luZGV4OiBAcHJpb3JQYWdlSW5kZXgsIGxheWVyOiBAcGFnZXNbQHByaW9yUGFnZUluZGV4XX1cblx0QGRlZmluZSBcImN1cnJlbnRQYWdlXCIsXG5cdFx0Z2V0OiAtPiBAcGFnZXNbQGN1cnJlbnRQYWdlSW5kZXhdXG5cbmNsYXNzIGV4cG9ydHMuVGFiQmFyIGV4dGVuZHMgU2Nyb2xsQ29tcG9uZW50XG5cdGNvbnN0cnVjdG9yOiAoQG9wdGlvbnM9e30pIC0+XG5cdFx0Xy5kZWZhdWx0cyBAb3B0aW9ucyxcblx0XHRcdHRhYkxhYmVsczogW1wiVEFCIE9ORVwiLFwiVEFCIFRXT1wiLFwiVEFCIFRIUkVFXCJdXG5cdFx0XHR3aWR0aDogU2NyZWVuLndpZHRoXG5cdFx0XHRoZWlnaHQ6IDQ2XG5cdFx0XHRmb250OiBVdGlscy5sb2FkV2ViRm9udCBcIlJvYm90b1wiXG5cdFx0XHRmb250U2l6ZTogMTRcblx0XHRcdHJpcHBsZTogdHJ1ZVxuXHRcdFx0cmlwcGxlQ29sb3IgPSB1bmRlZmluZWRcblx0XHRcdHNlbGVjdGVkQ29sb3I6IFwiI0VDNzAwMFwiXG5cdFx0XHRkZXNlbGVjdGVkQ29sb3I6IFwiIzI1MjIyMFwiXG5cdFx0XHRzZWxlY3RlZFRhYkluZGV4OiAwXG5cdFx0XHRtaW5pbXVtUGFkZGluZzogMTAgICMgcGFkZGluZyBvbiBlaXRoZXIgc2lkZSBvZiB0YWIgdGV4dFxuXHRcdFx0Zmlyc3RMYXN0VGFiSW5zZXQ6IDUgICMgZ2FwIGJldHdlZW4gbGVmdC9yaWdodCBzaWRlIG9mIFRhYkJhciBhbmQgZmlyc3QvbGFzdCB0YWJcblx0XHRcdGJhY2tncm91bmRDb2xvcjogXCIjZmZmXCJcblx0XHRcdGFuaW1hdGlvbk9wdGlvbnM6IHRpbWU6IDAuMjc1LCBjdXJ2ZTogQmV6aWVyLmVhc2Vcblx0XHRzdXBlciBAb3B0aW9uc1xuXG5cdFx0QHNjcm9sbFZlcnRpY2FsID0gZmFsc2VcblxuXHRcdCMgbWFrZSB0YWJCYXIgbGF5ZXJcblx0XHRAdGFiQmFyID0gbmV3IExheWVyXG5cdFx0XHR4OiAwXG5cdFx0XHRuYW1lOiBcInRhYkJhclwiXG5cdFx0XHRoZWlnaHQ6IEBoZWlnaHRcblx0XHRcdHBhcmVudDogQGNvbnRlbnRcblx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJcIlxuXG5cblx0XHQjIG1ha2Ugc2VsZWN0aW9uIGxpbmVcblx0XHRAdGFiU2VsZWN0aW9uTGluZSA9IG5ldyBMYXllclxuXHRcdFx0bmFtZTogXCJ0YWJTZWxlY3Rpb25MaW5lXCJcblx0XHRcdGhlaWdodDogMlxuXHRcdFx0d2lkdGg6IDBcblx0XHRcdGJhY2tncm91bmRDb2xvcjogXCIjRUM3MDAwXCJcblx0XHRcdHk6IEB0YWJCYXIuaGVpZ2h0IC0gMlxuXHRcdFx0YW5pbWF0aW9uT3B0aW9uczogQGFuaW1hdGlvbk9wdGlvbnNcblx0XHRcdHBhcmVudDogQHRhYkJhclxuXG5cdFx0QGN1cnJlbnRUYWIgPSB1bmRlZmluZWQgICMgaG9sZHMgY3VycmVudGx5IHNlbGVjdGVkIHRhYiBsYXllclxuXHRcdEBwcmlvclRhYiA9IHVuZGVmaW5lZCAgIyBob2xkcyB0YWIgbGF5ZXIgdGhhdCBoYWQgcHJldmlvdXNseSBiZWVuIHNlbGVjdGVkXG5cdFx0QHRhYnMgPSBbXVxuXG5cdFx0QG9uIFwiY2hhbmdlOndpZHRoXCIsIC0+XG5cdFx0XHRAbGF5b3V0VGFicygpXG5cblx0XHRAX2NyZWF0ZVRhYnMoKVxuXG4jIEZVTkNUSU9OUyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cblx0IyBjcmVhdGUgdGhlIGxheWVyIGhvbGRpbmcgdGhlIHBhZ2VzIHRoYXQgdGhlIHRhYnMgY29udHJvbCAob3B0aW9uYWwpLlxuXHQjIENyZWF0ZWQgYXV0b21hdGljYWxseSBpZiBjb2RlciBhY2Nlc3NlcyBpdC4gKGUuZy4sIHRhYkJhci50YWJDb250ZW50KVxuXHRjcmVhdGVUYWJDb250ZW50OiAtPlxuXHRcdHRjcCA9IG5ldyBUYWJDb250ZW50XG5cdFx0XHR3aWR0aDogU2NyZWVuLndpZHRoXG5cdFx0XHRoZWlnaHQ6IDM4MFxuXHRcdFx0eTogMjMwXG5cdFx0XHRhbmltYXRpb25PcHRpb25zOiBAYW5pbWF0aW9uT3B0aW9uc1xuXHRcdFx0cGFyZW50OiByZWNvcmRcblx0XHR0Y3AudGFiQmFyID0gQFxuXHRcdHJldHVybiB0Y3BcblxuXG5cdCMgbWFrZSB0aGUgdGFiIGxheWVyc1xuXHRfY3JlYXRlVGFiczogLT5cblx0XHQjIHJlbW92ZSBvbGQgdGFicyBpbiBjYXNlIHRoaXMgaXMgY2FsbGVkIGFmdGVyIGluaXRpYWxpemF0aW9uXG5cdFx0Zm9yIHRhYiBpbiBAdGFic1xuXHRcdFx0dGFiLnBhcmVudCA9IG51bGxcblx0XHRcdHRhYi5kZXN0cm95KClcblxuXHRcdEB0YWJzID0gW11cblx0XHRAX2xhYmVsV2lkdGhzID0gW10gIyBzdG9yZSBuYXR1cmFsIHdpZHRocyBvZiB0ZXh0IGxhYmVsc1xuXHRcdGZvciBsYWJlbCwgaSBpbiBAdGFiTGFiZWxzXG5cdFx0XHQjIG1ha2UgdGFiIGxhYmVsXG5cdFx0XHR0YWJMYWJlbCA9IG5ldyBUZXh0TGF5ZXJcblx0XHRcdFx0bmFtZTogXCJsYWJlbFwiXG5cdFx0XHRcdGZvbnQ6IEBmb250XG5cdFx0XHRcdGZvbnRTaXplOiBAZm9udFNpemVcblx0XHRcdFx0Y29sb3I6IEBkZXNlbGVjdGVkQ29sb3Jcblx0XHRcdFx0dGV4dEFsaWduOiBcImNlbnRlclwiXG5cdFx0XHRcdHRleHQ6IGxhYmVsXG5cdFx0XHRcdGFuaW1hdGlvbk9wdGlvbnM6IEBhbmltYXRpb25PcHRpb25zXG5cdFx0XHQjIG1ha2UgdGFiXG5cdFx0XHRwcm9wcyA9XG5cdFx0XHRcdG5hbWU6IFwidGFiXyN7aX1cIlxuXHRcdFx0XHRoZWlnaHQ6IEB0YWJCYXIuaGVpZ2h0XG5cdFx0XHRcdGJhY2tncm91bmRDb2xvcjogQGJhY2tncm91bmRDb2xvclxuXHRcdFx0XHRwYXJlbnQ6IEB0YWJCYXJcblx0XHRcdFx0YW5pbWF0aW9uT3B0aW9uczogQGFuaW1hdGlvbk9wdGlvbnNcblx0XHRcdGlmIEBvcHRpb25zLnJpcHBsZSBpcyB0cnVlXG5cdFx0XHRcdHRhYiA9IG5ldyBSaXBwbGVCdXR0b24gcHJvcHNcblx0XHRcdFx0dGFiLnRyaWdnZXJPbkNsaWNrID0gZmFsc2Vcblx0XHRcdGVsc2Vcblx0XHRcdFx0dGFiID0gbmV3IExheWVyIHByb3BzXG5cdFx0XHRAdGFicy5wdXNoIHRhYlxuXG5cdFx0XHR0YWJMYWJlbC5wYXJlbnQgPSB0YWJcblx0XHRcdEBfbGFiZWxXaWR0aHMucHVzaCB0YWJMYWJlbC53aWR0aFxuXG5cdFx0XHQjIGhhbmRsZSBjbGlja1xuXHRcdFx0dGFiLm9uQ2xpY2sgKGV2ZW50LCB0YXJnZXQpID0+XG5cdFx0XHRcdGlmIEBjdXJyZW50VGFiIGlzbnQgdGFyZ2V0XG5cdFx0XHRcdFx0aWYgdGFyZ2V0LmNvbnN0cnVjdG9yLm5hbWUgaXMgXCJSaXBwbGVCdXR0b25cIlxuXHRcdFx0XHRcdFx0dGFyZ2V0LnNlbmRSaXBwbGUgZXZlbnQsIHRhcmdldFxuXHRcdFx0XHRcdEBzZWxlY3RUYWIgdGFyZ2V0XG5cdFx0QGxheW91dFRhYnMoKVxuXG5cdCMgc2Nyb2xscyBhcHByb3ByaWF0ZWx5IHdoZW4gYSB0YWIgaXMgc2VsZWN0ZWRcblx0X3Njcm9sbFRvU2VsZWN0ZWRUYWI6IChhbmltYXRlZCA9IHRydWUpIC0+XG5cdFx0cmV0dXJuIGlmIEBjdXJyZW50VGFiIGlzIHVuZGVmaW5lZFxuXHRcdG5ld1Njcm9sbFggPSBNYXRoLm1heCgwLCBNYXRoLm1pbihAY3VycmVudFRhYi54ICsgQGN1cnJlbnRUYWIud2lkdGgvMiAtIEB3aWR0aC8yLCBAdGFiQmFyLndpZHRoIC0gQHdpZHRoKSlcblx0XHRpZiBhbmltYXRlZFxuXHRcdFx0QGFuaW1hdGUgc2Nyb2xsWDogbmV3U2Nyb2xsWFxuXHRcdGVsc2Vcblx0XHRcdEBzY3JvbGxYID0gbmV3U2Nyb2xsWFxuXG5cdGxheW91dFRhYnM6IC0+XG5cdFx0d2lkdGhPZkFsbFRhYnMgPSAwXG5cdFx0Zm9yIHdpZHRoIGluIEBfbGFiZWxXaWR0aHNcblx0XHRcdHdpZHRoT2ZBbGxUYWJzICs9IHdpZHRoICsgQG1pbmltdW1QYWRkaW5nICogMlxuXG5cdFx0aWYgd2lkdGhPZkFsbFRhYnMgPj0gQHdpZHRoIC0gQGNvbnRlbnRJbnNldC5sZWZ0IC0gQGNvbnRlbnRJbnNldC5yaWdodFxuXHRcdFx0QHRhYkJhci53aWR0aCA9IHdpZHRoT2ZBbGxUYWJzICsgQGZpcnN0TGFzdFRhYkluc2V0ICogMlxuXHRcdFx0QGNvbnRlbnQuZHJhZ2dhYmxlLm92ZXJkcmFnID0gdHJ1ZVxuXHRcdFx0ZXh0cmFXaWR0aFBlclRhYiA9IDBcblx0XHRlbHNlXG5cdFx0XHRAdGFiQmFyLndpZHRoID0gQHdpZHRoXG5cdFx0XHRAY29udGVudC5kcmFnZ2FibGUub3ZlcmRyYWcgPSBmYWxzZVxuXHRcdFx0ZXh0cmFXaWR0aFBlclRhYiA9IE1hdGgucm91bmQgKEB0YWJCYXIud2lkdGggLSB3aWR0aE9mQWxsVGFicyAtIEBmaXJzdExhc3RUYWJJbnNldCAqIDIpL0B0YWJzLmxlbmd0aFxuXHRcdHJ1bm5pbmdMZWZ0ID0gQGZpcnN0TGFzdFRhYkluc2V0XG5cdFx0Zm9yIGkgaW4gWzAuLi5AX2xhYmVsV2lkdGhzLmxlbmd0aF1cblx0XHRcdEB0YWJzW2ldLnggPSBydW5uaW5nTGVmdFxuXHRcdFx0QHRhYnNbaV0ud2lkdGggPSBAX2xhYmVsV2lkdGhzW2ldICsgZXh0cmFXaWR0aFBlclRhYiArIEBtaW5pbXVtUGFkZGluZyAqIDJcblx0XHRcdEB0YWJzW2ldLnNlbGVjdENoaWxkKFwibGFiZWxcIikud2lkdGggPSBAdGFic1tpXS53aWR0aFxuXHRcdFx0IyBjZW50ZXIgbGFiZWwgaW4gdGFiXG5cdFx0XHRAdGFic1tpXS5zZWxlY3RDaGlsZChcImxhYmVsXCIpLnBvaW50ID0gQWxpZ24uY2VudGVyXG5cdFx0XHRydW5uaW5nTGVmdCArPSBAdGFic1tpXS53aWR0aFxuXHRcdEBzZWxlY3RUYWIgQHNlbGVjdGVkVGFiSW5kZXgsIGZhbHNlLCB0cnVlXG5cdFx0QHRhYlNlbGVjdGlvbkxpbmUuYnJpbmdUb0Zyb250KClcblx0XHRAdXBkYXRlQ29udGVudCgpXG5cblxuXHRzZWxlY3RUYWI6ICh2YWx1ZSwgYW5pbWF0ZWQgPSB0cnVlLCBmb3JjZVNlbGVjdGlvbiA9IGZhbHNlKSAtPlxuXHRcdGlmIFV0aWxzLmluc3BlY3RPYmplY3RUeXBlKHZhbHVlKSBpc250IFwiTnVtYmVyXCJcblx0XHRcdGxheWVyID0gdmFsdWVcblx0XHRlbHNlXG5cdFx0XHRsYXllciA9IEB0YWJzW3ZhbHVlXVxuXHRcdHJldHVybiBpZiBsYXllciBpcyBAY3VycmVudFRhYiBhbmQgbm90IGZvcmNlU2VsZWN0aW9uXG5cdFx0QG9wdGlvbnMuc2VsZWN0ZWRUYWJJbmRleCA9IF8uaW5kZXhPZiBAdGFicywgbGF5ZXJcblx0XHRzZWxlY3RlZExpbmVQcm9wcyA9IHdpZHRoOiBsYXllci53aWR0aCwgeDogbGF5ZXIueFxuXHRcdGlmIGFuaW1hdGVkXG5cdFx0XHRAdGFiU2VsZWN0aW9uTGluZS5hbmltYXRlIHNlbGVjdGVkTGluZVByb3BzXG5cdFx0XHRsYXllci5zZWxlY3RDaGlsZChcImxhYmVsXCIpLmFuaW1hdGUgY29sb3I6IEBzZWxlY3RlZENvbG9yXG5cdFx0ZWxzZVxuXHRcdFx0QHRhYlNlbGVjdGlvbkxpbmUucHJvcHMgPSBzZWxlY3RlZExpbmVQcm9wc1xuXHRcdFx0bGF5ZXIuc2VsZWN0Q2hpbGQoXCJsYWJlbFwiKS5jb2xvciA9IEBzZWxlY3RlZENvbG9yXG5cdFx0aWYgbm90IGZvcmNlU2VsZWN0aW9uXG5cdFx0XHRAcHJpb3JUYWIgPSBAY3VycmVudFRhYlxuXHRcdGlmIGFuaW1hdGVkXG5cdFx0XHRAcHJpb3JUYWI/LnNlbGVjdENoaWxkKFwibGFiZWxcIikuYW5pbWF0ZSBjb2xvcjogQGRlc2VsZWN0ZWRDb2xvclxuXHRcdGVsc2Vcblx0XHRcdEBwcmlvclRhYj8uc2VsZWN0Q2hpbGQoXCJsYWJlbFwiKS5jb2xvciA9IEBkZXNlbGVjdGVkQ29sb3Jcblx0XHRAY3VycmVudFRhYiA9IGxheWVyXG5cdFx0QF9zY3JvbGxUb1NlbGVjdGVkVGFiKGFuaW1hdGVkKVxuXHRcdGlmIG5vdCBmb3JjZVNlbGVjdGlvblxuXHRcdFx0IyBjaGFuZ2UgdGhlIHBhZ2UgaW4gVGFiQ29udGVudCBpbnN0YW5jZSwgaWYgbGF0dGVyIGV4aXN0c1xuXHRcdFx0QF90YWJDb250ZW50Py5zZWxlY3RQYWdlIEBvcHRpb25zLnNlbGVjdGVkVGFiSW5kZXhcblx0XHRcdEBlbWl0IFwiY2hhbmdlOnRhYlwiLFxuXHRcdFx0XHR7aW5kZXg6IEBzZWxlY3RlZFRhYkluZGV4XG5cdFx0XHRcdGxheWVyOiBsYXllclxuXHRcdFx0XHR0ZXh0OiBAY3VycmVudFRhYi5zZWxlY3RDaGlsZChcImxhYmVsXCIpLnRleHR9LFxuXHRcdFx0XHR7aW5kZXg6IF8uaW5kZXhPZihAdGFicywgQHByaW9yVGFiKVxuXHRcdFx0XHRsYXllcjogQHByaW9yVGFiXG5cdFx0XHRcdHRleHQ6IEBwcmlvclRhYj8uc2VsZWN0Q2hpbGQoXCJsYWJlbFwiKS50ZXh0fVxuXHRcdHJldHVybiBsYXllclxuXG5cdCMgR2V0dGVycy9TZXR0ZXJzID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5cdCMgQ3JlYXRlIHRoZSBwYWdlcyB0YWJDb250ZW50IGxheWVyIGlmIHRoZSBwcm9wZXJ0eSBpcyBhY2Nlc3NlZCAoZS5nLiwgdGFiQmFyLnRhYkNvbnRlbnQpXG5cdEBkZWZpbmUgXCJuZXdUYWJcIixcblx0XHRnZXQ6IC0+XG5cdFx0XHRpZiBAb3B0aW9ucy5yaXBwbGUgaXMgdHJ1ZVxuXHRcdFx0XHRidXR0b24gPSBuZXcgUmlwcGxlQnV0dG9uXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGJ1dHRvbiA9IG5ldyBMYXllclxuXHRAZGVmaW5lIFwidGFiQ29udGVudFwiLFxuXHRcdGdldDogLT5cblx0XHRcdGlmIEBfdGFiQ29udGVudCBpcyB1bmRlZmluZWRcblx0XHRcdFx0cmV0dXJuIEBfdGFiQ29udGVudCA9IEBjcmVhdGVUYWJDb250ZW50KClcblx0XHRcdGVsc2Vcblx0XHRcdFx0cmV0dXJuIEBfdGFiQ29udGVudFxuXHRAZGVmaW5lIFwibWluaW11bVBhZGRpbmdcIixcblx0XHRnZXQ6IC0+IEBvcHRpb25zLm1pbmltdW1QYWRkaW5nXG5cdFx0c2V0OiAodmFsdWUpIC0+XG5cdFx0XHQjIGF2b2lkIGNhbGxpbmcgbGF5b3V0VGFicygpIHdoZW4gdGhpcyBwcm9wZXJ0eSBpcyBzZXQgZnJvbSBjb25zdHJ1Y3RvclxuXHRcdFx0aWYgQF9fZnJhbWVySW5zdGFuY2VJbmZvP1xuXHRcdFx0XHRAb3B0aW9ucy5taW5pbXVtUGFkZGluZyA9IHZhbHVlXG5cdFx0XHRcdEBsYXlvdXRUYWJzKClcblx0QGRlZmluZSBcImZpcnN0TGFzdFRhYkluc2V0XCIsXG5cdFx0Z2V0OiAtPiBAb3B0aW9ucy5maXJzdExhc3RUYWJJbnNldFxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0IyBhdm9pZCBjYWxsaW5nIGxheW91dFRhYnMoKSB3aGVuIHRoaXMgcHJvcGVydHkgaXMgc2V0IGZyb20gY29uc3RydWN0b3Jcblx0XHRcdGlmIEBfX2ZyYW1lckluc3RhbmNlSW5mbz9cblx0XHRcdFx0QG9wdGlvbnMuZmlyc3RMYXN0VGFiSW5zZXQgPSB2YWx1ZVxuXHRcdFx0XHRAbGF5b3V0VGFicygpXG5cdEBkZWZpbmUgXCJ0YWJMYWJlbHNcIixcblx0XHRnZXQ6IC0+IEBvcHRpb25zLnRhYkxhYmVsc1xuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0IyBhdm9pZCBjYWxsaW5nIF9jcmVhdGVUYWJzKCkgd2hlbiB0aGlzIHByb3BlcnR5IGlzIHNldCBmcm9tIGNvbnN0cnVjdG9yXG5cdFx0XHRpZiBAX19mcmFtZXJJbnN0YW5jZUluZm8/XG5cdFx0XHRcdEBvcHRpb25zLnNlbGVjdGVkVGFiSW5kZXggPSBNYXRoLm1pbihAc2VsZWN0ZWRUYWJJbmRleCwgdmFsdWUubGVuZ3RoIC0gMSlcblx0XHRcdFx0QG9wdGlvbnMudGFiTGFiZWxzID0gdmFsdWVcblx0XHRcdFx0QF9jcmVhdGVUYWJzKClcblx0QGRlZmluZSBcInNlbGVjdGVkVGFiSW5kZXhcIixcblx0XHRnZXQ6IC0+IEBvcHRpb25zLnNlbGVjdGVkVGFiSW5kZXhcblx0XHRzZXQ6ICh2YWx1ZSkgLT5cblx0XHRcdCMgYXZvaWQgY2FsbGluZyBzZWxlY3RUYWIoKSB3aGVuIHRoaXMgcHJvcGVydHkgaXMgc2V0IGZyb20gY29uc3RydWN0b3Jcblx0XHRcdGlmIEBfX2ZyYW1lckluc3RhbmNlSW5mbz9cblx0XHRcdFx0QG9wdGlvbnMuc2VsZWN0ZWRUYWJJbmRleCA9IHZhbHVlXG5cdFx0XHRcdEBzZWxlY3RUYWIgdmFsdWVcblx0IyB0aGUgZm9sbG93aW5nIGFyZSByZWFkLW9ubHkgYWZ0ZXIgdGhlIGNsYXNzIGlzIGNyZWF0ZWRcblx0QGRlZmluZSBcImZvbnRcIixcblx0XHRnZXQ6IC0+IEBvcHRpb25zLmZvbnRcblx0QGRlZmluZSBcImZvbnRTaXplXCIsXG5cdFx0Z2V0OiAtPiBAb3B0aW9ucy5mb250U2l6ZVxuXHRAZGVmaW5lIFwic2VsZWN0ZWRDb2xvclwiLFxuXHRcdGdldDogLT4gQG9wdGlvbnMuc2VsZWN0ZWRDb2xvclxuXHRAZGVmaW5lIFwiZGVzZWxlY3RlZENvbG9yXCIsXG5cdFx0Z2V0OiAtPiBAb3B0aW9ucy5kZXNlbGVjdGVkQ29sb3JcbiIsIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBR0FBO0FEQ0EsSUFBQSx3QkFBQTtFQUFBOzs7QUFBTTs7O0VBQ1Esc0JBQUMsT0FBRDtJQUFDLElBQUMsQ0FBQSw0QkFBRCxVQUFTO0lBQ3RCLENBQUMsQ0FBQyxRQUFGLENBQVcsSUFBQyxDQUFBLE9BQVosRUFDQztNQUFBLGVBQUEsRUFBaUIsT0FBakI7TUFDQSxXQUFBLEVBQWEsTUFEYjtNQUVBLGFBQUEsRUFBZTtRQUFBLElBQUEsRUFBTSxJQUFO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
