/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
export const URL_SEARCH_PARAMS = {
  PROJECT: 'project',
  TAB: 'tab',
  PASSWORD_RESET_TOKEN: 'passwordResetToken',
  MAP_OVERLAY: 'overlay',
  MAP_OVERLAY_PERIOD: 'overlayPeriod',
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

export const DEFAULT_URL = `/explore/explore/General`;

export enum TABS {
  MAP = 'map',
  DASHBOARD = 'dashboard',
}
export const DEFAULT_PERIOD_PARAM_STRING = 'DEFAULT_PERIOD';
