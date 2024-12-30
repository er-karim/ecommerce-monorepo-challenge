module.exports = {
  clearMocks: true,
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
};
