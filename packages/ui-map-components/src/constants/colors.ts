import { blue, red, green, lightGreen, yellow, orange } from '@material-ui/core/colors';

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

export const TUPAIA_ORANGE = '#EE6230';
export const WHITE = '#ffffff';
export const GREY = '#c7c7c7';
export const OFF_WHITE = '#eeeeee';
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

export const HEATMAP_UNKNOWN_COLOR = MAP_COLORS.NO_DATA;
export const DEFAULT_COLOR_SCHEME = 'default';
export const REVERSE_DEFAULT_COLOR_SCHEME = 'default-reverse';
export const PERFORMANCE_COLOR_SCHEME = 'performance';
export const TIME_COLOR_SCHEME = 'time';
export const GPI_COLOR_SCHEME = 'gpi';

export const BREWER_AUTO = [
  BREWER_PALETTE.navy,
  BREWER_PALETTE.orange,
  BREWER_PALETTE.magenta,
  BREWER_PALETTE.blue,
  BREWER_PALETTE.teal,
  BREWER_PALETTE.custard,
  BREWER_PALETTE.cyan,
  BREWER_PALETTE.yellow,
  BREWER_PALETTE.purple,
];

export const YES_COLOR = BREWER_PALETTE.green;
export const NO_COLOR = BREWER_PALETTE.red;
export const UNKNOWN_COLOR = 'grey';
