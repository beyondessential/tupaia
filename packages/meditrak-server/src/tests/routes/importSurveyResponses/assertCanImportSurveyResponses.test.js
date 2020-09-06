/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { AccessPolicy } from '@tupaia/access-policy';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';
import { TestableApp } from '../../TestableApp';
import { upsertEntity } from '../../testUtilities';

import { assertCanImportSurveyResponses } from '../../../routes/importSurveyResponses/assertCanImportSurveyResponses';

const DEFAULT_POLICY = {
  DL: ['Public'],
  KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
  VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Donor'],
  LA: ['Laos School User'],
};

describe('Permissions checker for Importing Survey Responses', async () => {
  before(async () => {
    await upsertEntity({ id: 'KI_1', code: 'KI_1', country_code: 'KI' });
    await upsertEntity({ id: 'KI_2', code: 'KI_2', country_code: 'KI' });
    await upsertEntity({ id: 'KI_3', code: 'KI_3', country_code: 'KI' });

    await upsertEntity({ id: 'VU_1', code: 'VU_1', country_code: 'VU' });
    await upsertEntity({ id: 'VU_2', code: 'VU_2', country_code: 'VU' });
    await upsertEntity({ id: 'VU_3', code: 'VU_3', country_code: 'VU' });

    await upsertEntity({ id: 'LA_1', code: 'LA_1', country_code: 'LA' });
    await upsertEntity({ id: 'LA_2', code: 'LA_2', country_code: 'LA' });
    await upsertEntity({ id: 'LA_3', code: 'LA_3', country_code: 'LA' });
  });

  describe('Sufficient permissions when importing survey responses', () => {
    const app = new TestableApp();
    const models = app.models;
    const accessPolicy = new AccessPolicy(DEFAULT_POLICY);

    it('Should allow importing survey responses when users have permission group access to the countries of all the entities (of the survey responses)', async () => {
      const entitiesByPermissionGroup = {
        Admin: ['KI_1', 'KI_2', 'KI_3'],
        Donor: ['VU_1', 'VU_2', 'VU_3'],
      };

      const result = await assertCanImportSurveyResponses(
        accessPolicy,
        models,
        entitiesByPermissionGroup,
      );
      expect(result).to.true;
    });
  });

  describe('Insufficient permissions when importing survey responses', () => {
    const app = new TestableApp();
    const models = app.models;
    const accessPolicy = new AccessPolicy(DEFAULT_POLICY);

    it('Should not allow importing survey responses when users do not have permission group access to the countries of all the entities (of the survey responses)', async () => {
      const entitiesByPermissionGroup = {
        Admin: ['KI_1', 'KI_2', 'KI_3'],
        'Laos School User': ['LA_1', 'LA_2', 'LA_3'],
      };

      expect(() => assertCanImportSurveyResponses(accessPolicy, models, entitiesByPermissionGroup))
        .to.throw;
    });
  });
});
