/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import {
  getChildOrganisationUnits,
  getDataElementCodesInGroup,
  mapOrgUnitToGroupCodes,
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
    models,
    entity,
    organisationUnitType,
    dhisApi,
  );

  const dataElementCodes = await getDataElementCodesInGroup(dhisApi, dataElementGroupCode);
  const orgUnitToGroupKeys = mapOrgUnitToGroupCodes(organisationUnits);

  const { results } = await aggregator.fetchAnalytics(dataElementCodes, { dataServices }, query, {
    aggregationType: aggregator.aggregationTypes.MOST_RECENT_PER_ORG_GROUP,
    aggregationConfig: { orgUnitToGroupKeys },
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
