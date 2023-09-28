import { fetchWithTimeout, stringifyQuery } from '@tupaia/utils';

type WeatherResult = {
  min_temp: number;
  max_temp: number;
  precip: number;
  datetime: string;
};

const MAX_FETCH_WAIT_TIME = 15 * 1000; // 15 seconds

export class WeatherApi {
  private readonly apiKey: string | undefined;

  public constructor() {
    this.apiKey = process.env.WEATHERBIT_API_KEY;
  }

  public async current(lat: string, lon: string) {
    return await this._fetch('/v2.0/current', { lat, lon });
  }

  public async historicDaily(lat: string, lon: string, startDate: string, endDate: string) {
    return await this._fetch('/v2.0/history/daily', {
      lat,
      lon,
      start_date: startDate,
      end_date: endDate,
    });
  }

  public async forecastDaily(lat: string, lon: string, days = 16) {
    return await this._fetch('/v2.0/forecast/daily', {
      lat,
      lon,
      days,
    });
  }

  private async _fetch(
    endpoint: string,
    params: {
      lat: string;
      lon: string;
      days?: number;
      start_date?: string;
      end_date?: string;
    },
  ): Promise<{ data: WeatherResult[] }> {
    const queryParams = { ...params, key: this.apiKey };

    const url = stringifyQuery('https://api.weatherbit.io', endpoint, queryParams);

    const result = await fetchWithTimeout(url, {}, MAX_FETCH_WAIT_TIME);

    if (result.status !== 200) {
      const bodyText = await result.text();
      throw new Error(
        `Error response from Weatherbit API. Status: ${result.status}, body: ${bodyText}`,
      );
    }

    return await result.json();
  }
}
