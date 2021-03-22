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

const listAll = (rowsWithData, rowsInConfig, columnsInConfig) => {
  const categoryList = rowsInConfig.map(row => {
    const { rows, category } = row;
    const itemList = {};
    rows.forEach(r => {
      itemList[r] = null;
    });
    const formattedCategoryList = {};
    columnsInConfig.forEach(column => {
      formattedCategoryList[column.key] = { value: itemList };
    });

    return { category, ...formattedCategoryList, valueType: 'object' };
  });

  rowsWithData.forEach(row => {
    const { categoryId } = row;
    Object.keys(row).forEach(key => {
      if (!METADATA_ROW_KEYS.includes(key)) {
        const index = categoryList.findIndex(category => category.category === categoryId);
        categoryList[index][key].value[row.dataElement] = row[key];
      }
    });
  });

  return categoryList;
};

const categoryAggregators = {
  [CATEGORY_AGGREGATION_TYPES.AVERAGE]: average,
  [CATEGORY_AGGREGATION_TYPES.LIST_ALL]: listAll,
};

export const buildCategoryData = (rows, categoryAggregatorCode, rowsInConfig, columnsInConfig) => {
  const categoryAggregator = categoryAggregators[categoryAggregatorCode];
  return categoryAggregator(rows, rowsInConfig, columnsInConfig);
};
