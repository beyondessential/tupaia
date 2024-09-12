/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { createMuiTheme } from '@material-ui/core/styles';
import * as COLORS from './colors';

const themeName = 'Tupaia-Storybook';
const palette = {
  type: 'light',
  primary: {
    main: COLORS.BLUE,
    light: COLORS.LIGHT_BLUE,
  },
  secondary: {
    main: COLORS.DARK_BLUE,
    light: COLORS.LIGHT_BLUE,
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
    dark: COLORS.DARK_GREEN,
  },
  text: {
    primary: COLORS.TEXT_DARKGREY,
    secondary: COLORS.TEXT_MIDGREY,
    tertiary: COLORS.TEXT_LIGHTGREY,
  },
  contrastText: COLORS.TEXT_MIDGREY,
  grey: {
    100: COLORS.GREY_FB,
    200: COLORS.GREY_F1,
    300: COLORS.GREY_E2,
    400: COLORS.GREY_DE,
    500: COLORS.GREY_9F,
    600: COLORS.GREY_72,
  },
  background: {
    default: COLORS.WHITE,
    paper: COLORS.WHITE,
  },
  form: {
    border: COLORS.GREY_DE,
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
export const lightTheme = createMuiTheme({ palette, themeName, typography, shape, overrides });
