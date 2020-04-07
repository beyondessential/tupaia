/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createMuiTheme } from '@material-ui/core/styles';
import * as COLORS from './colors';

const themeName = 'Tupaia-Storybook';
const palette = {
  primary: {
    main: COLORS.BLUE,
  },
  secondary: {
    main: COLORS.RED,
  },
  text: {
    primary: COLORS.TEXTGREY,
    secondary: COLORS.TEXTGREY,
  },
  background: {
    default: 'transparent', // use background addon to switch colors
    paper: COLORS.WHITE,
  },
};
const typography = {
  fontSize: 14,
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
export default createMuiTheme({ palette, themeName, typography, shape, overrides });
