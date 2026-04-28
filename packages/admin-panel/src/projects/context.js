let currentProjectCode = null;

export const setCurrentProjectCode = code => {
  currentProjectCode = code || null;
};

export const getCurrentProjectCode = () => currentProjectCode;

export const PROJECT_CODE_HEADER = 'X-Project-Code';
