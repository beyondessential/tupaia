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
    light: COLORS.LIGHT_BLUE,
    dark: COLORS.DARK_BLUE,
  },
  secondary: {
    main: COLORS.LIGHT_BLACK,
    light: COLORS.EXTRA_LIGHT_BLACK,
  },
  error: {
    main: COLORS.RED,
    light: `${COLORS.LIGHT_RED}1A`, // 10% opacity
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
    primary: COLORS.LIGHT_BLACK,
    secondary: COLORS.TEXT_MIDGREY,
    tertiary: COLORS.TEXT_LIGHTGREY,
  },
  divider: COLORS.GREY_DE,
  blue: {
    100: COLORS.BLUE_F6,
    200: COLORS.BLUE_E8,
    300: COLORS.BLUE_BF,
  },
  grey: {
    100: COLORS.GREY_FB,
    200: COLORS.GREY_F1,
    300: COLORS.GREY_E2,
    400: COLORS.GREY_DE,
    500: COLORS.GREY_9F,
    600: COLORS.GREY_B8,
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
    fontSize: '0.875rem',
    fontWeight: 500,
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
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.2,
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

  MuiFormLabel: {
    root: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: palette.text.primary,
      '&.Mui-error': {
        color: palette.text.primary,
      },
    },
    asterisk: {
      color: palette.error.main,
    },
  },
  MuiInputBase: {
    input: {
      fontSize: '0.875rem',
      '&::placeholder': {
        color: COLORS.TEXT_LIGHTGREY,
      },
    },
  },
  MuiFormControl: {
    root: {
      '& legend': {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: palette.text.primary,

        '&.Mui-focused': {
          color: palette.text.primary,
        },
      },
    },
  },
  MuiOutlinedInput: {
    input: {
      paddingInline: '1.1rem',
      paddingBlock: '0.875rem',
    },
  },
  MuiMenuItem: {
    root: {
      fontSize: '0.875rem',
    },
  },
  MuiButton: {
    root: {
      '&.MuiButtonBase-root': {
        fontSize: '0.875rem',
      },
    },
  },
  MuiAlert: {
    standardError: {
      border: `1px solid ${COLORS.LIGHT_RED}`,
      color: palette.text.primary,
      paddingBlock: '0',
      '& > .MuiAlert-icon > .MuiSvgIcon-root': {
        padding: 0,
        fontSize: '1rem',
        marginBlockEnd: 0,
      },
    },
    message: {
      paddingBlock: '0.5rem',
    },
  },
  MuiCssBaseline: {
    '@global': {
      label: {
        fontWeight: 500,
      },
    },
  },
  MuiSvgIcon: {
    root: {
      '&.tooltip': {
        color: palette.text.secondary,
      },
      '&.checkbox': {
        fill: 'transparent',
      },
    },
  },
  MuiAvatar: {
    colorDefault: {
      backgroundColor: '#E7B091',
    },
  },
};

export const theme = createMuiTheme({ palette, themeName, typography, shape, overrides });
