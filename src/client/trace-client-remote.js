export default class TraceClientRemote {
  constructor (SocketAdapter) {
    console.log(SocketAdapter.name);
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