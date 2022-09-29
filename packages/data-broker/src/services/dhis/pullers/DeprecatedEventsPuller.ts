/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import type { DhisApi } from '@tupaia/dhis-api';
import type { PullOptions as BasePullOptions } from '../../Service';
import { DataGroup } from '../types';
import { DataBrokerModelRegistry, Event } from '../../../types';
import { DhisTranslator } from '../translators';

type PullOptions = BasePullOptions &
  Partial<{
    organisationUnitCodes: string[];
    orgUnitIdScheme: 'uid' | 'code';
    startDate: string;
    endDate: string;
    eventId: string;
    trackedEntityInstance: string;
  }>;

/**
 * This is a deprecated puller which invokes a slow DHIS2 api ('/events')
 * and returns an obsolete data structure (equivalent to the raw DHIS2 events).
 * It is invoked using the `options.useDeprecatedApi` flag
 *
 * TODO Delete this puller as soon as all its past consumers have migrated over to
 * the new (non-deprecated) method
 */
export class DeprecatedEventsPuller {
  private readonly models: DataBrokerModelRegistry;
  protected readonly translator: DhisTranslator;

  constructor(models: DataBrokerModelRegistry, translator: DhisTranslator) {
    this.models = models;
    this.translator = translator;
  }

  protected pullEventsForApi = async (api: DhisApi, programCode: string, options: PullOptions) => {
    const {
      organisationUnitCodes = [],
      orgUnitIdScheme,
      startDate,
      endDate,
      eventId,
      trackedEntityInstance,
    } = options;

    const events = await api.getEvents({
      programCode,
      dataElementIdScheme: 'code',
      organisationUnitCode: organisationUnitCodes[0],
      dataValueFormat: 'object',
      orgUnitIdScheme,
      startDate,
      endDate,
      eventId,
      trackedEntityInstance,
    } as Parameters<DhisApi['getEvents']>[0]);

    return this.translator.translateInboundEvents(events, programCode);
  };

  public pull = async (apis: DhisApi[], dataSources: DataGroup[], options: PullOptions) => {
    if (dataSources.length > 1) {
      throw new Error('Cannot pull from multiple programs at the same time');
    }
    const [dataSource] = dataSources;
    const { code: programCode } = dataSource;

    const events: Event[] = [];
    const pullForApi = async (api: DhisApi) => {
      const newEvents = await this.pullEventsForApi(api, programCode, options);
      events.push(...newEvents);
    };

    await Promise.all(apis.map(pullForApi));
    return events;
  };
}
