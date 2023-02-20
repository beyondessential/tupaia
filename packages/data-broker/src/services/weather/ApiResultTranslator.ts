/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Analytic, AnalyticResults, EntityType, Event, EventResults } from '../../types';
import { WeatherProperty, WeatherResult } from './types';

export type ResultFormat = 'analytics' | 'events';

type WeatherDataElementCode = keyof typeof DATA_ELEMENT_CODE_TO_API_PROPERTY_MAP;

const DATA_ELEMENT_CODE_TO_API_PROPERTY_MAP: Record<string, WeatherProperty> = {
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
  private readonly entities: EntityType[];
  private readonly resultFormat: ResultFormat;
  private readonly dataElementCodes: WeatherDataElementCode[];

  public constructor(
    entities: EntityType[],
    resultFormat: ResultFormat,
    dataElementCodes: WeatherDataElementCode[],
  ) {
    this.entities = entities;
    this.resultFormat = resultFormat;
    this.dataElementCodes = dataElementCodes;
  }

  /**
   * Translates api result sets to analytics/events format data
   */
  public translate(apiResultByEntityCode: Record<string, WeatherResult | null>): AnalyticResults;
  public translate(apiResultByEntityCode: Record<string, WeatherResult | null>): EventResults;
  public translate(
    apiResultByEntityCode: Record<string, WeatherResult | null>,
  ): AnalyticResults | EventResults {
    const translatedByEntityCode: Record<string, Analytic[] | Event[]> = {};

    for (const entity of this.entities) {
      let translated: any = null;

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

    let combinedData: any[] = [];

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

  private apiResultToEvents(apiResult: WeatherResult, entity: EntityType) {
    const events = [];

    for (const entry of apiResult.data) {
      const eventDate = `${entry.datetime}T23:59:59`; // time is 23:59:59 to represent the complete day
      const event: Event & { dataValues: Record<string, string | number> } = {
        event: `weather_${entity.code}_${entry.datetime}`,
        orgUnit: entity.code,
        orgUnitName: entity.name,
        eventDate: eventDate,
        dataValues: {},
      };

      for (const dataElementCode of this.dataElementCodes) {
        const apiProperty = DATA_ELEMENT_CODE_TO_API_PROPERTY_MAP[dataElementCode];
        event.dataValues[dataElementCode as string] = entry[apiProperty];
      }

      events.push(event);
    }

    return events;
  }

  private apiResultToAnalytics(apiResult: WeatherResult, entity: EntityType) {
    const analytics: Analytic[] = [];

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
