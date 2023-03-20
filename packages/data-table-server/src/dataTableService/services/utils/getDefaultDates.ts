/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { convertPeriodStringToDateRange, getDefaultPeriod } from '@tupaia/utils';

export const getDefaultStartDate = () =>
  new Date(convertPeriodStringToDateRange(getDefaultPeriod())[0]);
export const getDefaultEndDate = () =>
  new Date(convertPeriodStringToDateRange(getDefaultPeriod())[1]);
