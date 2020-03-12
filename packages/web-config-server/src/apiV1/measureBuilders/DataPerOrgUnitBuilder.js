/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable class-methods-use-this */

import groupBy from 'lodash.groupby';

import { getDataSourceEntityType } from '/apiV1/dataBuilders/helpers/getDataSourceEntityType';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { ENTITY_TYPES, Entity } from '/models/Entity';

/**
 * @abstract
 */
export class DataPerOrgUnitBuilder extends DataBuilder {
  constructor(...constructorArgs) {
    super(...constructorArgs);
    this.constructorArgs = [...constructorArgs];
    this.baseBuilder = null;
  }

  /**
   * @abstract
   * @returns {DataBuilder}
   */
  getBaseBuilderClass() {
    throw new Error(
      'Any subclass of DataPerOrgUnitBuilder must implement the "getBaseBuilderClass" method',
    );
  }

  getBaseBuilder() {
    if (this.baseBuilder !== null) {
      return this.baseBuilder;
    }

    const BaseBuilder = this.getBaseBuilderClass();
    const builder = new BaseBuilder(...this.constructorArgs);

    if (!(builder instanceof DataBuilder)) {
      throw new Error('Invalid builder provided, must be a subclass of DataBuilder');
    }
    if (typeof builder.buildData !== 'function') {
      throw new Error(
        'The base builder for a period builder must implement the "buildData" method',
      );
    }

    this.baseBuilder = builder;
    return builder;
  }

  /**
   * @abstract
   * @returns {Promise<Array>}
   */
  async fetchResults() {
    throw new Error(
      'Any subclass of DataPerOrgUnitBuilder must implement the "fetchResults" method',
    );
  }

  async groupResultsByOrgUnitCode(results) {
    const orgUnitKey = this.areEventResults(results) ? 'orgUnit' : 'organisationUnit';
    if (getDataSourceEntityType(this.config) !== ENTITY_TYPES.VILLAGE) {
      return groupBy(results, orgUnitKey);
    }

    const villageCodes = results.map(({ [orgUnitKey]: orgUnit }) => orgUnit);
    const villageToFacilityCode = await Entity.fetchChildToParentCode(villageCodes);
    return groupBy(results, ({ [orgUnitKey]: orgUnit }) => villageToFacilityCode[orgUnit]);
  }

  async buildData(results) {
    const { dataElementCode } = this.query;
    const resultsByOrgUnit = await this.groupResultsByOrgUnitCode(results);
    const baseBuilder = this.getBaseBuilder();

    const processResultsForOrgUnit = async ([organisationUnitCode, result]) => {
      if (!result) {
        return;
      }

      const data = await baseBuilder.buildData(result);
      if (data.length !== 1) {
        throw new Error('The base data builder should return a single element array');
      }

      return { organisationUnitCode, [dataElementCode]: data[0][dataElementCode] };
    };
    return Promise.all(Object.entries(resultsByOrgUnit).map(processResultsForOrgUnit));
  }

  /**
   * Override in subclasses to provide custom data formatting
   *
   * @param {Array} data
   */
  formatData(data) {
    return data;
  }

  /**
   * @public
   */
  async build() {
    const results = await this.fetchResults();
    const data = await this.buildData(results);

    return this.formatData(data);
  }
}

export const getLevel = measureBuilderConfig => {
  const entityType = getDataSourceEntityType(measureBuilderConfig);
  if (entityType !== ENTITY_TYPES.VILLAGE) {
    return entityType;
  }
  return ENTITY_TYPES.FACILITY;
};
