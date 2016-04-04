var path = require('path');
var webpack = require('webpack');
const output = path.join(__dirname, './lib/packed');
var config = require('config');
var webpackConfig = {
  devtool: 'eval',
  entry: {
    edit: ['./src/views/edit.js']
  },
  output: {
    path: output,
    filename: '[name].js',
    publicPath: '/js/'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.ProvidePlugin({
      'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    loaders: [{
      test: /\.js[x]?$/,
      loader: 'babel',
      query: {
        "presets": ["es2015", "react"],
        "plugins": []
      },
      exclude: /(node_modules)/,
    }, {
      test: /\.scss$/,
      loaders: ["style", "css?sourceMap", "resolve-url?sourceMap", "sass?sourceMap"]
    }, {
      test: /\.png$/,
      loader: "url-loader?limit=100000"
    }, {
      test: /\.jpg$/,
      loader: "file-loader"
    }, {
      test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
      loader: 'url-loader'
    }]
  },
  resolve: {
    extensions: ['', '.js', '.scss', '.jsx'],
    modulesDirectories: ['node_modules'],
  }
};

module.exports = webpackConfig;
