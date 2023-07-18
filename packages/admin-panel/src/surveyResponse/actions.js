/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import {
  RESUBMIT_SURVEY_RESPONSE_OPEN,
  RESUBMIT_SURVEY_DISMISS,
  RESUBMIT_SURVEY_END,
  RESUBMIT_SURVEY_START,
} from './constants';

export const openResubmitSurveyResponseModal = recordId => async dispatch => {
  dispatch({
    type: RESUBMIT_SURVEY_RESPONSE_OPEN,
    surveyResponseId: recordId,
  });
};

export const closeResubmitSurveyModal = () => ({
  type: RESUBMIT_SURVEY_DISMISS,
});

// resubmission modal is not using redux for saving, this is for triggering a data refresh
export const onAfterMutate = () => async dispatch => {
  dispatch({
    type: RESUBMIT_SURVEY_START,
  });
  dispatch({
    type: RESUBMIT_SURVEY_END,
  });
};
