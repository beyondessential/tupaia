/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

const SURVEY_URL = '/survey/:surveyCode';

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
  SURVEY_RESPONSE: `${SURVEY_URL}/survey-response/:surveyResponseId`,
  ACCOUNT_SETTINGS: '/account-settings',
  CHANGE_PROJECT: '/change-project',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_EMAIL_RESEND: '/verify-email-resend',
};

export const PASSWORD_RESET_TOKEN_PARAM = 'passwordResetToken';
