import TraceClient from './trace-client';
import NodeSocketAdapter from './adapter-socket-node';
import getAdapter from './adapter-factory';

const client = new TraceClient(getAdapter(NodeSocketAdapter));

export default function trace (...args) {
  client.send(args);
}