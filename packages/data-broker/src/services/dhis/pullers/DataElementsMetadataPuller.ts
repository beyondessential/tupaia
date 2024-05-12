/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';

import type { DhisApi } from '@tupaia/dhis-api';
import { isNotNullish } from '@tupaia/tsutils';
import { DataElementModel } from '../../../types';
import { DataServiceMapping } from '../../DataServiceMapping';
import { DataElement } from '../types';
import { DhisTranslator } from '../translators';

export type PullDataElementsMetadataOptions = {
  dataServiceMapping: DataServiceMapping;
  additionalFields?: string[];
  includeOptions?: boolean;
};

export class DataElementsMetadataPuller {
  private readonly dataElementModel: DataElementModel;
  private readonly translator: DhisTranslator;

  public constructor(dataElementModel: DataElementModel, translator: DhisTranslator) {
    this.dataElementModel = dataElementModel;
    this.translator = translator;
  }

  private groupDataElementsByDhisDataType = (dataElements: DataElement[]) =>
    groupBy(
      dataElements,
      d => d.config?.dhisDataType || this.dataElementModel.getDhisDataTypes().DATA_ELEMENT,
    );

  public pull = async (
    api: DhisApi,
    dataElements: DataElement[],
    options: PullDataElementsMetadataOptions,
  ) => {
    const dataElementsByDhisType = this.groupDataElementsByDhisDataType(dataElements);
    const metadata = [];

    for (const entry of Object.entries(dataElementsByDhisType)) {
      const [dhisDataType, groupedDataElements] = entry;
      const dataElementCodes = groupedDataElements.map(({ dataElementCode }) => dataElementCode);
      if (dhisDataType === this.dataElementModel.getDhisDataTypes().INDICATOR) {
        const indicators = await api.fetchIndicators({ dataElementCodes });
        metadata.push(
          ...this.translator.translateInboundIndicators(indicators, groupedDataElements),
        );
      } else {
        const categoryOptionComboCodes = groupedDataElements
          .map(ds => ds.config?.categoryOptionCombo)
          .filter(isNotNullish);
        const { additionalFields, includeOptions } = options;
        const fetchedDataElements = await api.fetchDataElements(dataElementCodes, {
          additionalFields,
          includeOptions,
        });
        const categoryOptionCombos = await api.fetchCategoryOptionCombos(categoryOptionComboCodes);
        metadata.push(
          ...this.translator.translateInboundDataElements(
            fetchedDataElements,
            categoryOptionCombos,
            groupedDataElements,
          ),
        );
      }
    }

    return metadata;
  };
}
