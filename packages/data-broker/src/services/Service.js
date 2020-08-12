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
  // eslint-disable-next-line class-methods-use-this
  async push() {
    throw new Error('Any subclass of Service must implement the "push" method');
  }

  /**
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this
  async delete() {
    throw new Error('Any subclass of Service must implement the "delete" method');
  }

  /**
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this
  async pull() {
    throw new Error('Any subclass of Service must implement the "pull" method');
  }

  /**
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this
  async pullMetadata() {
    throw new Error('Any subclass of Service must implement the "pullMetadata" method');
  }
}
