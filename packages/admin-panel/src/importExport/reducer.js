/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { createReducer } from '../utilities';
import {
  IMPORT_EXPORT_START,
  IMPORT_EXPORT_ERROR,
  IMPORT_EXPORT_SUCCESS,
  IMPORT_EXPORT_DISMISS,
  IMPORT_DIALOG_OPEN,
  FILTERED_EXPORT_FETCH_BEGIN,
  FILTERED_EXPORT_FETCH_SUCCESS,
  FILTERED_EXPORT_TOGGLE,
  FILTERED_EXPORT_ERROR,
} from './constants';

const defaultState = {
  importEndpoint: null,
  isLoading: false,
  surveyData: [],
  selectedSurveyCodes: {},
  errorMessage: null,
};

const stateChanges = {
  [IMPORT_EXPORT_START]: () => ({ isLoading: true, errorMessage: defaultState.errorMessage }),
  [IMPORT_EXPORT_ERROR]: ({ errorMessage }) => ({ isLoading: false, errorMessage }),
  [IMPORT_EXPORT_SUCCESS]: () => defaultState,
  [IMPORT_EXPORT_DISMISS]: (payload, { errorMessage }) => {
    if (errorMessage) {
      return { errorMessage: defaultState.errorMessage }; // If there is an error, dismiss it
    }
    return defaultState; // If no error, dismiss the whole modal and clear its state
  },
  [IMPORT_DIALOG_OPEN]: ({ importEndpoint }) => ({
    importEndpoint,
  }),
  [FILTERED_EXPORT_FETCH_BEGIN]: () => ({}),
  [FILTERED_EXPORT_FETCH_SUCCESS]: state => ({ surveyData: state.surveyData }),
  [FILTERED_EXPORT_TOGGLE]: ({ selectedSurveyCode, checked }, { selectedSurveyCodes }) => {
    return {
      selectedSurveyCodes: {
        ...selectedSurveyCodes,
        [selectedSurveyCode]: checked ? selectedSurveyCode : null,
      },
    };
  },
};

export const reducer = createReducer(defaultState, stateChanges);
