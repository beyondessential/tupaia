import keyBy from 'lodash.keyby';
import { convertDateRangeToPeriodString } from '@tupaia/utils';
import { Facility } from '/models';

const AFFECTED_STATUS_DATA_ELEMENT_CODE = 'DP_NEW008';

// values from survey that indicate facility is affected
const FACILITY_AFFECTED_VALUES = ['Partially affected', 'Completely affected'];
// presentationOption headers
const FACILITY_AFFECTED = 'Affected';
const FACILITY_UNAFFECTED = 'Unaffected';
const FACILITY_STATUS_UNKNOWN = 'Unknown';

// Number of Operational Facilities by Facility Type
export const countDisasterAffectedFacilitiesByType = async (
  { dataBuilderConfig, query, entity, fetchHierarchyId },
  aggregator,
  dhisApi,
) => {
  const { disasterStartDate, disasterEndDate } = query;
  const { dataServices, optionSetCode } = dataBuilderConfig;

  if (!disasterStartDate) return { data: {} }; // show no data message in view.
  const options = await dhisApi.getOptionSetOptions({ code: optionSetCode });
  const period = convertDateRangeToPeriodString(disasterStartDate, disasterEndDate || Date.now());
  const hierarchyId = await fetchHierarchyId();
  const facilities = await entity.getFacilityDescendants(hierarchyId);
  const facilityMetadatas = await Facility.find({
    code: facilities.map(facility => facility.code),
  });
  const { results } = await aggregator.fetchAnalytics([AFFECTED_STATUS_DATA_ELEMENT_CODE], {
    ...query,
    dataServices,
    period,
  });

  const facilitiesByCode = keyBy(facilities, 'code');
  const facilityMetadatasByCode = keyBy(facilityMetadatas, 'code');
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
    const { name, code } = facility;
    const { type_name: facilityTypeName } = facilityMetadatasByCode[code];
    const facilityAffectedStatus = facilityStatuses.get(name) || FACILITY_STATUS_UNKNOWN;

    if (!statusCountsByFacilityType[facilityTypeName]) {
      statusCountsByFacilityType[facilityTypeName] = {
        name: facilityTypeName,
        [FACILITY_UNAFFECTED]: 0,
        [FACILITY_STATUS_UNKNOWN]: 0,
        [FACILITY_AFFECTED]: 0,
      };
    }
    statusCountsByFacilityType[facilityTypeName][facilityAffectedStatus]++;
  });

  return { data: Array.from(Object.values(statusCountsByFacilityType)) };
};
