/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDataApi } from '@tupaia/data-api';
import { IndicatorApi } from '@tupaia/indicators';
import { WeatherApi } from '@tupaia/weather-api';
import { TupaiaService } from './tupaia';
import { DhisService } from './dhis';
import { IndicatorService } from './indicator';
import { WeatherService } from './weather/WeatherService';

export const createService = (models, type, dataBroker) => {
  switch (type) {
    case 'dhis':
      return new DhisService(models);
    case 'tupaia':
      return new TupaiaService(models, new TupaiaDataApi(models.database));
    case 'indicator':
      return new IndicatorService(models, new IndicatorApi(models, dataBroker));
    case 'weather':
      return new WeatherService(models, new WeatherApi());
    default:
      throw new Error(`Invalid service type: ${type}`);
  }
};
