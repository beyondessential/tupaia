import { buildCategoryData } from '/apiV1/dataBuilders/generic/table/tableOfDataValues/helpers';

const rows = [
  { categoryId: 'ACT', dataElement: 'ACT 6x1', Col1: 1, Col2: 1 },
  { categoryId: 'ACT', dataElement: 'ACT 6x2', Col1: 0, Col2: 1 },
  { categoryId: 'ACT', dataElement: 'ACT 6x3', Col1: 1, Col2: 1 },
];
const categoryAggregatorConfig = {
  type: '$condition',
  conditions: [
    {
      key: 'green',
      condition: {
        '>': 0,
      },
    },
    {
      key: 'orange',
      condition: {
        someNotAll: { '>': 0 },
      },
    },
  ],
};
const columns = [
  { key: 'Col1', title: 'column 1' },
  { key: 'Col2', title: 'column 2' },
];
const expectedValue = {
  ACT: {
    Col1: 'orange',
    Col2: 'green',
  },
};

describe('buildCategoryData()', () => {
  describe('type: $condition', () => {
    it('condition: someNotAll', () => {
      expect(buildCategoryData({ rows, categoryAggregatorConfig, columns })).toStrictEqual(
        expectedValue,
      );
    });
  });
});
