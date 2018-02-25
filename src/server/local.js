import { output } from './ui';

export default class LocalServer {
  constructor () {
    this.buffer = [];
  }

  start (port) {
    output.log(`Trace Server started on port: {bold}${port ? port : 'in-proc'}{/}`)
  }

  trace (event) {
    const bufferedEvent = {
      ...event,
      time: Date.now()
    }
    output.log(`{bold}trace:{/} ${JSON.stringify(bufferedEvent)}`);
    this.buffer.push(bufferedEvent);
  }
}