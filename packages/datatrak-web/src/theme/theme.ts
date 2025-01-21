import { createMuiTheme } from '@material-ui/core';
import { DESKTOP_BREAKPOINT } from '../constants';

const overMobileBreakpoint = `@media (min-width: ${DESKTOP_BREAKPOINT})`;
export const theme = createMuiTheme({
  palette: {
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
  },
  typography: {
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
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        fieldset: {
          border: 0,
          margin: 0,
          minWidth: 0,
          padding: 0,
        },
        'button, figcaption, h1, h2, h3, h4, h5, h6, input, label': {
          textWrap: 'balance',
        },
        'input, button, textarea, select': {
          touchAction: 'manipulation',
        },
        picture: {
          display: 'contents',
        },
        source: {
          display: 'none',
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
        ['&:hover']: {
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
        boxShadow: '4px 4px 25px 4px rgba(0, 0, 0, 0.10)',
      },
    },
  },
});
