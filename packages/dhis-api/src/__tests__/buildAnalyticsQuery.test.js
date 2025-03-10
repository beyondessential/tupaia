import { buildDataValueAnalyticsQueries, buildEventAnalyticsQuery } from '../buildAnalyticsQuery';
import { assertDhisDimensionHasMembers } from './helpers';

const assertArrayHasDimensionWithMembers = (array, dimensionKey, members) => {
  /**
   * Note: Due to incompatibility with jest-expected-message and jest 27+ we are disabling
   * the custom error messages for these tests. Will re-instate once the fix gets merged:
   *  https://github.com/mattphillips/jest-expect-message/pull/40
   */

  // const errorMessage = `Array does not include a '${dimensionKey}' dimension with the target members`;

  const dimensions = array.filter(item => item.startsWith(`${dimensionKey}:`));
  // expect(dimensions.length, errorMessage).toBeGreaterThan(0);
  expect(dimensions.length).toBeGreaterThan(0);

  const results = dimensions.some(dimension => {
    try {
      assertDhisDimensionHasMembers(dimension, members);
    } catch (error) {
      return false;
    }

    return true;
  });
  // expect(results, errorMessage).toBe(true);
  expect(results).toBe(true);
};

describe('buildAnalyticsQuery', () => {
  describe('buildEventAnalyticsQuery()', () => {
    it('should throw an error if an organisation unit is not specified', () =>
      expect(() => buildEventAnalyticsQuery({})).toThrowError('organisation unit'));

    it('should allow empty data elements', () => {
      const expectMethodToNotThrowError = dataElementIds =>
        expect(() =>
          buildEventAnalyticsQuery({ dataElementIds, organisationUnitIds: ['to_dhisId'] }),
        ).not.toThrowError();

      [undefined, []].forEach(expectMethodToNotThrowError);
    });

    it('single data element', () => {
      const results = buildEventAnalyticsQuery({
        dataElementIds: ['pop01_dhisId'],
        organisationUnitIds: ['to_dhisId'],
      });

      expect(results).toHaveProperty('dimension');
      expect(results.dimension).toIncludeAllMembers(['pop01_dhisId']);
    });

    it('multiple data elements', () => {
      const results = buildEventAnalyticsQuery({
        dataElementIds: ['pop01_dhisId', 'pop02_dhisId'],
        organisationUnitIds: ['to_dhisId'],
      });

      expect(results).toHaveProperty('dimension');
      expect(results.dimension).toIncludeAllMembers(['pop01_dhisId', 'pop02_dhisId']);
    });

    it('single organisation unit', () => {
      const results = buildEventAnalyticsQuery({
        organisationUnitIds: ['to_dhisId'],
      });

      expect(results).toHaveProperty('dimension');
      expect(results.dimension).toIncludeAllMembers(['ou:to_dhisId']);
    });

    it('multiple organisation units', () => {
      const results = buildEventAnalyticsQuery({
        organisationUnitIds: ['to_dhisId', 'pg_dhisId'],
      });

      expect(results).toHaveProperty('dimension');
      assertArrayHasDimensionWithMembers(results.dimension, 'ou', ['pg_dhisId', 'to_dhisId']);
    });

    it('period provided', () =>
      expect(
        buildEventAnalyticsQuery({ organisationUnitIds: ['to_dhisId'], period: '202004' }),
      ).toHaveProperty('dimension', ['ou:to_dhisId', `pe:202004`]));

    it('period not provided', () => {
      const startDate = '20200422';
      const endDate = '20200425';

      return expect(
        buildEventAnalyticsQuery({ organisationUnitIds: ['to_dhisId'], startDate, endDate }),
      ).toMatchObject({ dimension: ['ou:to_dhisId'], startDate, endDate });
    });

    it('combination of various dimensions', () => {
      const results = buildEventAnalyticsQuery({
        dataElementIds: ['pop01_dhisId', 'pop02_dhisId'],
        organisationUnitIds: ['to_dhisId', 'pg_dhisId'],
        period: '20200422',
      });

      expect(results).toHaveProperty('dimension');
      expect(results.dimension).toHaveLength(4);
      expect(results.dimension).toIncludeAllMembers([
        'pop01_dhisId',
        'pop02_dhisId',
        'pe:20200422',
      ]);
      assertArrayHasDimensionWithMembers(results.dimension, 'ou', ['pg_dhisId', 'to_dhisId']);
    });
  });

  describe('buildDataValueAnalyticsQueries()', () => {
    it('simple case', () => {
      const queries = buildDataValueAnalyticsQueries({
        dataElementCodes: ['POP01'],
        organisationUnitCodes: ['TO'],
      });

      expect(queries.length).toBe(1);

      const [query] = queries;

      expect(query).toHaveProperty('dimension');
      expect(query.dimension).toIncludeAllMembers(['dx:POP01', 'ou:TO']);
    });

    it('works with ids', () => {
      const queries = buildDataValueAnalyticsQueries({
        dataElementIds: ['pop01_dhisId'],
        organisationUnitIds: ['tonga_dhisId'],
      });

      expect(queries.length).toBe(1);

      const [query] = queries;

      expect(query).toHaveProperty('dimension');
      expect(query.dimension).toIncludeAllMembers(['dx:pop01_dhisId', 'ou:tonga_dhisId']);
    });
  });
});
