/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

// Path components
const PROJECT = 'PROJECT';
const ORG_UNIT = 'ORG_UNIT';
const DASHBOARD = 'DASHBOARD';

// Search components
const MEASURE = 'MEASURE';
const REPORT = 'REPORT';
const PASSWORD_RESET_TOKEN = 'PASSWORD_RESET_TOKEN';
const TIMEZONE = 'TIMEZONE';
const START_DATE = 'START_DATE';
const END_DATE = 'END_DATE';
const DISASTER_START_DATE = 'DISASTER_START_DATE';
const DISASTER_END_DATE = 'DISASTER_END_DATE';
const VERIFY_EMAIL_TOKEN = 'VERIFY_EMAIL_TOKEN';

export const URL_COMPONENTS = {
  // Path components
  PROJECT,
  ORG_UNIT,
  DASHBOARD,

  // Search components
  MEASURE,
  REPORT,
  PASSWORD_RESET_TOKEN,
  TIMEZONE,
  START_DATE,
  END_DATE,
  DISASTER_START_DATE,
  DISASTER_END_DATE,
  VERIFY_EMAIL_TOKEN,
};

export const PATH_COMPONENTS = [PROJECT, ORG_UNIT, DASHBOARD];
export const SEARCH_COMPONENTS = [
  MEASURE,
  REPORT,
  PASSWORD_RESET_TOKEN,
  TIMEZONE,
  START_DATE,
  END_DATE,
  DISASTER_START_DATE,
  DISASTER_END_DATE,
  VERIFY_EMAIL_TOKEN,
];

export const SEARCH_PARAM_KEY_MAP = {
  [MEASURE]: 'overlay',
  [REPORT]: 'report',
  [PASSWORD_RESET_TOKEN]: 'passwordResetToken',
  [TIMEZONE]: 'timeZone',
  [START_DATE]: 'startDate',
  [END_DATE]: 'endDate',
  [DISASTER_START_DATE]: 'disasterStartDate',
  [DISASTER_END_DATE]: 'disasterEndDate',
  [VERIFY_EMAIL_TOKEN]: 'verifyEmailToken',
};

const PASSWORD_RESET_PREFIX = 'reset-password';
const VERIFY_EMAIL_PREFIX = 'verify-email';

export const USER_PAGE_PREFIXES = [PASSWORD_RESET_PREFIX, VERIFY_EMAIL_PREFIX];
