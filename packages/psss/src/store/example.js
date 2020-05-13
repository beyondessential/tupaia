import { createReducer } from '../utils/createReducer';

// actions

export const example = () => async (dispatch, getState, { api }) => {
  console.log('REDUX ACTION');
  console.log('getState', getState);
  console.log('api', api);

  dispatch({ type: 'INCREMENT' });
};

// selectors

// reducers

const defaultState = {
  counter: 0,
};

const handlers = {
  INCREMENT: (payload, state) => {
    return { ...state, counter: state.counter + 1 };
  },
};

export const exampleReducer = createReducer(defaultState, handlers);
