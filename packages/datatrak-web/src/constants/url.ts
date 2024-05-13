/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

const SURVEY_URL = '/survey/:countryCode/:surveyCode';

const SURVEY_RESUBMIT_BASE_URL = `${SURVEY_URL}/resubmit/:surveyResponseId`;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
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
  ACCOUNT_SETTINGS: '/account-settings',
  CHANGE_PROJECT: '/change-project',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_EMAIL_RESEND: '/verify-email-resend',
  REPORTS: '/reports',
  NOT_AUTHORISED: '/not-authorised',
};

export const PASSWORD_RESET_TOKEN_PARAM = 'passwordResetToken';

export const ADMIN_ONLY_ROUTES = [ROUTES.REPORTS, ROUTES.SURVEY_RESUBMIT_SCREEN];

export const SURVEY_ROUTE_OBJECTS = [
  {
    path: ROUTES.SURVEY_SCREEN,
  },
  {
    path: ROUTES.SURVEY_SUCCESS,
  },
  {
    path: ROUTES.SURVEY_REVIEW,
  },
  {
    path: ROUTES.SURVEY_RESPONSE,
  },
  {
    path: ROUTES.SURVEY_RESUBMIT_SCREEN,
  },
  {
    path: ROUTES.SURVEY_RESUBMIT_REVIEW,
  },
];
