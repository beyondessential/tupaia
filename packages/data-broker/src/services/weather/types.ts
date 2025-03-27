import { DataElement as BaseDataElement } from '../../types';

interface WeatherDataSourceConfig {
  weatherForecastData?: boolean;
}

export type DataElement = BaseDataElement & {
  config: WeatherDataSourceConfig;
};
