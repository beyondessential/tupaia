/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { AccessPolicy } from '@tupaia/access-policy';
import { findOrCreateDummyRecord } from '@tupaia/database';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';
import { getModels } from '../../getModels';
import { assertCanImportSurveyResponses } from '../../../routes/importSurveyResponses/assertCanImportSurveyResponses';

const DEFAULT_POLICY = {
  DL: ['Public'],
  KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
  VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Donor'],
  LA: ['Admin'],
};

describe('assertCanImportSurveyResponses(): Permissions checker for Importing Survey Responses', async () => {
  const models = getModels();
  const accessPolicy = new AccessPolicy(DEFAULT_POLICY);

  before(async () => {
    await findOrCreateDummyRecord(models.entity, { code: 'KI_1_test', country_code: 'KI' });
    await findOrCreateDummyRecord(models.entity, { code: 'KI_2_test', country_code: 'KI' });
    await findOrCreateDummyRecord(models.entity, { code: 'KI_3_test', country_code: 'KI' });

    await findOrCreateDummyRecord(models.entity, { code: 'VU_1_test', country_code: 'VU' });
    await findOrCreateDummyRecord(models.entity, { code: 'VU_2_test', country_code: 'VU' });
    await findOrCreateDummyRecord(models.entity, { code: 'VU_3_test', country_code: 'VU' });

    await findOrCreateDummyRecord(models.entity, { code: 'SB_1_test', country_code: 'SB' });
    await findOrCreateDummyRecord(models.entity, { code: 'SB_2_test', country_code: 'SB' });
    await findOrCreateDummyRecord(models.entity, { code: 'SB_3_test', country_code: 'SB' });

    await findOrCreateDummyRecord(models.entity, { code: 'LA_1_test', country_code: 'LA' });
    await findOrCreateDummyRecord(models.entity, { code: 'LA_2_test', country_code: 'LA' });
    await findOrCreateDummyRecord(models.entity, { code: 'LA_3_test', country_code: 'LA' });
  });

  it('Sufficient permissions: Should allow importing survey responses when users have permission group access to the countries of all the entities (of the survey responses). All survey responses only has 1 permission group', async () => {
    //Has Admin access to KI.
    const entitiesByPermissionGroup = {
      Admin: ['KI_1_test', 'KI_2_test', 'KI_3_test'],
    };
    const result = await assertCanImportSurveyResponses(
      accessPolicy,
      models,
      entitiesByPermissionGroup,
    );

    expect(result).to.true;
  });

  it('Sufficient permissions: Should allow importing survey responses when users have permission group access to the countries of all the entities (of the survey responses). Survey responses have different permission groups', async () => {
    //Has Admin access to KI and LA. Has Donor Access to VU
    const entitiesByPermissionGroup = {
      Admin: ['KI_1_test', 'LA_1_test', 'KI_3_test'],
      Donor: ['VU_1_test', 'VU_2_test', 'VU_3_test'],
    };
    const result = await assertCanImportSurveyResponses(
      accessPolicy,
      models,
      entitiesByPermissionGroup,
    );

    expect(result).to.true;
  });

  it('Insufficient permissions: Should not allow importing survey responses when users do not have permission group access to the countries of all the entities (of the survey responses)', async () => {
    //No Admin access to any SB entities
    const entitiesByPermissionGroup = {
      Admin: ['VU_1_test', 'VU_2_test', 'VU_3_test', 'LA_1_test', 'LA_2_test', 'LA_3_test'],
    };

    expect(() => assertCanImportSurveyResponses(accessPolicy, models, entitiesByPermissionGroup)).to
      .throw;
  });

  it('Insufficient permissions: Should not allow importing survey responses when users do not have permission group access to the countries of all the entities (of the survey responses). Survey responses from a sheet belong to different countries', async () => {
    //No Admin/Donor access to any SB entities
    const entitiesByPermissionGroup = {
      Admin: ['KI_1_test', 'SB_2_test', 'KI_3_test'],
      Donor: ['SB_1_test', 'KI_2_test', 'SB_3_test'],
    };

    expect(() => assertCanImportSurveyResponses(accessPolicy, models, entitiesByPermissionGroup)).to
      .throw;
  });
});
