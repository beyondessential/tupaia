import { createReducer } from '../utilities';
import { LOGOUT } from '../authentication';
import { SET_SELECTED_PROJECT } from './constants';
import { readPersistedProject } from './storage';

const defaultState = {
  selectedProject: readPersistedProject(),
};

const stateChanges = {
  [SET_SELECTED_PROJECT]: ({ project }) => ({
    selectedProject: project,
  }),
  [LOGOUT]: () => ({
    selectedProject: null,
  }),
};

export const reducer = createReducer(defaultState, stateChanges);
