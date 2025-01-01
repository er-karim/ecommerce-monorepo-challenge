module.exports = {
  clearMocks: true,
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
