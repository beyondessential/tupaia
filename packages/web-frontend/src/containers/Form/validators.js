/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import emailValidator from 'email-validator';

export const emailAddress = {
  validate: emailValidator.validate,
  error: 'Invalid email address',
};

export const passwordLength = {
  validate: password => password && password.length > 8,
  error: 'Password must be over 8 characters long.',
};

export const passwordMatch = {
  validate: (password, fields) => fields.password === password,
  error: 'Passwords do not match',
};

export const hasNoAlphaLetters = {
  validate: value => !value.match(/[a-zA-Z]/g),
  error: 'Should not contain any letters',
};
