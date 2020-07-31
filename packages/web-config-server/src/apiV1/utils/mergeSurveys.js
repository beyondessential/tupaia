/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/* join mulitplre data into single table joining on key */
export const mergeSurveys = (surveys, config) => {
  const { name } = config.surveys[0];
  let mergedSurveyData = {};

  Object.keys(surveys).forEach(survey => {
    if (!mergedSurveyData.data) {
      mergedSurveyData = { ...surveys[survey] };
    } else {
      mergedSurveyData.data = mergeInData(mergedSurveyData.data, surveys[survey].data);
    }
  });
  //console.log('mergedData[name].data.rows.length', mergedData[name].data.rows.length);
  return { [name]: mergedSurveyData };
};

const mergeInData = (currentData, newData) => {
  if (!newData) return currentData;

  const mergedData = {};
  mergedData.rows = currentData.rows.concat(newData.rows);

  const mergedColumns = [];
  const currentColumns = currentData.columns;
  const newColumns = newData.columns;
  const compareColumns = (currentCol, newCol) => {
    if (!newCol || newCol.mergeCompareValue < currentCol.mergeCompareValue) return 1;
    if (!currentCol || newCol.mergeCompareValue > currentCol.mergeCompareValue) return -1;
    return 0;
  };

  let nextCurrentColumn = currentColumns.shift();
  let nextNewColumn = newColumns.shift();

  while (currentColumns.length + newColumns.length > 0) {
    const compareState = compareColumns(nextCurrentColumn, nextNewColumn);

    if (compareState === 0) {
      mergedColumns.push(nextCurrentColumn);
      nextCurrentColumn = currentColumns.shift();
      mergedColumns.push(nextNewColumn);
      nextNewColumn = newColumns.shift();
    }

    if (compareState < 0) {
      mergedColumns.push(nextNewColumn);
      nextNewColumn = newColumns.shift();
    }

    if (compareState > 0) {
      mergedColumns.push(nextCurrentColumn);
      nextCurrentColumn = currentColumns.shift();
    }
  }

  mergedData.columns = mergedColumns;

  return mergedData;
};
