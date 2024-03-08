/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DhisApi } from '@tupaia/dhis-api';
import { DataGroupMetadata, DataGroupModel } from '../../../types';
import { DataServiceMapping } from '../../DataServiceMapping';
import { DataGroup } from '../types';

export type PullDataGroupMetadataOptions = {
  dataServiceMapping: DataServiceMapping;
  includeOptions?: boolean;
};

export class DataGroupMetadataPuller {
  private readonly dataGroupModel: DataGroupModel;

  public constructor(dataGroupModel: DataGroupModel) {
    this.dataGroupModel = dataGroupModel;
  }

  public pull = async (
    api: DhisApi,
    dataGroups: DataGroup[],
    options: PullDataGroupMetadataOptions,
  ): Promise<DataGroupMetadata> => {
    if (dataGroups.length > 1) {
      throw new Error('Cannot pull metadata from multiple programs at the same time');
    }
    const { includeOptions } = options;
    const [{ code: dataGroupCode }] = dataGroups;
    const dataElements = await this.dataGroupModel.getDataElementsInDataGroup(dataGroupCode);
    const dataElementCodes = dataElements.map(({ code }) => code);

    return api.fetchDataGroup(dataGroupCode, dataElementCodes, includeOptions);
  };
}
