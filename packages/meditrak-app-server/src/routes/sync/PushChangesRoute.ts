/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { TupaiaApiClient } from '@tupaia/api-client';
import { Route } from '@tupaia/server-boilerplate';
import { Resolved } from '@tupaia/tsutils';

export type PushChangesRequest = Request<
  Record<string, never>,
  Resolved<ReturnType<TupaiaApiClient['central']['meditrak_only_pushChanges']>>,
  unknown[]
>;

/**
 * Currently this route just re-directs the request to the central-server
 * where the logic is handled by `postChanges.js`
 *
 * We should not be doing this, rather it should be handled by this route itself.
 * RN-556 has been created to complete this work
 */
export class PushChangesRoute extends Route<PushChangesRequest> {
  public async buildResponse() {
    return this.req.ctx.services.central.meditrak_only_pushChanges(this.req.body);
  }
}
