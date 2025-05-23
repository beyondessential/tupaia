import { CSSProperties } from 'react';

// Augment the Palette interface so that we can add our custom properties
declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    tooltip: string;
    form: {
      border: CSSProperties['color'];
    };
    overlaySelector: {
      overlayNameBackground: CSSProperties['color'];
      menuBackground: CSSProperties['color'];
      mobile: CSSProperties['color'];
    };
    dashboardItem: {
      multiValue: {
        data: CSSProperties['color'];
      };
    };
    table: {
      odd: CSSProperties['color'];
      even: CSSProperties['color'];
      highlighted: CSSProperties['color'];
      header: CSSProperties['color'];
    };
  }

  interface PaletteOptions {
    tooltip?: string;
    form?: {
      border?: CSSProperties['color'];
    };
    overlaySelector?: {
      overlayNameBackground?: CSSProperties['color'];
      menuBackground?: CSSProperties['color'];
      mobile?: CSSProperties['color'];
    };
    dashboardItem?: {
      multiValue?: {
        data?: CSSProperties['color'];
      };
    };
    table?: {
      odd?: CSSProperties['color'];
      even?: CSSProperties['color'];
      highlighted?: CSSProperties['color'];
      header?: CSSProperties['color'];
    };
  }
}
