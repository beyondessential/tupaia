import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './AppProviders';
import { PwaInstallPromptProvider } from './hooks/usePwaInstallPrompt';
import { Routes } from './routes';
import { RedirectErrorHandler } from './api';

export const App = () => {
  return (
    <AppProviders>
      <PwaInstallPromptProvider>
        <BrowserRouter>
          <RedirectErrorHandler>
            <Routes />
          </RedirectErrorHandler>
        </BrowserRouter>
      </PwaInstallPromptProvider>
    </AppProviders>
  );
};
