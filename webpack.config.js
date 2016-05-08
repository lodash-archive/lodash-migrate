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
    new webpack.optimize.OccurenceOrderPlugin,
    new webpack.optimize.UglifyJsPlugin
  ];
}

module.exports = config;
