const webpack = require('webpack');

function config (opts) {
  return {
    target: opts.target || 'web',
    entry: opts.entry,
    output: {
      filename: opts.filename,
      path: opts.path || __dirname + '/dist',
      libraryTarget: 'umd',
      libraryExport: 'default',
      library: 'trace'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          query: {
            presets: ['env', 'stage-2']
          }
        }
      ]
    },
    stats: {
      colors: true
    },
    devtool: 'source-map',
    plugins: opts.plugins || [],
    externals: opts.externals || {},
    stats: {
      warnings: false
      /* Disables these warnings coming from ws. Don't seem to be a problem but add noise and not sure how to get rid of.

        WARNING in ./node_modules/bindings/bindings.js
        82:22-40 Critical dependency: the request of a dependency is an expression
        @ ./node_modules/bindings/bindings.js
        @ ./node_modules/bufferutil/index.js
        @ ./node_modules/ws/lib/BufferUtil.js
        @ ./node_modules/ws/lib/Sender.js
        @ ./node_modules/ws/index.js
        @ ./src/adapter-socket-node.js
        @ ./src/client-node.js
      */
    },
  };
}

const configs = {
  "server": {
    target: 'node',
    entry: './src/server/index.js',
    filename: 'server.js',
  },
  "client-browser": {
    entry: './src/client/browser.js',
    filename: 'trace-client-browser.js',
  },
  "client-node": {
    target: 'node',
    entry: './src/client/node.js',
    filename: 'trace-client-node.js',
  },
  "test-browser-client-bundle": {
    entry: './fn-tests/browser-client-bundle.js',
    filename: 'test-browser-client-bundle.js',
  },
  /*"production": {
    filename: 'trace.min.js',
    entry: './src/index.js',
    externals: {
      plugins: [
        new webpack.optimize.UglifyJsPlugin({ sourceMap: true }),
        new webpack.DefinePlugin({ TRACE_PROD: true })
      ]
    }
  }*/
};

const builds = ['server', 'client-browser', 'client-node', 'test-browser-client-bundle'];

module.exports = builds.map(name => config(configs[name]));