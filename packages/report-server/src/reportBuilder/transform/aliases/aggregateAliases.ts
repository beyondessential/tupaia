/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildTransform } from '..';

export const mostRecentValuePerOrgUnit = () =>
  buildTransform([
    {
      transform: 'sortRows',
      by: 'period',
    },
    {
      transform: 'mergeRows',
      groupBy: 'organisationUnit',
      using: 'last',
    },
  ]);

export const firstValuePerPeriodPerOrgUnit = () =>
  buildTransform([
    {
      transform: 'mergeRows',
      groupBy: ['organisationUnit', 'period'],
      using: 'first',
    },
  ]);

export const lastValuePerPeriodPerOrgUnit = () =>
  buildTransform([
    {
      transform: 'mergeRows',
      groupBy: ['organisationUnit', 'period'],
      using: 'last',
    },
  ]);
