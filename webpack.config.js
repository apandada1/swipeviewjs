'use strict'
const webpack = require('webpack')

let config = {
  entry: './src/index.js',
  output: {
    path: __dirname,
    filename: "lib/index.js"
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  }
}
module.exports = config