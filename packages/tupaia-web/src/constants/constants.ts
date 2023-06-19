/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export const DEFAULT_PROJECT_CODE = 'explore';
export const DEFAULT_ENTITY_CODE = 'explore';
export const DEFAULT_URL = `/${DEFAULT_PROJECT_CODE}/${DEFAULT_ENTITY_CODE}`;

export const TUPAIA_LIGHT_LOGO_SRC = '/images/tupaia-logo-light.svg';

export enum MODAL_ROUTES {
  PROJECTS = 'projects',
  LOGIN = 'login',
  REGISTER = 'register',
  FORGOT_PASSWORD = 'forgot-password',
  RESET_PASSWORD = 'reset-password',
  REQUEST_ACCESS = 'request-access',
  VERIFY_EMAIL_RESEND = 'verify-email-resend',
}
export const PROJECT_ACCESS_TYPES = {
  PENDING: 'PENDING',
  ALLOWED: 'ALLOWED',
  DENIED: 'DENIED',
};

export const FORM_FIELD_VALIDATION = {
  EMAIL: {
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'invalid email address',
    },
  },
  PASSWORD: {
    minLength: { value: 9, message: 'Must be at over 8 characters long' },
  },
};

export const PASSWORD_RESET_TOKEN_PARAM = 'passwordResetToken';

export enum TABS {
  MAP = 'map',
  DASHBOARD = 'dashboard',
}

export const TAB_PARAM = 'tab';

export const MOBILE_THRESHOLD = '900px';
