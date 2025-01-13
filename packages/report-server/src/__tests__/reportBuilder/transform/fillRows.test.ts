import {
  FILLABLE_ANALYTICS,
  FILLABLE_ANALYTICS_WITH_DATE,
  MULTI_COL_FILLABLE_ANALYTICS,
} from './transform.fixtures';
import { TransformTable } from '../../../reportBuilder/transform';
import { buildTestTransform } from '../testUtils';

describe('fillRows', () => {
  it('throws an error if column in requiredColumnValues does not exist in table', async () => {
    const transform = buildTestTransform([
      {
        transform: 'fillRows',
        requiredColumnValues: [
          {
            column: 'fake_column',
            values: ['any'],
          },
        ],
        missingRowValues: {
          BCD1: 'filled',
          organisationUnit: 'TO',
        },
      },
    ]);
    await expect(transform(TransformTable.fromRows(FILLABLE_ANALYTICS))).rejects.toThrow(
      /Invalid columns in requiredColumnValues. Columns do not exist in the table: fake_column/,
    );
  });

  it('throws an error if column in missingRowValues does not exist in table', async () => {
    const transform = buildTestTransform([
      {
        transform: 'fillRows',
        requiredColumnValues: [
          {
            column: 'period',
            values: ['any'],
          },
        ],
        missingRowValues: {
          fake_column: 'filled',
          organisationUnit: 'TO',
        },
      },
    ]);
    await expect(transform(TransformTable.fromRows(FILLABLE_ANALYTICS))).rejects.toThrow(
      /Invalid columns in missingRowValues. Columns do not exist in the table: fake_column/,
    );
  });

  it('throws an error if column orderings do not match', async () => {
    const transform = buildTestTransform([
      {
        transform: 'fillRows',
        requiredColumnValues: [
          {
            column: 'period',
            values: ['20200101', '20200103', '20200102', '20200104', '20200105', '20200106'],
          },
        ],
        missingRowValues: {
          BCD1: 'filled',
          organisationUnit: 'TO',
        },
      },
    ]);
    await expect(transform(TransformTable.fromRows(FILLABLE_ANALYTICS))).rejects.toThrow(
      /Column order in table does not match expected order for filling rows/,
    );
  });

  it('can fill rows where a column has missing values', async () => {
    const transform = buildTestTransform([
      {
        transform: 'fillRows',
        requiredColumnValues: [
          {
            column: 'period',
            values: ['20200101', '20200102', '20200103', '20200104', '20200105', '20200106'],
          },
        ],
        missingRowValues: {
          BCD1: 'filled',
          organisationUnit: 'TO',
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(FILLABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'TO', BCD1: 1 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
        { period: '20200103', organisationUnit: 'TO', BCD1: 3 },
        { period: '20200104', organisationUnit: 'TO', BCD1: 'filled' },
        { period: '20200105', organisationUnit: 'TO', BCD1: 5 },
        { period: '20200106', organisationUnit: 'TO', BCD1: 6 },
      ]),
    );
  });

  it('can fill rows where multiple column combinations have missing values', async () => {
    const transform = buildTestTransform([
      {
        transform: 'fillRows',
        requiredColumnValues: [
          {
            column: 'organisationUnit',
            values: ['TO', 'FJ', 'PG'],
          },
          {
            column: 'period',
            values: ['20200101', '20200102', '20200103', '20200104'],
          },
        ],
        missingRowValues: {
          BCD1: 'filled',
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(MULTI_COL_FILLABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
        { period: '20200103', organisationUnit: 'TO', BCD1: 'filled' },
        { period: '20200104', organisationUnit: 'TO', BCD1: 5 },
        { period: '20200101', organisationUnit: 'FJ', BCD1: 'filled' },
        { period: '20200102', organisationUnit: 'FJ', BCD1: 5 },
        { period: '20200103', organisationUnit: 'FJ', BCD1: 'filled' },
        { period: '20200104', organisationUnit: 'FJ', BCD1: 'filled' },
        { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
        { period: '20200102', organisationUnit: 'PG', BCD1: 'filled' },
        { period: '20200103', organisationUnit: 'PG', BCD1: 8 },
        { period: '20200104', organisationUnit: 'PG', BCD1: 2 },
      ]),
    );
  });

  it('can fill rows outside of the existing range of values', async () => {
    const transform = buildTestTransform([
      {
        transform: 'fillRows',
        requiredColumnValues: [
          {
            column: 'period',
            values: [
              '20191231',
              '20200101',
              '20200102',
              '20200103',
              '20200104',
              '20200105',
              '20200106',
              '20200107',
            ],
          },
        ],
        missingRowValues: {
          BCD1: 'filled',
          organisationUnit: 'TO',
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(FILLABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20191231', organisationUnit: 'TO', BCD1: 'filled' },
        { period: '20200101', organisationUnit: 'TO', BCD1: 1 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
        { period: '20200103', organisationUnit: 'TO', BCD1: 3 },
        { period: '20200104', organisationUnit: 'TO', BCD1: 'filled' },
        { period: '20200105', organisationUnit: 'TO', BCD1: 5 },
        { period: '20200106', organisationUnit: 'TO', BCD1: 6 },
        { period: '20200107', organisationUnit: 'TO', BCD1: 'filled' },
      ]),
    );
  });

  it('orders filled rows based on index of last matched value', async () => {
    const transform = buildTestTransform([
      {
        transform: 'fillRows',
        requiredColumnValues: [
          {
            column: 'period',
            values: ['20191231', '20200102', '20200107', '20200108', '20200105', '20200104'],
          },
        ],
        missingRowValues: {
          BCD1: 'filled',
          organisationUnit: 'TO',
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(FILLABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20191231', organisationUnit: 'TO', BCD1: 'filled' },
        { period: '20200101', organisationUnit: 'TO', BCD1: 1 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
        { period: '20200107', organisationUnit: 'TO', BCD1: 'filled' }, // preceding value in list is 20200102
        { period: '20200108', organisationUnit: 'TO', BCD1: 'filled' }, // preceding value in list is 20200102
        { period: '20200103', organisationUnit: 'TO', BCD1: 3 },
        { period: '20200105', organisationUnit: 'TO', BCD1: 5 },
        { period: '20200104', organisationUnit: 'TO', BCD1: 'filled' }, // preceding value in list is 20200105
        { period: '20200106', organisationUnit: 'TO', BCD1: 6 },
      ]),
    );
  });

  it('supports expressions in the column values', async () => {
    const transform = buildTestTransform([
      {
        transform: 'fillRows',
        requiredColumnValues: [
          {
            column: 'date',
            values:
              "= dateUtils.eachDayOfInterval({ start: date('2019-12-31'), end: date('2020-01-07')}).map(dateToString)",
          },
        ],
        missingRowValues: {
          BCD1: 'filled',
          organisationUnit: 'TO',
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(FILLABLE_ANALYTICS_WITH_DATE))).toStrictEqual(
      TransformTable.fromRows([
        { date: '2019-12-31', organisationUnit: 'TO', BCD1: 'filled' },
        { date: '2020-01-01', organisationUnit: 'TO', BCD1: 1 },
        { date: '2020-01-02', organisationUnit: 'TO', BCD1: 2 },
        { date: '2020-01-03', organisationUnit: 'TO', BCD1: 3 },
        { date: '2020-01-04', organisationUnit: 'TO', BCD1: 'filled' },
        { date: '2020-01-05', organisationUnit: 'TO', BCD1: 5 },
        { date: '2020-01-06', organisationUnit: 'TO', BCD1: 6 },
        { date: '2020-01-07', organisationUnit: 'TO', BCD1: 'filled' },
      ]),
    );
  });

  it('supports expressions in the missing rows values', async () => {
    const transform = buildTestTransform([
      {
        transform: 'fillRows',
        requiredColumnValues: [
          {
            column: 'period',
            values: [
              '20191231',
              '20200101',
              '20200102',
              '20200103',
              '20200104',
              '20200105',
              '20200106',
              '20200107',
            ],
          },
        ],
        missingRowValues: {
          BCD1: '= @index > 1 ? @current.BCD1 : 0',
          organisationUnit: "= 'org unit ' + @index",
        },
      },
    ]);
    expect(await transform(TransformTable.fromRows(FILLABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20191231', organisationUnit: 'org unit 1', BCD1: 0 },
        { period: '20200101', organisationUnit: 'TO', BCD1: 1 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
        { period: '20200103', organisationUnit: 'TO', BCD1: 3 },
        { period: '20200104', organisationUnit: 'org unit 3', BCD1: 3 }, // Indexing is a little awkward due to not knowing rows are being filled
        { period: '20200105', organisationUnit: 'TO', BCD1: 5 },
        { period: '20200106', organisationUnit: 'TO', BCD1: 6 },
        { period: '20200107', organisationUnit: 'org unit 5', BCD1: 6 }, // Indexing is a little awkward due to not knowing rows are being filled
      ]),
    );
  });
});
