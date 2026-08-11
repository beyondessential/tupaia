import { uniq } from 'es-toolkit';

import { getSortByKey, getSortByExtractedValue } from '@tupaia/utils';
import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';
import { transformValue } from '/apiV1/dataBuilders/transform';
import { translateEventEntityIdsToNames } from '/apiV1/dataBuilders/helpers/translateEventEntityIdsToNames';

export class DataBuilder {
  static NO_DATA_AVAILABLE = NO_DATA_AVAILABLE;

  /**
   * @param {ModelRegistry} models
   * @param {Aggregator} aggregator
   * @param {DhisApi} dhisApi
   * @param {?Object} config
   * @param {Object} query
   * @param {Entity} [entity]
   * @param {string} [aggregationType]
   */
  constructor(models, aggregator, dhisApi, config, query, entity, aggregationType) {
    this.models = models;
    this.aggregator = aggregator;
    this.dhisApi = dhisApi;
    this.config = config || {};
    this.query = query;
    this.entity = entity;
    this.aggregationType = aggregationType;
  }

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
    aggregationConfig = this.config.aggregationConfig ?? {},
  ) {
    const {
      dataServices,
      aggregations,
      entityAggregation,
      dataSourceEntityFilter,
      filter = {},
    } = this.config;
    const fetchOptions = {
      programCodes: this.getProgramCodesForAnalytics(),
      dataServices,
      entityAggregation,
      dataSourceEntityFilter,
      ...additionalQueryConfig,
    };

    return this.aggregator.fetchAnalytics(dataElementCodes, fetchOptions, this.query, {
      aggregations,
      aggregationConfig,
      aggregationType,
      filter,
    });
  }

  async fetchEvents(additionalQueryConfig, overridenProgramCode) {
    const { programCode, dataServices, entityAggregation, dataSourceEntityFilter } = this.config;
    const { organisationUnitCode, startDate, endDate, trackedEntityInstance, eventId } = this.query;
    const eventsProgramCode = overridenProgramCode || programCode;

    const events = await this.aggregator.fetchEvents(eventsProgramCode, {
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

    if (additionalQueryConfig.entityIdToNameElements) {
      return translateEventEntityIdsToNames(
        this.models,
        events,
        additionalQueryConfig.entityIdToNameElements,
      );
    }

    return events;
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
    const project = await this.models.project.findOne({ code: projectCode });
    return project.entity_hierarchy_id;
  }

  async fetchDescendantsOfType(type) {
    const entityHierarchyId = await this.fetchEntityHierarchyId();
    return this.entity.getDescendantsOfType(entityHierarchyId, type);
  }

  /**
   * Fetch ancestor of type for each organisationUnit in event
   */
  async addAncestorsToEvents(events, ancestorType) {
    const hierarchyId = await this.fetchEntityHierarchyId();
    const allEntityCodes = uniq(events.map(e => e.orgUnit));
    const ancestorDetailsByDescendantCode =
      await this.models.entity.fetchAncestorDetailsByDescendantCode(
        allEntityCodes,
        hierarchyId,
        ancestorType,
      );
    return events.map(event => {
      const { name: ancestorName } = ancestorDetailsByDescendantCode[event.orgUnit];
      return {
        ...event,
        orgUnitAncestor: ancestorName,
      };
    });
  }

  mapOrgUnitCodesToNames = async orgUnitCodes => {
    const orgUnitNames = {};
    if (!orgUnitCodes || orgUnitCodes.length < 1) return orgUnitNames;
    await Promise.all(
      orgUnitCodes.map(async orgUnitCode => {
        orgUnitNames[orgUnitCode] = await transformValue(
          this.models,
          'orgUnitCodeToName',
          orgUnitCode,
        );
      }),
    );
    return orgUnitNames;
  };

  sortEventsByAncestor = events => events.sort(getSortByKey('orgUnitAncestor'));

  sortEventsByDataValue = (events, dataValue) =>
    events.sort(getSortByExtractedValue(e => e.dataValues[dataValue]));

  sortDataByName = data => data.sort(getSortByKey('name'));

  areDataAvailable = data => data.some(({ value }) => value !== NO_DATA_AVAILABLE);

  // Returns true if the results are valid and false otherwise
  validateResults = results => {
    const { dataElementCodes, requireDataForAllElements } = this.config;
    if (!results) return false;

    if (requireDataForAllElements) {
      const allDataElementsInResult = results.map(({ dataElement: de }) => de);
      return dataElementCodes.every(dataElement => allDataElementsInResult.includes(dataElement));
    }
    return true;
  };

  areEventResults = results => !!(results[0] && results[0].event);
}
