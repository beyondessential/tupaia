/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { getSortByKey } from '@tupaia/utils';
import { buildEventsFromDhisEventAnalytics } from '../builders';

export class EventsPuller {
  constructor(models, translator) {
    this.models = models;
    this.translator = translator;
  }

  /**
   * @protected
   */
  pullEventsForOrganisationUnits = async (api, programCode, options) => {
    const { dataElementCodes = [], organisationUnitCodes, period, startDate, endDate } = options;

    const dataElementSources = await this.models.dataElement.find({
      code: dataElementCodes,
    });
    const dhisElementCodes = dataElementSources.map(({ dataElementCode }) => dataElementCode);

    const orgUnitResults = await api.getEventAnalytics({
      programCode,
      dataElementCodes: dhisElementCodes,
      organisationUnitCodes,
      period,
      startDate,
      endDate,
      dataElementIdScheme: 'code',
    });
    const orgUnitEventAnalytics = await this.translator.translateInboundEventAnalytics(
      orgUnitResults,
      dataElementSources,
    );

    return buildEventsFromDhisEventAnalytics(this.models, orgUnitEventAnalytics, dataElementCodes);
  };

  /**
   * @private
   */
  pullEventsForApi = async (api, programCode, options) => {
    const { organisationUnitCodes: entityCodes, hierarchy } = options;

    if (!entityCodes || entityCodes.length === 0) {
      throw new Error('DHIS event analytics pull requires at least one entity');
    }

    const entities = await this.models.entity.find({ code: entityCodes });
    const organisationUnits = entities.filter(entity => !entity.isTrackedEntity());
    const trackedEntities = entities.filter(entity => entity.isTrackedEntity()); // Tracked entities must be handled differently, see below

    let orgUnitEvents = [];
    if (organisationUnits.length > 0) {
      orgUnitEvents = await this.pullEventsForOrganisationUnits(api, programCode, {
        ...options,
        organisationUnitCodes: organisationUnits.map(organisationUnit => organisationUnit.code),
      });
    }

    let trackedEntityEvents = [];
    if (trackedEntities.length > 0) {
      // Events for tracked entities cannot be fetched directly in DHIS2, instead we must fetch for the parent organisation unit and then
      // we need to filter out the results for the siblings
      if (!hierarchy) {
        throw new Error('Must specify hierarchy when pulling events for tracked entity instances');
      }

      const hierarchyId = (await this.models.entityHierarchy.findOne({ name: hierarchy })).id;
      const parentsOfTrackedEntities = await Promise.all(
        trackedEntities.map(trackedEntity => trackedEntity.getParent(hierarchyId)),
      );
      const parentEvents = await this.pullEventsForOrganisationUnits(api, programCode, {
        ...options,
        organisationUnitCodes: parentsOfTrackedEntities.map(parentEntity => parentEntity.code),
      });
      const trackedEntityCodes = trackedEntities.map(trackedEntity => trackedEntity.code);
      trackedEntityEvents = parentEvents.filter(event =>
        trackedEntityCodes.includes(event.trackedEntityCode),
      );
    }

    const combinedEvents = orgUnitEvents
      .concat(trackedEntityEvents)
      .sort(getSortByKey('eventDate'));

    return combinedEvents;
  };

  /**
   * @public
   */
  pull = async (apis, dataSources, options) => {
    if (dataSources.length > 1) {
      throw new Error('Cannot pull from multiple programs at the same time');
    }

    const [dataSource] = dataSources;
    const { code: programCode } = dataSource;

    const events = [];
    const pullForApi = async api => {
      const newEvents = await this.pullEventsForApi(api, programCode, options);
      events.push(...newEvents);
    };

    await Promise.all(apis.map(pullForApi));
    return events;
  };
}
