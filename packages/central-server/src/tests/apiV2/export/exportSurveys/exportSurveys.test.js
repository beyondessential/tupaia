import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import sinon from 'sinon';
import xlsx from 'xlsx';
import {
  buildAndInsertSurveys,
  findOrCreateDummyRecord,
  findOrCreateDummyCountryEntity,
} from '@tupaia/database';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../../permissions';
import { TestableApp } from '../../../testUtilities';

const DEFAULT_POLICY = {
  DL: ['Public'],
  KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Public'],
  SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
  VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  LA: ['Admin'],
};

describe('exportSurveys(): GET export/surveys, GET export/surveys/:surveyId', () => {
  const app = new TestableApp();
  const { models } = app;

  describe('Test permissions when exporting surveys', async () => {
    let adminPermissionGroup;
    let vanuatuCountry;
    let survey1;

    before(async () => {
      sinon.stub(xlsx.utils, 'json_to_sheet');
      sinon.stub(xlsx.utils, 'aoa_to_sheet');

      adminPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
        name: 'Admin',
      });
      ({ country: vanuatuCountry } = await findOrCreateDummyCountryEntity(models, {
        code: 'VU',
        name: 'Vanuatu',
      }));

      [{ survey: survey1 }] = await buildAndInsertSurveys(models, [
        {
          code: 'TEST_EXPORTING_SURVEY_1',
          name: 'Test Exporting Survey 1',
          permission_group_id: adminPermissionGroup.id,
          country_ids: [vanuatuCountry.id],
        },
      ]);
    });

    after(() => {
      xlsx.utils.json_to_sheet.restore();
      xlsx.utils.aoa_to_sheet.restore();
    });

    afterEach(() => {
      app.revokeAccess();
      xlsx.utils.json_to_sheet.resetHistory();
    });

    it('Sufficient permissions: Should allow exporting an existing survey if users have both Tupaia Admin Panel and survey permission group access to the country of that survey', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      await app.get(`export/surveys/${survey1.id}`);

      // json_to_sheet is called when putting exportData into excel sheet
      expect(xlsx.utils.json_to_sheet).to.have.been.calledOnce;
    });

    it('Sufficient permissions: Should allow exporting an existing survey if users have both Tupaia Admin Panel and survey permission group access to the country of that survey', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      await app.get(`export/surveys?surveyCode=${survey1.code}`);

      // json_to_sheet is called when putting exportData into excel sheet
      expect(xlsx.utils.json_to_sheet).to.have.been.calledOnce;
    });

    it('Insufficient permissions: Should not allow exporting an existing survey if users do not have both Tupaia Admin Panel and survey permission group access to the country of that survey', async () => {
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Public'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /* 'Admin' */ 'Public'],
        LA: ['Admin'],
      };

      await app.grantAccess(policy);
      await app.get(`export/surveys?surveyCode=${survey1.code}`);

      // json_to_sheet is called when putting exportData into excel sheet
      expect(xlsx.utils.aoa_to_sheet).to.have.been.calledOnceWithExactly([
        [
          `One of the following conditions need to be satisfied:\nNeed BES Admin access\nNeed ${adminPermissionGroup.name} access to ${vanuatuCountry.name} to export the survey ${survey1.name}`,
        ],
      ]);
    });
  });
});
