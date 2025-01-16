import {
  getChildOrganisationUnits,
  getDataElementCodesInGroup,
  mapOrgUnitCodeToGroup,
  countByOrganisationUnitByValue,
  calculatePercentagesWithinRange,
} from '/apiV1/utils';

export const percentPerValuePerOrgGroup = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const {
    dataElementGroupCode,
    dataServices,
    organisationUnitType,
    range,
    valuesOfInterest,
  } = dataBuilderConfig;

  const organisationUnits = await getChildOrganisationUnits(
    dhisApi,
    entity,
    models.entity.getDhisLevel(organisationUnitType),
  );

  const dataElementCodes = await getDataElementCodesInGroup(dhisApi, dataElementGroupCode);
  const orgUnitMap = mapOrgUnitCodeToGroup(organisationUnits);

  const { results } = await aggregator.fetchAnalytics(dataElementCodes, { dataServices }, query, {
    aggregationType: aggregator.aggregationTypes.MOST_RECENT_PER_ORG_GROUP,
    aggregationConfig: { orgUnitMap },
  });
  const countsByOrganisationUnit = countByOrganisationUnitByValue(
    results,
    organisationUnits,
    valuesOfInterest,
  );
  const percentagesByOrganisationUnit = calculatePercentagesWithinRange(
    countsByOrganisationUnit,
    range,
  );

  return {
    data: percentagesByOrganisationUnit.sort(({ name: nameA }, { name: nameB }) =>
      nameA.localeCompare(nameB, 'en', { sensitivity: 'base' }),
    ),
  };
};
