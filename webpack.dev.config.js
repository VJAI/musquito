var HtmlWebpackPlugin = require('html-webpack-plugin');
var HotModuleReplacementPlugin = require('webpack').HotModuleReplacementPlugin;

module.exports = {
  entry: {app: './dev.js'},
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'eslint-loader', enforce: 'pre' },
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  devServer: {
    inline: true,
    hot: true
  },
  eslint: {
    failOnWarning: false,
    failOnError: true
  },
  plugins: [
    new HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: "./index.html",
      inject: true
    })
  ],
  devtool: 'eval-source-map'
};

