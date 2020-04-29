/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { createMuiTheme } from '@material-ui/core/styles';
import * as COLORS from './colors';

const themeName = 'Tupaia';
const palette = {
  primary: {
    main: COLORS.BLUE,
  },
  secondary: {
    main: COLORS.DARK_BLUE,
  },
  error: {
    main: COLORS.RED,
  },
  warning: {
    main: COLORS.RED,
    dark: COLORS.DARK_RED,
  },
  success: {
    main: COLORS.GREEN,
    dark: COLORS.DARK_GREEN,
  },
  text: {
    primary: COLORS.TEXTGREY,
    secondary: COLORS.TEXTGREY,
  },
  background: {
    default: COLORS.LIGHTGREY,
    paper: COLORS.WHITE,
  },
};
const typography = {
  h1: {
    fontSize: '3.125rem',
    fontWeight: 500,
    lineHeight: 1.18,
    letterSpacing: 0,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.18,
    letterSpacing: 0,
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.18,
    letterSpacing: 0,
  },
  h4: {
    fontSize: '1.3125rem',
    fontWeight: 600,
    lineHeight: 1.18,
    letterSpacing: 0,
  },
  h5: {
    fontSize: '1.3125rem',
    fontWeight: 500,
    lineHeight: 1.18,
    letterSpacing: 0,
  },
  h6: {
    fontSize: '1.125rem',
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
    fontSize: '0.9375rem',
    fontWeight: 400,
    lineHeight: 1.18,
    letterSpacing: 0,
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.18,
    letterSpacing: 0,
  },
  button: {
    textTransform: 'none',
    letterSpacing: '0.035em',
  },
};
const shape = { borderRadius: 3 };
const overrides = {
  MuiCard: {
    root: {
      borderColor: COLORS.GREY_DE,
    },
  },
};

export const theme = createMuiTheme({ palette, themeName, typography, shape, overrides });
