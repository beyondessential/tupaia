/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import {
  buildAndInsertSurveys,
  buildAndInsertSurveyResponses,
  findOrCreateDummyRecord,
} from '@tupaia/database';
import { Authenticator } from '@tupaia/auth';
import { resetTestData } from '../testUtilities';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import { TestableApp } from '../TestableApp';
import { prepareStubAndAuthenticate } from './utilities/prepareStubAndAuthenticate';

describe('Permissions checker for GETSurveyResponses', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
    VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    LA: ['Admin'],
  };

  const BES_ADMIN_POLICY = {
    SB: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;
  let laosAdminResponseId;
  let laosDonorResponseId;
  let vanuatuAdminResponseId;
  let vanuatuDonorResponseId;
  let filterString;

  before(async () => {
    await resetTestData();

    const adminPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });
    const donorPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Donor',
    });

    const vanuatuCountry = await findOrCreateDummyRecord(models.country, { code: 'VU' });
    const laosCountry = await findOrCreateDummyRecord(models.country, { code: 'LA' });

    const vanuatuEntity = await findOrCreateDummyRecord(models.entity, {
      country_code: vanuatuCountry.code,
    });
    const laosEntity = await findOrCreateDummyRecord(models.entity, {
      country_code: laosCountry.code,
    });

    await buildAndInsertSurveys(models, [
      {
        code: 'TEST_SURVEY_1',
        name: 'Test Survey 1',
        permission_group_id: adminPermissionGroup.id,
      },
      {
        code: 'TEST_SURVEY_2',
        name: 'Test Survey 2',
        permission_group_id: donorPermissionGroup.id,
      },
    ]);

    const [
      vanuatuAdminBuild,
      laosAdminBuild,
      vanuatuDonorBuild,
      laosDonorBuild,
    ] = await buildAndInsertSurveyResponses(models, [
      {
        id: vanuatuAdminResponseId,
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
        id: vanuatuDonorResponseId,
        surveyCode: 'TEST_SURVEY_2',
        entityCode: vanuatuEntity.code,
        submission_time: '2020-01-31T09:00:00Z',
        answers: [],
      },
      {
        id: laosDonorResponseId,
        surveyCode: 'TEST_SURVEY_2',
        entityCode: laosEntity.code,
        submission_time: '2020-01-31T09:00:00Z',
        answers: [],
      },
    ]);

    laosAdminResponseId = laosAdminBuild.surveyResponse.id;
    laosDonorResponseId = laosDonorBuild.surveyResponse.id;
    vanuatuAdminResponseId = vanuatuAdminBuild.surveyResponse.id;
    vanuatuDonorResponseId = vanuatuDonorBuild.surveyResponse.id;

    const surveyResponseIds = [
      laosAdminResponseId,
      laosDonorResponseId,
      vanuatuAdminResponseId,
      vanuatuDonorResponseId,
    ];
    filterString = `filter={"id":{"comparator":"in","comparisonValue":["${surveyResponseIds.join(
      '","',
    )}"]}}`;
  });

  afterEach(() => {
    Authenticator.prototype.getAccessPolicyForUser.restore();
  });

  describe('GET /surveyResponses/:id', async () => {
    it("Sufficient permissions: Return a requested survey response if we have permission for the survey in the response's country", async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: result } = await app.get(`surveyResponses/${vanuatuAdminResponseId}`);

      expect(result.id).to.equal(vanuatuAdminResponseId);
    });

    it('Sufficient permissions: Return a requested survey response if we have BES admin access anywhere', async () => {
      await prepareStubAndAuthenticate(app, BES_ADMIN_POLICY);
      const { body: result } = await app.get(`surveyResponses/${laosAdminResponseId}`);

      expect(result.id).to.equal(laosAdminResponseId);
    });

    it("Insufficient permissions: Throw an error if we do not have permission for the survey in the response's country", async () => {
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Admin' */],
        LA: ['Admin'],
      };
      await prepareStubAndAuthenticate(app, policy);
      const { body: result } = await app.get(`surveyResponses/${vanuatuAdminResponseId}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /surveyResponses', async () => {
    it('Sufficient permissions: Return only survey responses we have permissions to the survey in the response country', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: results } = await app.get(`surveyResponses?${filterString}`);

      expect(results.map(r => r.id)).to.have.members([laosAdminResponseId, vanuatuAdminResponseId]);
    });

    it('Sufficient permissions: Always return all survey responses if we have BES admin access', async () => {
      await prepareStubAndAuthenticate(app, BES_ADMIN_POLICY);
      const { body: results } = await app.get(`surveyResponses?${filterString}`);

      expect(results.map(r => r.id)).to.have.members([
        laosAdminResponseId,
        laosDonorResponseId,
        vanuatuAdminResponseId,
        vanuatuDonorResponseId,
      ]);
    });

    it('Insufficient permissions: Return an empty array if we do not have access to any of the requested survey responses', async () => {
      const policy = {
        DL: ['Public'],
      };
      await prepareStubAndAuthenticate(app, policy);
      const { body: results } = await app.get(`surveyResponses?${filterString}`);

      expect(results).to.be.empty;
    });
  });
});
