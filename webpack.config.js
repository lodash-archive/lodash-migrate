'use strict';

var _ = require('./lodash'),
    webpack = require('webpack'),
    env = _.last(process.argv);

var config = {
  'output': {
    'library': '_',
    'libraryTarget': 'umd'
  }
};

if (env == 'production') {
  config.plugins = [
    new webpack.optimize.OccurrenceOrderPlugin,
    new webpack.optimize.UglifyJsPlugin({
      'compress': {
        'pure_getters': true,
        'unsafe': true,
        'warnings': false
      },
      'output': {
        'ascii_only': true,
        'max_line_len': 500
      }
    })
  ];
}

module.exports = config;
