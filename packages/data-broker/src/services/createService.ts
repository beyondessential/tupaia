/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDataApi } from '@tupaia/data-api';
import { DataLakeApi } from '@tupaia/data-lake-api';
import { IndicatorApi } from '@tupaia/indicators';
import { WeatherApi } from '@tupaia/weather-api';
import { KoBoApi } from '@tupaia/kobo-api';
import type { DataBroker } from '../DataBroker';
import { DataBrokerModelRegistry, ServiceType } from '../types';
import { TupaiaService } from './tupaia';
import { DataLakeService } from './data-lake';
import { DhisService } from './dhis';
import { IndicatorService } from './indicator';
import { WeatherService } from './weather/WeatherService';
import { KoBoService } from './kobo/KoBoService';
import { Service } from './Service';

export const createService = (
  models: DataBrokerModelRegistry,
  type: ServiceType,
  dataBroker: DataBroker,
): Service => {
  switch (type) {
    case 'dhis':
      return new DhisService(models);
    case 'tupaia':
      return new TupaiaService(models, new TupaiaDataApi(models.database));
    case 'data-lake':
      return new DataLakeService(models, new DataLakeApi());
    case 'indicator':
      return new IndicatorService(
        models,
        new IndicatorApi(models as IndicatorApi['models'], dataBroker),
      );
    case 'weather':
      return new WeatherService(models, new WeatherApi());
    case 'kobo':
      return new KoBoService(models, new KoBoApi());
    default:
      throw new Error(`Invalid service type: ${type}`);
  }
};
