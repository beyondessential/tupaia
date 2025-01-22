/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataTablePreviewRequest } from '@tupaia/types';
import { DataTableApiInterface } from '..';

type Parameters = Record<string, unknown>;
type DataTableRow = Record<string, unknown>;
type MockDataTable = { fetchData: (parameters: Parameters) => DataTableRow[] };

export class MockDataTableApi implements DataTableApiInterface {
  private readonly mockDataTables: Record<string, MockDataTable>;

  public constructor(mockDataTables: Record<string, MockDataTable> = {}) {
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

  public getBuiltInParameters(
    dataTableType: string,
  ): Promise<{
    parameters: { name: string; config: Record<string, unknown> }[];
  }> {
    throw new Error('Method not implemented.');
  }
}
