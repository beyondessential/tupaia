let currentProjectId = null;

export const setCurrentProjectId = id => {
  currentProjectId = id || null;
};

export const getCurrentProjectId = () => currentProjectId;

export const PROJECT_ID_PARAM = 'projectId';
