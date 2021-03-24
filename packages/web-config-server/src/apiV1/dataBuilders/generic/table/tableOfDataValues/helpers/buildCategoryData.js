import { getPresentationOption, PRESENTATION_TYPES } from '/apiV1/dataBuilders/helpers';

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

const listAll = (rowsWithData, rowsInConfig, columnsInConfig, categoryPresentationOptions) => {
  // Initial category list format to be:
  // e.g. {  ACT: {
  //            Col1: {
  //               value: {
  //                    ACT 6x1 (Coartem): null,
  //                    ACT 6x2 (Coartem): null
  //                      },
  //               conditionKey: 'green'
  //                },
  //            Col2: { value: [Object] },
  //            valueType: 'object'
  //         }
  //      }
  const categoryList = Object.fromEntries(
    rowsInConfig.map(row => {
      const { rows, category } = row;
      const itemList = {};
      rows.forEach(r => {
        itemList[r] = null;
      });
      const formattedCategoryList = {};
      columnsInConfig.forEach(column => {
        formattedCategoryList[column.key] = { value: itemList };
      });

      return [category, { ...formattedCategoryList, valueType: 'returnWithMetaData' }];
    }),
  );
  rowsWithData.forEach(row => {
    const { categoryId } = row;
    Object.keys(row).forEach(rowKey => {
      if (!METADATA_ROW_KEYS.includes(rowKey)) {
        categoryList[categoryId][rowKey].value[row.dataElement] = row[rowKey];
      }
    });
  });
  // Pre calculation for presentation options
  if (Object.values(PRESENTATION_TYPES).includes(categoryPresentationOptions.type)) {
    const categoryListWithConditionKey = { ...categoryList };
    Object.entries(categoryList).forEach(([categoryId, rows]) => {
      Object.entries(rows).forEach(([rowKey, listValues]) => {
        if (rowKey !== 'valueType') {
          const presentation = getPresentationOption(categoryPresentationOptions, listValues.value);
          categoryListWithConditionKey[categoryId][rowKey].metadata = {
            conditionKey: presentation.key,
          };
        }
      });
    });
    return categoryListWithConditionKey;
  }
  return categoryList;
};

const categoryAggregators = {
  [CATEGORY_AGGREGATION_TYPES.AVERAGE]: average,
  [CATEGORY_AGGREGATION_TYPES.LIST_ALL]: listAll,
};

export const buildCategoryData = (
  rows,
  categoryAggregatorCode,
  rowsInConfig,
  columnsInConfig,
  viewJson,
) => {
  if (!viewJson.categoryPresentationOptions)
    throw new Error(`Couldn't find 'categoryPresentationOptions' in 'viewJson'`);
  const categoryAggregator = categoryAggregators[categoryAggregatorCode];
  return categoryAggregator(
    rows,
    rowsInConfig,
    columnsInConfig,
    viewJson.categoryPresentationOptions,
  );
};
