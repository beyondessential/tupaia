/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { PageRoutes } from './routes/PageRoutes';

// Todo: add language handling at top level. Either here or in page routes?!
export const App = () => (
  <Router>
    <PageRoutes />
  </Router>
);
