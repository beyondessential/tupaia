/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { AppStyleProviders } from './AppStyleProviders';
import { RouterProvider } from 'react-router-dom';
import { Router } from './Router';

const App = () => {
  return (
    <AppStyleProviders>
      <RouterProvider router={Router} />
    </AppStyleProviders>
  );
};

export default App;
