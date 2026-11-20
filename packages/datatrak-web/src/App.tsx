import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './AppProviders';
import { Routes } from './routes';
import { RedirectErrorHandler } from './api';
import { NavigationBlockerProvider } from './utils';
import { FloatingSyncButton } from './layout';

export const App = () => {
  return (
    <AppProviders>
      <BrowserRouter>
        <NavigationBlockerProvider>
          <RedirectErrorHandler>
            <Routes />
            <FloatingSyncButton />
          </RedirectErrorHandler>
        </NavigationBlockerProvider>
      </BrowserRouter>
    </AppProviders>
  );
};
