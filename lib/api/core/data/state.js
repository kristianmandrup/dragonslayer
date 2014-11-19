class State {
  // creates immutable state using observ.struct
  constructor(state) {
    @state = struct(state);
  }
}


export default State;
