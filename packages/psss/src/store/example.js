import { createReducer } from '../utils/createReducer';

const defaultState = {
  counter: 0,
};

const handlers = {
  INCREMENT: (payload, state) => {
    return { ...state, counter: state.counter + 1 };
  },
};

export const exampleReducer = createReducer(defaultState, handlers);
