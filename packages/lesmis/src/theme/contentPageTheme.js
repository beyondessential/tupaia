import { createMuiTheme } from '@material-ui/core/styles';
import * as COLORS from '../constants/colors';
import { breakpoints, palette, shape, overrides } from './theme';

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
  h3: {
    fontFamily: ['Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.3,
    letterSpacing: 0,
    color: COLORS.FONT_DARKGREY,
  },
  body1: {
    fontSize: '1.125rem',
    fontWeight: 400,
    lineHeight: 1.8,
    letterSpacing: 0,
    color: COLORS.FONT_MIDGREY,
  },
  body2: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.8,
    letterSpacing: 0,
    color: COLORS.FONT_MIDGREY,
  },
};

export const newOverrides = {
  ...overrides,
  MuiTypography: {
    gutterBottom: {
      marginBottom: '0.8em',
    },
  },
};

export const contentPageTheme = createMuiTheme({
  palette,
  themeName,
  typography,
  shape,
  overrides: newOverrides,
  breakpoints,
});
