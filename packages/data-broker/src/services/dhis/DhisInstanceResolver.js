/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { legacy_getDhisServerName } from '@tupaia/utils';

export class DhisInstanceResolver {
  constructor(models) {
    this.models = models;
  }

  /**
   * Find the DhisInstance to use. DhisInstanceResolver uses the [Standard Way], which is to have a
   * DHIS instance marked against the DataSource. Otherwise, the DataSource might specify entityBasedDhisResolution,
   * which then uses the provided entity code(s) to find the actual DhisInstance to use.
   *
   * @param {string|undefined} dataSourceDhisInstanceCode
   * @param {string[]|undefined} entityCodes
   * @return {Promise<DhisInstance>}
   */
  async get({ dataSourceDhisInstanceCode, entityCodes }) {
    const entityBasedDhisResolution = entityCodes && entityCodes.length > 0;

    if (!dataSourceDhisInstanceCode && !entityBasedDhisResolution) {
      throw new Error(
        'No DHIS Instance specified on dataSource, and entityBasedDhisResolution not used',
      );
    }

    if (dataSourceDhisInstanceCode) {
      const instance = await this.models.dhisInstance.findOne({
        code: dataSourceDhisInstanceCode,
      });
      if (!instance) {
        throw new Error(`No DHIS Instance found with code ${dataSourceDhisInstanceCode}`);
      }
      return instance;
    }

    return this.resolveMultipleEntityCodes(entityCodes);
  }

  /**
   * @private
   * @param {string} entityCode
   * @return {Promise<DhisInstance>}
   */
  async resolveSingleEntityCode(entityCode) {
    const serverName = await this.getDhisServerNameForEntity(entityCode);
    return this.getFromServerName(serverName);
  }

  /**
   * @private
   * @param {string[]} entityCodes
   * @return {Promise<DhisInstance>}
   */
  async resolveMultipleEntityCodes(entityCodes) {
    const allDhisInstanceCodes = new Set();
    const allDhisInstances = [];
    for (const entityCode of entityCodes) {
      const dhisInstance = await this.resolveSingleEntityCode(entityCode);
      allDhisInstanceCodes.add(dhisInstance.code);
      allDhisInstances.push(dhisInstance);
    }
    if (allDhisInstanceCodes.size > 1) {
      throw new Error(
        `All entities must use the same DHIS2 instance (got [${[...allDhisInstanceCodes].join(
          ',',
        )}])`,
      );
    }
    return allDhisInstances[0];
  }

  /**
   * @private
   * @param {string} entityCode
   * @return {Promise<string>}
   */
  async getDhisServerNameForEntity(entityCode) {
    // Eventually we should migrate this detection to not use legacy style isDataRegional config on Entity,
    // for now we just call the legacy methods to resolve it.
    return legacy_getDhisServerName({
      isDataRegional: false,
      entityCode,
    });
  }

  /**
   * @private
   * @param {string} serverName
   * @return {Promise<DhisInstance>}
   */
  async getFromServerName(serverName) {
    const instance = await this.models.dhisInstance.findOne({ code: serverName });
    if (!instance) {
      throw new Error(`Could not find DHIS Instance with serverName '${serverName}'`);
    }
    return instance;
  }
}
