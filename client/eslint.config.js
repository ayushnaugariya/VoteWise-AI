export default [
  {
    ignores: ['dist/**', 'coverage/**'],
  },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        afterEach: 'readonly',
        beforeEach: 'readonly',
        clearTimeout: 'readonly',
        console: 'readonly',
        describe: 'readonly',
        document: 'readonly',
        expect: 'readonly',
        fetch: 'readonly',
        FileReader: 'readonly',
        importScripts: 'readonly',
        IntersectionObserver: 'readonly',
        it: 'readonly',
        jest: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        process: 'readonly',
        ResizeObserver: 'readonly',
        setTimeout: 'readonly',
        SpeechSynthesisUtterance: 'readonly',
        URLSearchParams: 'readonly',
        vi: 'readonly',
        window: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-undef': 'error',
      'no-unused-vars': 'off',
    },
  },
];
