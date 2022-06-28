/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import type { DhisApi } from '@tupaia/dhis-api';
import { DataElementModel, Event } from '../../../types';
import { buildEventsFromDhisEventAnalytics } from '../buildAnalytics';
import { DhisTranslator } from '../DhisTranslator';
import { DataGroup, DataServiceConfig } from '../types';

export interface PullEventsOptions {
  dataElementCodes?: string[];
  organisationUnitCodes: string[];
  dataServices: DataServiceConfig[];
  period?: string;
  startDate?: string;
  endDate?: string;
}

export class EventsPuller {
  private readonly dataElementModel: DataElementModel;
  protected readonly translator: DhisTranslator;

  public constructor(dataElementModel: DataElementModel, translator: DhisTranslator) {
    this.dataElementModel = dataElementModel;
    this.translator = translator;
  }

  protected pullEventsForApi = async (
    api: DhisApi,
    programCode: string,
    options: PullEventsOptions,
  ) => {
    const { dataElementCodes = [], organisationUnitCodes, period, startDate, endDate } = options;

    const dataElementSources = await this.dataElementModel.find({
      code: dataElementCodes,
    });
    const dhisElementCodes = dataElementSources.map(({ dataElementCode }) => dataElementCode);

    const eventAnalytics = await api.getEventAnalytics({
      programCode,
      dataElementCodes: dhisElementCodes,
      organisationUnitCodes,
      period,
      startDate,
      endDate,
      dataElementIdScheme: 'code',
    });

    const translatedEventAnalytics = await this.translator.translateInboundEventAnalytics(
      eventAnalytics,
      dataElementSources,
    );

    return buildEventsFromDhisEventAnalytics(translatedEventAnalytics, dataElementCodes);
  };

  public pull = async (apis: DhisApi[], dataSources: DataGroup[], options: PullEventsOptions) => {
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
