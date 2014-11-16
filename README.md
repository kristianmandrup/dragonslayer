## Dragon Slayer


## Reactive UIs with Bacon

http://joshbassett.info/2014/reactive-uis-with-react-and-bacon/

### DadaJS

Dynamic CSS via javascript!!

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

## PocketGrid

Will be used as grid system, when available as npm install.
