/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import { getSortByKey } from '@tupaia/utils';

import { Project } from '/models';
import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';

export class DataBuilder {
  static NO_DATA_AVAILABLE = NO_DATA_AVAILABLE;

  /**
   * @param {Aggregator} aggregator
   * @param {DhisApi} dhisApi
   * @param {?Object} config
   * @param {Object} query
   * @param {Entity} [entity]
   * @param {string} [aggregationType]
   */
  constructor(aggregator, dhisApi, config, query, entity, aggregationType) {
    this.aggregator = aggregator;
    this.dhisApi = dhisApi;
    this.config = config || {};
    this.query = query;
    this.entity = entity;
    this.aggregationType = aggregationType;
  }

  // eslint-disable-next-line class-methods-use-this
  build() {
    throw new Error('Any subclass of DataBuilder must implement the "build" method');
  }

  getProgramCodesForAnalytics() {
    const { programCodes, programCode, dataSource = {} } = this.config;
    return (
      programCodes ||
      (programCode && [programCode]) ||
      dataSource.programCodes ||
      (dataSource.programCode && [dataSource.programCode])
    );
  }

  async fetchAnalytics(
    dataElementCodes,
    additionalQueryConfig,
    aggregationType = this.aggregationType,
    aggregationConfig = {},
  ) {
    const { dataServices, dataSourceEntityType, dataSourceEntityFilter, filter = {} } = this.config;
    const fetchOptions = {
      programCodes: this.getProgramCodesForAnalytics(),
      dataServices,
      dataSourceEntityType,
      dataSourceEntityFilter,
      ...additionalQueryConfig,
    };

    return this.aggregator.fetchAnalytics(dataElementCodes, fetchOptions, this.query, {
      aggregationConfig,
      aggregationType,
      filter,
    });
  }

  async fetchEvents(additionalQueryConfig) {
    const { programCode, dataServices, dataSourceEntityType, dataSourceEntityFilter } = this.config;
    const { organisationUnitCode, startDate, endDate, trackedEntityInstance, eventId } = this.query;

    return this.aggregator.fetchEvents(programCode, {
      dataServices,
      dataSourceEntityType,
      dataSourceEntityFilter,
      organisationUnitCode,
      startDate,
      endDate,
      trackedEntityInstance,
      eventId,
      ...additionalQueryConfig,
    });
  }

  async fetchDataElements(codes) {
    const { dataServices } = this.config;
    const { organisationUnitCode } = this.query;

    return this.aggregator.fetchDataElements(codes, {
      organisationUnitCode,
      dataServices,
      includeOptions: true,
    });
  }

  async fetchEntityHierarchyId() {
    const { projectCode } = this.query;
    const project = await Project.findOne({ code: projectCode });
    return project.entity_hierarchy_id;
  }

  async fetchDescendantsOfType(type) {
    const entityHierarchyId = await this.fetchEntityHierarchyId();
    return this.entity.getDescendantsOfType(type, entityHierarchyId);
  }

  sortDataByName = data => data.sort(getSortByKey('name'));

  areDataAvailable = data => data.some(({ value }) => value !== NO_DATA_AVAILABLE);

  areEventResults = results => !!(results[0] && results[0].event);
}
