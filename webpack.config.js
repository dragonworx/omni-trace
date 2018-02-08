const webpack = require('webpack');

function config (opts) {
  return {
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
    externals: opts.externals || {}
  };
}

const configs = {
  "browser": {
    entry: './src/client/browser.js',
    filename: 'trace-client-browser.js',
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

const builds = ['browser'/*, 'production'*/];

module.exports = builds.map(name => config(configs[name]));