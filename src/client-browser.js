import TraceClient from './trace-client';
import BrowserSocketAdapter from './adapter-socket-browser';
import getAdapter from './adapter-factory';

const client = new TraceClient(getAdapter(BrowserSocketAdapter));

export default function trace (...args) {
  client.send(args);
}