import TraceClient from './trace-client';
import BrowserSocketAdapter from './socket-adapter-browser';
import config from './host-config';

const client = new TraceClient(BrowserSocketAdapter);

function trace (...args) {
  client.send(args);
}

trace.config = function (host, port = 8080) {
  if (config.isConnected) {
    throw new Error('Trace host config cannot be set after client has connected, do it earlier.');
  }

  config.host = host;
  config.port = port;
};

export default trace;