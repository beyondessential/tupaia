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
const MAP_OVERLAY_ID = 'MAP_OVERLAY_ID';
const REPORT = 'REPORT';
const PASSWORD_RESET_TOKEN = 'PASSWORD_RESET_TOKEN';
const VERIFY_EMAIL_TOKEN = 'VERIFY_EMAIL_TOKEN';
const MEASURE_PERIOD = 'MEASURE_PERIOD';
const REPORT_PERIOD = 'REPORT_PERIOD';

export const URL_COMPONENTS = {
  // Path components
  PROJECT,
  ORG_UNIT,
  DASHBOARD,

  // Search components
  MAP_OVERLAY_ID,
  REPORT,
  PASSWORD_RESET_TOKEN,
  VERIFY_EMAIL_TOKEN,
  MEASURE_PERIOD,
  REPORT_PERIOD,
};

export const PATH_COMPONENTS = [PROJECT, ORG_UNIT, DASHBOARD];
export const SEARCH_COMPONENTS = [
  MAP_OVERLAY_ID,
  REPORT,
  PASSWORD_RESET_TOKEN,
  VERIFY_EMAIL_TOKEN,
  MEASURE_PERIOD,
  REPORT_PERIOD,
];

export const LEGACY_PATH_PREFIXES = ['country', 'facility'];

export const SEARCH_PARAM_KEY_MAP = {
  // Different to key
  [MAP_OVERLAY_ID]: 'overlay',
  [MEASURE_PERIOD]: 'overlayPeriod',

  // Just camel case
  [REPORT]: 'report',
  [PASSWORD_RESET_TOKEN]: 'passwordResetToken',
  [VERIFY_EMAIL_TOKEN]: 'verifyEmailToken',
  [REPORT_PERIOD]: 'reportPeriod',
};

export const PASSWORD_RESET_PREFIX = 'reset-password';
export const VERIFY_EMAIL_PREFIX = 'verify-email';

export const USER_PAGE_PREFIXES = [PASSWORD_RESET_PREFIX, VERIFY_EMAIL_PREFIX];
