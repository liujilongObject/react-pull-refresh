module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended'
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-react']
    }
  },
  plugins: ['react', 'react-hooks', 'prettier'],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    // React 相关规则
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // 代码风格规则
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'prefer-const': 'warn',
    'no-var': 'error',
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
    'no-trailing-spaces': 'error',
    'comma-dangle': ['error', 'never'],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'no-console': 'off',

    // Prettier 集成
    'prettier/prettier': ['error', {}, { usePrettierrc: true }]
  }
}; 