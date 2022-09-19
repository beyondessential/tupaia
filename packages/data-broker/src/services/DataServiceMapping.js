/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import isequal from 'lodash.isequal';

/**
 * @typedef {DataElement|DataGroup|SyncGroup} DataSource
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

  syncGroupMapping;

  constructor(dataElementMapping = [], dataGroupMapping = [], syncGroupMapping = []) {
    this.dataElementMapping = dataElementMapping;
    this.dataGroupMapping = dataGroupMapping;
    this.syncGroupMapping = syncGroupMapping;
  }

  uniqueServiceTypes() {
    const set = new Set();
    for (const deMapping of this.dataElementMapping) {
      set.add(deMapping.service_type);
    }
    for (const dgMapping of this.dataGroupMapping) {
      set.add(dgMapping.service_type);
    }
    for (const sgMapping of this.syncGroupMapping) {
      set.add(sgMapping.service_type);
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
    for (const sgMapping of this.syncGroupMapping) {
      map[sgMapping.service_type].push(sgMapping.dataSource);
    }
    return map;
  }

  /**
   * @return {DataServiceMappingEntry[]}
   */
  allMappings() {
    return [...this.dataElementMapping, ...this.dataGroupMapping, ...this.syncGroupMapping];
  }

  /**
   * @param {DataSource} dataSource
   * @return {DataServiceMappingEntry | null}
   */
  mappingForDataSource(dataSource) {
    for (const mapping of this.allMappings()) {
      if (mapping.dataSource === dataSource) return mapping;
    }
    return null;
  }

  /**
   * @param {DataServiceMapping} other
   * @returns boolean
   */
  equals(other) {
    if (this.dataElementMapping.length !== other.dataElementMapping.length) return false;
    if (this.dataGroupMapping.length !== other.dataGroupMapping.length) return false;
    for (let i = 0; i < this.dataElementMapping.length; i++) {
      const mA = this.dataElementMapping[i];
      const mB = other.dataElementMapping[i];
      if (mA.dataSource.code !== mB.dataSource.code) return false;
      if (mA.serviceType != mB.serviceType) return false;
      if (!isequal(mA.config, mB.config)) return false;
    }
    for (let i = 0; i < this.dataGroupMapping.length; i++) {
      const mA = this.dataGroupMapping[i];
      const mB = other.dataGroupMapping[i];
      if (mA.dataSource.code !== mB.dataSource.code) return false;
      if (mA.serviceType != mB.serviceType) return false;
      if (!isequal(mA.config, mB.config)) return false;
    }
    for (let i = 0; i < this.syncGroupMapping.length; i++) {
      const mA = this.syncGroupMapping[i];
      const mB = other.syncGroupMapping[i];
      if (mA.dataSource.code !== mB.dataSource.code) return false;
      if (mA.serviceType != mB.serviceType) return false;
    }
    return true;
  }
}
