/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './AppProviders';
import { Routes } from './routes';
import { RedirectErrorHandler } from './api';

export const App = () => {
  return (
    <AppProviders>
      <BrowserRouter>
        <RedirectErrorHandler>
          <Routes />
        </RedirectErrorHandler>
      </BrowserRouter>
    </AppProviders>
  );
};
