/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { generateId } from '@tupaia/database';

export const CAT_USER = {
  id: generateId(),
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
