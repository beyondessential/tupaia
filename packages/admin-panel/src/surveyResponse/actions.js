/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { RESUBMIT_SURVEY_RESPONSE_OPEN, RESUBMIT_SURVEY_DISMISS } from './constants';

export const openResubmitSurveyResponseModal = recordId => async dispatch => {
  dispatch({
    type: RESUBMIT_SURVEY_RESPONSE_OPEN,
    surveyResponseId: recordId,
  });
};

export const closeResubmitSurveyModal = () => ({
  type: RESUBMIT_SURVEY_DISMISS,
});
