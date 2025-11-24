import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { AccessPolicy } from '@tupaia/access-policy';
import {
  findOrCreateDummyRecord,
  addBaselineTestCountries,
  buildAndInsertSurveys,
  findOrCreateDummyCountryEntity,
} from '@tupaia/database';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../../permissions';
import { getModels } from '../../../testUtilities';
import { assertCanImportSurveyResponses } from '../../../../apiV2/import/importSurveyResponses/assertCanImportSurveyResponses';

const DEFAULT_POLICY = {
  DL: ['Public'],
  KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
  VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Donor'],
  LA: ['Admin'],
};

const SURVEY_NAME_1 = 'Test Survey Response Permission Survey 1';
const SURVEY_NAME_2 = 'Test Survey Response Permission Survey 2';

const SURVEY_CODE_1 = 'TEST_PERMISSION_SURVEY_1';
const SURVEY_CODE_2 = 'TEST_PERMISSION_SURVEY_2';

describe('assertCanImportSurveyResponses(): Permissions checker for Importing Survey Responses', async () => {
  const models = getModels();
  const defaultAccessPolicy = new AccessPolicy(DEFAULT_POLICY);
  let vanuatuCountry;
  let kiribatiCountry;

  before(async () => {
    await addBaselineTestCountries(models);

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

    const adminPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });

    const donorPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Donor',
    });

    ({ country: kiribatiCountry } = await findOrCreateDummyCountryEntity(models, {
      code: 'KI',
      name: 'Kiribati',
    }));

    ({ country: vanuatuCountry } = await findOrCreateDummyCountryEntity(models, {
      code: 'VU',
      name: 'Vanuatu',
    }));

    await buildAndInsertSurveys(models, [
      {
        code: SURVEY_CODE_1,
        name: SURVEY_NAME_1,
        permission_group_id: adminPermissionGroup.id,
        country_ids: [kiribatiCountry.id],
      },
    ]);

    await buildAndInsertSurveys(models, [
      {
        code: SURVEY_CODE_2,
        name: SURVEY_NAME_2,
        permission_group_id: donorPermissionGroup.id,
        country_ids: [vanuatuCountry.id],
      },
    ]);
  });

  it('Sufficient permissions: Should allow importing survey responses when users have permission group access to the countries of the survey (single survey)', async () => {
    // Has Admin access to KI.
    const entitiesBySurveyCode = {
      [SURVEY_CODE_1]: ['KI_1_test', 'KI_2_test', 'KI_3_test'],
    };
    const result = await assertCanImportSurveyResponses(
      defaultAccessPolicy,
      models,
      entitiesBySurveyCode,
    );

    expect(result).to.true;
  });

  it('Sufficient permissions: Should allow importing survey responses when users have permission group access to the countries of the survey (multiple surveys)', async () => {
    // Has Admin access to KI. Has Donor Access to VU
    const entitiesBySurveyCode = {
      [SURVEY_CODE_1]: ['KI_1_test', 'KI_2_test', 'KI_3_test'],
      [SURVEY_CODE_2]: ['VU_1_test', 'VU_2_test', 'VU_3_test'],
    };
    const result = await assertCanImportSurveyResponses(
      defaultAccessPolicy,
      models,
      entitiesBySurveyCode,
    );

    expect(result).to.true;
  });

  it('Insufficient permissions: Should not allow importing survey responses against entities that do not belong to any survey countries', async () => {
    // No Admin access to any VU entities
    const entitiesBySurveyCode = {
      [SURVEY_CODE_2]: ['LA_1_test', 'VU_2_test', 'VU_3_test'],
    };

    expect(() => assertCanImportSurveyResponses(defaultAccessPolicy, models, entitiesBySurveyCode))
      .to.throw;
  });

  it('Insufficient permissions: Should not allow importing survey responses when users do not have permission group access to the countries of the survey (single survey)', async () => {
    const ACCESS_POLICY = {
      DL: ['Public'],
      KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
      SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
      VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Donor' */],
      LA: ['Admin'],
    };
    const accessPolicy = new AccessPolicy(ACCESS_POLICY);

    // No Admin access to any VU entities
    const entitiesBySurveyCode = {
      [SURVEY_CODE_2]: ['VU_1_test', 'VU_2_test', 'VU_3_test'],
    };

    expect(() => assertCanImportSurveyResponses(accessPolicy, models, entitiesBySurveyCode)).to
      .throw;
  });

  it('Insufficient permissions: Should not allow importing survey responses when users do not have permission group access to the countries of the survey (multiple surveys)', async () => {
    const ACCESS_POLICY = {
      DL: ['Public'],
      KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Admin' */],
      SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
      VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Donor' */],
      LA: ['Admin'],
    };
    const accessPolicy = new AccessPolicy(ACCESS_POLICY);

    // No Admin/Donor access to any SB entities
    const entitiesBySurveyCode = {
      [SURVEY_CODE_1]: ['KI_1_test', 'KI_2_test', 'KI_3_test'],
      [SURVEY_CODE_2]: ['VU_1_test', 'VU_2_test', 'VU_3_test'],
    };

    expect(() => assertCanImportSurveyResponses(accessPolicy, models, entitiesBySurveyCode)).to
      .throw;
  });
});
