/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Constants for component styling. Colours, minimum widths, etc.
 */

import {
  blue,
  purple,
  red,
  cyan,
  green,
  lightGreen,
  yellow,
  orange,
  brown,
  grey,
} from '@material-ui/core/colors';
import { isMobile } from '../utils/mobile';

const fullWhite = 'rgba(255, 255, 255, 1)';
export const darkWhite = 'rgba(255, 255, 255, 0.87)';

export const BOX_SHADOW = '0 1px 4px 0 rgba(0, 0, 0, 0.3)';
export const WHITE = '#ffffff';
export const OFF_WHITE = '#eeeeee';
export const TRANS_BLACK = 'rgba(43, 45, 56, 0.94)';
export const TRANS_BLACK_LESS = 'rgba(43, 45, 56, 0.8)';
export const DARK_BLUE = '#262834';
export const LIGHTENED_DARK_BLUE = '#2e3040';
export const TRANSPARENT = 'rgba(0,0,0,0)';
export const TUPAIA_ORANGE = '#EE6230';
export const PRIMARY_BLUE = '#2196f3';
export const BLUE = '#22c7fc';
export const LIGHT_BLUE = '#cde9ff';
export const DARKENED_BLUE = '#0296c5';
export const GREY = '#c7c7c7';
export const LIGHT_GREY = '#EFEFF0';
export const ERROR = red[500];
export const FORM_BLUE = '#34abd0';

export const MOBILE_MARGIN_SIZE = 16;
export const MOBILE_HEADER_HEIGHT = 55;
const MATERIAL_UI_POPOVER_INDEX = 1300; // Taken from material-ui source code
export const DIALOG_Z_INDEX = MATERIAL_UI_POPOVER_INDEX - 1;
export const EXPORT_CHART_PADDING = 20;
export const DASHBOARD_VIEW_MARGIN = 4;
export const DASHBOARD_META_MARGIN = 15;
export const TOP_BAR_HEIGHT = 60;
export const CONTROL_BAR_WIDTH = 340;
export const CONTROL_BAR_PADDING = 10;
export const MAP_CONTROLS_WIDTH = 166;

// a 12-color palette designed to preserve distinction between colors,
// factoring in colorblindness
export const BREWER_PALETTE = {
  yellow: '#F0F032',
  navy: '#005AC8',
  purple: '#8214A0',
  teal: '#006E82',
  custard: '#FAE6BE',
  blue: '#00A0FA',
  orange: '#FA7850',
  magenta: '#FA78FA',
  cyan: '#14D2DC',
  green: '#0AB45A',
  red: '#AA0A3C',
  lime: '#A0FA82',
};

export const SHADING_COLOR_LABELS = {
  TRAFFIC_RED: 'Red',
  TRAFFIC_ORANGE: 'Orange',
  TRAFFIC_YELLOW: 'Yellow',
  TRAFFIC_GREEN: 'Green',
  TRAFFIC_LIME: 'Lime',
  TRAFFIC_WHITE: WHITE,
  TRAFFIC_GREY: 'Grey',
  NO_DATA: 'grey',
};

export const MAP_COLORS = {
  NO_DATA: GREY,
  [SHADING_COLOR_LABELS.NO_DATA]: GREY,
  VALUE_WARNING: red['900'],
  VALUE_NORMAL: blue.A700,
  POLYGON_BLUE: blue['500'],
  POLYGON_HIGHLIGHT: TUPAIA_ORANGE,
  [SHADING_COLOR_LABELS.TRAFFIC_RED]: red[900],
  [SHADING_COLOR_LABELS.TRAFFIC_ORANGE]: orange[800],
  [SHADING_COLOR_LABELS.TRAFFIC_YELLOW]: yellow[600],
  [SHADING_COLOR_LABELS.TRAFFIC_GREEN]: green[900],
  [SHADING_COLOR_LABELS.TRAFFIC_LIME]: lightGreen[600],
  [SHADING_COLOR_LABELS.TRAFFIC_WHITE]: OFF_WHITE,
  [SHADING_COLOR_LABELS.TRAFFIC_GREY]: GREY,
};

export const DEMOLAND_COLORS = {
  LAND: 'rgb(229,215,164)',
  OUTLINE: 'rgb(0,0,0)',
  ROADS: 'rgb(230,130,39)',
  RIVERS: 'rgb(59,135,203)',
};

// Order is important here, blue1 is our default
export const CHART_BLUES = {
  blue1: blue['500'],
  blue2: blue['50'],
  blue3: blue['100'],
  blue4: blue['200'],
  blue5: blue['300'],
  blue6: blue['400'],
  blue7: blue['600'],
  blue8: blue['700'],
  blue9: blue['800'],
  blue10: blue['900'],
};

export const CHART_COLOR_PALETTE = {
  blue: blue['500'],
  red: red['500'],
  purple: purple['500'],
  cyan: cyan['500'],
  green: green['500'],
  orange: orange['500'],
  brown: brown['500'],
  grey: grey['500'],
};

export const EXPANDED_CHART_COLOR_PALETTE = {
  maroon: '#C00000',
  red: '#FF0000',
  yellow: '#FFC000',
  lime: '#B0D94C',
  green: '#00B050',
  darkGreen: '#00833C',
  blue: '#00B0F0',
  darkBlue: '#2F5496',
  purple: '#7030A0',
  pink: '#E245CC',
  grey: '#7B7B7B',
  brown: '#833C0B',
  teal: '#6AD5C2',
};

export const COMPOSED_CHART_COLOR_PALETTE = {
  gold: '#FFD700',
  blue: '#2194F9',
  orange: '#FFB14E',
  pink: '#EA5F94',
  magenta: '#9D02D7',
  orangeLight: '#FA8775',
  magentaLight: '#CD34B5',
};

export const COLOR_PALETTES = {
  EXPANDED_CHART_COLOR_PALETTE,
  COMPOSED_CHART_COLOR_PALETTE,
  CHART_COLOR_PALETTE,
  CHART_BLUES,
};

export const BUTTON_COLORS = {
  primary: blue[700],
  secondary: WHITE,
};

export const MAP_OVERLAY_SELECTOR = {
  background: 'rgb(7, 40, 73)',
  border: '1px solid #2196f3',
};

export const MARKER_POPUP_STYLE = {
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    margin: 0,
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 16,
    textAlign: 'center',
  },
  contentItem: {
    margin: '0 0 20px 0',
  },
  button: {
    background: WHITE,
    borderRadius: 2,
    border: 0,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    padding: '8px 15px',
    fontSize: 14,
    outline: 0,
    cursor: 'pointer',
  },
  image: {
    width: '200px',
    height: '200px',
    borderRadius: 3,
  },
};

export const DASHBOARD_STYLES = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'scroll',
    flex: 1,
  },
  meta: {
    background: 'rgba(0,0,0,0.2)',
    color: WHITE,
    boxSizing: 'border-box',
  },
  metaImage: {
    cursor: 'pointer',
    width: '100%',
    height: 'auto',
  },
  metaImageHolder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  metaImageDialog: {
    zIndex: DIALOG_Z_INDEX,
    align: 'center',
  },
  metaImageDialogImage: {
    width: '100%',
    height: 'auto',
  },
  content: {
    background: 'rgba(255, 255, 255, 0.05)',
  },
  tabsRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  groupsDropDownMenu: {
    background: TRANS_BLACK,
  },
  title: {
    fontSize: '24px',
    fontWeight: 'normal',
    margin: '14px 0',
    color: fullWhite,
    alignItems: 'center',
    padding: `3px ${DASHBOARD_META_MARGIN}px 0px`,
  },
  loading: {
    opacity: 0.5,
  },
  floatingHeader: {
    position: 'absolute',
    background: DARK_BLUE,
    boxSizing: 'border-box',
    color: WHITE,
    right: 0,
    zIndex: 501, // Above info button
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '0 15px',
  },
  hidden: {
    margin: 0,
    padding: 0,
    maxHeight: 0,
    width: 0,
    opacity: 0,
    visibility: 'hidden',
  },
};

export const VIEW_STYLES = {
  mainContainer: isMobile()
    ? {
        marginTop: 16,
        paddingBottom: 16,
        borderBottom: '1px solid rgba(255,255,255,0.2)',
      }
    : {
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        alignContent: 'stretch',
        justifyContent: 'center',
        padding: '15px 15px 15px 10px',
        minHeight: 0,
        transition: 'min-height 0.3s',
        width: '100%',
        maxWidth: '100%',
        marginBottom: DASHBOARD_VIEW_MARGIN,
        backgroundColor: '#272832',
        boxSizing: 'border-box',
        flex: '1 0 auto', // fill left over space
      },
  mainContainerExpanded: isMobile()
    ? {
        width: '100%',
        height: '100%',
      }
    : {
        minHeight: 250,
        height: 'min-content',
        maxWidth: 450,
        minWidth: 300,
        padding: '15px 15px 15px 10px',
        margin: '0.5%',
        width: '24%',
        border: '1px solid #1f2038',
        boxShadow: '0px 0px 15px rgba(0,0,0,0.3)',
      },
  chartContainer: isMobile()
    ? {
        height: 200,
        textAlign: 'center',
        position: 'relative',
      }
    : {
        display: 'flex',
        flexDirection: 'row',
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '100%',
        alignContent: 'stretch',
        alignItems: 'stretch',
      },
  chartViewContainer: isMobile()
    ? {}
    : {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      },
  viewContainer: isMobile()
    ? {}
    : {
        display: 'flex',
        flexDirection: 'column',
      },
  stretchContainer: {
    flexGrow: 4,
    flexShrink: 0.5,
    flexBasis: '50%',
  },
  loadingContainer: {
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodRange: {
    position: 'relative',
    color: darkWhite,
    marginTop: 5,
    textAlign: 'center',
    fontSize: 9,
  },
  overlayPeriodRange: {
    // Positioning
    position: 'relative',
    width: `${342 - 8}px`,
    height: '16px',
    marginTop: 5,
    paddingLeft: 8,
    paddingTop: 5,
    paddingBottom: 5,
    // Box
    borderRadius: '4px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    // Text
    color: '#FFFFFF',
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '14px',
    lineHeight: '16px',
    textAlign: 'left',
  },
  data: isMobile()
    ? {
        fontSize: '50px',
        fontWeight: 'bold',
        textAlign: 'center',
        color: WHITE,
      }
    : {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 'auto',
        fontSize: '50px',
        fontWeight: 'bold',
        textAlign: 'center',
        color: WHITE,
        whiteSpace: 'pre-line',
      },
  downloadLink: {
    flex: 1,
    marginTop: '10px',
    fontSize: '20px',
    textAlign: 'center',
    color: BLUE,
    display: 'block',
  },
  date: {
    fontSize: '25px',
    textAlign: 'center',
    color: WHITE,
  },
  singleValueListItem: {
    fontSize: '20px',
    textAlign: 'center',
    color: WHITE,
  },
  description: isMobile()
    ? {
        color: WHITE,
        lineHeight: 1.3,
      }
    : {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
        color: WHITE,
        backgroundColor: TRANS_BLACK,
        display: 'flex',
        flex: 1,
        height: 230,
        width: '100%',
        alignItems: 'center',
        boxSizing: 'border-box',
      },
  infoDiv: isMobile()
    ? {}
    : {
        display: 'flex',
        flex: 1,
        alignItems: 'flex-end',
        zIndex: 500,
      },
  tooltip: {
    color: fullWhite,
    background: 'rgba(0, 0, 0, 0.7)',
    padding: '15px 10px 15px 5px',
  },
  legend: {
    color: fullWhite,
    fontSize: '12px',
  },
  legendExporting: {
    color: DARK_BLUE,
    fontSize: '11px',
  },
  // MultiValueView styles below
  text: {
    fontSize: 16,
    textAlign: 'left',
    color: darkWhite,
  },
  labelColumn: {
    flexGrow: 1,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    padding: '6px 0',
    width: '100%',
    maxWidth: isMobile() ? 400 : null,
    margin: isMobile() ? '0 auto' : null,
  },
  lastRow: {
    borderBottom: 0,
  },
  textValue: {
    fontWeight: 'bold',
    textAlign: 'right',
    fontSize: 18,
    color: BLUE,
  },
  tickContainer: {
    display: 'flex',
    flexDirection: 'row',
    height: '20px',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  icon: {
    height: 20,
  },
  infoIcon: isMobile()
    ? {
        width: 20,
        height: 20,
        padding: '15px', // Increase hit area of info.
        margin: -15,
      }
    : {},
  expandButton: isMobile()
    ? {
        flex: 1,
        alignItems: 'flex-end',
        zIndex: 500,
      }
    : {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 1,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'black',
        opacity: 0,
        transition: 'opacity 0.2s',
        color: WHITE,
      },
  expandButtonHover: {
    opacity: 0.7,
  },
  expandButtonIcon: isMobile()
    ? {
        width: 25,
        height: 25,
        padding: '15px', // Increase hit area of zoom button.
        margin: -15,
      }
    : {
        width: 64,
        height: 64,
        pointerEvents: 'none',
      },
  multiPhotoImageContainerExpanded: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  multiPhotoImageWrapper: {
    cursor: 'pointer',
    backgroundRepeat: 'no-repeat',
    flexDirection: 'row',
    backgroundSize: 'cover',
    height: '100%',
    minHeight: isMobile() ? 300 : 200,
  },
  multiPhotoZoomIcon: {
    width: 64,
    height: 64,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -32,
    marginTop: -32,
    opacity: 0.9,
    color: darkWhite,
  },
  multiPhotoDialog: {
    zIndex: DIALOG_Z_INDEX,
  },
  multiPhotoDialogImage: {
    width: '100%',
    height: 'auto',
  },
  mobileChartMessage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: TRANS_BLACK_LESS,
    padding: MOBILE_MARGIN_SIZE / 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileChartMessageContent: {
    maxWidth: 400,
    padding: MOBILE_MARGIN_SIZE,
    color: WHITE,
    lineHeight: 1.3,
  },
};

export const USER_BAR_STYLES = {
  container: {
    marginTop: 13,
    marginLeft: 10,
    display: 'flex',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  userMenu: {
    backgroundColor: TRANS_BLACK,
    borderRadius: '8px',
    pointerEvents: 'auto',
    cursor: 'auto',
    display: 'flex',
    justifyContent: 'space-around',
  },
};
