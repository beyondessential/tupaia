/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { DataTablePreviewRequest } from '@tupaia/types';
import { DataTableApiInterface } from '..';

export class MockDataTableApi implements DataTableApiInterface {
  public fetchData(
    dataTableCode: string,
    parameters: Record<string, unknown>,
  ): Promise<{ data: Record<string, unknown>[] }> {
    throw new Error('Method not implemented.');
  }

  public async fetchPreviewData(
    previewConfig: DataTablePreviewRequest,
  ): Promise<{ data: Record<string, unknown>[] }> {
    throw new Error('Method not implemented.');
  }

  public getParameters(
    dataTableCode: string,
  ): Promise<{
    parameters: { name: string; config: Record<string, unknown> }[];
  }> {
    throw new Error('Method not implemented.');
  }
}
