/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { buildEventAnalyticsQuery } from '../buildAnalyticsQuery';
import { assertDhisDimensionHasMembers } from './helpers';

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
    it('should throw an error if an organisation unit is not specified', () =>
      expect(() => buildEventAnalyticsQuery({})).to.throw('organisation unit'));

    it('should allow empty data elements', () => {
      const expectMethodToNotThrowError = dataElementIds =>
        expect(() =>
          buildEventAnalyticsQuery({ dataElementIds, organisationUnitIds: ['to_dhisId'] }),
        ).to.not.throw();

      return [undefined, []].map(expectMethodToNotThrowError);
    });

    it('single data element', () => {
      const results = buildEventAnalyticsQuery({
        dataElementIds: ['pop01_dhisId'],
        organisationUnitIds: ['to_dhisId'],
      });

      expect(results).to.have.property('dimension');
      expect(results.dimension).to.include.members(['pop01_dhisId']);
    });

    it('multiple data elements', () => {
      const results = buildEventAnalyticsQuery({
        dataElementIds: ['pop01_dhisId', 'pop02_dhisId'],
        organisationUnitIds: ['to_dhisId'],
      });

      expect(results).to.have.property('dimension');
      expect(results.dimension).to.include.members(['pop01_dhisId', 'pop02_dhisId']);
    });

    it('single organisation unit', () => {
      const results = buildEventAnalyticsQuery({
        organisationUnitIds: ['to_dhisId'],
      });

      expect(results).to.have.property('dimension');
      expect(results.dimension).to.include.members(['ou:to_dhisId']);
    });

    it('multiple organisation units', () => {
      const results = buildEventAnalyticsQuery({
        organisationUnitIds: ['to_dhisId', 'pg_dhisId'],
      });

      expect(results).to.have.property('dimension');
      assertArrayHasDimensionWithMembers(results.dimension, 'ou', ['pg_dhisId', 'to_dhisId']);
    });

    it('period provided', () =>
      expect(
        buildEventAnalyticsQuery({ organisationUnitIds: ['to_dhisId'], period: '202004' }),
      ).to.have.deep.property('dimension', ['ou:to_dhisId', `pe:202004`]));

    it('period not provided', () => {
      const startDate = '20200422';
      const endDate = '20200425';

      return expect(
        buildEventAnalyticsQuery({ organisationUnitIds: ['to_dhisId'], startDate, endDate }),
      ).to.deep.include({ dimension: ['ou:to_dhisId'], startDate, endDate });
    });

    it('combination of various dimensions', () => {
      const results = buildEventAnalyticsQuery({
        dataElementIds: ['pop01_dhisId', 'pop02_dhisId'],
        organisationUnitIds: ['to_dhisId', 'pg_dhisId'],
        period: '20200422',
      });

      expect(results).to.have.property('dimension');
      expect(results.dimension).to.have.lengthOf(4);
      expect(results.dimension).to.include.members(['pop01_dhisId', 'pop02_dhisId', 'pe:20200422']);
      assertArrayHasDimensionWithMembers(results.dimension, 'ou', ['pg_dhisId', 'to_dhisId']);
    });
  });
});
