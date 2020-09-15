/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { AccessPolicy } from '@tupaia/access-policy';
import {
  buildAndInsertSurveys,
  findOrCreateDummyRecord,
  findOrCreateDummyCountryEntity,
} from '@tupaia/database';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';
import { getModels } from '../../getModels';
import { assertCanImportSurveys } from '../../../routes/importSurveys/assertCanImportSurveys';

const DEFAULT_POLICY = {
  DL: ['Public'],
  KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
  VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  LA: ['Admin'],
};

describe('assertCanImportSurveys(): Permissions checker for Importing Surveys', async () => {
  let vanuatuCountry;
  let kiribatiCountry;
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

    await buildAndInsertSurveys(models, [
      {
        code: 'TEST_SURVEY',
        name: 'Test Survey',
        permission_group_id: adminPermissionGroup.id,
        country_ids: [vanuatuCountry.id],
      },
    ]);
  });

  describe('Sufficient permissions when importing existing surveys', async () => {
    const accessPolicy = new AccessPolicy(DEFAULT_POLICY);

    it('Should allow importing an existing survey if users have Tupaia Admin Panel and survey permission group access to the country of that survey', async () => {
      const surveyNames = ['Test Survey']; //Existing survey, already inserted
      const result = await assertCanImportSurveys(accessPolicy, models, surveyNames);

      expect(result).to.true;
    });

    it('Should allow import an existing survey and update countryIds if users have Tupaia Admin Panel and survey permission group access to the country of that survey', async () => {
      const surveyNames = ['Test Survey']; //Existing survey, already inserted
      const newCountryIds = [kiribatiCountry.id];
      const result = await assertCanImportSurveys(accessPolicy, models, surveyNames, newCountryIds);

      expect(result).to.true;
    });
  });

  describe('Sufficient permissions when importing new surveys', async () => {
    const accessPolicy = new AccessPolicy(DEFAULT_POLICY);

    it('Should allow importing a new survey with countries specified if users have Tupaia Admin Panel to the countries', async () => {
      const surveyNames = ['Test Survey 2']; //New survey
      const newCountryIds = [vanuatuCountry.id];
      const result = await assertCanImportSurveys(accessPolicy, models, surveyNames, newCountryIds);

      expect(result).to.true;
    });

    it('Should allow importing a new survey with no countries are specified when users have Tupaia Admin Panel access to all countries', async () => {
      const policyWithAllCountries = {};
      const allCountries = await models.country.all();
      allCountries.forEach(c => {
        policyWithAllCountries[c.code] = [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP];
      });
      const allCountriesAccessPolicy = new AccessPolicy(policyWithAllCountries);
      const surveyNames = ['Test Survey 3']; //New survey
      const result = await assertCanImportSurveys(allCountriesAccessPolicy, models, surveyNames);

      expect(result).to.true;
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
      const surveyNames = ['Test Survey']; //Existing survey, already inserted

      expect(() => assertCanImportSurveys(accessPolicy, models, surveyNames)).to.throw;
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
      const surveyNames = ['Test Survey']; //Existing survey, already

      expect(() => assertCanImportSurveys(accessPolicy, models, surveyNames)).to.throw;
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
      const surveyNames = ['Test Survey']; //Existing survey, already inserted
      const newCountryIds = [kiribatiCountry.id];

      expect(() => assertCanImportSurveys(accessPolicy, models, surveyNames, newCountryIds)).to
        .throw;
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
      const surveyNames = ['Test Survey 2']; //New survey
      const vanuatuCountry = await models.country.findOne({ code: 'VU' });
      const newCountryIds = [vanuatuCountry.id];

      expect(() => assertCanImportSurveys(accessPolicy, models, surveyNames, newCountryIds)).to
        .throw;
    });

    it('Should not allow importing a new survey with no countries are specified when users have Tupaia Admin Panel access to all countries', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const surveyNames = ['Test Survey 3']; //New survey

      expect(() => assertCanImportSurveys(accessPolicy, models, surveyNames)).to.throw;
    });
  });
});
