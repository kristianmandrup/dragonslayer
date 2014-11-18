// inspired by new Angular router, Durandal router ...
// @Inject Logger
class Route {
  constructor(opts = {}) {
  }

  // executed right before we try to activate a route
  activate() {
    if (!@canActivate()) {
      return false;
    }
    @activated();
  }

  // fired when the route really IS activated
  activated() {
    @log('activated')
  }

  // determine if we can actually activate the given route
  // can be based on some security constraints ie. auth logic
  canActivate() {
    return true;
  }
}


export default Route;
