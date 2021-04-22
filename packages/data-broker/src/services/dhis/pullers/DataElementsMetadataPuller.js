/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';

export class DataElementsMetadataPuller {
  constructor(dataSourceModel, translator) {
    this.dataSourceModel = dataSourceModel;
    this.translator = translator;
  }

  groupDataSourcesByDhisDataType = dataSources =>
    groupBy(
      dataSources,
      d => d.config?.dhisDataType || this.dataSourceModel.getDhisDataTypes().DATA_ELEMENT,
    );

  pull = async (api, dataSources, options) => {
    const dataSourcesByDhisType = this.groupDataSourcesByDhisDataType(dataSources);
    const metadata = [];

    for (const entry of Object.entries(dataSourcesByDhisType)) {
      const [dhisDataType, groupedDataSources] = entry;
      const dataElementCodes = groupedDataSources.map(({ dataElementCode }) => dataElementCode);
      if (dhisDataType === this.dataSourceModel.getDhisDataTypes().INDICATOR) {
        const indicators = await api.fetchIndicators({ dataElementCodes });
        metadata.push(
          ...this.translator.translateInboundIndicators(indicators, groupedDataSources),
        );
      } else {
        const { additionalFields, includeOptions } = options;
        const dataElements = await api.fetchDataElements(dataElementCodes, {
          additionalFields,
          includeOptions,
        });
        metadata.push(
          ...this.translator.translateInboundDataElements(dataElements, groupedDataSources),
        );
      }
    }

    return metadata;
  };
}
