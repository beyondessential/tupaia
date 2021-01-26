/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildTransform } from '..';

export const mostRecentValuePerOrgUnit = () =>
  buildTransform([
    {
      transform: 'sort',
      by: '$row.period',
    },
    {
      transform: 'aggregate',
      organisationUnit: 'group',
      '...': 'last',
    },
  ]);

export const firstValuePerPeriodPerOrgUnit = () =>
  buildTransform([
    {
      transform: 'aggregate',
      organisationUnit: 'group',
      period: 'group',
      '...': 'first',
    },
  ]);

export const lastValuePerPeriodPerOrgUnit = () =>
  buildTransform([
    {
      transform: 'aggregate',
      organisationUnit: 'group',
      period: 'group',
      '...': 'last',
    },
  ]);
