import { keyBy } from 'es-toolkit/compat';
import { getSortByKey } from '@tupaia/utils';
import {
  aggregateOperationalFacilityValues,
  getFacilityStatuses,
  getPacificFacilityStatuses,
  limitRange,
} from '/apiV1/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

// Medicines available by Clinic
// Medicines available by Country
class PercentInGroupByFacilityBuilder extends DataBuilder {
  async build() {
    const { dataElementCodes, countries, range } = this.config;
    const { results, period } = await this.fetchAnalytics(dataElementCodes);

    if (countries) {
      const data = await this.buildDataForPacificCountries(results, period.requested, range);
      return { data };
    }

    const data = await this.buildData(results, period.requested, range);

    return { data };
  }

  async buildDataForPacificCountries(results, period, range) {
    // Map operational facilities by country with summed values and total number
    const summedValuesByCountry = {};
    const addValueToSumByCountry = ({ countryCode, value }) => {
      if (!countryCode || countryCode === 'DL') {
        return;
      }

      if (!summedValuesByCountry[countryCode]) {
        summedValuesByCountry[countryCode] = { sum: 0, count: 0 };
      }
      summedValuesByCountry[countryCode].sum += value;
      summedValuesByCountry[countryCode].count++;
    };

    // Aggregate results by operational facilities and country
    const operationalFacilities = await getPacificFacilityStatuses(
      this.aggregator,
      this.entity.code,
      period,
    );
    aggregateOperationalFacilityValues(operationalFacilities, results, addValueToSumByCountry);

    // Array with alphabet used in case names need to be anonymised on the chart
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('').map(c => c.toUpperCase());

    // Return the result array sorted by name
    return Object.entries(summedValuesByCountry)
      .map(([countryCode, sumAndCount], index) => ({
        name: alphabet[index],
        value: range
          ? limitRange(sumAndCount.sum / sumAndCount.count, range)
          : sumAndCount.sum / sumAndCount.count,
      }))
      .sort((one, two) => {
        if (one.name < two.name) return -1;
        if (one.name > two.name) return 1;
        return 0;
      });
  }

  // parse analytic response and convert to config api response
  async buildData(results, period, range) {
    const averagedValues = [];
    const facilities = await this.fetchDescendantsOfType(this.models.entity.types.FACILITY);
    const facilitiesByCode = keyBy(facilities, 'code');
    const addToAveragedValues = ({ facilityId: facilityCode, value }) => {
      averagedValues.push({
        name: facilitiesByCode[facilityCode].name,
        value: range ? limitRange(value, range) : value,
      });
    };

    // Will count only operational facilities
    const operationalFacilities = await getFacilityStatuses(
      this.aggregator,
      this.entity.code,
      period.requested,
    );
    aggregateOperationalFacilityValues(operationalFacilities, results, addToAveragedValues);

    // Return the result array sorted by name
    const returnData = averagedValues.sort(getSortByKey('name'));

    return returnData;
  }
}

export const percentInGroupByFacility = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new PercentInGroupByFacilityBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );
  return builder.build();
};
