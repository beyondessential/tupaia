// mock implementation of `aws-sdk`, because `s3` folder within `@tupaia/utils` uses it but that
// breaks storybook
module.exports = {
  strict: () => {},
  Upload: () => ({
    done: async () => ({
      Location: 'testUrl',
    }),
  }),
  fromEnv: () => {},
  S3: () => {},
};
