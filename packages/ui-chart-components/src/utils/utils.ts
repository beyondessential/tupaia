/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';
import { useTheme } from '@material-ui/core/styles';
import { GRANULARITY_CONFIG } from '@tupaia/utils';
import { DataProps, ChartType, ViewContent, VizPeriodGranularity } from '../types';

// tupaia-web uses a responsive approach, so we need to check the window width
export const isMobile = () => {
  const appType = process.env.REACT_APP_APP_TYPE;
  return appType === 'mobile' || window.innerWidth < 900;
};

const granularityConfig = GRANULARITY_CONFIG as VizPeriodGranularity;

// Timestamps returned from the back-end correspond to UTC time
export const formatTimestampForChart = (
  timestamp: number | string,
  granularity: VizPeriodGranularity,
  periodTickFormat?: string,
) => moment.utc(timestamp).format(periodTickFormat || granularityConfig[granularity].chartFormat);

export const getIsTimeSeries = (data: DataProps[]) => data && data.length > 0 && data[0]?.timestamp;

export const isDataKey = (key: string) =>
  !(['name', 'timestamp'].includes(key) || key.substr(-9) === '_metadata');

export const getContrastTextColor = () => {
  const theme = useTheme();
  return theme.palette.type === 'light' ? theme.palette.text.secondary : 'white';
};

export const getIsChartData = ({
  chartType,
  data,
}: {
  chartType: ChartType;
  data: DataProps[];
}): boolean => {
  // If all segments of a pie chart are "0", display the no data message
  if (chartType === ChartType.Pie && data && data.every(segment => segment.value === 0)) {
    return false;
  }

  return data && data.length > 0;
};

export const getNoDataString = (viewContent: ViewContent) => {
  const { noDataMessage, source, startDate, endDate } = viewContent;
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
