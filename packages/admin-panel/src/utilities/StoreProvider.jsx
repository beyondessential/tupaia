/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import thunk from 'redux-thunk';
import { rootReducer } from '../rootReducer';

const initialState = {};
const enhancers = [];

if (import.meta.env.DEV) {
  const { __REDUX_DEVTOOLS_EXTENSION__ } = window;
  if (typeof __REDUX_DEVTOOLS_EXTENSION__ === 'function') {
    enhancers.push(__REDUX_DEVTOOLS_EXTENSION__());
  }
}

export const StoreProvider = React.memo(({ children, api }) => {
  const middleware = [thunk.withExtraArgument({ api })];
  const composedEnhancers = compose(applyMiddleware(...middleware), ...enhancers);
  const store = createStore(rootReducer, initialState, composedEnhancers);

  const queryClient = new QueryClient();

  api.injectReduxStore(store);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools />
        {children}
      </QueryClientProvider>
    </Provider>
  );
});

StoreProvider.propTypes = {
  api: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
};
