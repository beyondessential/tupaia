import { getCategoryPresentationOption } from '/apiV1/dataBuilders/helpers';
import { CONDITION, AVERAGE } from '/apiV1/dataBuilders/constants';
import { groupBy } from 'es-toolkit/compat';

const CATEGORY_AGGREGATION_TYPES = [AVERAGE, CONDITION];

const METADATA_ROW_KEYS = ['dataElement', 'categoryId'];

const calculateCategoryTotals = rows => {
  const rowKeysToIgnore = new Set(METADATA_ROW_KEYS);
  return rows.reduce((columnAggregates, row) => {
    const { categoryId } = row;
    const categoryTotals = columnAggregates[categoryId] || {};
    Object.keys(row).forEach(key => {
      if (!rowKeysToIgnore.has(key)) {
        categoryTotals[key] = (categoryTotals[key] || 0) + (row[key] || 0);
      }
    });

    return { ...columnAggregates, [categoryId]: categoryTotals };
  }, {});
};

const average = rows => {
  const totals = calculateCategoryTotals(rows);
  const categoryRowLengths = rows.reduce(
    (lengths, row) => ({ ...lengths, [row.categoryId]: lengths[row.categoryId] + 1 || 1 }),
    {},
  );

  return Object.entries(totals).reduce((averages, [category, columns]) => {
    const averagedColumns = {};

    Object.keys(columns).forEach(column => {
      averagedColumns[column] = Math.round(columns[column] / categoryRowLengths[category]);
    });

    return { ...averages, [category]: averagedColumns };
  }, {});
};

const condition = (rows, columns, config) => {
  const categoryList = {};
  const rowsWithDataByCategoryId = groupBy(rows, 'categoryId');
  Object.entries(rowsWithDataByCategoryId).forEach(([categoryId, datas]) => {
    for (const { key: columnId } of columns) {
      const values = datas.map(data => data[columnId] ?? null);
      // Pre calculation for presentation options
      const presentationKey = getCategoryPresentationOption(config, values);
      categoryList[categoryId] = { ...categoryList[categoryId], [columnId]: presentationKey };
    }
  });
  return categoryList;
};

const categoryAggregators = {
  [AVERAGE]: average,
  [CONDITION]: condition,
};

export const buildCategoryData = ({ rows, categoryAggregatorConfig, columns }) => {
  const categoryAggregatorType =
    typeof categoryAggregatorConfig === 'string'
      ? categoryAggregatorConfig
      : categoryAggregatorConfig.type;

  if (!CATEGORY_AGGREGATION_TYPES.includes(categoryAggregatorType))
    throw new Error(`Couldn't find ${categoryAggregatorType} in 'categoryAggregator'`);

  const categoryAggregator = categoryAggregators[categoryAggregatorType];
  return categoryAggregator(rows, columns, categoryAggregatorConfig);
};
