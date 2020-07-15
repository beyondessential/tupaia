/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import theme from '../stories/story-utils/theme';
import { ThemeProvider } from 'styled-components';
import CssBaseline from '@material-ui/core/CssBaseline';
import PropTypes from 'prop-types';

export const AppProviders = ({ children }) => (
  <StylesProvider injectFirst>
    <MuiThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </MuiThemeProvider>
  </StylesProvider>
);

AppProviders.propTypes = {
  children: PropTypes.any.isRequired,
};
