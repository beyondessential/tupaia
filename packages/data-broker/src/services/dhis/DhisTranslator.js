/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { mapKeys, reduceToDictionary } from '@tupaia/utils';
import { InboundAggregateDataTranslator } from './InboundAggregateDataTranslator';

export class DhisTranslator {
  constructor(models) {
    this.models = models;
    this.inboundAggregateDataTranslator = new InboundAggregateDataTranslator();
  }

  get dataSourceTypes() {
    return this.models.dataSource.getTypes();
  }

  getOutboundValue = async (api, dataElementCode, value) => {
    if (value === undefined) return value; // "delete" pushes don't include a value
    const options = await api.getOptionsForDataElement(dataElementCode);
    if (!options) return value; // no option set associated with that data element, use raw value
    const optionCode = options[value.toLowerCase()]; // Convert text to lower case so we can ignore case
    if (!optionCode) {
      throw new Error(`No option matching ${value} for data element ${dataElementCode}`);
    }
    return optionCode;
  };

  /**
   * If a group of data elements is not defined for a program, we cannot create
   * a `dataElementToSourceCode` mapping . In this case use the existing data value code
   */
  eventDataElementToSourceCode = (dataElement, dataElementToSourceCode) =>
    dataElementToSourceCode[dataElement] || dataElement;

  /**
   * @param {Object}     dataValue    The untranslated data value
   * @param {DataSource} dataSource
   */
  translateOutboundDataValue = async (api, { code, value, ...restOfDataValue }, dataSource) => {
    const { dataElementCode } = dataSource;
    const valueToPush = await this.getOutboundValue(api, dataElementCode, value);

    const outboundDataValue = {
      dataElement: dataElementCode,
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

  async translateOutboundEventDataValues(api, dataValues) {
    const dataSources = await this.models.dataSource.findOrDefault({
      code: dataValues.map(({ code }) => code),
      type: this.dataSourceTypes.DATA_ELEMENT,
    });
    const outboundDataValues = await Promise.all(
      dataValues.map((d, i) => this.translateOutboundDataValue(api, d, dataSources[i])),
    );
    const dataElementCodes = outboundDataValues.map(({ dataElement }) => dataElement);
    const dataElementIds = await api.getIdsFromCodes(
      api.getResourceTypes().DATA_ELEMENT,
      dataElementCodes,
    );
    const dataValuesWithIds = outboundDataValues.map((d, i) => ({
      ...d,
      dataElement: dataElementIds[i],
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
