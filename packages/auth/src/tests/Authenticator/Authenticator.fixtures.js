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

const baseMeditrakDeviceDetails = {
  installId: 'zzz',
  platform: 'ios',
};
export const MEDITRAK_DEVICE_DETAILS = {
  modern: {
    ...baseMeditrakDeviceDetails,
    appVersion: '1.7.107',
  },
  ultraModern: {
    ...baseMeditrakDeviceDetails,
    appVersion: '5.42.0',
  },
  legacy: {
    ...baseMeditrakDeviceDetails,
    appVersion: '1.7.106',
  },
  ultraLegacy: {
    ...baseMeditrakDeviceDetails,
    appVersion: '0.5.1',
  },
};
