import { ValidationError } from '@tupaia/utils';
import { Service } from '../Service';
import { ApiResultTranslator } from './ApiResultTranslator';
import { DateSanitiser } from './DateSanitiser';

export class WeatherService extends Service {
  /**
   * @param {Object.<string, DatabaseModel>} models
   * @param {WeatherApi} api
   */
  constructor(models, api) {
    super(models);
    this.api = api;
    this.dateSanitiser = new DateSanitiser();
  }

  /**
   * Note, if no period specified will return current weather
   * @inheritDoc
   */
  async pull(dataSources, type, options = {}) {
    this.validateOptions(options);

    const { startDate, endDate } = options;

    const resultFormat = this.getResultFormat(type);

    const entities = await this.fetchEntitiesMatchingCodes(options.organisationUnitCodes);

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
  }

  /**
   * @inheritDoc
   */
  // eslint-disable-next-line no-unused-vars
  async pullMetadata(dataSources, type, options) {
    const dataElements = await this.models.dataSource.find({
      type: 'dataElement',
      service_type: 'weather',
    });

    const metadata = [];
    for (const dataElement of dataElements) {
      metadata.push({
        code: dataElement.code,
        name: dataElement.name,
      });
    }
    return metadata;
  }

  /**
   * @inheritDoc
   */
  async delete() {
    throw new Error('Not supported');
  }

  /**
   * @inheritDoc
   */
  async push() {
    throw new Error('Not supported');
  }

  /**
   * @param {string} requestType see pull()
   * @param {{}} requestDataSources see pull()
   * @returns {DataSourceType[]} array of DataSource with type dataElement
   * @private
   */
  async extractDataSources(requestType, requestDataSources) {
    if (requestDataSources.length !== 1) {
      throw new Error('Weather service only supports pulling one data source at a time');
    }
    const [requestDataSource] = requestDataSources;
    const requestDataSourceCode = requestDataSource.code;

    let dataSources = null;
    if (requestType === this.dataSourceTypes.DATA_ELEMENT) {
      // single data element requested
      dataSources = await this.models.dataSource.find({
        type: 'dataElement',
        code: requestDataSourceCode,
      });
    } else if (requestType === this.dataSourceTypes.DATA_GROUP) {
      // data group requested
      dataSources = await this.models.dataSource.getDataElementsInGroup(requestDataSourceCode);
    }
    return dataSources;
  }

  /**
   * Get the entities we want weather information about.
   *
   * @param {string[]} codes
   * @returns {EntityType[]}
   * @private
   */
  async fetchEntitiesMatchingCodes(codes) {
    const entities = await this.models.entity.find({ code: codes });

    if (entities.length === 0) {
      throw new Error('No entities selected');
    }

    return entities;
  }

  /**
   * @param {*} options
   * @throws {ValidationError}
   * @private
   */
  validateOptions(options) {
    if (!options.startDate || !options.endDate) {
      throw new ValidationError('Empty date range not supported with weather service');
    }
  }

  /**
   * Fetch API data and return in format of events/analytics
   *
   * @param {EntityType[]} entities
   * @param {string} startDate
   * @param {string} endDate
   * @param {ApiResultTranslator} apiResultTranslator
   * @returns {Promise<Object.<results: {Object[]}, metadata: {}>>}
   * @private
   */
  async getForecastWeather(entities, startDate, endDate, apiResultTranslator) {
    /*
     * Current weather uses the forecast weather API instead of the current weather API
     * because we want complete data on what will happen today (e.g. total rainfall), rather than
     * live data of what the weather is like at the moment.
     */
    const filterApiResultForDates = apiResult => {
      const filteredData = apiResult.data.filter(
        entry => entry.datetime >= startDate && entry.datetime <= endDate,
      );
      return {
        ...apiResult,
        data: filteredData,
      };
    };

    // Run requests in parallel for performance
    const getDataForEntity = async entity => {
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

    const apiResultByEntityCode = {};

    for (const wrappedApiResult of wrappedApiResults) {
      apiResultByEntityCode[wrappedApiResult.entityCode] = wrappedApiResult.apiResult;
    }

    return apiResultTranslator.translate(apiResultByEntityCode);
  }

  /**
   * Fetch API data and return in format of events/analytics
   *
   * @param {EntityType[]} entities
   * @param {string} startDate
   * @param {string} endDate
   * @param {ApiResultTranslator} apiResultTranslator
   * @returns {Promise<Object.<results: Object[], metadata: Object>>}
   * @private
   */
  async getHistoricWeather(entities, startDate, endDate, apiResultTranslator) {
    const {
      startDate: sanitisedStartDate,
      endDate: sanitisedEndDate,
    } = this.dateSanitiser.sanitiseHistoricDateRange(startDate, endDate);

    // Run requests in parallel for performance
    const getDataForEntity = async entity => {
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

    const apiResultByEntityCode = {};

    for (const wrappedApiResult of wrappedApiResults) {
      apiResultByEntityCode[wrappedApiResult.entityCode] = wrappedApiResult.apiResult;
    }

    return apiResultTranslator.translate(apiResultByEntityCode);
  }

  /**
   * @param {string} type - one of DataSource.DATA_SOURCE_TYPES
   * @returns {string}
   * @private
   */
  getResultFormat(type) {
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
