/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { AppProviders } from './AppProviders';
import { Router } from './Router';

const App = () => {
  return (
    <AppProviders>
      <Router />
    </AppProviders>
  );
};

export default App;
