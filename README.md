## Dragon Slayer


### DaddaJS

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

## PocketGrid

Will be used as grid system, when available as npm install.    
