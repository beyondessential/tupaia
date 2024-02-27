import { createMuiTheme } from '@material-ui/core';

// MUI v4 doesn't support callbacks for theme overrides, so since these shades get used in multiple places, we need to define them here
const LIGHT_BLACK = '#2e2f33';
const DARK_BLACK = '#202124';
const LIGHT_GREY = '#9BA0A6';

export const theme = createMuiTheme({
  typography: {
    fontSize: 16, // this needs to be 16 to correctly calculate the axis labels in recharts
    body1: {
      fontSize: '1rem',
    },
  },
  // these overrides are needed to make up for the base font-size being 16px
  palette: {
    type: 'dark',
    divider: LIGHT_GREY,
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
    table: {
      odd: LIGHT_BLACK,
      even: DARK_BLACK,
      highlighted: '#171717',
      header: '#424448',
    },
  },
});

// separate the overrides from the theme definition so that we can use the theme variables here, which is not possible with mui v4
theme.overrides = {
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
      border: `1px solid ${theme.palette.divider}`,
    },
    // when the table scrolls, the table container gets a border instead, because otherwise the top and left borders of the table can't be seen on scroll
    stickyHeader: {
      border: 'none',
    },
  },
  MuiTableContainer: {
    root: {
      border: `1px solid ${theme.palette.divider}`, // add the border to the container so that when scrolling, the top and left borders of the table can still be seen
      ['&:has(.MuiTable-stickyHeader)']: {
        maxHeight: 'clamp(20rem,70vh,60rem)', // when the table has a sticky header, set a max height so that it can scroll
      },
    },
  },
  MuiTableRow: {
    root: {
      backgroundColor: theme.palette.table?.odd,
      // non expanded rows alternate background color - only apply this when in a modal, ie not on a multi row viz
      ['&:nth-child(even)']: {
        backgroundColor: theme.palette.table?.even,
      },
    },
    head: {
      backgroundColor: theme.palette.table?.header,
    },
  },
  MuiTableCell: {
    root: {
      backgroundColor: 'inherit',
      fontSize: '0.875rem',
      paddingBlock: '0.8rem',
      paddingLinline: '1.56rem',
      lineHeight: '1.4',
      borderBottom: 'none', // remove the bottom border from all cells, and it will be applied to the header cells below
      ['&.MuiTableCell-row-head']: {
        borderRight: `1px solid ${theme.palette.divider}`, // border right for the row header cells
        fontWeight: theme.typography.fontWeightMedium,
      },
    },
    head: {
      borderBottom: `1px solid ${theme.palette.divider}`, // header cells have a bottom border
    },
    stickyHeader: {
      backgroundColor: 'inherit', // make the sticky header cells have the row's background color
    },
  },
};
