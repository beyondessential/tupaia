import {
  getSortByKey,
  parsePeriodType,
  periodToDisplayString,
  periodToTimestamp,
} from '@tupaia/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

/**
 * @abstract
 */
export class DataPerPeriodBuilder extends DataBuilder {
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
      'Any subclass of DataPerPeriodBuilder must implement the "getBaseBuilderClass" method',
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
      'Any subclass of DataPerPeriodBuilder must implement the "fetchResults" method',
    );
  }

  /**
   * @abstract
   * @param {Array} results
   * @returns {Object<string, Array>}
   */
  groupResultsByPeriod(results, periodType) {
    throw new Error(
      'Any subclass of DataPerPeriodBuilder must implement the "groupResultsByPeriod" method',
    );
  }

  async buildData(results) {
    const { optionSetCode } = this.config;
    const periodType = parsePeriodType(this.config.periodType);
    const resultsByPeriod = this.groupResultsByPeriod(results, periodType);
    const baseBuilder = this.getBaseBuilder();

    const data = [];
    const optionCodeToName =
      optionSetCode && (await this.dhisApi.getOptionSetOptions({ code: optionSetCode }));

    const processResultsForPeriod = async ([period, resultsForPeriod]) => {
      const buildData = await baseBuilder.buildData(resultsForPeriod, optionCodeToName);
      const newData = buildData.map(dataItem => ({
        ...dataItem,
        timestamp: periodToTimestamp(period),
        name: periodToDisplayString(period),
      }));

      data.push(...newData);
    };
    await Promise.all(Object.entries(resultsByPeriod).map(processResultsForPeriod));

    return data.sort(getSortByKey('timestamp'));
  }

  /**
   * Override in subclasses to provide custom data formatting
   *
   * @param {Array} data
   */
  formatData(data) {
    return data;
  }

  async build() {
    const results = await this.fetchResults();
    const data = await this.buildData(results);

    return { data: this.formatData(data) };
  }
}
