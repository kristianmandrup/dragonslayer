// Adapter for Wakada backend goes here
// We will first target backend which support the new standardized SSE API

import SSEAdapter from './sse-adapter';

class WakadaAdapter extends SSEAdapter {
  constructor(opts = {}) {
    super();
  }
}


export default WakadaAdapter;
