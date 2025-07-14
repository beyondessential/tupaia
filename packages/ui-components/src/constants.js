export const AM_PM_DATE_FORMAT = "h:mmaaaaa'm'";
export const DAY_MONTH_YEAR_DATE_FORMAT = 'dd/MM/yyyy';

export const FORM_FIELD_VALIDATION = {
  EMAIL: {
    // pattern: {
    //   value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    //   message: 'Invalid email',
    // },
    required: {
      value: true,
      message: '*Required',
    },
  },
  PASSWORD: {
    minLength: { value: 8, message: 'Must be at least 8 characters long' },
    required: {
      value: true,
      message: '*Required',
    },
  },
};
