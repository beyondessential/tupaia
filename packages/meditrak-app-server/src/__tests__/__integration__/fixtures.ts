/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { generateTestId } from '@tupaia/database';

export const API_CLIENT_NAME = 'meditrak-app-server@tupaia.org';
export const API_CLIENT_PASSWORD = 'test_api_client_password';

export const CAT_USER = {
  id: generateTestId(),
  firstName: 'Cat',
  lastName: 'Meow',
  email: 'cat@cathouse.com',
  password: 'dogbad',
  accessPolicy: {},
};
export const CAT_USER_SESSION = {
  email: 'cat@cathouse.com',
  accessToken: 'dog_cat',
  refreshToken: 'cat_dog',
};

export const USERS = [CAT_USER];

export const SESSIONS = [CAT_USER_SESSION];

export const CAT_QUESTION = { code: 'CAT_QUESTION', text: 'What kind of cat do you have?' };
export const CAT_SURVEY = {
  code: 'CAT_SURVEY',
  name: 'Cat Survey',
  questions: [CAT_QUESTION],
};
