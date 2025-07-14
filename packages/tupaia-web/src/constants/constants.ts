export const TUPAIA_LIGHT_LOGO_SRC = '/images/tupaia-logo-light.svg';

export const PROJECT_ACCESS_TYPES = {
  ALLOWED: 'ALLOWED',
  PENDING: 'PENDING',
  DENIED: 'DENIED',
};

export const FORM_FIELD_VALIDATION = {
  EMAIL: {
    // pattern: {
    //   value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, // Case-insensitive regex for email validation
    //   message: 'Invalid email address',
    // },
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
