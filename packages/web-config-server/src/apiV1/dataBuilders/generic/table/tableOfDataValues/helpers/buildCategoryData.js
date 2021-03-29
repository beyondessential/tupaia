import { getPresentationOption } from '/apiV1/dataBuilders/helpers';

import groupBy from 'lodash.groupby';

const CATEGORY_AGGREGATION_TYPES = {
  AVERAGE: '$average',
  CONDITION: '$condition',
};
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

const condition = (rowsWithData, columnsInConfig, categoryAggregatorConfig) => {
  if (!categoryAggregatorConfig.conditions) {
    throw new Error(`Couldn't find 'conditions' in 'categoryAggregator'`);
  }
  const categoryList = {};
  const rowsWithDataByCategoryId = groupBy(rowsWithData, 'categoryId');
  Object.entries(rowsWithDataByCategoryId).forEach(([categoryId, datas]) => {
    for (const { key: columnId } of columnsInConfig) {
      const values = datas.map(data => data[columnId] || null);
      // Pre calculation for presentation options
      const presentationKey = getPresentationOption(categoryAggregatorConfig, values);
      categoryList[categoryId] = { ...categoryList[categoryId], [columnId]: presentationKey };
    }
  });
  return categoryList;
};

const categoryAggregators = {
  [CATEGORY_AGGREGATION_TYPES.AVERAGE]: average,
  [CATEGORY_AGGREGATION_TYPES.CONDITION]: condition,
};

export const buildCategoryData = ({ rows, categoryAggregatorConfig, columnsInConfig }) => {
  // if (!viewJson.categoryPresentationOptions)
  //   throw new Error(`Couldn't find 'categoryPresentationOptions' in 'viewJson'`);
  const categoryAggregatorType =
    categoryAggregatorConfig === 'string'
      ? categoryAggregatorConfig
      : categoryAggregatorConfig.type;
  const categoryAggregator = categoryAggregators[categoryAggregatorType];
  return categoryAggregator(rows, columnsInConfig, categoryAggregatorConfig);
};
