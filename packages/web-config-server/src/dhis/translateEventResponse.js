/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';

import { reduceToDictionary, utcMoment } from '/utils';
import { PERIOD_TYPES, momentToPeriod } from './periodTypes';
import { sanitizeValue } from './sanitizeValue';

const { DAY } = PERIOD_TYPES;

/**
 * @typedef {Object} EventToAnalyticsTranslatorConfig
 * @property {string[]} [dataElementCodes=[]] The codes of the elements to be included in the result.
 * If empty, all the elements in the events will be included
 * @property {('code'|'uid')} [outputIdScheme='uid']
 */

class EventToAnalyticsTranslator {
  /**
   * @param {DhisApi} dhisApi
   * @param {EventToAnalyticsTranslatorConfig} [config={}]
   */
  constructor(dhisApi, config = {}) {
    this.dhisApi = dhisApi;
    this.config = {
      dataElementCodes: config.dataElementCodes || [],
      outputIdScheme: config.outputIdScheme || 'uid',
    };
  }

  /**
   * @param {Event[]} events
   * @returns {Analytics}
   */
  async translate(events) {
    const dataElementMap = await this.getDataElementMap(events);

    return {
      results: this.transformResults(events, dataElementMap),
      metadata: this.getMetadata(events, dataElementMap),
    };
  }

  /**
   * @param {Event[]} events
   * @returns {Object.<string, { id, code, valueType }>} A map of data elements by id
   */
  async getDataElementMap(events) {
    const { dataElementCodes } = this.config;

    let dataElementIdentifiers;
    if (dataElementCodes.length > 0) {
      dataElementIdentifiers = { codes: dataElementCodes };
    } else {
      // Get all event IDs, removing duplicates
      const setOfAllIds = events.reduce((ids, event) => {
        event.dataValues.forEach(({ dataElement: dataElementId }) => ids.add(dataElementId));
        return ids;
      }, new Set());

      dataElementIdentifiers = { ids: [...setOfAllIds] };
    }

    const records = await this.dhisApi.getRecords({
      ...dataElementIdentifiers,
      type: 'dataElements',
      fields: 'id,code,name,valueType',
    });

    return keyBy(records, 'id');
  }

  transformResults = (events, dataElementMap) => {
    return events.reduce(
      (results, event) => results.concat(this.transformResultsForEvent(event, dataElementMap)),
      [],
    );
  };

  transformResultsForEvent(event, dataElementMap) {
    const { orgUnit: organisationUnit } = event;
    const { eventDate } = event;
    const period = momentToPeriod(utcMoment(eventDate), DAY);

    const results = [];
    event.dataValues.forEach(({ dataElement: dataElementId, value }) => {
      if (!dataElementMap[dataElementId]) {
        return;
      }
      const { valueType } = dataElementMap[dataElementId];
      const dataElementKey = this.outputKeyIsCode()
        ? dataElementMap[dataElementId].code
        : dataElementId;

      results.push({
        dataElement: dataElementKey,
        organisationUnit,
        period,
        value: sanitizeValue(value, valueType),
      });
    });

    return results;
  }

  outputKeyIsCode() {
    return this.config.outputIdScheme === 'code';
  }

  getMetadata = (events, dataElementMap) => ({
    organisationUnit: reduceToDictionary(events, 'orgUnit', 'orgUnitName'),
    dataElementCodeToName: reduceToDictionary(dataElementMap, 'code', 'name'),
    dataElementIdToCode: reduceToDictionary(dataElementMap, 'id', 'code'),
    dataElement: reduceToDictionary(dataElementMap, 'id', 'name'),
  });
}

/**
 * @param {DhisApi} dhisApi
 * @param {Event[]} events
 * @param {EventToAnalyticsTranslatorConfig} [config={}]
 * @returns {Promise<Analytics>}
 */
export const translateEventResponse = async (dhisApi, events, config = {}) => {
  const translator = new EventToAnalyticsTranslator(dhisApi, config);
  return translator.translate(events);
};
