/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';
import CssBaseline from '@material-ui/core/CssBaseline';
import { StoreProvider } from './StoreProvider';
import { theme } from '../theme';
import { TupaiaApi } from '../api';
import { ApiProvider } from './ApiProvider';

// eslint-disable-next-line react/prop-types
export const AdminPanelProviders = ({ children }) => {
  const api = new TupaiaApi();

  return (
    <StoreProvider api={api} persist>
      <ApiProvider api={api}>
        <StylesProvider injectFirst>
          <MuiThemeProvider theme={theme}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {children}
            </ThemeProvider>
          </MuiThemeProvider>
        </StylesProvider>
      </ApiProvider>
    </StoreProvider>
  );
};

// For use in external apps such as LESMIS
// eslint-disable-next-line react/prop-types
export const AdminPanelDataProviders = ({ children, config }) => {
  const api = new TupaiaApi(config);

  return (
    <StoreProvider api={api}>
      <ApiProvider api={api}>{children}</ApiProvider>
    </StoreProvider>
  );
};
