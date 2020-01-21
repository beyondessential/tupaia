/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import isPlainObject from 'lodash.isplainobject';

import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';
import { getSortByKey } from '/utils';

const OPERATOR_TO_VALUE_CHECK = {
  '>=': (value, target) => value >= target,
  '<': (value, target) => value < target,
  range: (value, target) => target[0] <= value && value <= target[1],
  regex: (value, target) => value.match(target),
};

const ANY_VALUE_CONDITION = '*';

export class DataBuilder {
  /**
   * @param {DhisApi} dhisApi
   * @param {?Object} config
   * @param {Object} query
   * @param {Entity} [entity]
   * @param {string} [aggregationType]
   */
  constructor(dhisApi, config, query, entity, aggregationType) {
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

  isForSpecificEvent() {
    return !!this.query.eventId;
  }

  isForPrograms() {
    const { programCodes, programCode, dataSource = {} } = this.config;
    return !!(programCodes || programCode || dataSource.programCodes || dataSource.programCode);
  }

  isEventBased() {
    return this.isForSpecificEvent() || this.isForPrograms();
  }

  async getAnalytics(additionalQueryConfig) {
    return this.isEventBased()
      ? this.getEventAnalytics(additionalQueryConfig)
      : this.getDataValueAnalytics(additionalQueryConfig);
  }

  async getDataValueAnalytics(additionalQueryConfig) {
    return this.dhisApi.getAnalytics(additionalQueryConfig, this.query, this.aggregationType);
  }

  async getEventAnalytics(additionalQueryConfig) {
    const { programCodes, programCode } = this.config;
    const eventQueryConfig = {
      programCodes,
      programCode,
      ...additionalQueryConfig,
    };
    return this.dhisApi.getEventAnalytics(eventQueryConfig, this.query, this.aggregationType);
  }

  async getEvents(additionalQueryConfig) {
    const { programCode } = this.config;
    const { organisationUnitCode, startDate, endDate, trackedEntityInstance, eventId } = this.query;

    return this.dhisApi.getEvents({
      programCode,
      organisationUnitCode,
      startDate,
      endDate,
      trackedEntityInstance,
      eventId,
      ...additionalQueryConfig,
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
