import moment from 'moment';
import { Service } from '../Service';
import { ApiResultTranslator } from './ApiResultTranslator';
import { DateSanitiser } from './DateSanitiser';

const SUPPORTED_DATA_ELEMENT_CODES = ['MIN_TEMP', 'MAX_TEMP', 'PRECIP'];

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
    const dataElementCodes = this._dataElementCodes(type, dataSources);

    const entities = await this._getWeatherEntitiesByCode(options.organisationUnitCodes);

    const requestType = this._getRequestType(type);

    const apiResultTranslator = new ApiResultTranslator(entities, requestType, dataElementCodes);

    if (this._isRequestForCurrentWeather(options)) {
      return this._getCurrentWeather(entities, apiResultTranslator);
    }
    return this._getHistoricWeather(entities, options, apiResultTranslator);
  }

  /**
   * @inheritDoc
   */
  pullMetadata(dataSources, type) {
    const metadata = [];
    for (const dataElementCode of SUPPORTED_DATA_ELEMENT_CODES) {
      metadata.push({
        code: dataElementCode,
        name: dataElementCode,
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
  _dataElementCodes(type, dataSources) {
    let dataElementCodes = null;
    if (type === this.dataSourceTypes.DATA_ELEMENT) {
      // single data element requested
      dataElementCodes = [dataSources[0].code]; // FIXME: bad
    } else if (type === this.dataSourceTypes.DATA_GROUP) {
      // all data elements requested
      dataElementCodes = SUPPORTED_DATA_ELEMENT_CODES;
    }
    return dataElementCodes;
  }

  /**
   * Get the entities we want weather information about.
   *
   * @param string[] code
   * @returns {EntityType[]}
   * @private
   */
  async _getWeatherEntitiesByCode(code) {
    const entities = await this.models.entity.find({ code: code });

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
  _isRequestForCurrentWeather(options) {
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
  async _getCurrentWeather(entities, apiResultTranslator) {
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

    const apiResultByEntityCode = await this._getHistoricWeatherDataForEntities(
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
  async _getHistoricWeather(entities, options, apiResultTranslator) {
    const { startDate, endDate } = this.dateSanitiser.sanitise(options.startDate, options.endDate);

    const dateRangeByEntityCode = {};

    for (const entity of entities) {
      dateRangeByEntityCode[entity.code] = {
        startDate: startDate,
        endDate: endDate,
      };
    }

    const apiResultByEntityCode = await this._getHistoricWeatherDataForEntities(
      entities,
      dateRangeByEntityCode,
    );

    return apiResultTranslator.translate(apiResultByEntityCode);
  }

  /**
   * @param EntityType[] entities
   * @param Object.<entityCode: string: Object.<startDate: string, endDate: string> dateRangeByEntityCode
   * @returns {Promise<Object.<entityCode: string: apiResult: Object>>}
   * @private
   */
  async _getHistoricWeatherDataForEntities(entities, dateRangeByEntityCode) {
    // Run requests in parallel for performance
    const getDataForEntity = async entity => {
      const apiResult = await this.api.historicDaily(
        entity.pointLatLon().lat,
        entity.pointLatLon().lon,
        dateRangeByEntityCode[entity.code].startDate,
        dateRangeByEntityCode[entity.code].endDate,
      );
      return {
        entityCode: entity.code,
        apiResult: apiResult,
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
  _getRequestType(type) {
    switch (type) {
      case this.dataSourceTypes.DATA_ELEMENT:
        return 'analytics';
        break;
      case this.dataSourceTypes.DATA_GROUP:
        return 'events';
        break;
    }
    throw new Error('Unknown request type');
  }
}
