export default class TraceClient {
  constructor (SocketAdapter) {
    this.socketAdapter = new SocketAdapter(this.onMessage);
    this.buffer = [];
  }

  send (...args) {
    const { socketAdapter, buffer } = this;

    buffer.push([...args]);

    if (socketAdapter.isConnected) {
      this.flush();
    } else {
      if (!socketAdapter.isConnecting) {
        socketAdapter.connect().then(() => {
          this.flush();
        });
      }
    }
  }

  flush () {
    const { socketAdapter, buffer } = this;
    // TODO: flush buffer to socket.send(...)
    // temp, show to console...
    while (buffer.length) {
      const row = buffer.shift();
      console.log('flush:', row);
      socketAdapter.send('trace', row);
    }
  }

  onMessage = data => {
    console.log('onMessage:', data);
  };
};