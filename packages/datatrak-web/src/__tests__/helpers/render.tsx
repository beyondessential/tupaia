import React, { ReactNode } from 'react';
import { UseMutationResult, QueryClient } from '@tanstack/react-query';
import { MemoryRouter, Routes as Router } from 'react-router-dom';
import { act, renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import { AppProviders } from '../../AppProviders';
import { Routes, SurveyRoutes } from '../../routes';

export async function renderComponent(children: ReactNode) {
  const queryClient = new QueryClient();
  const result = render(<AppProviders queryClient={queryClient}>{children}</AppProviders>);
  await waitFor(() => expect(result.container.firstChild).toBeInTheDocument());

  return result;
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
export const renderMutation = async (
  hook,
  options = {},
): Promise<{
  result: {
    current: UseMutationResult;
  };
  waitFor: (callback: () => void) => Promise<void>;
}> => {
  const wrapper = ({ children }) => <AppProviders>{children}</AppProviders>;
  let hookResult;
  await act(async () => {
    hookResult = renderHook(hook, { wrapper, ...options });
    // Small delay to let async provider initialization complete
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  return hookResult;
};
