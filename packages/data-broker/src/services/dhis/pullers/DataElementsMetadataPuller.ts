import { groupBy } from 'es-toolkit/compat';

import type { DhisApi } from '@tupaia/dhis-api';
import { isNotNullish } from '@tupaia/tsutils';
import { DataElementModel } from '../../../types';
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
        const categoryOptionComboCodes = groupedDataSources
          .map(ds => ds.config?.categoryOptionCombo)
          .filter(isNotNullish);
        const { additionalFields, includeOptions } = options;
        const dataElements = await api.fetchDataElements(dataElementCodes, {
          additionalFields,
          includeOptions,
        });
        const categoryOptionCombos = await api.fetchCategoryOptionCombos(categoryOptionComboCodes);
        metadata.push(
          ...this.translator.translateInboundDataElements(
            dataElements,
            categoryOptionCombos,
            groupedDataSources,
          ),
        );
      }
    }

    return metadata;
  };
}
