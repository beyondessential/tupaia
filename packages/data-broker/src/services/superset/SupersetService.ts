/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';

import { SupersetApi } from '@tupaia/superset-api';
import { Service } from '../Service';
import type { PullOptions as BasePullOptions } from '../Service';
import { getSupersetApiInstance } from './getSupersetApi';
import {
  Analytic,
  AnalyticResults,
  DataBrokerModelRegistry,
  DataElement,
  DataSource,
  DataSourceType,
  EventResults,
  SyncGroupResults,
} from '../../types';
import { DataServiceMapping, DataServiceMappingEntry } from '../DataServiceMapping';

export class SupersetService extends Service {
  private readonly pullers: Record<string, any>;

  public constructor(models: DataBrokerModelRegistry) {
    super(models);
    this.pullers = {
      [this.dataSourceTypes.DATA_ELEMENT]: this.pullAnalytics.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.pullEvents.bind(this),
      [this.dataSourceTypes.SYNC_GROUP]: this.pullSyncGroups.bind(this),
    };
  }

  public async push(): Promise<never> {
    throw new Error('Data push is not supported in SupersetService');
  }

  public async delete(): Promise<never> {
    throw new Error('Data deletion is not supported in SupersetService');
  }

  public async pull(
    dataSources: DataSource[],
    type: DataSourceType,
    options: BasePullOptions,
  ): Promise<AnalyticResults | EventResults | SyncGroupResults> | never {
    const puller = this.pullers[type];
    return puller(dataSources, options);
  }

  public async pullMetadata(): Promise<never> {
    throw new Error('pullMetadata is not supported in SupersetService');
  }

  private async pullAnalytics(
    dataSources: DataElement[],
    options: BasePullOptions,
  ): Promise<AnalyticResults> {
    const { dataServiceMapping } = options;
    let mergedResults: Analytic[] = [];
    for (const [supersetInstanceCode, instanceDataSources] of Object.entries(
      this.groupBySupersetInstanceCode(dataSources, dataServiceMapping),
    )) {
      const supersetInstance = await this.models.supersetInstance.findOne({
        code: supersetInstanceCode,
      });
      if (!supersetInstance)
        throw new Error(`No superset instance found with code "${supersetInstanceCode}"`);
      const api = await getSupersetApiInstance(this.models, supersetInstance);
      for (const [chartId, chartDataSources] of Object.entries(
        this.groupByChartId(instanceDataSources, dataServiceMapping),
      )) {
        const results = await this.pullForApiForChart(
          api,
          chartId,
          chartDataSources,
          dataServiceMapping,
        );
        mergedResults = mergedResults.concat(results);
      }
    }

    return {
      results: mergedResults,
      // TODO: either implement properly in #NOT-521 or remove entirely in #NOT-522
      metadata: { dataElementCodeToName: {} },
    };
  }

  private async pullForApiForChart(
    api: SupersetApi,
    chartId: string,
    dataElements: DataElement[],
    dataServiceMapping: DataServiceMapping,
  ): Promise<Analytic[]> {
    const response = await api.chartData(chartId);
    const { data } = response.result[0];

    const results: Analytic[] = [];
    for (const datum of data) {
      const { item_code: itemCode, store_code: storeCode, value, date } = datum;

      let dataElement = dataElements.find(de => de.code === itemCode);
      if (!dataElement) {
        // Check by supersetItemCode
        const mappingMatchingSupersetItemCode = dataElements
          .map(de => dataServiceMapping.mappingForDataSource(de))
          .find(mapping => mapping && mapping.config.supersetItemCode === itemCode);
        if (mappingMatchingSupersetItemCode) {
          dataElement = mappingMatchingSupersetItemCode.dataSource as DataElement;
        }
      }
      if (!dataElement) continue; // unneeded data

      results.push({
        dataElement: dataElement.code,
        organisationUnit: storeCode,
        period: moment(date).format('YYYYMMDD'),
        value,
      });
    }
    return results;
  }

  private groupBySupersetInstanceCode(
    dataSources: DataElement[],
    dataServiceMapping: DataServiceMapping,
  ): Record<string, DataElement[]> {
    const dataSourcesBySupersetInstanceCode: Record<string, DataElement[]> = {};
    for (const dataSource of dataSources) {
      const mapping = dataServiceMapping.mappingForDataSource(
        dataSource,
      ) as DataServiceMappingEntry;
      const { config } = mapping;
      const { supersetInstanceCode } = config;
      if (!supersetInstanceCode) {
        throw new Error(`Data Element ${dataSource.code} missing supersetInstanceCode`);
      }
      if (!dataSourcesBySupersetInstanceCode[supersetInstanceCode]) {
        dataSourcesBySupersetInstanceCode[supersetInstanceCode] = [];
      }
      dataSourcesBySupersetInstanceCode[supersetInstanceCode].push(dataSource);
    }
    return dataSourcesBySupersetInstanceCode;
  }

  private groupByChartId(
    dataSources: DataElement[],
    dataServiceMapping: DataServiceMapping,
  ): Record<number, DataElement[]> {
    const dataSourcesByChartId: Record<number, DataElement[]> = {};
    for (const dataSource of dataSources) {
      const mapping = dataServiceMapping.mappingForDataSource(
        dataSource,
      ) as DataServiceMappingEntry;
      const { config } = mapping;
      const { supersetChartId } = config;
      if (!supersetChartId) {
        throw new Error(`Data Element ${dataSource.code} missing supersetChartId`);
      }
      if (!dataSourcesByChartId[supersetChartId]) {
        dataSourcesByChartId[supersetChartId] = [];
      }
      dataSourcesByChartId[supersetChartId].push(dataSource);
    }
    return dataSourcesByChartId;
  }

  private async pullEvents() {
    throw new Error('pullEvents is not supported in SupersetService');
  }

  private async pullSyncGroups() {
    throw new Error('pullSyncGroups is not supported in SupersetService');
  }
}
