import { WeatherResult, WeatherSnapshot } from '@tupaia/weather-api';
import { Analytic, EntityRecord, Event, EventResults, RawAnalyticResults } from '../../types';

export type ResultFormat = 'analytics' | 'events';

/** Record<string, WeatherProperty>, but narrower */
const DATA_ELEMENT_CODE_TO_API_PROPERTY_MAP = {
  WTHR_MIN_TEMP: 'min_temp',
  WTHR_MAX_TEMP: 'max_temp',
  WTHR_PRECIP: 'precip',
  WTHR_RH: 'rh',
  WTHR_FORECAST_MIN_TEMP: 'min_temp',
  WTHR_FORECAST_MAX_TEMP: 'max_temp',
  WTHR_FORECAST_PRECIP: 'precip',
  WTHR_FORECAST_RH: 'rh',
} as const;

export type WeatherDataElementCode = keyof typeof DATA_ELEMENT_CODE_TO_API_PROPERTY_MAP;

/**
 * Translates Weather API data into events/analytics formatted data
 */
export class ApiResultTranslator {
  private readonly entities: EntityRecord[];
  private readonly resultFormat: ResultFormat;
  private readonly dataElementCodes: WeatherDataElementCode[];

  public constructor(
    entities: EntityRecord[],
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
  public translate(apiResultByEntityCode: Record<string, WeatherResult | null>): RawAnalyticResults;
  public translate(apiResultByEntityCode: Record<string, WeatherResult | null>): EventResults;
  public translate(
    apiResultByEntityCode: Record<string, WeatherResult | null>,
  ): RawAnalyticResults | EventResults {
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
          default:
            throw new Error('Unknown data format');
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
      default:
        throw new Error('Unknown data format');
    }
  }

  private apiResultToEvents(apiResult: WeatherResult, entity: EntityRecord) {
    const events = [];

    for (const entry of apiResult.data) {
      const eventDate = `${entry.datetime}T23:59:59`; // time is 23:59:59 to represent the complete day
      const event: Event & { dataValues: Partial<WeatherSnapshot> } = {
        event: `weather_${entity.code}_${entry.datetime}`,
        orgUnit: entity.code,
        orgUnitName: entity.name,
        eventDate,
        dataValues: {},
      };

      for (const dataElementCode of this.dataElementCodes) {
        const apiProperty = DATA_ELEMENT_CODE_TO_API_PROPERTY_MAP[dataElementCode];
        const val = entry[apiProperty];
        event.dataValues[dataElementCode] = val;
      }

      events.push(event);
    }

    return events;
  }

  private apiResultToAnalytics(apiResult: WeatherResult, entity: EntityRecord) {
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
