import moment from 'moment';
import { aggregateOperationalFacilityValues, getFacilityStatuses } from '/apiV1/utils';

// Example use: % clinics surveyed in last 6 months
export const percentOperationalFacilitiesWithData = async (
  { dataBuilderConfig, query, entity },
  aggregator,
  ...dhisApiInstances
) => {
  const { dataElementGroupCode, monthsOfData } = dataBuilderConfig;
  const dhisParameters = { dataElementGroupCode, idScheme: 'code' };
  if (monthsOfData && !(query.startDate || query.endDate)) {
    dhisParameters.startDate = moment().subtract(monthsOfData, 'months').toISOString();
    dhisParameters.endDate = moment().toISOString();
  }

  // Count the number of facilities with data
  const facilitiesCounted = new Set(); // To avoid double counting facilities across dhis instances
  const addFacilityToSet = ({ facilityId }) => facilitiesCounted.add(facilityId);

  const operationalFacilities = await getFacilityStatuses(aggregator, entity.code);
  await Promise.all(
    dhisApiInstances.map(async dhisApi => {
      // Will count only data from operational facilities
      const results = await dhisApi.getDataValuesInSets(dhisParameters, entity);
      aggregateOperationalFacilityValues(operationalFacilities, results, addFacilityToSet);
    }),
  );

  const numberOperational = Object.values(operationalFacilities).filter(
    isOperational => isOperational,
  ).length;
  const percentWithData = numberOperational === 0 ? 0 : facilitiesCounted.size / numberOperational;
  return { data: [{ value: percentWithData }] };
};
