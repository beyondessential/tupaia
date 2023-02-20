import { fetchWithTimeout, stringifyQuery } from '@tupaia/utils';

/**
 * @typedef {Object} WeatherResult
 * @property {number} min_temp:
 * @property {number} max_temp:
 * @property {number} precip:
 * @property {string} datetime:
 */

const MAX_FETCH_WAIT_TIME = 15 * 1000; // 15 seconds

export class WeatherApi {
  constructor() {
    this.apiKey = process.env.WEATHERBIT_API_KEY;
  }

  /**
   * Get current weather data
   * @param string lat
   * @param string lon
   * @returns {{}}
   */
  async current(lat, lon) {
    return await this._fetch('/v2.0/current', { lat, lon });
  }

  /**
   * Get historic weather data
   * @param string lat
   * @param string lon
   * @param string startDate
   * @param string endDate
   * @returns {Promise<{ data: WeatherResult[] }>}
   */
  async historicDaily(lat, lon, startDate, endDate) {
    return await this._fetch('/v2.0/history/daily', {
      lat,
      lon,
      start_date: startDate,
      end_date: endDate,
    });
  }

  /**
   * Get forecast weather data for the next 16 days
   * @param string lat
   * @param string lon
   * @param number days
   * @returns {Promise<{ data: WeatherResult[] }>}
   */
  async forecastDaily(lat, lon, days = 16) {
    return await this._fetch('/v2.0/forecast/daily', {
      lat,
      lon,
      days,
    });
  }

  /**
   * @param string endpoint
   * @param {} params
   * @returns {Promise<{}>}
   * @private
   */
  async _fetch(endpoint, params) {
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
