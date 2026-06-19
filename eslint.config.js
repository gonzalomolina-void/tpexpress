import prettier from 'eslint-config-prettier';

export default [
  prettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        __dirname: 'readonly',
        // ESM globals
        import: 'readonly',
        // Vitest globals
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly'
      }
    },
    rules: {
      // Enforce semicolons
      'semi': ['error', 'always'],
      
      // Enforce spacing before and after keywords
      'keyword-spacing': ['error', { 'before': true, 'after': true }],
      
      // Enforce space before blocks
      'space-before-blocks': ['error', 'always'],
      
      // Enforce blank lines before and after control structures
      'padding-line-between-statements': [
        'error',
        { 'blankLine': 'always', 'prev': '*', 'next': 'if' },
        { 'blankLine': 'always', 'prev': 'if', 'next': '*' },
        { 'blankLine': 'always', 'prev': '*', 'next': 'return' }
      ]
    }
  }
];
