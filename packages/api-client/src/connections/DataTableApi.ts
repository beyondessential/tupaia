/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { DataTablePreviewRequest } from '@tupaia/types';
import { BaseApi } from './BaseApi';
import { PublicInterface } from './types';

export class DataTableApi extends BaseApi {
  public async fetchData(
    dataTableCode: string,
    parameters: Record<string, unknown>,
  ): Promise<{ data: Record<string, unknown>[] }> {
    return this.connection.post(`dataTable/${dataTableCode}/fetchData`, null, parameters);
  }

  public async fetchPreviewData(
    previewConfig: DataTablePreviewRequest,
  ): Promise<{ data: Record<string, unknown>[] }> {
    return this.connection.post(`dataTable/fetchPreviewData`, null, { ...previewConfig });
  }

  public async getParameters(
    dataTableCode: string,
  ): Promise<{ parameters: { name: string; config: Record<string, unknown> }[] }> {
    return this.connection.get(`dataTable/${dataTableCode}/parameters`);
  }

  public async getBuiltInParameters(
    dataTableType: string,
  ): Promise<{ parameters: { name: string; config: Record<string, unknown> }[] }> {
    return this.connection.post(`dataTable/builtInParameters`, null, {
      code: 'newDataTable',
      type: dataTableType,
      permission_groups: ['*'],
      runtimeParams: {},
    });
  }
}

export interface DataTableApiInterface extends PublicInterface<DataTableApi> {}
