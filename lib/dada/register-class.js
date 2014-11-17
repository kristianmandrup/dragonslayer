var sha1 = require('sha1');

var defaultOptions = {prefix: 'c'};

function hashStyle(styleObj) {
  return sha1(JSON.stringify(styleObj));
}

function generateValidCSSClassName(styleId, options) {
  options = options || defaultOptions;
  // CSS classNames can't start with a number.
  return options.prefix + styleId;
}

var global = Function("return this")();
global.__CSS_registry = global.__CSS_registry || {};

function registerClass(styleObj, options) {
  options = options || defaultOptions;
  var classHash = hashStyle(styleObj);
  var styleId = generateValidCSSClassName(classHash, options);

  if (global.__CSS_registry[styleId] == null) {
    global.__CSS_registry[styleId] = {
      className: styleId,
      style: styleObj
    };
  }

  // Simple shallow clone
  var styleObj = global.__CSS_registry[styleId];
  return {
    className: styleObj.className,
    style: styleObj.style
  };
}

module.exports = registerClass;
