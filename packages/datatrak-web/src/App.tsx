import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './AppProviders';
import { Routes } from './routes';
import { RedirectErrorHandler } from './api';
import { runLoadTest } from './PGLiteLoadTester';

export const App = () => {
  useEffect( () => {
    runLoadTest();
  }, []);

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
