/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

const TEST_DATA_FOLDER = 'src/tests/testData';

export const importFile = (app, filename, surveyNames = []) => {
  const queryParams = ['timeZone=UTC', ...surveyNames.map(s => `surveyNames=${s}`)];
  return app
    .post(`import/surveyResponses?${queryParams.join('&')}`)
    .attach('surveyResponses', `${TEST_DATA_FOLDER}/surveyResponses/${filename}`);
};

export const importValidFile = async (app, filename, surveyNames) => {
  const response = await importFile(app, filename, surveyNames);
  if (response.statusCode !== 200) {
    throw new Error(
      `Importing ${filename} failed with status ${response.statusCode} and error '${response.error.text}'`,
    );
  }
  return response;
};
