/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  buildAndInsertSurveys,
  findOrCreateDummyCountryEntity,
  findOrCreateRecords,
} from '@tupaia/database';
import { expect } from 'chai';
import { expectError as baseExpectError, TestableApp } from '../../../testUtilities';
import { importFile } from './helpers';
import {
  createSurveyResponses,
  VALIDATION_SURVEY,
  YEARLY_SURVEY,
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
  });

  after(() => {
    app.revokeAccess();
  });

  describe('validate contents', () => {
    it('passes valid import', async () => {
      const response = await importFile(app, `validation/valid.xlsx`, ['Test_Import_Validation']);
      expect(response.status).to.equal(200);
    });

    const invalidTestData = [
      ['duplicate question id', 'duplicateQuestionId.xlsx', /not unique/],
      ['invalid binary answer', 'invalidBinaryAnswer.xlsx', /not an accepted value/],
      [
        'invalid header',
        'invalidHeader.xlsx',
        /should be a survey response id or "DEFAULT"\/"NEW"\/"UPDATE"\/"MERGE"/,
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

    invalidTestData.forEach(([description, file, expectedError]) => {
      it(description, async () => {
        const response = await importFile(app, `validation/${file}`, ['Test_Import_Validation']);
        expectError(response, expectedError);
      });
    });
  });

  describe('validate tab names', () => {
    it('requires tab names to match query', async () => {
      const response = await importFile(app, `validation/valid.xlsx`, [
        'A_Survey_Code_That_Is_Not_Specified_In_Spreadsheet_Tabs',
      ]);
      expectError(response, /specified in import but there is no tab named/);
    });

    it('detects survey codes via tab names if not present in query', async () => {
      const response = await importFile(app, `validation/valid.xlsx`, []); // surveyCodes empty
      expect(response.status).to.equal(200);
    });
  });
};
