/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';

import type { DhisApi } from '@tupaia/dhis-api';
import { DataElementMetadata, DataElementModel } from '../../../types';
import { DataElement } from '../types';
import { DhisTranslator } from '../translators';
import type { PullMetadataOptions as BasePullMetadataOptions } from '../../Service';

export type PullDataElementsOptions = BasePullMetadataOptions &
  Partial<{
    additionalFields: string[];
    includeOptions: boolean;
  }>;

export class DataElementsMetadataPuller {
  private readonly dataSourceModel: DataElementModel;
  private readonly translator: DhisTranslator;

  public constructor(dataSourceModel: DataElementModel, translator: DhisTranslator) {
    this.dataSourceModel = dataSourceModel;
    this.translator = translator;
  }

  private groupDataSourcesByDhisDataType = (dataSources: DataElement[]) =>
    groupBy(
      dataSources,
      d => d.config?.dhisDataType || this.dataSourceModel.getDhisDataTypes().DATA_ELEMENT,
    );

  public pull = async (
    api: DhisApi,
    dataSources: DataElement[],
    options: PullDataElementsOptions,
  ) => {
    const dataSourcesByDhisType = this.groupDataSourcesByDhisDataType(dataSources);
    let metadata: DataElementMetadata[] = [];

    for (const entry of Object.entries(dataSourcesByDhisType)) {
      const [dhisDataType, groupedDataSources] = entry;
      const dataElementCodes = groupedDataSources.map(({ dataElementCode }) => dataElementCode);
      if (dhisDataType === this.dataSourceModel.getDhisDataTypes().INDICATOR) {
        const indicators = await api.fetchIndicators({ dataElementCodes });
        const results = this.translator.translateInboundIndicators(indicators, groupedDataSources);
        metadata = metadata.concat(results);
      } else {
        const { additionalFields, includeOptions } = options;
        const dataElements = await api.fetchDataElements(dataElementCodes, {
          additionalFields,
          includeOptions,
        });
        const results = this.translator.translateInboundDataElements(
          dataElements,
          groupedDataSources,
        );
        metadata = metadata.concat(results);
      }
    }

    return metadata;
  };
}
