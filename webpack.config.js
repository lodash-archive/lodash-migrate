'use strict';

var webpack = require('webpack')
var _ = require('./lodash')
var env = _.last(process.argv)

var config = {
    output: {
        library: '_',
        libraryTarget: 'umd'
    },
    plugins: []
};

if (env === 'production') {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin()
  )
}

module.exports = config
