export const getArrayFieldValue = array => (array.length === 0 ? undefined : array);

export const getTextFieldValue = text => (text === '' || text === null ? undefined : text);
