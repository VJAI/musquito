module.exports = function (config) {
  config.set({
    basePath: '.',
    frameworks: ['jasmine-ajax', 'jasmine'],
    files: [
      'src/**/*.spec.js',
      { pattern: 'sounds/*.*', included: false }
    ],
    preprocessors: {
      'src/**/*.spec.js': ['webpack', 'sourcemap']
    },
    webpack: {
      module: {
        rules: [
          { test: /\.js$/, exclude: /node_modules/, loader: 'eslint-loader', enforce: 'pre' },
          { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
        ]
      },
      devtool: 'inline-source-map'
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
      'karma-mocha-reporter',
      'karma-sourcemap-loader'
    ],
    browsers: ['Chrome'],
    singleRun: false,
    concurrency: Infinity
  });
};
