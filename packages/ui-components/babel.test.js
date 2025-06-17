const isTest = process.env.NODE_ENV === 'test';

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        modules: isTest ? 'commonjs' : false,
      },
    ],
    '@babel/preset-react',
  ],
  plugins: [
    [
      '@babel/plugin-proposal-class-properties',
      {
        loose: true,
      },
    ],
    [
      '@babel/plugin-proposal-private-property-in-object',
      {
        loose: true,
      },
    ],
    [
      '@babel/plugin-proposal-private-methods',
      {
        loose: true,
      },
    ],
  ],
};
