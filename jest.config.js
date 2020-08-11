module.exports = {
  moduleFileExtensions: ["js"],
  transform: {
    '^.+\\.(js)?$': 'babel-jest'
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  testMatch: [
    '<rootDir>/**/*.spec.(js)', '<rootDir>/(specs/**/*.spec.(js))'
  ],
  transformIgnorePatterns: ['<rootDir>/node_modules/']
};
