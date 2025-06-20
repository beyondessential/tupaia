const SURVEY_URL = '/survey/:countryCode/:surveyCode';

const SURVEY_RESUBMIT_BASE_URL = `${SURVEY_URL}/resubmit/:surveyResponseId`;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  OFFLINE: '/offline',
  REGISTER: '/register',
  REQUEST_ACCESS: '/request-access',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  SURVEY_SELECT: '/survey',
  PROJECT_SELECT: '/project',
  SURVEY: SURVEY_URL,
  SURVEY_SCREEN: `${SURVEY_URL}/:screenNumber`,
  SURVEY_SUCCESS: `${SURVEY_URL}/success`,
  SURVEY_REVIEW: `${SURVEY_URL}/review`,
  SURVEY_RESPONSE: `${SURVEY_URL}/response/:surveyResponseId`,
  SURVEY_RESUBMIT: SURVEY_RESUBMIT_BASE_URL,
  SURVEY_RESUBMIT_SCREEN: `${SURVEY_RESUBMIT_BASE_URL}/screen/:screenNumber`,
  SURVEY_RESUBMIT_REVIEW: `${SURVEY_RESUBMIT_BASE_URL}/review`,
  SURVEY_RESUBMIT_SUCCESS: `${SURVEY_RESUBMIT_BASE_URL}/success`,
  ACCOUNT_SETTINGS: '/account-settings',
  CHANGE_PROJECT: '/change-project',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_EMAIL_RESEND: '/verify-email-resend',
  REPORTS: '/reports',
  SYNC: '/sync',
  TASKS: '/tasks',
  TASK_DETAILS: '/tasks/:taskId',
  NOT_AUTHORISED: '/not-authorised',
  WELCOME: '/welcome',
  EXPORT_SURVEY_RESPONSE: 'export/:surveyResponseId',
  MOBILE_USER_MENU: '/more',
};

export const PASSWORD_RESET_TOKEN_PARAM = 'passwordResetToken';
export const PRIMARY_ENTITY_CODE_PARAM = 'primaryEntityCode';

export const ADMIN_ONLY_ROUTES = [
  ROUTES.REPORTS,
  ROUTES.SURVEY_RESUBMIT_SCREEN,
  ROUTES.SURVEY_RESUBMIT_REVIEW,
  ROUTES.SURVEY_RESUBMIT_SUCCESS,
  ROUTES.SURVEY_RESUBMIT,
];
