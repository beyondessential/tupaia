/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { formatTaskChanges } from '../utils';
import { DatatrakWebTaskChangeRequest } from '@tupaia/types';

export type EditTaskRequest = Request<
  { taskId: string },
  Record<string, never>,
  Partial<DatatrakWebTaskChangeRequest.ReqBody>,
  Record<string, never>
>;

export class EditTaskRoute extends Route<EditTaskRequest> {
  public async buildResponse() {
    const { body, ctx, params } = this.req;

    const { taskId } = params;

    const taskDetails = formatTaskChanges(body);

    return ctx.services.central.updateResource(`tasks/${taskId}`, {}, taskDetails);
  }
}
