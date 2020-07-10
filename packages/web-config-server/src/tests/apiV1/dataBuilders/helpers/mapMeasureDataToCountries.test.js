/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { expect } from 'chai';
import { getTestModels } from '../../../getTestModels';
import { upsertDummyRecord } from '@tupaia/database';

import { mapMeasureDataToCountries } from '/apiV1/measureBuilders/helpers';

const ANALYTICS = [
  {
    organisationUnitCode: 'TO_Niuas',
    dataValues: [{ dataElement: 'A', value: '1' }],
  },
  {
    organisationUnitCode: 'TO_Niuas',
    dataValues: [{ dataElement: 'A', value: '2' }],
  },
  {
    organisationUnitCode: 'TO_Niuas',
    dataValues: [{ dataElement: 'A', value: '3' }],
  },
];
const ENTITY_COUNTRY_CODE = 'TO';

describe('mapMeasureDataToCountries()', () => {
  before(async () => {
    const models = getTestModels();
    await upsertDummyRecord(models.entity, {
      code: 'TO_Niuas',
      country_code: 'TO',
    });
  });

  it('replace facility orgUnit codes with their corresponding country codes', async () => {
    const countryAnalytics = await mapMeasureDataToCountries(ANALYTICS);
    countryAnalytics.forEach(analytic => {
      expect(analytic.organisationUnitCode).to.equal(ENTITY_COUNTRY_CODE);
    });
  });
});
