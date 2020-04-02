import { createMuiTheme } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import { WHITE } from './colors';

const palette = {
  primary: {
    main: '#326699',
    textLight: '#fff', // taken from colors.scss::$main-white-color
    textMedium: '#2f4358', // taken from colors.scss::$main-light-dark-color
  },
  secondary: {
    main: '#ffcc24',
    dark: '#905a00',
  },
  background: {
    paper: { WHITE },
    default: grey[200],
    header: '#EAF2FF', // taken from colors.scss::$main-light-blue-color
    light: '#F4F6F8', // taken from colors.scss::$main-light-gray-color
    main: '#eff2f5', // taken from colors.scss::$main-bg-color
  },
};
const themeName = 'Tupaia-Storybook';
const typography = { useNextVariants: true, fontSize: 15 };

export default createMuiTheme({ palette, themeName, typography });