module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    testRegex: '.test.(ts|js)$',
    coverageDirectory: './coverage',
    collectCoverageFrom: ['src/**/*.{ts,js}'],
    coverageReporters: ['text', 'html'],
};
