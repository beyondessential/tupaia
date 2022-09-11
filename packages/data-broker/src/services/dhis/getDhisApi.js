/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DhisApi } from '@tupaia/dhis-api';
import { createClassExtendingProxy } from '@tupaia/utils';
import { DhisCodeToIdTranslator } from './translators';

const instances = {};

/**
 * @param {{}} models
 * @param {DataSource} dataSource
 * @param {DataServiceMapping} dataServiceMapping
 * @return {Promise<DhisApi>}
 */
export const getApiForDataSource = async (models, dataSource, dataServiceMapping) => {
  const [api] = await getApisForDataSources(models, [dataSource], dataServiceMapping);
  return api;
};

/**
 * @param {{}} models
 * @param {DataSource[]} dataSources
 * @param {string[]} entityCodes
 * @param {DataServiceMapping} dataServiceMapping
 * @return {Promise<DhisApi[]>}
 */
export const getApisForDataSources = async (models, dataSources, dataServiceMapping) => {
  const apis = new Set();
  for (const dataSource of dataSources) {
    const mapping = dataServiceMapping.mappingForDataSource(dataSource);
    if (!mapping) throw new Error(`No mapping for Data Source ${dataSource.code}`);
    const { config } = mapping;
    const { dhisInstanceCode } = config;
    const dhisInstance = await getDhisInstanceByCode(models, dhisInstanceCode);
    apis.add(await getDhisApiInstance(models, dhisInstance));
  }
  return Array.from(apis);
};

/**
 * @param {{}} models
 * @param {string} serverName
 * @return {Promise<DhisApi>}
 */
export const getApiFromServerName = async (models, serverName) => {
  const dhisInstance = await models.dhisInstance.findOne({ code: serverName });
  if (!dhisInstance) {
    throw new Error(`Could not find DHIS Instance with serverName '${serverName}'`);
  }
  return getDhisApiInstance(models, dhisInstance);
};

/**
 * @param {} models
 * @param {string} dhisInstanceCode
 * @return {Promise<DhisInstance>}
 */
const getDhisInstanceByCode = async (models, dhisInstanceCode) => {
  if (!dhisInstanceCode) {
    throw new Error(`No DHIS instance code specified`);
  }
  const dhisInstance = await models.dhisInstance.findOne({ code: dhisInstanceCode });
  if (!dhisInstance) {
    throw new Error(`No DHIS instance found with code ${dhisInstanceCode}`);
  }
  return dhisInstance;
};

/**
 * @param {} models
 * @param {DhisInstance} dhisInstance
 * @return {Promise<DhisApi>}
 */
const getDhisApiInstance = async (models, dhisInstance) => {
  const isProduction = process.env.IS_PRODUCTION_ENVIRONMENT === 'true';

  const { config, readonly: serverReadOnly, code: serverName } = dhisInstance;

  const serverUrl = isProduction ? config.productionUrl : config.devUrl;

  if (!serverName) {
    throw new Error('No serverName set on dhis instance');
  }
  if (!serverUrl) {
    throw new Error('No serverUrl set on dhis instance');
  }

  if (!instances[serverName]) {
    // Having a subclass of DhisApi causes some sort of circular dependency issue here, so we
    // have to extend it using an object proxy, which intercepts overridden method calls and passes
    // the rest through.
    const api = new DhisApi(serverName, serverUrl, serverReadOnly);
    const apiExtension = new DhisCodeToIdTranslator(models, api);
    instances[serverName] = createClassExtendingProxy(api, apiExtension);
  }

  return instances[serverName];
};
