import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

export type FetchTransformSchemasRequest = Request<
  Record<string, never>,
  Record<string, unknown>[],
  Record<string, never>
>;

export class FetchTransformSchemasRoute extends Route<FetchTransformSchemasRequest> {
  public async buildResponse() {
    return this.req.ctx.services.report.fetchTransformSchemas();
  }
}
