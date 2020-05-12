module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // https://github.com/facebook/jest/issues/9395
  // SyntaxError: Cannot use import statement outside a module #9395
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  }
}
