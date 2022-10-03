/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/* eslint no-unused-vars: ["error", { "args": "none" }] */

import { DATA_SOURCE_TYPES } from '../utils';

/**
 * @abstract
 */
export class Service {
  constructor(models) {
    this.models = models;
  }

  get dataSourceTypes() {
    return DATA_SOURCE_TYPES;
  }

  /**
   * @abstract
   * @param {any} dataSources
   * @param {any} data
   * @param {{ dataServiceMapping: DataServiceMapping, type: 'dataElement'|'dataGroup'}} options
   */
  async push(dataSources, data, options) {
    throw new Error('Any subclass of Service must implement the "push" method');
  }

  /**
   * @abstract
   * @param {any} dataSources
   * @param {any} data
   * @param {{ dataServiceMapping: DataServiceMapping, type: 'dataElement'|'dataGroup', serverName?: string}} options
   */
  async delete(dataSource, data, options) {
    throw new Error('Any subclass of Service must implement the "delete" method');
  }

  /**
   * @abstract
   * @param {any} dataSources
   * @param {string} type - one of DataSource.DATA_SOURCE_TYPES
   * @param {{ dataServiceMapping: DataServiceMapping, organisationUnitCode?: string, organisationUnitCodes?: string[], dataServices?: any, detectDataServices?: boolean }} options
   */
  async pull(dataSources, type, options) {
    throw new Error('Any subclass of Service must implement the "pull" method');
  }

  /**
   * @abstract
   * @param {any[]} dataSources
   * @param {string} type - one of DataSource.DATA_SOURCE_TYPES
   * @param {{ dataServiceMapping: DataServiceMapping, organisationUnitCode?: string, organisationUnitCodes?: string[], dataServices?: any, detectDataServices?: boolean }} options
   * @returns Promise<{Object.<name: string, id: string, code: string>}>
   */
  async pullMetadata(dataSources, type, options) {
    throw new Error('Any subclass of Service must implement the "pullMetadata" method');
  }
}
