import { AGGREGATION_TYPES, convertDateRangeToPeriodString } from '@tupaia/dhis-api';
import { Entity } from '/models';

const DATA_ELEMENT_CODES = {
  currentBeds: ['DP9'],
  normalBeds: ['DP_NEW001'],
  facilityAffectedStatus: ['DP_NEW008'],
};

export const disasterAffectedOrganisationOperationalData = async ({ query }, dhisApi) => {
  const { organisationUnitCode, disasterStartDate } = query;
  const { MOST_RECENT } = AGGREGATION_TYPES;

  if (!disasterStartDate) return { data: [] };

  const facilitiesInOrgUnit = await Entity.getFacilityDescendantsWithCoordinates(
    organisationUnitCode,
  );
  const { results: facilityStatusResults } = await dhisApi.getAnalytics(
    {
      dataElementCodes: DATA_ELEMENT_CODES.facilityAffectedStatus,
      period: convertDateRangeToPeriodString(disasterStartDate, Date.now()),
      organisationUnitCode,
    },
    MOST_RECENT,
  );
  const operationalFacilities = facilityStatusResults.filter(
    result => result.value === 0 || result.value === 1,
  ); // 0 === 'Not affected', 1 === 'Partially affected'
  const { results: operationalInpatientBedResults } = await dhisApi.getAnalytics(
    {
      dataElementCodes: DATA_ELEMENT_CODES.currentBeds,
      organisationUnitCode,
      period: convertDateRangeToPeriodString(disasterStartDate, Date.now()),
    },
    MOST_RECENT,
  );
  const totalOperationalInpatientBeds = operationalInpatientBedResults.reduce(
    (total, orgUnit) => total + orgUnit.value,
    0,
  );

  const { results: normalInpatientBedsResults } = await dhisApi.getAnalytics(
    {
      dataElementCodes: DATA_ELEMENT_CODES.normalBeds,
      organisationUnitCode,
    },
    MOST_RECENT,
  );
  const totalNormalInpatientBeds = normalInpatientBedsResults.reduce(
    (total, orgUnit) => total + orgUnit.value,
    0,
  );

  return {
    data: [
      {
        name: 'Number of known operational facilities',
        value: operationalFacilities.length,
        total: facilitiesInOrgUnit.length,
      },
      {
        name: 'Number of operational inpatient beds',
        value: totalOperationalInpatientBeds,
        total: totalNormalInpatientBeds,
      },
    ],
  };
};
