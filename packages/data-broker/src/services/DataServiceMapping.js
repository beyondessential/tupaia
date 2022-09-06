/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * @typedef {DataElement|DataGroup} DataSource
 */

/**
 * @typedef {Object} DataServiceMappingEntry
 * @property {DataSource} dataSource
 * @property {string} service_type
 * @property {Object} config
 */

/**
 * @property {DataServiceMappingEntry[]} dataElementMapping
 * @property {DataServiceMappingEntry[]} dataGroupMapping
 */
export class DataServiceMapping {
  dataElementMapping;

  dataGroupMapping;

  constructor(dataElementMapping = [], dataGroupMapping = []) {
    this.dataElementMapping = dataElementMapping;
    this.dataGroupMapping = dataGroupMapping;
  }

  uniqueServiceTypes() {
    const set = new Set();
    for (const deMapping of this.dataElementMapping) {
      set.add(deMapping.service_type);
    }
    for (const dgMapping of this.dataGroupMapping) {
      set.add(dgMapping.service_type);
    }
    return Array.from(set);
  }

  dataSourcesByServiceType() {
    const map = {};
    for (const serviceType of this.uniqueServiceTypes()) {
      map[serviceType] = [];
    }
    for (const deMapping of this.dataElementMapping) {
      map[deMapping.service_type].push(deMapping.dataSource);
    }
    for (const dgMapping of this.dataGroupMapping) {
      map[dgMapping.service_type].push(dgMapping.dataSource);
    }
    return map;
  }

  /**
   * @return {DataServiceMappingEntry[]}
   */
  allMappings() {
    return [...this.dataElementMapping, ...this.dataGroupMapping];
  }

  /**
   * @param {DataSource} dataSource
   * @return {{ service_type: string, config: Object } | null}
   */
  mappingForDataSource(dataSource) {
    for (const mapping of this.allMappings()) {
      if (mapping.dataSource === dataSource) {
        return {
          service_type: mapping.service_type,
          config: mapping.config,
        };
      }
    }
    return null;
  }
}
