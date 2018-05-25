module.exports = function (config) {
  config.set({
    basePath: '.',
    frameworks: ['jasmine-ajax', 'jasmine'],
    files: [
      'tests/*.spec.js',
      { pattern: 'sounds/*.*', included: false }
    ],
    preprocessors: {
      'tests/*.spec.js': ['webpack', 'sourcemap', 'coverage']
    },
    webpack: {
      module: {
        loaders: [
          { test: /\.js$/, exclude: /node_modules/, loader: 'eslint-loader', enforce: 'pre' },
          { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
        ]
      },
      devtool: 'inline-source-map'
    },
    coverageReporter: {
      type: 'text'
    },
    reporters: ['mocha', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    plugins: [
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-jasmine-ajax',
      'karma-webpack',
      'karma-mocha-reporter',
      'karma-coverage',
      'karma-sourcemap-loader'
    ],
    browsers: ['Chrome'],
    singleRun: false,
    concurrency: Infinity
  });
};
