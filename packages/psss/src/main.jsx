import React from 'react';
import { render as renderReactApp } from 'react-dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { EnvBanner } from '@tupaia/ui-components';
import App from './App';
import { AppProviders } from './AppProviders';
import { store } from './store/store';

const render = () => {
  return renderReactApp(
    <AppProviders store={store}>
      <ReactQueryDevtools />
      <EnvBanner />
      <App />
    </AppProviders>,
    document.getElementById('root'),
  );
};

render(App);
