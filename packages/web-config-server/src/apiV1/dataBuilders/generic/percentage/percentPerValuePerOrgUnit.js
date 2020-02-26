/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import { getDataSourceEntityType } from 'apiV1/dataBuilders/helpers';
import {
  countByOrganisationUnitByValue,
  calculatePercentagesWithinRange,
  getDataElementCodesInGroup,
} from '/apiV1/utils';

export const percentPerValuePerOrgUnit = async (
  { dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const { dataElementGroupCode, dataServices, range, valuesOfInterest } = dataBuilderConfig;

  const dataElementCodes = await getDataElementCodesInGroup(dhisApi, dataElementGroupCode);
  const { results } = await aggregator.fetchAnalytics(dataElementCodes, { dataServices }, query);
  const entities = await entity.getDescendantsOfType(getDataSourceEntityType(dataBuilderConfig));
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
