import moment from 'moment';

import { GRANULARITY_CONFIG } from '../../../utils/periodGranularities';

// Timestamps returned from the back-end correspond to UTC time
export const formatTimestampForChart = (timestamp, granularity, periodTickFormat) =>
  moment.utc(timestamp).format(periodTickFormat || GRANULARITY_CONFIG[granularity].chartFormat);

export const getIsTimeSeries = data => data && data.length > 0 && data[0].timestamp;
