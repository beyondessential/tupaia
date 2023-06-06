/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Alert } from '@tupaia/ui-components';
import { AppStyleProviders } from './AppStyleProviders.tsx';

const App = () => {
  return (
    <AppStyleProviders>
      <Alert>Alert</Alert>
      <h1>Tupaia web</h1>
    </AppStyleProviders>
  );
};

export default App;
