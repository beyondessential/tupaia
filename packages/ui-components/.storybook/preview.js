import React from 'react';
import { addDecorator, addParameters } from '@storybook/react';
import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../helpers/theme';
import * as COLORS from '../helpers/theme/colors';
import { AppProviders } from '../helpers/AppProviders';

addParameters({
  backgrounds: [
    { name: 'Paper', value: COLORS.WHITE, default: true },
    { name: 'Page', value: COLORS.LIGHTGREY },
    { name: 'Header', value: COLORS.BLUE },
    { name: 'Footer', value: COLORS.DARKGREY },
  ],
});

addDecorator(storyFn => (<AppProviders>{storyFn()}</AppProviders>));
