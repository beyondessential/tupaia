import moment from 'moment';
import { aggregateOperationalFacilityValues, getFacilityStatuses } from '/apiV1/utils';

// Example use: % clinics surveyed in last 6 months
export const percentOperationalFacilitiesWithData = async (
  { dataBuilderConfig, query },
  aggregator,
  ...dhisApiInstances
) => {
  const { dataElementGroupCode, monthsOfData } = dataBuilderConfig;
  const dhisParameters = { dataElementGroupCode };
  if (monthsOfData && !(query.startDate || query.endDate)) {
    dhisParameters.startDate = moment()
      .subtract(monthsOfData, 'months')
      .toISOString();
    dhisParameters.endDate = moment().toISOString();
  }

  // Will count only data from operational facilities
  const operationalFacilities = await getFacilityStatuses(aggregator, query.organisationUnitCode);

  // Count the number of facilities with data
  const facilitiesCounted = new Set(); // To avoid double counting facilities across dhis instances
  const addFacilityToSet = ({ facilityId }) => facilitiesCounted.add(facilityId);

  await Promise.all(
    dhisApiInstances.map(async dhisApi => {
      const results = await dhisApi.getDataValuesInSets(dhisParameters, query);
      aggregateOperationalFacilityValues(operationalFacilities, results, addFacilityToSet);
    }),
  );

  const numberOperational = Object.values(operationalFacilities).filter(
    isOperational => isOperational,
  ).length;
  const percentWithData = numberOperational === 0 ? 0 : facilitiesCounted.size / numberOperational;
  return { data: [{ value: percentWithData }] };
};
