export default {
  overrides: [
    {
      files: 'public/.well-known/apple-app-site-association',
      options: {
        parser: 'json',
      },
    },
  ],
};
