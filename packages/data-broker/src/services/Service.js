/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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
  async push() {
    throw new Error('Any subclass of Service must implement the "push" method');
  }

  /**
   * @abstract
   */
  async delete() {
    throw new Error('Any subclass of Service must implement the "delete" method');
  }

  /**
   * @abstract
   * @param {} dataSources
   * @param string type - one of DataSource.DATA_SOURCE_TYPES
   * @param {} options
   */
  async pull(dataSources, type, options = {}) {
    throw new Error('Any subclass of Service must implement the "pull" method');
  }

  /**
   * @abstract
   * @param [] dataSources
   * @param string type - one of DataSource.DATA_SOURCE_TYPES
   * @returns Promise<{Object.<name: string, id: string, code: string>}>
   */
  pullMetadata(dataSources, type) {
    throw new Error('Any subclass of Service must implement the "pullMetadata" method');
  }
}
