module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '**/src/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/core/dm4-dataset-main.js',
    '!src/core/dm4-runtime.js',
    '!src/tests/**/*.js'
  ]
};
