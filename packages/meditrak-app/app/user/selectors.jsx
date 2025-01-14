const reducerName = 'newUser';

export const getUserFieldValue = (fieldKey, state) => state[reducerName][fieldKey];
export const getErrorMessage = state => state[reducerName].errorMessage;
export const getIsLoading = state => state[reducerName].isLoading;
export const getInvalidFields = state => state[reducerName].invalidFields;
