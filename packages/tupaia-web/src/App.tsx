/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Router } from './Router';
import { useProjects, useUser } from './api/queries';

const App = () => {
  useUser();
  useProjects();
  // console.log('useQ', useQ);
  // console.log('projectQ', projectQ);
  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
};

export default App;
