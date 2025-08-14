import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { DataTable } from './types';

export type ExportDataTableRequest = Request<
  { dataTableId: string },
  { contents: DataTable; filePath: string; type: string },
  Record<string, never>,
  Record<string, any>
>;

export class ExportDataTableRoute extends Route<ExportDataTableRequest> {
  protected readonly type = 'download';

  public async buildResponse() {
    const { dataTableId } = this.req.params;
    const { central: centralApi } = this.req.ctx.services;

    const dataTable = await centralApi.fetchResources(`dataTables/${dataTableId}`);

    if (!dataTable) {
      throw new Error(`Could not find visualisation with id ${dataTableId}`);
    }

    return {
      contents: dataTable,
      filePath: `${dataTable.code}.json`,
      type: '.json',
    };
  }
}
