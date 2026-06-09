import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './AppProviders';
import { Routes } from './routes';
import { RedirectErrorHandler } from './api';
import { NavigationBlockerProvider } from './utils';

export const App = () => {
  return (
    <AppProviders>
      <BrowserRouter>
        <NavigationBlockerProvider>
          <RedirectErrorHandler>
            <Routes />
          </RedirectErrorHandler>
        </NavigationBlockerProvider>
      </BrowserRouter>
    </AppProviders>
  );
};
