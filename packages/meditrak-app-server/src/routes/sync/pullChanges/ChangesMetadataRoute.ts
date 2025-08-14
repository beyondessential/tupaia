import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { buildPermissionsBasedMeditrakSyncQuery } from './permissionsBasedMeditrakSyncQuery';

export type ChangesMetadataRequest = Request<
  Record<string, never>,
  { changeCount: number; countries: string[]; permissionGroups: string[] },
  Record<string, unknown>,
  {
    appVersion: string;
    since?: string;
    recordTypes?: string;
    countriesSynced?: string;
    permissionGroupsSynced?: string;
  }
>;

export class ChangesMetadataRoute extends Route<ChangesMetadataRequest> {
  public async buildResponse() {
    const { query, countries, permissionGroups } = await buildPermissionsBasedMeditrakSyncQuery<
      { count: string }[]
    >(this.req, 'count(*)');

    const queryResult = await query.executeOnDatabase(this.req.models.database);
    const changeCount = parseInt(queryResult[0].count);

    return { changeCount, countries, permissionGroups };
  }
}
