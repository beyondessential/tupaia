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
      message: 'invalid email address',
    },
  },
  PASSWORD: {
    minLength: { value: 9, message: 'Must be at over 8 characters long' },
  },
};

export const MOBILE_BREAKPOINT = '900px';

export const ENLARGED_REPORT_CONTAINER_HEIGHT = '22.5rem';
