import { PaletteOptions, Palette } from '@material-ui/core/styles/createPalette';

type CustomPalette = {
  form?: {
    border: React.CSSProperties['color'];
  };
  overlaySelector?: {
    overlayNameBackground: React.CSSProperties['color'];
    menuBackground: React.CSSProperties['color'];
    mobile: React.CSSProperties['color'];
  };
  dashboardItem?: {
    multiValue?: {
      data: React.CSSProperties['color'];
    };
  };
  black?: {
    light: React.CSSProperties['color'];
    dark: React.CSSProperties['color'];
    super: React.CSSProperties['color'];
  };
  matrix?: {
    header: React.CSSProperties['color'];
  };
};

// Augment the Palette interface so that we can add our custom properties
declare module '@material-ui/core/styles/createPalette' {
  export interface Palette extends CustomPalette {}

  export interface PaletteOptions extends CustomPalette {}
}
