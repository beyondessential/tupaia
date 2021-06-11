/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { StylesProvider } from '@material-ui/styles';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { MuiThemeProvider as V0MuiThemeProvider } from 'material-ui';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import { DARKENED_BLUE } from './styles';

export const AppStyleProviders = ({ children }) => {
  return (
    <StylesProvider injectFirst>
      <MuiThemeProvider
        theme={createMuiTheme({ palette: { type: 'dark', primary: { main: DARKENED_BLUE } } })}
      >
        <V0MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>{children}</V0MuiThemeProvider>
      </MuiThemeProvider>
    </StylesProvider>
  );
};

AppStyleProviders.propTypes = {
  children: PropTypes.any,
};

AppStyleProviders.defaultProps = {
  children: null,
};
