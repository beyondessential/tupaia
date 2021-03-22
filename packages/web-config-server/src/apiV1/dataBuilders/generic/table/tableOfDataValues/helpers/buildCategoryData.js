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

const listAllByCategoryId = (rowsWithData, rowsInConfig) => {
  const initialCategoryList = Object.fromEntries(
    rowsInConfig.map(row => {
      const { rows, category } = row;
      const categoryList = {};
      rows.forEach(r => {
        categoryList[r] = null;
      });
      return [category, categoryList];
    }),
  );
  const rowKeysToIgnore = new Set(METADATA_ROW_KEYS);
  return rowsWithData.reduce((columnAggregates, row) => {
    const { categoryId } = row;
    const categoryList = columnAggregates[categoryId] || {};
    Object.keys(row).forEach(key => {
      if (!rowKeysToIgnore.has(key)) {
        const value = categoryList[key] ? categoryList[key].value : initialCategoryList[categoryId];
        categoryList[key] = { value: { ...value, [row.dataElement]: row[key] } };
      }
    });

    return { ...columnAggregates, [categoryId]: categoryList };
  }, {});
};

const listAll = (rows, rowsInConfig) => {
  const itemListByCategoryId = listAllByCategoryId(rows, rowsInConfig);
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

export const buildCategoryData = (rows, categoryAggregatorCode, rowsInConfig) => {
  const categoryAggregator = categoryAggregators[categoryAggregatorCode];
  return categoryAggregator(rows, rowsInConfig);
};
