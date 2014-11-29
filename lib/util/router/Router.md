# Router

The router is a specific way to handle Input (hits) to the slayer (state).
The concept of a Router was originally designed to be a way to route the application to a specific page (end-point) on the server, as part of "classical" server based MVC architecture.

It was later used to perform the same job on the client, activating specific controllers who instantiated specific views to be rendered in some kind of nested sequencing.

With the Reactive architecture, the job of the Router can be greatly simplified. It now just takes some external input (such as a route from any kind of data source) and each route that is triggered decides what should happen, such as rendering a specific component (inside a view rendition) or updating the application state.

### Crossroads

[Crossroads](http://millermedeiros.github.io/crossroads.js/) is the default router.
It is very flexible indeed :) We will use it together with [Hasher](https://github.com/millermedeiros/hasher/) and [SignalJS](http://millermedeiros.github.io/js-signals/)

The router matches a given path on registered routes and returns the first route that matches (using order they were added and priority).

<cite>
The parse algorithm is very straightforward, since the string patterns were already converted into regular expressions during addRoute the router just need to loop through all the routes (following the priority order) and check which one matches the current input. If it does find a route that matches the "request" it will check if route contains the special property rules and then it will validate each segment (capturing group). If after all that route is considered "matched" than the Route.matched signal is dispatched together with the crossroads.routed signal.

After v0.10.0 calling parse() multiple times on a row passing the same request will dispatch the matched/routed/bypassed signals only once.
</cite>

`crossroads.bypassed:Signal`

Signal dispatched every time that crossroads.parse can't find a Route that matches the request. Useful for debuging and error handling.

`crossroads.routed:Signal`

Signal dispatched every time that crossroads.parse find a Route that matches the request. Useful for debuging and for executing tasks that should happen at each routing.

`crossroads.create():Router`

Create a new independent Router instance. We should be able to nest (mount) Routers similar to Routes.

Since Crossroads uses JS-Signals for the event system it is easy to chain/pipe multiple Routers together.

```js
crossroads.routed.add(otherRouter.parse, otherRouter);
crossroads.bypassed.add(otherRouter.parse, otherRouter);
// same effect as calling: `crossroads.pipe(otherRouter)`
```

Here we add other routers to handle route success and/or routing failure. Interesting!

`crossroads.shouldTypecast:Boolean`

Set if crossroads should typecast route paths. By default doesn't typecast.

```js
crossroads.shouldTypecast = true; //default = false
crossroads.addRoute('/news/{id}', function(id){
    console.log(id); // 12 (remove trailing zeroes since it's typecasted)
});
crossroads.parse('/news/00012');
```

`crossroads.greedy:Boolean`

Sets global route matching behavior to greedy so crossroads will try to match every single route with the supplied request

`crossroads.pipe(Router)` and `crossroads.unpipe(Router)`

Pipe routers, so all crossroads.parse() calls will be forwarded to the other router as well.

```js
sectionRouter.pipe(navRouter);
// will also call `parse()` on `navRouter`
sectionRouter.parse('foo');
```

#### Route API

`Route.matched:Signal` Signal dispatched every time a request matches the route pattern.

```js
var route1 = crossroads.addRoute('/news/{id}');
route1.matched.add(function(id){
  console.log('handler 1: '+ id);
});
```

`Route.switched:Signal`

Signal dispatched every time a request "leaves" the route. Signal handlers will receive the "request" string passed to `crossroads.parse()`.

`Route.greedy:Boolean`

If crossroads should try to match this Route even after matching another Route.

Can be done on individual route. This would especially make sense for `loading` routes, which are triggered as the route is loading!!

All routes added should have either:
- a corresponding loading route added (if Router set to add this by default)
- allow to pass an option to add loading route?

Loading routes should always be greedy!

We propose:

```
Router.prototype.onRouteAdded( (route) => {
  this.addRoute('/loading').greedy();
});
```

Ember.Route events:

- willTransition
- didTransition
- error
- loading

See [error/load states](http://emberjs.com/guides/routing/loading-and-error-substates/)

If a route with the path `foo.bar.baz` returns a promise that doesn't immediately resolve, Ember will try to find a loading route in the hierarchy above `foo.bar.baz` that it can transition into, starting with `foo.bar.baz` parent:

- foo.bar.loading
- foo.loading
- loading

Similar to how the default loading event handlers are implemented, the default error handlers will look for an appropriate `error` substate to enter, if one can be found.

We can easily implement a similar approach :)

Nested routes has already be implemented (to some extent) by [@geigerzaehler](https://github.com/geigerzaehler/crossroads.js) and usage can be seen in [nested routes spec](https://github.com/geigerzaehler/crossroads.js/blob/master/dev/tests/spec/nested.spec.js)

```js
baseRoute = crossroads.addRoute('/base/{foo}');
childRoute = baseRoute.addRoute('child/{bar}');
baseRoute.addRoute('/another/child');
```

In effect this mounts the child routes on the existing route so that the child routes have the patterns:
`/base/{foo}/child/{bar}` and `/base/{foo}/another/child`, exactly how we want it:

```js
var childMatched = jasmine.createSpy();
childRoute.matched.add(childMatched);

crossroads.parse('/base/foo/child/bar');
expect(childMatched).toHaveBeenCalledWith('bar');
expect(ancestorMatched).toHaveBeenCalledWith('foo');
```

And we see that the ancestor (base) route is also called.

This implementation will switch the child route but not the ancestor route.


`Route.dispose()` Remove route from crossroads and destroy it, releasing memory.

`Route.match(request):Boolean`

Test if Route matches against request. Return true if request validate against route rules and pattern.

`Route.interpolate(replacements):String`

Return a string that matches the route replacing the capturing groups with the values provided in the replacements object. If the generated string doesn't pass the validation rules it throws an error

`Route.rules:Object`

Object used to configure parameters/segments validation rules.
Validation rules can be an `Array`, a `RegExp` or a `Function`:

```js
var route1 = crossroads.addRoute('/{section}/{date}/{id}');

//note that `rules` keys have the same as route pattern segments
route1.rules = {

    //match only values inside array
    section : ['blog', 'news', '123'],

    //validate dates on the format "yyyy-mm-dd"
    date : /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/,

    /*
     * @param {string|number|boolean} value  Request segment value.
     * @param {string} request  Value passed to crossroads.parse method.
     * @param {object} valuesObj  Values of all pattern segments.
     * @return {boolean} If segment value is valid.
     */
    id : function(value, request, valuesObj){
        if(isNaN(value)){
            return false;
        }else{
            if(+value < 100 && valuesObj.section == 'blog'){
                return true;
            }else if(valuesObj.section == 'news'){
                return true;
            }else{
                return false;
            }
        }
    },

    /**
     * `request_` is a special rule used to validate whole request
     * It can be an Array, RegExp or Function.
     * Note that request will be typecasted if value is a boolean
     * or number and crossroads.shouldTypecast = true (default = false).
     */
    request_ : function(request){
        return (request != '123');
    },

    /**
     * Normalize params that should be dispatched by Route.matched signal
     * @param {*} request Value passed to crossroads.parse method.
     * @param {object} vals All segments captured by route, it also have a
     *  special property `vals_` which contains all the captured values and
     *  also a property `request_`.
     * @return {array} Array containing parameters.
     */
    normalize_ : function(request, vals){
        //ignore "date" since it isn't important for the application
        return [vals.section, vals.id];
    }

};

route1.match("/foo/2011-05-04/2"); //false. {section} isn't valid
route1.match("/blog/20110504/2"); //false. {date} isn't valid
route1.match("/blog/2011-05-04/999"); //false. {id} is too high
route1.match("/blog/2011-05-04/2"); //true. all segments validate
```

Example RegExp pattern

```js
var route1 = crossroads.addRoute(/([\-\w]+)\/([\-\w]+)\/([\-\w]+)/);

//note that `rules` keys represent capturing group index
route1.rules = {
  '0' : ['blog', 'news', '123'],
  '1' : /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/,
  '2' : function(value, request, valuesObj){
          return ! isNaN(value);
        }
};
```

### Hasher

The Hasher library is a "Browser history manager", specifically designed to work with the Hash URL and the browser history. Hasher relies on SignalsJS.

It has a very simple and intuitive API

```js
  //handle hash changes
  function handleChanges(newHash, oldHash){
    console.log(newHash);
  }

  hasher.changed.add(handleChanges); //add hash change listener
  hasher.initialized.add(handleChanges); //add initialized listener (to grab initial value in case it is already set)
  hasher.init(); //initialize hasher (start listening for history changes)

  hasher.setHash('foo'); //change hash value (generates new history record)
```

#### Hash Bang!

Google have a proposal for making Ajax content crawlable by specifying that a certain hash value also have an static snapshot. Those hash values should start with an exclamation mark !:

```js
//default value is "/"
hasher.prependHash = '!';

//will update location.hash to "#!foo" -> htttp://example.com/#!foo
hasher.setHash('foo');
```

One of the greatest benefits of Hasher over other solutions is that it uses JS-Signals for the event dispatch, which provides many advanced features. This can be useful when you are setting the hash value and your changed handler doesn't need to be called (e.g. updating hash value during scroll).

```js
function setHashSilently(hash){
  hasher.changed.active = false; //disable changed signal
  hasher.setHash(hash); //set hash without dispatching changed signal
  hasher.changed.active = true; //re-enable signal
}

//set hash value without dispatching changed event (will generate history record anyway)
setHashSilently('lorem/ipsum');
```

### Redirection

Redirection can be achieved elegantly using `replaceHash` which won't keep the previous hash on the history record.

```js
function onHasherInit(curHash){
  if (curHash == '') {
    // redirect to "home" hash without keeping the empty hash on the history
    hasher.replaceHash('home');
  }
}
hasher.initialized.add(onHasherInit);
hasher.changed.add(console.log, console); // log all hashes
hasher.init();
```

### CrossRoads with Hasher

Example config:

```js
//setup crossroads
crossroads.addRoute('home');
crossroads.addRoute('lorem');
crossroads.addRoute('lorem/ipsum');
crossroads.routed.add(console.log, console); //log all routes

//setup hasher
function parseHash(newHash, oldHash){
  crossroads.parse(newHash);
}
hasher.initialized.add(parseHash); // parse initial hash
hasher.changed.add(parseHash); //parse hash changes
hasher.init(); //start listening for history change
```

### SignalsJS

Some advantages when using Signals as a Communication system:

- Trying to dispatch or listen to an event type that doesn't exist throws errors instead of failing silently which helps to identify errors early
- Easy control of the event broadcaster and subscriber, avoiding that the wrong objects reacts to the event
- Enable/disable event dispatching per event type
- Remove all event listeners attached to a specific event type
- Option to automatically remove listener after first execution
- Option to bind an execution context to the event handler, avoiding scope issues.
Remove/detach anonymous listener
- Favor composition over inheritance

Example usage:

```js
//custom object that dispatch a `started` signal
var myObject = {
  started : new signals.Signal()
};
function onStarted(param1, param2){
  alert(param1 + param2);
}
// operations on custom object: myObject.started which is a Signal
myObject.started.add(onStarted); //add listener
myObject.started.dispatch('foo', 'bar'); //dispatch signal passing custom parameters
myObject.started.remove(onStarted); //remove a single listener
```
