import { convertDateRangeToPeriodString } from '@tupaia/utils';
import { DataSourceEntityProvider } from '../../connections';
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

const shouldFetchRelationships = ({ type, config }) =>
  config?.aggregationEntityType &&
  config?.dataSourceEntityType &&
  !(type === AGGREGATION_TYPES.RAW);

const getAdjustedOrganisationUnitsAndAggregations = async (
  context,
  fetchOptions,
  aggregationList,
) => {
  const { hierarchy, organisationUnitCodes } = fetchOptions;
  const entityApi = context?.services?.entity;
  // TODO: Remove this check for entityApi when implementing https://github.com/beyondessential/tupaia-backlog/issues/2697
  if (!aggregationList.some(shouldFetchDataSourceEntities) || !entityApi) {
    return [organisationUnitCodes, aggregationList];
  }

  const entityProvider = new DataSourceEntityProvider(entityApi);
  const adjustedAggregationsAndDataSourceEntites = await Promise.all(
    aggregationList.map(async aggregation => {
      if (!shouldFetchDataSourceEntities(aggregation)) {
        return [aggregation, undefined];
      }

      if (!shouldFetchRelationships(aggregation)) {
        const { dataSourceEntityType, dataSourceEntityFilter } = aggregation.config;
        const dataSourceEntities = await entityProvider.getDataSourceEntities(
          hierarchy,
          organisationUnitCodes,
          dataSourceEntityType,
          dataSourceEntityFilter,
        );
        return [aggregation, dataSourceEntities];
      }

      const {
        aggregationEntityType,
        dataSourceEntityType,
        dataSourceEntityFilter,
      } = aggregation.config;
      const [
        dataSourceEntities,
        relationships,
      ] = await entityProvider.getDataSourceEntitiesAndRelationships(
        hierarchy,
        organisationUnitCodes,
        aggregationEntityType,
        dataSourceEntityType,
        dataSourceEntityFilter,
      );

      return [
        {
          ...aggregation,
          config: { ...aggregation.config, orgUnitMap: relationships },
        },
        dataSourceEntities,
      ];
    }),
  );

  const adjustedAggregations = adjustedAggregationsAndDataSourceEntites.map(
    aggregationAndDataSourceEntities => aggregationAndDataSourceEntities[0],
  );
  const dataSourceEntities =
    adjustedAggregationsAndDataSourceEntites
      .map(aggregationAndDataSourceEntities => aggregationAndDataSourceEntities[1])
      .find(dataSourceEntities => dataSourceEntities !== undefined) || organisationUnitCodes;

  return [dataSourceEntities, adjustedAggregations];
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
