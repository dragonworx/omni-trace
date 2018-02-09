import TraceClientRemote from './trace-client-remote';
import BrowserSocketAdapter from './adapter-socket-browser';

const client = new TraceClientRemote(BrowserSocketAdapter);

export default function trace (...args) {
  client.send(args);
}