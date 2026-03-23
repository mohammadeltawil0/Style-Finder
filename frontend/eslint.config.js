// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // This tells ESLint that @env is a virtual module and to ignore it
    settings: {
      'import/core-modules': ['@env'],
      'import/ignore': ['@env']
    },
  }
]);