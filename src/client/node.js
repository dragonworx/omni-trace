import TraceClientRemote from './trace-client-remote';
import NodeSocketAdapter from './adapter-socket-node';

const client = new TraceClientRemote(NodeSocketAdapter);

export default function trace (...args) {
  client.send(args);
}