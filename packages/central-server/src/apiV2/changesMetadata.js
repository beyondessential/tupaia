/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';
import { getPermissionsBasedChangesFilter } from './utilities';
import { allowNoPermissions } from '../permissions';

/**
 * Permissions based sync metadata
 * {
 *   changeCount: number of changes since last sync
 *   countries: countries included in the sync
 *   permissionGroups: permissions groups included in the sync
 * }
 * Responds to GET requests to the /changes/metadata endpoint
 */
export async function changesMetadata(req, res) {
  const { models } = req;

  await req.assertPermissions(allowNoPermissions);

  const { query, countries, permissionGroups } = await getPermissionsBasedChangesFilter(req, {
    select: 'count(*)',
  });
  const queryResult = await query.executeOnDatabase(models.database);
  const changeCount = parseInt(queryResult[0].count);
  respond(res, { changeCount, countries, permissionGroups });
}
