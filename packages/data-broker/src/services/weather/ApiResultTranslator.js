const DATA_ELEMENT_CODE_TO_API_PROPERTY_MAP = {
  MIN_TEMP: 'min_temp',
  MAX_TEMP: 'max_temp',
  PRECIP: 'precip',
};

/**
 * Translates Weather API data into events/analytics formatted data
 */
export class ApiResultTranslator {
  /**
   * @param entities
   * @param string requestType - one of 'events' | 'analytics'
   * @param dataElementCodes
   */
  constructor(entities, requestType, dataElementCodes) {
    this.entities = entities;
    this.requestType = requestType;
    this.dataElementCodes = dataElementCodes;
  }

  /**
   * Translates api result sets to analytics/events format data
   *
   * @param {Object.<entityCode: string: Object.<data: Object[]>>} apiResultByEntityCode
   * @returns {{metadata: {}, results: []}|*}
   */
  translate(apiResultByEntityCode) {
    const translatedByEntityCode = {};

    for (const entity of this.entities) {
      let translated = null;

      const apiResult = apiResultByEntityCode[entity.code];

      switch (this.requestType) {
        case 'analytics':
          translated = this._apiResultToAnalytics(apiResult, entity);
          break;
        case 'events':
          translated = this._apiResultToEvents(apiResult, entity);
          break;
      }

      translatedByEntityCode[entity.code] = translated;
    }

    let combinedData = [];

    for (const entity of this.entities) {
      combinedData = [...combinedData, ...translatedByEntityCode[entity.code]];
    }

    return {
      results: combinedData,
      metadata: {},
    };
  }

  _apiResultToEvents(apiResult, entity) {
    const events = [];

    for (const entry of apiResult.data) {
      const event = {
        organisationUnit: entity.code,
        period: entry.datetime.replace('-', '').replace('-', ''),
      };

      for (const dataElementCode of this.dataElementCodes) {
        const apiProperty = DATA_ELEMENT_CODE_TO_API_PROPERTY_MAP[dataElementCode];
        event[dataElementCode] = entry[apiProperty];
      }

      events.push(event);
    }

    return events;
  }

  _apiResultToAnalytics(apiResult, entity, dataElementCodes) {
    const analytics = [];

    for (const entry of apiResult.data) {
      for (const dataElementCode of this.dataElementCodes) {
        const apiProperty = DATA_ELEMENT_CODE_TO_API_PROPERTY_MAP[dataElementCode];

        analytics.push({
          dataElement: dataElementCode,
          value: entry[apiProperty],
          organisationUnit: entity.code,
          period: entry.datetime.replace('-', '').replace('-', ''),
        });
      }
    }

    return analytics;
  }
}
