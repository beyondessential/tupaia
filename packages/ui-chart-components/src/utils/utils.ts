import moment from 'moment';
import { useTheme } from '@material-ui/core/styles';
import {
  CartesianChartPresentationOptions,
  ChartData,
  ChartReport,
  ChartType,
  DashboardItemReport,
  ViewDataItem,
  VizPeriodGranularity,
} from '@tupaia/types';
import { GRANULARITY_CONFIG } from '@tupaia/utils';

// tupaia-web uses a responsive approach, so we need to check the window width
export const isMobile = (isExporting = false) => {
  const appType = process.env.REACT_APP_APP_TYPE;

  // Always use the desktop styles when exporting
  if (isExporting) {
    return false;
  }

  return appType === 'mobile' || window.innerWidth < 900;
};

// Timestamps returned from the back-end correspond to UTC time
export const formatTimestampForChart = (
  timestamp: number | string,
  granularity?: `${VizPeriodGranularity}`,
  periodTickFormat?: CartesianChartPresentationOptions['periodTickFormat'],
) => {
  const getFormatString = () => {
    if (periodTickFormat) return periodTickFormat;
    if (granularity && granularity in GRANULARITY_CONFIG) {
      // TS complains that some keys of GRANULARITY_CONFIG are not in VizPeriodGranularity, so we cast these here
      return GRANULARITY_CONFIG[granularity as keyof typeof GRANULARITY_CONFIG].chartFormat;
    }

    return undefined;
  };
  const formatString = getFormatString();
  return moment.utc(timestamp).format(formatString);
};

export const getIsTimeSeries = (data?: ChartData[] | ViewDataItem[]) => {
  if (!data || !data[0] || !('timestamp' in data[0])) return false;
  return !!data[0]?.timestamp;
};

export const isDataKey = (key: string) =>
  !(['name', 'timestamp'].includes(key) || key.substr(-9) === '_metadata');

export const getContrastTextColor = () => {
  const theme = useTheme();
  return theme.palette.type === 'light' ? theme.palette.text.secondary : 'white';
};

export const getIsChartData = (chartType: ChartType, report: ChartReport): boolean => {
  // If all segments of a pie chart are "0", display the no data message
  if (
    chartType === ChartType.Pie &&
    report?.data &&
    report?.data.every(segment => segment.value === 0)
  ) {
    return false;
  }

  return (report?.data && report?.data.length > 0) || false;
};
