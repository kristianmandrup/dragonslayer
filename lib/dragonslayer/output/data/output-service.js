// A service which feeds data into the adapter to an external source

import Service from '../../data/service';


class OutputService extends Service {
  constructor(opts = {}) {
    @streamer = opts.streamer;
    @adapter = opts.adapter;
  }
}

export default OutputService;
