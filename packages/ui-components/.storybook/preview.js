import React from 'react';
import { addDecorator, addParameters } from '@storybook/react';
import { ThemeProvider, StylesProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../src/theme';
import * as COLORS from '../src/theme/colors';

// addDecorator(storyFn => <ThemeProvider theme={theme}>{storyFn()}</ThemeProvider>);
addParameters({
  backgrounds: [
    { name: 'Paper', value: COLORS.WHITE, default: true },
    { name: 'Page', value: COLORS.LIGHTGREY },
    { name: 'Header', value: COLORS.BLUE },
    { name: 'Footer', value: COLORS.DARKGREY },
  ],
});
addDecorator(storyFn => (
  <StylesProvider injectFirst>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {storyFn()}
    </ThemeProvider>
  </StylesProvider>
));
