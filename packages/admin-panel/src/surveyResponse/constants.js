/**
 * Tupaia MediTrak
 * Copyright (c) 2018-2023 Beyond Essential Systems Pty Ltd
 */

export const RESUBMIT_SURVEY_RESPONSE_OPEN = 'RESUBMIT_SURVEY_RESPONSE_OPEN';
export const RESUBMIT_SURVEY_DISMISS = 'RESUBMIT_SURVEY_DISMISS';
export const RESUBMIT_SURVEY_START = 'RESUMIT_SURVEY_START';
export const RESUBMIT_SURVEY_END = 'RESUBMIT_SURVEY_END';
export const RESUBMIT_SURVEY_ERROR = 'RESUBMIT_SURVEY_ERROR';

export const DATA_CHANGE_ACTIONS = {
  start: RESUBMIT_SURVEY_START,
  finish: RESUBMIT_SURVEY_END,
  error: RESUBMIT_SURVEY_ERROR,
};

export const MODAL_STATUS = {
  INITIAL: 'initial',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};
