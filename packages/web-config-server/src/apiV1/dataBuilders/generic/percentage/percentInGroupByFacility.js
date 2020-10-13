import keyBy from 'lodash.keyby';
import { getSortByKey } from '@tupaia/utils';
import {
  aggregateOperationalFacilityValues,
  getFacilityStatuses,
  getPacificFacilityStatuses,
  limitRange,
} from '/apiV1/utils';
import { ENTITY_TYPES } from '/models/Entity';

// Medicines available by Clinic
// Medicines available by Country
export const percentInGroupByFacility = async (
  { dataBuilderConfig, query, entity },
  aggregator,
) => {
  const { dataElementCodes, dataServices, countries, range } = dataBuilderConfig;
  const { results, period } = await aggregator.fetchAnalytics(
    dataElementCodes,
    { dataServices },
    query,
  );

  const returnJson = {};
  returnJson.data = countries
    ? await buildDataForPacificCountries(
        aggregator,
        results,
        query.organisationUnitCode,
        period.requested,
        range,
      )
    : await buildData(
        aggregator,
        results,
        query.organisationUnitCode,
        period.requested,
        entity,
        range,
      );

  return returnJson;
};

const buildDataForPacificCountries = async (
  aggregator,
  results,
  organisationUnitCode,
  period,
  range,
) => {
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
    aggregator,
    organisationUnitCode,
    period.requested,
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
};

// parse analytic response and convert to config api response
const buildData = async (aggregator, results, organisationUnitCode, period, entity, range) => {
  const averagedValues = [];
  const facilities = await entity.getDescendantsOfType(ENTITY_TYPES.FACILITY);
  const facilitiesByCode = keyBy(facilities, 'code');
  const addToAveragedValues = ({ facilityId: facilityCode, value }) => {
    averagedValues.push({
      name: facilitiesByCode[facilityCode].name,
      value: range ? limitRange(value, range) : value,
    });
  };

  // Will count only operational facilities
  const operationalFacilities = await getFacilityStatuses(
    aggregator,
    organisationUnitCode,
    period.requested,
  );
  aggregateOperationalFacilityValues(operationalFacilities, results, addToAveragedValues);

  // Return the result array sorted by name
  const returnData = averagedValues.sort(getSortByKey('name'));

  return returnData;
};
