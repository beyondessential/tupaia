import { groupEventsByPeriod } from '@tupaia/dhis-api';
import { DataPerPeriodBuilder } from 'apiV1/dataBuilders/DataPerPeriodBuilder';
import { PercentagesOfEventCountsBuilder } from '/apiV1/dataBuilders/generic/percentage/percentagesOfEventCounts';

/**
 * Configuration schema
 * @typedef {Object} PercentagesOfEventCountsPerPeriodConfig
 * @property {string} programCode
 * @property {string} periodType
 * @property {Object<string, EventPercentage>} dataClasses
 *
 * Example
 * ```js
 * {
 *   programCode: 'SCRF',
 *   periodType: 'month',
 *   dataClasses: {
 *     Male: {
 *       numerator: { dataValues: { STR_CRF15: 'Male' } },
 *       denominator: { dataValues: { STR_CRF125: '1' } },
 *     },
 *   }
 * }
 * ```
 */

class PercentagesOfEventCountsPerPeriodBuilder extends DataPerPeriodBuilder {
  getBaseBuilderClass = () => PercentagesOfEventCountsBuilder;

  groupResultsByPeriod = groupEventsByPeriod;

  async fetchResults() {
    return this.getBaseBuilder().fetchResults();
  }

  formatData(data) {
    return this.getBaseBuilder().formatData(data);
  }
}

export const percentagesOfEventCountsPerPeriod = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new PercentagesOfEventCountsPerPeriodBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );

  return builder.build();
};
