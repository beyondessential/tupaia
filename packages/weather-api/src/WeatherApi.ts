import { fetchWithTimeout, requireEnv, stringifyQuery } from '@tupaia/utils';

/** @see https://www.weatherbit.io/api/historical-weather-daily */
interface WeatherResult {
  /** Date (YYYY-MM-DD) */
  datetime: string | null;
  /** Timestamp UTC (Unix Timestamp) */
  ts: number | null;
  /** Data revision status - interim (subject to revisions) or final */
  revision_status: 'interim' | 'final' | null;
  /** Average pressure (mb) */
  pres: number | null;
  /** Average sea level pressure (mb) */
  slp: number | null;
  /** Average wind speed (Default m/s) */
  wind_spd: number | null;
  /** Wind gust speed (m/s) */
  wind_gust_spd: number | null;
  /** Maximum 2 minute wind speed (m/s) */
  max_wind_spd: number | null;
  /** Average wind direction (degrees) */
  wind_dir: number | null;
  /** Direction of maximum 2 minute wind gust (degrees) */
  max_wind_dir: number | null;
  /** Time of maximum wind gust UTC (Unix Timestamp) */
  max_wind_ts: number | null;
  /** Average temperature (default Celsius) */
  temp: number | null;
  /** Maximum temperature (default Celsius) */
  max_temp: number | null;
  /** Minimum temperature (default Celsius) */
  min_temp: number | null;
  /** Time of daily maximum temperature UTC (Unix Timestamp) */
  max_temp_ts: number | null;
  /** Time of daily minimum temperature UTC (Unix Timestamp) */
  min_temp_ts: number | null;
  /** Average relative humidity (%) */
  rh: number | null;
  /** Average dew point (default Celsius) */
  dewpt: number | null;
  /** [Satellite based] average cloud coverage (%) */
  clouds: number | null;
  /** Accumulated precipitation (default mm) */
  precip: number | null;
  /** Accumulated precipitation [satellite/radar estimated] (default mm) */
  precip_gpm: number | null;
  /** Accumulated snowfall (default mm) */
  snow: number | null;
  /** Snow Depth (default mm) */
  snow_depth: number | null;
  /** Average solar radiation (W/M^2) */
  solar_rad: number | null;
  /** Total solar radiation (W/M^2) */
  t_solar_rad: number | null;
  /** Average global horizontal solar irradiance (W/m^2) */
  ghi: number | null;
  /** Day total global horizontal solar irradiance (W/m^2) [Clear Sky] */
  t_ghi: number | null;
  /** Maximum value of global horizontal solar irradiance in day (W/m^2) [Clear Sky] */
  max_ghi: number | null;
  /** Average direct normal solar irradiance (W/m^2) [Clear Sky] */
  dni: number | null;
  /** Day total direct normal solar irradiance (W/m^2) [Clear Sky] */
  t_dni: number | null;
  /** Maximum value of direct normal solar irradiance in day (W/m^2) [Clear Sky] */
  max_dni: number | null;
  /** Average diffuse horizontal solar irradiance (W/m^2) [Clear Sky] */
  dhi: number | null;
  /** Day total diffuse horizontal solar irradiance (W/m^2) [Clear Sky] */
  t_dhi: number | null;
  /** Maximum value of diffuse horizontal solar irradiance in day (W/m^2) [Clear Sky] */
  max_dhi: number | null;
  /** Maximum UV Index (0–11+) */
  max_uv: number | null;
}

const MAX_FETCH_WAIT_TIME = 15_000; // 15 seconds

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
  ): Promise<{ data: WeatherResult[] }> {
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
