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
    orgUnitName: 'Tongatapu',
    dataValues: [{ dataElement: 'A', value: '1' }],
  },
  {
    organisationUnitCode: 'TO_Niuas',
    orgUnitName: 'Niuas',
    dataValues: [{ dataElement: 'A', value: '2' }],
  },
  {
    organisationUnitCode: 'TO_Niuas',
    orgUnitName: 'Niuas',
    dataValues: [{ dataElement: 'A', value: '3' }],
  },
];
const PARENT_ORG_UNIT = {
  code: 'TO',
  name: 'Tonga',
};

describe('mapMeasureDataToCountries()', () => {
  before(async () => {
    const models = getTestModels();
    upsertDummyRecord(models.entity, { code: 'TO_Niuas', country_code: 'TO', name: 'Niuas' }); // last object optional
  });

  it('replace facility orgUnit codes with their corresponding country codes', async () => {
    const countryAnalytics = await mapMeasureDataToCountries(ANALYTICS);
    countryAnalytics.forEach(analytic => {
      expect(analytic.organisationUnitCode).to.equal(PARENT_ORG_UNIT.code);
    });
  });
});
