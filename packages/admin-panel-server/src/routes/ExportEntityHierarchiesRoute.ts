import { Request } from 'express';
import xlsx from 'xlsx';
import { keyBy } from 'es-toolkit/compat';
import { Route } from '@tupaia/server-boilerplate';

export type ExportEntityHierarchiesRequest = Request<
  { hierarchies: string },
  { contents: Buffer; filePath: string; type: string },
  Record<string, never>,
  Record<string, any>
>;

type ExportEntityHierarchiesData = {
  parent_name: string;
  parent_code: string;
  name: string;
  code: string;
  type: string;
  attributes: Record<string, any>;
};

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
          fields: ['parent_code', 'name', 'code', 'type', 'attributes'],
        },
        true,
        false,
      );

      const descendantsByCode = keyBy(descendants, 'code');

      const data = descendants.map((row: ExportEntityHierarchiesData) => {
        const record = {
          'grandparent name': undefined,
          'grandparent code': undefined,
          'parent name': undefined,
          'parent code': row.parent_code,
          name: row.name,
          code: row.code,
          type: row.type,
          attributes: Object.entries(row.attributes)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n'),
        };

        if (row.parent_code) {
          const parent = descendantsByCode[row.parent_code];
          record['parent name'] = parent?.name;

          if (parent?.parent_code) {
            const grandparent = descendantsByCode[parent.parent_code];
            record['grandparent name'] = grandparent?.name;
            record['grandparent code'] = grandparent?.code;
          }
        }

        return record;
      });

      const projectEntity = await entityApi.getEntity(hierarchy, hierarchy, {
        fields: ['name'],
      });

      const sheetName = projectEntity?.name || hierarchy;
      const sheet = xlsx.utils.json_to_sheet(data, {
        header: [
          'grandparent name',
          'grandparent code',
          'parent name',
          'parent code',
          'name',
          'code',
          'type',
          'attributes',
        ],
      });
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
