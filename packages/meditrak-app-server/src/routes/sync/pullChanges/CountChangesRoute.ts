import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { buildMeditrakSyncQuery } from './meditrakSyncQuery';

export type CountChangesRequest = Request<
  Record<string, never>,
  { changeCount: number },
  Record<string, unknown>,
  {
    appVersion: string;
    since?: string;
    recordTypes?: string;
  }
>;

export class CountChangesRoute extends Route<CountChangesRequest> {
  public async buildResponse() {
    // Uses non-permissions based sync, since permissions based sync uses /changes/metadata route instead
    const { query } = await buildMeditrakSyncQuery<{ count: string }[]>(this.req, 'count(*)');
    const queryResult = await query.executeOnDatabase(this.req.models.database);
    const changeCount = parseInt(queryResult[0].count);

    return { changeCount };
  }
}
