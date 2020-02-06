export const average = (columns, rowData) => {
  const columnKeys = columns.map(c => c.key);
  const categoryRows = rowData.reduce((categoryValues, data) => {
    const existing = categoryValues[data.categoryId] || {};
    const newCategoryValues = {
      ...categoryValues,
      [data.categoryId]: { ...existing, dataElement: data.categoryId },
    };

    for (const key of columnKeys) {
      newCategoryValues[data.categoryId][key]
        ? newCategoryValues[data.categoryId][key].push(data[key])
        : (newCategoryValues[data.categoryId][key] = [data[key]]);
    }

    return newCategoryValues;
  }, {});

  const categoryData = [];
  for (const value of Object.values(categoryRows)) {
    const row = { categoryKey: value.dataElement };
    for (const key of columnKeys) {
      row[key] = Math.round(value[key].reduce((a, b) => a + b, 0) / value[key].length);
    }
    categoryData.push(row);
  }

  return categoryData;
};
