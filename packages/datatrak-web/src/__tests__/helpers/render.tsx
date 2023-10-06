/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { UseMutationResult, QueryClient } from 'react-query';
import { MemoryRouter, Routes } from 'react-router-dom';
import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { AppProviders } from '../../AppProviders';
import { SurveyPageRoutes } from '../../Routes';

// Fix this error in Jest "Jest did not exit one second after the test run has completed"
afterAll(done => {
  done();
});

export function renderComponent(children) {
  const queryClient = new QueryClient();
  return render(<AppProviders queryClient={queryClient}>{children}</AppProviders>);
}

export function renderPage(activeUrl) {
  const queryClient = new QueryClient();
  return render(
    <AppProviders queryClient={queryClient}>
      <MemoryRouter initialEntries={[activeUrl]}>
        <Routes>{SurveyPageRoutes}</Routes>
      </MemoryRouter>
    </AppProviders>,
  );
}

export function renderSurveyPage(activeUrl) {
  return renderPage(activeUrl);
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
