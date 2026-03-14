// https://docs.expo.dev/guides/using-eslint/
import globals from 'globals';
import { defineConfig } from "eslint/config";
import expoConfig from 'eslint-config-expo';


module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    files: ["**/*.test.js", "**/*.spec.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  {
    env: {
      jest: true,
    },
    settings: {
      'import/core-modules': ['@env'],
      'import/ignore': ['@env']
    },
  },

]);