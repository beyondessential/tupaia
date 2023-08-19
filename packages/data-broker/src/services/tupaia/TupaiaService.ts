/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type { TupaiaDataApi } from '@tupaia/data-api';
import { reduceToDictionary } from '@tupaia/utils';
import { DataBrokerModelRegistry, DataElement, DataGroup } from '../../types';
import { Service } from '../Service';
import { translateOptionsForApi } from './translation';

type PullAnalyticsOptions = {
  organisationUnitCodes?: string[];
  period?: string;
  startDate?: string;
  endDate?: string;
  includeOptions?: boolean;
};

type PullEventsOptions = {
  organisationUnitCodes?: string[];
  period?: string;
  startDate?: string;
  endDate?: string;
};

// used for internal Tupaia apis: TupaiaDataApi and IndicatorApi
export class TupaiaService extends Service {
  private readonly api: TupaiaDataApi;

  public constructor(models: DataBrokerModelRegistry, api: TupaiaDataApi) {
    super(models);

    this.api = api;
  }

  public async push(): Promise<never> {
    throw new Error('Data push is not supported in TupaiaService');
  }

  public async delete(): Promise<never> {
    throw new Error('Data deletion is not supported in TupaiaService');
  }

  public async pullAnalytics(dataElements: DataElement[], options: PullAnalyticsOptions) {
    const dataElementCodes = dataElements.map(({ code }) => code);
    const { analytics, numAggregationsProcessed } = await this.api.fetchAnalytics({
      ...translateOptionsForApi(options),
      dataElementCodes,
    });
    const dataElementMetadata = await this.pullDataElementMetadata(dataElements, options);

    return {
      results: analytics,
      metadata: {
        dataElementCodeToName: reduceToDictionary(dataElementMetadata, 'code', 'name'),
      },
      numAggregationsProcessed,
    };
  }

  public async pullEvents(dataGroups: DataGroup[], options: PullEventsOptions) {
    if (dataGroups.length > 1) {
      throw new Error('Cannot pull from multiple programs at the same time');
    }
    const [dataGroup] = dataGroups;
    const { code: dataGroupCode } = dataGroup;

    return this.api.fetchEvents({ ...translateOptionsForApi(options), dataGroupCode });
  }

  public async pullSyncGroupResults(): Promise<never> {
    throw new Error('pullSyncGroupResults is not supported in TupaiaService');
  }

  public async pullDataElementMetadata(
    dataElements: DataElement[],
    options: { includeOptions?: boolean },
  ) {
    const { includeOptions } = options;
    const dataElementCodes = dataElements.map(({ code }) => code);
    return this.api.fetchDataElements(dataElementCodes, { includeOptions });
  }

  public async pullDataGroupMetadata(dataGroup: DataGroup, options: { includeOptions?: boolean }) {
    const { includeOptions } = options;
    const { code: dataGroupCode } = dataGroup;
    const dataElementDataSources = await this.models.dataGroup.getDataElementsInDataGroup(
      dataGroupCode,
    );
    const dataElementCodes = dataElementDataSources.map(({ code }) => code);
    return this.api.fetchDataGroup(dataGroupCode, dataElementCodes, { includeOptions });
  }
}
