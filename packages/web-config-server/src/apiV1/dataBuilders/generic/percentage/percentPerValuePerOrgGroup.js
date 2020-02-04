/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import { AGGREGATION_TYPES } from '@tupaia/dhis-api';
import {
  getChildOrganisationUnits,
  mapOrgUnitIdsToGroupCodes,
  countByOrganisationUnitByValue,
  calculatePercentagesWithinRange,
} from '/apiV1/utils';
const { MOST_RECENT_PER_ORG_GROUP } = AGGREGATION_TYPES;

export const percentPerValuePerOrgGroup = async (
  { dataBuilderConfig, query },
  aggregator,
  dhisApi,
) => {
  const { organisationUnitLevel, range, valuesOfInterest } = dataBuilderConfig;
  const { organisationUnitCode } = query;

  const organisationUnits = await getChildOrganisationUnits(
    {
      organisationUnitGroupCode: organisationUnitCode,
      level: organisationUnitLevel,
    },
    dhisApi,
  );
  const orgUnitIdsToGroupKeys = mapOrgUnitIdsToGroupCodes(organisationUnits);

  const { results } = await dhisApi.getAnalytics(
    dataBuilderConfig,
    query,
    MOST_RECENT_PER_ORG_GROUP,
    { orgUnitIdsToGroupKeys },
  );
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
