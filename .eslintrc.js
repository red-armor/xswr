module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    "plugin:react/recommended",
    "airbnb",
    "plugin:prettier/recommended"
  ],
  ignorePatterns: ["__test__/"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: "module"
  },
  plugins: ["react"],
  rules: {
    "no-plusplus": 0,
    "new-cap": 0,
    "no-underscore-dangle": 0,
    "no-use-before-define": 0,
    "no-param-reassign": 0,
    "react/no-this-in-sfc": 0,
    "func-names": 0
  }
}
