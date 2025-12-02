export const AM_PM_DATE_FORMAT = "h:mmaaaaa'm'";
export const DAY_MONTH_YEAR_DATE_FORMAT = 'dd/MM/yyyy';

export const FORM_FIELD_VALIDATION = {
  EMAIL: {
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
