/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { mapKeys, mapValues } from '@tupaia/utils';

export class DhisTranslator {
  constructor(models) {
    this.models = models;
  }

  get dataSourceTypes() {
    return this.models.dataSource.getTypes();
  }

  dataSourceToElementCode = dataSource => dataSource.config.dataElementCode || dataSource.code;

  getDataElementToSourceCode = dataSources =>
    dataSources.reduce((dataElementToSourceCode, dataSource) => {
      const dataElementCode = this.dataSourceToElementCode(dataSource);
      return { ...dataElementToSourceCode, [dataElementCode]: dataSource.code };
    }, {});

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
   * @param {Object}     dataValue    The untranslated data value
   * @param {DataSource} dataSource
   */
  translateOutboundDataValue = async (api, { code, value, ...restOfDataValue }, dataSource) => {
    const dataElementCode = this.dataSourceToElementCode(dataSource);
    const valueToPush = await this.getOutboundValue(api, dataElementCode, value);

    const outboundDataValue = {
      dataElement: dataElementCode,
      value: valueToPush,
      ...restOfDataValue,
    };

    // add category option combo code if defined
    const { categoryOptionCombo } = dataSource.config;
    if (categoryOptionCombo) {
      outboundDataValue.categoryOptionCombo = await api.getIdFromCode(
        api.getResourceTypes().CATEGORY_OPTION_COMBO,
        categoryOptionCombo,
      );
    }

    return outboundDataValue;
  };

  translateInboundDataValues = (dataValues, dataElementToSourceCode) =>
    dataValues.map(({ dataElement, ...restOfResult }) => ({
      ...restOfResult,
      dataElement: dataElementToSourceCode[dataElement],
    }));

  translateInboundMetadata = (metadata, dataElementToSourceCode) => {
    const { dataElementCodeToName, dataElementIdToCode } = metadata;

    return {
      ...metadata,
      dataElementCodeToName: mapKeys(dataElementCodeToName, dataElementToSourceCode),
      dataElementIdToCode: mapValues(dataElementIdToCode, dataElementToSourceCode),
    };
  };

  translateInboundAnalytics = ({ results, metadata }, dataSources) => {
    const dataElementToSourceCode = this.getDataElementToSourceCode(dataSources);

    return {
      results: this.translateInboundDataValues(results, dataElementToSourceCode),
      metadata: this.translateInboundMetadata(metadata, dataElementToSourceCode),
    };
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

  /**
   * @param {(Array<{ dataElement }>|Object<string, string>} dataValues
   * @returns {(Array<{ dataElement }>|Object<string, string>}
   */
  translateInboundEventDataValues = (dataValues, dataElementToSourceCode) => {
    return Array.isArray(dataValues)
      ? dataValues.map(({ dataElement, ...restOfDataValue }) => ({
          ...restOfDataValue,
          dataElement: dataElementToSourceCode[dataElement] || dataElement,
        }))
      : mapKeys(dataValues, dataElementToSourceCode, { defaultToExistingKeys: true });
  };

  async translateInboundEvents(events, dataGroupCode) {
    const dataElementsInGroup = await this.models.dataSource.getDataElementsInGroup(dataGroupCode);
    const dataElementToSourceCode = this.getDataElementToSourceCode(dataElementsInGroup);

    return events.map(({ dataValues, ...restOfEvent }) => ({
      ...restOfEvent,
      dataValues: this.translateInboundEventDataValues(dataValues, dataElementToSourceCode),
    }));
  }
}
