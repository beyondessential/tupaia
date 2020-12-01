/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { render as renderReactApp } from 'react-dom';
import { ReactQueryDevtools } from 'react-query-devtools';
import App from './App';
import { AppProviders } from './AppProviders';
import { store } from './store/store';

const render = () => {
  return renderReactApp(
    <AppProviders store={store}>
      <ReactQueryDevtools />
      <App />
    </AppProviders>,
    document.getElementById('root'),
  );
};

render(App);

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    render(NextApp);
  });
}
