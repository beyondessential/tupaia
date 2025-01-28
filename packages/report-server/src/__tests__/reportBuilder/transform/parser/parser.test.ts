import { PARSABLE_ANALYTICS } from '../transform.fixtures';
import { TransformTable } from '../../../../reportBuilder/transform';
import { buildTestTransform } from '../../testUtils';

describe('parser', () => {
  it('can do lookups', async () => {
    const transform = buildTestTransform(
      [
        {
          transform: 'updateColumns',
          insert: {
            variable: '=$BCD1',
            current: '=@current.BCD1',
            index: '=@index',
            previous: '=@previous.BCD1',
            next: '=@next.BCD1',
            lastAll: '=last(@all.BCD1)',
            sumAllPrevious: '=sum(@allPrevious.BCD1)',
            sumWhereMatchingOrgUnit:
              '=sum(where(f(@otherRow) = eq($organisationUnit, @otherRow.organisationUnit)).BCD1)',
            tableLength: '=length(@table)',
            requestParam: '= @params.hierarchy',
          },
          exclude: '*',
        },
      ],
      { request: { query: { hierarchy: 'cat' } } },
    );
    expect(await transform(TransformTable.fromRows(PARSABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows(
        [
          {
            variable: 4,
            current: 4,
            index: 1,
            next: 2,
            lastAll: 2,
            sumAllPrevious: 4,
            sumWhereMatchingOrgUnit: 11,
            tableLength: 6,
            requestParam: 'cat',
          },
          {
            variable: 2,
            current: 2,
            index: 2,
            previous: 4,
            next: 5,
            lastAll: 2,
            sumAllPrevious: 6,
            sumWhereMatchingOrgUnit: 11,
            tableLength: 6,
            requestParam: 'cat',
          },
          {
            variable: 5,
            current: 5,
            index: 3,
            previous: 2,
            next: 7,
            lastAll: 2,
            sumAllPrevious: 11,
            sumWhereMatchingOrgUnit: 11,
            tableLength: 6,
            requestParam: 'cat',
          },
          {
            variable: 7,
            current: 7,
            index: 4,
            previous: 5,
            next: 8,
            lastAll: 2,
            sumAllPrevious: 18,
            sumWhereMatchingOrgUnit: 17,
            tableLength: 6,
            requestParam: 'cat',
          },
          {
            variable: 8,
            current: 8,
            index: 5,
            previous: 7,
            next: 2,
            lastAll: 2,
            sumAllPrevious: 26,
            sumWhereMatchingOrgUnit: 17,
            tableLength: 6,
            requestParam: 'cat',
          },
          {
            variable: 2,
            current: 2,
            index: 6,
            previous: 8,
            lastAll: 2,
            sumAllPrevious: 28,
            sumWhereMatchingOrgUnit: 17,
            tableLength: 6,
            requestParam: 'cat',
          },
        ],
        [
          'variable',
          'current',
          'index',
          'previous',
          'next',
          'lastAll',
          'sumAllPrevious',
          'sumWhereMatchingOrgUnit',
          'tableLength',
          'requestParam',
        ],
      ),
    );
  });

  describe('in transforms', () => {
    it('excludeRows supports parser lookups on where', async () => {
      const transform = buildTestTransform([
        {
          transform: 'excludeRows',
          where:
            '=$BCD1 <= mean(where(f(@otherRow) = eq($organisationUnit, @otherRow.organisationUnit)).BCD1)',
        },
      ]);
      expect(await transform(TransformTable.fromRows(PARSABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
          { period: '20200103', organisationUnit: 'TO', BCD1: 5 },
          { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
          { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
        ]),
      );
    });

    it('updateColumns supports parser lookups in column name and values', async () => {
      const transform = buildTestTransform([
        {
          transform: 'updateColumns',
          insert: {
            '=$organisationUnit': '=$BCD1',
          },
          exclude: ['organisationUnit', 'BCD1'],
        },
      ]);
      expect(await transform(TransformTable.fromRows(PARSABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200101', TO: 4 },
          { period: '20200102', TO: 2 },
          { period: '20200103', TO: 5 },
          { period: '20200101', PG: 7 },
          { period: '20200102', PG: 8 },
          { period: '20200103', PG: 2 },
        ]),
      );
    });

    it('sortRows supports row parser lookups', async () => {
      const transform = buildTestTransform([
        {
          transform: 'sortRows',
          by: '=$BCD1',
        },
      ]);
      expect(await transform(TransformTable.fromRows(PARSABLE_ANALYTICS))).toStrictEqual(
        TransformTable.fromRows([
          { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
          { period: '20200103', organisationUnit: 'PG', BCD1: 2 },
          { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
          { period: '20200103', organisationUnit: 'TO', BCD1: 5 },
          { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
          { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
        ]),
      );
    });
  });
});
