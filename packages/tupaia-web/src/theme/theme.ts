import { createMuiTheme } from '@material-ui/core';

// MUI v4 doesn't support callbacks for theme overrides, so since these shades get used in multiple places, we need to define them here
const LIGHT_BLACK = '#2e2f33';
const DARK_BLACK = '#202124';
const SUPER_DARK_BLACK = '#171717';
const LIGHT_GREY = '#9BA0A6';

export const theme = createMuiTheme({
  typography: {
    fontSize: 16, // this needs to be 16 to correctly calculate the axis labels in recharts
    body1: {
      fontSize: '1rem',
    },
  },
  // these overrides are needed to make up for the base font-size being 16px
  overrides: {
    MuiPaper: {
      root: {
        fontSize: '0.875rem',
      },
    },
    MuiCssBaseline: {
      '@global': {
        fieldset: {
          border: 0,
          margin: 0,
          minWidth: 0,
          padding: 0,
        },
      },
    },
    MuiCardHeader: {
      root: {
        fontSize: '0.875rem',
      },
    },
    MuiCheckbox: {
      root: {
        fontSize: '1.5rem',
      },
    },
    MuiSvgIcon: {
      root: {
        fontSize: '1.5rem',
      },
    },
    MuiTable: {
      root: {
        border: `1px solid ${LIGHT_GREY}`,
      },
      // when the table scrolls, the table container gets a border instead, because otherwise the top and left borders of the table can't be seen on scroll
      stickyHeader: {
        border: 'none',
      },
    },
    MuiTableContainer: {
      root: {
        border: `1px solid ${LIGHT_GREY}`, // add the border to the container so that when scrolling, the top and left borders of the table can still be seen
        ['&:has(.MuiTable-stickyHeader)']: {
          maxHeight: 'clamp(20rem,70vh,60rem)', // when the table has a sticky header, set a max height so that it can scroll
        },
      },
    },
    MuiTableRow: {
      root: {
        backgroundColor: LIGHT_BLACK,
        ['&:nth-of-type(even)']: {
          backgroundColor: DARK_BLACK,
        },
      },
      head: {
        backgroundColor: '#424448',
      },
    },
    MuiTableCell: {
      root: {
        backgroundColor: 'inherit',
        padding: '0.8rem 1.56rem',
        fontSize: '0.875rem',
        lineHeight: '1.4',
        borderBottom: 'none', // remove the bottom border from all cells, and it will be applied to the header cells below
        ['&.MuiTableCell-row-head']: {
          borderRight: `1px solid ${LIGHT_GREY}`, // border right for the row header cells
        },
      },
      head: {
        borderBottom: `1px solid ${LIGHT_GREY}`, // header cells have a bottom border
      },
      stickyHeader: {
        backgroundColor: 'inherit', // make the sticky header cells have the row's background color
      },
    },
  },
  palette: {
    type: 'dark',
    primary: {
      main: '#1978D4', // Main blue (as seen on primary buttons)
    },
    secondary: {
      main: '#ee6230', // Tupaia Orange
    },
    background: {
      default: LIGHT_BLACK,
      paper: DARK_BLACK,
    },
    text: {
      secondary: LIGHT_GREY,
    },
    success: {
      main: '#25d366',
    },
    form: {
      border: '#d9d9d9',
    },
    overlaySelector: {
      overlayNameBackground: '#072849',
      menuBackground: '#203e5c', // Dark blue used for button and header background in mobile overlay selector, as well as the background of the menu list on desktop
      mobile: '#313236', // Dark grey used on mobile overlay selector
    },
    dashboardItem: {
      multiValue: {
        data: '#22c7fc',
      },
    },
    black: {
      light: LIGHT_BLACK,
      dark: DARK_BLACK,
      super: SUPER_DARK_BLACK,
    },
  },
});
