/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';
import CssBaseline from '@material-ui/core/CssBaseline';
import { PersistGateProvider } from './utils/PersistGateProvider';
import { theme } from './theme';

export const AppProviders = ({ children, store }) => {
  return (
    <Provider store={store}>
      <PersistGateProvider store={store}>
        <StylesProvider injectFirst>
          <MuiThemeProvider theme={theme}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {children}
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
