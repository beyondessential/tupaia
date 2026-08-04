import { groupEventsByPeriod } from '@tupaia/dhis-api';
import { DataPerPeriodBuilder } from '../../DataPerPeriodBuilder';
import { CountEventsBuilder } from './countEvents';

/**
 * Configuration schema
 * @typedef {Object} CountEventsConfig
 * @property {string} programCode
 * @property {string} periodType
 * @property {Object<string, (string|Object)>} [dataValues]
 *
 * Example
 * ```js
 * {
 *   programCode: 'SCRF',
 *   periodType: 'month'
 *   dataValues: { STR_CRF125: '1' }
 * }
 * ```
 */

class CountEventsPerPeriodBuilder extends DataPerPeriodBuilder {
  getBaseBuilderClass = () => CountEventsBuilder;

  groupResultsByPeriod = groupEventsByPeriod;

  async fetchResults() {
    return this.getBaseBuilder().fetchResults();
  }
}

export const countEventsPerPeriod = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new CountEventsPerPeriodBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );

  return builder.build();
};
