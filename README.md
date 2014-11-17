# Dragon Slayer

A reactive framework that empowers you to *slay Dragons* :)

![Dragon Slayer](../master/public/img/dragonslayer.jpg?raw=true)

## Design philosophy

The design is centered around a few simple, but powerful concepts:

- Input
- Model
- Output

Data flow is always uni-directional. No explicit two-way binding internally in the app.
We only allow for two-way bindings inside `Services` which communicate with external systems over some  2-way sync protocols (pub/sub, sockets etc.).

- input can affect the model (app state)
- model can cause side-effects in the form of output, such as UI updates

The general philosophy is outlined pretty well by [@Raynos](https://twitter.com/Raynos) in this [video](https://www.youtube.com/watch?v=RLAjMeR8898)

We also try to adhere to and encourage the use of small modules that can be swapped out and customized as you like. A flexible architecture is one of the goals. No "vendor lockin" here!

### Input

Any application input may affect the global model, either: directly or via a sub-state (lense)

Inputs can come from sources such as:

- Router (f.ex URL router - browser history stack)
- User input from the UI (such as field input)
- DataServices that:
  - Subscribe to external data streams (f.ex via [SSE](http://en.wikipedia.org/wiki/Server-sent_events))
  - Request external data given some action/event

### Model

The Model adheres to the following rules

- all state is immutable
- one global application state
- sub-states are lenses which encapsulate local state but affect global state

A single immutable application state allows for:

- time travel (undo/redo)
- versioning
- conflict resolution using strategies such as Operational Transformation

### Output

Output is seen as any side effect that occurs when the model is updated (creates new state).
An output can be thought of (and sometimes referred to) as a [sink](http://en.wikipedia.org/wiki/Sink_(computing))

Outputs can affect targets such as:

- browser history stack
- UI updates
- data written to external source:
  - sub application
  - local system (such as file system)
  - remote system (via remote protocal such as HTTP POST/PUT)

The rendering/templating system is simply an Output system.

#### Rendering

Rendering is done via `App.output`. It may cause whichever side-effect you desire, such as updating a [Document Object Model (DOM)](http://en.wikipedia.org/wiki/Document_Object_Model), a JSON model or writing to a log etc.

For convenience you can split up rendering into multiple rendering Components that each control the rendering of a specific part (lense) of the state to be rendered. A Component can render to any number of sinks via an asynchronous pipeline (using [CspJS](https://github.com/srikumarks/cspjs) or a similar ...)

### Nested Applications

An application is nothing more than a single immutable state, input sources and output [sinks](http://en.wikipedia.org/wiki/Sink_(computing)).

A sub application is simply a lense on the global model. Any change on the sub-app adheres to lense principles such that data changes may affect other models which the lense references.

This simple principle makes it super easy to divide your application into sub-apps any way you like.
Each sub-app can have their own router(s) which subscribe to the same events.

### Router

The Router is a composite which can take Routers and Routes as children.
The Router can subscribe to router events resulting from:

- browser history updates
- side effects (output) to model updates
- UI navigation events such as clicking on a link

Traversing browser history may traverse state history such that we get a complete undo/redo "for free".
Traversing state history directly will affect outputs only but may cause router side effects.

### Operational Transformation

We plan to support [Operational Transformation](http://en.wikipedia.org/wiki/Operational_transformation) via [ShareJS](http://sharejs.org/)

[Operational Transformation](http://en.wikipedia.org/wiki/Operational_transformation) is a class of algorithms that do multi-site realtime concurrency. OT is like realtime git. It works with any amount of lag (from zero to an extended holiday). It lets users make live, concurrent edits with low bandwidth. OT gives you eventual consistency between multiple users without retries, without errors and without any data being overwritten.

### Mercury

#### Virtual DOM Rendering

Mercury renders to a sink such as the DOM via a Virtual DOM (popularized by [React.js]()). This means
that we can control what gets re-rendered for any state change, and only re-render parts of the sink that would be affected by that particular change. A sink effect can be described as one of the operations:

- Create
- Patch
- Diff

[mercury-jsxify](https://github.com/Raynos/mercury-jsxify) can be used as syntactic sugar to generate a virtual-dom from a pure txt based template. In the future we might also allow for an approach similar to [jsx-reader](https://github.com/jlongster/jsx-reader) so we can include [sweet.js](http://sweetjs.org/) macros into the mix :)

## UI layer

The UI layer will be let you use [DadaJS](https://github.com/stockholmux/dada-js) for dynamic, javascript-empowered styling. Dada comes with nice DSL integration for [PocketGrid](http://arnaudleray.github.io/pocketgrid/) (grid layout)

### PocketGrid

Can be used as a grid system alongside any other layout system you like, such as [Bootstrap](getbootstrap.com), [Foundation](http://foundation.zurb.com/) etc.

### UI components

We encourage the community to create small, reusable UI components for popular UI libraries.

UI component sets

- [React Bootstrap](http://react-bootstrap.github.io/) - [repo](https://github.com/react-bootstrap/react-bootstrap/)

You can distribute components either individually or into logically grouped sets. We encourage smaller modules so it allows developers to pick and choose.

### Example UI component

[Badge](https://github.com/react-bootstrap/react-bootstrap/blob/master/src/Badge.jsx) could be implemented something like this...

Note: The fine details of this API is still a WIP.

```js
var Component = require('dragon-slayer/component');
var joinClasses = require('./utils/joinClasses');
var ValidComponentChildren = require('./utils/ValidComponentChildren');
var classSet = require('./utils/classSet');

// these two helpers should also be externalized as utils
var isString(children) => {
  return typeof children === 'string'
}

var validComponent(children) => {
  return ValidComponentChildren.hasValidComponent(children);
}

class BadgeComponent extends Component
  // TODO: somehow state.props will be populated with list of children!?
  state: {
    props: {
      pullRight: false  
    }
  },

  // made available inside render in r. scope
  helpers: class Helpers {
    get isBadge {
      var children = @state.children;
      return isString(children) || validComponent(children)
    }

    get className {
      return joinClasses(@state.className, classSet(@classes))
    }

    get classes {
      'pull-right': @state.pullRight,
      'badge': @isBadge
    }
  }

  render: function () {
    return (
      <span
        {@props}
        className={@r.className}>
        {@props.children}
      />
    );
  }
});

export default BadgeComponent;
```

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


## Dev tools

[Gobble](https://github.com/gobblejs/gobble) is used as the main build tool.

### Pckage managers

[Ender](enderjs.com) is used as a toolkit and for installing various packages in different formats. [JSPM](http://jspm.io/) is used to install and consume various package formats as ES6 modules.
