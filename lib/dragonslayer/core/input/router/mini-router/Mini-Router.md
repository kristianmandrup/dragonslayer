# Mini Router

Based on a simple router for Mercury

## Overview

- the anchor module writes to the state atom to trigger a new uri.
- the route view module is a pure rendering helper function that takes an uri and calls the correct view  based on an url pattern.
- the router itself listens to popstate and updates the state atom with a new uri, when the state atom is mutated it will write to the HTML5 history api to ensure that back & forward works. And it returns the url state atom, this can be plugged into a larger app and you can use the route view helper on it.

### The fine details

`routeAtom.set(href);` uses `mercury.value` found in [observ](https://github.com/Raynos/observ), a generic immutable observable value.

`atom(onRouteSet);` in `Router` means it will call `onRouteSet(uri)` with the `href` which will in turn call `pushHistoryState(uri)`

The `window.addEventListener('popstate', onPopState)` set up global listener on
`window.popstate` which is part of the [browser history api](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history)

The popstate event is triggered whenever we going back in browser history (such as via back button).
The handler `onPopState` sets `document.location.pathname` to the previous state, which is broadcast to any listeners via [geval](https://github.com/Raynos/geval).

```js
function popstate() {
    return source(function broadcaster(broadcast) {
        window.addEventListener('popstate', onPopState);

        function onPopState() {
            broadcast(String(document.location.pathname));
        }
    });
}
```

`broadcast` is available from within the context of `source` from [geval](https://github.com/Raynos/geval)

```js
function Source(broadcaster) {
    var tuple = Event()
    broadcaster(tuple.broadcast)
    return tuple.listen
}
```

Which uses the `broadcast` in `Event` via `tuple`

```js
function Event() {
    var listeners = []
    return { broadcast: broadcast, listen: event }
    function broadcast(value) {
      ...
```


But who is listening to this broadcast? This piece of logic inside `Router()` sets up the `onPopState` listener to listen for uri's popped from `window.history`.

```js
    var popstates = popstate();

    popstates(onPopState);

    function onPopState(uri) {
        inPopState = true;
        atom.set(uri);
    }
```

The actual routing is performed via `routeView`

```js
function routeView(defn, args) {
    if (args.base) {
        defn = Object.keys(defn)
            .reduce(function applyBase(acc, str) {
                acc[args.base + str] = defn[str];
                return acc;
            }, {});
    }

    // create match function using defn
    var match = routeMap(defn);

    // match route
    var res = match(args.route);
    if (!res) {
        // no route found, we should/could then route/redirect to error route ...
        throw new Error('router: no match found');
    }
```

## Usage

There are multiple ways to incorporate a `Router` in your app:

- ViewRouter
- ComponentRouter
- StateRouter

### Router view

You can directly route views via the `routeView` method, which can be set up to route
on a given route from the local view state

```js
routeView({
  '/': renderHome,
  '/animals': renderAnimals,
  '/animals/:id': renderAnimalItem
}, { route: state.route })
```

*Example use*

```js
  var mercury = require('mercury');
  var h = require('mercury').h;
  var anchor = require('mercury-route/anchor');
  var routeView = require('mercury-route/route-view');
  var Router = require('mercury-route/router');

  function State() {
    var state = mercury.struct({
      route: Router()
    });

    return { state: state }
  }

  mercury.app(document.body, State().state, render);

  function render(state) {
    return h('div', [
      menu(),
      routeView({
        '/': renderHome,
        '/animals': renderAnimals,
        '/animals/:id': renderAnimalItem
      }, { route: state.route })
    ])
  }

  function menu() {
    return h('ul', [
      h('li', [
        anchor({
          href: '/'
        }, 'Home')
      ]),
      h('li', [
        anchor({
          href: '/animals'
        }, 'Animals')
      ])
    ])
  }
}
```

### Router component

The Router component can be used as a base class for Components that want to use the Router

```js
var RouterComponent = function () {
  return Router().state;
};
RouterComponent.render = function (state, opts) {
  return routeView(opts, { route: state });
};
RouterComponent.anchor = anchor;
```

*Example"
