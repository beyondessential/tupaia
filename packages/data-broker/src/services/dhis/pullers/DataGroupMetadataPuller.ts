/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DhisApi } from '@tupaia/dhis-api';
import { DataGroupMetadata, DataGroupModel } from '../../../types';
import { DataServiceMapping } from '../../DataServiceMapping';
import { DhisTranslator } from '../translators';
import { DataGroup } from '../types';

export type PullDataGroupMetadataOptions = {
  dataServiceMapping: DataServiceMapping;
  includeOptions?: boolean;
};

export class DataGroupMetadataPuller {
  private readonly dataGroupModel: DataGroupModel;
  private readonly translator: DhisTranslator;

  public constructor(dataGroupModel: DataGroupModel, translator: DhisTranslator) {
    this.dataGroupModel = dataGroupModel;
    this.translator = translator;
  }

  public pull = async (
    api: DhisApi,
    dataGroup: DataGroup,
    options: PullDataGroupMetadataOptions,
  ): Promise<DataGroupMetadata> => {
    const { includeOptions } = options;
    const { code: dataGroupCode } = dataGroup;
    const dataElements = await this.dataGroupModel.getDataElementsInDataGroup(dataGroupCode);
    const dataElementCodes = dataElements.map(({ code }) => code);

    return api.fetchDataGroup(dataGroupCode, dataElementCodes, includeOptions);
  };
}
