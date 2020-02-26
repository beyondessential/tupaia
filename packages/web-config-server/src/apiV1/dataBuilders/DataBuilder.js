/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import isPlainObject from 'lodash.isplainobject';
import { getSortByKey } from '@tupaia/utils';

import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';

const OPERATOR_TO_VALUE_CHECK = {
  '>=': (value, target) => value >= target,
  '<': (value, target) => value < target,
  range: (value, target) => target[0] <= value && value <= target[1],
  regex: (value, target) => value.match(target),
};

const ANY_VALUE_CONDITION = '*';

export class DataBuilder {
  /**
   * @param {Aggregator} aggregator
   * @param {DhisApi} dhisApi
   * @param {?Object} config
   * @param {Object} query
   * @param {Entity} [entity]
   * @param {string} [aggregationType]
   */
  constructor(aggregator, dhisApi, config, query, entity, aggregationType) {
    this.aggregator = aggregator;
    this.dhisApi = dhisApi;
    this.config = config || {};
    this.query = query;
    this.entity = entity;
    this.aggregationType = aggregationType;
  }

  // eslint-disable-next-line class-methods-use-this
  build() {
    throw new Error('Any subclass of DataBuilder must implement the "build" method');
  }

  getProgramCodesForAnalytics() {
    const { programCodes, programCode, dataSource = {} } = this.config;
    return (
      programCodes ||
      (programCode && [programCode]) ||
      dataSource.programCodes ||
      (dataSource.programCode && [dataSource.programCode])
    );
  }

  async fetchAnalytics(dataElementCodes, additionalQueryConfig) {
    const { dataServices } = this.config;
    const fetchOptions = {
      programCodes: this.getProgramCodesForAnalytics(),
      dataServices,
      ...additionalQueryConfig,
    };

    return this.aggregator.fetchAnalytics(dataElementCodes, fetchOptions, this.query, {
      aggregationType: this.aggregationType,
    });
  }

  async fetchEvents(additionalQueryConfig) {
    const { programCode, dataServices } = this.config;
    const { organisationUnitCode, startDate, endDate, trackedEntityInstance, eventId } = this.query;

    return this.aggregator.fetchEvents(programCode, {
      dataServices,
      organisationUnitCode,
      startDate,
      endDate,
      trackedEntityInstance,
      eventId,
      ...additionalQueryConfig,
    });
  }

  async fetchDataElements(codes) {
    const { dataServices } = this.config;
    const { organisationUnitCode } = this.query;

    return this.aggregator.fetchDataElements(codes, {
      organisationUnitCode,
      dataServices,
      shouldIncludeOptions: true,
    });
  }

  /**
   * @param {Event[]} events
   * @param {Conditions} [conditions]
   * @returns {number}
   */
  countEventsThatSatisfyConditions = (events, conditions) => {
    const { dataValues: valueConditions = {} } = conditions || {};
    const eventHasTargetValues = ({ dataValues }) =>
      Object.entries(valueConditions).every(([dataElement, condition]) => {
        const { value } = dataValues[dataElement] || {};
        return value && this.checkValueSatisfiesCondition(value, condition);
      });

    return events.filter(eventHasTargetValues).length;
  };

  /**
   * @param {AnalyticsResult[]} analytics
   * @param {Conditions} [conditions]
   * @returns {number}
   */
  countAnalyticsThatSatisfyConditions = (analytics, conditions) => {
    const { dataValues: valueConditions = {} } = conditions || {};
    const analyticHasTargetValue = ({ dataElement, value }) => {
      const condition = valueConditions[dataElement];
      return condition && this.checkValueSatisfiesCondition(value, condition);
    };

    return analytics.filter(analyticHasTargetValue).length;
  };

  checkValueSatisfiesCondition = (value, condition) => {
    if (!isPlainObject(condition)) {
      return condition === ANY_VALUE_CONDITION || value === condition;
    }

    const { operator, value: targetValue } = condition;
    const checkValue = OPERATOR_TO_VALUE_CHECK[operator];
    if (!checkValue) {
      throw new Error(`Unknown operator: '${operator}'`);
    }

    return checkValue(value, targetValue);
  };

  sortDataByName = data => data.sort(getSortByKey('name'));

  areDataAvailable = data => data.some(({ value }) => value !== NO_DATA_AVAILABLE);

  areEventResults = results => !!(results[0] && results[0].event);
}
