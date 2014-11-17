// inspired by new Angular router, Durandal router ...
class Route {

  constructor(opts = {}) {
  }
  
  activate() {
    if (!@canActivate()) {
      return false;
    }
    @activated();
  }

  activated() {
    @log('activated')
  }

  canActivate() {
    return true;
  }
}


export default Route;
