import {
  RESUBMIT_SURVEY_DISMISS,
  EDIT_SURVEY_RESPONSE_END,
  RESUBMIT_SURVEY_RESPONSE_OPEN,
  EDIT_SURVEY_RESPONSE_START,
  ARCHIVE_SURVEY_RESPONSE_OPEN,
  ARCHIVE_SURVEY_RESPONSE_DISMISS,
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

export const openArchiveSurveyResponseModal = recordId => async dispatch => {
  dispatch({
    type: ARCHIVE_SURVEY_RESPONSE_OPEN,
    surveyResponseId: recordId,
  });
};

export const closeArchiveSurveyResponseModal = () => ({
  type: ARCHIVE_SURVEY_RESPONSE_DISMISS,
});

// resubmission modal is not using redux for saving, this is for triggering a data refresh
export const onAfterMutate = () => async dispatch => {
  dispatch({
    type: EDIT_SURVEY_RESPONSE_START,
  });
  dispatch({
    type: EDIT_SURVEY_RESPONSE_END,
  });
};
