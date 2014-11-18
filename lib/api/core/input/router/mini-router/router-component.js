module.exports = RouterComponent;
var Router    = require('./router');
var anchor    = require('./route-anchor');
var routeView = require('./route-view');

var RouterComponent = function () {
  return Router().state;
};
RouterComponent.render = function (state, opts) {
  return routeView(opts, { route: state });
};

RouterComponent.anchor = anchor;
