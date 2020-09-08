/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { AccessPolicy } from '@tupaia/access-policy';
import { buildAndInsertSurveys } from '@tupaia/database';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';
import { getModels } from '../../getModels';
import { assertCanExportSurveys } from '../../../routes/exportSurveys/assertCanExportSurveys';

const DEFAULT_POLICY = {
  DL: ['Public'],
  KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
  VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  LA: ['Admin'],
};

describe('Permissions checker for Exporting Surveys', async () => {
  const models = getModels();
  let survey1;
  let survey2;
  let survey3;

  before(async () => {
    const adminPermissionGroup = await models.permissionGroup.findOne({ name: 'Admin' });
    const vanuatuCountry = await models.country.findOne({ code: 'VU' });
    const kiribatiCountry = await models.country.findOne({ code: 'KI' });

    [{ survey: survey1 }, { survey: survey2 }, { survey: survey3 }] = await buildAndInsertSurveys(
      models,
      [
        {
          code: 'TEST_EXPORTING_SURVEY_1',
          name: 'Test Exporting Survey 1',
          permission_group_id: adminPermissionGroup.id,
          country_ids: [vanuatuCountry.id],
        },
        {
          code: 'TEST_EXPORTING_SURVEY_2',
          name: 'Test Exporting Survey 2',
          permission_group_id: adminPermissionGroup.id,
          country_ids: [vanuatuCountry.id],
        },
        {
          code: 'TEST_EXPORTING_SURVEY_3',
          name: 'Test Exporting Survey 3',
          permission_group_id: adminPermissionGroup.id,
          country_ids: [kiribatiCountry.id],
        },
      ],
    );

    console.log('survey1', survey1);
  });

  describe('Sufficient permissions when exporting existing surveys', async () => {
    it('Sufficient permissions: Should allow exporting an existing survey if users have Tupaia Admin Panel and survey permission group access to the country of that survey', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const result = await assertCanExportSurveys(accessPolicy, models, [survey1]);

      expect(result).to.true;
    });

    it('Sufficient permissions: Should allow exporting multiple existing survey if users have Tupaia Admin Panel and survey permission group access to the country of those surveys', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const result = await assertCanExportSurveys(accessPolicy, models, [
        survey1,
        survey2,
        survey3,
      ]);

      expect(result).to.true;
    });

    it('Insufficient permissions: Should not allow exporting an existing survey if users do not have survey permission group access to the country of that survey', async () => {
      //No Admin Permission to VU => insufficient permissions for survey1
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /*'Admin'*/],
        LA: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);
      expect(() => assertCanExportSurveys(accessPolicy, models, [survey1])).to.throw;
    });

    it('Insufficient permissions: Should not allow exporting an existing survey if users do not have Tupaia Admin Panel access to the country of that survey', async () => {
      //No TUPAIA_ADMIN_PANEL_PERMISSION_GROUP Permission to VU => insufficient permissions for survey1
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [/*TUPAIA_ADMIN_PANEL_PERMISSION_GROUP*/ 'Admin'],
        LA: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);
      expect(() => assertCanExportSurveys(accessPolicy, models, [survey1])).to.throw;
    });

    it('Insufficient permissions: Should not allow exporting multiple existing surveys if users do not have survey permission group access to the country of any of the surveys', async () => {
      //No Admin Permission to VU => insufficient permissions for survey1
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /*'Admin'*/],
        LA: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);

      expect(() => assertCanExportSurveys(accessPolicy, models, [survey1, survey2, survey3])).to
        .throw;
    });

    it('Insufficient permissions: Should not allow exporting multiple existing surveys if users do not have TUPAIA_ADMIN_PANEL_PERMISSION_GROUP access to the country of any of the surveys', async () => {
      //No Admin Permission to VU => insufficient permissions for survey1
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [/*TUPAIA_ADMIN_PANEL_PERMISSION_GROUP*/ 'Admin'],
        LA: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);

      expect(() => assertCanExportSurveys(accessPolicy, models, [survey1, survey2, survey3])).to
        .throw;
    });
  });
});
