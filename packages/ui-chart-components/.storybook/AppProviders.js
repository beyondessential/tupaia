/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';
import CssBaseline from '@material-ui/core/CssBaseline';
import PropTypes from 'prop-types';
import { lightTheme, darkTheme } from '../stories/story-utils/theme';

export const AppProviders = ({ params, children }) => {
  const theme = params?.theme === 'dark' ? darkTheme : lightTheme;
  return (
    <StylesProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </MuiThemeProvider>
    </StylesProvider>
  );
};

AppProviders.propTypes = {
  params: PropTypes.object,
  children: PropTypes.any.isRequired,
};

AppProviders.defaultProps = {
  params: null,
};
