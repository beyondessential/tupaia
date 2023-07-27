/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';

import { SupersetApi } from '@tupaia/superset-api';
import { Service } from '../Service';
import { getSupersetApiInstance } from './getSupersetApi';
import { Analytic, AnalyticResults, DataElement } from '../../types';
import { DataServiceMapping, DataServiceMappingEntry } from '../DataServiceMapping';

type PullOptions = {
  dataServiceMapping: DataServiceMapping;
  organisationUnitCode?: string;
  organisationUnitCodes?: string[];
  startDate?: string;
  endDate?: string;
};

export class SupersetService extends Service {
  public async push(): Promise<never> {
    throw new Error('Data push is not supported in SupersetService');
  }

  public async delete(): Promise<never> {
    throw new Error('Data deletion is not supported in SupersetService');
  }

  public async pullAnalytics(
    dataSources: DataElement[],
    options: PullOptions,
  ): Promise<AnalyticResults> {
    const {
      dataServiceMapping,
      startDate,
      endDate,
      organisationUnitCode,
      organisationUnitCodes: inputOrganisationUnitCodes,
    } = options;
    const organisationUnitCodes = organisationUnitCode
      ? [organisationUnitCode]
      : inputOrganisationUnitCodes;

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
          { startDate, endDate, organisationUnitCodes },
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
    options: { startDate?: string; endDate?: string; organisationUnitCodes?: string[] },
  ): Promise<Analytic[]> {
    const { startDate, endDate, organisationUnitCodes } = options;

    const startDateMoment = startDate ? moment(startDate).startOf('day') : undefined;
    const endDateMoment = endDate ? moment(endDate).endOf('day') : undefined;

    const response = await api.chartData(chartId);
    const { data } = response.result[0];

    const results: Analytic[] = [];
    for (const datum of data) {
      const { item_code: itemCode, store_code: storeCode, value, date } = datum;

      if (organisationUnitCodes && organisationUnitCodes.length > 0) {
        if (!organisationUnitCodes.includes(storeCode)) continue; // unneeded data
      }

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

      const dataDateMoment = moment(date);
      if (startDateMoment && dataDateMoment.isBefore(startDateMoment)) continue; // before date range
      if (endDateMoment && dataDateMoment.isAfter(endDateMoment)) continue; // after date range

      results.push({
        dataElement: dataElement.code,
        organisationUnit: storeCode,
        period: dataDateMoment.format('YYYYMMDD'),
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
      const { service_type, config } = mapping;
      if (service_type !== 'superset') continue;
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

  public async pullEvents(): Promise<never> {
    throw new Error('pullEvents is not supported in SupersetService');
  }

  public async pullSyncGroupResults(): Promise<never> {
    throw new Error('pullSyncGroupResults is not supported in SupersetService');
  }
}
