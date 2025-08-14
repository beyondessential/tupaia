import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { UploadError } from '@tupaia/utils';

import { DataTable } from './types';
import { readFileContent } from '../../utils';

export type ImportDataTableRequest = Request<
  Record<string, never>,
  { importedTables: { id: string; code: string }[]; message: string },
  Record<string, never>,
  Record<string, never>
>;

export class ImportDataTableRoute extends Route<ImportDataTableRequest> {
  public async buildResponse() {
    const { files } = this.req;
    if (!files || !Array.isArray(files)) {
      throw new UploadError();
    }

    const importedTables: { id: string; code: string }[] = [];
    const successes: string[] = [];
    const errors: { fileName: string; message: string }[] = [];
    for (const file of files) {
      const { originalname: fileName } = file;
      try {
        const fileContent = readFileContent(file) as DataTable;
        importedTables.push(await this.importDataTable(fileContent));
        successes.push(fileName);
      } catch (error: any) {
        errors.push({ fileName, message: error.message });
      }
    }

    if (errors.length > 0) {
      throw new UploadError(errors, successes);
    }

    return {
      importedTables,
      message: `${importedTables.length} dataTables${
        importedTables.length !== 1 ? 's' : ''
      } imported successfully`,
    };
  }

  private async importDataTable(dataTable: DataTable) {
    const { central: centralApi } = this.req.ctx.services;
    await centralApi.upsertResource('dataTables', { filter: { code: dataTable.code } }, dataTable);

    const [createdDataTable] = await centralApi.fetchResources('dataTables', {
      filter: {
        code: dataTable.code,
      },
    });

    if (!createdDataTable) {
      throw new Error('Failed to create DataTable');
    }
    return { id: createdDataTable.id, code: createdDataTable.code };
  }
}
