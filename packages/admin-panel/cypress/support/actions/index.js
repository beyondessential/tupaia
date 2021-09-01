/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { requireCyEnv } from '@tupaia/utils';

export * from './importSurvey';

export const loginAsSuperUser = () => {
  cy.login({
    email: requireCyEnv('CYPRESS_TEST_USER_EMAIL'),
    password: requireCyEnv('CYPRESS_TEST_USER_PASSWORD'),
  });
};
