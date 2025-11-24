import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { AccessPolicy } from '@tupaia/access-policy';
import {
  buildAndInsertSurvey,
  findOrCreateDummyRecord,
  findOrCreateDummyCountryEntity,
} from '@tupaia/database';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';
import { getModels } from '../../testUtilities';
import { assertCanImportSurvey } from '../../../apiV2/surveys/assertCanImportSurvey';

const DEFAULT_POLICY = {
  DL: ['Public'],
  KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
  VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  LA: ['Admin'],
};

describe('assertCanImportSurvey(): Permissions checker for Importing Surveys', async () => {
  let vanuatuCountry;
  let kiribatiCountry;
  let testSurvey1;
  const models = getModels();

  before(async () => {
    const adminPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });

    ({ country: vanuatuCountry } = await findOrCreateDummyCountryEntity(models, {
      code: 'VU',
      name: 'Vanuatu',
    }));

    ({ country: kiribatiCountry } = await findOrCreateDummyCountryEntity(models, {
      code: 'KI',
      name: 'Kiribati',
    }));

    ({ survey: testSurvey1 } = await buildAndInsertSurvey(models, {
      code: 'TEST_SURVEY_1',
      name: 'TEST SURVEY 1',
      permission_group_id: adminPermissionGroup.id,
      country_ids: [vanuatuCountry.id],
    }));
  });

  describe('Sufficient permissions when importing existing surveys', async () => {
    const accessPolicy = new AccessPolicy(DEFAULT_POLICY);

    it('Should allow importing an existing survey if users have Tupaia Admin Panel and survey permission group access to the country of that survey', async () => {
      const result = await assertCanImportSurvey(accessPolicy, models, testSurvey1.id); // Existing survey, already inserted
      expect(result).to.be.true;
    });

    it('Should allow import an existing survey and update countryIds if users have Tupaia Admin Panel and survey permission group access to the country of that survey', async () => {
      const newCountryIds = [kiribatiCountry.id];
      const result = await assertCanImportSurvey(
        accessPolicy,
        models,
        testSurvey1.id, // Existing survey, already inserted
        newCountryIds,
      );

      expect(result).to.be.true;
    });
  });

  describe('Sufficient permissions when importing new surveys', async () => {
    const accessPolicy = new AccessPolicy(DEFAULT_POLICY);

    it('Should allow importing a new survey with countries specified if users have Tupaia Admin Panel to the countries', async () => {
      const newCountryIds = [vanuatuCountry.id];
      const result = await assertCanImportSurvey(
        accessPolicy,
        models,
        null, // New survey
        newCountryIds,
      );

      expect(result).to.be.true;
    });

    it('Should allow importing a new survey with no countries are specified when users have Tupaia Admin Panel access to all countries', async () => {
      const policyWithAllCountries = {};
      const allCountries = await models.country.all();
      allCountries.forEach(c => {
        policyWithAllCountries[c.code] = [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP];
      });
      const allCountriesAccessPolicy = new AccessPolicy(policyWithAllCountries);
      const result = await assertCanImportSurvey(
        allCountriesAccessPolicy,
        models,
        null, // New survey
      );

      expect(result).to.be.true;
    });
  });

  describe('Insufficient permissions when importing existing surveys', async () => {
    it('Should not allow importing an existing survey if users do not have Tupaia Admin Panel access to the country of that survey', async () => {
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: ['Admin'], // No TUPAIA_ADMIN_PANEL_PERMISSION_GROUP access
        LA: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);
      expect(() =>
        assertCanImportSurvey(
          accessPolicy,
          models,
          testSurvey1.id, // Existing survey
        ),
      ).to.throw;
    });

    it('Should not allow importing an existing survey if users do not have the permission group access to the country of that survey', async () => {
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP], // No Admin access
        LA: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);
      expect(() =>
        assertCanImportSurvey(
          accessPolicy,
          models,
          testSurvey1.id, // Existing survey
        ),
      ).to.throw;
    });

    it('Should not allow importing an existing survey with new countryIds if users do not have Tupaia Admin Panel access to those countries', async () => {
      const policy = {
        DL: ['Public'],
        KI: ['Admin'], // No TUPAIA_ADMIN_PANEL_PERMISSION_GROUP access
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
        LA: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);
      const newCountryIds = [kiribatiCountry.id];

      expect(() =>
        assertCanImportSurvey(
          accessPolicy,
          models,
          testSurvey1.id, // Existing survey
          newCountryIds,
        ),
      ).to.throw;
    });
  });

  describe('Insufficient permissions when importing new surveys', async () => {
    it('Should not allow importing a new survey with countries specified if users do not have Tupaia Admin Panel to the countries', async () => {
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: ['Admin'], // No TUPAIA_ADMIN_PANEL_PERMISSION_GROUP access
        LA: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);
      const newCountryIds = [vanuatuCountry.id];

      expect(() =>
        assertCanImportSurvey(
          accessPolicy,
          models,
          null, // New survey
          newCountryIds,
        ),
      ).to.throw;
    });

    it('Should not allow importing a new survey with no countries are specified when users have Tupaia Admin Panel access to all countries', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      expect(() =>
        assertCanImportSurvey(
          accessPolicy,
          models,
          null, // New survey
        ),
      ).to.throw;
    });
  });
});
