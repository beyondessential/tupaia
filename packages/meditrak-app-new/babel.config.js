module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'module:react-native-dotenv',
    [
      'react-native-reanimated/plugin',
      {
        globals: ['__scanCodes'],
      },
    ], // must be listed last
  ],
};
