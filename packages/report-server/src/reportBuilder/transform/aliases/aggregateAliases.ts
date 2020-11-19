import { buildTransform } from '..';

export const aggregateMostRecentValuePerOrgUnit = () =>
  buildTransform([
    {
      transform: 'sort',
      by: '$.row.period',
    },
    {
      transform: 'aggregate',
      organisationUnit: 'group',
      '...': 'last',
    },
  ]);
