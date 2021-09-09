/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

const TEST_DATA_FOLDER = 'src/tests/testData';

export const importFile = (app, filename, surveyNames = []) =>
  app
    .post(
      `import/surveyResponses?${surveyNames.map(s => `surveyNames=${s}`).join('&')}&timeZone=UTC`,
    )
    .attach('surveyResponses', `${TEST_DATA_FOLDER}/surveyResponses/${filename}`);
