import LocalServer from './local';

const server = new LocalServer();

export default function trace (...args) {
  server.trace({
    clientId: 1,
    data: args
  });
}