export const getIsProductionEnvironment = () =>
  process.env.IS_PRODUCTION_ENVIRONMENT === 'true' && !process.env.CI_BUILD_ID;
