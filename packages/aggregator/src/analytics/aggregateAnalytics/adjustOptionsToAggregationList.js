/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { convertDateRangeToPeriodString } from '@tupaia/utils';
import { EntityConnection } from '../../connections';
import { AGGREGATION_TYPES } from '../../aggregationTypes';
import { getDateRangeForOffsetPeriod } from './aggregations/offsetPeriod';
import { getDateRangeForSumPreviousPerPeriod } from './aggregations/sumPreviousPerPeriod';

const AGGREGATION_TYPE_TO_DATE_RANGE_GETTER = {
  [AGGREGATION_TYPES.SUM_PREVIOUS_EACH_DAY]: getDateRangeForSumPreviousPerPeriod,
  [AGGREGATION_TYPES.OFFSET_PERIOD]: getDateRangeForOffsetPeriod,
};

/**
 * Currently not all `startDate`, `endDate`, `period` options are provided in each client request.
 * This function preserves the existing functionality by retaining the original period if
 * there was no date range adjustment
 */
const getAdjustedPeriod = (originalOptions, adjustedOptions) => {
  const areDateRangesEqual =
    originalOptions?.startDate === adjustedOptions?.startDate &&
    originalOptions?.endDate === adjustedOptions?.endDate;

  return areDateRangesEqual
    ? originalOptions.period
    : convertDateRangeToPeriodString(adjustedOptions.startDate, adjustedOptions.endDate);
};

const getAdjustedDateRange = (dateRange, aggregationList) =>
  aggregationList.reduce((currentRange, aggregation) => {
    const getDateRange = AGGREGATION_TYPE_TO_DATE_RANGE_GETTER[aggregation.type];
    return getDateRange ? getDateRange(currentRange, aggregation.config) : currentRange;
  }, dateRange);

const shouldFetchDataSourceEntities = ({ config }) => config?.dataSourceEntityType;

const shouldFetchRelations = ({ type, config }) =>
  config?.aggregationEntityType &&
  config?.dataSourceEntityType &&
  !(type === AGGREGATION_TYPES.RAW);

const getAdjustedOrganisationUnitsAndAggregations = async (
  context,
  fetchOptions,
  aggregationList,
) => {
  const { hierarchy, organisationUnitCodes } = fetchOptions;
  const { session } = context;
  // TODO: Remove this check for session when implementing https://github.com/beyondessential/tupaia-backlog/issues/2697
  if (!aggregationList.some(shouldFetchDataSourceEntities) || !session) {
    return [organisationUnitCodes, aggregationList];
  }

  let adjustedOrganisationUnitCodes;
  const adjustedAggregations = [];
  const entityConnection = new EntityConnection(session);
  await Promise.all(
    aggregationList.map(async aggregation => {
      if (!shouldFetchDataSourceEntities(aggregation)) {
        adjustedAggregations.push(aggregation);
        return;
      }

      if (!adjustedOrganisationUnitCodes && !shouldFetchRelations(aggregation)) {
        const { dataSourceEntityType, dataSourceEntityFilter } = aggregation.config;
        adjustedOrganisationUnitCodes = await entityConnection.getDataSourceEntities(
          hierarchy,
          organisationUnitCodes,
          dataSourceEntityType,
          dataSourceEntityFilter,
        );
        adjustedAggregations.push(aggregation);
        return;
      }

      const {
        aggregationEntityType,
        dataSourceEntityType,
        dataSourceEntityFilter,
      } = aggregation.config;
      const [
        dataSourceEntities,
        relations,
      ] = await entityConnection.getDataSourceEntitiesAndRelations(
        hierarchy,
        organisationUnitCodes,
        aggregationEntityType,
        dataSourceEntityType,
        dataSourceEntityFilter,
      );

      if (!adjustedOrganisationUnitCodes) {
        adjustedOrganisationUnitCodes = dataSourceEntities;
      }
      adjustedAggregations.push({
        ...aggregation,
        config: { ...aggregation.config, orgUnitMap: relations },
      });
    }),
  );

  return [adjustedOrganisationUnitCodes, adjustedAggregations];
};

/**
 * Each aggregation in the list may require the original fetch option dimensions (dates, org units etc)
 * to be adjusted, eg when we need to take into account past/future data
 *
 * @param {Object} context
 * @param {Object} fetchOptions
 * @param {Object} aggregationOptions
 */
export const adjustOptionsToAggregationList = async (context, fetchOptions, aggregationOptions) => {
  const { aggregations: aggregationList = [] } = aggregationOptions;
  if (aggregationList.length === 0) {
    // Trim off any pre-existing aggregations from fetch options
    const { aggregations, ...restOfFetchOptions } = fetchOptions;
    return [restOfFetchOptions, aggregationOptions];
  }

  const { startDate, endDate } = getAdjustedDateRange(fetchOptions, aggregationList);
  const period = getAdjustedPeriod(fetchOptions, { startDate, endDate });

  const [organisationUnitCodes, aggregations] = await getAdjustedOrganisationUnitsAndAggregations(
    context,
    fetchOptions,
    aggregationList,
  );

  return [
    { ...fetchOptions, organisationUnitCodes, startDate, endDate, period, aggregations },
    { ...aggregationOptions, aggregations },
  ];
};
