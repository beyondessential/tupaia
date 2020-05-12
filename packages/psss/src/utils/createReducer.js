import { REHYDRATE } from 'redux-persist';

/**
 * Helper function that returns a reducer based on an object that contains an entry for each action
 * type, with a function that describes what changes to state that action would cause. Assumes action
 **/
export const createReducer = (defaultState = {}, actionHandlers = {}, onRehydrate) => (
  state = defaultState,
  action,
) => {
  const { type, ...payload } = action;

  // if this reducer supplied a rehydration handler and we're rehydrating, use it
  if (type === REHYDRATE) {
    return onRehydrate ? onRehydrate(payload) : state;
  }

  // if this reducer supplied an action handler for this action type, use it
  if (type && actionHandlers && Object.prototype.hasOwnProperty.call(actionHandlers, type)) {
    return {
      ...state,
      ...actionHandlers[type](payload, state),
    };
  }

  // action type didn't match a change or a manipulator, return original state
  return state;
};
