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
