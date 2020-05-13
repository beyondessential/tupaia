import { exampleReducer } from './store';
import { reducer as authenticationReducer } from './authentication';

export const createReducers = () => ({
  example: exampleReducer,
  authentication: authenticationReducer,
});
