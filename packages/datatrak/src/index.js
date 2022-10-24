/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { AppProviders } from './AppProviders';

const root = createRoot(document.getElementById('root'));
root.render(
  <AppProviders>
    <App />,
  </AppProviders>,
);
