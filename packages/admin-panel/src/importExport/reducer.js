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
  EXPORT_DIALOG_OPEN,
} from './constants';

const defaultState = {
  isLoading: false,
  errorMessage: null,
  parentRecord: null,
  isImportDialogOpen: false,
  isExportDialogOpen: false,
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
  [IMPORT_DIALOG_OPEN]: () => ({
    isImportDialogOpen: true,
  }),
  [EXPORT_DIALOG_OPEN]: ({ parentRecord }) => ({
    parentRecord,
    isExportDialogOpen: true,
  }),
};

export const reducer = createReducer(defaultState, stateChanges);
