import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import sinon from 'sinon';
import xlsx from 'xlsx';
import {
  findOrCreateDummyRecord,
  findOrCreateDummyCountryEntity,
  buildAndInsertSurveyResponses,
  buildAndInsertSurveys,
} from '@tupaia/database';
import { resetTestData, TestableApp } from '../../../testUtilities';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../../permissions';
import { INFO_COLUMN_HEADERS } from '../../../../apiV2/export/exportSurveyResponses';

const DEFAULT_POLICY = {
  DL: ['Public'],
  KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Public'],
  SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
  VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Donor'],
  LA: ['Admin'],
};

const TEST_SURVEY_1_CODE = 'TEST_EXPORT_SURVEY_RESPONSES_1';
const TEST_SURVEY_1_NAME = 'Export Survey SR 1';
const TEST_SURVEY_2_CODE = 'TEST_EXPORT_SURVEY_RESPONSES_2';
const TEST_SURVEY_2_NAME = 'Export Survey SR 2';

const expectAccessibleExportDataHeaderRow = exportData => {
  expect(exportData.length).to.be.greaterThan(1);
  const headerRow = exportData[0];

  for (let i = 0; i < INFO_COLUMN_HEADERS.length; i++) {
    const headerCell = headerRow[i];
    expect(headerCell).to.be.equal(INFO_COLUMN_HEADERS[i]);
  }
};

describe('exportSurveyResponses(): GET export/surveysResponses', () => {
  const app = new TestableApp();
  const { models } = app;
  let vanuatuCountry;
  let kiribatiCountry;
  let survey1;
  let survey2;
  let user;

  before(async () => {
    await resetTestData();

    sinon.stub(xlsx.utils, 'aoa_to_sheet');

    user = await findOrCreateDummyRecord(models.user, {
      email: 'test_user@email.com',
      first_name: 'Test',
      last_name: 'User',
      id: 'test_user',
    });

    const adminPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });
    const donorPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Donor',
    });
    ({ country: vanuatuCountry } = await findOrCreateDummyCountryEntity(models, {
      code: 'VU',
      name: 'Vanuatu',
    }));
    ({ country: kiribatiCountry } = await findOrCreateDummyCountryEntity(models, {
      code: 'KI',
      name: 'Kiribati',
    }));

    [{ survey: survey1 }, { survey: survey2 }] = await buildAndInsertSurveys(models, [
      {
        code: TEST_SURVEY_1_CODE,
        name: TEST_SURVEY_1_NAME,
        country_ids: [vanuatuCountry.id],
        permission_group_id: adminPermissionGroup.id,
        questions: [
          { code: 'question_1_test', text: 'Question 1 Test', type: 'FreeText' },
          { code: 'question_2_test', text: 'Question 2 Test', type: 'FreeText' },
          { code: 'question_3_test', text: 'Question 3 Test', type: 'FreeText' },
          { code: 'question_4_test', text: 'Question 4 Test', type: 'User' },
        ],
      },
      {
        code: TEST_SURVEY_2_CODE,
        name: TEST_SURVEY_2_NAME,
        country_ids: [vanuatuCountry.id],
        permission_group_id: donorPermissionGroup.id,
        questions: [
          { code: 'question_5_test', text: 'Question 5 Test', type: 'FreeText' },
          { code: 'question_6_test', text: 'Question 6 Test', type: 'User' },
          { code: 'question_7_test', text: 'Question 7 Test', type: 'FreeText' },
          { code: 'question_8_test', text: 'Question 8 Test', type: 'FreeText' },
        ],
      },
    ]);

    await buildAndInsertSurveyResponses(models, [
      {
        surveyCode: survey1.code,
        entityCode: vanuatuCountry.code,
        data_time: new Date(),
        answers: {
          question_1_test: 'question_1_test answer',
          question_2_test: 'question_2_test answer',
        },
      },
      {
        surveyCode: survey1.code,
        entityCode: vanuatuCountry.code,
        data_time: new Date(),
        answers: {
          question_3_test: 'question_3_test answer',
          question_4_test: user.id,
        },
      },
      {
        surveyCode: survey2.code,
        entityCode: vanuatuCountry.code,
        data_time: new Date(),
        answers: {
          question_5_test: 'question_5_test answer',
          question_6_test: 'unknown_user_id',
        },
      },
      {
        surveyCode: survey2.code,
        entityCode: kiribatiCountry.code,
        outdated: true,
        data_time: new Date(),
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
    app.revokeAccess();
    xlsx.utils.aoa_to_sheet.resetHistory();
  });

  describe('Test permissions when exporting survey responses', async () => {
    describe('Should allow exporting a survey if users have Tupaia Admin Panel and survey permission group access to the corresponding countries', () => {
      it('one survey', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        await app.get(
          `export/surveyResponses?surveyCodes=${survey1.code}&countryCode=${vanuatuCountry.code}`,
        );

        expect(xlsx.utils.aoa_to_sheet).to.have.been.calledOnce;

        const exportData = xlsx.utils.aoa_to_sheet.getCall(0).args[0];
        expectAccessibleExportDataHeaderRow(exportData);
      });

      it('multiple surveys', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        await app.get(
          `export/surveyResponses?surveyCodes=${survey1.code}&surveyCodes=${survey2.code}&countryCode=${vanuatuCountry.code}`,
        );

        // Has access to both survey1 and survey2
        expect(xlsx.utils.aoa_to_sheet).to.have.been.calledTwice;

        for (let i = 0; i < xlsx.utils.aoa_to_sheet.callCount; i++) {
          const exportData = xlsx.utils.aoa_to_sheet.getCall(i).args[0];
          expectAccessibleExportDataHeaderRow(exportData);
        }
      });

      it('ignores outdated survey responses', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        await app.get(
          `export/surveyResponses?surveyCodes=${survey2.code}&countryCode=${kiribatiCountry.code}`,
        );

        // Should not fetch outdated survey response so there should be no export data
        expect(xlsx.utils.aoa_to_sheet).not.to.have.been.called;
      });
    });

    describe('Should not allow exporting a survey if users do not have Tupaia Admin Panel and survey permission group access to the corresponding countries', () => {
      it('one survey', async () => {
        const policy = {
          DL: ['Public'],
          KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Public'],
          SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
          VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /* 'Admin' */ 'Donor'], // Remove Admin permission to have insufficient permissions to access to survey1
          LA: ['Admin'],
        };

        await app.grantAccess(policy);
        await app.get(
          `export/surveyResponses?surveyCodes=${survey1.code}&countryCode=${vanuatuCountry.code}`,
        );

        expect(xlsx.utils.aoa_to_sheet).to.have.been.calledOnce;

        // Check the permissions error message in survey1 sheet
        const exportData = xlsx.utils.aoa_to_sheet.getCall(0).args[0];
        expect(exportData).to.be.deep.equal([[`You do not have export access to ${survey1.name}`]]);
      });

      it('multiple surveys', async () => {
        const policy = {
          DL: ['Public'],
          KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Public'],
          SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
          VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /* 'Admin' */ 'Donor'], // Remove Admin permission to have insufficient permissions to access to survey1
          LA: ['Admin'],
        };

        await app.grantAccess(policy);
        await app.get(
          `export/surveyResponses?surveyCodes=${survey1.code}&surveyCodes=${survey2.code}&countryCode=${vanuatuCountry.code}`,
        );

        expect(xlsx.utils.aoa_to_sheet).to.have.been.calledTwice;

        // Sheet order is non-deterministic
        const sheetExportData = [
          xlsx.utils.aoa_to_sheet.getCall(0).args[0],
          xlsx.utils.aoa_to_sheet.getCall(1).args[0],
        ];

        // Use length of response to make an informed guess which survey is in each sheet
        const survey1ExportData =
          sheetExportData[0].length > 1 ? sheetExportData[1] : sheetExportData[0];
        const survey2ExportData =
          sheetExportData[0].length > 1 ? sheetExportData[0] : sheetExportData[1];

        // Check the permissions error message in survey1 sheet
        expect(survey1ExportData).to.be.deep.equal([
          [`You do not have export access to ${survey1.name}`],
        ]);

        // Should have access to survey2
        expectAccessibleExportDataHeaderRow(survey2ExportData);
      });
    });
  });

  describe('Test user answers get generated', async () => {
    it('should export the user answers with name and id', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      await app.get(
        `export/surveyResponses?surveyCodes=${survey1.code}&countryCode=${vanuatuCountry.code}`,
      );

      expect(xlsx.utils.aoa_to_sheet).to.have.been.calledOnce;

      const exportData = xlsx.utils.aoa_to_sheet.getCall(0).args[0];

      const userAnswerRow = exportData.find(row => row[1] === 'User');
      expect(userAnswerRow.includes('Test User (test_user)')).to.be.true;
    });

    it('should ignore the entry if the user id is invalid', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      await app.get(
        `export/surveyResponses?surveyCodes=${survey2.code}&countryCode=${vanuatuCountry.code}`,
      );

      expect(xlsx.utils.aoa_to_sheet).to.have.been.calledOnce;

      const exportData = xlsx.utils.aoa_to_sheet.getCall(0).args[0];

      const userAnswerRow = exportData.find(row => row[1] === 'User');

      expect(userAnswerRow.includes('Could not find user with id unknown_user_id')).to.be.true;
    });
  });
});
