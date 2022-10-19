/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { getTestModels, upsertDummyRecord } from '@tupaia/database';
import { mapMeasureDataToCountries } from '/apiV1/measureBuilders/helpers';

const ANALYTICS = [
  {
    organisationUnitCode: 'TEST_FACILITY',
    dataValues: [{ dataElement: 'A', value: '1' }],
  },
  {
    organisationUnitCode: 'TEST_FACILITY',
    dataValues: [{ dataElement: 'A', value: '2' }],
  },
  {
    organisationUnitCode: 'TEST_FACILITY',
    dataValues: [{ dataElement: 'A', value: '3' }],
  },
];
const ENTITY_COUNTRY_CODE = 'DL';
let models;

describe('mapMeasureDataToCountries()', () => {
  beforeAll(async () => {
    models = getTestModels();
    await upsertDummyRecord(models.entity, {
      code: 'TEST_FACILITY',
      country_code: ENTITY_COUNTRY_CODE,
    });
  });

  it('replace facility orgUnit codes with their corresponding country codes', async () => {
    const countryAnalytics = await mapMeasureDataToCountries(models, ANALYTICS);
    countryAnalytics.forEach(analytic => {
      expect(analytic.organisationUnitCode).toBe(ENTITY_COUNTRY_CODE);
    });
  });
});
