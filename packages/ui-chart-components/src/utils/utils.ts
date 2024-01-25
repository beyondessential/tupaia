/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';
import { useTheme } from '@material-ui/core/styles';
import { GRANULARITY_CONFIG } from '@tupaia/utils';
import {
  CartesianChartPresentationOptions,
  ChartData,
  ChartType,
  VizPeriodGranularity,
} from '@tupaia/types';
import { ViewContent } from '../types';

// tupaia-web uses a responsive approach, so we need to check the window width
export const isMobile = (isExporting = false) => {
  const appType = process.env.REACT_APP_APP_TYPE;

  // Always use the desktop styles when exporting
  if (isExporting) {
    return false;
  }

  return appType === 'mobile' || window.innerWidth < 900;
};

const granularityConfig = GRANULARITY_CONFIG;

// Timestamps returned from the back-end correspond to UTC time
export const formatTimestampForChart = (
  timestamp: number | string,
  granularity?: `${VizPeriodGranularity}`,
  periodTickFormat?: CartesianChartPresentationOptions['periodTickFormat'],
  // @ts-ignore - TODO: fix this
) => moment.utc(timestamp).format(periodTickFormat || granularityConfig[granularity].chartFormat);

export const getIsTimeSeries = (data: ChartData[]) => data && data.length > 0 && data[0]?.timestamp;

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
  data: ChartData[];
}): boolean => {
  // If all segments of a pie chart are "0", display the no data message
  if (chartType === ChartType.Pie && data && data.every(segment => segment.value === 0)) {
    return false;
  }

  return data && data.length > 0;
};

export const getPropertyFromChartConfig = (
  viewContent: ViewContent,
  property: keyof ViewContent['chartConfig'],
) => {
  const chartConfig = 'chartConfig' in viewContent ? viewContent.chartConfig : null;
  if (!chartConfig) return null;
  if (property in chartConfig) {
    return chartConfig[property];
  }

  return null;
};

export const getPresentationOptions = (viewContent: ViewContent) => {
  const { chartType } = viewContent;
  if (chartType === ChartType.Pie || chartType === ChartType.Bar || chartType === ChartType.Line)
    return viewContent.presentationOptions;

  return {};
};
