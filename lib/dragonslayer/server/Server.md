# Server

The server part of Dragon slayer uses many of the same design philosophies.

### Server Side Events

We highly encourage unifying the interface to external data/service providers, such as through various external APIs and protocols.

SSE seems very fitting for this purpose, as it abstracts all communication with servers as channels that can be subscribed when certain events occur.

This pattern greatly facilitates abstracting away any external protocol, such as sockets, REST/SOAP APIs, file watchers etc.

You should wrap each such system as a set of SSE compatible channels that the session user can subscribe to given his credentials/profile and the Access Control rules that apply for that service.

Each external data provider should have an `SSEAdapter` which unifies communication with the external system. Then you can inject security rules (somehow?) via a `Shield`.
