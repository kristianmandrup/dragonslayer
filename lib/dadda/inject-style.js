var registerClass = require('./registerClass');
var async         = require('async');

var global = Function("return this")();
global.__CSS_registry = global.__CSS_registry || {};

function descriptorsToString(styleDescriptor, cb) {
  Absurd(dada.assemblage(styles)).compile(function(err, css) {
    cb(styleDescriptor.className + ' {\n' + css + '}\n');
  });
}

var DaddaInjector = {
  registerClass: registerClass,

  injectAll: function() {
    var tag = document.createElement('style');
    tag.innerHTML = this.getAllStyles(function(res) {
        document.getElementsByTagName('head')[0].appendChild(tag);
    });
  },

  inject: function(key) {
    var tag = document.createElement('style');
    tag.innerHTML = this.getStyle(key, function(res) {
      document.getElementsByTagName('head')[0].appendChild(tag);
    });
  },

  function addCss(regMapEntry, cb) {
    var registry = regMapEntry.registry;
    var key = regMapEntry.key;
    if (!registry.hasOwnProperty(key)) {
      return cb(null, '');
    }
    return cb(null, descriptorsToString(registry[key], function(css) {
      return css;
    }));
  },

  getStyle: function(key, cb) {
    var registry = global.__CSS_registry;
    var str = '';
    addCss(registry[key]), registry, function(err, result) {
      global.__CSS_registry = {};
      return cb(result);
    });
  },

  getAllStyles: function() {
    var registry = global.__CSS_registry;
    var regMap = Object.keys().map(function(key) {
      return {
        key: key,
        registry: registry
      }
    })

    async.concat(regMap, addCss, function(err, result) {
      global.__CSS_registry = {};
      return result;
    });

  }
};

module.exports = DaddaInjector;
