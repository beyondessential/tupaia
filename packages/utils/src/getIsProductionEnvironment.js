/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

export const getIsProductionEnvironment = () =>
  process.env.IS_PRODUCTION_ENVIRONMENT === 'true' && !process.env.CI_BUILD_ID;
