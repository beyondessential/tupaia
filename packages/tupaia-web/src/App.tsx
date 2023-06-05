/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react'; 
import { RouterProvider } from 'react-router';
import { AppStyleProviders } from './AppStyleProviders';
import { Router } from './Router';

const App = () => {
  return (
    <AppStyleProviders>
      <RouterProvider router={Router} />
    </AppStyleProviders>
  );
};

export default App;
