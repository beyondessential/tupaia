import { createReducer } from './createReducer';

const createNestedStateChanger =
  (defaultNestedState, handleActionPayload) =>
  ({ reduxId: id, ...restOfPayload }, currentState) => {
    const ids = id ? [id] : Object.keys(currentState);
    const newState = {};
    ids.forEach(currentId => {
      const nestedState = currentState[currentId] || defaultNestedState;
      const stateChanges = handleActionPayload
        ? handleActionPayload(restOfPayload, nestedState)
        : restOfPayload;
      newState[currentId] = {
        ...nestedState,
        ...stateChanges,
      };
    });
    return newState;
  };

export const createNestedReducer = (defaultNestedState, nestedStateChanges) => {
  const stateChanges = {};
  Object.entries(nestedStateChanges).forEach(([actionType, actionHandler]) => {
    stateChanges[actionType] = createNestedStateChanger(defaultNestedState, actionHandler);
  });
  return createReducer(defaultNestedState, stateChanges);
};
