/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { render as renderReactApp } from 'react-dom';
import App from './App.tsx';
import { AppProviders } from './AppProviders.tsx';

renderReactApp(
  <AppProviders>
    <App />
  </AppProviders>,
  document.getElementById('root'),
);
