const defaultConfig = {
  inproc: false,
  host: 'ws://127.0.0.1',
  port: 8080,
};

let config = defaultConfig;

if (typeof __TRACE_CONFIG__ === 'object') {
  config = __TRACE_CONFIG__;
}

config.isConnected = false;

export default config;