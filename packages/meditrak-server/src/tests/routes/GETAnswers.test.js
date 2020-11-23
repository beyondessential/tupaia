/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import {
  buildAndInsertSurveys,
  buildAndInsertSurveyResponses,
  findOrCreateDummyRecord,
  generateTestId,
} from '@tupaia/database';
import { Authenticator } from '@tupaia/auth';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import { TestableApp } from '../TestableApp';
import { prepareStubAndAuthenticate } from './utilities/prepareStubAndAuthenticate';

describe('Permissions checker for GETAnswers', async () => {
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
  let vanuatuAdminResponseId;
  let vanuatuDonorResponseId;
  let vanuatuAdminAnswers;
  let vanuatuDonorAnswers;
  let filterString;

  before(async () => {
    const adminPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });
    const donorPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Donor',
    });

    const vanuatuCountry = await findOrCreateDummyRecord(models.country, { code: 'VU' });

    const vanuatuEntity = await findOrCreateDummyRecord(models.entity, {
      country_code: vanuatuCountry.code,
    });

    await buildAndInsertSurveys(models, [
      {
        code: 'TEST_SURVEY_1',
        name: 'Test Survey 1',
        permission_group_id: adminPermissionGroup.id,
        questions: [{ code: 'TEST_SURVEY_11', text: 'Best spice' }],
      },
      {
        code: 'TEST_SURVEY_2',
        name: 'Test Survey 2',
        permission_group_id: donorPermissionGroup.id,
        questions: [{ code: 'TEST_SURVEY_21', text: 'Worst spice' }],
      },
    ]);

    // It's much easier to keep track of the different ids this way
    // rather than trying to extract the correct ids from the models array
    vanuatuAdminResponseId = generateTestId();
    vanuatuDonorResponseId = generateTestId();

    const surveyResponseModels = await buildAndInsertSurveyResponses(models, [
      {
        id: vanuatuAdminResponseId,
        surveyCode: 'TEST_SURVEY_1',
        entityCode: vanuatuEntity.code,
        submission_time: '2020-01-31T09:00:00Z',
        answers: { TEST_SURVEY_11: 'Scary' },
      },
      {
        id: vanuatuDonorResponseId,
        surveyCode: 'TEST_SURVEY_2',
        entityCode: vanuatuEntity.code,
        submission_time: '2020-01-31T09:00:00Z',
        answers: { TEST_SURVEY_21: 'Sporty' },
      },
    ]);

    for (const { surveyResponse, answers } of surveyResponseModels) {
      if (surveyResponse.id === vanuatuAdminResponseId) {
        vanuatuAdminAnswers = answers.map(a => a.id);
      } else {
        vanuatuDonorAnswers = answers.map(a => a.id);
      }
    }

    const answerIds = vanuatuAdminAnswers.concat(vanuatuDonorAnswers);
    filterString = `filter={"id":{"comparator":"in","comparisonValue":["${answerIds.join(
      '","',
    )}"]}}`;
  });

  afterEach(() => {
    Authenticator.prototype.getAccessPolicyForUser.restore();
  });

  describe('GET /answer/:id', async () => {
    it("Sufficient permissions: Return a requested answer if we have permission for the survey in the response's country", async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: result } = await app.get(`answer/${vanuatuAdminAnswers[0]}`);

      expect(result.id).to.equal(vanuatuAdminAnswers[0]);
    });

    it('Sufficient permissions: Return a requested answer if we have BES admin access anywhere', async () => {
      await prepareStubAndAuthenticate(app, BES_ADMIN_POLICY);
      const { body: result } = await app.get(`answer/${vanuatuDonorAnswers[0]}`);

      expect(result.id).to.equal(vanuatuDonorAnswers[0]);
    });

    it("Insufficient permissions: Throw an error if we do not have permission for the survey in the response's country for this answer", async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: result } = await app.get(`answer/${vanuatuDonorAnswers[0]}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /answer', async () => {
    it('Sufficient permissions: Return only answers we have permission to the survey responses for', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: results } = await app.get(`answer?${filterString}`);

      expect(results.map(r => r.id)).to.have.members(vanuatuAdminAnswers);
    });

    it('Sufficient permissions: Always return all answers if we have BES admin access', async () => {
      await prepareStubAndAuthenticate(app, BES_ADMIN_POLICY);
      const { body: results } = await app.get(`answer?${filterString}`);

      expect(results.map(r => r.id)).to.have.members(
        vanuatuAdminAnswers.concat(vanuatuDonorAnswers),
      );
    });

    it('Insufficient permissions: Return an empty array if we do not have access to any of the requested answers', async () => {
      const policy = {
        DL: ['Public'],
      };
      await prepareStubAndAuthenticate(app, policy);
      const { body: results } = await app.get(`answer?${filterString}`);

      expect(results).to.be.empty;
    });
  });

  describe('GET /surveyResponses/id/answers', async () => {
    it("Sufficient permissions: Return the answers for the requested survey response if we have permission to the survey in the response's country", async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: results } = await app.get(`surveyResponses/${vanuatuAdminResponseId}/answers`);

      expect(results.map(r => r.id)).to.have.members(vanuatuAdminAnswers);
    });

    it('Sufficient permissions: Return the answers for the requested survey response if we are BES Admin', async () => {
      await prepareStubAndAuthenticate(app, BES_ADMIN_POLICY);
      const { body: results } = await app.get(`surveyResponses/${vanuatuDonorResponseId}/answers`);

      expect(results.map(r => r.id)).to.have.members(vanuatuDonorAnswers);
    });

    it('Insufficient permissions: Throw an error if we do not have permissions for the survey response we are requesting the answers for', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: results } = await app.get(`surveyResponses/${vanuatuDonorResponseId}/answers`);

      expect(results).to.have.key('error');
    });
  });
});
