import {
  countByOrganisationUnitByValue,
  calculatePercentagesWithinRange,
  getDataElementCodesInGroup,
} from '/apiV1/utils';

export const percentPerValuePerOrgUnit = async (
  { models, dataBuilderConfig, query, entity, fetchHierarchyId },
  aggregator,
  dhisApi,
) => {
  const {
    dataElementGroupCode,
    entityAggregation = {},
    dataServices,
    range,
    valuesOfInterest,
  } = dataBuilderConfig;
  const { dataSourceEntityType = models.entity.types.FACILITY } = entityAggregation;

  const dataElementCodes = await getDataElementCodesInGroup(dhisApi, dataElementGroupCode);
  const { results } = await aggregator.fetchAnalytics(dataElementCodes, { dataServices }, query);
  const hierarchyId = await fetchHierarchyId();
  const entities = await entity.getDescendantsOfType(hierarchyId, dataSourceEntityType);
  const countsByOrganisationUnit = countByOrganisationUnitByValue(
    results,
    entities,
    valuesOfInterest,
  );
  const percentagesByOrganisationUnit = calculatePercentagesWithinRange(
    countsByOrganisationUnit,
    range,
  );

  // Sort results by organisation unit name
  return {
    data: percentagesByOrganisationUnit.sort(({ name: nameA }, { name: nameB }) =>
      nameA.localeCompare(nameB, 'en', { sensitivity: 'base' }),
    ),
  };
};
