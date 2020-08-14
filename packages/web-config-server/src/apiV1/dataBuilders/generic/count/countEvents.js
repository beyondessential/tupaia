/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getSortByKey } from '@tupaia/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import {
  countEventsThatSatisfyConditions,
  groupEvents,
  getAllDataElementCodes,
} from '/apiV1/dataBuilders/helpers';

/**
 * Configuration schema
 * @typedef {Object} CountEventsConfig
 * @property {string} programCode
 * @property {Object<string, (string|object)>} [dataValues]
 * @property {string} [groupBy]
 *
 * Example
 * ```js
 * {
 *   programCode: 'SCRF',
 *   dataValues: { STR_CRF125: '1' }
 *   groupBy: { type: 'allOrgUnitNames', options: { type: 'village' } }
 * }
 * ```
 */

export class CountEventsBuilder extends DataBuilder {
  async build() {
    const events = await this.fetchResults();
    const data = await this.buildData(events);

    return { data };
  }

  async fetchResults() {
    const dataElementCodes = this.getDataElementCodes();
    const events = await this.fetchEvents({ useDeprecatedApi: false, dataElementCodes });
    return events;
  }

  getDataElementCodes() {
    const { groupBy } = this.config;
    if (groupBy) {
      return getAllDataElementCodes(groupBy);
    }
    return Object.keys(this.config.dataValues || {});
  }

  async buildData(events) {
    const eventGroups = await this.groupEvents(events);

    return Object.entries(eventGroups)
      .reduce(
        (result, [groupName, eventsForGroup]) =>
          result.concat(this.buildDataForGroup(eventsForGroup, groupName)),
        [],
      )
      .sort(getSortByKey('name'));
  }

  async groupEvents(events) {
    const { groupBy } = this.config;
    return groupBy ? groupEvents(events, groupBy) : { value: events };
  }

  buildDataForGroup(events, name = 'countEvents') {
    const { dataValues } = this.config;
    const value = countEventsThatSatisfyConditions(events, { dataValues });

    return [{ name, value }];
  }
}

export const countEvents = async ({ dataBuilderConfig, query, entity }, aggregator, dhisApi) => {
  const builder = new CountEventsBuilder(aggregator, dhisApi, dataBuilderConfig, query, entity);
  return builder.build();
};
