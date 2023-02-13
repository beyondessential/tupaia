/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { DataTablePreviewRequest } from '@tupaia/types';
import { DataTableApiInterface } from '..';

type Parameters = Record<string, unknown>;
type DataTableRow = Record<string, unknown>;

export class MockDataTableApi implements DataTableApiInterface {
  private readonly mockDataTables: Record<
    string,
    { fetchData: (parameters: Parameters) => DataTableRow[] }
  >;

  public constructor(
    mockDataTables: Record<string, { fetchData: (parameters: Parameters) => DataTableRow[] }> = {},
  ) {
    this.mockDataTables = mockDataTables;
  }

  public async fetchData(dataTableCode: string, parameters: Parameters) {
    const dataTable = this.mockDataTables[dataTableCode];
    if (!dataTable) {
      throw new Error(`Unknown data-table: ${dataTableCode}`);
    }

    const data = dataTable.fetchData(parameters);
    return { data };
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
