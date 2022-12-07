/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createStore, applyMiddleware, compose } from 'redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import thunk from 'redux-thunk';
import localforage from 'localforage';
import { persistReducer, persistStore } from 'redux-persist';
import { rootReducer } from '../rootReducer';
import { RememberMeTransform } from '../authentication/reducer';

const persistedRootReducer = persistReducer(
  {
    key: 'root',
    storage: localforage,
    transforms: [RememberMeTransform],
    whitelist: ['authentication'], // only persist logged in state
  },
  rootReducer,
);

const initialState = {};
const enhancers = [];

if (process.env.NODE_ENV === 'development') {
  const { devToolsExtension } = window;
  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension());
  }
}

export const StoreProvider = React.memo(({ children, api, persist }) => {
  const middleware = [thunk.withExtraArgument({ api })];
  const composedEnhancers = compose(applyMiddleware(...middleware), ...enhancers);
  const store = createStore(persistedRootReducer, initialState, composedEnhancers);
  const persistor = persistStore(store);
  const queryClient = new QueryClient();

  api.injectReduxStore(store);

  if (!persist) {
    return <Provider store={store}>{children}</Provider>;
  }

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools />
          {children}
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
});

StoreProvider.propTypes = {
  api: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  persist: PropTypes.bool,
};

StoreProvider.defaultProps = {
  persist: false,
};
