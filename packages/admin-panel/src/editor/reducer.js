/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utilities';
import {
  EDITOR_DATA_FETCH_BEGIN,
  EDITOR_DATA_FETCH_SUCCESS,
  EDITOR_DATA_EDIT_BEGIN,
  EDITOR_DATA_EDIT_SUCCESS,
  EDITOR_DISMISS,
  EDITOR_ERROR,
  EDITOR_FIELD_EDIT,
  EDITOR_OPEN,
} from './constants';

const defaultState = {
  errorMessage: '',
  isLoading: false,
  endpoint: null,
  recordId: null,
  recordData: null,
  fields: null,
  editedFields: {},
};

const stateChanges = {
  [EDITOR_DATA_FETCH_BEGIN]: payload => ({
    isLoading: true,
    ...payload,
  }),
  [EDITOR_DATA_EDIT_BEGIN]: payload => ({
    isLoading: true,
    ...payload,
  }),
  [EDITOR_DATA_FETCH_SUCCESS]: payload => ({
    isLoading: false,
    ...payload,
  }),
  [EDITOR_DATA_EDIT_SUCCESS]: payload => ({
    isLoading: false,
    ...payload,
  }),
  [EDITOR_ERROR]: payload => ({
    isLoading: false,
    ...payload,
  }),
  [EDITOR_DISMISS]: (payload, { errorMessage }) => {
    if (errorMessage) {
      return { errorMessage: defaultState.errorMessage }; // If there is an error, dismiss it
    }
    return defaultState; // If no error, dismiss the whole modal and clear its state
  },
  [EDITOR_OPEN]: payload => payload,
  [EDITOR_FIELD_EDIT]: ({ fieldKey, newValue }, { editedFields }) => ({
    editedFields: {
      ...editedFields,
      [fieldKey]: newValue,
    },
  }),
};

export const reducer = createReducer(defaultState, stateChanges);
