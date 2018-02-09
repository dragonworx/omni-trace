const defaultConfig = {
  inproc: false,
  host: 'ws://127.0.0.1',
  port: 8080,
  clientId: null,
};

let config = defaultConfig;

if (typeof __TRACE__ === 'object') {
  config = __TRACE__;
} else {
  global.__TRACE__ = config;
}

config.isConnected = false;

export default config;