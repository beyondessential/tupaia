/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import {
  getChildOrganisationUnits,
  getDataElementsInGroup,
  mapOrgUnitToGroupCodes,
  countByOrganisationUnitByValue,
  calculatePercentagesWithinRange,
} from '/apiV1/utils';

export const percentPerValuePerOrgGroup = async (
  { dataBuilderConfig, query },
  aggregator,
  dhisApi,
) => {
  const {
    dataElementGroupCode,
    dataServices,
    organisationUnitLevel,
    range,
    valuesOfInterest,
  } = dataBuilderConfig;
  const { organisationUnitCode } = query;

  const organisationUnits = await getChildOrganisationUnits(
    {
      organisationUnitGroupCode: organisationUnitCode,
      level: organisationUnitLevel,
    },
    dhisApi,
  );

  const dataElements = await getDataElementsInGroup(dhisApi, dataElementGroupCode);
  const dataElementCodes = Object.values(dataElements).map(({ code }) => code);
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
