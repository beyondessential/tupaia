import { SINGLE_ANALYTIC, MULTIPLE_ANALYTICS, MERGEABLE_ANALYTICS } from './transform.fixtures';
import { TransformTable } from '../../../reportBuilder/transform';
import { buildTestTransform } from '../testUtils';

describe('insertRows', () => {
  // SAME AS INSERT COLUMNS FUNCTIONALITY
  it('can insert row with basic values', async () => {
    const transform = buildTestTransform([
      {
        transform: 'insertRows',
        columns: {
          number: '=1',
          string: 'Hi',
          boolean: '=false',
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([...SINGLE_ANALYTIC, { number: 1, string: 'Hi', boolean: false }]),
    );
  });

  it('can insert row with values from previous row', async () => {
    const transform = buildTestTransform([
      {
        transform: 'insertRows',
        columns: {
          dataElementValue: '=$value',
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([...SINGLE_ANALYTIC, { dataElementValue: 4 }]),
    );
  });

  it('can select a value from the row as a field name', async () => {
    const transform = buildTestTransform([
      {
        transform: 'insertRows',
        columns: {
          '=$dataElement': '=$value',
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([...SINGLE_ANALYTIC, { BCD1: 4 }]),
    );
  });

  it('can execute functions', async () => {
    const transform = buildTestTransform([
      {
        transform: 'insertRows',
        columns: {
          period: "=periodToDisplayString($period, 'DAY')",
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([...SINGLE_ANALYTIC, { period: '1st Jan 2020' }]),
    );
  });

  // SPECIFIC TO INSERT
  it('can insert a single row at start', async () => {
    const transform = buildTestTransform([
      {
        transform: 'insertRows',
        position: 'before',
        where: '=eq(@index, 1)',
        columns: {
          number: '=1',
          string: 'Hi',
          boolean: '=false',
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(MULTIPLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows(
        [
          { number: 1, string: 'Hi', boolean: false },
          { period: '20200101', organisationUnit: 'TO', dataElement: 'BCD1', value: 4 },
          { period: '20200102', organisationUnit: 'TO', dataElement: 'BCD1', value: 2 },
          { period: '20200103', organisationUnit: 'TO', dataElement: 'BCD1', value: 5 },
        ],
        ['period', 'organisationUnit', 'dataElement', 'value', 'number', 'string', 'boolean'],
      ),
    );
  });

  it('can insert a single row at end', async () => {
    const transform = buildTestTransform([
      {
        transform: 'insertRows',
        where: '=eq(@index, length(@table))',
        columns: {
          number: '=1',
          string: 'Hi',
          boolean: '=false',
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(MULTIPLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'TO', dataElement: 'BCD1', value: 4 },
        { period: '20200102', organisationUnit: 'TO', dataElement: 'BCD1', value: 2 },
        { period: '20200103', organisationUnit: 'TO', dataElement: 'BCD1', value: 5 },
        { number: 1, string: 'Hi', boolean: false },
      ]),
    );
  });

  it('can insert multiple rows', async () => {
    const transform = buildTestTransform([
      {
        transform: 'insertRows',
        columns: {
          dataElementValue: '=$value',
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(MULTIPLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'TO', dataElement: 'BCD1', value: 4 },
        { dataElementValue: 4 },
        { period: '20200102', organisationUnit: 'TO', dataElement: 'BCD1', value: 2 },
        { dataElementValue: 2 },
        { period: '20200103', organisationUnit: 'TO', dataElement: 'BCD1', value: 5 },
        { dataElementValue: 5 },
      ]),
    );
  });

  it('can insert new rows before the relative row', async () => {
    const transform = buildTestTransform([
      {
        transform: 'insertRows',
        columns: {
          dataElementValue: '=$value',
        },
        position: 'before',
      },
    ]);
    expect(await transform(TransformTable.fromRows(MULTIPLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows(
        [
          { dataElementValue: 4 },
          { period: '20200101', organisationUnit: 'TO', dataElement: 'BCD1', value: 4 },
          { dataElementValue: 2 },
          { period: '20200102', organisationUnit: 'TO', dataElement: 'BCD1', value: 2 },
          { dataElementValue: 5 },
          { period: '20200103', organisationUnit: 'TO', dataElement: 'BCD1', value: 5 },
        ],
        ['period', 'organisationUnit', 'dataElement', 'value', 'dataElementValue'],
      ),
    );
  });

  it('can insert new rows at the beginning of the list', async () => {
    const transform = buildTestTransform([
      {
        transform: 'insertRows',
        columns: {
          dataElementValue: '=$value',
        },
        position: 'start',
      },
    ]);
    expect(await transform(TransformTable.fromRows(MULTIPLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows(
        [
          { dataElementValue: 4 },
          { dataElementValue: 2 },
          { dataElementValue: 5 },
          { period: '20200101', organisationUnit: 'TO', dataElement: 'BCD1', value: 4 },
          { period: '20200102', organisationUnit: 'TO', dataElement: 'BCD1', value: 2 },
          { period: '20200103', organisationUnit: 'TO', dataElement: 'BCD1', value: 5 },
        ],
        ['period', 'organisationUnit', 'dataElement', 'value', 'dataElementValue'],
      ),
    );
  });

  it('can insert specific new rows using a where clause', async () => {
    const transform = buildTestTransform([
      {
        transform: 'insertRows',
        columns: {
          dataElementValue: '=$value',
        },
        position: 'after',
        where: "=not(eq($period, '20200101'))",
      },
    ]);
    expect(await transform(TransformTable.fromRows(MULTIPLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'TO', dataElement: 'BCD1', value: 4 },
        { period: '20200102', organisationUnit: 'TO', dataElement: 'BCD1', value: 2 },
        { dataElementValue: 2 },
        { period: '20200103', organisationUnit: 'TO', dataElement: 'BCD1', value: 5 },
        { dataElementValue: 5 },
      ]),
    );
  });

  // USE CASES
  it('can sum all values into a new totals row', async () => {
    const transform = buildTestTransform([
      {
        transform: 'insertRows',
        where: '=eq(@index, length(@table))',
        columns: {
          Total: '=sum(@all.value)',
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(MULTIPLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'TO', dataElement: 'BCD1', value: 4 },
        { period: '20200102', organisationUnit: 'TO', dataElement: 'BCD1', value: 2 },
        { period: '20200103', organisationUnit: 'TO', dataElement: 'BCD1', value: 5 },
        { Total: 11 },
      ]),
    );
  });

  it('compare adjacent rows to insert between', async () => {
    const transform = buildTestTransform([
      {
        transform: 'insertRows',
        where: '=not(eq($organisationUnit, @next.organisationUnit))',
        columns: {
          Total_BCD1:
            '=sum(where(f(@otherRow) = equalText(@otherRow.organisationUnit, $organisationUnit)).BCD1)',
          Total_BCD2:
            '=sum(where(f(@otherRow) = equalText(@otherRow.organisationUnit, $organisationUnit)).BCD2)',
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
        { period: '20200103', organisationUnit: 'TO', BCD1: 5 },
        { period: '20200101', organisationUnit: 'TO', BCD2: 11 },
        { period: '20200102', organisationUnit: 'TO', BCD2: 1 },
        { period: '20200103', organisationUnit: 'TO', BCD2: 0 },

        { Total_BCD1: 11, Total_BCD2: 12 },

        { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
        { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
        { period: '20200103', organisationUnit: 'PG', BCD1: 2 },
        { period: '20200101', organisationUnit: 'PG', BCD2: 13 },
        { period: '20200102', organisationUnit: 'PG', BCD2: 99 },
        { period: '20200103', organisationUnit: 'PG', BCD2: -1 },

        { Total_BCD1: 17, Total_BCD2: 111 },
      ]),
    );
  });
});
