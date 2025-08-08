import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';
import CssBaseline from '@material-ui/core/CssBaseline';
import { PersistGateProvider } from './utils/PersistGateProvider';
import { theme } from './theme';

const queryClient = new QueryClient();

export const AppProviders = ({ children, store }) => {
  return (
    <Provider store={store}>
      <PersistGateProvider store={store}>
        <StylesProvider injectFirst>
          <MuiThemeProvider theme={theme}>
            <ThemeProvider theme={theme}>
              <QueryClientProvider client={queryClient}>
                <CssBaseline />
                {children}
              </QueryClientProvider>
            </ThemeProvider>
          </MuiThemeProvider>
        </StylesProvider>
      </PersistGateProvider>
    </Provider>
  );
};

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
  store: PropTypes.object.isRequired,
};
