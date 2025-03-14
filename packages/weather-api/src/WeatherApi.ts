import { fetchWithTimeout, requireEnv, stringifyQuery } from '@tupaia/utils';

const MAX_FETCH_WAIT_TIME = 15_000; // 15 seconds

/**
 * @privateRemarks Weatherbit returns more properties. We just care about these ones.
 * @see https://www.weatherbit.io/api/historical-weather-daily
 */
export interface WeatherSnapshot {
  /** Date (YYYY-MM-DD) */
  datetime: string;
  /** Maximum temperature (default Celsius) */
  max_temp: number;
  /** Minimum temperature (default Celsius) */
  min_temp: number;
  /** Accumulated precipitation (default mm) */
  precip: number;
  /** Average relative humidity (%) */
  rh: number;
}

export type WeatherProperty = keyof WeatherSnapshot;

/**
 * @privateRemarks Weatherbit returns more properties. We just care about this one.
 * @see https://www.weatherbit.io/api/historical-weather-daily
 */
export interface WeatherResult {
  data: WeatherSnapshot[];
}

export class WeatherApi {
  public async current(lat: string, lon: string) {
    return this.fetch('/v2.0/current', { lat, lon });
  }

  public async historicDaily(lat: string, lon: string, startDate: string, endDate: string) {
    return this.fetch('/v2.0/history/daily', {
      lat,
      lon,
      start_date: startDate,
      end_date: endDate,
    });
  }

  public async forecastDaily(lat: string, lon: string, days = 16) {
    return this.fetch('/v2.0/forecast/daily', {
      lat,
      lon,
      days,
    });
  }

  private async fetch(
    endpoint: string,
    params: {
      lat: string;
      lon: string;
      days?: number;
      start_date?: string;
      end_date?: string;
    },
  ): Promise<WeatherResult> {
    const apiKey = requireEnv('WEATHERBIT_API_KEY');
    const queryParams = { ...params, key: apiKey };

    const url = stringifyQuery('https://api.weatherbit.io', endpoint, queryParams);

    const result = await fetchWithTimeout(url, {}, MAX_FETCH_WAIT_TIME);

    if (result.status !== 200) {
      const bodyText = await result.text();
      throw new Error(
        `Error response from Weatherbit API. Status: ${result.status}, body: ${bodyText}`,
      );
    }

    return result.json();
  }
}
