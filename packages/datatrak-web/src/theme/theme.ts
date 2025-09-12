import { createTheme } from '@material-ui/core';
import { DESKTOP_BREAKPOINT } from '../constants';

const overMobileBreakpoint = `@media (min-width: ${DESKTOP_BREAKPOINT})`;

const palette = {
  type: 'light',
  primary: {
    main: '#328DE5', // Main blue (as seen on primary buttons)
    dark: '#004167',
  },
  secondary: {
    main: '#EC642D', // Tupaia orange
  },
  background: {
    default: '#F9F9F9', // Off white background
    paper: '#ffffff', // White background
  },
  text: {
    primary: '#2E2F33', // dark text color
    secondary: '#898989', // light grey text color
    hint: '#B8B8B8',
  },
  success: {
    main: '#25D366',
    light: '#25D36622',
  },
  info: {
    main: '#004167',
    light: '#E6ECF0',
  },
  error: {
    main: '#F76853',
    light: '#F7685333',
    dark: '#FB5531',
  },
  divider: '#DFDFDF',
  grey: {
    400: '#B8B8B8',
  },
  action: {
    hover: '#2a78c3',
  },
  primaryHover: '#ebf5ff',
} as const;

const typography = {
  h1: {
    fontSize: '1rem', // page titles
    fontWeight: 500,
    [overMobileBreakpoint]: {
      fontSize: '1.125rem',
    },
  },
  h2: {
    fontSize: '1rem',
    [overMobileBreakpoint]: {
      fontSize: '1.125rem',
    },
    fontWeight: 600,
  },
  h3: {
    fontSize: '1rem',
    fontWeight: 500,
    [overMobileBreakpoint]: {
      fontSize: '1.125rem',
    },
  },
  body1: {
    fontSize: '0.875rem',
    lineHeight: 1.2,
    [overMobileBreakpoint]: {
      fontSize: '1rem',
    },
  },
} as const;

const overrides = {
  MuiCssBaseline: {
    '@global': {
      fieldset: {
        border: 0,
        margin: 0,
        minWidth: 0,
        padding: 0,
      },
      ':root': {
        '--ease-in-quad': 'cubic-bezier(0.11, 0, 0.5, 0)',
        '--ease-out-quad': 'cubic-bezier(0.5, 1, 0.89, 1)',
        '--ease-in-out-quad': 'cubic-bezier(0.45, 0, 0.55, 1)',
        '--ease-in-quart': 'cubic-bezier(0.5, 0, 0.75, 0)',
        '--ease-out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        '--ease-in-out-quart': 'cubic-bezier(0.76, 0, 0.24, 1)',
        accentColor: palette.primary.main,
        interpolateSize: 'allow-keywords',
        textWrap: 'pretty',
      },
      'button, figcaption, h1, h2, h3, h4, h5, h6, input, label': {
        textWrap: 'balance',
      },
      'button, input, textarea, select': {
        touchAction: 'manipulation',
      },
      legend: {
        paddingInline: 0,
      },
      ":where(ol, ul)[role='list']": {
        listStyleType: 'none',
        marginBlock: 0,
        paddingInlineStart: 0,
      },
      picture: {
        display: 'contents',
      },
      source: {
        display: 'none',
      },
      ':where(table, time)': {
        fontVariantNumeric: 'lining-nums slashed-zero tabular-nums',
      },
      '.lucide': {
        height: 'auto', // Use width to set both dimensions
        width: '1em', // Sensible default, mirrors MUI Icon behaviour
      },
    },
  },
  MuiDialogActions: {
    root: {
      padding: '1.5rem 0 0 0',
    },
  },
  MuiListItem: {
    button: {
      '&:hover': {
        backgroundColor: '#328DE515',
      },
    },
  },
  MuiButton: {
    root: {
      textTransform: 'none',
      verticalAlign: 'baseline',
    },
    label: {
      fontSize: '0.875rem',
    },
    containedPrimary: {
      '&:hover': {
        backgroundColor: '#2A78C3',
      },
    },
  },
  MuiMenuItem: {
    root: {
      fontSize: '0.875rem',
    },
  },
  MuiFormControlLabel: {
    label: {
      fontSize: '0.875rem',
      lineHeight: 1.2,
      [overMobileBreakpoint]: {
        fontSize: '1rem',
        fontWeight: 400,
      },
    },
  },
  MuiFormLabel: {
    root: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.2,
      color: '#2E2F33',
      [overMobileBreakpoint]: {
        fontSize: '1rem',
        fontWeight: 400,
      },
    },
  },
  MuiPopover: {
    paper: {
      boxShadow: '0.25rem 0.25rem 1.5rem 0.25rem oklch(0 0 0 / 10%)',
    },
  },
} as const;

const transitions = {
  /* These custom CSS properties defined immediately above in `overrides.MuiCssBaseline[':root']` */
  easing: {
    easeIn: 'var(--ease-in-quart)',
    easeInOut: 'var(--ease-in-out-quart)',
    easeOut: 'var(--ease-out-quart)',
  },
};

export const theme = createTheme({
  overrides,
  palette,
  transitions,
  typography,
});
