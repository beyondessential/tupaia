const DATA_ELEMENT_CODE_TO_API_PROPERTY_MAP = {
  WTHR_MIN_TEMP: 'min_temp',
  WTHR_MAX_TEMP: 'max_temp',
  WTHR_PRECIP: 'precip',
  WTHR_FORECAST_MIN_TEMP: 'min_temp',
  WTHR_FORECAST_MAX_TEMP: 'max_temp',
  WTHR_FORECAST_PRECIP: 'precip',
};

/**
 * Translates Weather API data into events/analytics formatted data
 */
export class ApiResultTranslator {
  /**
   * @param {EntityType[]} entities
   * @param {string} resultFormat - one of 'events' | 'analytics'
   * @param {string[]} dataElementCodes
   */
  constructor(entities, resultFormat, dataElementCodes) {
    this.entities = entities;
    this.resultFormat = resultFormat;
    this.dataElementCodes = dataElementCodes;
  }

  /**
   * Translates api result sets to analytics/events format data
   *
   * @param {Object.<entityCode: string: Object.<data: Object[]>>} apiResultByEntityCode
   * @returns {{}} - either `{ results: [], metadata: {}}` or `[]`, depending on resultFormat
   */
  translate(apiResultByEntityCode) {
    const translatedByEntityCode = {};

    for (const entity of this.entities) {
      let translated = null;

      const apiResult = apiResultByEntityCode[entity.code];

      if (apiResult === null) {
        translated = [];
      } else {
        switch (this.resultFormat) {
          case 'analytics':
            translated = this.apiResultToAnalytics(apiResult, entity);
            break;
          case 'events':
            translated = this.apiResultToEvents(apiResult, entity);
            break;
        }
      }

      translatedByEntityCode[entity.code] = translated;
    }

    let combinedData = [];

    for (const entity of this.entities) {
      combinedData = [...combinedData, ...translatedByEntityCode[entity.code]];
    }

    switch (this.resultFormat) {
      case 'analytics':
        return {
          results: combinedData,
          metadata: {},
        };
      case 'events':
        return combinedData;
    }
  }

  /**
   * @private
   */
  apiResultToEvents(apiResult, entity) {
    const events = [];

    for (const entry of apiResult.data) {
      const eventDate = `${entry.datetime}T23:59:59`; // time is 23:59:59 to represent the complete day
      const event = {
        event: `weather_${entity.code}_${entry.datetime}`,
        orgUnit: entity.code,
        orgUnitName: entity.name,
        eventDate: eventDate,
        dataValues: {},
      };

      for (const dataElementCode of this.dataElementCodes) {
        const apiProperty = DATA_ELEMENT_CODE_TO_API_PROPERTY_MAP[dataElementCode];
        event.dataValues[dataElementCode] = entry[apiProperty];
      }

      events.push(event);
    }

    return events;
  }

  /**
   * @private
   */
  apiResultToAnalytics(apiResult, entity) {
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
