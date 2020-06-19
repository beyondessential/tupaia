/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import '@babel/polyfill';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';

import rootReducer from './reducers';
import { sanitizers } from './sanitizers';
import { historyMiddleware, gaMiddleware } from './utils';

import globalSagas from './sagas';
import disasterSagas from './disaster/sagas';
import projectSagas from './projects/sagas';

export default function configureStore(initialState) {
  const sagaMiddleware = createSagaMiddleware();

  const composeEnhancers = composeWithDevTools({ ...sanitizers });
  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(sagaMiddleware, historyMiddleware, gaMiddleware)),
  );

  const addSagas = sagas => sagas.map(sagaMiddleware.run);

  // Run all sagas so that they are watching actions coming through dispatch
  addSagas(globalSagas);
  addSagas(disasterSagas);
  addSagas(projectSagas);

  return store;
}
