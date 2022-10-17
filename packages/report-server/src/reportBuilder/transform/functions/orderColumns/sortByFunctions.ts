/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Moment } from 'moment';
import { displayStringToMoment, periodToMoment, isInvalidMoment } from '@tupaia/utils';

const alphabetic = (column1: string, column2: string) => column1.localeCompare(column2);

const sortMoment = (moment1: Moment, moment2: Moment) => {
  if (isInvalidMoment(moment1) && isInvalidMoment(moment2)) return 0;
  if (isInvalidMoment(moment1)) return 1;
  if (isInvalidMoment(moment2)) return -1;
  if (moment1.isSame(moment2)) return 0;
  if (moment1.isBefore(moment2)) return -1;
  return 1;
};

const date = (column1: string, column2: string) => {
  const col1Moment = displayStringToMoment(column1);
  const col2Moment = displayStringToMoment(column2);
  return sortMoment(col1Moment, col2Moment);
};

const period = (column1: string, column2: string) => {
  const col1Moment = periodToMoment(column1);
  const col2Moment = periodToMoment(column2);
  return sortMoment(col1Moment, col2Moment);
};

export const sortByFunctions = {
  alphabetic,
  date,
  period,
};
