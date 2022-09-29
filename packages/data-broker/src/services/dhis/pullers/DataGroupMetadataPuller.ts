/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DataGroupModel } from '../../../types';
import { DhisTranslator } from '../translators';
import { DataGroup } from '../types';
import { DhisApi } from '@tupaia/dhis-api';
import type { PullMetadataOptions as BasePullMetadataOptions } from '../../Service';

type PullOptions = BasePullMetadataOptions & {
  includeOptions: boolean;
};

export class DataGroupMetadataPuller {
  private readonly dataSourceModel: DataGroupModel;
  private readonly translator: DhisTranslator;

  constructor(dataGroupModel: DataGroupModel, translator: DhisTranslator) {
    this.dataSourceModel = dataGroupModel;
    this.translator = translator;
  }

  public pull = async (api: DhisApi, dataSources: DataGroup[], options: PullOptions) => {
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

    return api.fetchDataGroup(dataGroupCode, dataElementCodes, includeOptions);
  };
}
