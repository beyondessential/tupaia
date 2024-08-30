/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ReactNode } from 'react';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider as MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import { ReactQueryDevtools } from 'react-query/devtools';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from 'styled-components';
import { SnackbarProvider } from 'notistack';
import { theme } from './theme';
import { Toast } from './components';
import { CurrentUserContextProvider } from './api';
import { REDIRECT_ERROR_PARAM } from './constants';

const handleError = (error: any, query: any) => {
  if (error.responseData?.redirectClient) {
    // Redirect the browser to the specified URL and display the error
    window.location.href = `${error.responseData.redirectClient}?${REDIRECT_ERROR_PARAM}=${error.message}`;
  }

  if (!query?.meta || !query?.meta?.applyCustomErrorHandling) {
    // errorToast(error.message);
  }
};

const defaultQueryClient = new QueryClient({
  mutationCache: new MutationCache({
    // use the errorToast function to display errors by default. If you want to override this, apply an meta.applyCustomErrorHandling to the mutation
    onError: (error: any, _variables: any, _context: any, mutation: any) => {
      handleError(error, mutation);
    },
  }),
  queryCache: new QueryCache({
    // use the errorToast function to display errors by default. If you want to override this, apply an meta.applyCustomErrorHandling to the mutation or an onError to the query
    onError: handleError,
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: false,
      keepPreviousData: false,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

export const AppProviders = ({ children, queryClient = defaultQueryClient }: AppProvidersProps) => (
  <StylesProvider injectFirst>
    <MuiThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <CssBaseline />
          <SnackbarProvider
            Components={{
              success: Toast,
              error: Toast,
              warning: Toast,
              info: Toast,
            }}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <CurrentUserContextProvider>{children}</CurrentUserContextProvider>
          </SnackbarProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </MuiThemeProvider>
  </StylesProvider>
);
