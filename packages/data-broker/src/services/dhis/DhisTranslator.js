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

  /**
   * @param {Object}     dataValue    The untranslated data value
   * @param {DataSource} dataSource   Note that this may not be the instance's primary data source
   */
  translateOutboundDataValue = ({ code, ...restOfDataValue }, dataSource) => ({
    dataElement: this.dataSourceToElementCode(dataSource),
    ...restOfDataValue,
  });

  translateInboundDataValues = (dataValue, dataElementToSourceCode) =>
    dataValue.map(({ dataElement, ...restOfResult }) => ({
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

  translateInboundAggregateData = ({ results, metadata }, dataSources) => {
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
    const dataValuesWithCodeReplaced = dataValues.map((d, i) =>
      this.translateOutboundDataValue(d, dataSources[i]),
    );
    const dataElementCodes = dataValuesWithCodeReplaced.map(({ dataElement }) => dataElement);
    const dataElementIds = await api.getIdsFromCodes(
      api.getResourceTypes().DATA_ELEMENT,
      dataElementCodes,
    );
    const dataValuesWithIds = dataValuesWithCodeReplaced.map((d, i) => ({
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
