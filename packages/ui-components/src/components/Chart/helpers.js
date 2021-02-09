/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
// todo: reconcile moment vs date fns
import moment from 'moment';

import { GRANULARITY_CONFIG } from './periodGranularities';

// Timestamps returned from the back-end correspond to UTC time
export const formatTimestampForChart = (timestamp, granularity, periodTickFormat) =>
  moment.utc(timestamp).format(periodTickFormat || GRANULARITY_CONFIG[granularity].chartFormat);

export const getIsTimeSeries = data => data && data.length > 0 && data[0].timestamp;

export const isDataKey = key =>
  !(['name', 'timestamp'].includes(key) || key.substr(-9) === '_metadata');
