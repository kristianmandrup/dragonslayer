// A service which feeds data into the model

class InputService extends Service {
  constructor(opts = {}) {
    @streamer = opts.streamer;
    @model = opts.model;
  }
}

export default InputService;
