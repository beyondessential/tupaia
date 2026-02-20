import { REHYDRATE } from 'redux-persist';
import { hasVersionUpdated } from '../version';

/**
 * Helper function that returns a reducer based on an object that contains an entry for each action
 * type, with a function that describes what changes to state that action would cause. Assumes action
 */
export const createReducer =
  (defaultState = {}, stateChanges = {}, onRehydrate) =>
  (state = defaultState, action) => {
    const { type, payload, ...otherProps } = action;
    // Whether passed through in 'payload' or as a series of extra props, all data for this action
    // is passed through to state manipulator as one payload argument
    const fullPayload = { ...payload, ...otherProps };
    if (type && stateChanges && Object.prototype.hasOwnProperty.call(stateChanges, type)) {
      return {
        ...state,
        ...stateChanges[type](fullPayload, state),
      };
    }
    if (type === REHYDRATE && onRehydrate && payload) {
      const versionDidUpdate = payload.version && hasVersionUpdated(payload.version.currentVersion);
      let rehydratedState = defaultState;
      if (onRehydrate.length > 1) {
        // A reducer may opt in to handling version updates by receiving the second versionDidUpdate
        // argument in its onRehydrate function
        rehydratedState = onRehydrate(payload, versionDidUpdate);
      } else {
        // Reducers that do not handle version updates internally should just be reset to default
        rehydratedState = versionDidUpdate ? defaultState : onRehydrate(payload);
      }
      return rehydratedState || state;
    }
    return state; // Action type didn't match a change or a manipulator, return original state
  };
