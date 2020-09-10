/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { AccessPolicy } from '@tupaia/access-policy';
import {
  buildAndInsertSurveys,
  buildAndInsertSurveyResponses,
  findOrCreateDummyRecord,
  generateTestId,
} from '@tupaia/database';
import { getModels } from '../../getModels';
import {
  filterSurveyResponsesByPermissions,
  assertSurveyResponsePermissions,
} from '../../../routes/GETSurveyResponses/assertSurveyResponsePermissions';

describe.only('Permissions checker for GETSurveyResponses', async () => {
  const DEFAULT_POLICY = {
    VU: ['Admin', 'Donor'],
    LA: ['Admin'],
  };

  const models = getModels();
  let surveyResponses = [];
  const laosAdminResponseId = generateTestId();

  before(async () => {
    const adminPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });
    const donorPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Donor',
    });
    const vanuatuCountry = await findOrCreateDummyRecord(models.country, { code: 'VU' });
    const laosCountry = await findOrCreateDummyRecord(models.country, { code: 'LA' });
    const vanuatuEntity = await findOrCreateDummyRecord(models.entity, {
      id: generateTestId(),
      code: 'VU_TEST',
      country_code: vanuatuCountry.code,
    });
    const laosEntity = await findOrCreateDummyRecord(models.entity, {
      id: generateTestId(),
      code: 'LA_TEST',
      country_code: laosCountry.code,
    });

    await buildAndInsertSurveys(models, [
      {
        id: generateTestId(),
        code: 'TEST_SURVEY_1',
        name: 'Test Survey 1',
        permission_group_id: adminPermissionGroup.id,
      },
      {
        id: generateTestId(),
        code: 'TEST_SURVEY_2',
        name: 'Test Survey 2',
        permission_group_id: donorPermissionGroup.id,
      },
    ]);

    const surveyResponseModels = await buildAndInsertSurveyResponses(models, [
      {
        id: generateTestId(),
        surveyCode: 'TEST_SURVEY_1',
        entityCode: vanuatuEntity.code,
        submission_time: '2020-01-31T09:00:00Z',
        answers: [],
      },
      {
        id: laosAdminResponseId,
        surveyCode: 'TEST_SURVEY_1',
        entityCode: laosEntity.code,
        submission_time: '2020-01-31T09:00:00Z',
        answers: [],
      },
      {
        id: generateTestId(),
        surveyCode: 'TEST_SURVEY_2',
        entityCode: vanuatuEntity.code,
        submission_time: '2020-01-31T09:00:00Z',
        answers: [],
      },
      {
        id: generateTestId(),
        surveyCode: 'TEST_SURVEY_2',
        entityCode: laosEntity.code,
        submission_time: '2020-01-31T09:00:00Z',
        answers: [],
      },
    ]);
    surveyResponses = surveyResponseModels.map(srm => srm.surveyResponse);
  });

  describe('filterSurveyResponsesByPermissions()', async () => {
    it('Should filter any survey responses that users do not have access to to the survey of', async () => {
      //Remove the permission of VU to have insufficient permissions to some surveys
      const policy = {
        // VU: ['Admin', 'Donor'],
        LA: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);
      const result = await filterSurveyResponsesByPermissions(
        accessPolicy,
        surveyResponses,
        models,
      );

      // Should have dropped all but [laos/Admin] survey response
      expect(result.length).to.equal(1);
      expect(result[0].id).to.equal(laosAdminResponseId);
    });
  });

  describe('assertSurveyResponsePermissions()', async () => {
    it('Sufficient permissions: Should return true if users have access to the survey permission group in the entity country', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const result = await assertSurveyResponsePermissions(
        accessPolicy,
        surveyResponses[0],
        models,
      );

      expect(result).to.true;
    });

    it('Insufficient permissions: Should throw an exception if users do not have access to the survey permission group in the entity country', async () => {
      // Remove all default permissions to always have insufficient permissions
      const policy = {
        // VU: ['Admin', 'Donor'],
        // LA: ['Admin', 'Donor'],
        DL: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);

      // Should only have permission for [Laos/Admin]
      expect(() => assertSurveyResponsePermissions(accessPolicy, surveyResponses[0], models)).to
        .throw;
    });
  });
});
