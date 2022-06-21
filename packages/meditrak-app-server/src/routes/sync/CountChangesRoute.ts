/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { getChangesFilter } from './getChangesFilter';

export type CountChangesRequest = Request<
  Record<string, never>,
  { changeCount: number },
  Record<string, unknown>,
  { appVersion: string; since?: string; recordTypes?: string }
>;

export class CountChangesRoute extends Route<CountChangesRequest> {
  public async buildResponse() {
    const { appVersion, since, recordTypes } = this.req.query;
    const filter = getChangesFilter(
      appVersion,
      since ? parseFloat(since) : undefined,
      recordTypes ? recordTypes.split(',') : undefined,
    );
    const changeCount = await this.req.models.meditrakSyncQueue.count(filter);
    return { changeCount };
  }
}
