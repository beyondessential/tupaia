/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const accessPolicy = { DL: ['Public'] };
export const refreshToken = 'refreshToken';

const userId = 'xxx';
const checkPassword = password => password === 'validPassword';
export const verifiedUser = {
  id: userId,
  checkPassword,
  checkIsEmailUnverified: () => false,
};
export const unverifiedUser = {
  id: userId,
  checkPassword,
  checkIsEmailUnverified: () => true,
};
