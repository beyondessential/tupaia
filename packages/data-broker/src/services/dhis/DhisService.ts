/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type { DhisApi } from '@tupaia/dhis-api';
import {
  AnalyticResults,
  DataBrokerModelRegistry,
  DataElementMetadata,
  DataSourceType,
  DataValue,
  Diagnostics,
  Event,
  EventResults,
  OutboundEvent,
} from '../../types';
import { Service } from '../Service';
import { DhisTranslator } from './DhisTranslator';
import { getDhisApiInstance } from './getDhisApiInstance';
import {
  AnalyticsPuller,
  DataElementsMetadataPuller,
  DeprecatedEventsPuller,
  EventsPuller,
  PullAnalyticsOptions,
  PullEventsOptions,
} from './pullers';
import { DataElement, DataGroup, DataServiceConfig, DataSource } from './types';

const DEFAULT_DATA_SERVICE = { isDataRegional: true };
const DEFAULT_DATA_SERVICES = [DEFAULT_DATA_SERVICE];

type PushOptions = {
  type: DataSourceType;
};

type PullOptions = Partial<{
  organisationUnitCode: string;
  organisationUnitCodes: string[];
  dataServices: DataServiceConfig[];
  detectDataServices: boolean;
  useDeprecatedApi: boolean;
}>;

type DeleteOptions = Partial<{
  serverName: string;
  type: DataSourceType;
}>;

type PullMetadataOptions = Partial<{
  organisationUnitCode: string;
  dataServices: DataServiceConfig[];
  additionalFields: string[];
  includeOptions: boolean;
}>;

interface DeleteEventData {
  dhisReference: string;
}

export interface PushResults {
  diagnostics: Diagnostics;
  serverName: string;
}

type Pusher =
  | ((api: DhisApi, dataValues: DataValue[], dataSources: DataElement[]) => Promise<Diagnostics>)
  | ((api: DhisApi, events: OutboundEvent[]) => Promise<Diagnostics>);

type Deleter =
  | ((api: DhisApi, dataValue: DataValue, dataSource: DataElement) => Promise<Diagnostics>)
  | ((api: DhisApi, data: DeleteEventData) => Promise<Diagnostics>);

type Puller =
  | ((
      apis: DhisApi[],
      dataSources: DataElement[],
      options: PullAnalyticsOptions,
    ) => Promise<AnalyticResults>)
  | ((
      apis: DhisApi[],
      dataSources: DataGroup[],
      options: PullEventsOptions,
    ) => Promise<EventResults>);

type MetadataPuller = (
  api: DhisApi,
  dataSources: DataElement[],
  options: PullMetadataOptions,
) => Promise<DataElementMetadata[]>;

export class DhisService extends Service {
  private readonly translator: DhisTranslator;
  private readonly dataElementsMetadataPuller: DataElementsMetadataPuller;
  private readonly analyticsPuller: AnalyticsPuller;
  private readonly eventsPuller: EventsPuller;
  private readonly deprecatedEventsPuller: DeprecatedEventsPuller;
  private readonly pushers: Record<string, Pusher>;
  private readonly deleters: Record<string, Deleter>;
  private readonly pullers: Record<string, Puller>;
  private readonly metadataPullers: Record<string, MetadataPuller>;

  public constructor(models: DataBrokerModelRegistry) {
    super(models);

    this.translator = new DhisTranslator(this.models);
    this.dataElementsMetadataPuller = new DataElementsMetadataPuller(
      this.models.dataElement,
      this.translator,
    );
    this.analyticsPuller = new AnalyticsPuller(
      this.models.dataElement,
      this.translator,
      this.dataElementsMetadataPuller,
    );
    this.eventsPuller = new EventsPuller(this.models.dataElement, this.translator);
    this.deprecatedEventsPuller = new DeprecatedEventsPuller(
      this.models.dataElement,
      this.translator,
    );
    this.pushers = this.getPushers();
    this.deleters = this.getDeleters();
    this.pullers = this.getPullers();
    this.metadataPullers = this.getMetadataPullers();
  }

  private getPushers() {
    return {
      [this.dataSourceTypes.DATA_ELEMENT]: this.pushAggregateData.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.pushEvents.bind(this),
    };
  }

  private getDeleters() {
    return {
      [this.dataSourceTypes.DATA_ELEMENT]: this.deleteAggregateData.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.deleteEvent.bind(this),
    };
  }

  private getPullers() {
    return {
      [this.dataSourceTypes.DATA_ELEMENT]: this.analyticsPuller.pull.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.eventsPuller.pull.bind(this),
      [`${this.dataSourceTypes.DATA_GROUP}_deprecated`]: this.deprecatedEventsPuller.pull.bind(
        this,
      ),
    };
  }

  private getMetadataPullers() {
    return {
      [this.dataSourceTypes.DATA_ELEMENT]: this.dataElementsMetadataPuller.pull.bind(this),
    };
  }

  private getApiForValue = (dataSource: DataSource, dataValue: DataValue | DeleteEventData) => {
    const { isDataRegional } = dataSource.config;
    const { orgUnit: entityCode } = dataValue as Partial<DataValue>;
    return getDhisApiInstance({ entityCode, isDataRegional }, this.models);
  };

  private validatePushData(dataSources: DataSource[], dataValues: DataValue[]) {
    const { serverName } = this.getApiForValue(dataSources[0], dataValues[0]);
    if (
      dataSources.some(
        (dataSource, i) => this.getApiForValue(dataSource, dataValues[i]).serverName !== serverName,
      )
    ) {
      throw new Error('All data being pushed must be for the same DHIS2 instance');
    }
  }

  public async push(
    dataSources: DataElement[],
    data: DataValue | DataValue[],
    { type }: PushOptions,
  ): Promise<PushResults>;
  public async push(
    dataSources: DataGroup[],
    data: Event | Event[],
    { type }: PushOptions,
  ): Promise<PushResults>;
  public async push(
    dataSources: DataSource[],
    data: unknown,
    { type }: PushOptions,
  ): Promise<PushResults> {
    const pushData = this.pushers[type]; // all are of the same type
    const dataValues = Array.isArray(data) ? data : [data];
    this.validatePushData(dataSources, dataValues);
    const api = this.getApiForValue(dataSources[0], dataValues[0]); // all are for the same instance
    const diagnostics = await pushData(api, dataValues, dataSources as any);
    return { diagnostics, serverName: api.getServerName() };
  }

  private async pushAggregateData(
    api: DhisApi,
    dataValues: DataValue[],
    dataSources: DataElement[],
  ) {
    const translatedDataValues = await this.translator.translateOutboundDataValues(
      api,
      dataValues,
      dataSources,
    );
    return api.postDataValueSets(translatedDataValues);
  }

  private async pushEvents(api: DhisApi, events: OutboundEvent[]) {
    const translatedEvents = await Promise.all(
      events.map(event => this.translator.translateOutboundEvent(api, event)),
    );
    return api.postEvents(translatedEvents);
  }

  public async delete(
    dataSource: DataElement,
    data: DataValue,
    options?: DeleteOptions,
  ): Promise<Diagnostics>;
  public async delete(
    dataSource: DataGroup,
    data: DeleteEventData,
    options?: DeleteOptions,
  ): Promise<Diagnostics>;
  public async delete(
    dataSource: DataSource,
    data: DataValue | DeleteEventData,
    { serverName, type }: DeleteOptions = {},
  ): Promise<Diagnostics> {
    const api = serverName
      ? getDhisApiInstance({ serverName }, this.models)
      : this.getApiForValue(dataSource, data);
    const deleteData = this.deleters[type];
    return deleteData(api, data as any, dataSource as any);
  }

  private async deleteAggregateData(api: DhisApi, dataValue: DataValue, dataSource: DataElement) {
    const [translatedDataValue] = await this.translator.translateOutboundDataValues(
      api,
      [dataValue],
      [dataSource],
    );
    return api.deleteDataValue(translatedDataValue);
  }

  private deleteEvent = async (api: DhisApi, data: DeleteEventData) =>
    api.deleteEvent(data.dhisReference);

  public async pull(
    dataSources: DataElement[],
    type: 'dataElement',
    options?: PullAnalyticsOptions,
  ): Promise<AnalyticResults>;
  public async pull(
    dataSources: DataGroup[],
    type: 'dataGroup',
    options?: PullEventsOptions,
  ): Promise<EventResults>;
  public async pull(dataSources: DataSource[], type: DataSourceType, options: PullOptions = {}) {
    const {
      organisationUnitCode,
      organisationUnitCodes,
      dataServices: inputDataServices = DEFAULT_DATA_SERVICES,
      detectDataServices = false,
    } = options;
    let dataServices = inputDataServices;
    // TODO remove the `detectDataServices` flag after
    // https://linear.app/bes/issue/MEL-481/detect-data-services-in-the-data-broker-level
    if (detectDataServices) {
      dataServices = dataSources.map(ds => {
        const { isDataRegional = true } = ds.config;
        return { isDataRegional };
      });
    }

    const entityCodes = organisationUnitCodes || [organisationUnitCode as string];

    const { useDeprecatedApi = false } = options;
    const pullerKey = `${type}${useDeprecatedApi ? '_deprecated' : ''}`;

    const pullData = this.pullers[pullerKey];

    const apis: Set<DhisApi> = new Set();
    dataServices.forEach(({ isDataRegional }) => {
      apis.add(getDhisApiInstance({ entityCodes, isDataRegional }, this.models));
    });

    return pullData(Array.from(apis), dataSources as any, options as any);
  }

  public async pullMetadata(
    dataSources: DataElement[],
    type: 'dataElement',
    options: PullMetadataOptions,
  ): Promise<DataElementMetadata[]>;
  public async pullMetadata(
    dataSources: DataSource[],
    type: DataSourceType,
    options: PullMetadataOptions,
  ) {
    const { organisationUnitCode: entityCode, dataServices = DEFAULT_DATA_SERVICES } = options;
    const pullMetadata = this.metadataPullers[type];
    const apis = dataServices.map(({ isDataRegional }) =>
      getDhisApiInstance({ entityCode, isDataRegional }, this.models),
    );

    const results: DataElementMetadata[] = [];
    const pullForApi = async (api: DhisApi) => {
      const newResults = await pullMetadata(api, dataSources as any, options as any);
      results.push(...newResults);
    };
    await Promise.all(apis.map(pullForApi));

    return results;
  }
}
