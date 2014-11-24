# Dragon Slayer

A reactive framework that empowers you to *slay Dragons* :)

![Dragon Slayer](../master/public/img/dragonslayer.jpg?raw=true)

## Architecture outline

Dragon slayer is designed to be a minimalistic and extensible client/server web framework

The main file `lib/dragonslayer.js` sets up a basic "reference API" which you can customize to your
liking (see Slayer API below).

You can see this as conceptually a layered API, where you design your public API by referencing an underlying core API.

## Core API

The Core API consists of:

- core
- client
- server
- app

### Design philosophy

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

### Core Architecture

![Core Architecture](../master/public/img/Core-architecture.png?raw=true)

A very lean, clean and flexible architecture indeed :)

## Slayer API

The Slayer API is built by referencing the main API described above. This makes the slayer API completely detached and independent of the underlying API which allows you to easily substitute any part of the API with your own custom solutions.

The standard setup provides an API such as `dragon.armor`, which references the underlying Security API, but you can easily change the reference to point to another Security API or change parts of the API, such as Authorization via `dragon.armor.helmet`.

For fun and the heck of it (we all like Fantasy right?) we have decided to have the default Dragon Slayer API use concepts such as:

- Slayer : model layer
- Beast  : output layer
- Damage : input layer

The idea is that the Slayer (model) is at the centre of the app. When the slayers is struck by the beast (incoming data), which passes through the armor (security layer, auth) his/her body (model) is set to a new state (damage). The slayer then strikes back at the beast (output), using the model changes (weapons).

Body (model):
- armor (layers of armor: authentication, authorization, validation, ...)

Every creature (demon, beast, slayer) has a body which wraps its model (state).
Any body can wear one or more layers of armor which any attack must pass through to affect the body (ie. model state).

### Client

*Beast*
- `Beast.Attack` (Input):
  - claw - ui action events (field input, click, mouse, keyboard, ...)
  - tail - route change (f.ex from anchor click or url change)
  - breath - incoming data stream (data service)

- `Beast.Damage` (Output):
  - hit - ui update events
  - swing - route events
  - blow - outgoing data stream (data service)

*Slayer* (Model)
- `Slayer.Body` - body with armor
- `Slayer.Damage` - damage events received to body
- `Slayer.Attack` - attack events sent to beast

*Demon* (Data service)
- `Demon.Attack` - attack events sent to ghost
- `Demon.Damage` - damage events received from ghost, affecting body

A `Demon` acts as an intermediary between the application and external systems.
The Demon should use adapters to interact with external systems. We recommend using SSE for most remote protocols such as REST, sockets and file system watch/change events.

Demons may also directly read/write from file system or load/store from a database, especially for configuration purposes as the app is booted. When the app is running, it should avoid any blocking IO operations!

Client side Data adapters (Demons) subscribe on app server channels to send/receive SSEs that encapsulate incoming/outgoing data streams

### Server

The Server has a `Ghost` (with Server Data services) which creates and maintains data channels for Demons to subscribe to.

These SSE channels unify and abstract away the complexity of communicating with external systems via various different protocols

SSE adapters for external systems
- Input service (incoming data: real time sync & requested)
- Output service (outgoing data: real time sync & posted)

We will likely use [Restangular](https://github.com/mgonto/restangular/compare/2.0-wip) (without the small Angular facade) to communicate with REST APIs

### Dragon Slayer Architecture

![Dragon Slayer Architecture](../master/public/img/DragonSlayer-API-architecture.png?raw=true)

Using a vocabulary of attack, body and damage between different creatures should make the interactions much clearer. You are welcome to invent your own vocabulary for your own custom API. This one is just for inspiration and provide some ideas... Be creative!!

### Decoupled infrastructure

If you look at the Dragonslayer README you will get a good sense of the proposed infrastructure.
As you can see, the Router is designed to be completely decoupled from the rest of the system,
Only aware of some incoming request that needs to be parsed and only interacts with the outside by dispatching some kind of events (which can be customized).

The rest of the infrastructure should be designed along similar lines, using a Connector infrastructure, by default using [Signals.js](https://github.com/millermedeiros/js-signals).

Every infrastructure "component" should be decoupled and only interact with other infrastructure components by subscribing to and publishing events via these Connectors.

### Decoupled rendering

If we look at the recently popular React.js rendering infrastructure, we notice that the rendering is tightly coupled to DOM rendering. Same goes for Mercury.js which uses an independent [Virtual DOM library](https://github.com/Raynos/virtual-dom).

This VDOM library still expects to be passed a document, a render operation and an options hash with create, patch and diff operations to be performed on the document.

We should instead have the VDOM simply dispatch events for create, patch and diff passing along information about the virtual element, ie. `dispatch('create', vnode)`.

Then we could have Output components listen to such events and take full charge of rendering where it belongs (a system output effect).

I plan to redesign the Virtual DOM layer along these lines...

### App Model/State layer

The App model should capture both persistent model data and transient application state and avoid mixing them.

We could have the Full app state modelled as follows:

```js
App.globalModel = {
  transient: {...}
  model: { ...}
}
```

Any persistent state goes in `App.state.model` whereas all transient state is stored in `App.state.transient`.

To ensure encapsulation and information hiding, we should hide this behind a Facade API:
Any state mutation will create a new global state and trigger observers all the way up the parent hierarchy for lenses to be notified and update locally.

Get Post with id==32

```js
App.model('posts', 32).set(myPost)
```

Get Post with id==32 and set to myPost

```js
App.model('posts', 32).set(myPost)
```

Go one step back in App history

```js
App.state('route').set(App.history.pop())
```

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

### Sub-apps

For a super convenient way to define web apps, we again turn to [webpack](https://github.com/petehunt/webpack-howto))

```js
// webpack.config.js
module.exports = {
  entry: {
    Profile: './profile.js',
    Feed: './feed.js'
  },
  output: {
    path: 'build',
    filename: '[name].js' // Template based on keys in entry above
  }
};
```

### Routing to sub-apps

Essentially we want to have a Router which:

- Secures routes by authorising user access
- Asynchronously loads resources that the sub-app (route) requires

These powerful routing features can be achieved by [leveraging webpack](https://github.com/petehunt/webpack-howto)

```js
route('/feed', => {
  showLoadingState();
  require.ensure([], function() { // this syntax is weird but it works
    hideLoadingState();
    require('./feed').show(); // when this function is called, the module is guaranteed to be synchronously available.
  });
})

/// generalised, flexible loading pattern

loadRoute(path, hooks) {
  hooks = hooks || asyncLoadHooks;
  hooks.beforeRequire();
  require.ensure([], function() {
    hooks.beforeLoaded();
    require('.' + path).show();
    hooks.afterLoaded();
  });  
}

asyncLoadHooks = {
  beforeRequire: () => {
    showLoadingState();  
  },

  beforeLoaded: () => {
    hideLoadingState();
  },
  afterLoaded: () => {
  }
}

loadRoute('/feed')
```

We should likely use `System.import` instead and base package management on [JSPM]().

### Operational Transformation

We plan to support [Operational Transformation](http://en.wikipedia.org/wiki/Operational_transformation) via [ShareJS](http://sharejs.org/) in the future... please join in on this effort!!

[Operational Transformation](http://en.wikipedia.org/wiki/Operational_transformation) is a class of algorithms that do multi-site realtime concurrency. OT is like realtime git. It works with any amount of lag (from zero to an extended holiday). It lets users make live, concurrent edits with low bandwidth. OT gives you eventual consistency between multiple users without retries, without errors and without any data being overwritten.

## Body (data)

Any body in the system can wear layers of armor (security layers) to protect itself from damage (changes). A body can be physical or virtual (ethereal). A physical body is one where data is right there to be affected. A virtual body is a set of one or more events/signals that may affect a remote body.
In some cases, such as routing, we may wish to protect against even issuing those events (attacks), in effect we set up some defensive blocks (guards) from the attacks themselves. The body may then have its own armor which the attacks must penetrate later...

### Authorization

We encourage using whichever security layer/system fits any particular body (or body part - lense) of the application. Authorization will by default be based on  [permit-authorize](https://github.com/kristianmandrup/permit-authorize) but you should be able to easily configure or substitute with your own solution when and where you like ;)

Permit authorize is about to undergo some major refactoring to split it into several smaller modules that can be composed to form as complex or simple an authorization framework as you like...

### Authentication

For client-side OAuth2 Authentication we will likely use [Hello.js](http://adodson.com/hello.js/#quick-start). It looks like a very popular [github repo](https://github.com/MrSwitch/hello.js)

For Node server side Authentication, we will likely be using [Passport.js](http://passportjs.org/) or one of these [auth alternatives](https://nodejsmodules.org/tags/authorization)

For the client we will use JWT authentication, as described in this [egghead.io screencast](https://egghead.io/lessons/angularjs-basic-server-setup-for-jwt-authentication)

Here is a great article on [full Client/Server Passport.js app configuration for social login services](http://mherman.org/blog/2013/11/10/social-authentication-with-passport-dot-js/#.VHEbX5PF-wE)

[This Scotch.io Auth article](http://scotch.io/tutorials/javascript/easy-node-authentication-setup-and-local) is super cool as well, with some nice styling to boot!!

### Mercury

We are basing the View and Model layers on [Mercury.js](https://github.com/Raynos/mercury) by default, but you are free to substitute these layers to the extend that you like as well ;)

#### Virtual DOM Rendering

Mercury renders to a sink such as the DOM via a Virtual DOM, popularized by Facebook's [React.js](https://github.com/facebook/react) framework.
A good overview of React can be found [here](http://scotch.io/tutorials/javascript/learning-react-getting-started-and-concepts)

Using a reactive paradigm we can control what gets re-rendered for any state change, and only re-render parts of the sink (UI) that would be affected by that particular change. A sink effect can be described as one of the operations *Create* and *Patch*, by examining the difference between current and last state, using a *Diff*.

[mercury-jsxify](https://github.com/Raynos/mercury-jsxify) can be used as syntactic sugar to generate a virtual-dom from a pure txt based template. In the future we might also allow for an approach similar to [jsx-reader](https://github.com/jlongster/jsx-reader) so we can include [sweet.js](http://sweetjs.org/) macros into the mix :)

See the [Mercury FAQ](https://github.com/Raynos/mercury/blob/master/docs/faq.md) for more details on how to leverage its awesome power!!

As noted we need to decouple the Virtual DOM from any knowledge about that it is a virtual layer for.
It should just dispatch `create`, `patch` and `diff` events to some controller or dispatcher that is passed in.

We can further optimize VDom rendering by using [document.createDocumentFragment](https://developer.mozilla.org/en-US/docs/Web/API/document.createDocumentFragment) as I describe and outline in [VDom issue #16](https://github.com/Matt-Esch/vdom/issues/16)

I have also lately added functionality to achieve lazy observable, where the operations are cached and only executed just before the frame is rendered, packing together multiple operations as one so as not to notify the render of changes more than necessary... Still some experimentation and performance testing to do, but looks very promising as it can drastically reduce re-rendering in scenarios with rendered lists and streamed real-time data, which is becoming a common scenario, that has so far been difficult to deal with.

### Render optimizations

Just watched a few Chrome Dev presentations, such as [Wicked Fast](https://www.youtube.com/watch?v=v0xRTEf-ytE) where he indicated that the next Chrome releases will be up to x10 faster on typical application render! Wauw!

Also watched latest update on [Polymer](https://www.youtube.com/watch?v=kV0hgdMpH28) which promises to be super cool, and already has a great list display component which automatically does culling, so as not to display more list elements than can fit on the screen :)
With other optimizations outlined here, this should give us super fluid real-time data view experience close to native...

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

*Deprecated: See diagrams*

The Data layer contains all entities which affect the Application state (model).

In "Dragon speak", the Data layer is known as the `Body`, such as `Slayer.Body`

These can generally be divided into

- Routers (such as URL/history router)
- Data Services (that stream data into the model from some source)

## Crossroads Router

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

## Sample apps: Todo MVC & Blog

As soon as the basic infrastructure is in place, we will create a TodoMVC sample app leveraging the infrastructure to see how well it works. We will also create a Blogging app with posts and comments for
a typical REST style app with nested routes and data.

## Utils

Various utility packages used...

### Metadata, Annotations & Optional/Dynamic Type checking

This framework might make use of [flow.js](http://flowtype.org/) for optional type checking, but there
are also many other options...

## Dev tools

[Gobble](https://github.com/gobblejs/gobble) will be used as the main build tool.

## Dynamic module loading

[Instagram](https://www.youtube.com/watch?v=VkTCL6Nqm6Y) aggresively optimize their SPA load times, by loading parts of the app asynchronously as it is needed (by way of the router).

The use [webpack](https://github.com/petehunt/webpack-howto) to provide this functionality!

We should go the same route!!!

### Pragmatic CSS

Instagram recommends using a pragmatic CSS approach. Avoid nested CSS selector, only top lv.
Aggresively use namespacing. We could (perhaps) achieve this using AbsurdJS and namespace on a per=component basis, using fingerprint (md5 hash) or name of component as the namespace.

### Package managers

[Ender](enderjs.com) is used as a toolkit and for installing various packages in different formats. [JSPM](http://jspm.io/) is used to install and consume various package formats as ES6 modules.
