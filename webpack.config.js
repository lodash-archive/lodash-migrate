'use strict';

var _ = require('./lodash'),
  webpack = require('webpack'),
  env = _.last(process.argv);

var config = {
  'output': {
    'library': '_',
    'libraryTarget': 'umd'
  },
  'plugins': []
};

if (env == 'production') {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = config;
