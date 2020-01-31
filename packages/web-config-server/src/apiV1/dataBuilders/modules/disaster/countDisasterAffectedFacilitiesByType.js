import keyBy from 'lodash.keyby';
import { AGGREGATION_TYPES, convertDateRangeToPeriodString } from '@tupaia/dhis-api';
import { Entity } from '/models';
import { getOptionSetOptions } from '/apiV1/utils';

const { MOST_RECENT } = AGGREGATION_TYPES;

const AFFECTED_STATUS_DATA_ELEMENT_CODE = 'DP_NEW008';

// values from survey that indicate facility is affected
const FACILITY_AFFECTED_VALUES = ['Partially affected', 'Completely affected'];
// presentationOption headers
const FACILITY_AFFECTED = 'Affected';
const FACILITY_UNAFFECTED = 'Unaffected';
const FACILITY_STATUS_UNKNOWN = 'Unknown';

// Number of Operational Facilities by Facility Type
export const countDisasterAffectedFacilitiesByType = async (
  { dataBuilderConfig, query },
  aggregator,
  dhisApi,
) => {
  const { organisationUnitCode, disasterStartDate, disasterEndDate } = query;
  const { optionSetCode } = dataBuilderConfig;

  if (!disasterStartDate) return { data: {} }; // show no data message in view.
  const options = await getOptionSetOptions(dhisApi, { code: optionSetCode });
  const period = convertDateRangeToPeriodString(disasterStartDate, disasterEndDate || Date.now());
  const facilities = await Entity.getFacilityDescendantsWithCoordinates(organisationUnitCode);
  const { results } = await dhisApi.getAnalytics(
    {
      dataElementCodes: [AFFECTED_STATUS_DATA_ELEMENT_CODE],
      outputIdScheme: 'code',
      ...query,
      period,
    },
    MOST_RECENT,
  );

  const facilitiesByCode = keyBy(facilities, 'code');
  const facilityStatuses = new Map(
    results.map(result => {
      const { organisationUnit: facilityCode } = result;
      const organisationUnitName = facilitiesByCode[facilityCode].name;
      const optionValue = options[result.value];
      const facilityIsAffected = FACILITY_AFFECTED_VALUES.includes(optionValue);
      const value = facilityIsAffected ? FACILITY_AFFECTED : FACILITY_UNAFFECTED;

      return [organisationUnitName, value];
    }),
  );

  const statusCountsByFacilityType = {};
  facilities.forEach(facility => {
    const { type_name: typeName, name } = facility;
    const facilityAffectedStatus = facilityStatuses.get(name) || FACILITY_STATUS_UNKNOWN;

    if (!statusCountsByFacilityType[typeName]) {
      statusCountsByFacilityType[typeName] = {
        name: typeName,
        [FACILITY_UNAFFECTED]: 0,
        [FACILITY_STATUS_UNKNOWN]: 0,
        [FACILITY_AFFECTED]: 0,
      };
    }
    statusCountsByFacilityType[typeName][facilityAffectedStatus]++;
  });

  return { data: Array.from(Object.values(statusCountsByFacilityType)) };
};
