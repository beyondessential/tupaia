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
      transform: 'groupRows',
      by: 'organisationUnit',
      mergeUsing: 'last',
    },
  ]);

export const firstValuePerPeriodPerOrgUnit = () =>
  buildTransform([
    {
      transform: 'groupRows',
      by: ['organisationUnit', 'period'],
      mergeUsing: 'first',
    },
  ]);

export const lastValuePerPeriodPerOrgUnit = () =>
  buildTransform([
    {
      transform: 'groupRows',
      by: ['organisationUnit', 'period'],
      mergeUsing: 'last',
    },
  ]);
