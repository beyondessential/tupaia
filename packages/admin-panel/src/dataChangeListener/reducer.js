import { createReducer } from '../utilities';

import { DATA_CHANGE_ACTIONS as tableActions } from '../table';
import { DATA_CHANGE_ACTIONS as editorActions } from '../editor';
import { DATA_CHANGE_ACTIONS as resubmitSurveyActions } from '../surveyResponse';

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
  ...buildStateChangesFromDataChangeActions(resubmitSurveyActions),
};

export const reducer = createReducer(defaultState, stateChanges);
