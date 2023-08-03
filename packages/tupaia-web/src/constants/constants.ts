/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export const TUPAIA_LIGHT_LOGO_SRC = '/images/tupaia-logo-light.svg';

export const PROJECT_ACCESS_TYPES = {
  PENDING: 'PENDING',
  ALLOWED: 'ALLOWED',
  DENIED: 'DENIED',
};

export const FORM_FIELD_VALIDATION = {
  EMAIL: {
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email',
    },
  },
  PASSWORD: {
    minLength: { value: 9, message: 'Must be over 8 characters long' },
  },
};

export const MOBILE_BREAKPOINT = '900px';
export const TOP_BAR_HEIGHT = '60px';
export const TOP_BAR_HEIGHT_MOBILE = '50px';
