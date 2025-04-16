

type CustomPalette = {
  tooltip?: string;
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
  table?: {
    odd: React.CSSProperties['color'];
    even: React.CSSProperties['color'];
    highlighted: React.CSSProperties['color'];
    header: React.CSSProperties['color'];
  };
};

// Augment the Palette interface so that we can add our custom properties
declare module '@material-ui/core/styles/createPalette' {
  export interface Palette extends CustomPalette {}

  export interface PaletteOptions extends CustomPalette {}
}
