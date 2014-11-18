// Implementation of router interface using the crossroads router

### addRoute

`crossroads.addRoute(pattern, [handler], [priority]):Route`

Creates a new route pattern listener and add it to crossroads routes collection

Perhaps we should enable mounting a route on an existing route (reuse previous pattern as base)?
When a nested route is triggered, all routes it is mounted on also triggers!
Since it returns a `Route` object, we simply need to extend the `Route.prototype`
with an `addRoute` method and then setup some listener using Signals or similar.

`crossroads.removeRoute(route)`

Remove a single route from crossroads collection. If the route is a base for nested routes,
all the routes mounted on that route should also be removed and all listeners disabled!

`crossroads.parse(request[, defaultArgs])`

Parse a string input and dispatch matched Signal of the first Route that matches the request.
