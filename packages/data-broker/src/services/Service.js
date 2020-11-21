/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/* eslint no-unused-vars: ["error", { "args": "none" }] */

/**
 * @abstract
 */
export class Service {
  constructor(models) {
    this.models = models;
  }

  get dataSourceTypes() {
    return this.models.dataSource.getTypes();
  }

  /**
   * @abstract
   */
  async push(dataSources, data) {
    throw new Error('Any subclass of Service must implement the "push" method');
  }

  /**
   * @abstract
   */
  async delete(dataSource, data, options) {
    throw new Error('Any subclass of Service must implement the "delete" method');
  }

  /**
   * @abstract
   * @param {any} dataSources
   * @param {string} type - one of DataSource.DATA_SOURCE_TYPES
   * @param {any} options
   */
  async pull(dataSources, type, options) {
    throw new Error('Any subclass of Service must implement the "pull" method');
  }

  /**
   * @abstract
   * @param {any[]} dataSources
   * @param {string} type - one of DataSource.DATA_SOURCE_TYPES
   * @param {{}} options
   * @returns Promise<{Object.<name: string, id: string, code: string>}>
   */
  async pullMetadata(dataSources, type, options) {
    throw new Error('Any subclass of Service must implement the "pullMetadata" method');
  }
}
