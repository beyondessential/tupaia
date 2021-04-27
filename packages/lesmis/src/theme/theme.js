/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createMuiTheme } from '@material-ui/core/styles';
import * as COLORS from '../constants/colors';

const themeName = 'LESMIS';

export const palette = {
  primary: {
    main: COLORS.RED,
    light: COLORS.LIGHT_RED,
  },
  secondary: {
    main: COLORS.YELLOW,
  },
  error: {
    main: COLORS.RED,
    light: COLORS.LIGHT_RED,
  },
  warning: {
    main: COLORS.RED,
    light: COLORS.LIGHT_RED,
  },
  success: {
    main: COLORS.GREEN,
  },
  text: {
    primary: COLORS.FONT_DARKGREY,
    secondary: COLORS.FONT_MIDGREY,
    tertiary: COLORS.FONT_LIGHTGREY,
  },
  contrastText: COLORS.FONT_MIDGREY,
  grey: {
    100: COLORS.GREY_F1,
    400: COLORS.GREY_DE,
  },
  background: {
    default: COLORS.WHITE,
    paper: COLORS.WHITE,
  },
};

export const typography = {
  fontFamily: ['Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
  h1: {
    fontFamily: ['Poppins', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
    fontSize: '2rem',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: 0,
  },
  h2: {
    fontFamily: ['Poppins', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: 0,
  },
  h3: {
    fontFamily: ['Poppins', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.18,
    letterSpacing: 0,
  },
  h4: {
    fontFamily: ['Poppins', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
    fontSize: '1.3rem',
    fontWeight: 600,
    lineHeight: 1.18,
    letterSpacing: 0,
  },
  h5: {
    fontFamily: ['Poppins', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.18,
    letterSpacing: 0,
  },
  h6: {
    fontFamily: ['Poppins', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.18,
    letterSpacing: 0,
  },
  subtitle1: {
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.18,
    letterSpacing: 0,
  },
  subtitle2: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    lineHeight: 1.18,
    letterSpacing: 0,
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.18,
    letterSpacing: 0,
  },
  body2: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.18,
    letterSpacing: 0,
  },
  button: {
    textTransform: 'none',
    letterSpacing: '0.035em',
  },
};

export const shape = { borderRadius: 3 };

export const overrides = {
  MuiCard: {
    root: {
      borderColor: COLORS.GREY_DE,
    },
  },
};

export const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1440,
    xl: 1920,
  },
};

export const theme = createMuiTheme({
  palette,
  themeName,
  typography,
  shape,
  overrides,
  breakpoints,
});
