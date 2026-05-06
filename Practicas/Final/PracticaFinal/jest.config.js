export default {
    testEnvironment: 'node',
    transform: {},
    moduleFileExtensions: ['js'],
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverageFrom: ['src/**/*.js', '!src/index.js', '!src/app.js'],
    coveragePathIgnorePatterns: ['/node_modules/', '/tests/', '/config/', '/utils/AppError.js'],
    verbose: true,
    bail: false,
    detectOpenHandles: true,
    forceExit: true,
    testTimeout: 30000,
    maxWorkers: 1
};