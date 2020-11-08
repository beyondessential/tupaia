/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utilities';
import { IMPORT_START, IMPORT_ERROR, IMPORT_SUCCESS } from './constants';

const defaultState = {
  isLoading: false,
  errorMessage: null,
  parentRecord: null,
};

const stateChanges = {
  [IMPORT_START]: () => ({ isLoading: true, errorMessage: defaultState.errorMessage }),
  [IMPORT_ERROR]: ({ errorMessage }) => ({ isLoading: false, errorMessage }),
  [IMPORT_SUCCESS]: () => defaultState,
};

export const reducer = createReducer(defaultState, stateChanges);
