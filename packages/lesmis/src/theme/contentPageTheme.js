/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { createMuiTheme } from '@material-ui/core/styles';
import * as COLORS from '../constants/colors';
import { palette, shape } from './theme';

const themeName = 'LESMIS-content';

const typography = {
  fontFamily: ['Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
  h1: {
    fontFamily: ['Poppins', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.6,
    letterSpacing: 0,
    color: COLORS.FONT_DARKGREY,
  },
  h2: {
    fontFamily: ['Poppins', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.6,
    letterSpacing: 0,
    color: COLORS.FONT_DARKGREY,
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.18,
    letterSpacing: 0,
    color: COLORS.FONT_MIDGREY,
  },
  body2: {
    fontSize: '1.125rem',
    fontWeight: 400,
    lineHeight: 1.18,
    letterSpacing: 0,
    color: COLORS.FONT_MIDGREY,
  },
};

export const overrides = {
  MuiTypography: {
    gutterBottom: {
      marginBottom: '0.8em',
    },
  },
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
    md: 780,
  },
};

export const contentPageTheme = createMuiTheme({
  palette,
  themeName,
  typography,
  shape,
  overrides,
  breakpoints,
});
