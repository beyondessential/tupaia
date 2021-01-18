/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utilities';

import { DATA_CHANGE_ACTIONS as tableActions } from '../table';
import { DATA_CHANGE_ACTIONS as editorActions } from '../editor';

const defaultState = {
  isChangingDataOnServer: false,
};

const buildStateChangesFromDataChangeActions = dataChangeActions => ({
  [dataChangeActions.start]: () => ({ isChangingDataOnServer: true }),
  [dataChangeActions.finish]: () => ({ isChangingDataOnServer: false }),
  [dataChangeActions.error]: () => ({ isChangingDataOnServer: false }),
});

const stateChanges = {
  ...buildStateChangesFromDataChangeActions(tableActions),
  ...buildStateChangesFromDataChangeActions(editorActions),
};

export const reducer = createReducer(defaultState, stateChanges);
