/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { buildAndInsertSurveys, findOrCreateDummyRecord, generateTestId } from '@tupaia/database';
import { Authenticator } from '@tupaia/auth';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import { TestableApp } from '../TestableApp';
import { prepareStubAndAuthenticate } from './utilities/prepareStubAndAuthenticate';

describe.only('Permissions checker for GETSurveys', async () => {
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
  let vanuatuCountryId;
  let tongaCountryId;
  let survey1Id;
  let survey2Id;
  let survey3Id;
  let survey4Id;
  let filterString;

  before(async () => {
    // Set up the surveys
    const adminPermission = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });
    const donorPermission = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Donor',
    });
    const vanuatuCountry = await findOrCreateDummyRecord(models.country, { code: 'VU' });
    const laosCountry = await findOrCreateDummyRecord(models.country, { code: 'LA' });
    const tongaCountry = await findOrCreateDummyRecord(models.country, { code: 'TO' });
    vanuatuCountryId = vanuatuCountry.id;
    tongaCountryId = tongaCountry.id;

    // Easier to generate ahead rather than extracting ids from the generated models
    survey1Id = generateTestId();
    survey2Id = generateTestId();
    survey3Id = generateTestId();
    survey4Id = generateTestId();

    await buildAndInsertSurveys(models, [
      {
        id: survey1Id,
        code: 'TEST_SURVEY_1',
        name: 'Test Survey 1',
        permission_group_id: adminPermission.id,
        country_ids: [vanuatuCountry.id, laosCountry.id],
      },
      {
        id: survey2Id,
        code: 'TEST_SURVEY_2',
        name: 'Test Survey 2',
        permission_group_id: donorPermission.id,
        country_ids: [vanuatuCountry.id, laosCountry.id],
      },
      {
        id: survey3Id,
        code: 'TEST_SURVEY_3',
        name: 'Test Survey 3',
        permission_group_id: adminPermission.id,
        country_ids: [tongaCountry.id],
      },
      {
        id: survey4Id,
        code: 'TEST_SURVEY_4',
        name: 'Test Survey 4',
        permission_group_id: adminPermission.id,
        country_ids: [laosCountry.id],
      },
    ]);

    const surveyIds = [survey1Id, survey2Id, survey3Id, survey4Id];
    filterString = `filter={"id":{"comparator":"in","comparisonValue":["${surveyIds.join(
      '","',
    )}"]}}`;
  });

  afterEach(() => {
    Authenticator.prototype.getAccessPolicyForUser.restore();
  });

  describe('GET /surveys/:id', async () => {
    it('Sufficient permissions: Return a requested survey if we have the permission group for any of the countries within', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: result } = await app.get(`surveys/${survey1Id}`);

      expect(result.id).to.equal(survey1Id);
    });

    it('Sufficient permissions: Return a requested survey if we have BES Admin access anywhere', async () => {
      await prepareStubAndAuthenticate(app, BES_ADMIN_POLICY);
      const { body: result } = await app.get(`surveys/${survey3Id}`);

      expect(result.id).to.equal(survey3Id);
    });

    it('Insufficient permissions: Throw an error if we do not have the appropriate permission group for the requested survey', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: result } = await app.get(`surveys/${survey2Id}`);

      expect(result).to.have.keys('error');
    });

    it('Insufficient permissions: Throw an error if we have the permission group but not for any of the countries of the survey', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: result } = await app.get(`surveys/${survey3Id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /surveys', async () => {
    it('Sufficient permissions: Return all surveys we have permissions for', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: results } = await app.get(`surveys?${filterString}`);

      expect(results.map(r => r.id)).to.have.members([survey1Id, survey4Id]);
    });

    it('Sufficient permissions: Return all surveys if we have BES admin access', async () => {
      await prepareStubAndAuthenticate(app, BES_ADMIN_POLICY);
      const { body: results } = await app.get(`surveys?${filterString}`);

      expect(results.map(r => r.id)).to.have.members([survey1Id, survey2Id, survey3Id, survey4Id]);
    });

    it('Insufficient permissions: Return an empty array if users do not have access to any surveys', async () => {
      const policy = {
        DL: ['Public'],
      };
      await prepareStubAndAuthenticate(app, policy);
      const { body: results } = await app.get(`surveys?${filterString}`);

      expect(results).to.be.empty;
    });
  });

  describe('GET /country/id/surveys', async () => {
    it('Sufficient permissions: Return only surveys we have permission for in the selected country', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: results } = await app.get(
        `country/${vanuatuCountryId}/surveys?${filterString}`,
      );

      expect(results.map(r => r.id)).to.have.members([survey1Id]);
    });

    it('Sufficient permissions: Return all surveys in the selected country if we are BES admin', async () => {
      await prepareStubAndAuthenticate(app, BES_ADMIN_POLICY);
      const { body: results } = await app.get(
        `country/${vanuatuCountryId}/surveys?${filterString}`,
      );

      expect(results.map(r => r.id)).to.have.members([survey1Id, survey2Id]);
    });

    it('Insufficient permissions: Return an empty array if we do not have access to any of the surveys in the selected country', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: results } = await app.get(`country/${tongaCountryId}/surveys?${filterString}`);

      expect(results).to.be.empty;
    });
  });
});
