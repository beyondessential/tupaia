/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';

export class DataGroupMetadataPuller {
  constructor(dataGroupModel, translator) {
    this.dataSourceModel = dataGroupModel;
    this.translator = translator;
  }

  groupDataSourcesByDhisDataType = dataSources =>
    groupBy(
      dataSources,
      d => d.config?.dhisDataType || this.dataSourceModel.getDhisDataTypes().DATA_ELEMENT,
    );

  pull = async (api, dataSources, options) => {
    if (dataSources.length > 1) {
      throw new Error('Cannot pull metadata from multiple programs at the same time');
    }
    const { includeOptions } = options;
    const [dataSource] = dataSources;
    const { code: dataGroupCode } = dataSource;
    const dataElementDataSources = await this.dataSourceModel.getDataElementsInDataGroup(
      dataGroupCode,
    );
    const dataElementCodes = dataElementDataSources.map(({ code }) => code);
    // const dataElementMetadata = await api.fetchDataElements(dataElementCodes, {
    //   includeOptions,
    // });
    // return { dataElements: dataElementMetadata };
    return api.fetchDataGroup(dataGroupCode, dataElementCodes, includeOptions);
  };
}
