import thunk from 'redux-thunk';
import { applyMiddleware } from 'redux';
import { createNavigationMiddleware } from './navigation';

export const createMiddleware = thunkArguments =>
  applyMiddleware(createNavigationMiddleware(), thunk.withExtraArgument(thunkArguments));
