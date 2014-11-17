# Dragon Slayer


### Mercury

[mercury-jsxify]() will be used for generating the mercury virtual-dom from a pure txt based template.
We might soon use an approach similar to msx-reader in order to enable sweet.js macros as well.

## UI layer

### PocketGrid

Will be used as grid system alongside Bootstrap or Foundation, is now available as bower install

### DadaJS

Dynamic CSS via javascript built on top of [AbsurdJS](http://absurdjs.com/).

```js
var
  Absurd = require('absurd'),
  dada = require('dada'),
  styles = [/*your styles*/];

Absurd(dada.assemblage(styles)).compile(function(err, css) {
  if (err) {
    /// handle your error
  } else {
    // send or write your brand new CSS
  }
});
```

Extended Dada with `registerClass`, `inject(className)` and `injectAll()` so we can now
easily add component specific CSS classes to the DOM :)

Inspired by [RCSS](https://github.com/chenglou/RCSS) but using the superb CSS engine [DadaJS](https://github.com/stockholmux/dada-js)

Control all your artifacts with pure javascript!! No more limit to CSS hell and crazy hacks at pre-compilers such as less, scss and the like...

Note: If you really want, you can combine the approaches!!

### Data layer

The Data layer contains all entities which affect the Application state (model).
These can generally be divided into

- Routers (such as URL/history router)
- Data Services (that stream data into the model from some source)

## Crossroads

[Crossroads](http://millermedeiros.github.io/crossroads.js/) is the default router.
It is very flexible indeed :) We will use it together with [Hasher](https://github.com/millermedeiros/hasher/) and [SignalJS](http://millermedeiros.github.io/js-signals/)

The router matches a given path on registered routes and those that match are then triggered with the state matched. All matched routes and their match state is stored as a Route result map and sent to a state transformer which is responsible for updating the Application model. Any change of the App model will trigger a new re-render.

### Reactive UIs with Bacon

The DOM itself is a data source. Data from the DOM, such as clicking on elements (radios, checkboxes, ...) or entering data into input fields will cause streaming into the Application state.

This approach is well described in [Reactive Bacon](http://joshbassett.info/2014/reactive-uis-with-react-and-bacon/)

To facilitate this process, we will use Bacon bus directly. We also provide [Bacon DOM](https://github.com/kristianmandrup/bacon.jquery) as an option, which is a rework of Bacon.JQuery which integrate Bacon streams with:

- DOM API (html, events, effects, ...)
- Ajax requests
- Promises

The Bacon Ajax and Promise APIs can be used with Data services.

## CSP

[CspJS](https://github.com/srikumarks/cspjs) will be the main Async framework. It is a much nicer API for dealing with Async flows, even better than promises. We will likely also use the new ES6 generators.
