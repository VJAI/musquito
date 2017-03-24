var webpackConfig = require('./webpack.dev.config');

module.exports = function (config) {
  config.set({
    basePath: '.',
    frameworks: ['jasmine-ajax', 'jasmine'],
    files: [
      'src/**/Html5AudioPool.spec.js',
      {pattern: 'sounds/*.*', included: false}
    ],
    preprocessors: {
      'src/**/*.spec.js': ['webpack']
    },
    webpack: {
      module: webpackConfig.module,
      resolve: webpackConfig.resolve
    },
    coverageReporter: {
      type: 'text'
    },
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    plugins: [
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-jasmine-ajax',
      'karma-webpack',
      'karma-mocha-reporter'
    ],
    browsers: ['Chrome'],
    singleRun: false,
    concurrency: Infinity
  });
};
