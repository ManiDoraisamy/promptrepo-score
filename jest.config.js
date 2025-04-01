export default {
    transform: {},
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    testEnvironment: 'node',
    transformIgnorePatterns: [
        'node_modules/(?!natural)'
    ]
}; 