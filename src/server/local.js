export default class LocalServer {
  constructor () {
    this.buffer = [];
  }

  trace (event) {
    const bufferedEvent = {
      ...event,
      time: Date.now()
    }
    console.log('TRACE:', bufferedEvent);
    this.buffer.push(bufferedEvent);
  }
}