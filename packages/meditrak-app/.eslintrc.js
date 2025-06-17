/* eslint-env node */
module.exports = {
  extends: '@beyondessential/js',
  parser: '@babel/eslint-parser',
  plugins: ['react-native'],
  // 'env': {
  //   'react-native/react-native': true
  // },
  rules: {
    'react/destructuring-assignment': 'off',
    'react/prop-types': ['error', { ignore: ['navigation'] }],
  },
  ignorePatterns: ['.yarn/', 'android/', 'ios/', 'node_modules/', 'scripts/', '.eslintrc.js'],
};
