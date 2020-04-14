/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

export default ({ children }) => (
  <Router>{children}</Router>
);