import React, { ReactNode } from 'react';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from 'styled-components';
import { SnackbarProvider } from 'notistack';
import { theme } from './theme';
import { Toast } from './components';
import { errorToast } from './utils';
import { CurrentUserContextProvider, DatabaseProvider, SyncProvider } from './api';
import { REDIRECT_ERROR_PARAM } from './constants';
import { useIsOfflineFirst } from './api/offlineFirst';

const handleError = (error: any, query: any) => {
  // Enhanced error logging to trace query errors
  console.group('🔴 Query/Mutation Error');
  console.error('Error message:', error?.message);
  console.error('Error name:', error?.name);
  console.error('Error stack:', error?.stack);
  console.error('Full error object:', error);
  console.error('Query/Mutation details:', {
    queryKey: query?.queryKey,
    queryHash: query?.queryHash,
    meta: query?.meta,
    state: query?.state,
  });
  console.groupEnd();

  if (error.responseData?.redirectClient) {
    // Redirect the browser to the specified URL and display the error
    window.location.href = `${error.responseData.redirectClient}?${REDIRECT_ERROR_PARAM}=${error.message}`;
  }

  if (!query?.meta?.applyCustomErrorHandling) {
    errorToast(error.message);
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
    mutations: {
      networkMode: 'offlineFirst',
    },
    queries: {
      keepPreviousData: false,
      networkMode: 'offlineFirst',
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

export const AppProviders = ({ children, queryClient = defaultQueryClient }: AppProvidersProps) => {
  const isOfflineFirst = useIsOfflineFirst();

  const SyncProviderContent = isOfflineFirst ? (
    <DatabaseProvider>
      <SyncProvider>
        <CurrentUserContextProvider>{children}</CurrentUserContextProvider>
      </SyncProvider>
    </DatabaseProvider>
  ) : (
    <CurrentUserContextProvider>{children}</CurrentUserContextProvider>
  );

  return (
    <StylesProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
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
              {SyncProviderContent}
            </SnackbarProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </MuiThemeProvider>
    </StylesProvider>
  );
};
