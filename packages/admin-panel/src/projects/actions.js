import { SET_SELECTED_PROJECT } from './constants';

export const setSelectedProject = project => ({
  type: SET_SELECTED_PROJECT,
  project: project || null,
});

export const clearSelectedProject = () => ({
  type: SET_SELECTED_PROJECT,
  project: null,
});
