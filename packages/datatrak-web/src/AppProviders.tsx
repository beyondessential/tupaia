/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ReactNode } from 'react';
import { MutationCache, QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider as MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from 'styled-components';
import { SnackbarProvider } from 'notistack';
import { theme } from './theme';
import { Toast } from './components';
import { errorToast } from './utils';
import { CurrentUserContext } from './api';

const defaultQueryClient = new QueryClient({
  mutationCache: new MutationCache({
    // use the errorToast function to display errors by default. If you want to override this, apply an meta.applyCustomErrorHandling to the mutation
    onError: (error: any, _variables: any, _context: any, mutation: any) => {
      if (!mutation?.meta || !mutation?.meta?.applyCustomErrorHandling) {
        errorToast(error.message);
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 0,
      keepPreviousData: false,
      // use the errorToast function to display errors by default. If you want to override this, apply an onError function to the query
      onError: (error: any) => {
        errorToast(error.message);
      },
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
          <CurrentUserContext>
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
              {children}
            </SnackbarProvider>
          </CurrentUserContext>
        </QueryClientProvider>
      </ThemeProvider>
    </MuiThemeProvider>
  </StylesProvider>
);
