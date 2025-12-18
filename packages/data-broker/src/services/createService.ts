import { TupaiaDataApi } from '@tupaia/data-api';
import { DataLakeApi } from '@tupaia/data-lake-api';
import { TupaiaDatabase } from '@tupaia/database';
import { IndicatorApi } from '@tupaia/indicators';
import { KoBoApi } from '@tupaia/kobo-api';
import { WeatherApi } from '@tupaia/weather-api';
import { DataBroker } from '../DataBroker';
import { DataBrokerModelRegistry, ServiceType } from '../types';
import { DataLakeService } from './data-lake';
import { DhisService } from './dhis';
import { IndicatorService } from './indicator';
import { KoBoService } from './kobo';
import { Service } from './Service';
import { SupersetService } from './superset';
import { TupaiaService } from './tupaia';
import { WeatherService } from './weather';

export const createService = (
  models: DataBrokerModelRegistry,
  type: ServiceType,
  dataBroker: DataBroker,
): Service => {
  switch (type) {
    case 'dhis':
      return new DhisService(models);
    case 'tupaia':
      return new TupaiaService(models, new TupaiaDataApi(models.database as TupaiaDatabase));
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
    case 'superset':
      return new SupersetService(models);
    default:
      throw new Error(`Invalid service type: ${type}`);
  }
};
