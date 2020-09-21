import moment from 'moment';
import { Service } from '../Service';
import { ApiResultTranslator } from './ApiResultTranslator';
import { DateSanitiser } from './DateSanitiser';

export class WeatherService extends Service {
  /**
   * @param Object.<key: string, value: DatabaseModel> models
   * @param WeatherApi api
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
    const dataElementCodes = await this.extractDataElementCodes(type, dataSources);

    const entities = await this.fetchEntitiesMatchingCodes(options.organisationUnitCodes);

    const resultFormat = this.getResultFormat(type);

    const apiResultTranslator = new ApiResultTranslator(entities, resultFormat, dataElementCodes);

    if (this.isRequestForCurrentWeather(options)) {
      return this.getCurrentWeather(entities, apiResultTranslator);
    }
    return this.getHistoricWeather(entities, options, apiResultTranslator);
  }

  /**
   * @inheritDoc
   */
  async pullMetadata(dataSources, type) {
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
    return Promise.resolve(metadata);
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
   * @param string type see pull()
   * @param {} dataSources see pull()
   * @returns {string[]}
   * @private
   */
  async extractDataElementCodes(type, dataSources) {
    if (dataSources.length !== 1) {
      throw new Error('Weather service only supports pulling one data source at a time');
    }
    const [dataSource] = dataSources;
    const { code } = dataSource;

    let dataElementCodes = null;
    if (type === this.dataSourceTypes.DATA_ELEMENT) {
      // single data element requested
      return [code];
    } else if (type === this.dataSourceTypes.DATA_GROUP) {
      // data group requested
      const dataElements = await this.models.dataSource.getDataElementsInGroup(code);
      dataElementCodes = dataElements.map(element => element.code);
    }
    return dataElementCodes;
  }

  /**
   * Get the entities we want weather information about.
   *
   * @param string[] codes
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
   * @param options
   * @returns {boolean}
   * @private
   */
  isRequestForCurrentWeather(options) {
    return !options.startDate && !options.endDate;
  }

  /**
   * Fetch API data and return in format of events/analytics
   *
   * @param EntityType[] entities
   * @param string type
   * @param string[] dataElementCodes
   * @returns {Promise<Object.<results: Object[], metadata: Object>>}
   * @private
   */
  async getCurrentWeather(entities, apiResultTranslator) {
    /*
     * Current weather uses the historic weather API instead of the current weather API
     * because we want complete data on what happened yesterday (e.g. total rainfall), rather than
     * live data of what the weather is like at the moment.
     *
     * We also need to take into account the Entity's timezone, because Tupaia's server's yesterday
     * is different from the Entity's yesterday.
     */
    const dateRangeByEntityCode = {};

    for (const entity of entities) {
      const startDate = moment
        .tz(entity.timezone)
        .startOf('day')
        .subtract(1, 'day')
        .format('YYYY-MM-DD');

      const endDate = moment
        .tz(entity.timezone)
        .startOf('day')
        .format('YYYY-MM-DD');

      dateRangeByEntityCode[entity.code] = {
        startDate: startDate,
        endDate: endDate,
      };
    }

    const apiResultByEntityCode = await this.getHistoricWeatherDataForEntities(
      entities,
      dateRangeByEntityCode,
    );

    return apiResultTranslator.translate(apiResultByEntityCode);
  }

  /**
   * Fetch API data and return in format of events/analytics
   *
   * @param EntityType[] entities
   * @param string type
   * @param string[] dataElementCodes
   * @param options
   * @returns {Promise<Object.<results: Object[], metadata: Object>>}
   * @private
   */
  async getHistoricWeather(entities, options, apiResultTranslator) {
    const { startDate, endDate } = this.dateSanitiser.sanitiseHistoricDateRange(
      options.startDate,
      options.endDate,
    );

    const dateRangeByEntityCode = {};

    for (const entity of entities) {
      dateRangeByEntityCode[entity.code] = {
        startDate: startDate,
        endDate: endDate,
      };
    }

    const apiResultByEntityCode = await this.getHistoricWeatherDataForEntities(
      entities,
      dateRangeByEntityCode,
    );

    return apiResultTranslator.translate(apiResultByEntityCode);
  }

  /**
   * Fetch data from the API
   *
   * Note: we pass in individual start/end dates because each entity may have a different local-time start/end
   * date if they are in different timezones.
   *
   * @param EntityType[] entities
   * @param Object.<entityCode: string: Object.<startDate: string, endDate: string> dateRangeByEntityCode
   * @returns {Promise<Object.<entityCode: string: apiResult: Object|null>>}
   * @private
   */
  async getHistoricWeatherDataForEntities(entities, dateRangeByEntityCode) {
    // Run requests in parallel for performance
    const getDataForEntity = async entity => {
      const { lat, lon } = entity.pointLatLon();
      const { startDate, endDate } = dateRangeByEntityCode[entity.code];

      if (startDate === null || endDate === null) {
        return {
          entityCode: entity.code,
          apiResult: null,
        };
      }

      const apiResult = await this.api.historicDaily(lat, lon, startDate, endDate);
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

    return apiResultByEntityCode;
  }

  /**
   * @param type
   * @returns {string}
   * @private
   */
  getResultFormat(type) {
    switch (type) {
      case this.dataSourceTypes.DATA_ELEMENT:
        return 'analytics';
        break;
      case this.dataSourceTypes.DATA_GROUP:
        return 'events';
        break;
    }
    throw new Error('Unknown format');
  }
}
