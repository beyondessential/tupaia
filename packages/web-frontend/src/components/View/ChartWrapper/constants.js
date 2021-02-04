/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { blue, brown, cyan, green, grey, orange, purple, red } from '@material-ui/core/colors';

/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

export const VALUE_TYPES = {
  BOOLEAN: 'boolean',
  CURRENCY: 'currency',
  FRACTION: 'fraction',
  PERCENTAGE: 'percentage',
  FRACTION_AND_PERCENTAGE: 'fractionAndPercentage',
  NUMBER_AND_PERCENTAGE: 'numberAndPercentage',
  TEXT: 'text',
  NUMBER: 'number',
  ONE_DECIMAL_PLACE: 'oneDecimalPlace',
};

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

const AREA = 'area';
const BAR = 'bar';
const COMPOSED = 'composed';
const LINE = 'line';
const PIE = 'pie';

export const CHART_TYPES = {
  AREA,
  BAR,
  COMPOSED,
  LINE,
  PIE,
};
