import { buildTransform } from '..';

export const aggregateMostRecentValuePerOrgUnit = () =>
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

export const aggregateFirstValuePerPeriodPerOrgUnit = () =>
  buildTransform([
    {
      transform: 'aggregate',
      organisationUnit: 'group',
      period: 'group',
      '...': 'first',
    },
  ]);
