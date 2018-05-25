import webpack from 'webpack';
import yargs from 'yargs';
import pkg from './package.json';

const { optimizeMinimize } = yargs.alias('p', 'optimize-minimize').argv;
const nodeEnv = optimizeMinimize ? 'production' : 'development';
const version = pkg.version;

export default {
  entry: { app: './src/Buzz.js' },
  output: {
    path: './dist',
    filename: optimizeMinimize ? `musquito-${version}.min.js` : `musquito-${version}.js`,
    library: 'musquito',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'eslint-loader', enforce: 'pre' },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(nodeEnv) }
    }),
    new webpack.BannerPlugin({
      banner:
`/*!
*  musquito v1.0.0 
*  http://musquitojs.com
*
*  (c) 2018 Vijaya Anand
*  http://prideparrot.com
*
*  MIT License
*/`,
      raw: true
    })
  ],
  devtool: optimizeMinimize ? 'source-map' : false
};

