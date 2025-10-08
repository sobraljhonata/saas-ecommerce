/* eslint-disable */
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    'no-restricted-properties': [
      'error',
      { object: 'process', property: 'env', message: 'Use @saas/shared-config (porta de configuração)' },
    ],
  },
};
