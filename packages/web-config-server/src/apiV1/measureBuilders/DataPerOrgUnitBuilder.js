import { groupBy } from 'es-toolkit/compat';

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

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
  async fetchResultsAndPeriod() {
    throw new Error(
      'Any subclass of DataPerOrgUnitBuilder must implement the "fetchResultsAndPeriod" method',
    );
  }

  async groupResultsByOrgUnitCode(results) {
    const orgUnitKey = this.areEventResults(results) ? 'orgUnit' : 'organisationUnit';
    return groupBy(results, ({ [orgUnitKey]: orgUnitCode }) => orgUnitCode);
  }

  async buildData(results) {
    const { dataElementCode } = this.query;
    const resultsByOrgUnit = await this.groupResultsByOrgUnitCode(results);
    const baseBuilder = this.getBaseBuilder();

    const processResultsForOrgUnit = async ([organisationUnitCode, result]) => {
      if (!this.validateResults(result)) {
        return null;
      }

      const data = await baseBuilder.buildData(result);
      if (data.length !== 1) {
        throw new Error('The base data builder should return a single element array');
      }

      const [dataItem] = data;
      // key is sometimes changed to "value" by aggregator
      const value = dataElementCode in dataItem ? dataItem[dataElementCode] : dataItem.value;

      return { organisationUnitCode, [dataElementCode]: value };
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
    const { results, period } = await this.fetchResultsAndPeriod();
    const data = await this.buildData(results);

    return { period, data: this.formatData(data) };
  }
}
