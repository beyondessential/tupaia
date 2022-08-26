/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import moment from 'moment';
import { Service } from '../Service';
import { getSupersetApiInstance } from './getSupersetApi';

export class SupersetService extends Service {
  /**
   * @param {ModelRegistry} models
   */
  constructor(models) {
    super(models);
    this.pullers = {
      [this.dataSourceTypes.DATA_ELEMENT]: this.pullAnalytics.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.pullEvents.bind(this),
      [this.dataSourceTypes.SYNC_GROUP]: this.pullSyncGroups.bind(this),
    };
  }

  async push() {
    throw new Error('Data push is not supported in SupersetService');
  }

  async delete() {
    throw new Error('Data deletion is not supported in SupersetService');
  }

  async pull(dataSources, type, options) {
    const puller = this.pullers[type];
    return puller(dataSources, options);
  }

  async pullMetadata() {
    throw new Error('pullMetadata is not supported in SupersetService');
  }

  /**
   * @param {DataElement[]} dataSources
   * @param {} options
   * @private
   */
  async pullAnalytics(dataSources, options) {
    let mergedResults = [];
    for (const [supersetInstanceCode, instanceDataSources] of Object.entries(
      this.groupBySupersetInstanceCode(dataSources),
    )) {
      const supersetInstance = await this.models.supersetInstance.findOne({
        code: supersetInstanceCode,
      });
      if (!supersetInstance)
        throw new Error(`No superset instance found with code "${supersetInstanceCode}"`);
      const api = await getSupersetApiInstance(this.models, supersetInstance);
      for (const [chartId, chartDataSources] of Object.entries(
        this.groupByChartId(instanceDataSources),
      )) {
        const results = await this.pullForApiForChart(api, chartId, chartDataSources);
        mergedResults = mergedResults.concat(results);
      }
    }

    return {
      results: mergedResults,
      // TODO: either implement properly in #NOT-521 or remove entirely in #NOT-522
      metadata: { dataElementCodeToName: {} },
    };
  }

  /**
   * @param {SupersetApi} api
   * @param {string} chartId
   * @param {DataElement[]} dataElements
   * @return {Promise<Object[]>} analytic results
   * @private
   */
  async pullForApiForChart(api, chartId, dataElements) {
    const response = await api.chartData(chartId);
    const { data } = response.result[0];

    const results = [];
    for (const datum of data) {
      const { item_code: itemCode, store_code: storeCode, value, date } = datum;

      const dataElement = dataElements.find(
        de => de.code === itemCode || de.config.supersetItemCode === itemCode,
      );
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

  /**
   * @param {DataElement[]} dataSources
   * @return {Object}
   */
  groupBySupersetInstanceCode(dataSources) {
    const dataSourcesBySupersetInstanceCode = {};
    for (const dataSource of dataSources) {
      const { config } = dataSource;
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

  /**
   * @param {DataElement[]} dataSources
   * @return {Object}
   */
  groupByChartId(dataSources) {
    const dataSourcesByChartId = {};
    for (const dataSource of dataSources) {
      const { config } = dataSource;
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

  /**
   * @private
   */
  async pullEvents() {
    throw new Error('pullEvents is not supported in SupersetService');
  }

  /**
   * @private
   */
  async pullSyncGroups() {
    throw new Error('pullSyncGroups is not supported in SupersetService');
  }
}
