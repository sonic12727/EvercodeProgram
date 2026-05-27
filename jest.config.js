module.exports =
{
    testEnvironment: 'node',
    testMatch: ['**/src/**/*.test.js', '**/tests/**/*.test.js'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/*.test.js',
        '!src/index.js'
    ],
    coverageDirectory: 'coverage',
    verbose: true
};