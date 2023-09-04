/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

const SURVEY_URL = '/survey/:surveyCode';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  SURVEY_SELECT: '/survey',
  PROJECT_SELECT: '/project',
  SURVEY: SURVEY_URL,
  SURVEY_SCREEN: `${SURVEY_URL}/:screenNumber`,
  SURVEY_SUCCESS: `${SURVEY_URL}/success`,
  SURVEY_REVIEW: `${SURVEY_URL}/review`,
  QUESTIONS: 'questions',
  ACCOUNT_SETTINGS: '/account-settings',
  CHANGE_PROJECT: '/change-project',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_EMAIL_RESEND: '/verify-email-resend',
};
