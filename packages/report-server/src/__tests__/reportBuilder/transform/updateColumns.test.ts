import { SINGLE_ANALYTIC, MULTIPLE_ANALYTICS, MERGEABLE_ANALYTICS } from './transform.fixtures';
import { TransformTable } from '../../../reportBuilder/transform';
import { buildTestTransform } from '../testUtils';

describe('updateColumns', () => {
  it('can do nothing', async () => {
    const transform = buildTestTransform([
      {
        transform: 'updateColumns',
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{ ...SINGLE_ANALYTIC[0] }]),
    );
  });

  it('can insert basic values', async () => {
    const transform = buildTestTransform([
      {
        transform: 'updateColumns',
        insert: {
          number: '=1',
          string: 'Hi',
          boolean: '=false',
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{ ...SINGLE_ANALYTIC[0], number: 1, string: 'Hi', boolean: false }]),
    );
  });

  it('can update a value from the row', async () => {
    const transform = buildTestTransform([
      {
        transform: 'updateColumns',
        insert: {
          dataElementValue: '=$value',
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{ ...SINGLE_ANALYTIC[0], dataElementValue: 4 }]),
    );
  });

  it('can use a value from the row as a column name', async () => {
    const transform = buildTestTransform([
      {
        transform: 'updateColumns',
        insert: {
          '=$dataElement': '=$value',
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{ ...SINGLE_ANALYTIC[0], BCD1: 4 }]),
    );
  });

  it('can execute functions', async () => {
    const transform = buildTestTransform([
      {
        transform: 'updateColumns',
        insert: {
          period: "=periodToDisplayString($period, 'DAY')",
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{ ...SINGLE_ANALYTIC[0], period: '1st Jan 2020' }]),
    );
  });

  it('can include all remaining fields', async () => {
    const transform = buildTestTransform([
      {
        transform: 'updateColumns',
        insert: {
          period: "=periodToDisplayString($period, 'DAY')",
        },
        include: '*',
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([
        { period: '1st Jan 2020', organisationUnit: 'TO', dataElement: 'BCD1', value: 4 },
      ]),
    );
  });

  it('can include selected remaining fields', async () => {
    const transform = buildTestTransform([
      {
        transform: 'updateColumns',
        insert: {
          period: "=periodToDisplayString($period, 'DAY')",
        },
        include: ['organisationUnit', 'value'],
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{ organisationUnit: 'TO', value: 4, period: '1st Jan 2020' }]),
    );
  });

  it('can exclude all remaining fields', async () => {
    const transform = buildTestTransform([
      {
        transform: 'updateColumns',
        insert: {
          period: "=periodToDisplayString($period, 'DAY')",
        },
        exclude: '*',
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{ period: '1st Jan 2020' }]),
    );
  });

  it('can exclude selected remaining fields', async () => {
    const transform = buildTestTransform([
      {
        transform: 'updateColumns',
        insert: {
          period: "=periodToDisplayString($period, 'DAY')",
        },
        exclude: ['organisationUnit', 'value'],
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{ period: '1st Jan 2020', dataElement: 'BCD1' }]),
    );
  });

  it('can perform the update on all rows', async () => {
    const transform = buildTestTransform([
      {
        transform: 'updateColumns',
        insert: {
          period: "=periodToDisplayString($period, 'DAY')",
          '=$dataElement': '=$value',
        },
        include: ['organisationUnit'],
      },
    ]);
    expect(await transform(TransformTable.fromRows(MULTIPLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { organisationUnit: 'TO', period: '1st Jan 2020', BCD1: 4 },
        { organisationUnit: 'TO', period: '2nd Jan 2020', BCD1: 2 },
        { organisationUnit: 'TO', period: '3rd Jan 2020', BCD1: 5 },
      ]),
    );
  });

  it('where is processed before remaining fields', async () => {
    const transform = buildTestTransform([
      {
        transform: 'updateColumns',
        where: '=exists($BCD1)',
        insert: {
          newVal: '=$BCD1 * 2', // This would fail on rows where BCD1 doesn't exist
        },
        include: ['period', 'organisationUnit'],
      },
    ]);
    expect(await transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'TO', newVal: 8 },
        { period: '20200102', organisationUnit: 'TO', newVal: 4 },
        { period: '20200103', organisationUnit: 'TO', newVal: 10 },
        { period: '20200101', organisationUnit: 'TO', BCD2: 11 },
        { period: '20200102', organisationUnit: 'TO', BCD2: 1 },
        { period: '20200103', organisationUnit: 'TO', BCD2: 0 },
        { period: '20200101', organisationUnit: 'PG', newVal: 14 },
        { period: '20200102', organisationUnit: 'PG', newVal: 16 },
        { period: '20200103', organisationUnit: 'PG', newVal: 4 },
        { period: '20200101', organisationUnit: 'PG', BCD2: 13 },
        { period: '20200102', organisationUnit: 'PG', BCD2: 99 },
        { period: '20200103', organisationUnit: 'PG', BCD2: -1 },
      ]),
    );
  });

  it('can upsert a column dynamically', async () => {
    const transform = buildTestTransform([
      {
        transform: 'updateColumns',
        insert: {
          '=$name': '=$value',
        },
        exclude: '*',
      },
    ]);
    expect(
      await transform(
        TransformTable.fromRows([
          { name: 'value', value: 7 },
          { name: 'total', value: 10 },
        ]),
      ),
    ).toStrictEqual(TransformTable.fromRows([{ value: 7 }, { total: 10 }]));
  });
});
