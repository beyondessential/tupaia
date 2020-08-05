/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import { getSortByKey, getUniqueEntries } from '@tupaia/utils';

import { Project, Entity } from '/models';
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
    const { dataServices, entityAggregation, dataSourceEntityFilter, filter = {} } = this.config;
    const fetchOptions = {
      programCodes: this.getProgramCodesForAnalytics(),
      dataServices,
      entityAggregation,
      dataSourceEntityFilter,
      ...additionalQueryConfig,
    };

    return this.aggregator.fetchAnalytics(dataElementCodes, fetchOptions, this.query, {
      aggregationConfig,
      aggregationType,
      filter,
    });
  }

  async fetchEvents(additionalQueryConfig, overridenProgramCode) {
    const { programCode, dataServices, entityAggregation, dataSourceEntityFilter } = this.config;
    const { organisationUnitCode, startDate, endDate, trackedEntityInstance, eventId } = this.query;
    const eventsProgramCode = overridenProgramCode || programCode;

    return this.aggregator.fetchEvents(eventsProgramCode, {
      dataServices,
      entityAggregation,
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

  async fetchDataGroup(code) {
    const { dataServices } = this.config;
    const { organisationUnitCode } = this.query;

    return this.aggregator.fetchDataGroup(code, {
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

  /**
   * Fetch ancestor of type for each organisationUnit in event and sort alphabetically
   */
  async sortEventsByAncestor(events, ancestorType) {
    const hierarchyId = await this.fetchEntityHierarchyId();
    const allEntityCodes = getUniqueEntries(events.map(e => e.orgUnit));
    const allEntities = await Entity.find({ code: allEntityCodes });
    const allAncestors = await Promise.all(
      await allEntities.map(entity => entity.getAncestorOfType(ancestorType, hierarchyId)),
    );
    const entityCodeToAncestor = {};
    allEntities.forEach((entity, index) => {
      entityCodeToAncestor[entity.code] = allAncestors[index].code;
    });
    const mappedEvents = events.map(event => {
      const ancestorCode = entityCodeToAncestor[event.orgUnit];
      const sortName = `${ancestorCode}_${event.orgUnitName}`;
      return {
        ...event,
        orgUnitAncestor: ancestorCode,
        sortName,
      };
    });
    return mappedEvents.sort(getSortByKey('sortName')).map(({ sortName, ...event }) => event);
  }

  sortDataByName = data => data.sort(getSortByKey('name'));

  areDataAvailable = data => data.some(({ value }) => value !== NO_DATA_AVAILABLE);

  areEventResults = results => !!(results[0] && results[0].event);
}
