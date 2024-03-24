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

    const hierarchiesArray = Array.isArray(hierarchies) ? hierarchies : [hierarchies];

    const workbook = xlsx.utils.book_new();

    for (const hierarchy of hierarchiesArray) {
      const descendants = await entityApi.getDescendantsOfEntity(
        hierarchy,
        hierarchy,
        {
          fields: ['name', 'code', 'parent_code'],
        },
        false,
        false,
      );

      const projectEntity = await entityApi.getEntity(hierarchy, hierarchy, {
        fields: ['name'],
      });

      const sheetName = projectEntity?.name || hierarchy;
      const sheet = xlsx.utils.json_to_sheet(descendants);
      xlsx.utils.book_append_sheet(workbook, sheet, sheetName);
    }

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return {
      contents: buffer,
      filePath: `entity_hierarchies_export_${Date.now()}.xlsx`,
      type: '.xlsx',
    };
  }
}
