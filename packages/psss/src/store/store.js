import { createStore, compose, applyMiddleware, combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import thunk from 'redux-thunk';
import storage from 'redux-persist/lib/storage';
import { apiErrorInterceptor } from '../api/apiErrorInterceptor';

import { auth } from './auth';
import { entities } from './entities';
import { weeklyReports } from './weeklyReports';

const rootReducer = combineReducers({
  auth: persistReducer({ key: 'auth', storage, whitelist: ['user', 'isLoggedIn'] }, auth),
  entities: persistReducer({ key: 'entities', storage }, entities),
  weeklyReports,
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const enhancers = composeEnhancers(applyMiddleware(thunk));

const store = createStore(rootReducer, {}, enhancers);

apiErrorInterceptor(store);

export { store };
