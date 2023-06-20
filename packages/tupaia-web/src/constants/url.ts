/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { DEFAULT_ENTITY_CODE, DEFAULT_PROJECT_CODE } from './constants';

export const URL_SEARCH_PARAMS = {
  PROJECT: 'project',
  TAB: 'tab',
  PASSWORD_RESET_TOKEN: 'passwordResetToken',
};

export enum MODAL_ROUTES {
  PROJECTS = 'projects',
  LOGIN = 'login',
  REGISTER = 'register',
  FORGOT_PASSWORD = 'forgot-password',
  RESET_PASSWORD = 'reset-password',
  REQUEST_PROJECT_ACCESS = 'request-project-access',
  REQUEST_COUNTRY_ACCESS = 'request-country-access',
  VERIFY_EMAIL_RESEND = 'verify-email-resend',
}

export const DEFAULT_URL = `/${DEFAULT_PROJECT_CODE}/${DEFAULT_ENTITY_CODE}`;

export enum TABS {
  MAP = 'map',
  DASHBOARD = 'dashboard',
}
