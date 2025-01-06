/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { render as renderReactApp } from 'react-dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { EnvBanner } from '@tupaia/ui-components';
import { App } from './App';
import { AppProviders } from './AppProviders';

const render = () => {
  return renderReactApp(
    <AppProviders>
      <ReactQueryDevtools />
      <EnvBanner />
      <App />
    </AppProviders>,
    document.getElementById('root'),
  );
};

render(App);
