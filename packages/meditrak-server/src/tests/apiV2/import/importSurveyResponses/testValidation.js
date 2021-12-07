/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  buildAndInsertSurveys,
  findOrCreateDummyCountryEntity,
  findOrCreateRecords,
} from '@tupaia/database';
import { expectError as baseExpectError, TestableApp } from '../../../testUtilities';
import { importFile } from './helpers';
import {
  createSurveyResponses,
  VALIDATION_SURVEY,
  VALIDATION_RESPONSE_IDS,
} from './importSurveyResponses.fixtures';

export const testValidation = async () => {
  const app = new TestableApp();
  const { models } = app;

  const expectError = (response, expectedError) => baseExpectError(response, expectedError, 400);

  before(async () => {
    await app.grantFullAccess();

    await buildAndInsertSurveys(models, [VALIDATION_SURVEY]);
    await findOrCreateDummyCountryEntity(models, { code: 'DL', name: 'Demo Land' });
    await findOrCreateRecords(models, {
      entity: ['DL_7', 'DL_9', 'DL_10', 'DL_11'].map(code => ({ code, country_code: 'DL' })),
    });
    await createSurveyResponses(models, VALIDATION_RESPONSE_IDS);
  });

  after(() => {
    app.revokeAccess();
  });

  describe('survey names are specified', () => {
    const testData = [
      ['duplicate question id', 'duplicateQuestionId.xlsx', /not unique/],
      ['invalid binary answer', 'invalidBinaryAnswer.xlsx', /not an accepted value/],
      [
        'invalid header',
        'invalidHeader.xlsx',
        /should be a survey response id or "NEW"\/"UPDATE"\/"MERGE"/,
      ],
      ['invalid number answer', 'invalidNumberAnswer.xlsx', /Should contain a number/],
      ['invalid radio answer', 'invalidRadioAnswer.xlsx', /not an accepted value/],
      ['header row is missing', 'missingHeaderRow.xlsx', /Missing Id column/],
      ['id column is missing', 'missingIdColumn.xlsx', /Missing Id column/],
      ['a question id is missing', 'missingQuestionId.xlsx', /Should not be empty/],
      ['a response id is missing', 'missingResponseId.xlsx', /Invalid column header/],
      ['type column is missing', 'missingTypeColumn.xlsx', /Missing Type column/],
      [
        'a question id does not match an existing question',
        'nonExistentQuestionId.xlsx',
        /No question with id/,
      ],
    ];

    testData.forEach(([description, file, expectedError]) => {
      it(description, async () => {
        const response = await importFile(app, `validation/${file}`, ['Test Import Validation']);
        expectError(response, expectedError);
      });
    });
  });

  describe('survey names are not specified', () => {
    const testData = [
      [
        'header row is missing',
        'missingHeaderRow.xlsx',
        /Each tab of the import file must have at least one previously submitted survey as the first entry/,
      ],
      [
        'a response id is missing',
        'missingResponseId.xlsx',
        /Each tab of the import file must have at least one previously submitted survey as the first entry/,
      ],
    ];

    testData.forEach(([description, file, expectedError]) => {
      it(description, async () => {
        const response = await importFile(app, `validation/${file}`);
        expectError(response, expectedError);
      });
    });
  });
};
