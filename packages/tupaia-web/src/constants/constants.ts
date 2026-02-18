export const TUPAIA_LIGHT_LOGO_SRC = '/images/tupaia-logo-light.svg';

export const PROJECT_ACCESS_TYPES = {
  ALLOWED: 'ALLOWED',
  PENDING: 'PENDING',
  DENIED: 'DENIED',
};

export const FORM_FIELD_VALIDATION = {
  EMAIL: {
    required: {
      value: true,
      message: '*Required',
    },
  },
  PASSWORD: {
    minLength: { value: 8, message: 'Must be at least 8 characters long' },
  },
  CONTACT_NUMBER: {
    pattern: {
      value: /^[0-9-+() ]*$/,
      message: 'Invalid contact number',
    },
  },
};

export const MOBILE_BREAKPOINT = '900px';
export const TOP_BAR_HEIGHT = '60px';
export const TOP_BAR_HEIGHT_MOBILE = '50px';
