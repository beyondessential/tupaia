/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Router } from './Router';
import { useUser } from './api/queries/useUser.ts';
import { useProjects } from './api/queries';

const App = () => {
  const useQ = useUser();
  const projectQ = useProjects();
  // console.log('useQ', useQ);
  // console.log('projectQ', projectQ);
  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
};

export default App;
