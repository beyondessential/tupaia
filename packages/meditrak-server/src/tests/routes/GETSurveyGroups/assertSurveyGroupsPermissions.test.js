/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { AccessPolicy } from '@tupaia/access-policy';
import { buildAndInsertSurveys, findOrCreateDummyRecord } from '@tupaia/database';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';
import { getModels } from '../../getModels';
import {
  filterSurveyGroupsByPermissions,
  assertSurveyGroupsPermissions,
} from '../../../routes/GETSurveyGroups/assertSurveyGroupsPermissions';

describe('Permissions checker for GETSurveyGroups', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
    VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    LA: ['Admin'],
  };

  const BES_ADMIN_POLICY = {
    LA: ['BES Admin'],
  };

  const models = getModels();
  let surveyGroups = [];
  let surveyGroup1;
  let surveyGroup2;

  before(async () => {
    //Set up the survey groups and their surveys
    surveyGroup1 = await findOrCreateDummyRecord(models.surveyGroup, {
      name: 'Test survey group 1',
    });
    surveyGroup2 = await findOrCreateDummyRecord(models.surveyGroup, {
      name: 'Test survey group 2',
    });
    surveyGroups = [surveyGroup1, surveyGroup2];

    const adminPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });
    const donorPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Donor',
    });
    const vanuatuCountry = await findOrCreateDummyRecord(models.country, { code: 'VU' });
    const laosCountry = await findOrCreateDummyRecord(models.country, { code: 'LA' });

    await buildAndInsertSurveys(models, [
      {
        code: 'TEST_SURVEY_1',
        name: 'Test Survey 1',
        permission_group_id: adminPermissionGroup.id,
        country_ids: [vanuatuCountry.id],
        survey_group_id: surveyGroup1.id,
      },
      {
        code: 'TEST_SURVEY_2',
        name: 'Test Survey 2',
        permission_group_id: adminPermissionGroup.id,
        country_ids: [vanuatuCountry.id],
        survey_group_id: surveyGroup1.id,
      },
      {
        code: 'TEST_SURVEY_3',
        name: 'Test Survey 3',
        permission_group_id: donorPermissionGroup.id,
        country_ids: [vanuatuCountry.id],
        survey_group_id: surveyGroup1.id,
      },
      {
        code: 'TEST_SURVEY_4',
        name: 'Test Survey 4',
        permission_group_id: adminPermissionGroup.id,
        country_ids: [laosCountry.id],
        survey_group_id: surveyGroup2.id,
      },
    ]);
  });

  describe('filterSurveyGroupsByPermissions()', async () => {
    it('Sufficient permissions: Should return survey groups that users have access to any of the surveys within the groups', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const results = await filterSurveyGroupsByPermissions(accessPolicy, models, surveyGroups);

      expect(results.map(r => r.id)).to.deep.equal([surveyGroup1.id, surveyGroup2.id]);
    });

    it('Sufficient permissions: Should always return all the survey groups if users have BES Admin access to any countries', async () => {
      const accessPolicy = new AccessPolicy(BES_ADMIN_POLICY);
      const results = await filterSurveyGroupsByPermissions(accessPolicy, models, surveyGroups);

      expect(results.map(r => r.id)).to.deep.equal([surveyGroup1.id, surveyGroup2.id]);
    });

    it('Insufficient permissions: Should filter out any survey groups that users do not have access to any of the surveys within the group', async () => {
      //Remove Admin permission of VU to have insufficient permissions to access surveyGroup1.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /*'Admin'*/],
        LA: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);
      const results = await filterSurveyGroupsByPermissions(accessPolicy, models, surveyGroups);

      expect(results.map(r => r.id)).to.deep.equal([surveyGroup2.id]); //Should have access to only surveyGroup2
    });
  });

  describe('assertSurveyGroupsPermissions()', async () => {
    it('Sufficient permissions: Should return true if users have access to any of the surveys within the survey group', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const result = await assertSurveyGroupsPermissions(accessPolicy, models, [
        surveyGroup1,
        surveyGroup2,
      ]);

      expect(result).to.true;
    });

    it('Sufficient permissions: Should always return true for any survey groups if users have BES Admin access to any countries', async () => {
      const accessPolicy = new AccessPolicy(BES_ADMIN_POLICY);
      const results = await assertSurveyGroupsPermissions(accessPolicy, models, surveyGroups);

      expect(results).to.true;
    });

    it('Insufficient permissions: Should throw an exception if users do not have access to any of the surveys within the survey group', async () => {
      //Remove Admin permission of VU to have insufficient permissions to access surveyGroup1.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /*'Admin'*/],
        LA: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);

      expect(() =>
        assertSurveyGroupsPermissions(accessPolicy, models, [surveyGroup1, surveyGroup2]),
      ).to.throw; //Should have access to only surveyGroup2
    });
  });
});
