/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utilities';
import {
  IMPORT_START,
  IMPORT_ERROR,
  IMPORT_SUCCESS,
  IMPORT_DISMISS,
  IMPORT_DIALOG_OPEN,
} from './constants';

const defaultState = {
  isLoading: false,
  errorMessage: null,
  parentRecord: null,
  isImportDialogOpen: false,
  isExportDialogOpen: false,
};

const stateChanges = {
  [IMPORT_START]: () => ({ isLoading: true, errorMessage: defaultState.errorMessage }),
  [IMPORT_ERROR]: ({ errorMessage }) => ({ isLoading: false, errorMessage }),
  [IMPORT_SUCCESS]: () => defaultState,
  [IMPORT_DISMISS]: (payload, { errorMessage }) => {
    if (errorMessage) {
      return { errorMessage: defaultState.errorMessage }; // If there is an error, dismiss it
    }
    return defaultState; // If no error, dismiss the whole modal and clear its state
  },
  [IMPORT_DIALOG_OPEN]: () => ({
    isImportDialogOpen: true,
  }),
};

export const reducer = createReducer(defaultState, stateChanges);
