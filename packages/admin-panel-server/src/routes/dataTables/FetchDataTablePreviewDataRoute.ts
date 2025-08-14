import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import type { DataTablePreviewRequest } from '@tupaia/types';

export type FetchDataTablePreviewDataRequest = Request<
  Record<string, never>,
  Record<string, unknown>,
  {
    previewConfig: DataTablePreviewRequest;
  },
  Record<string, never>
>;

export class FetchDataTablePreviewDataRoute extends Route<FetchDataTablePreviewDataRequest> {
  public async buildResponse() {
    const { previewConfig } = this.req.body;

    return this.req.ctx.services.dataTable.fetchPreviewData(previewConfig);
  }
}
