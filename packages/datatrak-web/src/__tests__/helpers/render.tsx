/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { UseMutationResult, QueryClient } from 'react-query';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { AppProviders } from '../../AppProviders';
import { SurveyRoutes } from '../../routes';
import { SurveyContext } from '../../features';

export function renderComponent(children) {
  const queryClient = new QueryClient();
  return render(<AppProviders queryClient={queryClient}>{children}</AppProviders>);
}

export function renderPage(activeUrl) {
  const queryClient = new QueryClient();
  return render(
    <AppProviders queryClient={queryClient}>
      <MemoryRouter initialEntries={[activeUrl]}>
        <Routes>
          {/** Wrap the test routes in the context so surveys can be tested correctly */}
          <Route
            element={
              <SurveyContext>
                <Outlet />
              </SurveyContext>
            }
          >
            {SurveyRoutes}
          </Route>
        </Routes>
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
