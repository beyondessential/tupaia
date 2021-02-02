/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';

import { translateElementKeysInEventAnalytics } from '@tupaia/dhis-api';
import { reduceToDictionary } from '@tupaia/utils';
import { InboundAggregateDataTranslator } from './InboundAggregateDataTranslator';
import { parseValueForDhis } from './parseValueForDhis';

export class DhisTranslator {
  constructor(models) {
    this.models = models;
    this.inboundAggregateDataTranslator = new InboundAggregateDataTranslator();
    this.dataElementsByCode = {};
  }

  get dataSourceTypes() {
    return this.models.dataSource.getTypes();
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

  /**
   * If a group of data elements is not defined for a program, we cannot create
   * a `dataElementToSourceCode` mapping . In this case use the existing data value code
   */
  eventDataElementToSourceCode = (dataElement, dataElementToSourceCode) =>
    dataElementToSourceCode[dataElement] || dataElement;

  fetchOutboundDataElementsByCode = async (api, dataSources) => {
    const dataElementCodes = [...new Set(dataSources.map(d => d.dataElementCode))];
    const dataElements = await api.fetchDataElements(dataElementCodes, {
      includeOptions: true,
      additionalFields: ['valueType'],
    });
    if (dataElements.length !== dataElementCodes.length) {
      throw new Error('Not all data elements attempting to be pushed could be found on DHIS2');
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
    const dataElementsByCode = await this.fetchOutboundDataElementsByCode(api, dataSources);
    return dataSources.map((dataSource, i) =>
      this.translateOutboundDataValue(
        dataValues[i],
        dataSource,
        dataElementsByCode[dataSource.dataElementCode],
      ),
    );
  };

  async translateOutboundEventDataValues(api, dataValues) {
    const dataSources = await this.models.dataSource.find({
      code: dataValues.map(({ code }) => code),
      type: this.dataSourceTypes.DATA_ELEMENT,
    });
    const dataElementsByCode = await this.fetchOutboundDataElementsByCode(api, dataSources);
    const outboundDataValues = dataSources.map((dataSource, i) =>
      this.translateOutboundDataValue(
        dataValues[i],
        dataSource,
        dataElementsByCode[dataSource.dataElementCode],
      ),
    );
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

  translateInboundAggregateData = (response, dataSources) => {
    return this.inboundAggregateDataTranslator.translate(response, dataSources);
  };

  translateInboundEventDataValues = (dataValues, dataElementToSourceCode) => {
    const translateEventDataValues = Array.isArray(dataValues)
      ? this.translateInboundArrayEventDataValues
      : this.translateInboundObjectEventDataValues;
    return translateEventDataValues(dataValues, dataElementToSourceCode);
  };

  translateInboundArrayEventDataValues = (dataValues, dataElementToSourceCode) =>
    dataValues.map(dataValue => this.translateInboundDataValue(dataValue, dataElementToSourceCode));

  translateInboundObjectEventDataValues = (dataValues, dataElementToSourceCode) =>
    Object.entries(dataValues).reduce((dataValueMap, [dataElement, dataValue]) => {
      const dataSourceCode = this.eventDataElementToSourceCode(
        dataElement,
        dataElementToSourceCode,
      );
      const translatedDataValue = this.translateInboundDataValue(
        dataValue,
        dataElementToSourceCode,
      );
      return { ...dataValueMap, [dataSourceCode]: translatedDataValue };
    }, {});

  translateInboundDataValue = ({ dataElement, ...restOfDataValue }, dataElementToSourceCode) => ({
    ...restOfDataValue,
    dataElement: this.eventDataElementToSourceCode(dataElement, dataElementToSourceCode),
  });

  async translateInboundEvents(events, dataGroupCode) {
    const dataElementsInGroup = await this.models.dataSource.getDataElementsInGroup(dataGroupCode);
    const dataElementToSourceCode = reduceToDictionary(
      dataElementsInGroup,
      'dataElementCode',
      'code',
    );

    return events.map(({ dataValues, ...restOfEvent }) => ({
      ...restOfEvent,
      dataValues: this.translateInboundEventDataValues(dataValues, dataElementToSourceCode),
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
}
