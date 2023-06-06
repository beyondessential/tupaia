/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { AppStyleProviders } from './AppStyleProviders';
import { Router } from './Router';

const App = () => {
  return (
    <AppStyleProviders>
      <Router />
    </AppStyleProviders>
  );
};

export default App;
