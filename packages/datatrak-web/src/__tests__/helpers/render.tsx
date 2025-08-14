import React, { ReactNode } from 'react';
import { UseMutationResult, QueryClient } from '@tanstack/react-query';
import { MemoryRouter, Routes as Router } from 'react-router-dom';
import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { AppProviders } from '../../AppProviders';
import { Routes, SurveyRoutes } from '../../routes';

export function renderComponent(children: ReactNode) {
  const queryClient = new QueryClient();
  return render(<AppProviders queryClient={queryClient}>{children}</AppProviders>);
}

export function renderPage(activeUrl) {
  const queryClient = new QueryClient();
  return render(
    <AppProviders queryClient={queryClient}>
      <MemoryRouter initialEntries={[activeUrl]}>
        <Routes />
      </MemoryRouter>
    </AppProviders>,
  );
}

export function renderSurveyPage(activeUrl) {
  const queryClient = new QueryClient();
  return render(
    <AppProviders queryClient={queryClient}>
      <MemoryRouter initialEntries={[activeUrl]}>
        <Router>{SurveyRoutes}</Router>
      </MemoryRouter>
    </AppProviders>,
  );
}

// Utility function to render a mutation hook with the AppProviders wrapper
export const renderMutation = (
  hook,
  options = {},
): {
  result: {
    current: UseMutationResult;
  };
  waitFor: (callback: () => void) => Promise<void>;
} => {
  const wrapper = ({ children }) => <AppProviders>{children}</AppProviders>;
  return renderHook(hook, { wrapper, ...options });
};
