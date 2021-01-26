/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';

import { GRANULARITY_SHAPE } from '../../utils/periodGranularities';

export const VIEW_CONTENT_SHAPE = {
  noDataMessage: PropTypes.string,
  source: PropTypes.string,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  type: PropTypes.string,
  viewType: PropTypes.string, // Required if type = 'view'
  chartType: PropTypes.string, // Required if type = 'chart'
  name: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.object),
  periodGranularity: GRANULARITY_SHAPE,
};

export const CONDITIONAL_MATRIX_CONDITION_SHAPE = {
  key: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  label: PropTypes.string,
  legendLabel: PropTypes.string,
  condition: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired, // 0 or object e.g. { "<": 3 }
  description: PropTypes.string,
};

export const PRESENTATION_OPTIONS_SHAPE = {
  type: PropTypes.string,
  showRawValue: PropTypes.bool,
  conditions: PropTypes.arrayOf(PropTypes.shape(CONDITIONAL_MATRIX_CONDITION_SHAPE)),
};
