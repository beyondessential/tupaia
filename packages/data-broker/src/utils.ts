/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Analytic } from './types';

type ArrayAnalytic = [string, string, string, string | number];

const DATA_ELEMENT = 'dataElement';
const DATA_GROUP = 'dataGroup';
const SYNC_GROUP = 'syncGroup';
export const DATA_SOURCE_TYPES = {
  DATA_ELEMENT,
  DATA_GROUP,
  SYNC_GROUP,
};

export const arrayToAnalytics = (arrayAnalytics: ArrayAnalytic[]): Analytic[] =>
  arrayAnalytics.map(([dataElement, organisationUnit, period, value]) => ({
    dataElement,
    organisationUnit,
    period,
    value,
  }));
