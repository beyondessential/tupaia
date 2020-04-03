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
    primary: COLORS.GREY_72,
    secondary: COLORS.GREY_44,
  },
  background: {
    default: COLORS.LIGHTGREY,
    paper: COLORS.WHITE,
  },
};
const typography = {
  fontSize: 14,
  button: {
    textTransform: "none",
    letterSpacing: "0.035em"
  }
};
const shape = { borderRadius: 3 };

export default createMuiTheme({ palette, themeName, typography, shape });
