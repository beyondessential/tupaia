import { ValidationError } from '@tupaia/utils';
import type { WeatherApi } from '@tupaia/weather-api';
import {
  AnalyticResults,
  DataBrokerModelRegistry,
  DataGroup,
  DataSource,
  DataSourceType,
  EntityType,
  EventResults,
} from '../../types';
import { EMPTY_ANALYTICS_RESULTS } from '../../utils';
import { Service } from '../Service';
import { ApiResultTranslator } from './ApiResultTranslator';
import { DateSanitiser } from './DateSanitiser';
import { DataElement, WeatherResult } from './types';
import type {
  PullOptions as BasePullOptions,
  PullMetadataOptions as BasePullMetadataOptions,
} from '../Service';

export type PullOptions = BasePullOptions &
  Partial<{
    organisationUnitCodes: string[];
    startDate: string;
    endDate: string;
  }>;

export class WeatherService extends Service {
  private readonly api: WeatherApi;
  private readonly dateSanitiser: DateSanitiser;

  public constructor(models: DataBrokerModelRegistry, api: WeatherApi) {
    super(models);
    this.api = api;
    this.dateSanitiser = new DateSanitiser();
  }

  /**
   * Note, if no period specified will return current weather
   */
  public async pull(
    dataSources: DataElement[],
    type: 'dataElement',
    options: PullOptions,
  ): Promise<AnalyticResults>;
  public async pull(
    dataSources: DataGroup[],
    type: 'dataGroup',
    options: PullOptions,
  ): Promise<EventResults>;
  public async pull(dataSources: DataSource[], type: DataSourceType, options: PullOptions) {
    this.validateOptions(options);

    const { startDate, endDate } = options;

    const resultFormat = this.getResultFormat(type);

    const entities = await this.fetchEntitiesMatchingCodes(
      options.organisationUnitCodes as string[],
    );

    const dataElementTypeDataSources = await this.extractDataSources(type, dataSources);

    const forecastDataElementCodes = dataElementTypeDataSources
      .filter(dataSource => dataSource.config.weatherForecastData === true)
      .map(dataSource => dataSource.code);

    const historicDataElementCodes = dataElementTypeDataSources
      .filter(dataSource => !dataSource.config.weatherForecastData)
      .map(dataSource => dataSource.code);

    if (forecastDataElementCodes.length > 0 && historicDataElementCodes.length > 0) {
      // no technical limitation, just not supported yet
      throw new Error(
        'Requesting both historic and forecast weather data in single call not supported',
      );
    }

    if (forecastDataElementCodes.length > 0) {
      const apiResultTranslator = new ApiResultTranslator(
        entities,
        resultFormat,
        forecastDataElementCodes,
      );

      return this.getForecastWeather(entities, startDate, endDate, apiResultTranslator);
    }
    if (historicDataElementCodes.length > 0) {
      const apiResultTranslator = new ApiResultTranslator(
        entities,
        resultFormat,
        historicDataElementCodes,
      );

      return this.getHistoricWeather(entities, startDate, endDate, apiResultTranslator);
    }

    return resultFormat === 'analytics' ? EMPTY_ANALYTICS_RESULTS : ([] as EventResults);
  }

  /**
   */
  public async pullMetadata(
    /* eslint-disable @typescript-eslint/no-unused-vars */
    dataSources: DataElement[],
    type: DataSourceType,
    options: BasePullMetadataOptions,
    /* eslint-enable @typescript-eslint/no-unused-vars */
  ) {
    const dataElements = await this.models.dataElement.find({
      service_type: 'weather',
    });

    const metadata = [];
    for (const dataElement of dataElements) {
      metadata.push({
        code: dataElement.code,
        // @ts-ignore
        name: dataElement.name,
      });
    }
    return metadata;
  }

  public async delete(): Promise<never> {
    throw new Error('Not supported');
  }

  public async push(): Promise<never> {
    throw new Error('Not supported');
  }

  private async extractDataSources(
    requestType: DataSourceType,
    requestDataSources: DataSource[],
  ): Promise<DataElement[]> {
    if (requestDataSources.length !== 1) {
      throw new Error('Weather service only supports pulling one data source at a time');
    }
    const [requestDataSource] = requestDataSources;
    const requestDataSourceCode = requestDataSource.code;

    let dataSources = null;
    if (requestType === this.dataSourceTypes.DATA_ELEMENT) {
      // single data element requested
      dataSources = await this.models.dataElement.find({
        code: requestDataSourceCode,
      });
    } else if (requestType === this.dataSourceTypes.DATA_GROUP) {
      // data group requested
      dataSources = await this.models.dataGroup.getDataElementsInDataGroup(requestDataSourceCode);
    }
    return dataSources as DataElement[];
  }

  /**
   * Get the entities we want weather information about.
   */
  private async fetchEntitiesMatchingCodes(codes: string[]) {
    const entities = await this.models.entity.find({ code: codes });

    if (entities.length === 0) {
      throw new Error('No entities selected');
    }

    return entities;
  }

  /**
   * @throws {ValidationError}
   */
  private validateOptions(
    options: Record<string, unknown>,
  ): asserts options is { [key: string]: unknown; startDate: string; endDate: string } {
    if (!options.startDate || !options.endDate) {
      throw new ValidationError('Empty date range not supported with weather service');
    }
  }

  /**
   * Fetch API data and return in format of events/analytics
   */
  private async getForecastWeather(
    entities: EntityType[],
    startDate: string,
    endDate: string,
    apiResultTranslator: ApiResultTranslator,
  ) {
    /*
     * Current weather uses the forecast weather API instead of the current weather API
     * because we want complete data on what will happen today (e.g. total rainfall), rather than
     * live data of what the weather is like at the moment.
     */
    const filterApiResultForDates = (apiResult: WeatherResult) => {
      const filteredData = apiResult.data.filter(
        entry => entry.datetime >= startDate && entry.datetime <= endDate,
      );
      return {
        ...apiResult,
        data: filteredData,
      };
    };

    // Run requests in parallel for performance
    const getDataForEntity = async (entity: EntityType) => {
      const { lat, lon } = entity.pointLatLon();

      // Maximum forecast is 16 days, we request all of it and filter it down to the dates we need.
      // Performance looks fine requesting 16 days.
      const days = 16;

      const apiResult = await this.api.forecastDaily(lat, lon, days);

      return {
        entityCode: entity.code,
        apiResult: filterApiResultForDates(apiResult),
      };
    };

    const apiRequests = entities.map(entity => getDataForEntity(entity));

    const wrappedApiResults = await Promise.all(apiRequests);

    const apiResultByEntityCode: Record<string, WeatherResult> = {};

    for (const wrappedApiResult of wrappedApiResults) {
      apiResultByEntityCode[wrappedApiResult.entityCode] = wrappedApiResult.apiResult;
    }

    return apiResultTranslator.translate(apiResultByEntityCode);
  }

  /**
   * Fetch API data and return in format of events/analytics
   */
  private async getHistoricWeather(
    entities: EntityType[],
    startDate: string,
    endDate: string,
    apiResultTranslator: ApiResultTranslator,
  ) {
    const {
      startDate: sanitisedStartDate,
      endDate: sanitisedEndDate,
    } = this.dateSanitiser.sanitiseHistoricDateRange(startDate, endDate);

    // Run requests in parallel for performance
    const getDataForEntity = async (entity: EntityType) => {
      const { lat, lon } = entity.pointLatLon();

      if (sanitisedStartDate === null || sanitisedEndDate === null) {
        return {
          entityCode: entity.code,
          apiResult: null,
        };
      }

      const apiResult = await this.api.historicDaily(
        lat,
        lon,
        sanitisedStartDate,
        sanitisedEndDate,
      );
      return {
        entityCode: entity.code,
        apiResult,
      };
    };

    const apiRequests = entities.map(entity => getDataForEntity(entity));

    const wrappedApiResults = await Promise.all(apiRequests);

    const apiResultByEntityCode: Record<string, WeatherResult | null> = {};

    for (const wrappedApiResult of wrappedApiResults) {
      apiResultByEntityCode[wrappedApiResult.entityCode] = wrappedApiResult.apiResult;
    }

    return apiResultTranslator.translate(apiResultByEntityCode);
  }

  private getResultFormat(type: DataSourceType) {
    switch (type) {
      case this.dataSourceTypes.DATA_ELEMENT:
        return 'analytics';
      case this.dataSourceTypes.DATA_GROUP:
        return 'events';
      default:
        throw new Error('Unknown format');
    }
  }
}
