/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';
import { useTheme } from '@material-ui/core/styles';
import { GRANULARITY_CONFIG } from './periodGranularities';
import { CHART_TYPES } from './constants';

export const isMobile = () => process.env.REACT_APP_APP_TYPE === 'mobile';

// Timestamps returned from the back-end correspond to UTC time
export const formatTimestampForChart = (timestamp, granularity, periodTickFormat) =>
  moment.utc(timestamp).format(periodTickFormat || GRANULARITY_CONFIG[granularity].chartFormat);

export const getIsTimeSeries = data => data && data.length > 0 && data[0]?.timestamp;

export const isDataKey = key =>
  !(['name', 'timestamp'].includes(key) || key.substr(-9) === '_metadata');

export const getContrastTextColor = () => {
  const theme = useTheme();
  return theme.palette.type === 'light' ? theme.palette.text.secondary : 'white';
};

export const getIsChartData = ({ chartType, data }) => {
  // If all segments of a pie chart are "0", display the no data message
  if (chartType === CHART_TYPES.PIE && data && data.every(segment => segment.value === 0)) {
    return false;
  }

  return data && data.length > 0;
};

export const getNoDataString = ({ noDataMessage, source, startDate, endDate }) => {
  if (noDataMessage) {
    return noDataMessage;
  }

  if (source === 'mSupply') {
    return 'Requires mSupply';
  }

  if (startDate && endDate) {
    return `No data for ${startDate} to ${endDate}`;
  }

  return 'No data for selected dates';
};
