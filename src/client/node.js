import TraceClient from './trace-client';
import NodeSocketAdapter from './socket-adapter-node';
import config from './host-config';

const client = new TraceClient(NodeSocketAdapter);

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