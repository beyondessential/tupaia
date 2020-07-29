/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

/* take a object with columns and rows and return an object with rows and columns switched */
export const mergeSurveys = (surveys, surveyConfig) => {
  const sheetName = 'Aligned Test Data';
  let mergedSurveyData = {};

  Object.keys(surveys).forEach(survey => {

    if (!mergedSurveyData.data) {
      mergedSurveyData = { ...surveys[survey] };
    } else {
      mergedSurveyData.data = mergeInData(mergedSurveyData.data, surveys[survey].data);
    }
  });
  //console.log('mergedData[sheetName].data.rows.length', mergedData[sheetName].data.rows.length);
  return { [sheetName]: mergedSurveyData };
};

const mergeInData = (currentData, newData) => {
  const mergedData = currentData;
  if (!newData) return mergedData;

  const mergeColumns = currentData.columns.concat(newData.columns);
  mergedData.columns = mergeColumns;
  const mergeRows = currentData.rows.concat(newData.rows);
  mergedData.rows = mergeRows;
  return { ...mergedData };
};
