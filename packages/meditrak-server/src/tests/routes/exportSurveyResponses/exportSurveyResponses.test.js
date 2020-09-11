/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';
import xlsx from 'xlsx';
import { Authenticator } from '@tupaia/auth';
import { buildAndInsertSurveyResponses, buildAndInsertSurveys } from '@tupaia/database';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';
import { TestableApp } from '../../TestableApp';
import { INFO_COLUMN_HEADERS } from '../../../routes/exportSurveyResponses/exportSurveyResponses';

const DEFAULT_POLICY = {
  DL: ['Public'],
  KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Public'],
  SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
  VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Donor'],
  LA: ['Admin'],
};

const TEST_SURVEY_1_CODE = 'TEST_SURVEY_EXPORT_SURVEY_RESPONSES_1';
const TEST_SURVEY_1_NAME = 'Export Survey SR 1';
const TEST_SURVEY_2_CODE = 'TEST_SURVEY_EXPORT_SURVEY_RESPONSES_2';
const TEST_SURVEY_2_NAME = 'Export Survey SR 2';

const prepareStubAndAuthenticate = async (app, policy = DEFAULT_POLICY) => {
  sinon.stub(Authenticator.prototype, 'getAccessPolicyForUser').returns(policy);
  await app.authenticate();
};

const expectAccessibleExportDataHeaderRow = aoaExportData => {
  expect(aoaExportData.length).to.be.greaterThan(1);
  const headerRow = aoaExportData[0];

  for (let i = 0; i < INFO_COLUMN_HEADERS.length; i++) {
    const headerCell = headerRow[i];
    expect(headerCell).to.be.equal(INFO_COLUMN_HEADERS[i]);
  }
};

describe('exportSurveys(): GET export/surveysResponses', () => {
  const app = new TestableApp();
  const models = app.models;

  describe('Test permissions when exporting survey responses', async () => {
    let vanuatuCountry;
    let survey1;
    let survey2;

    before(async () => {
      sinon.stub(xlsx.utils, 'aoa_to_sheet');

      const adminPermissionGroup = await models.permissionGroup.findOne({ name: 'Admin' });
      const donorPermissionGroup = await models.permissionGroup.findOne({ name: 'Donor' });

      vanuatuCountry = await models.country.findOne({ code: 'VU' });

      [{ survey: survey1 }, { survey: survey2 }] = await buildAndInsertSurveys(models, [
        {
          code: TEST_SURVEY_1_CODE,
          name: TEST_SURVEY_1_NAME,
          country_ids: [vanuatuCountry.id],
          permission_group_id: adminPermissionGroup.id,
        },
        {
          code: TEST_SURVEY_2_CODE,
          name: TEST_SURVEY_2_NAME,
          country_ids: [vanuatuCountry.id],
          permission_group_id: donorPermissionGroup.id,
        },
      ]);

      await buildAndInsertSurveyResponses(models, [
        {
          surveyCode: survey1.code,
          entityCode: 'VU',
          submission_time: new Date(),
          answers: {
            question_1_test: 'question_1_test answer',
            question_2_test: 'question_2_test answer',
          },
        },
        {
          surveyCode: survey1.code,
          entityCode: 'VU',
          submission_time: new Date(),
          answers: {
            question_3_test: 'question_3_test answer',
            question_4_test: 'question_4_test answer',
          },
        },
        {
          surveyCode: survey2.code,
          entityCode: 'VU',
          submission_time: new Date(),
          answers: {
            question_5_test: 'question_5_test answer',
            question_6_test: 'question_6_test answer',
          },
        },
        {
          surveyCode: survey2.code,
          entityCode: 'KI',
          submission_time: new Date(),
          answers: {
            question_7_test: 'question_7_test answer',
            question_8_test: 'question_8_test answer',
          },
        },
      ]);
    });

    after(() => {
      xlsx.utils.aoa_to_sheet.restore();
    });

    afterEach(() => {
      Authenticator.prototype.getAccessPolicyForUser.restore();
      xlsx.utils.aoa_to_sheet.resetHistory();
    });

    it('Sufficient permissions: Should allow exporting an existing survey if users have both Tupaia Admin Panel and survey permission group access to the country of that survey', async () => {
      await prepareStubAndAuthenticate(app);
      await app.get(
        `export/surveyResponses?surveyCodes=${survey1.code}&countryCode=${vanuatuCountry.code}`,
      );

      expect(xlsx.utils.aoa_to_sheet).to.have.been.calledOnce;

      const exportData = xlsx.utils.aoa_to_sheet.getCall(0).args[0];
      expectAccessibleExportDataHeaderRow(exportData);
    });

    it('Sufficient permissions: Should allow exporting an existing survey if users have both Tupaia Admin Panel and survey permission group access to the country of that survey', async () => {
      await prepareStubAndAuthenticate(app);
      await app.get(
        `export/surveyResponses?surveyCodes=${survey1.code}&surveyCodes=${survey2.code}&countryCode=${vanuatuCountry.code}`,
      );

      //Has access to both survey1 and survey2
      expect(xlsx.utils.aoa_to_sheet).to.have.been.calledTwice;

      for (let i = 0; i < xlsx.utils.aoa_to_sheet.callCount; i++) {
        const exportData = xlsx.utils.aoa_to_sheet.getCall(i).args[0];
        expectAccessibleExportDataHeaderRow(exportData);
      }
    });

    it('Insufficient permissions: Should not allow exporting an existing survey if users do not have the survey permission group access to the survey country', async () => {
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Public'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /*'Admin'*/ 'Donor'], //Remove Admin permission to have insufficient permissions to access to survey1
        LA: ['Admin'],
      };

      await prepareStubAndAuthenticate(app, policy);
      await app.get(
        `export/surveyResponses?surveyCodes=${survey1.code}&surveyCodes=${survey2.code}&countryCode=${vanuatuCountry.code}`,
      );

      expect(xlsx.utils.aoa_to_sheet).to.have.been.calledTwice;

      //Check the permissions error message in survey1 sheet
      const survey1ExportData = xlsx.utils.aoa_to_sheet.getCall(0).args[0];
      expect(survey1ExportData).to.be.deep.equal([
        [`You do not have export access to ${survey1.name}`],
      ]);

      //Has access to survey2
      const survey2ExportData = xlsx.utils.aoa_to_sheet.getCall(1).args[0];
      expectAccessibleExportDataHeaderRow(survey2ExportData);
    });
  });
});
