import { convertDateRangeToPeriodString } from '@tupaia/utils';

const DATA_ELEMENT_CODES = {
  currentBeds: ['DP9'],
  normalBeds: ['DP_NEW001'],
  facilityAffectedStatus: ['DP_NEW008'],
};

export const disasterAffectedOrganisationOperationalData = async (
  { models, dataBuilderConfig, query, entity, fetchHierarchyId },
  aggregator,
) => {
  const { organisationUnitCode, disasterStartDate } = query;
  const { dataServices } = dataBuilderConfig;

  if (!disasterStartDate) return { data: [] };

  const hierarchyId = await fetchHierarchyId();
  const facilities = await entity.getDescendantsOfType(hierarchyId, models.entity.types.FACILITY);
  const { results: facilityStatusResults } = await aggregator.fetchAnalytics(
    DATA_ELEMENT_CODES.facilityAffectedStatus,
    {
      dataServices,
      period: convertDateRangeToPeriodString(disasterStartDate, Date.now()),
      organisationUnitCode,
    },
  );
  const operationalFacilities = facilityStatusResults.filter(
    result => result.value === 0 || result.value === 1,
  ); // 0 === 'Not affected', 1 === 'Partially affected'
  const { results: operationalInpatientBedResults } = await aggregator.fetchAnalytics(
    DATA_ELEMENT_CODES.currentBeds,
    {
      dataServices,
      organisationUnitCode,
      period: convertDateRangeToPeriodString(disasterStartDate, Date.now()),
    },
  );
  const totalOperationalInpatientBeds = operationalInpatientBedResults.reduce(
    (total, orgUnit) => total + orgUnit.value,
    0,
  );

  const { results: normalInpatientBedsResults } = await aggregator.fetchAnalytics(
    DATA_ELEMENT_CODES.normalBeds,
    {
      dataServices,
      organisationUnitCode,
    },
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
        total: facilities.length,
      },
      {
        name: 'Number of operational inpatient beds',
        value: totalOperationalInpatientBeds,
        total: totalNormalInpatientBeds,
      },
    ],
  };
};
