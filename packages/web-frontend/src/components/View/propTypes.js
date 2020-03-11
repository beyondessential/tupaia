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

export const PRESENTATION_OPTIONS_SHAPE = {
  color: PropTypes.string,
  // TODO
  description: PropTypes.string,
};
