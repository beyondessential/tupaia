import React from 'react';
import { addDecorator, addParameters } from '@storybook/react';
import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../src/theme';
import * as COLORS from '../src/theme/colors';

addParameters({
  backgrounds: [
    { name: 'Paper', value: COLORS.WHITE, default: true },
    { name: 'Page', value: COLORS.LIGHTGREY },
    { name: 'Header', value: COLORS.BLUE },
    { name: 'Footer', value: COLORS.DARKGREY },
  ],
});

// Use also the ThemeProvider for Styled-Components so
// you can access the theme in your own css
addDecorator(storyFn => (
  <StylesProvider injectFirst>
    <MuiThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {storyFn()}
      </ThemeProvider>
    </MuiThemeProvider>
  </StylesProvider>
));
