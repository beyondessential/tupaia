/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type { DhisApi } from '@tupaia/dhis-api';
import { getApiForDataSource, getApiFromServerName, getApisForDataSources } from './getDhisApi';
import {
  AnalyticResults,
  DataBrokerModelRegistry,
  DataElementMetadata,
  DataGroupMetadata,
  DataSourceType,
  DataValue,
  Diagnostics,
  EventResults,
  OutboundEvent,
} from '../../types';
import type {
  PullMetadataOptions as BasePullMetadataOptions,
  PullOptions as BasePullOptions,
  PushOptions as BasePushOptions,
  DeleteOptions as BaseDeleteOptions,
} from '../Service';
import { Service } from '../Service';
import { DhisTranslator } from './translators';
import {
  AnalyticsPuller,
  DataElementsMetadataPuller,
  DataGroupMetadataPuller,
  DeprecatedEventsPuller,
  EventsPuller,
  PullAnalyticsOptions,
  PullDataElementsOptions,
  PullDataGroupsOptions,
  PullEventsOptions,
} from './pullers';
import { DataElement, DataGroup, DataSource } from './types';
import { DataServiceMapping } from '../DataServiceMapping';

type DataElementPushOptions = BasePushOptions & {
  type: 'dataElement';
};
type DataGroupPushOptions = BasePushOptions & {
  type: 'dataGroup';
};

type PullOptions = BasePullOptions &
  Partial<{
    organisationUnitCode: string;
    organisationUnitCodes: string[];
    detectDataServices: boolean;
    useDeprecatedApi: boolean;
  }>;

type DeleteOptions = BaseDeleteOptions & {
  serverName?: string;
};

export type PullMetadataOptions = BasePullMetadataOptions &
  Partial<{
    organisationUnitCode: string;
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

type MetadataPuller =
  | ((
      api: DhisApi,
      dataSources: DataElement[],
      options: PullDataElementsOptions,
    ) => Promise<DataElementMetadata[]>)
  | ((
      api: DhisApi,
      dataSources: DataGroup[],
      options: PullDataGroupsOptions,
    ) => Promise<DataGroupMetadata[]>);

type MetadataMerger =
  | ((results: DataElementMetadata[]) => DataElementMetadata[])
  | ((results: DataGroupMetadata[]) => DataGroupMetadata);

export class DhisService extends Service {
  private readonly translator: DhisTranslator;
  private readonly dataElementsMetadataPuller: DataElementsMetadataPuller;
  private readonly dataGroupMetadataPuller: DataGroupMetadataPuller;

  private readonly analyticsPuller: AnalyticsPuller;
  private readonly eventsPuller: EventsPuller;
  private readonly deprecatedEventsPuller: DeprecatedEventsPuller;
  private readonly pushers: Record<string, Pusher>;
  private readonly deleters: Record<string, Deleter>;
  private readonly pullers: Record<string, Puller>;
  private readonly metadataPullers: Record<string, MetadataPuller>;
  private readonly metadataMergers: Record<string, MetadataMerger>;

  public constructor(models: DataBrokerModelRegistry) {
    super(models);

    this.translator = new DhisTranslator(this.models);
    this.dataElementsMetadataPuller = new DataElementsMetadataPuller(
      this.models.dataElement,
      this.translator,
    );
    this.dataGroupMetadataPuller = new DataGroupMetadataPuller(
      this.models.dataGroup,
      this.translator,
    );
    this.analyticsPuller = new AnalyticsPuller(
      this.models,
      this.translator,
      this.dataElementsMetadataPuller,
    );
    this.eventsPuller = new EventsPuller(this.models, this.translator);
    this.deprecatedEventsPuller = new DeprecatedEventsPuller(this.models, this.translator);
    this.pushers = this.getPushers();
    this.deleters = this.getDeleters();
    this.pullers = this.getPullers();
    this.metadataPullers = this.getMetadataPullers();
    this.metadataMergers = this.getMetadataMergers();
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
      [this.dataSourceTypes.DATA_GROUP]: this.dataGroupMetadataPuller.pull.bind(this),
    };
  }

  private getMetadataMergers() {
    return {
      [this.dataSourceTypes.DATA_ELEMENT]: (results: DataElementMetadata[]) =>
        results.reduce(
          (existingResults, result) => existingResults.concat(result),
          [] as DataElementMetadata[],
        ),
      [this.dataSourceTypes.DATA_GROUP]: (results: DataGroupMetadata[]) => results[0],
    };
  }

  private async validatePushData(
    dataSources: DataSource[],
    dataValues: DataValue[],
    dataServiceMapping: DataServiceMapping,
  ) {
    const { serverName } = await getApiForDataSource(
      this.models,
      dataSources[0],
      dataServiceMapping,
    );
    for (let i = 0; i < dataSources.length; i++) {
      const { serverName: otherServerName } = await getApiForDataSource(
        this.models,
        dataSources[i],
        dataServiceMapping,
      );
      if (otherServerName !== serverName) {
        throw new Error(`All data being pushed must be for the same DHIS2 instance`);
      }
    }
  }

  public async push(
    dataSources: DataElement[],
    data: DataValue | DataValue[],
    options: DataElementPushOptions,
  ): Promise<PushResults>;
  public async push(
    dataSources: DataGroup[],
    data: OutboundEvent | OutboundEvent[],
    options: DataGroupPushOptions,
  ): Promise<PushResults>;
  public async push(
    dataSources: DataSource[],
    data: unknown,
    options: BasePushOptions,
  ): Promise<PushResults> {
    const { type, dataServiceMapping } = options;
    const pushData = this.pushers[type]; // all are of the same type
    const dataValues = Array.isArray(data) ? data : [data];
    await this.validatePushData(dataSources, dataValues, dataServiceMapping);
    const api = await getApiForDataSource(this.models, dataSources[0], dataServiceMapping); // all are for the same instance
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
    options: DeleteOptions,
  ): Promise<Diagnostics>;
  public async delete(
    dataSource: DataGroup,
    data: DeleteEventData,
    options: DeleteOptions,
  ): Promise<Diagnostics>;
  public async delete(
    dataSource: DataSource,
    data: DataValue | DeleteEventData,
    options: DeleteOptions,
  ): Promise<Diagnostics> {
    const { serverName, type, dataServiceMapping } = options;
    let api: DhisApi;
    if (serverName) {
      api = await getApiFromServerName(this.models, serverName);
    } else {
      api = await getApiForDataSource(this.models, dataSource, dataServiceMapping);
    }
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
    options: PullAnalyticsOptions,
  ): Promise<AnalyticResults>;
  public async pull(
    dataSources: DataGroup[],
    type: 'dataGroup',
    options: PullEventsOptions,
  ): Promise<EventResults>;
  public async pull(dataSources: DataSource[], type: DataSourceType, options: PullOptions) {
    const { dataServiceMapping, useDeprecatedApi = false } = options;
    const apis = await getApisForDataSources(this.models, dataSources, dataServiceMapping);
    const pullerKey = `${type}${useDeprecatedApi ? '_deprecated' : ''}`;

    const pullData = this.pullers[pullerKey];
    return pullData(apis, dataSources as any, options as any);
  }

  public async pullMetadata(
    dataSources: DataElement[],
    type: 'dataElement',
    options: PullDataElementsOptions,
  ): Promise<DataElementMetadata[]>;
  public async pullMetadata(
    dataSources: DataGroup[],
    type: 'dataGroup',
    options: PullDataGroupsOptions,
  ): Promise<DataGroupMetadata>;
  public async pullMetadata(
    dataSources: DataSource[],
    type: DataSourceType,
    options: PullMetadataOptions,
  ) {
    const { dataServiceMapping } = options;
    const apis: DhisApi[] = await getApisForDataSources(
      this.models,
      dataSources,
      dataServiceMapping,
    );
    const puller = this.metadataPullers[type];

    const results: DataElementMetadata[] | DataGroupMetadata[] = [];
    const pullForApi = async (api: DhisApi) => {
      const newResults = await puller(api, dataSources as any, options as any);
      results.push(...newResults);
    };
    await Promise.all(apis.map(pullForApi));

    const mergeMetadata = this.metadataMergers[type];
    return mergeMetadata(results);
  }
}
