/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import {
  countByOrganisationUnitByValue,
  calculatePercentagesWithinRange,
  getDataElementCodesInGroup,
} from '/apiV1/utils';
import { ENTITY_TYPES } from '/models/Entity';

export const percentPerValuePerOrgUnit = async (
  { dataBuilderConfig, query, entity },
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
  const { dataSourceEntityType = ENTITY_TYPES.FACILITY } = entityAggregation;

  const dataElementCodes = await getDataElementCodesInGroup(dhisApi, dataElementGroupCode);
  const { results } = await aggregator.fetchAnalytics(dataElementCodes, { dataServices }, query);
  const entities = await entity.getDescendantsOfType(dataSourceEntityType);
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
