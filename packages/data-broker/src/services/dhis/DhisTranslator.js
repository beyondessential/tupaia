/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';
import { reduceToDictionary } from '@tupaia/utils';
import { InboundAggregateDataTranslator } from './InboundAggregateDataTranslator';
import { formatDateForDHIS2 } from './formatDateForDHIS2';

// data element value types, taken from https://docs.dhis2.org/2.33/en/developer/html/dhis2_developer_manual_full.html#webapi_csv_data_elements
const INTEGER = 'INTEGER';
const NUMBER = 'NUMBER';
const UNIT_INTERVAL = 'UNIT_INTERVAL';
const PERCENTAGE = 'PERCENTAGE';
const INTEGER_POSITIVE = 'INTEGER_POSITIVE';
const INTEGER_NEGATIVE = 'INTEGER_NEGATIVE';
const INTEGER_ZERO_OR_POSITIVE = 'INTEGER_ZERO_OR_POSITIVE';
const FILE_RESOURCE = 'FILE_RESOURCE';
const COORDINATE = 'COORDINATE';
const TEXT = 'TEXT';
const LONG_TEXT = 'LONG_TEXT';
const LETTER = 'LETTER';
const PHONE_NUMBER = 'PHONE_NUMBER';
const EMAIL = 'EMAIL';
const BOOLEAN = 'BOOLEAN';
const TRUE_ONLY = 'TRUE_ONLY';
const DATE = 'DATE';
const DATETIME = 'DATETIME';

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
    switch (valueType) {
      // numbers
      case INTEGER:
      case NUMBER:
      case UNIT_INTERVAL:
      case PERCENTAGE:
      case INTEGER_POSITIVE:
      case INTEGER_NEGATIVE:
      case INTEGER_ZERO_OR_POSITIVE:
        return parseFloat(value).toString();

      // booleans
      case BOOLEAN:
      case TRUE_ONLY:
        if (value === 'Yes') return '1';
        if (value === 'No') return '0';
        throw new Error(`Unsupported boolean value "${value}" was provided for ${dataElementCode}`);

      // dates
      case DATE:
      case DATETIME:
        return formatDateForDHIS2(value);

      // plain text
      case TEXT:
      case LONG_TEXT:
      case PHONE_NUMBER:
      case EMAIL:
        return value;

      // unsupported
      default:
      case FILE_RESOURCE:
      case LETTER:
      case COORDINATE:
        throw new Error(`Unsupported data element type ${valueType} is set for ${dataElementCode}`);
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
    const dataElementsByCode = await this.fetchOutboundDataElementsByCode(dataSources);
    const translatedDataValues = dataSources.map((dataSource, i) => {
      const dataValue = dataValues[i];
      return this.translateOutboundDataValue(
        dataValue,
        dataSource,
        dataElementsByCode[dataSource.dataElementCode],
      );
    });
    return translatedDataValues;
  };

  async translateOutboundEventDataValues(api, dataValues) {
    const dataSources = await this.models.dataSource.findOrDefault({
      code: dataValues.map(({ code }) => code),
      type: this.dataSourceTypes.DATA_ELEMENT,
    });
    const outboundDataValues = await this.translateOutboundDataValues(api, dataValues, dataSources);
    const dataElementCodes = outboundDataValues.map(({ dataElement }) => dataElement);
    const dataElementCodeToId = await api.getCodeToId(
      api.getResourceTypes().DATA_ELEMENT,
      dataElementCodes,
    );
    const dataValuesWithIds = outboundDataValues.map(({ dataElement, value }) => ({
      dataElement: dataElementCodeToId[dataElement],
      value,
    }));
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
