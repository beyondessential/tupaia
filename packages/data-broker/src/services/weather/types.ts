import { DataElement as BaseDataElement } from '../../types';

export type WeatherProperty = 'min_temp' | 'max_temp' | 'precip';

type WeatherDataSourceConfig = Partial<{
  weatherForecastData: boolean;
}>;

export type DataElement = BaseDataElement & {
  config: WeatherDataSourceConfig;
};

export interface WeatherResult {
  data: {
    min_temp: number;
    max_temp: number;
    precip: number;
    datetime: string;
  }[];
}
