import React from 'react';
import { addDecorator } from '@storybook/react';
import { StylesProvider } from "@material-ui/styles";
import { ThemeProvider } from '@material-ui/core/styles';
import theme from '../src/theme';

addDecorator(storyFn => <StylesProvider injectFirst>{storyFn()}</StylesProvider>);
addDecorator(storyFn => <ThemeProvider theme={theme}>{storyFn()}</ThemeProvider>);