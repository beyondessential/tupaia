const CATEGORY_AGGREGATION_TYPES = {
  AVERAGE: '$average',
  LIST_ALL: '$listAll',
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

const listAllByCategoryId = rows => {
  const rowKeysToIgnore = new Set(METADATA_ROW_KEYS);
  return rows.reduce((columnAggregates, row) => {
    const { categoryId } = row;
    const categoryList = columnAggregates[categoryId] || {};
    // row = {categoryId: "ACT", dataElement:"ACT 6x1", Col1:1, Col:2, Col:3}
    Object.keys(row).forEach(key => {
      if (!rowKeysToIgnore.has(key)) {
        const value = categoryList[key] && categoryList[key].value;
        categoryList[key] = { value: { ...value, [row.dataElement]: row[key] } };
      }
    });

    return { ...columnAggregates, [categoryId]: categoryList };
  }, {});
};

const listAll = rows => {
  const itemListByCategoryId = listAllByCategoryId(rows);
  return Object.entries(itemListByCategoryId).reduce(
    (categoryList, [categoryId, columns]) => ({
      ...categoryList,
      [categoryId]: { ...columns, valueType: 'object' },
    }),
    {},
  );
};

const categoryAggregators = {
  [CATEGORY_AGGREGATION_TYPES.AVERAGE]: average,
  [CATEGORY_AGGREGATION_TYPES.LIST_ALL]: listAll,
};

export const buildCategoryData = (rows, categoryAggregatorCode) => {
  const categoryAggregator = categoryAggregators[categoryAggregatorCode];
  return categoryAggregator(rows);
};
