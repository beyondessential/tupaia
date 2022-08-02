/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';

import { translateElementKeysInEventAnalytics } from '@tupaia/dhis-api';
import { mapKeys, reduceToDictionary } from '@tupaia/utils';
import { InboundAnalyticsTranslator } from './InboundAnalyticsTranslator';
import { parseValueForDhis } from './parseValueForDhis';
import { DATA_SOURCE_TYPES } from '../../../utils';

export class DhisTranslator {
  constructor(models) {
    this.models = models;
    this.inboundAnalyticsTranslator = new InboundAnalyticsTranslator();
    this.dataElementsByCode = {};
  }

  get dataSourceTypes() {
    return DATA_SOURCE_TYPES;
  }

  getOutboundValue = (dataElement, value) => {
    if (value === undefined) return value; // "delete" pushes don't include a value
    const { options, code: dataElementCode, valueType } = dataElement;
    if (options) {
      const optionCode = options[value.toLowerCase()]; // Convert text to lower case so we can ignore case
      if (!optionCode) {
        throw new Error(`No option matching ${value} for data element ${dataElementCode}`);
      }
      return optionCode;
    }
    // not using an option set, parse the value according to the data element type
    try {
      return parseValueForDhis(value, valueType);
    } catch (error) {
      throw new Error(`Could not parse ${dataElementCode}: ${error.message}`);
    }
  };

  fetchOutboundDataElementsByCode = async (api, dataSources) => {
    const dataElementCodes = [...new Set(dataSources.map(d => d.dataElementCode))];
    const dataElements = await api.fetchDataElements(dataElementCodes, {
      includeOptions: true,
      additionalFields: ['valueType'],
    });
    const codesFound = dataElements.map(de => de.code);
    const codesNotFound = dataElementCodes.filter(c => !codesFound.includes(c));
    if (codesNotFound.length > 0) {
      throw new Error(
        `The following data elements were not found on DHIS2 during push: ${codesNotFound}`,
      );
    }
    // invert options from { code: name } to { name: code }, and transform the name to lower case,
    // because that's the way they're used during outbound translation
    const dataElementsWithTranslatedOptions = dataElements.map(
      ({ options, ...restOfDataElement }) => ({
        options:
          options &&
          Object.entries(options).reduce(
            (translatedOptions, [code, name]) => ({
              ...translatedOptions,
              [name.toLowerCase()]: code,
            }),
            {},
          ),
        ...restOfDataElement,
      }),
    );
    return keyBy(dataElementsWithTranslatedOptions, 'code');
  };

  /**
   * @param {Object}     dataValue    The untranslated data value
   * @param {DataSourceType} dataSource
   */
  translateOutboundDataValue = ({ code, value, ...restOfDataValue }, dataSource, dataElement) => {
    const valueToPush = this.getOutboundValue(dataElement, value);

    const outboundDataValue = {
      dataElement: dataElement.code,
      value: valueToPush,
      ...restOfDataValue,
    };

    // add category option combo code if defined
    const { categoryOptionCombo } = dataSource.config;
    if (categoryOptionCombo) {
      outboundDataValue.categoryOptionCombo = categoryOptionCombo;
    }

    return outboundDataValue;
  };

  translateOutboundDataValues = async (api, dataValues, dataSources) => {
    // prefetch options and types for unique data element codes so that DHIS2 doesn't get overwhelmed
    const dataSourcesByCode = keyBy(dataSources, 'code');
    const dataElementsByCode = await this.fetchOutboundDataElementsByCode(api, dataSources);
    return dataValues.map(dataValue => {
      const dataSource = dataSourcesByCode[dataValue.code];
      const dataElement = dataElementsByCode[dataSource.dataElementCode];
      return this.translateOutboundDataValue(dataValue, dataSource, dataElement);
    });
  };

  async translateOutboundEventDataValues(api, dataValues) {
    const dataSources = await this.models.dataElement.find({
      code: dataValues.map(({ code }) => code),
    });
    const dataElementsByCode = await this.fetchOutboundDataElementsByCode(api, dataSources);
    const outboundDataValues = await this.translateOutboundDataValues(api, dataValues, dataSources);
    const dataValuesWithIds = outboundDataValues.map(({ dataElement: dataElementCode, value }) => {
      const dataElement = dataElementsByCode[dataElementCode];
      if (!dataElement) {
        throw new Error(`Missing id for data element ${dataElementCode} in event push`);
      }
      return {
        dataElement: dataElement.id,
        value,
      };
    });
    return dataValuesWithIds;
  }

  async translateOutboundEvent(api, { dataValues, ...restOfEvent }) {
    const translatedDataValues = await this.translateOutboundEventDataValues(api, dataValues);
    return { ...restOfEvent, dataValues: translatedDataValues };
  }

  translateInboundAnalytics = (response, dataSources) => {
    return this.inboundAnalyticsTranslator.translate(response, dataSources);
  };

  async translateInboundEvents(events, dataGroupCode) {
    const dataElementsInGroup = await this.models.dataGroup.getDataElementsInDataGroup(
      dataGroupCode,
    );
    const dataElementToSourceCode = reduceToDictionary(
      dataElementsInGroup,
      'dataElementCode',
      'code',
    );

    return events.map(({ dataValues, ...restOfEvent }) => ({
      ...restOfEvent,
      dataValues: mapKeys(dataValues, dataElementToSourceCode, { defaultToExistingKeys: true }),
    }));
  }

  translateInboundEventAnalytics = async (eventAnalytics, dataElementSources) => {
    const dataElementToSourceCode = reduceToDictionary(
      dataElementSources,
      'dataElementCode',
      'code',
    );
    return translateElementKeysInEventAnalytics(eventAnalytics, dataElementToSourceCode);
  };

  translateInboundDataElements = (dataElements, dataSources) => {
    const dataElementToSourceCode = reduceToDictionary(dataSources, 'dataElementCode', 'code');

    return dataElements.map(({ code, ...restOfDataElement }) => {
      const translatedDataElement = { ...restOfDataElement };
      if (code) {
        translatedDataElement.code = dataElementToSourceCode[code];
      }
      return translatedDataElement;
    });
  };

  translateInboundIndicators = (indicators, dataSources) => {
    const indicatorIdToSourceCode = reduceToDictionary(dataSources, d => d.config?.dhisId, 'code');

    return indicators.map(({ code, ...restOfIndicators }) => {
      const translatedIndicators = { ...restOfIndicators };
      const { id } = translatedIndicators;
      if (!translatedIndicators.code && id) {
        translatedIndicators.code = indicatorIdToSourceCode[id];
      }
      return translatedIndicators;
    });
  };
}
