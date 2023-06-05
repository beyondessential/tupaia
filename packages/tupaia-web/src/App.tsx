/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Alert } from '@tupaia/ui-components';
import { AppProviders } from './AppProviders';

const App = () => {
  return (
    <AppProviders>
      <Alert>Alert</Alert>
      <h1>Tupaia web</h1>
    </AppProviders>
  );
};

export default App;
