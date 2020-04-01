/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable class-methods-use-this */

import groupBy from 'lodash.groupby';

import {
  getDataSourceEntityType,
  getAggregationEntityType,
} from '/apiV1/dataBuilders/helpers/getDataSourceEntityType';
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
        'The base builder for an org unit builder must implement the "buildData" method',
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

    const dataSourceToAggregateMapper = async () => {
      // This functionalilty should be developed upon into a generic dataSource -> aggregation Entity mapping
      // eg. village -> facility, facility -> country, etc.
      // For now it only supports mapping to self, and mapping village -> facility
      const dataSourceEntityType = getDataSourceEntityType(this.config);
      const aggregationEntityType = getAggregationEntityType(this.config);
      if (
        dataSourceEntityType !== ENTITY_TYPES.VILLAGE ||
        dataSourceEntityType === aggregationEntityType
      ) {
        // No mapping required, mapper just returns original orgUnitCode
        return orgUnitCode => orgUnitCode;
      }

      // Create village -> facility mapper
      const villageCodes = results.map(({ [orgUnitKey]: orgUnit }) => orgUnit);
      const villageToFacilityCode = await Entity.fetchChildToParentCode(villageCodes);
      return orgUnitCode => villageToFacilityCode[orgUnitCode];
    };

    const mapper = await dataSourceToAggregateMapper();
    return groupBy(results, ({ [orgUnitKey]: orgUnitCode }) => mapper(orgUnitCode));
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
