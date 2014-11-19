# Dragon Slayer

A reactive framework that empowers you to *slay Dragons* :)

![Dragon Slayer](../master/public/img/dragonslayer.jpg?raw=true)

## Architecture

Dragon slayer is designed to be a minimalistic and extensible client/server web framework

The main file `lib/dragonslayer.js` sets up a basic reference API which you can change to your
liking:

class Dragon {

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
  - remote system (via remote protocol such as HTTP POST/PUT)

The rendering/templating system is simply an Output system.

## Slayer API and naming

The Slayer API is built by referencing the main API. This makes it completely detached and independent. This allows you to easily substitute any part of the API with your own custom solution.

The standard setup provides an API such as `dragon.armor` which includes the Security API.
You can define your own API like this:

TODO: show example of custom API!

### Injection via macros

Still under consideration. Would be nice to use a macro syntax similar to AtScript for Angular 2, but then again, perhaps no need for this if we just hide imp. details under a nice API.

This is done by importing from a base layer with boring names such as `Model` and then renaming in the new context and injecting the pieces to form a (your) custom API.

```js
Import Model as Slayer from './model'
Import Config from '../config'

// @Inject Slayer as slayer
// @Inject Config as config
class Beast {
  constructor(opts = {}) {
  }
}
```

For fun and the heck of it (we all like Fantasy right?) we have decided to have the default Dragon Slayer API use concepts such as:

- Slayer : model layer
- Beast : output layer
- Damage : input layer

The idea is that the Slayer (model) is at the centre of the app. When the slayers is struck by the beast (incoming data), which passes through the armor (security layer, auth) his/her body (model) is set to a new state (damage). The slayer then strikes back at the beast (output), using the model changes (weapons).

Input:
- claw (ui events)
- tail (route changes)
- breath (incoming streamed data)

Output:
- slash (ui update)
- swipe (route change)
- blow (outgoing data streams)

Slayer:
- body (app model state)
- armor (security and auth)
- damage (incoming changes to model)
- strike (outgoing changes to affect: UI and external services)

### Architecture diagram

![Dragon Slayer Architecture](../master/public/img/Dragon-slayer-architecture.png?raw=true)

A very lean, clean and flexible architecture indeed :)

#### Rendering

Rendering can done as a side-effect of the `Output` layer. Output may cause whichever side-effect you desire, such as updating a [Document Object Model (DOM)](http://en.wikipedia.org/wiki/Document_Object_Model), a JSON model, sending updates to external services, writing to a log etc.

For convenience you can split up rendering into multiple rendering Components that each control the rendering of a specific part (lense) of the state to be rendered. A Component can render to any number of sinks via an asynchronous pipeline (using [CspJS](https://github.com/srikumarks/cspjs) or a similar ...)

Rendering can be done both on the front-end (browser DOM updates) and on the server (such as static site rendering for Search engine optimization, snapshots etc.)

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

We are currently developing a
[new Crossroads router](https://github.com/kristianmandrup/crossroads.js/tree/dev)...

We also include a Mini router as part of Dragon-slayer, based on a @Raynos implementation (from a gist of his). The idea is that you can use Routers anywhere you like in your architecture (where it makes sense) and depending on the context you should pick and choose the router which fits.

A common App architecture would likely be to use an advanced router for the general App "structure/layout" and then use mini-routers in components/views/widgets that need routing (for speed).

The Crossroads router being developed will be very modular, so that you can compose the router from various self-contained APIs to compose a router with just the level of complexity/functionality that you need...

### Operational Transformation

We plan to support [Operational Transformation](http://en.wikipedia.org/wiki/Operational_transformation) via [ShareJS](http://sharejs.org/) in the future... please join in on this effort!!

[Operational Transformation](http://en.wikipedia.org/wiki/Operational_transformation) is a class of algorithms that do multi-site realtime concurrency. OT is like realtime git. It works with any amount of lag (from zero to an extended holiday). It lets users make live, concurrent edits with low bandwidth. OT gives you eventual consistency between multiple users without retries, without errors and without any data being overwritten.

### Mercury

We are basing the View and Model layers on [Mercury.js](https://github.com/Raynos/mercury) by default, but you are free to substitute these layers to the extend that you like as well ;)

#### Virtual DOM Rendering

Mercury renders to a sink such as the DOM via a Virtual DOM (popularized by [React.js]()). This means
that we can control what gets re-rendered for any state change, and only re-render parts of the sink that would be affected by that particular change. A sink effect can be described as one of the operations:

- Create
- Patch
- Diff

[mercury-jsxify](https://github.com/Raynos/mercury-jsxify) can be used as syntactic sugar to generate a virtual-dom from a pure txt based template. In the future we might also allow for an approach similar to [jsx-reader](https://github.com/jlongster/jsx-reader) so we can include [sweet.js](http://sweetjs.org/) macros into the mix :)

See the [Mercury FAQ](https://github.com/Raynos/mercury/blob/master/docs/faq.md) for more details on how to leverage its awesome power!!

## UI Render layer

The UI rendering layer can render to multiple different types of UI:

- DOM API
- Canvas API
- Famo.us API
- ...

The view layer can even be set up to asynchronously render to multiple target view layers!!

### DOM rendering

The DOM render layer will let you use [DadaJS](https://github.com/stockholmux/dada-js) for dynamic, javascript-empowered styling. Dada comes with nice DSL integration for [PocketGrid](http://arnaudleray.github.io/pocketgrid/) (grid layout)

You can use whatever View/Component technology you want on a per-component basis. For a complex app, it might make sense to have some less complex but DOM intensive sections render super fast using a framework like Mithril while other sections may benefit from leveraging Mercury components etc.

We will try to provide a consistent "framing" (APIs) for you to fill in the full "picture" ;)

### PocketGrid

Can be used as a grid system alongside any other layout system you like, such as [Bootstrap](getbootstrap.com), [Foundation](http://foundation.zurb.com/) etc.

### UI components

We encourage the community to create small, reusable UI components for popular UI libraries.

Examples of Reactive UI component sets:

- [React Bootstrap](http://react-bootstrap.github.io/) - [repo](https://github.com/react-bootstrap/react-bootstrap/)

You can distribute components either individually or into logically grouped sets. We encourage smaller modules so it allows developers to pick and choose.

### Example UI component

[Bootstrap Badge](https://github.com/react-bootstrap/react-bootstrap/blob/master/src/Badge.jsx) could be implemented something like this...

Note: The fine details of this API is still a WIP.

```js
var Component = require('dragon-slayer/component');
var joinClasses = require('./utils/joinClasses');
var ValidComponentChildren = require('./utils/ValidComponentChildren');
var classSet = require('./utils/classSet');
var isString = require('...');
var validComponent = require('...');

// Note: This is "pseudo" syntax, (which could be) enabled via sweet.js macros
class BadgeComponent extends Component
  // TODO: somehow state.props will be populated with list of children!?
  state: {
    props: {
      pullRight: false  
    }
  },

  // made available inside render in r. scope
  helpers: class Helpers extends BaseHelpers {
    get classes {
      'pull-right': @state.pullRight,
      'badge': @validChildren
    }
  }

  // asynchronously renders for each key registered
  // @props directly references @state.props of component
  // any access will first try to find method in state scope,
  // then will fallback to look in render helpers scope (so @r. is not required)
  render: {
    dom: {
      options: // by convention uses App.render.config.dom by default
      build: function() {
        // jsx:dom
        <span
          {@props}
          className={@r.classes}>
          {@props.children}
        />
        );
      }
    },
    log: {
      ...
    },
    json: {
      options: App.render.config.customJson,
      build: function() {
        return ...
      },
      emit: function() {
        // write to file
      }
    }
  }
});

export default BadgeComponent;
```

We can globally define our render options for various render targets

```js
class Render
  config: {
    dom: function() {
      return {
        document: App.dom.document,
        operations: {
          create: function() { ... }
          patch:  function() { ... }
        }
      }
    },
    json: {
      document: {},
      operations: {
        create:
        patch:
      }

    },
    canvas: ...
  }
}

export default Render;
```

Here some reusable Component Helpers ...

```js
class BaseHelpers {
  get validChildren {
    var children = @state.children;
    return isString(children) || validComponent(children)
  }

  get className {
    return joinClasses(@state.className, classSet(@classes))
  }  
  ...
}

export default BaseHelpers;
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


## Utils

Various utility packages used...

### Metadata

This framework uses [flow.js](http://flowtype.org/) for optional type checking...


## Dev tools

[Gobble](https://github.com/gobblejs/gobble) is used as the main build tool.

### Package managers

[Ender](enderjs.com) is used as a toolkit and for installing various packages in different formats. [JSPM](http://jspm.io/) is used to install and consume various package formats as ES6 modules.
