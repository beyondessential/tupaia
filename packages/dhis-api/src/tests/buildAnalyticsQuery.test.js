/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { DhisApi } from '../DhisApi';
import { buildEventAnalyticsQuery } from '../buildAnalyticsQuery';
import { assertDhisDimensionHasMembers } from './helpers';

const CODE_TO_ID_BY_RESOURCE_TYPE = {
  dataElements: {
    POP01: 'pop01_dhisId',
    POP02: 'pop02_dhisId',
  },
  organisationUnits: {
    TO: 'to_dhisId',
    PG: 'pg_dhisId',
  },
};

const dhisApi = sinon.createStubInstance(DhisApi, {
  codesToIds: sinon.stub().callsFake(async (resourceType, codes) => {
    const codeToId = CODE_TO_ID_BY_RESOURCE_TYPE[resourceType];

    return Object.keys(codeToId)
      .filter(code => codes.includes(code))
      .map(code => codeToId[code]);
  }),
});

const assertArrayHasDimensionWithMembers = (array, dimensionKey, members) => {
  const errorMessage = `Array does not include a '${dimensionKey}' dimension with the target members`;

  const dimensions = array.filter(item => item.startsWith(`${dimensionKey}:`));
  expect(dimensions.length).to.be.greaterThan(0, errorMessage);

  const results = dimensions.some(dimension => {
    try {
      assertDhisDimensionHasMembers(dimension, members);
    } catch (error) {
      return false;
    }

    return true;
  });
  expect(results, errorMessage).to.be.true;
};

describe('buildAnalyticsQuery', () => {
  describe('buildEventAnalyticsQuery()', () => {
    it('should throw an error if an organisation unit is not specified', () => {
      expect(buildEventAnalyticsQuery(dhisApi, {})).to.eventually.be.rejectedWith(
        'organisation unit',
      );
    });

    it('should allow empty data element codes', async () => {
      const expectMethodToNotThrowError = async dataElementCodes =>
        expect(
          buildEventAnalyticsQuery(dhisApi, {
            dataElementCodes,
            organisationUnitCodes: ['TO'],
          }),
        ).to.eventually.not.be.rejected;

      return Promise.all([undefined, []].map(expectMethodToNotThrowError));
    });

    it('single data element code', async () => {
      const results = await buildEventAnalyticsQuery(dhisApi, {
        dataElementCodes: ['POP01'],
        organisationUnitCodes: ['TO'],
      });

      expect(results).to.have.property('dimension');
      expect(results.dimension).to.include.members(['pop01_dhisId']);
    });

    it('multiple data element codes', async () => {
      const results = await buildEventAnalyticsQuery(dhisApi, {
        dataElementCodes: ['POP01', 'POP02'],
        organisationUnitCodes: ['TO'],
      });

      expect(results).to.have.property('dimension');
      expect(results.dimension).to.include.members(['pop01_dhisId', 'pop02_dhisId']);
    });

    it('single organisation unit', async () => {
      const results = await buildEventAnalyticsQuery(dhisApi, {
        organisationUnitCodes: ['TO'],
      });

      expect(results).to.have.property('dimension');
      expect(results.dimension).to.include.members(['ou:to_dhisId']);
    });

    it('multiple organisation units', async () => {
      const results = await buildEventAnalyticsQuery(dhisApi, {
        organisationUnitCodes: ['TO', 'PG'],
      });

      expect(results).to.have.property('dimension');
      assertArrayHasDimensionWithMembers(results.dimension, 'ou', ['pg_dhisId', 'to_dhisId']);
    });

    it('combination of various dimensions', async () => {
      const results = await buildEventAnalyticsQuery(dhisApi, {
        dataElementCodes: ['POP01', 'POP02'],
        organisationUnitCodes: ['TO', 'PG'],
      });

      expect(results).to.have.property('dimension');
      expect(results.dimension).to.have.lengthOf(3);
      expect(results.dimension).to.include.members(['pop01_dhisId', 'pop02_dhisId']);
      assertArrayHasDimensionWithMembers(results.dimension, 'ou', ['pg_dhisId', 'to_dhisId']);
    });

    it('should use code as `dataIdScheme` by default', async () => {
      const results = await buildEventAnalyticsQuery(dhisApi, {
        organisationUnitCodes: ['TO'],
      });

      expect(results).to.have.property('dataIdScheme', 'code');
    });
  });
});
