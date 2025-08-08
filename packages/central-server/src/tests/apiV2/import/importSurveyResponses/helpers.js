const TEST_DATA_FOLDER = 'src/tests/testData';

export const importFile = (app, filename, surveyCodes = []) => {
  const queryParams = ['timeZone=UTC', ...surveyCodes.map(s => `surveyCodes=${s}`)];
  return app
    .post(`import/surveyResponses?${queryParams.join('&')}`)
    .attach('surveyResponses', `${TEST_DATA_FOLDER}/surveyResponses/${filename}`);
};

export const importValidFile = async (app, filename, surveyCodes) => {
  const response = await importFile(app, filename, surveyCodes);
  if (response.statusCode !== 200) {
    throw new Error(
      `Importing ${filename} failed with status ${response.statusCode} and error '${response.error.text}'`,
    );
  }
  return response;
};
