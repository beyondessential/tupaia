import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './AppProviders';
import { PwaInstallPromptProvider } from './hooks/usePwaInstallPrompt';
import { Routes } from './routes';
import { RedirectErrorHandler } from './api';
import { NavigationBlockerProvider } from './utils';

export const App = () => {
  return (
    <AppProviders>
      <PwaInstallPromptProvider>
        <BrowserRouter>
          <NavigationBlockerProvider>
            <RedirectErrorHandler>
              <Routes />
            </RedirectErrorHandler>
          </NavigationBlockerProvider>
        </BrowserRouter>
      </PwaInstallPromptProvider>
    </AppProviders>
  );
};
