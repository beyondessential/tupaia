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
const PDF_EXPORT = 'PDF_EXPORT';

// Search components
const MAP_OVERLAY = 'MAP_OVERLAY';
const REPORT = 'REPORT';
const PASSWORD_RESET_TOKEN = 'PASSWORD_RESET_TOKEN';
const VERIFY_EMAIL_TOKEN = 'VERIFY_EMAIL_TOKEN';
const OVERLAY_PERIOD = 'OVERLAY_PERIOD';
const REPORT_PERIOD = 'REPORT_PERIOD';
const MOBILE_TAB = 'MOBILE_TAB';

export const URL_COMPONENTS = {
  // Path components
  PROJECT,
  ORG_UNIT,
  DASHBOARD,
  PDF_EXPORT,

  // Search components
  MAP_OVERLAY,
  REPORT,
  PASSWORD_RESET_TOKEN,
  VERIFY_EMAIL_TOKEN,
  OVERLAY_PERIOD,
  REPORT_PERIOD,
  MOBILE_TAB,
};

export const PATH_COMPONENTS = [PROJECT, ORG_UNIT, DASHBOARD, PDF_EXPORT];
export const SEARCH_COMPONENTS = [
  MAP_OVERLAY,
  REPORT,
  PASSWORD_RESET_TOKEN,
  VERIFY_EMAIL_TOKEN,
  OVERLAY_PERIOD,
  REPORT_PERIOD,
  MOBILE_TAB,
];

export const LEGACY_PATH_PREFIXES = ['country', 'facility'];

export const SEARCH_PARAM_KEY_MAP = {
  [MAP_OVERLAY]: 'overlay',
  [MOBILE_TAB]: 'tab',
  [OVERLAY_PERIOD]: 'overlayPeriod',
  [REPORT]: 'report',
  [REPORT_PERIOD]: 'reportPeriod',
  [PASSWORD_RESET_TOKEN]: 'passwordResetToken',
  [VERIFY_EMAIL_TOKEN]: 'verifyEmailToken',
};

export const DEFAULT_PERIOD = 'DEFAULT_PERIOD';
export const PASSWORD_RESET_PREFIX = 'reset-password';
export const VERIFY_EMAIL_PREFIX = 'verify-email';
export const USER_PAGE_PREFIXES = [PASSWORD_RESET_PREFIX, VERIFY_EMAIL_PREFIX];
