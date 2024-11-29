module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    testRegex: '.test.(ts|js)$',
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{ts,js}'],
    coverageReporters: ['text', 'cobertura'],
};
