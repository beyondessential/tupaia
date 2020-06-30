/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { INITIAL_PROJECT_CODE, initialOrgUnit } from '../defaults';

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
  [PROJECT]: PROJECT,
  [ORG_UNIT]: ORG_UNIT,
  [DASHBOARD]: DASHBOARD,

  // Search components
  [MEASURE]: MEASURE,
  [REPORT]: REPORT,
  [PASSWORD_RESET_TOKEN]: PASSWORD_RESET_TOKEN,
  [TIMEZONE]: TIMEZONE,
  [START_DATE]: START_DATE,
  [END_DATE]: END_DATE,
  [DISASTER_START_DATE]: DISASTER_START_DATE,
  [DISASTER_END_DATE]: DISASTER_END_DATE,
  [VERIFY_EMAIL_TOKEN]: VERIFY_EMAIL_TOKEN,
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

export const DEFAULT_PROJECT = INITIAL_PROJECT_CODE;
const DEFAULT_ORG_UNIT = initialOrgUnit.organisationUnitCode;

export const PASSWORD_RESET_PREFIX = 'reset-password';
export const VERIFY_EMAIL_PREFIX = 'verify-email';

const DEFAULT_DASHBOARDS = {
  [DEFAULT_PROJECT]: 'General',
  disaster: 'Disaster Response',
};

export function getDefaultsForProject(projectCode = DEFAULT_PROJECT) {
  const defaultDashboard = DEFAULT_DASHBOARDS[projectCode] || DEFAULT_DASHBOARDS[DEFAULT_PROJECT];
  return [DEFAULT_ORG_UNIT, defaultDashboard];
}
