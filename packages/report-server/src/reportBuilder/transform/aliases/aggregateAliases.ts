import { Context } from '../../context';
import { buildTransform } from '..';

export const mostRecentValuePerOrgUnit = (context: Context) =>
  buildTransform(
    [
      {
        transform: 'sortRows',
        by: 'period',
      },
      {
        transform: 'mergeRows',
        groupBy: 'organisationUnit',
        using: 'last',
      },
    ],
    context,
  );

export const firstValuePerPeriodPerOrgUnit = (context: Context) =>
  buildTransform(
    [
      {
        transform: 'mergeRows',
        groupBy: ['organisationUnit', 'period'],
        using: 'first',
      },
    ],
    context,
  );

export const lastValuePerPeriodPerOrgUnit = (context: Context) =>
  buildTransform(
    [
      {
        transform: 'mergeRows',
        groupBy: ['organisationUnit', 'period'],
        using: 'last',
      },
    ],
    context,
  );
