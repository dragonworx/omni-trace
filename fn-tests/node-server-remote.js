const Server = require('../dist/server-remote');

const server = new Server();
server.start().then(() => {
  // server is running
});