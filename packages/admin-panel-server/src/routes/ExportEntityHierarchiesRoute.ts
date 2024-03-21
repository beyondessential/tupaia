/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import xlsx from 'xlsx';
import { Route } from '@tupaia/server-boilerplate';

export type ExportEntityHierarchiesRequest = Request<
  { hierarchies: string },
  { contents: Buffer; filePath: string; type: string },
  Record<string, never>,
  Record<string, any>
>;

export class ExportEntityHierarchiesRoute extends Route<ExportEntityHierarchiesRequest> {
  protected readonly type = 'download';

  public async buildResponse() {
    const { hierarchies } = this.req.query;
    const { entity: entityApi } = this.req.ctx.services;

    const workbook = {
      SheetNames: hierarchies,
      Sheets: {},
    } as xlsx.WorkBook;

    for (const hierarchy of hierarchies) {
      const descendants = await entityApi.getDescendantsOfEntity(
        hierarchy,
        hierarchy,
        {
          fields: ['name', 'code', 'parent_code'],
        },
        false,
        false,
      );

      workbook.Sheets[hierarchy] = xlsx.utils.json_to_sheet(descendants);
    }

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return {
      contents: buffer,
      filePath: `entity_hierarchies_export_${Date.now()}.xlsx`,
      type: '.xlsx',
    };
  }
}
