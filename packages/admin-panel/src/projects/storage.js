import { SELECTED_PROJECT_STORAGE_KEY } from './constants';

export const readPersistedProject = () => {
  try {
    const raw = window.localStorage.getItem(SELECTED_PROJECT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const writePersistedProject = project => {
  try {
    if (project) {
      window.localStorage.setItem(SELECTED_PROJECT_STORAGE_KEY, JSON.stringify(project));
    } else {
      window.localStorage.removeItem(SELECTED_PROJECT_STORAGE_KEY);
    }
  } catch {
    // ignore storage failures (e.g. private mode, quota)
  }
};
